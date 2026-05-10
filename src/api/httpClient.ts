import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001/api';

export const httpClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

