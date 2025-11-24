import { createNavbar } from '../components/Navbar.js';
import { createModal, openModal, closeModal } from '../components/Modal.js';
import { apiService } from '../services/apiService.js';

const AlumnosPage = {
  alumnos: [],

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
      this.alumnos = await apiService.getAlumnos();
      this.renderTable(content);
    } catch (error) {
      content.querySelector('.card').innerHTML = `
        <div class="alert alert-error">
          Error al cargar alumnos: ${error.message}
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
        <div class="table-container">
          <table class="table">
            <thead>
              <tr>
                <th>Nombre Completo</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              ${this.alumnos.map(alumno => `
                <tr>
                  <td>${alumno.nombreCompleto}</td>
                  <td>
                    <span class="badge ${alumno.activo ? 'badge-success' : 'badge-danger'}">
                      ${alumno.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td class="table-actions">
                    <button class="btn btn-secondary btn-edit" data-id="${alumno._id}">Editar</button>
                    <button class="btn btn-danger btn-delete" data-id="${alumno._id}">Eliminar</button>
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
            this.alumnos = await apiService.getAlumnos();
            this.renderTable(container);
          } catch (error) {
            alert('Error al eliminar: ' + error.message);
          }
        }
      });
    });

    container.querySelector('#add-alumno-btn')?.addEventListener('click', () => {
      this.showAlumnoModal();
    });
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
        
        this.alumnos = await apiService.getAlumnos();
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
