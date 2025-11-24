import { config } from '../config.js';
import { authService } from './authService.js';

class ApiService {
  async request(endpoint, options = {}) {
    const token = authService.getToken();
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${config.API_URL}${endpoint}`, {
        ...options,
        headers
      });

      if (response.status === 401) {
        authService.logout();
        window.location.href = '/';
        throw new Error('Sesión expirada');
      }

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error en la petición');
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  // Alumnos
  getAlumnos() {
    return this.request('/alumnos');
  }

  getAlumno(id) {
    return this.request(`/alumnos/${id}`);
  }

  createAlumno(data) {
    return this.request('/alumnos', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  updateAlumno(id, data) {
    return this.request(`/alumnos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  deleteAlumno(id) {
    return this.request(`/alumnos/${id}`, {
      method: 'DELETE'
    });
  }

  // Actividades
  getActividades() {
    return this.request('/actividades');
  }

  getActividad(id) {
    return this.request(`/actividades/${id}`);
  }

  createActividad(data) {
    return this.request('/actividades', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  updateActividad(id, data) {
    return this.request(`/actividades/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  deleteActividad(id) {
    return this.request(`/actividades/${id}`, {
      method: 'DELETE'
    });
  }

  // Pagos
  getPagos() {
    return this.request('/pagos');
  }

  getPagosByActividad(actividadId) {
    return this.request(`/pagos/actividad/${actividadId}`);
  }

  getPagosByAlumno(alumnoId) {
    return this.request(`/pagos/alumno/${alumnoId}`);
  }

  createPago(data) {
    return this.request('/pagos', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  updatePago(id, data) {
    return this.request(`/pagos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  deletePago(id) {
    return this.request(`/pagos/${id}`, {
      method: 'DELETE'
    });
  }

  // Egresos
  getEgresos() {
    return this.request('/egresos');
  }

  getEgreso(id) {
    return this.request(`/egresos/${id}`);
  }

  createEgreso(data) {
    return this.request('/egresos', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  updateEgreso(id, data) {
    return this.request(`/egresos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  deleteEgreso(id) {
    return this.request(`/egresos/${id}`, {
      method: 'DELETE'
    });
  }

  // Dashboard
  getStats() {
    return this.request('/dashboard/stats');
  }

  getDeudores() {
    return this.request('/dashboard/deudores');
  }

  getDeudoresByActividad(actividadId) {
    return this.request(`/dashboard/deudores/${actividadId}`);
  }
}

export const apiService = new ApiService();
