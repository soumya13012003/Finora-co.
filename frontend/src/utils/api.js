const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiService {
  async request(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Remove Content-Type for FormData
    if (options.body instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }
      return data;
    } catch (error) {
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        throw new Error('Unable to connect to Finora-Co API. Please ensure the backend is running.');
      }
      throw error;
    }
  }

  // Health
  health() {
    return this.request('/health');
  }

  // Documents
  uploadDocument(file) {
    const formData = new FormData();
    formData.append('file', file);
    return this.request('/documents/upload', {
      method: 'POST',
      body: formData,
    });
  }

  listDocuments() {
    return this.request('/documents');
  }

  getDocument(id) {
    return this.request(`/documents/${id}`);
  }

  deleteDocument(id) {
    return this.request(`/documents/${id}`, { method: 'DELETE' });
  }

  // Analytics
  getOverview() {
    return this.request('/analytics/overview');
  }

  getRegionalAnalytics() {
    return this.request('/analytics/regional');
  }

  getDemandTrends() {
    return this.request('/analytics/demand-trends');
  }

  getInvestmentZones() {
    return this.request('/analytics/investment-zones');
  }

  getRiskGrowth() {
    return this.request('/analytics/risk-growth');
  }

  // Demo data
  loadDemoData() {
    return this.request('/demo/load', { method: 'POST' });
  }

  clearData() {
    return this.request('/demo/clear', { method: 'POST' });
  }

  // Chat
  sendMessage(message, sessionId) {
    return this.request('/chat', {
      method: 'POST',
      body: JSON.stringify({ message, session_id: sessionId }),
    });
  }

  getChatSessions() {
    return this.request('/chat/sessions');
  }

  getChatSession(sessionId) {
    return this.request(`/chat/sessions/${sessionId}`);
  }
}

const api = new ApiService();
export default api;
