// utils/api.js
import axios from 'axios';

// Fetcher untuk baca data dari Turso
export const fetcher = async (action, params = {}) => {
  const query = new URLSearchParams({ action, ...params }).toString();
  const response = await axios.get(`/api/db?${query}`);
  return response.data.data;
};

// Poster untuk kirim data ke Turso
export const poster = async (action, data) => {
  const response = await axios.post('/api/db', { action, ...data });
  return response.data;
};

// Poster Khusus untuk File (Karena File harus mampir ke Drive lewat proxy)
export const uploadFileToDrive = async (action, data) => {
  const response = await axios.post('/api/proxy', { action, data });
  return response.data;
};
