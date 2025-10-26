// VM-safe browser API wrappers
export const vmSafe = {
  // Safe window operations
  scrollTo: (x = 0, y = 0, options = {}) => {
    try {
      if (typeof window !== 'undefined' && window.scrollTo) {
        if (typeof x === 'object') {
          window.scrollTo(x);
        } else {
          window.scrollTo(x, y);
        }
      }
    } catch (e) {
      console.warn('scrollTo not available in this environment:', e);
    }
  },

  // Safe history operations
  replaceState: (data, title, url) => {
    try {
      if (typeof window !== 'undefined' && window.history && window.history.replaceState) {
        window.history.replaceState(data, title, url);
      }
    } catch (e) {
      console.warn('replaceState not available in this environment:', e);
    }
  },

  // Safe document operations
  getElementById: (id) => {
    try {
      if (typeof document !== 'undefined' && document.getElementById) {
        return document.getElementById(id);
      }
    } catch (e) {
      console.warn('getElementById not available in this environment:', e);
    }
    return null;
  },

  querySelector: (selector) => {
    try {
      if (typeof document !== 'undefined' && document.querySelector) {
        return document.querySelector(selector);
      }
    } catch (e) {
      console.warn('querySelector not available in this environment:', e);
    }
    return null;
  },

  // Safe storage operations
  sessionStorage: {
    getItem: (key) => {
      try {
        if (typeof window !== 'undefined' && window.sessionStorage) {
          return window.sessionStorage.getItem(key);
        }
      } catch (e) {
        console.warn('sessionStorage.getItem not available:', e);
      }
      return null;
    },
    setItem: (key, value) => {
      try {
        if (typeof window !== 'undefined' && window.sessionStorage) {
          window.sessionStorage.setItem(key, value);
        }
      } catch (e) {
        console.warn('sessionStorage.setItem not available:', e);
      }
    },
    removeItem: (key) => {
      try {
        if (typeof window !== 'undefined' && window.sessionStorage) {
          window.sessionStorage.removeItem(key);
        }
      } catch (e) {
        console.warn('sessionStorage.removeItem not available:', e);
      }
    }
  },

  // Safe location operations
  getPathname: () => {
    try {
      if (typeof window !== 'undefined' && window.location) {
        return window.location.pathname;
      }
    } catch (e) {
      console.warn('location.pathname not available:', e);
    }
    return '/';
  },

  // Check if running in iframe/VM
  isInIframe: () => {
    try {
      return typeof window !== 'undefined' && window.self !== window.top;
    } catch (e) {
      return false;
    }
  },

  // Check if running in VM environment
  isVMEnvironment: () => {
    try {
      // Common VM environment indicators
      const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : '';
      const hostname = typeof window !== 'undefined' && window.location ? window.location.hostname : '';
      
      return (
        hostname.includes('codesandbox.io') ||
        hostname.includes('stackblitz.com') ||
        hostname.includes('replit.') ||
        hostname.includes('codepen.io') ||
        hostname.includes('jsbin.com') ||
        hostname.includes('jsfiddle.net') ||
        userAgent.includes('jsdom') ||
        typeof window === 'undefined'
      );
    } catch (e) {
      return false;
    }
  }
};

export default vmSafe;