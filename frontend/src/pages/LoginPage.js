import { authService } from '../services/authService.js';
import { router } from '../router.js';
import { keepAliveService } from '../services/keepAlive.js';

const LoginPage = {
  render(container) {
    container.innerHTML = `
      <div class="login-container">
        <div class="login-card">
          <h1 class="login-title">Tesorería 8vo C</h1>
          <form id="login-form">
            <div class="form-group">
              <label class="form-label" for="username">Usuario</label>
              <input 
                type="text" 
                id="username" 
                class="form-input" 
                required
                autocomplete="username"
              >
            </div>
            <div class="form-group">
              <label class="form-label" for="password">Contraseña</label>
              <input 
                type="password" 
                id="password" 
                class="form-input" 
                required
                autocomplete="current-password"
              >
            </div>
            <div id="error-message" class="form-error hidden"></div>
            <button type="submit" class="btn btn-primary btn-block">
              Iniciar Sesión
            </button>
          </form>
        </div>
      </div>
    `;

    const form = container.querySelector('#login-form');
    const errorMessage = container.querySelector('#error-message');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      errorMessage.classList.add('hidden');

      const username = form.username.value.trim();
      const password = form.password.value;

      try {
        await authService.login(username, password);
        keepAliveService.start(); // Iniciar servicio para mantener backend despierto
        router.navigate('/dashboard');
      } catch (error) {
        errorMessage.textContent = error.message;
        errorMessage.classList.remove('hidden');
      }
    });
  }
};

export default LoginPage;
