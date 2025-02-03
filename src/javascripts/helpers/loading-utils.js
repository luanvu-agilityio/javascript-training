import Templates from '../templates/templates.js';
class LoadingUtils {
  show() {
    const loadingHTML = Templates.loadingOverlay;
    document.body.insertAdjacentHTML('beforeend', loadingHTML);
  }

  hide() {
    const overlay = document.querySelector('.loading-overlay');
    if (overlay) {
      overlay.remove();
    }
  }
}

export default LoadingUtils;