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
      <div class="dashboard-header">
        <img src="/assets/logo.png" alt="Logo Unidad Educativa" class="dashboard-logo">
        <h1>Dashboard - Tesorería 8vo C</h1>
      </div>
      
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
        <h2 class="card-title mb-2">© Matías Mosquera</h2>
        <p>Para el amor de mi vida.</p>
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
