/**
 * API service for connecting to Python backend
 */

const API_BASE_URL = 'http://localhost:5000';

class FraudDetectionAPI {
  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  async healthCheck() {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      return await response.json();
    } catch (error) {
      console.error('Health check failed:', error);
      return { status: 'unhealthy', error: error.message };
    }
  }

  async createDemoGraph() {
    try {
      const response = await fetch(`${this.baseUrl}/graph/demo`);
      return await response.json();
    } catch (error) {
      console.error('Failed to create demo graph:', error);
      throw error;
    }
  }

  async computePageRank(params) {
    try {
      const response = await fetch(`${this.baseUrl}/pagerank/compute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });
      return await response.json();
    } catch (error) {
      console.error('Failed to compute PageRank:', error);
      throw error;
    }
  }

  async getCurrentGraph() {
    try {
      const response = await fetch(`${this.baseUrl}/graph/current`);
      return await response.json();
    } catch (error) {
      console.error('Failed to get current graph:', error);
      throw error;
    }
  }

  async markSuspiciousNodes(suspiciousNodes) {
    try {
      const response = await fetch(`${this.baseUrl}/nodes/suspicious`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ suspicious_nodes: suspiciousNodes }),
      });
      return await response.json();
    } catch (error) {
      console.error('Failed to mark suspicious nodes:', error);
      throw error;
    }
  }

  async getAnalysisSummary() {
    try {
      const response = await fetch(`${this.baseUrl}/analysis/summary`);
      return await response.json();
    } catch (error) {
      console.error('Failed to get analysis summary:', error);
      throw error;
    }
  }
}

export default new FraudDetectionAPI();