import { createNavbar } from '../components/Navbar.js';
import { createModal, openModal, closeModal } from '../components/Modal.js';
import { apiService } from '../services/apiService.js';
import { authService } from '../services/authService.js';
import { showSuccessAlert, showErrorAlert, compressImage } from '../components/Alert.js';

const EgresosPage = {
  egresos: [],
  actividades: [],

  async render(container) {
    const navbar = createNavbar();
    const content = document.createElement('div');
    content.className = 'container';
    const isPadre = authService.isPadre();
    
    content.innerHTML = `
      <div class="card">
        <div class="card-header">
          <h1 class="card-title">Gestión de Egresos</h1>
          ${!isPadre ? '<button class="btn btn-danger" id="add-egreso-btn">+ Registrar Egreso</button>' : ''}
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
    const isPadre = authService.isPadre();

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
                <th>Fact.</th>
                ${!isPadre ? '<th>Acciones</th>' : ''}
              </tr>
            </thead>
            <tbody>
              ${this.egresos.map(egreso => `
                <tr>
                  <td>${egreso.nombre}</td>
                  <td>${this.formatMoney(egreso.monto)}</td>
                  <td>${this.formatDate(egreso.fecha)}</td>
                  <td>${egreso.actividad?.nombre || '-'}</td>
                  <td>
                    ${egreso.factura ? 
                      `<button class="btn btn-secondary btn-view-fact" data-id="${egreso._id}" title="Ver factura">📄</button>` 
                      : '-'
                    }
                  </td>
                  ${!isPadre ? `
                  <td class="table-actions">
                    <button class="btn btn-secondary btn-edit" data-id="${egreso._id}">Editar</button>
                    <button class="btn btn-danger btn-delete" data-id="${egreso._id}">Eliminar</button>
                  </td>
                  ` : ''}
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

    container.querySelectorAll('.btn-view-fact').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.dataset.id;
        const egreso = this.egresos.find(e => e._id === id);
        if (egreso?.factura) {
          this.viewFactura(egreso.factura);
        }
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
            showErrorAlert('Error al eliminar: ' + error.message);
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
          
          ${egreso?.factura ? `
            <div class="form-group">
              <label class="form-label">Factura Actual</label>
              <div style="display: flex; gap: 0.5rem; align-items: center;">
                <button type="button" class="btn btn-secondary" id="view-factura-btn">
                  📄 Ver Factura
                </button>
                <button type="button" class="btn btn-danger" id="remove-factura-btn">
                  🗑️ Eliminar
                </button>
              </div>
              <small style="color: var(--text-light); display: block; margin-top: 0.5rem;">
                ${egreso.factura.filename}
              </small>
            </div>
          ` : ''}
          
          <div class="form-group">
            <label class="form-label" for="factura">
              ${egreso?.factura ? 'Cambiar Factura' : 'Agregar Factura'} (opcional)
            </label>
            <input 
              type="file" 
              id="factura" 
              class="form-input"
              accept="image/*,application/pdf"
            >
            <small style="color: var(--text-light); display: block; margin-top: 0.5rem;">
              Formatos: JPG, PNG, PDF (máx. 5MB)
            </small>
            <div id="preview-container" class="mt-2" style="display: none;">
              <img id="preview-image" style="max-width: 200px; max-height: 200px; border-radius: var(--radius); border: 1px solid var(--border-color);">
              <p id="preview-filename" style="margin-top: 0.5rem; font-size: 0.875rem; color: var(--text-light);"></p>
            </div>
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
    let removeFactura = false;
    let newFacturaData = null;

    // Ver factura existente
    if (egreso?.factura) {
      modal.querySelector('#view-factura-btn')?.addEventListener('click', () => {
        this.viewFactura(egreso.factura);
      });

      modal.querySelector('#remove-factura-btn')?.addEventListener('click', () => {
        if (confirm('¿Eliminar la factura actual?')) {
          removeFactura = true;
          modal.querySelector('#view-factura-btn').parentElement.parentElement.style.display = 'none';
        }
      });
    }

    // Manejar nueva factura
    const facturaInput = form.querySelector('#factura');
    const previewContainer = form.querySelector('#preview-container');
    const previewImage = form.querySelector('#preview-image');
    const previewFilename = form.querySelector('#preview-filename');

    facturaInput?.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) {
        previewContainer.style.display = 'none';
        newFacturaData = null;
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        showErrorAlert('El archivo es muy grande. Máximo 5MB.');
        facturaInput.value = '';
        return;
      }

      try {
        // Comprimir imagen antes de enviar
        newFacturaData = await compressImage(file);

        previewContainer.style.display = 'block';
        previewFilename.textContent = `${file.name} (comprimida)`;
        
        if (file.type.startsWith('image/')) {
          previewImage.src = `data:${newFacturaData.mimetype};base64,${newFacturaData.data}`;
          previewImage.style.display = 'block';
        } else {
          previewImage.style.display = 'none';
        }
      } catch (error) {
        showErrorAlert('Error al procesar el archivo');
        facturaInput.value = '';
      }
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const data = {
        nombre: form.nombre.value.trim(),
        monto: parseFloat(form.monto.value),
        fecha: form.fecha.value,
        actividad: form.actividad.value || null,
        descripcion: form.descripcion.value.trim()
      };

      // Manejar factura
      if (removeFactura) {
        data.factura = null;
      } else if (newFacturaData) {
        data.factura = newFacturaData;
      }

      try {
        if (isEdit) {
          await apiService.updateEgreso(egreso._id, data);
        } else {
          await apiService.createEgreso(data);
        }
        
        this.egresos = await apiService.getEgresos();
        this.renderTable(document.querySelector('.container'));
        closeModal(modal);
        showSuccessAlert(isEdit ? 'Egreso actualizado exitosamente' : 'Egreso registrado exitosamente');
      } catch (error) {
        showErrorAlert(error.message);
      }
    });

    modal.querySelector('#cancel-btn').addEventListener('click', () => {
      closeModal(modal);
    });
  },

  viewFactura(factura) {
    const dataUrl = `data:${factura.mimetype};base64,${factura.data}`;
    
    const modal = createModal(
      'Ver Factura',
      `
        <div style="text-align: center;">
          <p style="margin-bottom: 1rem; color: var(--text-light);">
            <strong>Archivo:</strong> ${factura.filename}
          </p>
          ${factura.mimetype.startsWith('image/') ? 
            `<img src="${dataUrl}" style="max-width: 100%; max-height: 70vh; border-radius: var(--radius);">` :
            `<embed src="${dataUrl}" type="${factura.mimetype}" style="width: 100%; height: 70vh;" />`
          }
          <div class="btn-group" style="margin-top: 1.5rem;">
            <a href="${dataUrl}" download="${factura.filename}" class="btn btn-danger">
              💾 Descargar
            </a>
            <button type="button" class="btn btn-secondary" id="close-viewer-btn">Cerrar</button>
          </div>
        </div>
      `
    );

    openModal(modal);

    modal.querySelector('#close-viewer-btn').addEventListener('click', () => {
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
