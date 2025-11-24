# Sistema de Tesorería - 8vo C

## 🚀 Inicio Rápido (Desarrollo Local)

### 1. Configurar MongoDB

Necesitas una base de datos MongoDB. Tienes dos opciones:

**Opción A: MongoDB Atlas (Recomendado - Gratis)**
1. Ve a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Crea una cuenta gratuita y un cluster
3. Obtén tu cadena de conexión
4. Agrégala al archivo `.env` del backend

**Opción B: MongoDB Local**
```bash
# Instalar MongoDB localmente y usar:
# mongodb://localhost:27017/tesoreria
```

### 2. Instalar Dependencias

```bash
# Backend
cd backend
npm install

# Frontend (en otra terminal)
cd frontend
npm install
```

### 3. Configurar Variables de Entorno

**Backend** (`backend/.env`):
```env
MONGODB_URI=tu_cadena_de_conexion_mongodb
JWT_SECRET=un_secreto_muy_largo_y_aleatorio
PORT=3000
```

**Frontend** (`frontend/.env`):
```env
VITE_API_URL=http://localhost:3000/api
```

### 4. Crear Usuario Inicial

Una vez que el backend esté corriendo, crea el primer usuario:

```bash
# Windows PowerShell
Invoke-RestMethod -Uri http://localhost:3000/api/auth/register -Method POST -ContentType "application/json" -Body '{"username":"tesorera","password":"mipassword123","nombre":"Nombre Tesorera"}'

# O usar Postman/Insomnia:
# POST http://localhost:3000/api/auth/register
# Body: {
#   "username": "tesorera",
#   "password": "mipassword123",
#   "nombre": "Nombre Tesorera"
# }
```

### 5. Iniciar Servidores

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

Abre tu navegador en `http://localhost:5173`

## 📚 Funcionalidades

✅ Sistema de login seguro con JWT
✅ Dashboard con estadísticas en tiempo real
✅ CRUD completo de alumnos
✅ CRUD completo de actividades con fechas y cuotas
✅ Registro de pagos por alumno y actividad
✅ Control de egresos con asociación a actividades
✅ Reportes de deudores por actividad
✅ Diseño 100% responsive (móvil y desktop)
✅ Validaciones y manejo de errores

## 🌐 Despliegue en Producción

Consulta `DEPLOYMENT.md` para instrucciones detalladas de cómo desplegar en:
- **MongoDB Atlas** (base de datos)
- **Render** (backend)
- **Vercel** (frontend)

**Todo 100% GRATIS** 🎉

## 🛠️ Tecnologías

**Backend:**
- Node.js + Express
- MongoDB + Mongoose
- JWT para autenticación
- bcryptjs para encriptación

**Frontend:**
- Vite + Vanilla JavaScript
- CSS moderno y responsive
- API REST con fetch

## 📱 Uso

1. **Login**: Inicia sesión con tus credenciales
2. **Dashboard**: Ve las estadísticas generales
3. **Alumnos**: Gestiona la lista de alumnos del curso
4. **Actividades**: Crea y gestiona actividades con sus cuotas
5. **Pagos**: Registra los pagos de cada alumno por actividad
6. **Egresos**: Registra todos los gastos realizados
7. **Reportes**: Ve quiénes deben dinero por actividad

## 🔒 Seguridad

- Contraseñas encriptadas con bcrypt
- Tokens JWT con expiración de 7 días
- Validación de datos en backend
- Protección de rutas privadas

## 📞 Soporte

Si tienes problemas:
1. Verifica que MongoDB esté conectado
2. Verifica las variables de entorno
3. Revisa la consola del navegador para errores
4. Revisa los logs del servidor backend

## 📄 Licencia

MIT - Uso libre para fines educativos
