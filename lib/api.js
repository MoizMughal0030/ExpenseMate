/**
 * ExpenseMate Frontend API Client
 * Centralized, standardized service layer connecting all UI components to backend Route Handlers
 */

function buildQuery(params = {}) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      query.append(key, value);
    }
  }
  const qStr = query.toString();
  return qStr ? `?${qStr}` : '';
}

async function fetchJson(url, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const config = {
    ...options,
    headers,
  };

  try {
    const res = await fetch(url, config);
    const data = await res.json().catch(() => null);

    if (!res.ok) {
      const errorMsg = data?.message || data?.errors?.join(', ') || `Request failed with status ${res.status}`;
      const error = new Error(errorMsg);
      error.status = res.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      throw new Error('Unable to connect to server. Please check your internet or server status.');
    }
    throw err;
  }
}

export const api = {
  // Authentication
  auth: {
    register: (userData) =>
      fetchJson('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      }),
  },

  // Transactions CRUD & Query
  transactions: {
    list: (params = {}) => fetchJson(`/api/transactions${buildQuery(params)}`),
    get: (id) => fetchJson(`/api/transactions/${id}`),
    create: (data) =>
      fetchJson('/api/transactions', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id, data) =>
      fetchJson(`/api/transactions/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id) =>
      fetchJson(`/api/transactions/${id}`, {
        method: 'DELETE',
      }),
  },

  // Budgets CRUD & Alerts
  budgets: {
    list: (params = {}) => fetchJson(`/api/budgets${buildQuery(params)}`),
    get: (id) => fetchJson(`/api/budgets/${id}`),
    create: (data) =>
      fetchJson('/api/budgets', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id, data) =>
      fetchJson(`/api/budgets/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id) =>
      fetchJson(`/api/budgets/${id}`, {
        method: 'DELETE',
      }),
    alerts: (params = {}) => fetchJson(`/api/budgets/alerts${buildQuery(params)}`),
  },

  // Analytics
  analytics: {
    getSummary: (params = {}) => fetchJson(`/api/analytics${buildQuery(params)}`),
    getBudgetSummary: (params = {}) => fetchJson(`/api/analytics/budget-summary${buildQuery(params)}`),
  },

  // CSV Import & Export
  csv: {
    import: async (formData) => {
      const res = await fetch('/api/csv/import', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        const errorMsg = data?.message || 'CSV Import failed';
        const error = new Error(errorMsg);
        error.data = data;
        throw error;
      }
      return data;
    },
    getExportUrl: (params = {}) => `/api/csv/export${buildQuery(params)}`,
  },
};

export default api;