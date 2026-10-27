import axios from 'axios';

// HAPUS SCRIPT_URL LAMA, LALU PASTE URL BARU ANDA DI DALAM TANDA KUTIP DI BAWAH INI:
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwJTbQqMgYLBZo34f0PbnP2MD3xcbUk-wl1xXV8L4IqAdOuKU2GS9jUR5dcD-iW657tYQ/exec';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const response = await axios.get(SCRIPT_URL, { params: req.query });
      return res.status(200).json(response.data);
    } else if (req.method === 'POST') {
      const response = await axios.post(SCRIPT_URL, req.body, {
        headers: { 'Content-Type': 'application/json' },
      });
      return res.status(200).json(response.data);
    } else {
      return res.status(405).json({ message: 'Method Not Allowed' });
    }
  } catch (error) {
    console.error("API Proxy Error:", error.message);
    const errorMsg = error.message.includes('504') || error.message.includes('timeout')
      ? 'Waktu habis (Timeout). File sedang diproses, cek Sheet dalam 1 menit.'
      : error.message;
    return res.status(500).json({ status: 'error', message: errorMsg });
  }
}
