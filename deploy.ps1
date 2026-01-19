# ═══════════════════════════════════════════════════════════════════════════
# SIASIC-Santander - Script de Despliegue (Windows)
# ═══════════════════════════════════════════════════════════════════════════

Write-Host "🚀 Iniciando despliegue de SIASIC-Santander..." -ForegroundColor Cyan

# Verificar Docker
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Docker no está instalado" -ForegroundColor Red
    exit 1
}

# Construir imágenes
Write-Host "📦 Construyendo imágenes Docker..." -ForegroundColor Yellow
docker-compose build

# Detener contenedores existentes
Write-Host "🛑 Deteniendo contenedores existentes..." -ForegroundColor Yellow
docker-compose down

# Iniciar servicios
Write-Host "▶️ Iniciando servicios..." -ForegroundColor Yellow
docker-compose up -d

# Esperar
Start-Sleep -Seconds 5

# Verificar estado
Write-Host "✅ Verificando estado de los servicios..." -ForegroundColor Green
docker-compose ps

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "🌋 SIASIC-Santander desplegado exitosamente!" -ForegroundColor Green
Write-Host ""
Write-Host "   Frontend:  http://localhost:3000" -ForegroundColor White
Write-Host "   Backend:   http://localhost:8001" -ForegroundColor White
Write-Host "   API Docs:  http://localhost:8001/docs" -ForegroundColor White
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
```