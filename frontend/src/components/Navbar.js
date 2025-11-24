import { router } from '../router.js';
import { authService } from '../services/authService.js';

export function createNavbar() {
  const user = authService.getUser();
  const currentPath = window.location.pathname;

  const navbar = document.createElement('nav');
  navbar.className = 'navbar';
  navbar.innerHTML = `
    <div class="navbar-content">
      <div class="navbar-brand">Tesorería 8vo C</div>
      <div class="navbar-menu">
        <a href="/dashboard" class="navbar-link ${currentPath === '/dashboard' ? 'active' : ''}" data-link>Dashboard</a>
        <a href="/alumnos" class="navbar-link ${currentPath === '/alumnos' ? 'active' : ''}" data-link>Alumnos</a>
        <a href="/actividades" class="navbar-link ${currentPath === '/actividades' ? 'active' : ''}" data-link>Actividades</a>
        <a href="/pagos" class="navbar-link ${currentPath === '/pagos' ? 'active' : ''}" data-link>Pagos</a>
        <a href="/egresos" class="navbar-link ${currentPath === '/egresos' ? 'active' : ''}" data-link>Egresos</a>
        <a href="/reportes" class="navbar-link ${currentPath === '/reportes' ? 'active' : ''}" data-link>Reportes</a>
      </div>
      <div class="navbar-user">
        <span>${user?.nombre || 'Usuario'}</span>
        <button class="btn btn-secondary" id="logout-btn">Cerrar sesión</button>
      </div>
    </div>
  `;

  // Event listeners.
  navbar.querySelectorAll('[data-link]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      router.navigate(e.target.getAttribute('href'));
    });
  });

  navbar.querySelector('#logout-btn').addEventListener('click', () => {
    authService.logout();
    router.navigate('/login');
  });

  return navbar;
}
