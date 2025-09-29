import axios from "axios";
import { API_BASE } from "@/constants/config"; // or "../constants/config"
export const api = axios.create({ baseURL: API_BASE, timeout: 15000 });