import { createNavbar } from '../components/Navbar.js';
import { createModal, openModal, closeModal } from '../components/Modal.js';
import { apiService } from '../services/apiService.js';
import { showSuccessAlert, showErrorAlert, compressImage } from '../components/Alert.js';

const POAPage = {
  poa: null,

  async render(container) {
    const navbar = createNavbar();
    const content = document.createElement('div');
    content.className = 'container';
    content.innerHTML = `
      <div class="card">
        <div class="card-header">
          <h1 class="card-title">POA (Plan Operativo Anual)</h1>
          <button class="btn btn-primary" id="upload-poa-btn">
            📤 ${this.poa ? 'Reemplazar POA' : 'Subir POA'}
          </button>
        </div>
        <div class="loading">
          <div class="spinner"></div>
        </div>
      </div>
    `;

    container.appendChild(navbar);
    container.appendChild(content);

    try {
      this.poa = await apiService.getPOA();
      this.renderContent(content);
    } catch (error) {
      this.renderEmpty(content);
    }

    content.querySelector('#upload-poa-btn')?.addEventListener('click', () => {
      this.showUploadModal();
    });
  },

  renderContent(container) {
    const card = container.querySelector('.card');
    const headerHTML = card.querySelector('.card-header').outerHTML;

    if (!this.poa || !this.poa.archivo) {
      this.renderEmpty(container);
      return;
    }

    card.innerHTML = `
      ${headerHTML}
      <div class="poa-viewer">
        <div class="poa-info">
          <div class="info-item">
            <span class="info-label">📄 Archivo:</span>
            <span class="info-value">${this.poa.archivo.filename}</span>
          </div>
          <div class="info-item">
            <span class="info-label">📅 Fecha de carga:</span>
            <span class="info-value">${this.formatDate(this.poa.fechaCarga)}</span>
          </div>
          <div class="btn-group" style="margin-top: 1rem;">
            <button class="btn btn-success" id="download-poa-btn">💾 Descargar</button>
            <button class="btn btn-danger" id="delete-poa-btn">🗑️ Eliminar</button>
          </div>
        </div>
        
        <div class="pdf-viewer-container">
          <iframe 
            src="data:${this.poa.archivo.mimetype};base64,${this.poa.archivo.data}" 
            type="application/pdf"
            class="pdf-viewer"
          ></iframe>
        </div>
      </div>
    `;

    // Event listeners
    card.querySelector('#upload-poa-btn')?.addEventListener('click', () => {
      this.showUploadModal();
    });

    card.querySelector('#download-poa-btn')?.addEventListener('click', () => {
      this.downloadPOA();
    });

    card.querySelector('#delete-poa-btn')?.addEventListener('click', async () => {
      if (confirm('¿Estás segura de eliminar el POA actual?')) {
        try {
          await apiService.deletePOA();
          this.poa = null;
          this.renderEmpty(container);
          showSuccessAlert('POA eliminado exitosamente');
        } catch (error) {
          showErrorAlert('Error al eliminar: ' + error.message);
        }
      }
    });
  },

  renderEmpty(container) {
    const card = container.querySelector('.card');
    const headerHTML = card.querySelector('.card-header').outerHTML;

    card.innerHTML = `
      ${headerHTML}
      <div class="empty-state">
        <div class="empty-state-icon">📋</div>
        <p>No hay ningún POA cargado</p>
        <p style="color: var(--text-light); font-size: 0.875rem;">
          Sube el documento del Plan Operativo Anual en formato PDF
        </p>
      </div>
    `;

    card.querySelector('#upload-poa-btn')?.addEventListener('click', () => {
      this.showUploadModal();
    });
  },

  showUploadModal() {
    const modal = createModal(
      'Subir POA',
      `
        <form id="poa-form">
          <div class="form-group">
            <label class="form-label" for="poa-file">Seleccionar archivo PDF</label>
            <input 
              type="file" 
              id="poa-file" 
              class="form-input"
              accept="application/pdf"
              required
            >
            <small style="color: var(--text-light); display: block; margin-top: 0.5rem;">
              Solo archivos PDF (máx. 10MB)
            </small>
            <div id="file-preview" class="mt-2" style="display: none;">
              <p id="file-name" style="color: var(--text-dark); font-weight: 500;"></p>
              <p id="file-size" style="color: var(--text-light); font-size: 0.875rem;"></p>
            </div>
          </div>
          
          <div class="btn-group">
            <button type="submit" class="btn btn-primary" id="submit-btn">
              Subir POA
            </button>
            <button type="button" class="btn btn-secondary" id="cancel-btn">Cancelar</button>
          </div>
        </form>
      `
    );

    openModal(modal);

    const form = modal.querySelector('#poa-form');
    const fileInput = form.querySelector('#poa-file');
    const filePreview = form.querySelector('#file-preview');
    const fileName = form.querySelector('#file-name');
    const fileSize = form.querySelector('#file-size');
    const submitBtn = form.querySelector('#submit-btn');

    let fileData = null;

    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) {
        filePreview.style.display = 'none';
        fileData = null;
        return;
      }

      // Validar tipo
      if (file.type !== 'application/pdf') {
        showErrorAlert('Solo se permiten archivos PDF');
        fileInput.value = '';
        return;
      }

      // Validar tamaño (10MB)
      if (file.size > 10 * 1024 * 1024) {
        showErrorAlert('El archivo es muy grande. Máximo 10MB.');
        fileInput.value = '';
        return;
      }

      // Mostrar preview
      fileName.textContent = `📄 ${file.name}`;
      fileSize.textContent = `Tamaño: ${(file.size / 1024 / 1024).toFixed(2)} MB`;
      filePreview.style.display = 'block';

      // Leer archivo
      const reader = new FileReader();
      reader.onload = () => {
        fileData = {
          filename: file.name,
          mimetype: file.type,
          data: reader.result.split(',')[1]
        };
      };
      reader.readAsDataURL(file);
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (!fileData) {
        showErrorAlert('Por favor selecciona un archivo');
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = 'Subiendo...';

      try {
        await apiService.uploadPOA({ archivo: fileData });
        this.poa = await apiService.getPOA();
        this.renderContent(document.querySelector('.container'));
        closeModal(modal);
        showSuccessAlert('POA subido exitosamente');
      } catch (error) {
        showErrorAlert(error.message);
        submitBtn.disabled = false;
        submitBtn.textContent = 'Subir POA';
      }
    });

    modal.querySelector('#cancel-btn').addEventListener('click', () => {
      closeModal(modal);
    });
  },

  downloadPOA() {
    if (!this.poa || !this.poa.archivo) return;

    const dataUrl = `data:${this.poa.archivo.mimetype};base64,${this.poa.archivo.data}`;
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = this.poa.archivo.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('es-BO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
};

export default POAPage;
