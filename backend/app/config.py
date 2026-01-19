# ═══════════════════════════════════════════════════════════════════════════
# SIASIC-Santander Backend - Configuración
# ═══════════════════════════════════════════════════════════════════════════

from pydantic_settings import BaseSettings
from typing import List
from pathlib import Path


class Settings(BaseSettings):
    """Configuración principal de la aplicación"""
    
    # App Info
    APP_NAME: str = "SIASIC-Santander API"
    APP_VERSION: str = "1.0.0"
    APP_DESCRIPTION: str = "Sistema de Información y Análisis Sísmico de Santander"
    
    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8001
    DEBUG: bool = True
    
    # CORS - Permitir Next.js frontend
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
    ]
    
    # ═══════════════════════════════════════════════════════════════════════
    # RUTA DE DATOS - Archivo CSV con los sismos
    # ═══════════════════════════════════════════════════════════════════════
    DATA_PATH: str = str(Path(__file__).parent.parent / "data" / "sismos.csv")
    
    # ArcGIS Dashboard URL
    ARCGIS_DASHBOARD_URL: str = "https://udes.maps.arcgis.com/apps/dashboards/2d52631707104b1c9239a9eac929b022"
    
    class Config:
        env_file = ".env"
        case_sensitive = True


# Paleta de colores SIASIC (extraída del dashboard)
class Colors:
    """Colores corporativos SIASIC-Santander"""
    
    # Fondos
    BACKGROUND_PRIMARY: str = "#0a1628"      # Azul muy oscuro
    BACKGROUND_SECONDARY: str = "#1a2d4a"    # Azul medio
    BACKGROUND_CARD: str = "#0f2744"         # Azul oscuro cards
    
    # Acentos
    ACCENT_CYAN: str = "#00d4aa"             # Cyan/Turquesa principal
    ACCENT_BLUE: str = "#3b82f6"             # Azul brillante
    
    # Clasificación sísmica
    NIDO_SISMICO: str = "#6B46C1"            # Morado - Nido Sísmico
    SUPERFICIAL: str = "#DC2626"             # Rojo - Superficial
    INTERMEDIO: str = "#F59E0B"              # Naranja - Intermedio  
    PROFUNDO: str = "#2563EB"                # Azul - Profundo
    
    # Estados
    SUCCESS: str = "#10B981"                 # Verde
    WARNING: str = "#F59E0B"                 # Naranja
    DANGER: str = "#EF4444"                  # Rojo
    INFO: str = "#3B82F6"                    # Azul
    
    # Texto
    TEXT_PRIMARY: str = "#FFFFFF"            # Blanco
    TEXT_SECONDARY: str = "#94A3B8"          # Gris azulado
    TEXT_MUTED: str = "#64748B"              # Gris oscuro


# Constantes del proyecto
class Constants:
    """Constantes del sistema"""
    
    # Coordenadas del Nido Sísmico de Bucaramanga
    NIDO_LAT: float = 6.78
    NIDO_LON: float = -73.18
    NIDO_DEPTH_MIN: float = 140
    NIDO_DEPTH_MAX: float = 180
    
    # Límites de visualización
    MAP_CENTER_LAT: float = 7.12
    MAP_CENTER_LON: float = -73.12
    MAP_ZOOM: int = 8
    
    # Clasificación de profundidad (km)
    DEPTH_SUPERFICIAL_MAX: float = 70
    DEPTH_INTERMEDIO_MAX: float = 140
    DEPTH_NIDO_MAX: float = 180


# Instancias globales
settings = Settings()
colors = Colors()
constants = Constants()
