const config = {
  development: {
    apiUrl: 'http://localhost:3000',
  },
  production: {
    apiUrl: 'https://json-server-8zouvu039-luan-vus-projects-c4babaef.vercel.app/',
  },
};
export const getApiUrl = () => {
  return import.meta.env.MODE === 'production'
    ? config.production.apiUrl
    : config.development.apiUrl;
};
