import axios from 'axios';

export const fetcher = async (action, params = {}) => {
  // Sekarang browser meminta ke server Vercel lokal, bukan ke Google
  const res = await axios.get('/api/proxy', { params: { action, ...params } });
  return res.data.data;
};

export const poster = async (action, data) => {
  const res = await axios.post('/api/proxy', { action, data });
  return res.data.data;
};
