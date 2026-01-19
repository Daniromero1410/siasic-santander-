# ═══════════════════════════════════════════════════════════════════════════
# SIASIC-Santander Backend - Modelos de Datos
# ═══════════════════════════════════════════════════════════════════════════

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum


# ═══════════════════════════════════════════════════════════════════════════
# ENUMS
# ═══════════════════════════════════════════════════════════════════════════

class TipoProfundidad(str, Enum):
    """Clasificación de sismos por profundidad"""
    SUPERFICIAL = "Superficial"      # < 70 km
    INTERMEDIO = "Intermedio"        # 70-140 km
    NIDO_SISMICO = "Nido Sísmico"    # 140-180 km
    PROFUNDO = "Profundo"            # > 180 km


class NivelMercalli(str, Enum):
    """Escala de intensidad Mercalli"""
    I = "I"
    II = "II"
    III = "III"
    IV = "IV"
    V = "V"
    VI = "VI"
    VII = "VII"
    VIII = "VIII"
    IX = "IX"
    X = "X"
    XI = "XI"
    XII = "XII"


class FormatoExport(str, Enum):
    """Formatos de exportación disponibles"""
    CSV = "csv"
    GEOJSON = "geojson"
    KML = "kml"


# ═══════════════════════════════════════════════════════════════════════════
# MODELOS DE SISMOS
# ═══════════════════════════════════════════════════════════════════════════

class SismoBase(BaseModel):
    """Modelo base de un sismo"""
    latitud: float = Field(..., ge=-90, le=90, description="Latitud del epicentro")
    longitud: float = Field(..., ge=-180, le=180, description="Longitud del epicentro")
    profundidad: float = Field(..., ge=0, description="Profundidad en km")
    magnitud: float = Field(..., ge=0, le=10, description="Magnitud del sismo")


class Sismo(SismoBase):
    """Modelo completo de un sismo"""
    id: int
    fecha_hora: datetime
    tipo_magnitud: str
    region: str
    municipio: Optional[str] = None
    departamento: Optional[str] = None
    tipo_profundidad: TipoProfundidad
    es_santander: bool = False
    
    class Config:
        from_attributes = True


class SismoResumen(BaseModel):
    """Resumen de un sismo para listas"""
    id: int
    fecha_hora: datetime
    magnitud: float
    profundidad: float
    municipio: str
    tipo_profundidad: TipoProfundidad


# ═══════════════════════════════════════════════════════════════════════════
# MODELOS DE ESTADÍSTICAS
# ═══════════════════════════════════════════════════════════════════════════

class EstadisticasGenerales(BaseModel):
    """KPIs principales del dashboard"""
    total_sismos: int
    magnitud_promedio: float
    magnitud_maxima: float
    profundidad_promedio: float
    sismos_santander: int
    sismos_nido: int
    ultimo_sismo: Optional[SismoResumen] = None


class DistribucionMensual(BaseModel):
    """Distribución de sismos por mes"""
    mes: str
    cantidad: int
    magnitud_promedio: float


class DistribucionProfundidad(BaseModel):
    """Distribución por tipo de profundidad"""
    tipo: TipoProfundidad
    cantidad: int
    porcentaje: float
    color: str


class DistribucionDepartamento(BaseModel):
    """Distribución por departamento"""
    departamento: str
    cantidad: int
    porcentaje: float


# ═══════════════════════════════════════════════════════════════════════════
# MODELOS DEL SIMULADOR
# ═══════════════════════════════════════════════════════════════════════════

class SimuladorInput(BaseModel):
    """Parámetros de entrada del simulador"""
    latitud: float = Field(
        default=6.78, 
        ge=4.0, le=10.0,
        description="Latitud del epicentro"
    )
    longitud: float = Field(
        default=-73.18, 
        ge=-77.0, le=-70.0,
        description="Longitud del epicentro"
    )
    magnitud: float = Field(
        default=5.0, 
        ge=2.0, le=8.5,
        description="Magnitud del sismo (2.0 - 8.5)"
    )
    profundidad: float = Field(
        default=147, 
        ge=0, le=300,
        description="Profundidad en km"
    )


class ZonaImpacto(BaseModel):
    """Zona de impacto calculada"""
    nombre: str
    radio_km: float
    intensidad: str
    color: str
    descripcion: str


class CiudadAfectada(BaseModel):
    """Ciudad afectada por el sismo"""
    ciudad: str
    poblacion: int
    distancia_km: float
    intensidad: float
    mercalli: str
    zona: str


class PrediccionReplica(BaseModel):
    """Predicción de réplicas por día"""
    dia: int
    tasa_replicas: float
    acumulado: float
    probabilidad_pct: float


class SimuladorOutput(BaseModel):
    """Resultado completo de la simulación"""
    # Parámetros de entrada
    epicentro: Dict[str, float]
    magnitud: float
    profundidad: float
    tipo_profundidad: TipoProfundidad
    
    # Intensidad
    intensidad_epicentro: float
    mercalli: str
    mercalli_descripcion: str
    
    # Energía
    energia_joules: float
    energia_tnt_toneladas: float
    
    # Zonas de afectación
    zonas: List[ZonaImpacto]
    
    # Ciudades afectadas
    ciudades_afectadas: List[CiudadAfectada]
    
    # Réplicas
    replicas_prediccion: List[PrediccionReplica]
    max_replica_magnitud: float
    total_replicas_14_dias: float


# ═══════════════════════════════════════════════════════════════════════════
# MODELOS DE RESPUESTA API
# ═══════════════════════════════════════════════════════════════════════════

class APIResponse(BaseModel):
    """Respuesta estándar de la API"""
    success: bool = True
    message: str = "OK"
    data: Optional[Any] = None


class PaginatedResponse(BaseModel):
    """Respuesta paginada"""
    total: int
    page: int
    per_page: int
    total_pages: int
    data: List[Any]


class ErrorResponse(BaseModel):
    """Respuesta de error"""
    success: bool = False
    error: str
    detail: Optional[str] = None
