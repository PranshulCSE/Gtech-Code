import axios from "axios";

const axiosClient = axios.create({
    baseURL : 'http://localhost:3000',
    withCredentials: true,
    headers: {
        'Content-type':'application/json'
    }
});


export default axiosClient;