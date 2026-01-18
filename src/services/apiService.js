// ============================================
// CONFIGURATION
// ============================================

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

// Global flag for server error state (persists even if event is missed)
let serverErrorOccurred = false;
export const hasServerError = () => serverErrorOccurred;
export const clearServerError = () => { serverErrorOccurred = false; };

const emitServerError = () => {
  serverErrorOccurred = true;
  window.dispatchEvent(new Event('server-error'));
};

// ============================================
// REQUEST HANDLING
// ============================================

/**
 * Generic API request wrapper with error handling and auth
 * @param {string} endpoint - API endpoint (e.g., '/kana')
 * @param {RequestInit} options - Fetch options
 * @param {boolean} options.skipRetry - Skip automatic token refresh on 401
 * @returns {Promise<any>} - Parsed JSON response
 */
const request = async (endpoint, options = {}) => {
  const { skipRetry, ...fetchOptions } = options;

  const headers = {
    'Content-Type': 'application/json',
    ...fetchOptions.headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...fetchOptions,
      headers,
      credentials: 'include', // Send cookies with requests
    });

    // Handle 401 - try to refresh token (cookies sent automatically)
    // Skip if this is a retry attempt or skipRetry flag is set
    if (response.status === 401 && !fetchOptions._retry && !skipRetry) {
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        // Retry original request with new token (in cookie)
        return request(endpoint, { ...fetchOptions, _retry: true });
      }
    }

    if (!response.ok) {
      if (response.status >= 500) {
        emitServerError();
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `API request failed: ${response.status} ${response.statusText}`
      );
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
};

const refreshAccessToken = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // Send refresh token cookie
    });

    return response.ok;
  } catch (error) {
    console.error('Failed to refresh token:', error);
    return false;
  }
};

// ============================================
// API ENDPOINTS
// ============================================

export const kanaAPI = {
  getAll: () => request('/kana'),
};

export const vocabularyAPI = {
  getLists: (lang = 'en') => request(`/vocabulary/lists?lang=${lang}`),
  getWords: (listIds, lang = 'en') => {
    // Accept either a single ID or array of IDs
    const ids = Array.isArray(listIds) ? listIds : [listIds];
    const idsParam = ids.map(id => `listIds=${encodeURIComponent(id)}`).join('&');
    return request(`/vocabulary?${idsParam}&lang=${lang}`);
  },
  addToFavorites: (wordId) => request(`/vocabulary/${wordId}/favorite`, { method: 'POST' }),
  removeFromFavorites: (wordId) => request(`/vocabulary/${wordId}/favorite`, { method: 'DELETE' }),
};

export const kanjiAPI = {
  getLists: (lang = 'en') => request(`/kanji/lists?lang=${lang}`),
  getKanji: (listIds, lang = 'en') => {
    const ids = Array.isArray(listIds) ? listIds : [listIds];
    const idsParam = ids.map(id => `listIds=${encodeURIComponent(id)}`).join('&');
    return request(`/kanji?${idsParam}&lang=${lang}`);
  },
  addToFavorites: (kanjiId) => request(`/kanji/${kanjiId}/favorite`, { method: 'POST' }),
  removeFromFavorites: (kanjiId) => request(`/kanji/${kanjiId}/favorite`, { method: 'DELETE' }),
};

export const authAPI = {
  loginWithGoogle: async (token, deviceInfo = {}) => {
    const data = await request('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ token }),
      headers: deviceInfo.deviceId ? {
        'x-device-id': deviceInfo.deviceId,
        'x-device-info': JSON.stringify(deviceInfo),
      } : {},
    });
    return data;
  },

  loginWithApple: async (token, deviceInfo = {}) => {
    const data = await request('/auth/apple', {
      method: 'POST',
      body: JSON.stringify({ token }),
      headers: deviceInfo.deviceId ? {
        'x-device-id': deviceInfo.deviceId,
        'x-device-info': JSON.stringify(deviceInfo),
      } : {},
    });
    return data;
  },

  logout: async () => {
    try {
      await request('/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout failed:', error);
    }
  },

  logoutAll: async () => {
    try {
      await request('/auth/logout-all', { method: 'POST' });
    } catch (error) {
      console.error('Logout all failed:', error);
    }
  },

  getCurrentUser: () => request('/users/me'),

  // Check current user without triggering refresh (used for initial auth check)
  checkCurrentUser: () => request('/users/me', { skipRetry: true }),
};

export const subscriptionAPI = {
  getOptions: () => request('/subscription/options'),
  createCheckout: (priceId, isLifetime, successUrl, cancelUrl) => request('/subscription/checkout', {
    method: 'POST',
    body: JSON.stringify({ priceId, isLifetime, successUrl, cancelUrl }),
  }),
  refreshStatus: () => request('/subscription/refresh', { method: 'POST' }),
  getPortalUrl: (returnUrl) => request('/subscription/portal', {
    method: 'POST',
    body: JSON.stringify({ returnUrl }),
  }),
};


export default {
  kana: kanaAPI,
  vocabulary: vocabularyAPI,
  kanji: kanjiAPI,
  auth: authAPI,
  subscription: subscriptionAPI,
};
