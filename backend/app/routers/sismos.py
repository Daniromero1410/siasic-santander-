# ═══════════════════════════════════════════════════════════════════════════════
# SIASIC-Santander Backend - Router de Sismos
# ═══════════════════════════════════════════════════════════════════════════════

from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import JSONResponse
from typing import List, Optional

from app.services.sismos_service import sismos_service
from app.utils.json_utils import clean_for_json, clean_sismo_record

# IMPORTANTE: Solo "/sismos" porque main.py ya agrega "/api"
router = APIRouter(prefix="/sismos", tags=["Sismos"])


@router.get("/todos")
async def get_todos_sismos():
    """Retorna todos los sismos"""
    try:
        datos = sismos_service.get_all()
        datos_limpios = [clean_sismo_record(d) for d in datos]
        return JSONResponse(content=datos_limpios)
    except Exception as e:
        print(f"Error en /todos: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error al obtener sismos: {str(e)}")


@router.get("")
async def get_sismos_paginados(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100)
):
    """Retorna sismos paginados"""
    try:
        resultado = sismos_service.get_paginated(page, per_page)
        resultado['data'] = [clean_sismo_record(d) for d in resultado.get('data', [])]
        return JSONResponse(content=clean_for_json(resultado))
    except Exception as e:
        print(f"Error en paginados: {e}")
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")


@router.get("/stats/generales")
async def get_estadisticas_generales():
    """Retorna estadísticas generales"""
    try:
        stats = sismos_service.get_estadisticas_generales()
        return JSONResponse(content=clean_for_json(stats))
    except Exception as e:
        print(f"Error en stats: {e}")
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")


@router.get("/stats/mensual")
async def get_distribucion_mensual():
    """Retorna distribución mensual"""
    try:
        datos = sismos_service.get_distribucion_mensual()
        return JSONResponse(content=clean_for_json(datos))
    except Exception as e:
        print(f"Error en mensual: {e}")
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")


@router.get("/stats/profundidad")
async def get_distribucion_profundidad():
    """Retorna distribución por profundidad"""
    try:
        datos = sismos_service.get_distribucion_profundidad()
        return JSONResponse(content=clean_for_json(datos))
    except Exception as e:
        print(f"Error en profundidad: {e}")
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")


@router.get("/viz/mapa")
async def get_sismos_para_mapa():
    """Retorna datos para mapa"""
    try:
        datos = sismos_service.get_para_mapa()
        datos_limpios = [clean_sismo_record(d) for d in datos]
        return JSONResponse(content=datos_limpios)
    except Exception as e:
        print(f"Error en mapa: {e}")
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")


@router.get("/viz/timeline")
async def get_sismos_timeline():
    """Retorna datos para timeline"""
    try:
        datos = sismos_service.get_all()
        datos_ordenados = sorted(datos, key=lambda x: x.get('fecha_hora', ''), reverse=True)[:100]
        datos_limpios = [clean_sismo_record(d) for d in datos_ordenados]
        return JSONResponse(content=datos_limpios)
    except Exception as e:
        print(f"Error en timeline: {e}")
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")


@router.get("/{sismo_id}")
async def get_sismo_by_id(sismo_id: int):
    """Retorna un sismo por ID"""
    try:
        sismo = sismos_service.get_by_id(sismo_id)
        if sismo is None:
            raise HTTPException(status_code=404, detail="Sismo no encontrado")
        return JSONResponse(content=clean_sismo_record(sismo))
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error en get by id: {e}")
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")