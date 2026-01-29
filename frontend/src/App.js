import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  Activity, 
  Cpu, 
  Shield, 
  Network, 
  Zap, 
  Users, 
  BarChart3,
  Play,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import GraphVisualization from './components/GraphVisualization';
import FraudMetrics from './components/FraudMetrics';
import NodeDetails from './components/NodeDetails';
import SystemMonitor from './components/SystemMonitor';
import api from './services/api';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [graphData, setGraphData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [apiConnected, setApiConnected] = useState(false);
  const [pagerankResults, setPagerankResults] = useState(null);
  const [systemStats, setSystemStats] = useState({
    nodes: 0,
    edges: 0,
    suspiciousNodes: 0,
    pprTime: '0.0ms'
  });
  const [error, setError] = useState(null);
  const [analysisRunning, setAnalysisRunning] = useState(false);

  // Load initial data
  useEffect(() => {
    checkApiConnection();
    loadInitialData();
  }, []);

  const checkApiConnection = async () => {
    try {
      const health = await api.healthCheck();
      setApiConnected(health.status === 'healthy');
    } catch (err) {
      console.error('API connection failed:', err);
      setApiConnected(false);
    }
  };

  const loadInitialData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (!apiConnected) {
        // Use mock data if API is not connected
      //  loadMockData();
        return;
      }

      // 1. Create demo graph
      const graphResponse = await api.createDemoGraph();
      
      if (!graphResponse.success) {
        throw new Error('Failed to create graph');
      }

      // 2. Mark some nodes as suspicious (for demo)
      const suspiciousNodes = {
        'A': 0.8,
        'C': 0.6,
        'E': 0.9,
        'G': 0.7
      };
      
      await api.markSuspiciousNodes(suspiciousNodes);
      
      // 3. Compute PageRank
      await computePageRank(suspiciousNodes, graphResponse);
      
    } catch (err) {
      console.error('Failed to load data:', err);
      setError(err.message);
      // Fallback to mock data
     // loadMockData();
    } finally {
      setLoading(false);
    }
  };

  const computePageRank = async (suspiciousNodes, graphResponse = null) => {
    setAnalysisRunning(true);
    
    try {
      // If graph response is not provided, get current graph
      if (!graphResponse) {
        graphResponse = await api.getCurrentGraph();
      }
      
      const pprResponse = await api.computePageRank({
        damping_factor: 0.85,
        max_iterations: 100,
        tolerance: 1e-8,
        suspicious_nodes: suspiciousNodes
      });
      
      if (pprResponse.success) {
        setPagerankResults(pprResponse);
        
        // Transform data for frontend components
        const transformedData = transformDataForFrontend(
          graphResponse,
          pprResponse,
          suspiciousNodes
        );
        
        setGraphData(transformedData.graphData);
        setSystemStats(transformedData.systemStats);
      } else {
        throw new Error(pprResponse.error || 'Failed to compute PageRank');
      }
    } catch (err) {
      console.error('Failed to compute PageRank:', err);
      setError(err.message);
    } finally {
      setAnalysisRunning(false);
    }
  };

  const transformDataForFrontend = (graphResponse, pprResponse, suspiciousNodes) => {
    const nodes = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map(nodeId => {
      const nodeDetail = pprResponse.node_details?.find(n => n.id === nodeId) || {};
      const suspicion = suspiciousNodes[nodeId] || 0;
      
      // Calculate group based on PageRank score for visualization
      const pprScore = nodeDetail.page_rank || 0;
      let group = 1;
      if (pprScore > 0.6) group = 2;
      if (pprScore > 0.8) group = 3;
      if (suspicion > 0.5) group = 4;
      
      return {
        id: nodeId,
        group: group,
        ppr: pprScore,
        suspicious: suspicion > 0.5,
        transactions: nodeDetail.total_connections || Math.floor(Math.random() * 200) + 50,
        suspicionScore: suspicion
      };
    });

    // Use edges from API response or create default edges
    const links = graphResponse.edges || [
      { source: 'A', target: 'B', value: 15000 },
      { source: 'A', target: 'C', value: 45000 },
      { source: 'B', target: 'D', value: 12000 },
      { source: 'C', target: 'E', value: 78000 },
      { source: 'D', target: 'F', value: 9000 },
      { source: 'E', target: 'G', value: 125000 },
      { source: 'F', target: 'H', value: 8000 },
      { source: 'G', target: 'A', value: 95000 },
      { source: 'H', target: 'B', value: 11000 },
      { source: 'C', target: 'H', value: 32000 },
      { source: 'E', target: 'F', value: 56000 },
      { source: 'G', target: 'D', value: 87000 }
    ];
    

    return {
      graphData: { nodes, links },
      systemStats: {
        nodes: graphResponse.node_count || nodes.length,
        edges: graphResponse.edge_count || links.length,
        suspiciousNodes: Object.keys(suspiciousNodes).length,
        pprTime: `${pprResponse.compute_time_ms?.toFixed(1) || '0.0'}ms`
      }
    };
  };
