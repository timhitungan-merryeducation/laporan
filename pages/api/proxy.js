// File: pages/api/proxy.js
import axios from 'axios';

export default async function handler(req, res) {
  const API_URL = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL;
  
  if (!API_URL) {
    return res.status(500).json({ status: 'error', message: 'API URL belum disetting di Vercel' });
  }

  try {
    if (req.method === 'GET') {
      const response = await axios.get(API_URL, { params: req.query });
      return res.status(200).json(response.data);
    } 
    
    if (req.method === 'POST') {
      // Google Apps Script menerima POST request lebih baik dengan text/plain untuk menghindari CORS Preflight
      const response = await axios.post(API_URL, JSON.stringify(req.body), {
        headers: { 'Content-Type': 'text/plain;charset=utf-8' }
      });
      return res.status(200).json(response.data);
    }
  } catch (error) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
}
