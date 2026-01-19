# ═══════════════════════════════════════════════════════════════════════════
# SIASIC-Santander Backend - Models Package
# ═══════════════════════════════════════════════════════════════════════════

from .schemas import (
    # Enums
    TipoProfundidad,
    NivelMercalli,
    FormatoExport,
    
    # Sismos
    SismoBase,
    Sismo,
    SismoResumen,
    
    # Estadísticas
    EstadisticasGenerales,
    DistribucionMensual,
    DistribucionProfundidad,
    DistribucionDepartamento,
    
    # Simulador
    SimuladorInput,
    SimuladorOutput,
    ZonaImpacto,
    CiudadAfectada,
    PrediccionReplica,
    
    # Respuestas
    APIResponse,
    PaginatedResponse,
    ErrorResponse,
)

__all__ = [
    "TipoProfundidad",
    "NivelMercalli",
    "FormatoExport",
    "SismoBase",
    "Sismo",
    "SismoResumen",
    "EstadisticasGenerales",
    "DistribucionMensual",
    "DistribucionProfundidad",
    "DistribucionDepartamento",
    "SimuladorInput",
    "SimuladorOutput",
    "ZonaImpacto",
    "CiudadAfectada",
    "PrediccionReplica",
    "APIResponse",
    "PaginatedResponse",
    "ErrorResponse",
]
