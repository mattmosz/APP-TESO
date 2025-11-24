import { createNavbar } from '../components/Navbar.js';
import { apiService } from '../services/apiService.js';

const DashboardPage = {
  async render(container) {
    const navbar = createNavbar();
    const content = document.createElement('div');
    content.className = 'dashboard container';
    content.innerHTML = `
      <h1 class="mb-3">Dashboard</h1>
      <div class="loading">
        <div class="spinner"></div>
      </div>
    `;

    container.appendChild(navbar);
    container.appendChild(content);

    try {
      const stats = await apiService.getStats();
      this.renderStats(content, stats);
    } catch (error) {
      content.innerHTML = `
        <div class="alert alert-error">
          Error al cargar estadísticas: ${error.message}
        </div>
      `;
    }
  },

  renderStats(container, stats) {
    container.innerHTML = `
      <h1 class="mb-3">Dashboard</h1>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-label">Monto Disponible</div>
          <div class="stat-value ${stats.montoDisponible >= 0 ? 'positive' : 'negative'}">
            ${this.formatMoney(stats.montoDisponible)}
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Total Alumnos</div>
          <div class="stat-value">${stats.numAlumnos}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Actividades Activas</div>
          <div class="stat-value">${stats.numActividades}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Total Ingresos</div>
          <div class="stat-value positive">
            ${this.formatMoney(stats.totalIngresos)}
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Total Egresos</div>
          <div class="stat-value negative">
            ${this.formatMoney(stats.totalEgresos)}
          </div>
        </div>
      </div>

      <div class="card">
        <h2 class="card-title mb-2">Resumen</h2>
        <p>Bienvenida al sistema de tesorería del 8vo C. Utiliza el menú superior para navegar entre las diferentes secciones.</p>
        <div class="mt-3">
          <h3 class="mb-2">Acciones rápidas:</h3>
          <div class="btn-group">
            <a href="/alumnos" class="btn btn-primary" data-link>Gestionar Alumnos</a>
            <a href="/actividades" class="btn btn-primary" data-link>Gestionar Actividades</a>
            <a href="/pagos" class="btn btn-success" data-link>Registrar Pagos</a>
            <a href="/reportes" class="btn btn-secondary" data-link>Ver Reportes</a>
          </div>
        </div>
      </div>
    `;

    // Event listeners para los enlaces
    container.querySelectorAll('[data-link]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const { router } = require('../router.js');
        router.navigate(e.target.getAttribute('href'));
      });
    });
  },

  formatMoney(amount) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }
};

export default DashboardPage;
