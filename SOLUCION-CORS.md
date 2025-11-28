# 🔧 Solución al Error CORS y Backend Dormido

## ⚠️ Problema
**Error:** "CORS Missing Allow Origin" o código 503

**Causa:** Render.com pone a dormir las aplicaciones gratuitas después de 15 minutos de inactividad.

---

## ✅ Soluciones Implementadas

### 1. **Configuración CORS Mejorada** (Backend)
   - Configuración explícita de orígenes permitidos
   - Soporte para credenciales
   - Headers permitidos: Content-Type, Authorization
   - Límite aumentado a 50MB para imágenes comprimidas

### 2. **Servicio Keep-Alive** (Frontend)
   - Hace ping al backend cada 10 minutos
   - Mantiene el servidor despierto automáticamente
   - Se inicia al hacer login
   - Se detiene al cerrar sesión

### 3. **Manejo de Errores Mejorado**
   - Detecta cuando el backend está dormido (503)
   - Muestra mensaje claro: "El servidor está despertando..."
   - Detecta problemas de conexión

---

## 🚀 Pasos para Actualizar

### Backend (Render):

1. **Hacer commit y push:**
   ```bash
   cd backend
   git add .
   git commit -m "Mejorar configuración CORS y límites"
   git push
   ```

2. **Esperar el deploy automático en Render** (2-3 minutos)

3. **Verificar variables de entorno en Render:**
   - Ve a tu servicio en Render
   - Click en "Environment"
   - Agregar: `FRONTEND_URL` = tu URL de Vercel (ej: https://tu-app.vercel.app)

### Frontend (Vercel):

1. **Hacer commit y push:**
   ```bash
   cd frontend
   git add .
   git commit -m "Agregar servicio keep-alive y mejor manejo de errores"
   git push
   ```

2. **Esperar el deploy automático en Vercel** (1-2 minutos)

---

## 🔍 Cómo Verificar que Funciona

1. **Abre la consola del navegador** (F12)
2. **Inicia sesión**
3. Deberías ver: `✅ Backend activo: ok`
4. Cada 10 minutos verás otro mensaje similar

---

## 💡 Consejos

### Si el backend está dormido:
- **Primera carga:** Espera 30-60 segundos
- El servicio keep-alive lo despertará automáticamente
- Refresca la página después de 1 minuto

### Para desarrollo local:
- Backend: `cd backend && node server.js`
- Frontend: `cd frontend && npm run dev`
- El keep-alive solo se activa en producción

---

## 🆘 Si Persiste el Error

1. **Verifica que el backend esté corriendo:**
   - Ve a: https://tesoreria-backend.onrender.com/api/health
   - Deberías ver: `{"status":"ok","timestamp":"...","uptime":123}`

2. **Verifica CORS en Render:**
   - Settings → Environment → Agregar `FRONTEND_URL`

3. **Limpia caché del navegador:**
   - Ctrl + Shift + R (recarga completa)
   - O borra caché en configuración

4. **Revisa logs en Render:**
   - Dashboard → Tu servicio → Logs
   - Busca errores de CORS o conexión

---

## 📊 Límites de Render Gratuito

- ⏰ **Tiempo activo:** 750 horas/mes
- 💤 **Inactividad:** Duerme después de 15 minutos
- 🔄 **Despertar:** 30-60 segundos la primera vez
- 💾 **Almacenamiento:** Ilimitado (MongoDB Atlas)

El servicio keep-alive ayuda a mantenerlo despierto durante el uso activo.

---

¡Listo! Tu aplicación ahora maneja mejor el backend dormido y los errores de CORS. 🎉
