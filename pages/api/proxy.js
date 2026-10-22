import axios from 'axios';

// Masukkan URL Deployment Baru Anda di sini
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx5UcOxFkCKvEcXI2Nb1e37Fqeuphf9rNM5dgxHybFS4sh8oqWvy3qSaiGAJVKnAeqB-g/exec';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      // Meneruskan request GET beserta parameternya ke Google Apps Script
      const response = await axios.get(SCRIPT_URL, { params: req.query });
      res.status(200).json(response.data);
    } else if (req.method === 'POST') {
      // Meneruskan request POST (termasuk action dan payload data) ke Google Apps Script
      // Next.js secara otomatis mem-parsing req.body sebagai JSON
      const response = await axios.post(SCRIPT_URL, req.body, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      res.status(200).json(response.data);
    } else {
      res.status(405).json({ message: 'Method Not Allowed' });
    }
  } catch (error) {
    console.error("API Proxy Error:", error.message);
    res.status(500).json({ status: 'error', message: 'Gagal terhubung ke server backend.' });
  }
}
