import axios from "axios";

export const apiClient = axios.create({
  baseURL: "/api",
  timeout: 30000,
});

export interface ApiRequestData {
  method: string;
  url: string;
  headers?: Record<string, string>;
  body?: string;
}

export interface ApiResponse {
  data: any;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  duration: number;
}

export const makeApiRequest = async (requestData: ApiRequestData): Promise<ApiResponse> => {
  const response = await apiClient.post("/proxy", requestData);
  return response.data;
};
