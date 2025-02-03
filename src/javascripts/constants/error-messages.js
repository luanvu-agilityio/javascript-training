export const DEFAULT_ERROR_MESSAGES = {
  database: {
    connection: 'Unable to connect to database. Please try again later.',
    loading: 'Failed to load data from database. Please refresh the page.',
  },
  // Server specific errors
  server: {
    connection: 'Unable to connect to server. Please check your connection.',
    loading: 'Failed to load data from server. Please refresh the page.',
    timeout: 'Server request timed out. Please try again.',
  },
  // Network related errors
  network: {
    offline: 'You appear to be offline. Please check your internet connection.',
    timeout: 'Network request timed out. Please try again.',
  },
  // Generic errors
  unknown: 'An unexpected error occurred. Please try again.',
  validation: 'Invalid input data. Please check your entries.',
};
