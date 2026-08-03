import mongoose from 'mongoose';

const tempDataSchema = new mongoose.Schema({
  token: { type: String, required: true, unique: true },
  data: { type: Object, required: true },
  createdAt: { type: Date, default: Date.now, expires: 1800 }, // 30min TTL
});

export default mongoose.model('TempData', tempDataSchema);

// utils/tempStorage.js
import TempData from '../model/TempData.js';

export const setTempData = async (token, data) => {
  await TempData.create({ token, data });
};

export const getTempData = async (token) => {
  const doc = await TempData.findOneAndDelete({ token });
  return doc?.data || null;
};