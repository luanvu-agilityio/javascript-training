const config = {
  development: {
    apiUrl: 'http://localhost:3000',
  },
  production: {
    apiUrl: 'https://won-api-5zcb.onrender.com',
  },
};

export const getApiUrl = () => {
  // Check if window exists to determine if we're in a browser environment
  if (typeof window !== 'undefined') {
    // Check if we're on localhost
    const isLocal =
      window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    return isLocal ? config.development.apiUrl : config.production.apiUrl;
  }

  // Default to production URL if not in browser environment
  return config.production.apiUrl;
};
