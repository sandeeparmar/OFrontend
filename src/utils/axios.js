import axios from "axios";

// Create an Axios instance
const axiosClient = axios.create({
  baseURL: "http://locahost:4000", 
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});



axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API error:", error);
    return Promise.reject(error);
  }
);

export default axiosClient;
