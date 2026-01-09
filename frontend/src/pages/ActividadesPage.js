import { createNavbar } from '../components/Navbar.js';
import { createModal, openModal, closeModal } from '../components/Modal.js';
import { apiService } from '../services/apiService.js';

const ActividadesPage = {
  actividades: [],

  async render(container) {
    const navbar = createNavbar();
    const content = document.createElement('div');
    content.className = 'container';
    content.innerHTML = `
      <div class="card">
        <div class="card-header">
          <h1 class="card-title">Gestión de Actividades</h1>
          <button class="btn btn-primary" id="add-actividad-btn">+ Nueva Actividad</button>
        </div>
        <div class="loading">
          <div class="spinner"></div>
        </div>
      </div>
    `;

    container.appendChild(navbar);
    container.appendChild(content);

    try {
      this.actividades = await apiService.getActividades();
      this.renderTable(content);
    } catch (error) {
      content.querySelector('.card').innerHTML = `
        <div class="alert alert-error">
          Error al cargar actividades: ${error.message}
        </div>
      `;
    }

    content.querySelector('#add-actividad-btn')?.addEventListener('click', () => {
      this.showActividadModal();
    });
  },

  renderTable(container) {
    const card = container.querySelector('.card');
    const headerHTML = card.querySelector('.card-header').outerHTML;

    if (this.actividades.length === 0) {
      card.innerHTML = `
        ${headerHTML}
        <div class="empty-state">
          <div class="empty-state-icon">🎯</div>
          <p>No hay actividades registradas</p>
        </div>
      `;
    } else {
      card.innerHTML = `
        ${headerHTML}
        <div class="table-container">
          <table class="table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Fecha</th>
                <th>Cuota</th>
                <th>Total</th>
                <th>Fecha Máx. Pago</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              ${this.actividades.map(actividad => `
                <tr>
                  <td>${actividad.nombre}</td>
                  <td>${this.formatDate(actividad.fecha)}</td>
                  <td>${actividad.requiereCuota === false ? '<span class="badge badge-secondary">No Aplica</span>' : this.formatMoney(actividad.cuotaIndividual)}</td>
                  <td>${actividad.requiereCuota === false ? '<span class="badge badge-secondary">No Aplica</span>' : this.formatMoney(actividad.totalActividad || 0)}</td>
                  <td>${this.formatDate(actividad.fechaMaximaPago)}</td>
                  <td>
                    <span class="badge ${actividad.activa ? 'badge-success' : 'badge-danger'}">
                      ${actividad.activa ? 'Activa' : 'Inactiva'}
                    </span>
                  </td>
                  <td class="table-actions">
                    <button class="btn btn-secondary btn-edit" data-id="${actividad._id}">Editar</button>
                    <button class="btn btn-danger btn-delete" data-id="${actividad._id}">Eliminar</button>
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
        const actividad = this.actividades.find(a => a._id === id);
        this.showActividadModal(actividad);
      });
    });

    container.querySelectorAll('.btn-delete').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.target.dataset.id;
        if (confirm('¿Estás segura de eliminar esta actividad?')) {
          try {
            await apiService.deleteActividad(id);
            this.actividades = await apiService.getActividades();
            this.renderTable(container);
          } catch (error) {
            alert('Error al eliminar: ' + error.message);
          }
        }
      });
    });

    container.querySelector('#add-actividad-btn')?.addEventListener('click', () => {
      this.showActividadModal();
    });
  },

  showActividadModal(actividad = null) {
    const isEdit = !!actividad;
    const requiereCuota = actividad?.requiereCuota !== false;
    
    const modal = createModal(
      isEdit ? 'Editar Actividad' : 'Nueva Actividad',
      `
        <form id="actividad-form">
          <div class="form-group">
            <label class="form-label" for="nombre">Nombre de la Actividad</label>
            <input 
              type="text" 
              id="nombre" 
              class="form-input" 
              value="${actividad?.nombre || ''}"
              required
            >
          </div>
          <div class="form-group">
            <label class="form-label" for="fecha">Fecha de la Actividad</label>
            <input 
              type="date" 
              id="fecha" 
              class="form-input" 
              value="${actividad ? actividad.fecha.split('T')[0] : ''}"
              required
            >
          </div>
          <div class="form-group">
            <label class="form-label" style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
              <input 
                type="checkbox" 
                id="requiereCuota"
                ${requiereCuota ? 'checked' : ''}
              >
              Esta actividad requiere cuota individual de los alumnos
            </label>
          </div>
          <div id="cuota-fields" style="${requiereCuota ? '' : 'display: none;'}">
            <div class="form-group">
              <label class="form-label" for="cuotaIndividual">Cuota Individual ($)</label>
              <input 
                type="number" 
                id="cuotaIndividual" 
                class="form-input" 
                min="0"
                step="0.01"
                value="${actividad?.cuotaIndividual || ''}"
              >
            </div>
            <div class="form-group">
              <label class="form-label" for="totalActividad">Total de la Actividad ($)</label>
              <input 
                type="number" 
                id="totalActividad" 
                class="form-input" 
                min="0"
                step="0.01"
                value="${actividad?.totalActividad || ''}"
                readonly
                style="background-color: var(--bg-light); cursor: not-allowed;"
              >
              <small class="text-light" id="calc-info">Se calculará automáticamente (Cuota × Número de alumnos)</small>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label" for="fechaMaximaPago">Fecha Máxima de Pago</label>
            <input 
              type="date" 
              id="fechaMaximaPago" 
              class="form-input" 
              value="${actividad ? actividad.fechaMaximaPago.split('T')[0] : ''}"
              required
            >
          </div>
          <div class="form-group">
            <label class="form-label" for="descripcion">Descripción (opcional)</label>
            <textarea 
              id="descripcion" 
              class="form-textarea"
            >${actividad?.descripcion || ''}</textarea>
          </div>
          <div class="form-group">
            <label class="form-label">
              <input 
                type="checkbox" 
                id="activa"
                ${actividad?.activa !== false ? 'checked' : ''}
              >
              Actividad activa
            </label>
          </div>
          <div class="btn-group">
            <button type="submit" class="btn btn-primary">
              ${isEdit ? 'Actualizar' : 'Crear'}
            </button>
            <button type="button" class="btn btn-secondary" id="cancel-btn">Cancelar</button>
          </div>
        </form>
      `
    );

    openModal(modal);

    const form = modal.querySelector('#actividad-form');
    const requiereCuotaCheckbox = form.querySelector('#requiereCuota');
    const cuotaFields = form.querySelector('#cuota-fields');
    const cuotaInput = form.querySelector('#cuotaIndividual');
    const totalInput = form.querySelector('#totalActividad');
    const calcInfo = form.querySelector('#calc-info');

    // Mostrar/ocultar campos de cuota según checkbox
    requiereCuotaCheckbox.addEventListener('change', () => {
      if (requiereCuotaCheckbox.checked) {
        cuotaFields.style.display = '';
        cuotaInput.required = true;
      } else {
        cuotaFields.style.display = 'none';
        cuotaInput.required = false;
        cuotaInput.value = '';
        totalInput.value = '';
      }
    });

    // Función para calcular el total automáticamente
    const calcularTotal = async () => {
      const cuota = parseFloat(cuotaInput.value) || 0;
      
      if (cuota > 0) {
        try {
          // Obtener número de alumnos activos
          const alumnos = await apiService.getAlumnos();
          const numAlumnosActivos = alumnos.filter(a => a.activo).length;
          
          const total = cuota * numAlumnosActivos;
          totalInput.value = total.toFixed(2);
          calcInfo.textContent = `Calculado: $${cuota.toFixed(2)} × ${numAlumnosActivos} alumnos = $${total.toFixed(2)}`;
        } catch (error) {
          calcInfo.textContent = 'Error al calcular total';
        }
      } else {
        totalInput.value = '';
        calcInfo.textContent = 'Se calculará automáticamente (Cuota × Número de alumnos)';
      }
    };

    // Calcular al cargar si hay valor inicial
    if (cuotaInput.value) {
      calcularTotal();
    }

    // Calcular cuando cambia la cuota
    cuotaInput.addEventListener('input', calcularTotal);

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const requiereCuotaValue = form.requiereCuota.checked;
      
      const data = {
        nombre: form.nombre.value.trim(),
        fecha: form.fecha.value,
        requiereCuota: requiereCuotaValue,
        cuotaIndividual: requiereCuotaValue ? parseFloat(form.cuotaIndividual.value) : 0,
        totalActividad: requiereCuotaValue ? parseFloat(form.totalActividad.value) : 0,
        fechaMaximaPago: form.fechaMaximaPago.value,
        descripcion: form.descripcion.value.trim(),
        activa: form.activa.checked
      };

      try {
        if (isEdit) {
          await apiService.updateActividad(actividad._id, data);
        } else {
          await apiService.createActividad(data);
        }
        
        this.actividades = await apiService.getActividades();
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

export default ActividadesPage;
