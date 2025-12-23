import LoginPage from './pages/LoginPage.js';
import DashboardPage from './pages/DashboardPage.js';
import AlumnosPage from './pages/AlumnosPage.js';
import ActividadesPage from './pages/ActividadesPage.js';
import PagosPage from './pages/PagosPage.js';
import EgresosPage from './pages/EgresosPage.js';
import ReportesPage from './pages/ReportesPage.js';
import POAPage from './pages/POAPage.js';
import { authService } from './services/authService.js';

class Router {
  constructor() {
    this.routes = {
      '/login': LoginPage,
      '/dashboard': DashboardPage,
      '/alumnos': AlumnosPage,
      '/actividades': ActividadesPage,
      '/pagos': PagosPage,
      '/egresos': EgresosPage,
      '/reportes': ReportesPage,
      '/poa': POAPage
    };

    window.addEventListener('popstate', () => {
      this.loadRoute();
    });
  }

  navigate(path) {
    window.history.pushState({}, '', path);
    this.loadRoute();
  }

  loadRoute() {
    const path = window.location.pathname;
    const RouteComponent = this.routes[path] || this.routes['/login'];

    // Proteger rutas privadas
    if (path !== '/login' && !authService.isAuthenticated()) {
      this.navigate('/login');
      return;
    }

    // Si está logueado y va al login, redirigir al dashboard
    if (path === '/login' && authService.isAuthenticated()) {
      this.navigate('/dashboard');
      return;
    }

    // Restringir páginas para padres de familia
    const restrictedForPadres = ['/alumnos', '/actividades', '/pagos', '/poa'];
    if (authService.isPadre() && restrictedForPadres.includes(path)) {
      this.navigate('/dashboard');
      return;
    }

    const app = document.getElementById('app');
    app.innerHTML = '';
    RouteComponent.render(app);
  }
}

export const router = new Router();
