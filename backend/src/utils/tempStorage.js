// utils/tempStorage.js
import TempRegistration from '../models/tempRegistration.model.js';

export const setTempData = async (token, data) => {
  await TempRegistration.create({ token, data });
};

export const getTempData = async (token) => {
  const doc = await TempRegistration.findOneAndDelete({ token });
  return doc?.data || null;
};