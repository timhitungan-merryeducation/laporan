import axios from 'axios';

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwJTbQqMgYLBZo34f0PbnP2MD3xcbUk-wl1xXV8L4IqAdOuKU2GS9jUR5dcD-iW657tYQ/exec';

export default async function handler(req, res) {
  try {
    if (req.method === 'POST') {
      const response = await axios.post(SCRIPT_URL, req.body, {
        headers: { 'Content-Type': 'application/json' }
      });
      return res.status(200).json(response.data);
    }

    if (req.method === 'GET') {
      const response = await axios.get(SCRIPT_URL, { params: req.query });
      return res.status(200).json(response.data);
    }

    return res.status(405).json({ message: 'Method Not Allowed' });
  } catch (error) {
    console.error('Proxy error:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
}
