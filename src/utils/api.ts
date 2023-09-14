import axios, { AxiosRequestConfig } from 'axios';

import { BASE_URL } from '@/consts/api';
import SESSION_STORAGE from '@/consts/sessionStorage';

type Method = 'GET' | 'POST' | 'PUT' | 'DELETE';
type RequestOptions = {
  data?: unknown;
  params?: unknown;
};

const axiosInstance = axios.create({
  baseURL: BASE_URL,
});

axiosInstance.interceptors.request.use((config) => {
  const token = sessionStorage.getItem(SESSION_STORAGE.TOKEN);

  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }

  return config;
});

const request = async <Response>(
  url: string,
  method: Method,
  opt?: RequestOptions,
): Promise<Response> =>
  axiosInstance({
    method: 'POST',
    data: {
      url,
      method,
      params: opt?.params,
      data: opt?.data,
    } as AxiosRequestConfig,
  }).then((result) => {
    return result.data;
  });

const get = async <Request, Response>(url: string, params?: Request) =>
  request<Response>(url, 'GET', { params });

const post = async <Request, Response>(url: string, data?: Request) =>
  request<Response>(url, 'POST', { data });

const put = async <Request, Response>(url: string, data?: Request) =>
  request<Response>(url, 'PUT', { data });

const del = async <Request, Response>(url: string, data?: Request) =>
  request<Response>(url, 'DELETE', { data });

const api = {
  get,
  post,
  put,
  del,
};

export default api;
