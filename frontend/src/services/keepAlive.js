import { config } from '../config.js';

// Servicio para mantener el backend despierto (Render duerme apps gratuitas)
class KeepAliveService {
  constructor() {
    this.interval = null;
    this.isRunning = false;
  }

  // Hacer ping al servidor cada 10 minutos
  start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    console.log('🔄 Servicio Keep-Alive iniciado');
    
    // Hacer ping inmediato
    this.ping();
    
    // Hacer ping cada 10 minutos (600000 ms)
    this.interval = setInterval(() => {
      this.ping();
    }, 600000); // 10 minutos
  }

  async ping() {
    try {
      const response = await fetch(`${config.API_URL}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Backend activo:', data.status);
      }
    } catch (error) {
      console.log('⚠️ Backend inactivo, despertando...');
    }
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
      this.isRunning = false;
      console.log('⏸️ Servicio Keep-Alive detenido');
    }
  }
}

export const keepAliveService = new KeepAliveService();