/*
  const loadMockData = () => {
    // Mock data for when API is not available
    setTimeout(() => {
      setGraphData({
        nodes: [
          { id: 'A', group: 1, ppr: 0.45, suspicious: true, transactions: 120, suspicionScore: 0.8 },
          { id: 'B', group: 1, ppr: 0.32, suspicious: false, transactions: 85, suspicionScore: 0.1 },
          { id: 'C', group: 2, ppr: 0.78, suspicious: true, transactions: 210, suspicionScore: 0.6 },
          { id: 'D', group: 2, ppr: 0.21, suspicious: false, transactions: 45, suspicionScore: 0.2 },
          { id: 'E', group: 3, ppr: 0.67, suspicious: true, transactions: 180, suspicionScore: 0.9 },
          { id: 'F', group: 3, ppr: 0.12, suspicious: false, transactions: 32, suspicionScore: 0.3 },
          { id: 'G', group: 4, ppr: 0.89, suspicious: true, transactions: 300, suspicionScore: 0.7 },
          { id: 'H', group: 4, ppr: 0.34, suspicious: false, transactions: 90, suspicionScore: 0.4 },
        ],
        links: [
          { source: 'A', target: 'B', value: 15000 },
          { source: 'A', target: 'C', value: 45000 },
          { source: 'B', target: 'D', value: 12000 },
          { source: 'C', target: 'E', value: 78000 },
          { source: 'D', target: 'F', value: 9000 },
          { source: 'E', target: 'G', value: 125000 },
          { source: 'F', target: 'H', value: 8000 },
          { source: 'G', target: 'A', value: 95000 },
          { source: 'H', target: 'B', value: 11000 },
          { source: 'C', target: 'H', value: 32000 },
          { source: 'E', target: 'F', value: 56000 },
          { source: 'G', target: 'D', value: 87000 }
        ]
      });
      

      setSystemStats({
        nodes: 8,
        edges: 12,
        suspiciousNodes: 4,
        pprTime: '2.3ms'
      });

      setLoading(false);
    }, 1000);
  };
  */

  const handleStartAnalysis = async () => {
    if (apiConnected) {
      await computePageRank({
        'A': 0.8,
        'C': 0.6,
        'E': 0.9,
        'G': 0.7,
        'B': 0.3, // Add some randomness
        'H': 0.4
      });
    } else {
      // Reload mock data with some variation
   //   loadMockData();
    }
  };

  const handleRefresh = () => {
    loadInitialData();
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity },
    { id: 'graph', label: 'Network Graph', icon: Network },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'monitor', label: 'System Monitor', icon: Cpu },
  ];

  return (
    <div className="min-h-screen bg-deep-black bg-cyber-grid">
      {/* Header */}
      <header className="border-b border-neon-cyan/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-neon-cyan to-neon-purple">
                <Shield className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold cyber-text text-neon-cyan">
                  Fraud Detection System
                </h1>
                <div className="flex items-center space-x-3 mt-1">
                  <p className="text-cyber-gray-400 text-sm">
                    Personalized PageRank Engine • Real-time Analysis
                  </p>
                  <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${
                    apiConnected 
                      ? 'bg-green-500/10 text-green-400' 
                      : 'bg-red-500/10 text-red-400'
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${
                      apiConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                    }`}></div>
                    <span>{apiConnected ? 'API Connected' : 'API Disconnected'}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2 px-4 py-2 glass-card rounded-lg">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-sm">System Active</span>
              </div>
              
              <button 
                onClick={handleRefresh}
                className="flex items-center space-x-2 px-4 py-2 glass-card rounded-lg hover:bg-white/5 transition-colors"
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
              
              <button 
                onClick={handleStartAnalysis}
                disabled={analysisRunning}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-neon-cyan to-neon-purple rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {analysisRunning ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    <span>Start Analysis</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Error Alert */}
      {error && (
        <div className="container mx-auto px-4 pt-4">
          <div className="glass-card border border-red-500/30 bg-red-500/10 p-4 rounded-lg flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-red-300">Error: {error}</p>
              <p className="text-sm text-red-400/80 mt-1">
                Using mock data. Make sure Python backend is running on port 5000.
              </p>
            </div>
            <button 
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-300"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="glass-card p-6 relative overflow-hidden">
            <div className="scan-line"></div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-cyber-gray-400 text-sm">Total Nodes</p>
                <p className="text-3xl font-bold text-neon-cyan">{systemStats.nodes}</p>
                <p className="text-xs text-cyber-gray-500 mt-1">
                  {apiConnected ? 'Live Data' : 'Mock Data'}
                </p>
              </div>
              <div className="p-3 rounded-full bg-neon-cyan/10">
                <Users className="w-6 h-6 text-neon-cyan" />
              </div>
            </div>
          </div>

          <div className="glass-card p-6 relative overflow-hidden">
            <div className="scan-line"></div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-cyber-gray-400 text-sm">Suspicious Nodes</p>
                <p className="text-3xl font-bold text-neon-pink">{systemStats.suspiciousNodes}</p>
                <p className="text-xs text-cyber-gray-500 mt-1">
                  {systemStats.suspiciousNodes > 3 ? 'High Risk' : 'Normal'}
                </p>
              </div>
              <div className="p-3 rounded-full bg-neon-pink/10">
                <AlertTriangle className="w-6 h-6 text-neon-pink" />
              </div>
            </div>
          </div>

          <div className="glass-card p-6 relative overflow-hidden">
            <div className="scan-line"></div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-cyber-gray-400 text-sm">PPR Computation</p>
                <p className="text-3xl font-bold text-neon-purple">{systemStats.pprTime}</p>
                <p className="text-xs text-cyber-gray-500 mt-1">
                  {apiConnected ? 'Python Backend' : 'Simulated'}
                </p>
              </div>
              <div className="p-3 rounded-full bg-neon-purple/10">
                <Zap className="w-6 h-6 text-neon-purple" />
              </div>
            </div>
          </div>

          <div className="glass-card p-6 relative overflow-hidden">
            <div className="scan-line"></div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-cyber-gray-400 text-sm">Network Edges</p>
                <p className="text-3xl font-bold text-white">{systemStats.edges}</p>
                <p className="text-xs text-cyber-gray-500 mt-1">
                  Total connections
                </p>
              </div>
              <div className="p-3 rounded-full bg-white/10">
                <Network className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-2 mb-8 overflow-x-auto pb-2">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-neon-cyan/20 to-neon-purple/20 border border-neon-cyan/30'
                    : 'glass-card hover:bg-white/5'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="glass-card p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-cyan mx-auto mb-4"></div>
            <p className="text-cyber-gray-400">
              {apiConnected ? 'Connecting to Python Backend...' : 'Loading Demo Data...'}
            </p>
            <p className="text-sm text-cyber-gray-500 mt-2">
              Initializing Personalized PageRank Engine
            </p>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <div className="glass-card p-6 h-full">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-bold flex items-center">
                        <Network className="w-6 h-6 mr-2 text-neon-cyan" />
                        Network Visualization
                      </h2>
                      <div className="text-sm text-cyber-gray-400">
                        {apiConnected ? 'Real-time Graph' : 'Demo Graph'}
                      </div>
                    </div>
                    <div className="h-[400px]">
                      <GraphVisualization data={graphData} />
                    </div>
                  </div>
                </div>
                <div>
                  <div className="glass-card p-6 h-full">
                    <h2 className="text-xl font-bold mb-6 flex items-center">
                      <AlertTriangle className="w-6 h-6 mr-2 text-neon-pink" />
                      Top Fraud Alerts
                    </h2>
                    <FraudMetrics 
                      data={graphData} 
                      pagerankResults={pagerankResults}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'graph' && (
              <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">Interactive Network Analysis</h2>
                  <div className="text-sm text-cyber-gray-400">
                    Click and drag nodes to explore
                  </div>
                </div>
                <div className="h-[600px] rounded-lg overflow-hidden">
                  <GraphVisualization data={graphData} interactive={true} />
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="glass-card p-6">
                  <h2 className="text-xl font-bold mb-6">Node Details</h2>
                  <NodeDetails 
                    data={graphData} 
                    pagerankResults={pagerankResults}
                  />
                </div>
                <div className="glass-card p-6">
                  <h2 className="text-xl font-bold mb-6">PageRank Distribution</h2>
                  <div className="space-y-4">
                    {pagerankResults?.convergence_info && (
                      <div className="mb-6 p-4 bg-white/5 rounded-lg">
                        <h3 className="font-semibold mb-2 text-neon-cyan">Convergence Info</h3>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <span className="text-cyber-gray-400">Status:</span>
                            <span className={`ml-2 ${
                              pagerankResults.convergence_info.converged 
                                ? 'text-green-400' 
                                : 'text-yellow-400'
                            }`}>
                              {pagerankResults.convergence_info.converged ? 'Converged' : 'Not Converged'}
                            </span>
                          </div>
                          <div>
                            <span className="text-cyber-gray-400">Iterations:</span>
                            <span className="ml-2 text-white">
                              {pagerankResults.convergence_info.iterations_performed}
                            </span>
                          </div>
                          <div>
                            <span className="text-cyber-gray-400">Damping Factor:</span>
                            <span className="ml-2 text-white">
                              {pagerankResults.convergence_info.damping_factor}
                            </span>
                          </div>
                          <div>
                            <span className="text-cyber-gray-400">Tolerance:</span>
                            <span className="ml-2 text-white">
                              {pagerankResults.convergence_info.tolerance}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="h-48 flex items-center justify-center text-cyber-gray-400">
                      <div className="text-center">
                        <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p>PageRank distribution chart</p>
                        <p className="text-sm mt-1">(Chart visualization would appear here)</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'monitor' && (
              <SystemMonitor 
                stats={systemStats} 
                apiConnected={apiConnected}
                pagerankResults={pagerankResults}
              />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-neon-cyan/20 mt-8 py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-center md:text-left mb-4 md:mb-0">
              <p className="text-cyber-gray-400 text-sm">
                © 2024 Fraud Detection System • Personalized PageRank Algorithm v2.1
              </p>
              <p className="text-cyber-gray-500 text-sm mt-1">
                {apiConnected 
                  ? 'Connected to Python Backend API' 
                  : 'Running in demo mode with mock data'
                }
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-cyber-gray-400">
                <span className="inline-flex items-center">
                  <div className={`w-2 h-2 rounded-full mr-2 ${
                    apiConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                  }`}></div>
                  Backend: {apiConnected ? 'Online' : 'Offline'}
                </span>
              </div>
              <button
                onClick={() => window.open('http://localhost:5000', '_blank')}
                className="text-sm px-3 py-1 glass-card rounded hover:bg-white/5 transition-colors"
              >
                API Docs
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;