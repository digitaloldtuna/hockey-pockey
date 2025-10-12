import axios from 'axios';

console.log('base', process.env.REACT_APP_API_BASE_URL)

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/hockey',
  withCredentials: true,
});

export default api;