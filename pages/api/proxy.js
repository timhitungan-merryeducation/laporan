import axios from 'axios';

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxh7zmBvkSEV7UA99q5fWFeSDXcm5sF__XNfa8p_kstgShMUwXg0Ng97TZB9CpF7nw4Sg/exec';

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
