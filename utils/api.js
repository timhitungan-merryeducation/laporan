import axios from 'axios';

export const fetcher = async (action, params = {}) => {
  const res = await axios.get('/api/proxy', { 
    params: { action, t: Date.now(), ...params } 
  });
  // Tangkap pesan error jika code.gs mengembalikan status error
  if (res.data.status === "error") throw new Error(res.data.message);
  return res.data.data;
};

export const poster = async (action, data) => {
  const res = await axios.post('/api/proxy', { action, data });
  // PERBAIKAN: Lempar error jika gagal, agar Swal.fire di raport.js menangkapnya
  if (res.data.status === "error") {
    throw new Error(res.data.message); 
  }
  return res.data.data;
};
