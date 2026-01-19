# ═══════════════════════════════════════════════════════════════════════════
# SIASIC-Santander Backend - Router del Simulador
# ═══════════════════════════════════════════════════════════════════════════

from fastapi import APIRouter, HTTPException
from typing import List

from app.models import SimuladorInput, SimuladorOutput
from app.services import simulador_service

router = APIRouter(prefix="/simulador", tags=["Simulador"])


@router.post("", response_model=SimuladorOutput, summary="Ejecutar simulación")
async def simular_sismo(params: SimuladorInput):
    """
    Ejecuta una simulación sísmica completa.
    
    **Parámetros de entrada:**
    - **latitud**: Latitud del epicentro (4.0 - 10.0)
    - **longitud**: Longitud del epicentro (-77.0 - -70.0)
    - **magnitud**: Magnitud del sismo (2.0 - 8.5)
    - **profundidad**: Profundidad en km (0 - 300)
    """
    
    try:
        resultado = simulador_service.simular(params)
        return resultado
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error en simulación: {str(e)}")


@router.post("/escenario-rapido", response_model=SimuladorOutput, summary="Escenario del Nido Sísmico")
async def escenario_nido_sismico(magnitud: float = 5.0):
    """Simula un sismo típico del Nido de Bucaramanga."""
    
    if magnitud < 2.0 or magnitud > 8.5:
        raise HTTPException(status_code=400, detail="La magnitud debe estar entre 2.0 y 8.5")
    
    params = SimuladorInput(
        latitud=6.78,
        longitud=-73.18,
        magnitud=magnitud,
        profundidad=147
    )
    
    return simulador_service.simular(params)


@router.post("/comparar", summary="Comparar escenarios")
async def comparar_escenarios(escenarios: List[SimuladorInput]):
    """Compara múltiples escenarios sísmicos."""
    
    if len(escenarios) > 10:
        raise HTTPException(status_code=400, detail="Máximo 10 escenarios")
    
    if len(escenarios) < 2:
        raise HTTPException(status_code=400, detail="Mínimo 2 escenarios")
    
    return simulador_service.comparar_escenarios(escenarios)


@router.get("/ciudades", summary="Ciudades disponibles")
async def obtener_ciudades():
    """Lista de ciudades incluidas en el análisis de impacto."""
    return simulador_service.obtener_ciudades()


@router.get("/escenarios-predefinidos", summary="Escenarios predefinidos")
async def obtener_escenarios_predefinidos():
    """Escenarios sísmicos predefinidos para análisis rápido."""
    
    return [
        {
            "nombre": "Nido M4.5 (Frecuente)",
            "descripcion": "Sismo típico del Nido de Bucaramanga",
            "params": {"latitud": 6.78, "longitud": -73.18, "magnitud": 4.5, "profundidad": 147}
        },
        {
            "nombre": "Nido M5.0 (Moderado)",
            "descripcion": "Sismo moderado del Nido",
            "params": {"latitud": 6.78, "longitud": -73.18, "magnitud": 5.0, "profundidad": 147}
        },
        {
            "nombre": "Nido M5.5 (Fuerte)",
            "descripcion": "Sismo fuerte del Nido",
            "params": {"latitud": 6.78, "longitud": -73.18, "magnitud": 5.5, "profundidad": 147}
        },
        {
            "nombre": "Superficial M5.0",
            "descripcion": "Sismo superficial cerca de Bucaramanga",
            "params": {"latitud": 7.12, "longitud": -73.12, "magnitud": 5.0, "profundidad": 20}
        },
        {
            "nombre": "Crítico M6.5",
            "descripcion": "Escenario crítico de alto impacto",
            "params": {"latitud": 6.80, "longitud": -73.15, "magnitud": 6.5, "profundidad": 145}
        }
    ]


@router.get("/escala-mercalli", summary="Escala de Mercalli")
async def obtener_escala_mercalli():
    """Descripción completa de la escala de intensidad Mercalli."""
    
    return [
        {"nivel": "I", "intensidad": "1-1.9", "descripcion": "No sentido", "color": "#FFFFFF"},
        {"nivel": "II", "intensidad": "2-2.9", "descripcion": "Muy débil", "color": "#ACD8E9"},
        {"nivel": "III", "intensidad": "3-3.9", "descripcion": "Débil", "color": "#83D0DA"},
        {"nivel": "IV", "intensidad": "4-4.9", "descripcion": "Ligero", "color": "#7BC87D"},
        {"nivel": "V", "intensidad": "5-5.9", "descripcion": "Moderado", "color": "#F5F500"},
        {"nivel": "VI", "intensidad": "6-6.9", "descripcion": "Fuerte", "color": "#F5C800"},
        {"nivel": "VII", "intensidad": "7-7.9", "descripcion": "Muy fuerte", "color": "#FF9100"},
        {"nivel": "VIII", "intensidad": "8-8.9", "descripcion": "Severo", "color": "#E93C00"},
        {"nivel": "IX", "intensidad": "9-9.9", "descripcion": "Violento", "color": "#B40000"},
        {"nivel": "X", "intensidad": "10-10.9", "descripcion": "Extremo", "color": "#800000"},
        {"nivel": "XI", "intensidad": "11-11.9", "descripcion": "Catastrófico", "color": "#4B0082"},
        {"nivel": "XII", "intensidad": "12", "descripcion": "Apocalíptico", "color": "#000000"}
    ]
