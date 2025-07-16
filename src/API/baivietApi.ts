import axios from "axios";
import type { BaiViet } from "../types/BaiViet";

const API_URL = "http://127.0.0.1:8000/api";

export const createBaiViet = async (data: BaiViet) => {
  const response = await axios.post(API_URL, data);
  return response.data;
};

export const updateBaiViet = async (id: number, data: BaiViet) => {
  const response = await axios.put(`${API_URL}/${id}`, data);
  return response.data;
};

export const deleteBaiViet = async (id: number) => {
  const response = await axios.delete(`${API_URL}/${id}`);
  return response.data;
}; 