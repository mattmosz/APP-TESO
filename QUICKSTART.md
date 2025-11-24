# ⚡ Inicio Rápido - 3 Pasos

## 🎯 Para Empezar Localmente

### 1️⃣ Configura MongoDB (5 minutos)

Ve a https://mongodb.com/cloud/atlas y crea cuenta gratuita.
Obtén tu URL de conexión.

### 2️⃣ Configura Variables de Entorno

Edita estos archivos:

**`backend/.env`**
```env
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/tesoreria
JWT_SECRET=cambiaesto_por_algo_muy_largo_y_aleatorio_12345
PORT=3000
```

**`frontend/.env`**
```env
VITE_API_URL=http://localhost:3000/api
```

### 3️⃣ Ejecuta

```powershell
# Instalar dependencias e iniciar
.\start.ps1

# En otra terminal, crea el usuario
.\create-user.ps1
```

Ve a http://localhost:5173 y listo! 🎉

---

## 🌐 Para Despliegue en Producción

Lee `DEPLOYMENT.md` - paso a paso para:
- MongoDB Atlas (base de datos gratis)
- Render (backend gratis)  
- Vercel (frontend gratis)

Tiempo total: 20-30 minutos

---

## 📚 Más Información

- **`PROJECT_SUMMARY.md`** - Documentación técnica completa
- **`GETTING_STARTED.md`** - Guía detallada de inicio
- **`DEPLOYMENT.md`** - Guía de despliegue paso a paso
- **`README.md`** - Información general

---

## ❓ ¿Problemas?

1. Verifica que MongoDB esté configurado correctamente
2. Verifica que las variables de entorno estén bien escritas
3. Lee los mensajes de error en la consola
4. Consulta `GETTING_STARTED.md` para más detalles

---

**Sistema 100% funcional y listo para usar** ✅
