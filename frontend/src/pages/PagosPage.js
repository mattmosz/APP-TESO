import { createNavbar } from '../components/Navbar.js';
import { createModal, openModal, closeModal } from '../components/Modal.js';
import { apiService } from '../services/apiService.js';

const PagosPage = {
  pagos: [],
  alumnos: [],
  actividades: [],

  async render(container) {
    const navbar = createNavbar();
    const content = document.createElement('div');
    content.className = 'container';
    content.innerHTML = `
      <div class="card">
        <div class="card-header">
          <h1 class="card-title">Gestión de Pagos</h1>
          <button class="btn btn-success" id="add-pago-btn">+ Registrar Pago</button>
        </div>
        <div class="loading">
          <div class="spinner"></div>
        </div>
      </div>
    `;

    container.appendChild(navbar);
    container.appendChild(content);

    try {
      [this.pagos, this.alumnos, this.actividades] = await Promise.all([
        apiService.getPagos(),
        apiService.getAlumnos(),
        apiService.getActividades()
      ]);
      this.renderTable(content);
    } catch (error) {
      content.querySelector('.card').innerHTML = `
        <div class="alert alert-error">
          Error al cargar pagos: ${error.message}
        </div>
      `;
    }

    content.querySelector('#add-pago-btn')?.addEventListener('click', () => {
      this.showPagoModal();
    });
  },

  renderTable(container) {
    const card = container.querySelector('.card');
    const headerHTML = card.querySelector('.card-header').outerHTML;

    if (this.pagos.length === 0) {
      card.innerHTML = `
        ${headerHTML}
        <div class="empty-state">
          <div class="empty-state-icon">💵</div>
          <p>No hay pagos registrados</p>
        </div>
      `;
    } else {
      // Agrupar pagos por actividad
      const pagosPorActividad = {};
      this.pagos.forEach(pago => {
        const actividadId = pago.actividad?._id || 'sin-actividad';
        const actividadNombre = pago.actividad?.nombre || 'Sin actividad';
        
        if (!pagosPorActividad[actividadId]) {
          pagosPorActividad[actividadId] = {
            nombre: actividadNombre,
            pagos: [],
            total: 0
          };
        }
        pagosPorActividad[actividadId].pagos.push(pago);
        pagosPorActividad[actividadId].total += pago.monto;
      });

      // Ordenar pagos dentro de cada actividad alfabéticamente
      Object.values(pagosPorActividad).forEach(grupo => {
        grupo.pagos.sort((a, b) => {
          const nombreA = a.alumno?.nombreCompleto || '';
          const nombreB = b.alumno?.nombreCompleto || '';
          return nombreA.localeCompare(nombreB);
        });
      });

      card.innerHTML = `
        ${headerHTML}
        <div class="accordion-container">
          ${Object.entries(pagosPorActividad).map(([actividadId, grupo]) => `
            <div class="accordion-item" data-actividad="${actividadId}">
              <div class="accordion-header" onclick="this.parentElement.classList.toggle('active')">
                <div class="accordion-title">
                  <span class="accordion-arrow">▶</span>
                  <strong>${grupo.nombre}</strong>
                  <span class="badge badge-success">${grupo.pagos.length} pago(s)</span>
                </div>
                <div class="accordion-summary">
                  <strong>Total recaudado:</strong> ${this.formatMoney(grupo.total)}
                </div>
              </div>
              <div class="accordion-content">
                <div class="table-container">
                  <table class="table">
                    <thead>
                      <tr>
                        <th>Alumno</th>
                        <th>Monto</th>
                        <th>Fecha de Pago</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${grupo.pagos.map(pago => `
                        <tr>
                          <td>${pago.alumno?.nombreCompleto || 'N/A'}</td>
                          <td>${this.formatMoney(pago.monto)}</td>
                          <td>${this.formatDate(pago.fechaPago)}</td>
                          <td class="table-actions">
                            <button class="btn btn-secondary btn-edit" data-id="${pago._id}">Editar</button>
                            <button class="btn btn-danger btn-delete" data-id="${pago._id}">Eliminar</button>
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
      `;
    }

    // Event listeners
    container.querySelectorAll('.btn-edit').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.dataset.id;
        const pago = this.pagos.find(p => p._id === id);
        this.showPagoModal(pago);
      });
    });

    container.querySelectorAll('.btn-delete').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.target.dataset.id;
        if (confirm('¿Estás segura de eliminar este pago?')) {
          try {
            await apiService.deletePago(id);
            this.pagos = await apiService.getPagos();
            this.renderTable(container);
          } catch (error) {
            alert('Error al eliminar: ' + error.message);
          }
        }
      });
    });

    container.querySelector('#add-pago-btn')?.addEventListener('click', () => {
      this.showPagoModal();
    });
  },

  showPagoModal(pago = null) {
    const isEdit = !!pago;
    const modal = createModal(
      isEdit ? 'Editar Pago' : 'Registrar Nuevo Pago',
      `
        <form id="pago-form">
          <div class="form-group">
            <label class="form-label" for="alumno">Alumno</label>
            <select 
              id="alumno" 
              class="form-select" 
              required
              ${isEdit ? 'disabled' : ''}
            >
              <option value="">Seleccionar alumno...</option>
              ${this.alumnos
                .filter(a => a.activo)
                .map(alumno => `
                  <option value="${alumno._id}" ${pago?.alumno?._id === alumno._id ? 'selected' : ''}>
                    ${alumno.nombreCompleto}
                  </option>
                `).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label" for="actividad">Actividad</label>
            <select 
              id="actividad" 
              class="form-select" 
              required
              ${isEdit ? 'disabled' : ''}
            >
              <option value="">Seleccionar actividad...</option>
              ${this.actividades
                .filter(a => a.activa)
                .map(actividad => `
                  <option value="${actividad._id}" data-cuota="${actividad.cuotaIndividual}" ${pago?.actividad?._id === actividad._id ? 'selected' : ''}>
                    ${actividad.nombre} - ${this.formatMoney(actividad.cuotaIndividual)}
                  </option>
                `).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label" for="monto">Monto ($)</label>
            <input 
              type="number" 
              id="monto" 
              class="form-input" 
              min="0"
              step="0.01"
              value="${pago?.monto || ''}"
              required
            >
          </div>
          <div class="form-group">
            <label class="form-label" for="fechaPago">Fecha de Pago</label>
            <input 
              type="date" 
              id="fechaPago" 
              class="form-input" 
              value="${pago ? pago.fechaPago.split('T')[0] : new Date().toISOString().split('T')[0]}"
              required
            >
          </div>
          <div class="form-group">
            <label class="form-label" for="observaciones">Observaciones (opcional)</label>
            <textarea 
              id="observaciones" 
              class="form-textarea"
            >${pago?.observaciones || ''}</textarea>
          </div>
          <div class="btn-group">
            <button type="submit" class="btn btn-success">
              ${isEdit ? 'Actualizar' : 'Registrar'}
            </button>
            <button type="button" class="btn btn-secondary" id="cancel-btn">Cancelar</button>
          </div>
        </form>
      `
    );

    openModal(modal);

    const form = modal.querySelector('#pago-form');
    const actividadSelect = form.querySelector('#actividad');
    const montoInput = form.querySelector('#monto');

    // Auto-completar monto al seleccionar actividad
    if (!isEdit) {
      actividadSelect.addEventListener('change', (e) => {
        const selectedOption = e.target.options[e.target.selectedIndex];
        const cuota = selectedOption.dataset.cuota;
        if (cuota) {
          montoInput.value = cuota;
        }
      });
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const data = {
        alumno: form.alumno.value,
        actividad: form.actividad.value,
        monto: parseFloat(form.monto.value),
        fechaPago: form.fechaPago.value,
        observaciones: form.observaciones.value.trim()
      };

      try {
        if (isEdit) {
          await apiService.updatePago(pago._id, data);
        } else {
          await apiService.createPago(data);
        }
        
        this.pagos = await apiService.getPagos();
        this.renderTable(document.querySelector('.container'));
        closeModal(modal);
      } catch (error) {
        alert('Error: ' + error.message);
      }
    });

    modal.querySelector('#cancel-btn').addEventListener('click', () => {
      closeModal(modal);
    });
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

export default PagosPage;
