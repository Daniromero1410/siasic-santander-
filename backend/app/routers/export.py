# ═══════════════════════════════════════════════════════════════════════════
# SIASIC-Santander Backend - Router de Exportación
# ═══════════════════════════════════════════════════════════════════════════

from fastapi import APIRouter, Query, HTTPException
from fastapi.responses import Response, JSONResponse
from typing import Optional

from app.models import FormatoExport, SimuladorInput
from app.services import export_service, simulador_service

router = APIRouter(prefix="/export", tags=["Exportación"])


@router.get("/sismos/{formato}", summary="Exportar sismos")
async def exportar_sismos(
    formato: FormatoExport,
    departamento: Optional[str] = Query(None, description="Filtrar por departamento"),
    tipo_profundidad: Optional[str] = Query(None, description="Filtrar por tipo"),
    magnitud_min: Optional[float] = Query(None, description="Magnitud mínima"),
    magnitud_max: Optional[float] = Query(None, description="Magnitud máxima")
):
    """
    Exporta datos sísmicos en diferentes formatos.
    
    **Formatos disponibles:**
    - **csv**: Valores separados por comas
    - **geojson**: GeoJSON para GIS
    - **kml**: KML para Google Earth
    """
    
    filtros = {
        'departamento': departamento,
        'tipo_profundidad': tipo_profundidad,
        'magnitud_min': magnitud_min,
        'magnitud_max': magnitud_max
    }
    
    try:
        if formato == FormatoExport.CSV:
            content = export_service.exportar_csv(filtros)
            return Response(
                content=content,
                media_type="text/csv",
                headers={
                    "Content-Disposition": "attachment; filename=siasic_sismos.csv"
                }
            )
        
        elif formato == FormatoExport.GEOJSON:
            content = export_service.exportar_geojson(filtros)
            return JSONResponse(
                content=content,
                headers={
                    "Content-Disposition": "attachment; filename=siasic_sismos.geojson"
                }
            )
        
        elif formato == FormatoExport.KML:
            content = export_service.exportar_kml(filtros)
            return Response(
                content=content,
                media_type="application/vnd.google-earth.kml+xml",
                headers={
                    "Content-Disposition": "attachment; filename=siasic_sismos.kml"
                }
            )
        
        else:
            raise HTTPException(status_code=400, detail="Formato no soportado")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error en exportación: {str(e)}")


@router.post("/simulacion/csv", summary="Exportar simulación a CSV")
async def exportar_simulacion_csv(params: SimuladorInput):
    """
    Ejecuta una simulación y exporta los resultados a CSV.
    
    Incluye:
    - Parámetros del sismo
    - Ciudades afectadas
    - Predicción de réplicas
    """
    
    try:
        # Ejecutar simulación
        resultado = simulador_service.simular(params)
        
        # Convertir a dict para exportar
        resultado_dict = {
            'epicentro': resultado.epicentro,
            'magnitud': resultado.magnitud,
            'profundidad': resultado.profundidad,
            'tipo_profundidad': resultado.tipo_profundidad.value,
            'intensidad_epicentro': resultado.intensidad_epicentro,
            'mercalli': resultado.mercalli,
            'energia_tnt_toneladas': resultado.energia_tnt_toneladas,
            'ciudades_afectadas': [c.model_dump() for c in resultado.ciudades_afectadas],
            'replicas_prediccion': [r.model_dump() for r in resultado.replicas_prediccion]
        }
        
        content = export_service.exportar_simulacion_csv(resultado_dict)
        
        return Response(
            content=content,
            media_type="text/csv",
            headers={
                "Content-Disposition": f"attachment; filename=simulacion_M{params.magnitud}.csv"
            }
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error en exportación: {str(e)}")


@router.get("/formatos", summary="Formatos disponibles")
async def obtener_formatos():
    """Lista de formatos de exportación disponibles."""
    
    return [
        {
            "formato": "csv",
            "nombre": "CSV",
            "descripcion": "Valores separados por comas - Compatible con Excel",
            "extension": ".csv"
        },
        {
            "formato": "geojson",
            "nombre": "GeoJSON",
            "descripcion": "Formato GIS estándar - Compatible con ArcGIS, QGIS",
            "extension": ".geojson"
        },
        {
            "formato": "kml",
            "nombre": "KML",
            "descripcion": "Keyhole Markup Language - Compatible con Google Earth",
            "extension": ".kml"
        }
    ]
