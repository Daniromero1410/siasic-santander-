# ═══════════════════════════════════════════════════════════════════════════
# SIASIC-Santander Backend - Configuración
# ═══════════════════════════════════════════════════════════════════════════

import os
from pydantic_settings import BaseSettings
from typing import List
from pathlib import Path
import json


class Settings(BaseSettings):
    """Configuración principal de la aplicación"""
    
    # App Info
    APP_NAME: str = "SIASIC-Santander API"
    APP_VERSION: str = "1.0.0"
    APP_DESCRIPTION: str = "Sistema de Información y Análisis Sísmico de Santander"
    
    # Server - CRÍTICO: Railway usa variable PORT, no 8001
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", 8001))  # Railway inyecta PORT automáticamente
    DEBUG: bool = os.getenv("DEBUG", "False").lower() == "true"
    
    # CORS - IMPORTANTE: Agregar Vercel frontend
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",            # Next.js local
        "http://127.0.0.1:3000",           # Next.js local alternativo
        "http://localhost:8000",           # Posible frontend alternativo
        "https://siasic-santander.vercel.app",  # TU FRONTEND EN VERCEL
        "https://siasic-santander-production.vercel.app",  # Por si acaso
        "http://localhost:8001",           # Backend local (por si pruebas)
    ]
    
    # Si Railway pasa CORS_ORIGINS como variable de entorno
    if os.getenv("CORS_ORIGINS"):
        try:
            # Intenta parsear como JSON
            CORS_ORIGINS = json.loads(os.getenv("CORS_ORIGINS"))
        except:
            # O como string separado por comas
            CORS_ORIGINS = os.getenv("CORS_ORIGINS").split(",")
    
    # ═══════════════════════════════════════════════════════════════════════
    # RUTA DE DATOS - Archivo CSV con los sismos
    # ═══════════════════════════════════════════════════════════════════════
    DATA_PATH: str = str(Path(__file__).parent.parent / "data" / "sismos.csv")
    
    # ArcGIS Dashboard URL
    ARCGIS_DASHBOARD_URL: str = "https://udes.maps.arcgis.com/apps/dashboards/2d52631707104b1c9239a9eac929b022"
    
    class Config:
        env_file = ".env"
        case_sensitive = True
        # Esto permite que pydantic lea las variables de entorno
        env_file_encoding = 'utf-8'


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


# ═══════════════════════════════════════════════════════════════════════════
# LOG DE CONFIGURACIÓN (para debugging)
# ═══════════════════════════════════════════════════════════════════════════
if __name__ == "__main__":
    print("=" * 70)
    print("CONFIGURACIÓN SIASIC-SANTANDER")
    print("=" * 70)
    print(f"APP_NAME: {settings.APP_NAME}")
    print(f"HOST: {settings.HOST}")
    print(f"PORT: {settings.PORT} (de entorno: {os.getenv('PORT')})")
    print(f"DEBUG: {settings.DEBUG}")
    print(f"CORS_ORIGINS: {settings.CORS_ORIGINS}")
    print(f"DATA_PATH: {settings.DATA_PATH}")
    print("=" * 70)