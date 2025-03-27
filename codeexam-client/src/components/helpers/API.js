import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000', // Your backend server URL
});

export default API;