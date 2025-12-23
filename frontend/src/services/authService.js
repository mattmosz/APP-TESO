import { config } from '../config.js';

class AuthService {
  constructor() {
    this.token = localStorage.getItem('token');
    this.user = JSON.parse(localStorage.getItem('user') || 'null');
  }

  async login(username, password) {
    try {
      const response = await fetch(`${config.API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al iniciar sesión');
      }

      const data = await response.json();
      this.token = data.token;
      this.user = data.usuario;

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.usuario));

      return data;
    } catch (error) {
      throw error;
    }
  }

  logout() {
    this.token = null;
    this.user = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  getToken() {
    return this.token;
  }

  getUser() {
    return this.user;
  }

  isAuthenticated() {
    return !!this.token;
  }

  isPadre() {
    return this.user?.rol === 'padre';
  }

  isAdmin() {
    return this.user?.rol === 'admin' || this.user?.rol === 'tesorera';
  }
}

export const authService = new AuthService();
