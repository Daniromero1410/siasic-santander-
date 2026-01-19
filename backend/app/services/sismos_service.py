# ═══════════════════════════════════════════════════════════════════════════════
# SIASIC-Santander Backend - Servicio de Sismos (Adaptado al CSV real)
# ═══════════════════════════════════════════════════════════════════════════════

import pandas as pd
import numpy as np
from pathlib import Path
from typing import List, Optional, Dict, Any

from app.config import settings


class SismosService:
    """Servicio para gestionar datos sísmicos"""
    
    def __init__(self):
        self._df: Optional[pd.DataFrame] = None
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
            print(f"📂 Columnas originales: {list(self._df.columns)}")
            
            # ═══════════════════════════════════════════════════════════════
            # MAPEO DE COLUMNAS - Adaptado a sismos_2024_simple.csv
            # ═══════════════════════════════════════════════════════════════
            column_mapping = {
                'FechaHora': 'fecha_hora',
                'Lat': 'latitud',
                'Lon': 'longitud',
                'ProfKm': 'profundidad',
                'Mag': 'magnitud',
                'TipoMag': 'tipo_magnitud',
                'Ubicacion': 'ubicacion',
                'Estado': 'estado',
                'Fases': 'fases',
                'RMS': 'rms',
                'GAP': 'gap'
            }
            
            self._df = self._df.rename(columns=column_mapping)
            print(f"📂 Columnas mapeadas: {list(self._df.columns)}")
            
            # ═══════════════════════════════════════════════════════════════
            # EXTRAER MUNICIPIO Y DEPARTAMENTO DE "UBICACION"
            # Formato: "Los Santos - Santander, Colombia"
            # ═══════════════════════════════════════════════════════════════
            if 'ubicacion' in self._df.columns:
                # Extraer municipio (antes del " - ")
                self._df['municipio'] = self._df['ubicacion'].apply(
                    lambda x: self._extraer_municipio(x) if pd.notna(x) else "N/A"
                )
                # Extraer departamento (entre " - " y ",")
                self._df['departamento'] = self._df['ubicacion'].apply(
                    lambda x: self._extraer_departamento(x) if pd.notna(x) else "N/A"
                )
            else:
                self._df['municipio'] = "N/A"
                self._df['departamento'] = "N/A"
            
            # ═══════════════════════════════════════════════════════════════
            # LIMPIEZA DE DATOS
            # ═══════════════════════════════════════════════════════════════
            
            # Limpiar columnas de texto
            text_cols = ['municipio', 'departamento', 'tipo_magnitud', 'estado', 'ubicacion']
            for col in text_cols:
                if col in self._df.columns:
                    self._df[col] = self._df[col].fillna('N/A').astype(str)
                    self._df[col] = self._df[col].replace('nan', 'N/A')
                    self._df[col] = self._df[col].replace('', 'N/A')
            
            # Limpiar columnas numéricas
            num_cols = ['latitud', 'longitud', 'profundidad', 'magnitud', 'fases', 'rms', 'gap']
            for col in num_cols:
                if col in self._df.columns:
                    self._df[col] = pd.to_numeric(self._df[col], errors='coerce').fillna(0)
            
            # Agregar ID
            self._df['id'] = range(1, len(self._df) + 1)
            
            # Convertir fecha
            if 'fecha_hora' in self._df.columns:
                self._df['fecha_hora'] = pd.to_datetime(self._df['fecha_hora'], errors='coerce')
            
            # Clasificar profundidad
            self._df['tipo_profundidad'] = self._df['profundidad'].apply(self._clasificar_profundidad)
            
            # Determinar si es Santander
            self._df['es_santander'] = self._df['departamento'].str.lower().str.contains('santander', na=False)
            
            # Determinar si es del Nido Sísmico
            self._df['es_nido'] = self._df['tipo_profundidad'] == 'Nido Sísmico'
            
            print(f"✅ Datos cargados: {len(self._df)} registros")
            print(f"   - Sismos en Santander: {self._df['es_santander'].sum()}")
            print(f"   - Sismos del Nido: {self._df['es_nido'].sum()}")
            
        except Exception as e:
            print(f"❌ Error cargando datos: {e}")
            import traceback
            traceback.print_exc()
            self._df = pd.DataFrame()
    
    def _extraer_municipio(self, ubicacion: str) -> str:
        """Extrae el municipio de la ubicación"""
        try:
            if ' - ' in ubicacion:
                return ubicacion.split(' - ')[0].strip()
            return ubicacion.split(',')[0].strip()
        except:
            return "N/A"
    
    def _extraer_departamento(self, ubicacion: str) -> str:
        """Extrae el departamento de la ubicación"""
        try:
            if ' - ' in ubicacion:
                parte = ubicacion.split(' - ')[1]
                if ',' in parte:
                    return parte.split(',')[0].strip()
                return parte.strip()
            return "N/A"
        except:
            return "N/A"
    
    def _clasificar_profundidad(self, prof: float) -> str:
        """Clasifica el sismo según profundidad"""
        try:
            if pd.isna(prof) or prof < 0:
                return "N/A"
            if prof < 70:
                return "Superficial"
            if prof < 140:
                return "Intermedio"
            if prof <= 180:
                return "Nido Sísmico"
            return "Profundo"
        except:
            return "N/A"
    
    def _to_dict_safe(self, row: pd.Series) -> Dict[str, Any]:
        """Convierte una fila a diccionario de forma segura"""
        result = {}
        for key, value in row.items():
            if pd.isna(value):
                if key in ['municipio', 'departamento', 'tipo_magnitud', 'tipo_profundidad', 'estado', 'ubicacion']:
                    result[key] = "N/A"
                elif key in ['latitud', 'longitud', 'profundidad', 'magnitud', 'fases', 'rms', 'gap']:
                    result[key] = 0.0
                elif key == 'id':
                    result[key] = 0
                elif key in ['es_santander', 'es_nido']:
                    result[key] = False
                elif key == 'fecha_hora':
                    result[key] = ""
                else:
                    result[key] = None
            elif isinstance(value, pd.Timestamp):
                result[key] = value.isoformat()
            elif isinstance(value, (np.integer,)):
                result[key] = int(value)
            elif isinstance(value, (np.floating,)):
                if np.isnan(value) or np.isinf(value):
                    result[key] = 0.0
                else:
                    result[key] = float(value)
            elif isinstance(value, np.bool_):
                result[key] = bool(value)
            else:
                result[key] = value
        return result
    
    def get_all(self) -> List[Dict[str, Any]]:
        """Retorna todos los sismos"""
        if self._df is None or self._df.empty:
            return []
        return [self._to_dict_safe(row) for _, row in self._df.iterrows()]
    
    def get_paginated(self, page: int = 1, per_page: int = 20) -> Dict[str, Any]:
        """Retorna sismos paginados"""
        if self._df is None or self._df.empty:
            return {"total": 0, "page": page, "per_page": per_page, "total_pages": 0, "data": []}
        
        total = len(self._df)
        total_pages = (total + per_page - 1) // per_page
        start = (page - 1) * per_page
        end = start + per_page
        
        df_page = self._df.iloc[start:end]
        data = [self._to_dict_safe(row) for _, row in df_page.iterrows()]
        
        return {
            "total": total,
            "page": page,
            "per_page": per_page,
            "total_pages": total_pages,
            "data": data
        }
    
    def get_by_id(self, sismo_id: int) -> Optional[Dict[str, Any]]:
        """Retorna un sismo por ID"""
        if self._df is None or self._df.empty:
            return None
        
        result = self._df[self._df['id'] == sismo_id]
        if result.empty:
            return None
        
        return self._to_dict_safe(result.iloc[0])
    
    def get_estadisticas_generales(self) -> Dict[str, Any]:
        """Retorna estadísticas generales"""
        if self._df is None or self._df.empty:
            return {
                "total_sismos": 0,
                "magnitud_promedio": 0.0,
                "magnitud_maxima": 0.0,
                "profundidad_promedio": 0.0,
                "sismos_santander": 0,
                "sismos_nido": 0,
                "ultimo_sismo": None
            }
        
        df = self._df
        
        # Último sismo
        ultimo = None
        if 'fecha_hora' in df.columns and len(df) > 0:
            df_sorted = df.dropna(subset=['fecha_hora']).sort_values('fecha_hora', ascending=False)
            if len(df_sorted) > 0:
                row = df_sorted.iloc[0]
                ultimo = {
                    "id": int(row.get('id', 0)) if pd.notna(row.get('id')) else 0,
                    "fecha_hora": row['fecha_hora'].isoformat() if pd.notna(row.get('fecha_hora')) else "",
                    "magnitud": float(row.get('magnitud', 0)) if pd.notna(row.get('magnitud')) else 0.0,
                    "profundidad": float(row.get('profundidad', 0)) if pd.notna(row.get('profundidad')) else 0.0,
                    "municipio": str(row.get('municipio', 'N/A')) if pd.notna(row.get('municipio')) else "N/A",
                    "tipo_profundidad": str(row.get('tipo_profundidad', 'N/A')) if pd.notna(row.get('tipo_profundidad')) else "N/A"
                }
        
        # Calcular estadísticas con manejo de NaN
        mag_prom = df['magnitud'].mean() if 'magnitud' in df.columns else 0
        mag_max = df['magnitud'].max() if 'magnitud' in df.columns else 0
        prof_prom = df['profundidad'].mean() if 'profundidad' in df.columns else 0
        
        return {
            "total_sismos": int(len(df)),
            "magnitud_promedio": float(mag_prom) if pd.notna(mag_prom) else 0.0,
            "magnitud_maxima": float(mag_max) if pd.notna(mag_max) else 0.0,
            "profundidad_promedio": float(prof_prom) if pd.notna(prof_prom) else 0.0,
            "sismos_santander": int(df['es_santander'].sum()) if 'es_santander' in df.columns else 0,
            "sismos_nido": int(df['es_nido'].sum()) if 'es_nido' in df.columns else 0,
            "ultimo_sismo": ultimo
        }
    
    def get_distribucion_mensual(self) -> List[Dict[str, Any]]:
        """Retorna distribución mensual"""
        if self._df is None or self._df.empty or 'fecha_hora' not in self._df.columns:
            return []
        
        df = self._df.dropna(subset=['fecha_hora']).copy()
        if df.empty:
            return []
        
        df['mes'] = df['fecha_hora'].dt.strftime('%b')
        df['mes_num'] = df['fecha_hora'].dt.month
        
        grouped = df.groupby(['mes', 'mes_num']).agg({
            'id': 'count',
            'magnitud': 'mean'
        }).reset_index()
        
        grouped = grouped.sort_values('mes_num')
        
        result = []
        for _, row in grouped.iterrows():
            mag = row['magnitud']
            result.append({
                "mes": str(row['mes']),
                "cantidad": int(row['id']),
                "magnitud_promedio": float(mag) if pd.notna(mag) else 0.0
            })
        
        return result
    
    def get_distribucion_profundidad(self) -> List[Dict[str, Any]]:
        """Retorna distribución por profundidad"""
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
                "porcentaje": round((cantidad / total) * 100, 1) if total > 0 else 0,
                "color": colores.get(str(tipo), "#666666")
            }
            for tipo, cantidad in grouped.items()
        ]
    
    def get_para_mapa(self) -> List[Dict[str, Any]]:
        """Retorna datos para mapa"""
        if self._df is None or self._df.empty:
            return []
        
        cols = ['id', 'latitud', 'longitud', 'magnitud', 'profundidad', 'tipo_profundidad', 'municipio', 'fecha_hora']
        available = [c for c in cols if c in self._df.columns]
        
        return [self._to_dict_safe(row) for _, row in self._df[available].iterrows()]


# Instancia global
sismos_service = SismosService()
