import mongoose from 'mongoose';

const poaSchema = new mongoose.Schema({
  archivo: {
    filename: String,
    mimetype: String,
    data: String // Base64
  },
  fechaCarga: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

export default mongoose.model('POA', poaSchema);
