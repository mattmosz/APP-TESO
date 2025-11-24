# Script para iniciar el sistema completo
# Ejecutar desde la raíz del proyecto

Write-Host "🚀 Iniciando Sistema de Tesorería 8vo C" -ForegroundColor Cyan
Write-Host ""

# Verificar si existen las carpetas
if (-not (Test-Path "backend")) {
    Write-Host "❌ Error: No se encuentra la carpeta 'backend'" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path "frontend")) {
    Write-Host "❌ Error: No se encuentra la carpeta 'frontend'" -ForegroundColor Red
    exit 1
}

# Verificar node_modules
Write-Host "📦 Verificando dependencias..." -ForegroundColor Yellow

if (-not (Test-Path "backend/node_modules")) {
    Write-Host "📥 Instalando dependencias del backend..." -ForegroundColor Yellow
    cd backend
    npm install
    cd ..
}

if (-not (Test-Path "frontend/node_modules")) {
    Write-Host "📥 Instalando dependencias del frontend..." -ForegroundColor Yellow
    cd frontend
    npm install
    cd ..
}

# Verificar archivos .env
Write-Host ""
Write-Host "🔍 Verificando configuración..." -ForegroundColor Yellow

if (-not (Test-Path "backend/.env")) {
    Write-Host "⚠️  No se encuentra backend/.env" -ForegroundColor Red
    Write-Host "   Creando desde .env.example..." -ForegroundColor Yellow
    Copy-Item "backend/.env.example" "backend/.env"
    Write-Host "   ⚠️  IMPORTANTE: Edita backend/.env y configura MONGODB_URI y JWT_SECRET" -ForegroundColor Red
}

if (-not (Test-Path "frontend/.env")) {
    Write-Host "⚠️  No se encuentra frontend/.env" -ForegroundColor Red
    Write-Host "   Creando desde .env.example..." -ForegroundColor Yellow
    Copy-Item "frontend/.env.example" "frontend/.env"
}

Write-Host ""
Write-Host "✅ Configuración completa" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Iniciando servidores..." -ForegroundColor Cyan
Write-Host "   Backend:  http://localhost:3000" -ForegroundColor White
Write-Host "   Frontend: http://localhost:5173" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  Para detener los servidores, presiona Ctrl+C" -ForegroundColor Yellow
Write-Host ""

# Iniciar backend en segundo plano
$backendJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    cd backend
    npm run dev
}

# Iniciar frontend en segundo plano
$frontendJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    cd frontend
    npm run dev
}

# Esperar un momento para que los servidores inicien
Start-Sleep -Seconds 3

Write-Host "📊 Mostrando logs de los servidores..." -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

# Mostrar logs en tiempo real
try {
    while ($true) {
        $backendOutput = Receive-Job -Job $backendJob -ErrorAction SilentlyContinue
        $frontendOutput = Receive-Job -Job $frontendJob -ErrorAction SilentlyContinue
        
        if ($backendOutput) {
            Write-Host "[BACKEND]  $backendOutput" -ForegroundColor Blue
        }
        
        if ($frontendOutput) {
            Write-Host "[FRONTEND] $frontendOutput" -ForegroundColor Green
        }
        
        Start-Sleep -Milliseconds 500
    }
}
finally {
    Write-Host ""
    Write-Host "🛑 Deteniendo servidores..." -ForegroundColor Yellow
    Stop-Job -Job $backendJob, $frontendJob
    Remove-Job -Job $backendJob, $frontendJob
    Write-Host "✅ Servidores detenidos" -ForegroundColor Green
}
