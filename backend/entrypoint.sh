#!/bin/bash
# Entrypoint para Railway

# Iniciar la aplicación usando el PORT de Railway
uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8001}
