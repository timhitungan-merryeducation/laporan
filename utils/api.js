import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL;

export const fetcher = async (action, params = {}) => {
  const res = await axios.get(API_URL, { params: { action, ...params } });
  return res.data.data;
};

export const poster = async (action, data) => {
  const res = await axios.post(API_URL, JSON.stringify({ action, data }));
  return res.data.data;
};
