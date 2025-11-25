import mongoose from 'mongoose';

const egresoSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    trim: true
  },
  monto: {
    type: Number,
    required: true,
    min: 0
  },
  fecha: {
    type: Date,
    required: true,
    default: Date.now
  },
  actividad: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Actividad',
    default: null
  },
  descripcion: {
    type: String,
    default: ''
  },
  factura: {
    filename: String,
    mimetype: String,
    data: String // Base64
  }
}, {
  timestamps: true
});

export default mongoose.model('Egreso', egresoSchema);
