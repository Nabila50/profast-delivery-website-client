import axios from "axios";

const axiosInstance = axios.create({
    baseURL: `https://profast-delivery-server.vercel.app`
})
const useAxios = () => {
  return axiosInstance;
};

export default useAxios;