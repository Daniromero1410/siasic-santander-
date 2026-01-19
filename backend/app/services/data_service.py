# ═══════════════════════════════════════════════════════════════════════════════
# SIASIC-Santander Backend - Servicio de Datos (Corregido)
# ═══════════════════════════════════════════════════════════════════════════════

import pandas as pd
import numpy as np
from pathlib import Path
from typing import List, Optional, Dict, Any
from datetime import datetime

from app.core.config import settings


class DataService:
    """Servicio para cargar y procesar datos sísmicos"""
    
    _instance = None
    _df: Optional[pd.DataFrame] = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    def __init__(self):
        if self._df is None:
            self._load_data()
    
    def _load_data(self) -> None:
        """Carga los datos desde el CSV"""
        try:
            csv_path = Path(settings.DATA_PATH)
            
            if not csv_path.exists():
                print(f"⚠️ Archivo no encontrado: {csv_path}")
                self._df = pd.DataFrame()
                return
            
            # Cargar CSV
            self._df = pd.read_csv(csv_path, encoding='utf-8')
            
            # ═══════════════════════════════════════════════════════════════
            # LIMPIEZA DE DATOS - Reemplazar NaN con valores válidos
            # ═══════════════════════════════════════════════════════════════
            
            # Reemplazar NaN en columnas de texto con string vacío o "N/A"
            text_columns = ['municipio', 'departamento', 'region', 'tipo_magnitud']
            for col in text_columns:
                if col in self._df.columns:
                    self._df[col] = self._df[col].fillna("N/A").replace({np.nan: "N/A"})
            
            # Reemplazar NaN en columnas numéricas con 0
            numeric_columns = ['latitud', 'longitud', 'profundidad', 'magnitud']
            for col in numeric_columns:
                if col in self._df.columns:
                    self._df[col] = pd.to_numeric(self._df[col], errors='coerce').fillna(0)
            
            # Asegurar que no hay infinitos
            self._df = self._df.replace([np.inf, -np.inf], 0)
            
            # Renombrar columnas si es necesario (por si el CSV tiene nombres diferentes)
            column_mapping = {
                'FECHA - Loss Time (Local)': 'fecha_hora',
                'LATITUD': 'latitud',
                'LONGITUD': 'longitud',
                'PROFUNDIDAD': 'profundidad',
                'MAGNITUD': 'magnitud',
                'TIPO MAGNITUD': 'tipo_magnitud',
                'DEPARTAMENTO': 'departamento',
                'MUNICIPIO': 'municipio',
                # Agregar más mapeos si es necesario
            }
            
            # Aplicar mapeo solo para columnas que existen
            for old_name, new_name in column_mapping.items():
                if old_name in self._df.columns and new_name not in self._df.columns:
                    self._df = self._df.rename(columns={old_name: new_name})
            
            # Normalizar nombres de columnas a minúsculas
            self._df.columns = self._df.columns.str.lower().str.strip()
            
            # Asegurar columna fecha_hora
            if 'fecha_hora' not in self._df.columns:
                # Buscar columna que contenga 'fecha'
                fecha_cols = [c for c in self._df.columns if 'fecha' in c.lower()]
                if fecha_cols:
                    self._df = self._df.rename(columns={fecha_cols[0]: 'fecha_hora'})
            
            # Convertir fecha_hora a datetime
            if 'fecha_hora' in self._df.columns:
                self._df['fecha_hora'] = pd.to_datetime(self._df['fecha_hora'], errors='coerce')
                # Rellenar fechas inválidas con fecha actual
                self._df['fecha_hora'] = self._df['fecha_hora'].fillna(pd.Timestamp.now())
            
            # Agregar columna ID si no existe
            if 'id' not in self._df.columns:
                self._df['id'] = range(1, len(self._df) + 1)
            
            # Clasificar tipo de profundidad
            self._df['tipo_profundidad'] = self._df['profundidad'].apply(self._clasificar_profundidad)
            
            # Determinar si es Santander
            if 'departamento' in self._df.columns:
                self._df['es_santander'] = self._df['departamento'].str.lower().str.contains('santander', na=False)
            else:
                self._df['es_santander'] = False
            
            print(f"✅ Datos cargados: {len(self._df)} registros")
            print(f"   Columnas: {list(self._df.columns)}")
            
        except Exception as e:
            print(f"❌ Error cargando datos: {e}")
            self._df = pd.DataFrame()
    
    def _clasificar_profundidad(self, profundidad: float) -> str:
        """Clasifica el sismo según su profundidad"""
        if pd.isna(profundidad) or profundidad < 0:
            return "N/A"
        if profundidad < 70:
            return "Superficial"
        if profundidad < 140:
            return "Intermedio"
        if profundidad <= 180:
            return "Nido Sísmico"
        return "Profundo"
    
    def _clean_record(self, record: Dict[str, Any]) -> Dict[str, Any]:
        """Limpia un registro individual para asegurar que es JSON serializable"""
        cleaned = {}
        for key, value in record.items():
            if pd.isna(value) or value is np.nan:
                if key in ['municipio', 'departamento', 'region', 'tipo_magnitud', 'tipo_profundidad']:
                    cleaned[key] = "N/A"
                else:
                    cleaned[key] = 0
            elif isinstance(value, (np.int64, np.int32)):
                cleaned[key] = int(value)
            elif isinstance(value, (np.float64, np.float32)):
                if np.isnan(value) or np.isinf(value):
                    cleaned[key] = 0
                else:
                    cleaned[key] = float(value)
            elif isinstance(value, pd.Timestamp):
                cleaned[key] = value.isoformat()
            elif isinstance(value, datetime):
                cleaned[key] = value.isoformat()
            else:
                cleaned[key] = value
        return cleaned
    
    def get_all(self) -> List[Dict[str, Any]]:
        """Retorna todos los sismos"""
        if self._df is None or self._df.empty:
            return []
        
        records = self._df.to_dict('records')
        return [self._clean_record(r) for r in records]
    
    def get_paginated(self, page: int = 1, per_page: int = 20) -> Dict[str, Any]:
        """Retorna sismos paginados"""
        if self._df is None or self._df.empty:
            return {
                "total": 0,
                "page": page,
                "per_page": per_page,
                "total_pages": 0,
                "data": []
            }
        
        total = len(self._df)
        total_pages = (total + per_page - 1) // per_page
        
        start = (page - 1) * per_page
        end = start + per_page
        
        df_page = self._df.iloc[start:end]
        records = df_page.to_dict('records')
        
        return {
            "total": total,
            "page": page,
            "per_page": per_page,
            "total_pages": total_pages,
            "data": [self._clean_record(r) for r in records]
        }
    
    def get_by_id(self, sismo_id: int) -> Optional[Dict[str, Any]]:
        """Retorna un sismo por ID"""
        if self._df is None or self._df.empty:
            return None
        
        result = self._df[self._df['id'] == sismo_id]
        if result.empty:
            return None
        
        return self._clean_record(result.iloc[0].to_dict())
    
    def get_estadisticas_generales(self) -> Dict[str, Any]:
        """Retorna estadísticas generales"""
        if self._df is None or self._df.empty:
            return {
                "total_sismos": 0,
                "magnitud_promedio": 0,
                "magnitud_maxima": 0,
                "profundidad_promedio": 0,
                "sismos_santander": 0,
                "sismos_nido": 0,
                "ultimo_sismo": None
            }
        
        df = self._df
        
        # Último sismo
        ultimo = None
        if 'fecha_hora' in df.columns and not df.empty:
            df_sorted = df.sort_values('fecha_hora', ascending=False)
            ultimo_row = df_sorted.iloc[0]
            ultimo = {
                "id": int(ultimo_row.get('id', 0)),
                "fecha_hora": ultimo_row['fecha_hora'].isoformat() if pd.notna(ultimo_row.get('fecha_hora')) else "",
                "magnitud": float(ultimo_row.get('magnitud', 0)),
                "profundidad": float(ultimo_row.get('profundidad', 0)),
                "municipio": str(ultimo_row.get('municipio', 'N/A')) if pd.notna(ultimo_row.get('municipio')) else "N/A",
                "tipo_profundidad": str(ultimo_row.get('tipo_profundidad', 'N/A'))
            }
        
        return {
            "total_sismos": int(len(df)),
            "magnitud_promedio": float(df['magnitud'].mean()) if 'magnitud' in df.columns else 0,
            "magnitud_maxima": float(df['magnitud'].max()) if 'magnitud' in df.columns else 0,
            "profundidad_promedio": float(df['profundidad'].mean()) if 'profundidad' in df.columns else 0,
            "sismos_santander": int(df['es_santander'].sum()) if 'es_santander' in df.columns else 0,
            "sismos_nido": int((df['tipo_profundidad'] == 'Nido Sísmico').sum()) if 'tipo_profundidad' in df.columns else 0,
            "ultimo_sismo": ultimo
        }
    
    def get_distribucion_mensual(self) -> List[Dict[str, Any]]:
        """Retorna distribución mensual de sismos"""
        if self._df is None or self._df.empty or 'fecha_hora' not in self._df.columns:
            return []
        
        df = self._df.copy()
        df['mes'] = df['fecha_hora'].dt.strftime('%b')
        df['mes_num'] = df['fecha_hora'].dt.month
        
        grouped = df.groupby(['mes', 'mes_num']).agg({
            'id': 'count',
            'magnitud': 'mean'
        }).reset_index()
        
        grouped = grouped.sort_values('mes_num')
        
        return [
            {
                "mes": row['mes'],
                "cantidad": int(row['id']),
                "magnitud_promedio": float(row['magnitud']) if pd.notna(row['magnitud']) else 0
            }
            for _, row in grouped.iterrows()
        ]
    
    def get_distribucion_profundidad(self) -> List[Dict[str, Any]]:
        """Retorna distribución por tipo de profundidad"""
        if self._df is None or self._df.empty or 'tipo_profundidad' not in self._df.columns:
            return []
        
        total = len(self._df)
        grouped = self._df['tipo_profundidad'].value_counts()
        
        colores = {
            "Superficial": "#DC2626",
            "Intermedio": "#F59E0B",
            "Nido Sísmico": "#6B46C1",
            "Profundo": "#2563EB",
            "N/A": "#666666"
        }
        
        return [
            {
                "tipo": str(tipo),
                "cantidad": int(cantidad),
                "porcentaje": round((cantidad / total) * 100, 1),
                "color": colores.get(tipo, "#666666")
            }
            for tipo, cantidad in grouped.items()
        ]
    
    def get_para_mapa(self) -> List[Dict[str, Any]]:
        """Retorna datos optimizados para el mapa"""
        if self._df is None or self._df.empty:
            return []
        
        columns = ['id', 'latitud', 'longitud', 'magnitud', 'profundidad', 'tipo_profundidad', 'municipio', 'fecha_hora']
        available_cols = [c for c in columns if c in self._df.columns]
        
        df_mapa = self._df[available_cols].copy()
        records = df_mapa.to_dict('records')
        
        return [self._clean_record(r) for r in records]


# Instancia global del servicio
data_service = DataService()