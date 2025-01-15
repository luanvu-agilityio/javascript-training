const config = {
  development: {
    apiUrl: 'http://localhost:3000',
  },
  production: {
    apiUrl: 'https://json-server-vercel-kwwfkvsdk-luan-vus-projects-c4babaef.vercel.app/',
  },
};
export const getApiUrl = () => {
  return process.env.NODE_ENV === 'production'
    ? config.production.apiUrl
    : config.development.apiUrl;
};
