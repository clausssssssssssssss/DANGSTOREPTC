import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const checkout = async () => {
  try {
    const response = await axios.post(`${API_URL}/orders/checkout`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getHistory = async () => {
  try {
    const response = await axios.get(`${API_URL}/orders/history`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};