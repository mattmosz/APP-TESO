# 📋 Cómo Personalizar las Alertas

## 🎯 Ubicación del archivo de configuración
Abre el archivo: `frontend/src/components/Alert.js`

---

## 🎨 Configuración Actual

```javascript
const ALERT_CONFIG = {
  success: {
    gifUrl: 'https://media.giphy.com/media/...',
    title: '¡Éxito!',
    duration: 4000  // 4 segundos
  },
  error: {
    gifUrl: 'https://media.giphy.com/media/...',
    title: 'Error',
    duration: 5000  // 5 segundos
  }
};
```

---

## 📝 Opciones de Personalización

### 1️⃣ **Cambiar el GIF desde internet**

**Pasos:**
1. Ve a https://giphy.com
2. Busca el GIF que quieras (ejemplo: "celebration", "error", "warning")
3. Haz clic derecho en el GIF → **"Copiar dirección de imagen"**
4. Pega la URL en `gifUrl`:

```javascript
success: {
  gifUrl: 'https://media.giphy.com/media/tu-nuevo-gif/giphy.gif',
  title: '¡Éxito!',
  duration: 4000
}
```

---

### 2️⃣ **Usar tu propio GIF personalizado**

**Pasos:**
1. Guarda tu archivo GIF en: `frontend/public/assets/`
   - Ejemplo: `exito.gif`, `error.gif`

2. Usa la ruta local:

```javascript
success: {
  gifUrl: '/assets/exito.gif',  // ← Tu GIF personalizado
  title: '¡Perfecto!',
  duration: 4000
}
```

---

### 3️⃣ **Cambiar el título**

Simplemente modifica el texto:

```javascript
success: {
  gifUrl: '/assets/exito.gif',
  title: '¡Pago Registrado! 🎉',  // ← Título personalizado
  duration: 4000
}
```

---

### 4️⃣ **Cambiar la duración**

El tiempo está en milisegundos:
- 1000 = 1 segundo
- 3000 = 3 segundos
- 5000 = 5 segundos

```javascript
success: {
  gifUrl: '/assets/exito.gif',
  title: '¡Éxito!',
  duration: 3000  // ← Durará 3 segundos antes de cerrarse
}
```

---

## 🎯 Ejemplos Completos

### Ejemplo 1: Alerta de Éxito Personalizada
```javascript
success: {
  gifUrl: '/assets/exito-tesoreria.gif',
  title: '¡Pago Registrado Exitosamente! 💰',
  duration: 3500
}
```

### Ejemplo 2: Alerta de Error Personalizada
```javascript
error: {
  gifUrl: '/assets/error-triste.gif',
  title: 'Ups, algo salió mal 😢',
  duration: 4500
}
```

### Ejemplo 3: Agregar nueva alerta de Advertencia
```javascript
warning: {
  gifUrl: '/assets/advertencia.gif',
  title: '⚠️ Advertencia',
  duration: 4000
}
```

---

## 🚀 Cómo usar las alertas en el código

Ya están implementadas en:
- ✅ **PagosPage.js** - Registro y edición de pagos
- ✅ **EgresosPage.js** - Registro y edición de egresos

### Para usar en otros archivos:

1. Importa las alertas:
```javascript
import { showSuccessAlert, showErrorAlert } from '../components/Alert.js';
```

2. Úsalas con tu mensaje personalizado:
```javascript
// Éxito
showSuccessAlert('El alumno fue registrado correctamente');

// Error
showErrorAlert('No se pudo conectar con el servidor');

// Advertencia (si la agregaste)
showWarningAlert('Esta acción no se puede deshacer');

// Info (si la agregaste)
showInfoAlert('Recuerda guardar los cambios');
```

---

## 📦 Recomendaciones de GIFs

### Para Éxito:
- Busca: "celebration", "success", "check mark", "thumbs up"
- Colores: Verde, azul

### Para Error:
- Busca: "error", "wrong", "fail", "x mark"
- Colores: Rojo

### Para Advertencia:
- Busca: "warning", "caution", "attention"
- Colores: Amarillo, naranja

### Tamaño recomendado:
- Ancho/Alto: 200-400 px
- Peso: Menos de 500KB para que cargue rápido

---

## ❓ ¿Necesitas ayuda?

Si algo no funciona:
1. Verifica que la ruta del GIF sea correcta
2. Asegúrate que el archivo GIF esté en `frontend/public/assets/`
3. Recarga la página con Ctrl+Shift+R (recarga completa)

¡Listo! Ahora puedes personalizar todas tus alertas 🎨
