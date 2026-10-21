import axios from 'axios';

export default async function handler(req, res) {
  // Ambil URL Google Script dari Environment Variables Vercel
  const API_URL = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL;
  
  if (!API_URL) {
    return res.status(500).json({ status: 'error', message: 'API URL belum disetting' });
  }

  try {
    if (req.method === 'GET') {
      // Vercel yang melakukan request ke Google (bebas CORS)
      const response = await axios.get(API_URL, { params: req.query });
      return res.status(200).json(response.data);
    } 
    
    if (req.method === 'POST') {
      const response = await axios.post(API_URL, JSON.stringify(req.body), {
        headers: { 'Content-Type': 'text/plain;charset=utf-8' }
      });
      return res.status(200).json(response.data);
    }
  } catch (error) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
}
