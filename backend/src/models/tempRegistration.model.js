// models/TempRegistration.js
import mongoose from 'mongoose';

const tempRegistrationSchema = new mongoose.Schema({
  token: { type: String, required: true, unique: true },
  data: { type: Object, required: true },
  createdAt: { type: Date, default: Date.now, expires: 1800 } // TTL in seconds
});

export default mongoose.model('TempRegistration', tempRegistrationSchema);