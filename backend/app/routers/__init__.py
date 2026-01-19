# ═══════════════════════════════════════════════════════════════════════════
# SIASIC-Santander Backend - Routers Package
# ═══════════════════════════════════════════════════════════════════════════

from .sismos import router as sismos_router
from .simulador import router as simulador_router
from .export import router as export_router

__all__ = [
    "sismos_router",
    "simulador_router",
    "export_router",
]
