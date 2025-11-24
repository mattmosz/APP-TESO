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

export default mongoose.model('Pago', pagoSchema);
