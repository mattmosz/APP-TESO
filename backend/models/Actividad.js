import mongoose from 'mongoose';

const actividadSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    trim: true
  },
  fecha: {
    type: Date,
    required: true
  },
  requiereCuota: {
    type: Boolean,
    default: true
  },
  cuotaIndividual: {
    type: Number,
    default: 0,
    min: 0
  },
  totalActividad: {
    type: Number,
    default: 0,
    min: 0
  },
  fechaMaximaPago: {
    type: Date,
    required: true
  },
  descripcion: {
    type: String,
    default: ''
  },
  activa: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export default mongoose.model('Actividad', actividadSchema);
