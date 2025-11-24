import { router } from './router.js';
import { authService } from './services/authService.js';

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', () => {
  // Verificar si hay token guardado
  const token = authService.getToken();
  
  if (token) {
    // Usuario logueado - ir al dashboard
    router.navigate('/dashboard');
  } else {
    // Usuario no logueado - ir al login
    router.navigate('/login');
  }
});
