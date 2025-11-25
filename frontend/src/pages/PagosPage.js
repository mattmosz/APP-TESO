import { createNavbar } from '../components/Navbar.js';
import { createModal, openModal, closeModal } from '../components/Modal.js';
import { apiService } from '../services/apiService.js';
import { showSuccessAlert, showErrorAlert } from '../components/Alert.js';

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
                        <th>Comp.</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${grupo.pagos.map(pago => `
                        <tr>
                          <td>${pago.alumno?.nombreCompleto || 'N/A'}</td>
                          <td>${this.formatMoney(pago.monto)}</td>
                          <td>${this.formatDate(pago.fechaPago)}</td>
                          <td>
                            ${pago.comprobante ? 
                              `<button class="btn btn-secondary btn-view-comp" data-id="${pago._id}" title="Ver comprobante">📄</button>` 
                              : '-'
                            }
                          </td>
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

    container.querySelectorAll('.btn-view-comp').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.dataset.id;
        const pago = this.pagos.find(p => p._id === id);
        if (pago?.comprobante) {
          this.viewComprobante(pago.comprobante);
        }
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
            showErrorAlert('Error al eliminar: ' + error.message);
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
    
    // Modo edición: formulario individual como antes
    if (isEdit) {
      this.showEditPagoModal(pago);
      return;
    }

    // Modo creación: selector múltiple de alumnos
    const modal = createModal(
      'Registrar Pagos',
      `
        <form id="pago-form">
          <div class="form-group">
            <label class="form-label" for="actividad">Actividad</label>
            <select 
              id="actividad" 
              class="form-select" 
              required
            >
              <option value="">Seleccionar actividad...</option>
              ${this.actividades
                .filter(a => a.activa)
                .map(actividad => `
                  <option value="${actividad._id}" data-cuota="${actividad.cuotaIndividual}">
                    ${actividad.nombre} - ${this.formatMoney(actividad.cuotaIndividual)}
                  </option>
                `).join('')}
            </select>
          </div>

          <div id="alumnos-section" class="hidden">
            <div class="form-group">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                <label class="form-label">Seleccionar Alumnos</label>
                <div>
                  <button type="button" class="btn btn-secondary" id="select-all-btn" style="padding: 0.5rem 1rem;">
                    Seleccionar Todos
                  </button>
                  <button type="button" class="btn btn-secondary" id="deselect-all-btn" style="padding: 0.5rem 1rem;">
                    Deseleccionar Todos
                  </button>
                </div>
              </div>
              
              <div id="alumnos-list" style="max-height: 300px; overflow-y: auto; border: 1px solid var(--border-color); border-radius: var(--radius); padding: 1rem;">
                <!-- Se llenará dinámicamente -->
              </div>
              
              <div class="mt-2">
                <span id="selected-count" style="color: var(--text-light); font-size: 0.875rem;">
                  0 alumno(s) seleccionado(s)
                </span>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" for="monto">Monto por alumno ($)</label>
              <input 
                type="number" 
                id="monto" 
                class="form-input" 
                min="0"
                step="0.01"
                required
              >
            </div>

            <div class="form-group">
              <label class="form-label" for="fechaPago">Fecha de Pago</label>
              <input 
                type="date" 
                id="fechaPago" 
                class="form-input" 
                value="${new Date().toISOString().split('T')[0]}"
                required
              >
            </div>

            <div class="form-group">
              <label class="form-label" for="observaciones">Observaciones (opcional)</label>
              <textarea 
                id="observaciones" 
                class="form-textarea"
                placeholder="Ej: Pago grupal recibido por..."
              ></textarea>
            </div>

            <div class="form-group">
              <label class="form-label" for="comprobante">Comprobante de Pago (opcional)</label>
              <input 
                type="file" 
                id="comprobante" 
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
          </div>

          <div class="btn-group">
            <button type="submit" class="btn btn-success" id="submit-btn">
              Registrar Pagos
            </button>
            <button type="button" class="btn btn-secondary" id="cancel-btn">Cancelar</button>
          </div>
        </form>
      `
    );

    openModal(modal);

    const form = modal.querySelector('#pago-form');
    const actividadSelect = form.querySelector('#actividad');
    const alumnosSection = form.querySelector('#alumnos-section');
    const alumnosList = form.querySelector('#alumnos-list');
    const montoInput = form.querySelector('#monto');
    const selectedCount = form.querySelector('#selected-count');
    const submitBtn = form.querySelector('#submit-btn');
    const comprobanteInput = form.querySelector('#comprobante');
    const previewContainer = form.querySelector('#preview-container');
    const previewImage = form.querySelector('#preview-image');
    const previewFilename = form.querySelector('#preview-filename');
    
    let comprobanteData = null;

    // Manejar preview del comprobante
    comprobanteInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) {
        previewContainer.style.display = 'none';
        comprobanteData = null;
        return;
      }

      // Validar tamaño (5MB)
      if (file.size > 5 * 1024 * 1024) {
        showErrorAlert('El archivo es muy grande. Máximo 5MB.');
        comprobanteInput.value = '';
        return;
      }

      // Convertir a Base64
      const reader = new FileReader();
      reader.onload = () => {
        comprobanteData = {
          filename: file.name,
          mimetype: file.type,
          data: reader.result.split(',')[1] // Quitar prefijo data:image/...;base64,
        };

        // Mostrar preview
        previewContainer.style.display = 'block';
        previewFilename.textContent = file.name;
        
        if (file.type.startsWith('image/')) {
          previewImage.src = reader.result;
          previewImage.style.display = 'block';
        } else {
          previewImage.style.display = 'none';
        }
      };
      reader.readAsDataURL(file);
    });

    // Cuando se selecciona una actividad, mostrar alumnos
    actividadSelect.addEventListener('change', async (e) => {
      const actividadId = e.target.value;
      
      if (!actividadId) {
        alumnosSection.classList.add('hidden');
        return;
      }

      // Auto-completar monto
      const selectedOption = e.target.options[e.target.selectedIndex];
      const cuota = selectedOption.dataset.cuota;
      if (cuota) {
        montoInput.value = cuota;
      }

      // Obtener pagos existentes de esta actividad
      const pagosActividad = await apiService.getPagosByActividad(actividadId);
      const alumnosConPago = new Map();
      
      pagosActividad.forEach(pago => {
        const alumnoId = pago.alumno._id || pago.alumno;
        const montoExistente = alumnosConPago.get(alumnoId) || 0;
        alumnosConPago.set(alumnoId, montoExistente + pago.monto);
      });

      // Mostrar lista de alumnos con checkboxes
      alumnosList.innerHTML = this.alumnos
        .filter(a => a.activo)
        .map(alumno => {
          const montoPagado = alumnosConPago.get(alumno._id) || 0;
          const cuotaIndividual = parseFloat(cuota);
          const saldoPendiente = cuotaIndividual - montoPagado;
          const porcentaje = Math.round((montoPagado / cuotaIndividual) * 100);
          
          return `
            <div class="alumno-checkbox" style="padding: 0.5rem; border-bottom: 1px solid var(--border-color);">
              <label style="display: flex; align-items: center; cursor: pointer;">
                <input 
                  type="checkbox" 
                  class="alumno-check" 
                  data-alumno-id="${alumno._id}"
                  style="margin-right: 0.75rem; width: 18px; height: 18px; cursor: pointer;"
                >
                <div style="flex: 1;">
                  <strong>${alumno.nombreCompleto}</strong>
                  ${montoPagado > 0 ? `
                    <div style="font-size: 0.875rem; color: var(--text-light); margin-top: 0.25rem;">
                      Pagado: ${this.formatMoney(montoPagado)} (${porcentaje}%) 
                      ${saldoPendiente > 0 ? `| Pendiente: ${this.formatMoney(saldoPendiente)}` : '✓'}
                    </div>
                  ` : ''}
                </div>
              </label>
            </div>
          `;
        }).join('');

      alumnosSection.classList.remove('hidden');

      // Actualizar contador cuando cambian los checkboxes
      const updateCount = () => {
        const checked = alumnosList.querySelectorAll('.alumno-check:checked').length;
        selectedCount.textContent = `${checked} alumno(s) seleccionado(s)`;
        submitBtn.textContent = checked > 0 ? `Registrar ${checked} Pago(s)` : 'Registrar Pagos';
      };

      alumnosList.querySelectorAll('.alumno-check').forEach(checkbox => {
        checkbox.addEventListener('change', updateCount);
      });

      // Botón seleccionar todos
      form.querySelector('#select-all-btn').addEventListener('click', () => {
        alumnosList.querySelectorAll('.alumno-check').forEach(cb => cb.checked = true);
        updateCount();
      });

      // Botón deseleccionar todos
      form.querySelector('#deselect-all-btn').addEventListener('click', () => {
        alumnosList.querySelectorAll('.alumno-check').forEach(cb => cb.checked = false);
        updateCount();
      });
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const alumnosSeleccionados = Array.from(
        alumnosList.querySelectorAll('.alumno-check:checked')
      ).map(cb => cb.dataset.alumnoId);

      if (alumnosSeleccionados.length === 0) {
        showErrorAlert('Debes seleccionar al menos un alumno');
        return;
      }

      const data = {
        actividad: actividadSelect.value,
        monto: parseFloat(montoInput.value),
        fechaPago: form.fechaPago.value,
        observaciones: form.observaciones.value.trim()
      };

      // Agregar comprobante si existe
      if (comprobanteData) {
        data.comprobante = comprobanteData;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = 'Registrando...';

      try {
        // Registrar un pago por cada alumno seleccionado
        const promises = alumnosSeleccionados.map(alumnoId => 
          apiService.createPago({ ...data, alumno: alumnoId })
        );

        await Promise.all(promises);
        
        this.pagos = await apiService.getPagos();
        this.renderTable(document.querySelector('.container'));
        closeModal(modal);
        
        showSuccessAlert(`${alumnosSeleccionados.length} pago(s) registrado(s) exitosamente`);
      } catch (error) {
        showErrorAlert(error.message);
        submitBtn.disabled = false;
        submitBtn.textContent = `Registrar ${alumnosSeleccionados.length} Pago(s)`;
      }
    });

    modal.querySelector('#cancel-btn').addEventListener('click', () => {
      closeModal(modal);
    });
  },

  showEditPagoModal(pago) {
    const modal = createModal(
      'Editar Pago',
      `
        <form id="edit-pago-form">
          <div class="form-group">
            <label class="form-label">Alumno</label>
            <input 
              type="text" 
              class="form-input" 
              value="${pago.alumno?.nombreCompleto || 'N/A'}"
              disabled
            >
          </div>
          <div class="form-group">
            <label class="form-label">Actividad</label>
            <input 
              type="text" 
              class="form-input" 
              value="${pago.actividad?.nombre || 'N/A'}"
              disabled
            >
          </div>
          <div class="form-group">
            <label class="form-label" for="edit-monto">Monto ($)</label>
            <input 
              type="number" 
              id="edit-monto" 
              class="form-input" 
              min="0"
              step="0.01"
              value="${pago.monto}"
              required
            >
          </div>
          <div class="form-group">
            <label class="form-label" for="edit-fechaPago">Fecha de Pago</label>
            <input 
              type="date" 
              id="edit-fechaPago" 
              class="form-input" 
              value="${pago.fechaPago.split('T')[0]}"
              required
            >
          </div>
          <div class="form-group">
            <label class="form-label" for="edit-observaciones">Observaciones (opcional)</label>
            <textarea 
              id="edit-observaciones" 
              class="form-textarea"
            >${pago.observaciones || ''}</textarea>
          </div>
          
          ${pago.comprobante ? `
            <div class="form-group">
              <label class="form-label">Comprobante Actual</label>
              <div style="display: flex; gap: 0.5rem; align-items: center;">
                <button type="button" class="btn btn-secondary" id="view-comprobante-btn">
                  📄 Ver Comprobante
                </button>
                <button type="button" class="btn btn-danger" id="remove-comprobante-btn">
                  🗑️ Eliminar
                </button>
              </div>
              <small style="color: var(--text-light); display: block; margin-top: 0.5rem;">
                ${pago.comprobante.filename}
              </small>
            </div>
          ` : ''}
          
          <div class="form-group">
            <label class="form-label" for="edit-comprobante">
              ${pago.comprobante ? 'Cambiar Comprobante' : 'Agregar Comprobante'} (opcional)
            </label>
            <input 
              type="file" 
              id="edit-comprobante" 
              class="form-input"
              accept="image/*,application/pdf"
            >
            <small style="color: var(--text-light); display: block; margin-top: 0.5rem;">
              Formatos: JPG, PNG, PDF (máx. 5MB)
            </small>
            <div id="edit-preview-container" class="mt-2" style="display: none;">
              <img id="edit-preview-image" style="max-width: 200px; max-height: 200px; border-radius: var(--radius); border: 1px solid var(--border-color);">
              <p id="edit-preview-filename" style="margin-top: 0.5rem; font-size: 0.875rem; color: var(--text-light);"></p>
            </div>
          </div>
          
          <div class="btn-group">
            <button type="submit" class="btn btn-success">Actualizar</button>
            <button type="button" class="btn btn-secondary" id="edit-cancel-btn">Cancelar</button>
          </div>
        </form>
      `
    );

    openModal(modal);

    const form = modal.querySelector('#edit-pago-form');
    let removeComprobante = false;
    let newComprobanteData = null;

    // Ver comprobante existente
    if (pago.comprobante) {
      modal.querySelector('#view-comprobante-btn')?.addEventListener('click', () => {
        this.viewComprobante(pago.comprobante);
      });

      modal.querySelector('#remove-comprobante-btn')?.addEventListener('click', () => {
        if (confirm('¿Eliminar el comprobante actual?')) {
          removeComprobante = true;
          modal.querySelector('#view-comprobante-btn').parentElement.parentElement.style.display = 'none';
        }
      });
    }

    // Manejar nuevo comprobante
    const comprobanteInput = form.querySelector('#edit-comprobante');
    const previewContainer = form.querySelector('#edit-preview-container');
    const previewImage = form.querySelector('#edit-preview-image');
    const previewFilename = form.querySelector('#edit-preview-filename');

    comprobanteInput?.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) {
        previewContainer.style.display = 'none';
        newComprobanteData = null;
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        showErrorAlert('El archivo es muy grande. Máximo 5MB.');
        comprobanteInput.value = '';
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        newComprobanteData = {
          filename: file.name,
          mimetype: file.type,
          data: reader.result.split(',')[1]
        };

        previewContainer.style.display = 'block';
        previewFilename.textContent = file.name;
        
        if (file.type.startsWith('image/')) {
          previewImage.src = reader.result;
          previewImage.style.display = 'block';
        } else {
          previewImage.style.display = 'none';
        }
      };
      reader.readAsDataURL(file);
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const data = {
        monto: parseFloat(form.querySelector('#edit-monto').value),
        fechaPago: form.querySelector('#edit-fechaPago').value,
        observaciones: form.querySelector('#edit-observaciones').value.trim()
      };

      // Manejar comprobante
      if (removeComprobante) {
        data.comprobante = null;
      } else if (newComprobanteData) {
        data.comprobante = newComprobanteData;
      }

      try {
        await apiService.updatePago(pago._id, data);
        this.pagos = await apiService.getPagos();
        this.renderTable(document.querySelector('.container'));
        closeModal(modal);
        showSuccessAlert('Pago actualizado exitosamente');
      } catch (error) {
        showErrorAlert(error.message);
      }
    });

    modal.querySelector('#edit-cancel-btn').addEventListener('click', () => {
      closeModal(modal);
    });
  },

  viewComprobante(comprobante) {
    const dataUrl = `data:${comprobante.mimetype};base64,${comprobante.data}`;
    
    const modal = createModal(
      'Ver Comprobante',
      `
        <div style="text-align: center;">
          <p style="margin-bottom: 1rem; color: var(--text-light);">
            <strong>Archivo:</strong> ${comprobante.filename}
          </p>
          ${comprobante.mimetype.startsWith('image/') ? 
            `<img src="${dataUrl}" style="max-width: 100%; max-height: 70vh; border-radius: var(--radius);">` :
            `<embed src="${dataUrl}" type="${comprobante.mimetype}" style="width: 100%; height: 70vh;" />`
          }
          <div class="btn-group" style="margin-top: 1.5rem;">
            <a href="${dataUrl}" download="${comprobante.filename}" class="btn btn-success">
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

export default PagosPage;
