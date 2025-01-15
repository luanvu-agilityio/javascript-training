const config = {
  development: {
    apiUrl: import.meta.env.development.VITE_API_URL,
  },
  production: {
    apiUrl: import.meta.env.production.VITE_API_URL,
  },
};

export const getApiUrl = () => {
  return config[import.meta.env.MODE].apiUrl;
};
