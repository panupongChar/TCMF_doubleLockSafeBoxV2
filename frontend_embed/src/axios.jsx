import axios from "axios";

const instance = axios.create({
  baseURL: "https://tcmf-backend.herokuapp.com/",
  timeout: 20000,
});

export default instance;