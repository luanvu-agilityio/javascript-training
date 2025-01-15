class NotificationUtils {
  constructor() {
    this.timeOutDuration = 3000;
    this.initializeContainer();
  }

  initializeContainer() {
    // Create a container for notifications if it doesn't exist
    if (!document.getElementById('notification-container')) {
      const container = document.createElement('div');
      container.id = 'notification-container';
      document.body.appendChild(container);
    }
  }

  show(message, config = {}) {
    const {
      type = 'info',
      duration = this.timeOutDuration,
      title = this.getDefaultTitle(type),
    } = config;

    const notification = document.createElement('div');
    notification.className = `notification notification--${type} show`;
    notification.innerHTML = `
      <div class="notification-content ${type}" role="alert">
        <div class="notification-header">
          <span class="notification-title">${title}</span>
          <button class="notification-close" aria-label="Close">×</button>
        </div>
        <div class="notification-body">
          <span class="notification-message">${message}</span>
        </div>
      </div>
    `;

    const container = document.getElementById('notification-container');
    container.appendChild(notification);

    // Add close button functionality
    const closeButton = notification.querySelector('.notification-close');
    closeButton.addEventListener('click', () => this.hide(notification));

    // Auto-hide after duration
    if (duration !== Infinity) {
      setTimeout(() => this.hide(notification), duration);
    }

    // Log the notification
    this.log(message, type);

    return notification;
  }

  async confirm(message, config = {}) {
    const {
      type = 'warning',
      title = 'Confirmation Required',
      confirmText = 'Confirm',
      cancelText = 'Cancel',
    } = config;

    return new Promise((resolve) => {
      const notification = this.show(message, {
        type,
        title,
        duration: Infinity,
      });

      // Add confirmation buttons
      const buttonsContainer = document.createElement('div');
      buttonsContainer.className = 'notification-buttons';
      buttonsContainer.innerHTML = `
        <button class="btn-confirm">${confirmText}</button>
        <button class="btn-cancel">${cancelText}</button>
      `;

      notification.querySelector('.notification-body').appendChild(buttonsContainer);

      // Add button event listeners
      const confirmBtn = notification.querySelector('.btn-confirm');
      const cancelBtn = notification.querySelector('.btn-cancel');

      confirmBtn.addEventListener('click', () => {
        this.hide(notification);
        resolve(true);
      });

      cancelBtn.addEventListener('click', () => {
        this.hide(notification);
        resolve(false);
      });
    });
  }

  alert(message, config = {}) {
    const { type = 'info', title = this.getDefaultTitle(type) } = config;
    return this.show(message, { type, title });
  }

  hide(notification) {
    notification.classList.add('hide');
    setTimeout(() => notification.remove(), 300);
  }

  getDefaultTitle(type) {
    const titles = {
      success: 'Success',
      error: 'Error',
      warning: 'Warning',
      info: 'Information',
    };
    return titles[type] || titles.info;
  }

  log(message, type = 'error') {
    const time = new Date().toISOString();
    const logMessage = `[${time}] ${type.toUpperCase()}: ${message}`;

    const messageType = {
      success: 'log',
      error: 'error',
      warning: 'warn',
      info: 'info',
    };
    const validMessageType = messageType[type] || 'log';

    console[validMessageType](logMessage);
  }
}

export default NotificationUtils;
