import axios from "axios";

const axiosClient = axios.create({
    baseURL : import.meta.env.VITE_API_URL || 'http://localhost:3000',
    withCredentials: true,
    headers: {
        'Content-type':'application/json'
    }
});

export default axiosClient;