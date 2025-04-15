import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const register = async (userData: { name: string; email: string; password: string }) => {
  const response = await axios.post(`${API_URL}/auth/register`, userData);
  return response.data;
};

export const login = async (userData: { email: string; password: string }) => {
  const response = await axios.post(`${API_URL}/auth/login`, userData);
  return response.data;
};
