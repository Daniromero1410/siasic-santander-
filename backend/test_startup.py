#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script de prueba para verificar que la aplicacion puede iniciarse correctamente
"""

import sys
import traceback

def test_imports():
    """Prueba que todos los imports funcionen"""
    print(">>> Probando imports...")

    try:
        print("  [OK] Importando config...")
        from app.config import settings, colors, constants, get_cors_origins, get_cors_origin_regex

        print("  [OK] Importando servicios...")
        from app.services import sismos_service, simulador_service, export_service

        print("  [OK] Importando routers...")
        from app.routers import sismos_router, simulador_router, export_router

        print("  [OK] Importando app principal...")
        from app.main import app

        print("[SUCCESS] Todos los imports exitosos!\n")
        return True
    except Exception as e:
        print(f"[ERROR] Error en imports: {e}\n")
        traceback.print_exc()
        return False


def test_config():
    """Prueba la configuracion"""
    print(">>> Probando configuracion...")

    try:
        from app.config import settings, get_cors_origins, get_cors_origin_regex

        print(f"  [OK] APP_NAME: {settings.APP_NAME}")
        print(f"  [OK] HOST: {settings.HOST}")
        print(f"  [OK] PORT: {settings.PORT}")
        print(f"  [OK] CORS Origins: {get_cors_origins()}")
        print(f"  [OK] CORS Regex: {get_cors_origin_regex()}")

        print("[SUCCESS] Configuracion OK!\n")
        return True
    except Exception as e:
        print(f"[ERROR] Error en configuracion: {e}\n")
        traceback.print_exc()
        return False


def test_data_loading():
    """Prueba que los datos se carguen correctamente"""
    print(">>> Probando carga de datos...")

    try:
        from app.services import sismos_service

        stats = sismos_service.obtener_estadisticas_generales()
        print(f"  [OK] Total sismos: {stats.get('total_sismos', 0)}")
        print(f"  [OK] Sismos del nido: {stats.get('total_nido', 0)}")

        print("[SUCCESS] Datos cargados correctamente!\n")
        return True
    except Exception as e:
        print(f"[ERROR] Error cargando datos: {e}\n")
        traceback.print_exc()
        return False


def main():
    """Ejecuta todas las pruebas"""
    print("=" * 70)
    print("SIASIC-SANTANDER - TEST DE INICIO")
    print("=" * 70 + "\n")

    tests = [
        test_imports,
        test_config,
        test_data_loading,
    ]

    results = []
    for test in tests:
        results.append(test())

    print("=" * 70)
    if all(results):
        print("[SUCCESS] TODAS LAS PRUEBAS PASARON - El backend deberia funcionar")
        print("=" * 70)
        return 0
    else:
        print("[ERROR] ALGUNAS PRUEBAS FALLARON - Revisar errores arriba")
        print("=" * 70)
        return 1


if __name__ == "__main__":
    sys.exit(main())
