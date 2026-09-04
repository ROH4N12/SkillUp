// Base API URL: In production/Vercel or when proxied by Vite, this can be empty (relative)
// or customized via VITE_API_URL environment variable.
export const API_BASE = import.meta.env.VITE_API_URL || '';

export const getApiUrl = (endpoint) => {
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE}${path}`;
};
