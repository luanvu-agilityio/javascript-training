const config = {
  // development: {
  //   apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  // },
  production: {
    apiUrl:
      import.meta.env.VITE_API_URL ||
      'https://json-server-vercel-kwwfkvsdk-luan-vus-projects-c4babaef.vercel.app/',
  },
};

export const getApiUrl = () => {
  return import.meta.env.PROD ? config.production.apiUrl : config.development.apiUrl;
};
