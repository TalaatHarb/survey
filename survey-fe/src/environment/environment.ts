declare global {
  interface Window {
    _env_: {
      API_URL?: string;
    }
  }
}

if (!window._env_) {
  window._env_ = {};
}

// Use empty string for relative API calls (same-origin), fallback to localhost for local dev
const API_URL = window._env_.API_URL !== undefined ? window._env_.API_URL : 'http://localhost:8080';


export const environment = {
  apiUrl: API_URL,
  defaultPageSize: 10,
  defaultSort: 'updateDate,desc',
  production: false,
};