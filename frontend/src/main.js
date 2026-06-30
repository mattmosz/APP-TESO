import { router } from './router.js';
import { authService } from './services/authService.js';

document.addEventListener('DOMContentLoaded', () => {
  const path = window.location.pathname;

  if (path === '/acceso-padres') {
    router.loadRoute();
    return;
  }

  if (authService.getToken()) {
    router.navigate('/dashboard');
  } else {
    router.navigate('/login');
  }
});
