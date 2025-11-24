# Sistema de Tesorería - 8vo C

Sistema web para gestión de tesorería de curso escolar.

## Características
- ✅ Login seguro para tesorera
- ✅ Dashboard con estadísticas en tiempo real
- ✅ Gestión completa de alumnos
- ✅ Gestión de actividades y cuotas
- ✅ Registro de pagos por alumno
- ✅ Control de egresos
- ✅ Reportes de deudores
- ✅ Diseño responsive (móvil y PC)

## Stack Tecnológico
- **Frontend**: Vite + Vanilla JavaScript
- **Backend**: Node.js + Express
- **Base de datos**: MongoDB Atlas
- **Despliegue**: Vercel (frontend) + Render (backend)

## Estructura del Proyecto
```
APP TESO/
├── frontend/          # Aplicación cliente
├── backend/           # API REST
└── README.md
```

## Instalación Local

### Backend
```bash
cd backend
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Variables de Entorno

### Backend (.env)
```
MONGODB_URI=tu_conexion_mongodb
JWT_SECRET=tu_secreto_jwt
PORT=3000
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:3000/api
```

## Despliegue

Consulta `DEPLOYMENT.md` para instrucciones detalladas de despliegue en servicios gratuitos.
