// frontend/src/api/http-data.ts
import axios from 'axios';

const getBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) {
    return envUrl;
  }
  const { protocol, hostname } = window.location;
  return `${protocol}//${hostname}:8081/api`;
};

const httpData = axios.create({
  baseURL: getBaseUrl(),
  timeout: 30000, // 데이터 조회는 30초
  headers: {
    'Content-Type': 'application/json',
  },
});

httpData.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default httpData;
