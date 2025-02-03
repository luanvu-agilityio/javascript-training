import NotificationUtils from './notification-utils.js';
import { DEFAULT_ERROR_MESSAGES } from '../constants/error-messages.js';
class UserErrorMessage {
  constructor() {
    this.notification = new NotificationUtils();
    // Initialize with default error messages
    this.defaultMessages = DEFAULT_ERROR_MESSAGES;
  }

  /**
   * Handle unexpected system errors
   * @param {Error} error - The error object to handle
   * @param {Object} options - Options for error handling
   * @param {string} options.context - Context where the error occurred
   * @param {Function} options.onError - Callback function to execute after error handling
   * @param {boolean} options.showNotification - Whether to show notification to user
   * @returns {Object} - Processed error information
   */
  handleError(error, options = {}) {
    const {
      context = 'general',
      operation = 'general',
      onError,
      showNotification = true,
    } = options;

    // Process the error
    const processedError = this.processError(error, context, operation);

    // Show notification if required
    if (showNotification && this.notification) {
      this.notification.show(processedError.userMessage, {
        type: 'error',
        duration: 3000,
      });
    }

    // Execute callback if provided
    if (typeof onError === 'function') {
      onError(processedError);
    }

    return processedError;
  }

  /**
   * Process the error and determine appropriate user message
   * @param {Error} error - The error to process
   * @returns {Object} - Processed error information
   */
  processError(error, context, operation) {
    const processedError = {
      originalError: error,
      time: new Date().toISOString(),
      context,
      operation,
      userMessage: this.defaultMessages.unknown,
      technicalMessage: error.message || 'No error message provided',
      errorCode: 'UNKNOWN_ERROR',
    };

    // Check for database-related errors
    if (
      error.name === 'DatabaseError' ||
      error.message.includes('database') ||
      error.message.includes('DB')
    ) {
      processedError.errorCode = 'DATABASE_ERROR';

      if (operation === 'loading') {
        processedError.userMessage = this.defaultMessages.database.loading;
      } else if (error.message.includes('connection')) {
        processedError.userMessage = this.defaultMessages.database.connection;
      }
    }
    // Check for server-related errors
    else if (
      error.name === 'ServerError' ||
      error.message.includes('server') ||
      error.status >= 500
    ) {
      processedError.errorCode = 'SERVER_ERROR';

      if (operation === 'loading') {
        processedError.userMessage = this.defaultMessages.server.loading;
      } else if (error.message.includes('timeout')) {
        processedError.userMessage = this.defaultMessages.server.timeout;
      } else {
        processedError.userMessage = this.defaultMessages.server.connection;
      }
    }
    // Check for network-related errors
    else if (error.name === 'NetworkError') {
      processedError.errorCode = 'NETWORK_ERROR';
      processedError.userMessage = this.defaultMessages.network.offline;
    }
    // Check for timeout errors
    else if (error.name === 'TimeoutError' || error.message.includes('timeout')) {
      processedError.errorCode = 'TIMEOUT_ERROR';
      processedError.userMessage = this.defaultMessages.network.timeout;
    }

    return processedError;
  }
}

export default UserErrorMessage;
