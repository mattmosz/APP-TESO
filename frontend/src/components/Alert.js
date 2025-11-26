// Sistema de alertas personalizadas con GIF

// ============================================
// CONFIGURACIÓN DE ALERTAS PERSONALIZADAS
// ============================================
// Aquí puedes personalizar cada tipo de alerta
const ALERT_CONFIG = {
  success: {
    gifUrl: '/assets/dancing-don-bosco.gif',
    title: '¡Pago registrado!',
    duration: 4000 // milisegundos
  },
  error: {
    gifUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbGoxNWJ3dHNvdGR5dGhtY2RzYXJwbXlmMTlsZ3FwYXduZDFxZGF3eiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/TfY78A2jKcQhNSY0Eo/giphy.gif',
    title: 'Error',
    duration: 5000
  },
  // Puedes agregar más tipos personalizados aquí
  warning: {
    gifUrl: 'https://media.giphy.com/media/3o7TKz5N7HYMTMPxIc/giphy.gif',
    title: 'Advertencia',
    duration: 4500
  },
  info: {
    gifUrl: 'https://media.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif',
    title: 'Información',
    duration: 4000
  }
};

// ============================================
// INSTRUCCIONES PARA PERSONALIZAR:
// ============================================
// 1. Para cambiar el GIF:
//    - Ve a https://giphy.com
//    - Busca el GIF que quieras
//    - Haz clic derecho en el GIF > "Copiar dirección de imagen"
//    - Pega la URL en 'gifUrl'
//
// 2. Para usar tu propio GIF:
//    - Guarda tu GIF en: frontend/public/assets/
//    - Usa la ruta: '/assets/tu-gif.gif'
//    Ejemplo: gifUrl: '/assets/exito.gif'
//
// 3. Para cambiar el título:
//    - Modifica el texto en 'title'
//
// 4. Para cambiar la duración:
//    - Cambia el valor en 'duration' (en milisegundos)
//    - 1000 = 1 segundo, 4000 = 4 segundos
// ============================================

export function showSuccessAlert(message) {
  const config = ALERT_CONFIG.success;
  showAlert(message, config, 'success-alert');
}

export function showErrorAlert(message) {
  const config = ALERT_CONFIG.error;
  showAlert(message, config, 'error-alert');
}

export function showWarningAlert(message) {
  const config = ALERT_CONFIG.warning;
  showAlert(message, config, 'warning-alert');
}

export function showInfoAlert(message) {
  const config = ALERT_CONFIG.info;
  showAlert(message, config, 'info-alert');
}

// Función genérica para mostrar alertas
function showAlert(message, config, alertClass) {
  // Crear overlay
  const overlay = document.createElement('div');
  overlay.className = 'alert-overlay';
  
  // Crear contenedor de alerta
  const alertBox = document.createElement('div');
  alertBox.className = `alert-box ${alertClass}`;
  alertBox.innerHTML = `
    <div class="alert-gif">
      <img src="${config.gifUrl}" alt="${config.title}">
    </div>
    <div class="alert-content">
      <h3 class="alert-title">${config.title}</h3>
      <p class="alert-message">${message}</p>
    </div>
    <button class="alert-close-btn">Aceptar</button>
  `;
  
  overlay.appendChild(alertBox);
  document.body.appendChild(overlay);
  
  // Animación de entrada
  setTimeout(() => {
    overlay.classList.add('active');
  }, 10);
  
  // Función para cerrar
  const closeAlert = () => {
    overlay.classList.remove('active');
    setTimeout(() => {
      overlay.remove();
    }, 300);
  };
  
  // Cerrar con botón
  alertBox.querySelector('.alert-close-btn').addEventListener('click', closeAlert);
  
  // Cerrar al hacer clic fuera
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      closeAlert();
    }
  });
  
  // Auto-cerrar según duración configurada
  setTimeout(closeAlert, config.duration);
}

// ============================================
// UTILIDAD: Comprimir imágenes antes de subir
// ============================================
export function compressImage(file, maxWidth = 800, maxHeight = 800, quality = 0.7) {
  return new Promise((resolve, reject) => {
    // Si es PDF, no comprimir
    if (file.type === 'application/pdf') {
      const reader = new FileReader();
      reader.onload = () => {
        resolve({
          filename: file.name,
          mimetype: file.type,
          data: reader.result.split(',')[1]
        });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
      return;
    }

    // Comprimir imágenes
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    const reader = new FileReader();
    
    reader.onload = (e) => {
      img.onload = () => {
        // Calcular nuevas dimensiones manteniendo proporción
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = width * ratio;
          height = height * ratio;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Dibujar imagen redimensionada
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convertir a Base64 con calidad reducida
        const compressedDataUrl = canvas.toDataURL(file.type, quality);
        
        resolve({
          filename: file.name,
          mimetype: file.type,
          data: compressedDataUrl.split(',')[1]
        });
      };
      
      img.onerror = reject;
      img.src = e.target.result;
    };
    
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
