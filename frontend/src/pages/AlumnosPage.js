import { createNavbar } from '../components/Navbar.js';
import { createModal, openModal, closeModal } from '../components/Modal.js';
import { apiService } from '../services/apiService.js';

const AlumnosPage = {
  alumnos: [],
  actividades: [],
  pagos: [],

  async render(container) {
    const navbar = createNavbar();
    const content = document.createElement('div');
    content.className = 'container';
    content.innerHTML = `
      <div class="card">
        <div class="card-header">
          <h1 class="card-title">Gestión de Alumnos</h1>
          <button class="btn btn-primary" id="add-alumno-btn">+ Nuevo Alumno</button>
        </div>
        <div class="loading">
          <div class="spinner"></div>
        </div>
      </div>
    `;

    container.appendChild(navbar);
    container.appendChild(content);

    try {
      // Cargar datos en paralelo
      [this.alumnos, this.actividades, this.pagos] = await Promise.all([
        apiService.getAlumnos(),
        apiService.getActividades(),
        apiService.getPagos()
      ]);
      this.renderTable(content);
    } catch (error) {
      content.querySelector('.card').innerHTML = `
        <div class="alert alert-error">
          Error al cargar datos: ${error.message}
        </div>
      `;
    }

    content.querySelector('#add-alumno-btn')?.addEventListener('click', () => {
      this.showAlumnoModal();
    });
  },

  renderTable(container) {
    const card = container.querySelector('.card');
    const headerHTML = card.querySelector('.card-header').outerHTML;

    if (this.alumnos.length === 0) {
      card.innerHTML = `
        ${headerHTML}
        <div class="empty-state">
          <div class="empty-state-icon">👨‍🎓</div>
          <p>No hay alumnos registrados</p>
        </div>
      `;
    } else {
      card.innerHTML = `
        ${headerHTML}
        <div class="alumnos-list">
          ${this.alumnos.map(alumno => this.renderAlumnoCard(alumno)).join('')}
        </div>
      `;
    }

    // Event listeners para editar y eliminar
    container.querySelectorAll('.btn-edit').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.dataset.id;
        const alumno = this.alumnos.find(a => a._id === id);
        this.showAlumnoModal(alumno);
      });
    });

    container.querySelectorAll('.btn-delete').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.target.dataset.id;
        if (confirm('¿Estás segura de eliminar este alumno?')) {
          try {
            await apiService.deleteAlumno(id);
            [this.alumnos, this.pagos] = await Promise.all([
              apiService.getAlumnos(),
              apiService.getPagos()
            ]);
            this.renderTable(container);
          } catch (error) {
            alert('Error al eliminar: ' + error.message);
          }
        }
      });
    });

    // Event listeners para acordeones
    container.querySelectorAll('.alumno-header').forEach(header => {
      header.addEventListener('click', (e) => {
        const card = e.currentTarget.closest('.alumno-card');
        const content = card.querySelector('.alumno-content');
        const icon = e.currentTarget.querySelector('.accordion-icon');
        
        content.classList.toggle('active');
        icon.textContent = content.classList.contains('active') ? '▼' : '▶';
      });
    });

    container.querySelector('#add-alumno-btn')?.addEventListener('click', () => {
      this.showAlumnoModal();
    });
  },

  renderAlumnoCard(alumno) {
    const estadoAlumno = this.getEstadoAlumno(alumno);
    
    return `
      <div class="alumno-card">
        <div class="alumno-header">
          <div class="alumno-header-left">
            <span class="accordion-icon">▶</span>
            <h3>${alumno.nombreCompleto}</h3>
            <span class="badge ${alumno.activo ? 'badge-success' : 'badge-danger'}">
              ${alumno.activo ? 'Activo' : 'Inactivo'}
            </span>
          </div>
          <div class="alumno-header-right">
            <span class="alumno-resumen">
              <strong>Pagado:</strong> $${estadoAlumno.totalPagado.toFixed(2)} | 
              <strong>Pendiente:</strong> $${estadoAlumno.totalPendiente.toFixed(2)}
            </span>
            <button class="btn btn-secondary btn-edit" data-id="${alumno._id}" onclick="event.stopPropagation()">Editar</button>
            <button class="btn btn-danger btn-delete" data-id="${alumno._id}" onclick="event.stopPropagation()">Eliminar</button>
          </div>
        </div>
        <div class="alumno-content">
          ${this.renderActividadesAlumno(alumno, estadoAlumno)}
        </div>
      </div>
    `;
  },

  getEstadoAlumno(alumno) {
    const actividadesActivas = this.actividades.filter(act => act.activa);
    let totalPagado = 0;
    let totalPendiente = 0;
    const detalleActividades = [];

    actividadesActivas.forEach(actividad => {
      const pagosActividad = this.pagos.filter(p => 
        p.alumno._id === alumno._id && p.actividad._id === actividad._id
      );
      
      const pagado = pagosActividad.reduce((sum, p) => sum + p.monto, 0);
      const pendiente = Math.max(0, actividad.cuotaIndividual - pagado);
      
      totalPagado += pagado;
      totalPendiente += pendiente;
      
      detalleActividades.push({
        actividad,
        pagado,
        pendiente,
        pagos: pagosActividad
      });
    });

    return {
      totalPagado,
      totalPendiente,
      detalleActividades
    };
  },

  renderActividadesAlumno(alumno, estadoAlumno) {
    if (estadoAlumno.detalleActividades.length === 0) {
      return `
        <div class="empty-state-small">
          <p>No hay actividades activas registradas</p>
        </div>
      `;
    }

    return `
      <div class="actividades-container">
        ${estadoAlumno.detalleActividades.map(detalle => `
          <div class="actividad-detalle">
            <div class="actividad-detalle-header">
              <h4>${detalle.actividad.nombre}</h4>
              <span class="actividad-fecha">${new Date(detalle.actividad.fecha).toLocaleDateString('es-BO')}</span>
            </div>
            <div class="actividad-detalle-body">
              <div class="actividad-stats">
                <div class="actividad-stat-item">
                  <span class="actividad-stat-label">Cuota:</span>
                  <span class="actividad-stat-value">$${detalle.actividad.cuotaIndividual.toFixed(2)}</span>
                </div>
                <div class="actividad-stat-item ${detalle.pagado > 0 ? 'stat-success' : ''}">
                  <span class="actividad-stat-label">Pagado:</span>
                  <span class="actividad-stat-value">$${detalle.pagado.toFixed(2)}</span>
                </div>
                <div class="actividad-stat-item ${detalle.pendiente > 0 ? 'stat-warning' : 'stat-success'}">
                  <span class="actividad-stat-label">Pendiente:</span>
                  <span class="actividad-stat-value">$${detalle.pendiente.toFixed(2)}</span>
                </div>
              </div>
              ${detalle.pagos.length > 0 ? `
                <div class="pagos-lista">
                  <h5>Pagos realizados:</h5>
                  ${detalle.pagos.map(pago => `
                    <div class="pago-item">
                      <span class="pago-fecha">${new Date(pago.fechaPago).toLocaleDateString('es-BO')}</span>
                      <span class="pago-monto">$${pago.monto.toFixed(2)}</span>
                      ${pago.observaciones ? `<span class="pago-obs">${pago.observaciones}</span>` : ''}
                    </div>
                  `).join('')}
                </div>
              ` : '<p class="no-pagos">Sin pagos registrados</p>'}
            </div>
          </div>
        `).join('')}
      </div>
    `;
  },

  showAlumnoModal(alumno = null) {
    const isEdit = !!alumno;
    const modal = createModal(
      isEdit ? 'Editar Alumno' : 'Nuevo Alumno',
      `
        <form id="alumno-form">
          <div class="form-group">
            <label class="form-label" for="nombreCompleto">Nombre Completo (Apellidos, Nombres)</label>
            <input 
              type="text" 
              id="nombreCompleto" 
              class="form-input" 
              placeholder="Ej: García López, María José"
              value="${alumno?.nombreCompleto || ''}"
              required
            >
          </div>
          <div class="form-group">
            <label class="form-label">
              <input 
                type="checkbox" 
                id="activo"
                ${alumno?.activo !== false ? 'checked' : ''}
              >
              Alumno activo
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

    const form = modal.querySelector('#alumno-form');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const data = {
        nombreCompleto: form.nombreCompleto.value.trim(),
        activo: form.activo.checked
      };

      try {
        if (isEdit) {
          await apiService.updateAlumno(alumno._id, data);
        } else {
          await apiService.createAlumno(data);
        }
        
        [this.alumnos, this.pagos] = await Promise.all([
          apiService.getAlumnos(),
          apiService.getPagos()
        ]);
        this.renderTable(document.querySelector('.container'));
        closeModal(modal);
      } catch (error) {
        alert('Error: ' + error.message);
      }
    });

    modal.querySelector('#cancel-btn').addEventListener('click', () => {
      closeModal(modal);
    });
  }
};

export default AlumnosPage;
