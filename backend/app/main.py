# ═══════════════════════════════════════════════════════════════════════════
# SIASIC-Santander Backend - Main Application
# ═══════════════════════════════════════════════════════════════════════════
# Sistema de Información y Análisis Sísmico de Santander
# Autor: Daniel - UDES
# Versión: 1.0.0
# ═══════════════════════════════════════════════════════════════════════════

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings, colors
from app.routers import sismos_router, simulador_router, export_router


# ═══════════════════════════════════════════════════════════════════════════
# CONFIGURACIÓN DE LA APLICACIÓN
# ═══════════════════════════════════════════════════════════════════════════

app = FastAPI(
    title=settings.APP_NAME,
    description=f"""
## 🌋 {settings.APP_DESCRIPTION}

API REST para el análisis y simulación de actividad sísmica en la región de Santander, 
Colombia, con énfasis especial en el **Nido Sísmico de Bucaramanga**.

### Funcionalidades principales:

* 📊 **Consulta de datos sísmicos** - Listado, filtrado y estadísticas
* 🎮 **Simulador sísmico** - Modelado de escenarios y predicción de impacto
* 📤 **Exportación** - CSV, GeoJSON, KML para integración con GIS
* 📈 **Visualizaciones** - Datos preparados para gráficas y mapas

### Modelos científicos incluidos:

* **Modelo de Omori-Utsu** - Predicción de réplicas sísmicas
* **Modelo de atenuación** - Cálculo de intensidad Mercalli por distancia
* **Ley de Båth** - Estimación de magnitud máxima de réplicas

---
*Proyecto de Tesis - Universidad de Santander (UDES)*
    """,
    version=settings.APP_VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_tags=[
        {
            "name": "Sismos",
            "description": "Operaciones con datos sísmicos históricos"
        },
        {
            "name": "Simulador",
            "description": "Simulación y modelado de escenarios sísmicos"
        },
        {
            "name": "Exportación",
            "description": "Exportación de datos en formatos GIS"
        }
    ]
)


# ═══════════════════════════════════════════════════════════════════════════
# MIDDLEWARE CORS
# ═══════════════════════════════════════════════════════════════════════════

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ═══════════════════════════════════════════════════════════════════════════
# ROUTERS
# ═══════════════════════════════════════════════════════════════════════════

app.include_router(sismos_router, prefix="/api")
app.include_router(simulador_router, prefix="/api")
app.include_router(export_router, prefix="/api")


# ═══════════════════════════════════════════════════════════════════════════
# ENDPOINTS RAÍZ
# ═══════════════════════════════════════════════════════════════════════════

@app.get("/", tags=["Root"])
async def root():
    """Información de la API"""
    return {
        "nombre": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "descripcion": settings.APP_DESCRIPTION,
        "documentacion": "/docs",
        "estado": "🟢 Operativo"
    }


@app.get("/health", tags=["Root"])
async def health_check():
    """Verificación de salud del servicio"""
    return {
        "status": "healthy",
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION
    }


@app.get("/api/config/colores", tags=["Root"])
async def obtener_colores():
    """Paleta de colores SIASIC para el frontend"""
    return {
        "background": {
            "primary": colors.BACKGROUND_PRIMARY,
            "secondary": colors.BACKGROUND_SECONDARY,
            "card": colors.BACKGROUND_CARD
        },
        "accent": {
            "cyan": colors.ACCENT_CYAN,
            "blue": colors.ACCENT_BLUE
        },
        "sismico": {
            "nido": colors.NIDO_SISMICO,
            "superficial": colors.SUPERFICIAL,
            "intermedio": colors.INTERMEDIO,
            "profundo": colors.PROFUNDO
        },
        "estado": {
            "success": colors.SUCCESS,
            "warning": colors.WARNING,
            "danger": colors.DANGER,
            "info": colors.INFO
        },
        "texto": {
            "primary": colors.TEXT_PRIMARY,
            "secondary": colors.TEXT_SECONDARY,
            "muted": colors.TEXT_MUTED
        }
    }


@app.get("/api/config/arcgis", tags=["Root"])
async def obtener_config_arcgis():
    """Configuración para integración con ArcGIS"""
    return {
        "dashboard_url": settings.ARCGIS_DASHBOARD_URL,
        "descripcion": "Dashboard ArcGIS Online del Nido Sísmico de Bucaramanga"
    }


# ═══════════════════════════════════════════════════════════════════════════
# MANEJO DE ERRORES
# ═══════════════════════════════════════════════════════════════════════════

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Manejador global de excepciones"""
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": "Error interno del servidor",
            "detail": str(exc) if settings.DEBUG else None
        }
    )


# ═══════════════════════════════════════════════════════════════════════════
# PUNTO DE ENTRADA
# ═══════════════════════════════════════════════════════════════════════════

if __name__ == "__main__":
    import uvicorn
    
      # Usar configuración desde settings
   # Usar configuración desde settings
    print(f"""
    ╔═══════════════════════════════════════════════════════════════════════╗
    ║                                                                       ║
    ║   🌋 SIASIC-SANTANDER API                                             ║
    ║   Sistema de Información y Análisis Sísmico                           ║
    ║                                                                       ║
    ║   📍 http://{settings.HOST}:{settings.PORT}                          ║
    ║   📚 Docs: http://{settings.HOST}:{settings.PORT}/docs               ║
    ║   🚀 Environment: {'PRODUCTION' if not settings.DEBUG else 'DEVELOPMENT'} ║
    ║   🔧 CORS Origins: {settings.CORS_ORIGINS}                           ║
    ║                                                                       ║
    ╚═══════════════════════════════════════════════════════════════════════╝
    """)
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG
    )
