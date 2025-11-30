import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Do not retry if it's already a retry OR if it is the refresh request itself
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/authentication/refresh')
    ) {
      originalRequest._retry = true;

      try {
        await api.post('/authentication/refresh', {}, { withCredentials: true });
        return api(originalRequest); // retry the original request
      } catch {
        window.dispatchEvent(new Event('FORCE_LOGOUT'));
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
