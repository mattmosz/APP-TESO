import mongoose from 'mongoose';

const pagoSchema = new mongoose.Schema({
  alumno: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Alumno',
    required: true
  },
  actividad: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Actividad',
    required: true
  },
  monto: {
    type: Number,
    required: true,
    min: 0
  },
  fechaPago: {
    type: Date,
    default: Date.now
  },
  observaciones: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Índice compuesto para evitar pagos duplicados
pagoSchema.index({ alumno: 1, actividad: 1 }, { unique: true });

export default mongoose.model('Pago', pagoSchema);
