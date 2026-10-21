// File: utils/api.js
import axios from 'axios';

export const fetcher = async (action, params = {}) => {
  // Memanggil proxy lokal Next.js
  const res = await axios.get('/api/proxy', { params: { action, ...params } });
  return res.data.data;
};

export const poster = async (action, data) => {
  // Memanggil proxy lokal Next.js
  const res = await axios.post('/api/proxy', { action, data });
  return res.data.data;
};
