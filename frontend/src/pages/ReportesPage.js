import { createNavbar } from '../components/Navbar.js';
import { apiService } from '../services/apiService.js';

const ReportesPage = {
  deudores: [],

  async render(container) {
    const navbar = createNavbar();
    const content = document.createElement('div');
    content.className = 'container';
    content.innerHTML = `
      <div class="card">
        <div class="card-header">
          <h1 class="card-title">Reportes y Estadísticas</h1>
        </div>
        <div class="loading">
          <div class="spinner"></div>
        </div>
      </div>
    `;

    container.appendChild(navbar);
    container.appendChild(content);

    try {
      this.deudores = await apiService.getDeudores();
      this.renderReports(content);
    } catch (error) {
      content.querySelector('.card').innerHTML = `
        <div class="alert alert-error">
          Error al cargar reportes: ${error.message}
        </div>
      `;
    }
  },

  renderReports(container) {
    const card = container.querySelector('.card');
    const headerHTML = card.querySelector('.card-header').outerHTML;

    const totalDeudores = this.deudores.reduce((sum, d) => sum + d.cantidadDeudores, 0);
    const montoTotalDeudas = this.deudores.reduce(
      (sum, d) => sum + (d.actividad.cuotaIndividual * d.cantidadDeudores),
      0
    );

    card.innerHTML = `
      ${headerHTML}
      
      ${this.deudores.length === 0 ? `
        <div class="empty-state">
          <div class="empty-state-icon">✅</div>
          <p>¡Excelente! No hay deudores registrados</p>
        </div>
      ` : `
        <div class="alert alert-warning mb-3">
          <strong>Total de Deudores:</strong> ${totalDeudores} alumno(s)<br>
          <strong>Monto Total en Deudas:</strong> ${this.formatMoney(montoTotalDeudas)}
        </div>

        <div class="accordion-container">
          ${this.deudores.map(reporte => `
            <div class="accordion-item" data-actividad="${reporte.actividad.id}">
              <div class="accordion-header" onclick="this.parentElement.classList.toggle('active')">
                <div class="accordion-title">
                  <span class="accordion-arrow">▶</span>
                  <strong>${reporte.actividad.nombre}</strong>
                  <span class="badge badge-warning">${reporte.cantidadDeudores} deudor(es)</span>
                </div>
                <div class="accordion-summary">
                  <strong>Recaudado:</strong> ${this.formatMoney(reporte.actividad.totalRecaudado)} de ${this.formatMoney(reporte.actividad.totalActividad)} 
                  (${reporte.actividad.porcentajeCompletado}%) | 
                  <strong>Falta:</strong> ${this.formatMoney(reporte.actividad.faltante)}
                </div>
              </div>
              <div class="accordion-content">
                <p class="text-light mb-2" style="padding: 1rem 1.5rem; background: var(--bg-light);">
                  <strong>Cuota individual:</strong> ${this.formatMoney(reporte.actividad.cuotaIndividual)} |
                  <strong>Fecha límite:</strong> ${this.formatDate(reporte.actividad.fechaMaximaPago)}
                </p>
                <div class="table-container">
                  <table class="table">
                    <thead>
                      <tr>
                        <th>Alumno</th>
                        <th>Pagado</th>
                        <th>Pendiente</th>
                        <th>Progreso</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${reporte.deudores.map(alumno => `
                        <tr>
                          <td>${alumno.nombreCompleto}</td>
                          <td>${this.formatMoney(alumno.totalPagado)}</td>
                          <td>${this.formatMoney(alumno.montoPendiente)}</td>
                          <td>
                            <span class="badge ${alumno.porcentajePagado > 0 ? 'badge-warning' : 'badge-danger'}">
                              ${alumno.porcentajePagado}%
                            </span>
                          </td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      `}
    `;
  },

  formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('es-BO');
  },

  formatMoney(amount) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }
};

export default ReportesPage;
