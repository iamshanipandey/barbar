import axios from 'axios';

const instance = axios.create({
  baseURL: 'https://barbar-92dv.onrender.com/api', 
  timeout: 10000,
});


export default instance;