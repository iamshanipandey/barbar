import axios from 'axios';

const instance = axios.create({
  baseURL: 'https://barbar-92dv.onrender.com/api', 
  timeout: 10000,
});

instance.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error Details:', {
      url: error.config?.url,
      method: error.config?.method,
      data: error.config?.data,
      status: error.response?.status,
      statusText: error.response?.statusText,
      responseData: error.response?.data
    });
    return Promise.reject(error);
  }
);


export default instance;