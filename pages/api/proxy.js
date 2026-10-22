import axios from 'axios';

export default async function handler(req, res) {
  // Mengambil URL dari Environment Variable Vercel (atau fallback ke URL hardcode)
  const SCRIPT_URL = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbzWHgPUDTzDFC0gqXasAaQB48BmKbTwPrHjQnm_2Y4bA3li-0iNz3nQhD5XDAns7OwPRg/exec';

  try {
    if (req.method === 'GET') {
      const response = await axios.get(SCRIPT_URL, { params: req.query });
      return res.status(200).json(response.data);
    } else if (req.method === 'POST') {
      const response = await axios.post(SCRIPT_URL, req.body, {
        headers: { 'Content-Type': 'application/json' },
      });
      return res.status(200).json(response.data);
    }
  } catch (error) {
    console.error("API Proxy Error:", error.message);
    
    // Deteksi jika Vercel kehabisan waktu (Timeout) karena file PDF terlalu besar
    const errorMsg = error.message.includes('504') || error.message.includes('timeout')
      ? 'Waktu habis (Timeout). File sedang diproses di latar belakang Google, silakan cek Sheet dalam 1 menit.'
      : error.message;

    return res.status(500).json({ status: 'error', message: errorMsg });
  }
}
