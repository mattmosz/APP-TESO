# Crear Usuario Inicial
# Ejecutar DESPUES de iniciar el backend

$API_URL = "http://localhost:3000/api"

Write-Host "Creador de Usuario Inicial - Tesoreria 8vo C" -ForegroundColor Cyan
Write-Host ""

# Solicitar datos
$username = Read-Host "Ingresa el nombre de usuario (ej: tesorera)"
$nombre = Read-Host "Ingresa el nombre completo"
$password = Read-Host "Ingresa la contrasena" -AsSecureString
$passwordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($password)
)

Write-Host ""
Write-Host "Creando usuario..." -ForegroundColor Yellow

$body = @{
    username = $username
    password = $passwordPlain
    nombre = $nombre
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$API_URL/auth/register" -Method POST -Body $body -ContentType "application/json"
    Write-Host ""
    Write-Host "Usuario creado exitosamente!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Ahora puedes iniciar sesion con:" -ForegroundColor White
    Write-Host "   Usuario: $username" -ForegroundColor Cyan
    Write-Host "   Contrasena: [la que ingresaste]" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Ve a http://localhost:5173 para acceder al sistema" -ForegroundColor Green
} catch {
    Write-Host ""
    Write-Host "Error al crear usuario:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    Write-Host "Verifica que:" -ForegroundColor Yellow
    Write-Host "  1. El backend este corriendo (http://localhost:3000)" -ForegroundColor White
    Write-Host "  2. MongoDB este conectado correctamente" -ForegroundColor White
    Write-Host "  3. Las variables de entorno esten configuradas" -ForegroundColor White
}
