# Guía de Despliegue - Tesorería 8vo C

Esta guía te ayudará a desplegar el sistema en servicios gratuitos.

## 📋 Requisitos Previos

- Cuenta en [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- Cuenta en [Render](https://render.com/) o [Railway](https://railway.app/)
- Cuenta en [Vercel](https://vercel.com/)
- Git instalado

## 1️⃣ Base de Datos - MongoDB Atlas

### Crear el Cluster (GRATIS)

1. Ve a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Crea una cuenta gratuita
3. Crea un nuevo proyecto: "Tesoreria 8vo C"
4. Crea un cluster gratuito (M0 Sandbox):
   - Cloud Provider: AWS
   - Region: Selecciona la más cercana
   - Cluster Name: `tesoreria-cluster`

### Configurar Acceso

1. **Database Access**:
   - Click en "Database Access" en el menú lateral
   - Click en "Add New Database User"
   - Username: `tesorera`
   - Password: Genera una contraseña segura (guárdala)
   - Database User Privileges: "Read and write to any database"
   - Click "Add User"

2. **Network Access**:
   - Click en "Network Access"
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0)
   - Click "Confirm"

### Obtener la URL de Conexión

1. Ve a "Database" y click en "Connect" en tu cluster
2. Selecciona "Connect your application"
3. Driver: Node.js
4. Copia la cadena de conexión, se verá así:
   ```
   mongodb+srv://tesorera:<password>@tesoreria-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Reemplaza `<password>` con la contraseña del usuario
6. Guarda esta URL, la necesitarás para el backend

### Crear Usuario Inicial (Importante)

Una vez desplegado el backend, deberás crear el primer usuario haciendo una petición POST:

```bash
curl -X POST https://tu-backend.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "tesorera",
    "password": "tu_contraseña_segura",
    "nombre": "Nombre de la Tesorera"
  }'
```

## 2️⃣ Backend - Render

### Preparar el Repositorio

1. Crea un repositorio en GitHub para tu proyecto
2. Sube el código:
   ```bash
   cd "c:\Users\user\Documents\APP TESO"
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/tu-usuario/tesoreria-8vo-c.git
   git push -u origin main
   ```

### Desplegar en Render

1. Ve a [Render](https://render.com/) y crea una cuenta
2. Click en "New +" → "Web Service"
3. Conecta tu repositorio de GitHub
4. Configuración:
   - **Name**: `tesoreria-backend`
   - **Region**: Oregon (US West)
   - **Root Directory**: `backend`
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free

5. **Variables de Entorno** (Environment Variables):
   Click en "Advanced" y añade:
   ```
   MONGODB_URI=tu_url_de_mongodb_atlas
   JWT_SECRET=un_secreto_muy_largo_y_aleatorio_aqui
   NODE_ENV=production
   ```

6. Click "Create Web Service"
7. Espera a que se despliegue (5-10 minutos)
8. Guarda la URL de tu backend: `https://tesoreria-backend.onrender.com`

### Crear Usuario Inicial

Ahora sí, crea el primer usuario con curl o Postman:

```bash
curl -X POST https://tesoreria-backend.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "tesorera",
    "password": "CambiarEsto123!",
    "nombre": "Nombre Completo"
  }'
```

## 3️⃣ Frontend - Vercel

### Configurar el Frontend

1. En tu proyecto local, crea el archivo `.env` en la carpeta `frontend`:
   ```
   VITE_API_URL=https://tesoreria-backend.onrender.com/api
   ```

2. Commit este cambio:
   ```bash
   git add frontend/.env
   git commit -m "Add production API URL"
   git push
   ```

### Desplegar en Vercel

1. Ve a [Vercel](https://vercel.com/) y crea una cuenta
2. Click en "Add New..." → "Project"
3. Importa tu repositorio de GitHub
4. Configuración:
   - **Project Name**: `tesoreria-8vo-c`
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

5. **Environment Variables**:
   Añade:
   ```
   VITE_API_URL=https://tesoreria-backend.onrender.com/api
   ```

6. Click "Deploy"
7. Espera a que se despliegue (2-3 minutos)
8. Tu aplicación estará disponible en: `https://tesoreria-8vo-c.vercel.app`

## 🎉 ¡Listo!

Tu sistema está desplegado. Accede a la URL de Vercel y usa las credenciales que creaste.

## 🔧 Mantenimiento

### Actualizar el Sistema

Cuando hagas cambios en el código:

```bash
git add .
git commit -m "Descripción de los cambios"
git push
```

Vercel y Render se actualizarán automáticamente.

### Backup de Base de Datos

En MongoDB Atlas:
1. Ve a tu cluster
2. Click en "..." → "Export Data"
3. Descarga el backup

### Importante sobre Render Free Tier

⚠️ **Render Free**: El servicio gratuito se "duerme" después de 15 minutos de inactividad. La primera petición después de dormir puede tardar 30-50 segundos en responder. Es normal.

Si necesitas mantenerlo activo 24/7, considera usar un servicio de "ping" gratuito como [UptimeRobot](https://uptimerobot.com/) para hacer peticiones cada 10 minutos.

## 🆘 Solución de Problemas

### Error de CORS
Si ves errores de CORS, verifica que la URL del frontend esté correcta en las variables de entorno.

### Error de Conexión a MongoDB
- Verifica que la IP 0.0.0.0/0 esté en la whitelist
- Verifica que el usuario tenga permisos de lectura/escritura
- Verifica que la URL de conexión sea correcta

### Error 502 en Render
El servicio está iniciando. Espera 1-2 minutos.

## 📱 Acceso Móvil

La aplicación es completamente responsive. Solo accede desde el navegador móvil a tu URL de Vercel.

## 🔐 Seguridad

**Recomendaciones:**
- Cambia el JWT_SECRET regularmente
- Usa contraseñas seguras
- No compartas las credenciales públicamente
- Mantén las variables de entorno privadas

## 💰 Costos

- **MongoDB Atlas**: 512MB gratis (suficiente para años)
- **Render**: 750 horas/mes gratis
- **Vercel**: Ilimitado para proyectos personales

**Total: 100% GRATIS** 🎉
