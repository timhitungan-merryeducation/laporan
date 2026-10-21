import axios from 'axios';

export const fetcher = async (action, params = {}) => {
  // Tambahkan timestamp agar Vercel/SWR tidak nge-cache data (selalu fresh)
  const res = await axios.get('/api/proxy', { 
    params: { action, t: Date.now(), ...params } 
  });
  return res.data.data;
};

export const poster = async (action, data) => {
  const res = await axios.post('/api/proxy', { action, data });
  return res.data.data;
};
