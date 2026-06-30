import { authService } from '../services/authService.js';
import { router } from '../router.js';

const AccesoPadresPage = {
  async render(container) {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    container.innerHTML = `
      <div class="login-container">
        <div class="login-card">
          <h1 class="login-title">Tesorería 8vo C</h1>
          <p class="text-center mb-2">Acceso para padres de familia</p>
          <div class="loading">
            <div class="spinner"></div>
            <p style="margin-top: 1rem; text-align: center;">Accediendo...</p>
          </div>
          <div id="error-message" class="alert alert-error hidden" style="margin-top: 1rem;"></div>
        </div>
      </div>
    `;

    const errorEl = container.querySelector('#error-message');

    if (!token) {
      container.querySelector('.loading').style.display = 'none';
      errorEl.textContent = 'Enlace inválido: falta el token de acceso.';
      errorEl.classList.remove('hidden');
      return;
    }

    try {
      await authService.loginPublico(token);
      router.navigate('/dashboard');
    } catch (error) {
      container.querySelector('.loading').style.display = 'none';
      errorEl.innerHTML = `
        ${error.message || 'No se pudo acceder.'}
        <br><br>
        <a href="/login" data-link>Iniciar sesión (tesorera)</a>
      `;
      errorEl.classList.remove('hidden');
      errorEl.querySelector('[data-link]')?.addEventListener('click', (e) => {
        e.preventDefault();
        router.navigate('/login');
      });
    }
  }
};

export default AccesoPadresPage;
