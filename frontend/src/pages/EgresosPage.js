import { createNavbar } from '../components/Navbar.js';
import { createModal, openModal, closeModal } from '../components/Modal.js';
import { apiService } from '../services/apiService.js';

const EgresosPage = {
  egresos: [],
  actividades: [],

  async render(container) {
    const navbar = createNavbar();
    const content = document.createElement('div');
    content.className = 'container';
    content.innerHTML = `
      <div class="card">
        <div class="card-header">
          <h1 class="card-title">Gestión de Egresos</h1>
          <button class="btn btn-danger" id="add-egreso-btn">+ Registrar Egreso</button>
        </div>
        <div class="loading">
          <div class="spinner"></div>
        </div>
      </div>
    `;

    container.appendChild(navbar);
    container.appendChild(content);

    try {
      [this.egresos, this.actividades] = await Promise.all([
        apiService.getEgresos(),
        apiService.getActividades()
      ]);
      this.renderTable(content);
    } catch (error) {
      content.querySelector('.card').innerHTML = `
        <div class="alert alert-error">
          Error al cargar egresos: ${error.message}
        </div>
      `;
    }

    content.querySelector('#add-egreso-btn')?.addEventListener('click', () => {
      this.showEgresoModal();
    });
  },

  renderTable(container) {
    const card = container.querySelector('.card');
    const headerHTML = card.querySelector('.card-header').outerHTML;

    const totalEgresos = this.egresos.reduce((sum, e) => sum + e.monto, 0);

    if (this.egresos.length === 0) {
      card.innerHTML = `
        ${headerHTML}
        <div class="empty-state">
          <div class="empty-state-icon">💸</div>
          <p>No hay egresos registrados</p>
        </div>
      `;
    } else {
      card.innerHTML = `
        ${headerHTML}
        <div class="alert alert-info mb-3">
          <strong>Total de Egresos:</strong> ${this.formatMoney(totalEgresos)}
        </div>
        <div class="table-container">
          <table class="table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Monto</th>
                <th>Fecha</th>
                <th>Actividad</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              ${this.egresos.map(egreso => `
                <tr>
                  <td>${egreso.nombre}</td>
                  <td>${this.formatMoney(egreso.monto)}</td>
                  <td>${this.formatDate(egreso.fecha)}</td>
                  <td>${egreso.actividad?.nombre || '-'}</td>
                  <td class="table-actions">
                    <button class="btn btn-secondary btn-edit" data-id="${egreso._id}">Editar</button>
                    <button class="btn btn-danger btn-delete" data-id="${egreso._id}">Eliminar</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    }

    // Event listeners
    container.querySelectorAll('.btn-edit').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.dataset.id;
        const egreso = this.egresos.find(e => e._id === id);
        this.showEgresoModal(egreso);
      });
    });

    container.querySelectorAll('.btn-delete').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.target.dataset.id;
        if (confirm('¿Estás segura de eliminar este egreso?')) {
          try {
            await apiService.deleteEgreso(id);
            this.egresos = await apiService.getEgresos();
            this.renderTable(container);
          } catch (error) {
            alert('Error al eliminar: ' + error.message);
          }
        }
      });
    });

    container.querySelector('#add-egreso-btn')?.addEventListener('click', () => {
      this.showEgresoModal();
    });
  },

  showEgresoModal(egreso = null) {
    const isEdit = !!egreso;
    const modal = createModal(
      isEdit ? 'Editar Egreso' : 'Registrar Nuevo Egreso',
      `
        <form id="egreso-form">
          <div class="form-group">
            <label class="form-label" for="nombre">Nombre del Egreso</label>
            <input 
              type="text" 
              id="nombre" 
              class="form-input" 
              value="${egreso?.nombre || ''}"
              required
            >
          </div>
          <div class="form-group">
            <label class="form-label" for="monto">Monto ($)</label>
            <input 
              type="number" 
              id="monto" 
              class="form-input" 
              min="0"
              step="0.01"
              value="${egreso?.monto || ''}"
              required
            >
          </div>
          <div class="form-group">
            <label class="form-label" for="fecha">Fecha del Egreso</label>
            <input 
              type="date" 
              id="fecha" 
              class="form-input" 
              value="${egreso ? egreso.fecha.split('T')[0] : new Date().toISOString().split('T')[0]}"
              required
            >
          </div>
          <div class="form-group">
            <label class="form-label" for="actividad">Actividad Asociada (opcional)</label>
            <select id="actividad" class="form-select">
              <option value="">Ninguna</option>
              ${this.actividades.map(actividad => `
                <option value="${actividad._id}" ${egreso?.actividad?._id === actividad._id ? 'selected' : ''}>
                  ${actividad.nombre}
                </option>
              `).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label" for="descripcion">Descripción (opcional)</label>
            <textarea 
              id="descripcion" 
              class="form-textarea"
            >${egreso?.descripcion || ''}</textarea>
          </div>
          <div class="btn-group">
            <button type="submit" class="btn btn-danger">
              ${isEdit ? 'Actualizar' : 'Registrar'}
            </button>
            <button type="button" class="btn btn-secondary" id="cancel-btn">Cancelar</button>
          </div>
        </form>
      `
    );

    openModal(modal);

    const form = modal.querySelector('#egreso-form');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const data = {
        nombre: form.nombre.value.trim(),
        monto: parseFloat(form.monto.value),
        fecha: form.fecha.value,
        actividad: form.actividad.value || null,
        descripcion: form.descripcion.value.trim()
      };

      try {
        if (isEdit) {
          await apiService.updateEgreso(egreso._id, data);
        } else {
          await apiService.createEgreso(data);
        }
        
        this.egresos = await apiService.getEgresos();
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

export default EgresosPage;
