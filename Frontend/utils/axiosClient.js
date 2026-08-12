import axios from "axios";

const apiBaseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3000').trim();

const axiosClient = axios.create({
    baseURL: apiBaseUrl,
    withCredentials: true,
    headers: {
        'Content-type': 'application/json'
    }
});

export default axiosClient;