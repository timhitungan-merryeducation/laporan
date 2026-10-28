import axios from 'axios';

// TAMBAHKAN BLOK INI UNTUK MENAIKKAN LIMIT UKURAN FILE (SANGAT PENTING)
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb', // Naikkan limit Vercel dari 1MB menjadi 10MB
    },
  },
};

export default async function handler(req, res) {
  const API_URL = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL;
  
  if (!API_URL) {
    return res.status(500).json({ status: 'error', message: 'API URL belum disetting di Vercel' });
  }

  const queryParams = { ...req.query };
  delete queryParams.t;

  try {
    if (req.method === 'GET') {
      const response = await axios.get(API_URL, { params: queryParams });
      res.setHeader('Cache-Control', 'no-store, max-age=0');
      return res.status(200).json(response.data);
    } 
    
    if (req.method === 'POST') {
      const response = await axios.post(API_URL, JSON.stringify(req.body), {
        headers: { 'Content-Type': 'text/plain;charset=utf-8' }
      });
      res.setHeader('Cache-Control', 'no-store, max-age=0');
      return res.status(200).json(response.data);
    }
  } catch (error) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
}
