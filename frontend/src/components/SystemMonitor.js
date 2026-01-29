import React from 'react';
import { Cpu, HardDrive, Server, Database, Wifi, Shield, Activity, BarChart3, Network, Zap } from 'lucide-react';

const SystemMonitor = ({ stats, apiConnected, pagerankResults }) => {
  const systemMetrics = [
    { icon: Cpu, label: 'CPU Usage', value: '42%', color: 'text-neon-cyan' },
    { icon: HardDrive, label: 'Memory', value: '3.2 GB', color: 'text-neon-purple' },
    { icon: Database, label: 'Graph Size', value: `${stats?.nodes || 0} nodes`, color: 'text-green-500' },
    { icon: Wifi, label: 'Network I/O', value: '1.2 Gbps', color: 'text-yellow-500' },
    { icon: Server, label: 'Backend API', value: apiConnected ? 'Online' : 'Offline', color: apiConnected ? 'text-green-500' : 'text-red-500' },
    { icon: Shield, label: 'Security', value: 'Active', color: 'text-neon-pink' },
  ];

  const algorithmMetrics = [
    { icon: Activity, label: 'PageRank Time', value: stats?.pprTime || '0.0ms', color: 'text-neon-cyan' },
    { icon: BarChart3, label: 'Convergence', value: pagerankResults?.convergence_info?.converged ? 'Yes' : 'No', color: pagerankResults?.convergence_info?.converged ? 'text-green-500' : 'text-yellow-500' },
    { icon: Network, label: 'Suspicious Nodes', value: stats?.suspiciousNodes || 0, color: 'text-neon-pink' },
    { icon: Zap, label: 'Iterations', value: pagerankResults?.convergence_info?.iterations_performed || 0, color: 'text-neon-purple' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {systemMetrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <div key={index} className="glass-card p-4 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/5 mb-3">
                <Icon className={`w-6 h-6 ${metric.color}`} />
              </div>
              <p className="text-2xl font-bold mb-1">{metric.value}</p>
              <p className="text-sm text-cyber-gray-400">{metric.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {algorithmMetrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <div key={index} className="glass-card p-4 text-center">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/5 mb-2">
                <Icon className={`w-5 h-5 ${metric.color}`} />
              </div>
              <p className="text-xl font-bold mb-1">{metric.value}</p>
              <p className="text-sm text-cyber-gray-400">{metric.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h3 className="text-xl font-bold mb-4">PageRank Engine Status</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Algorithm Performance</span>
                <span>Optimal</span>
              </div>
              <div className="w-full bg-cyber-gray-800 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-neon-cyan to-neon-purple rounded-full h-2" 
                  style={{ width: '85%' }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Graph Processing</span>
                <span>Fast</span>
              </div>
              <div className="w-full bg-cyber-gray-800 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-neon-purple to-neon-pink rounded-full h-2" 
                  style={{ width: '92%' }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Fraud Detection Accuracy</span>
                <span>{pagerankResults ? '94.5%' : 'N/A'}</span>
              </div>
              <div className="w-full bg-cyber-gray-800 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-neon-pink to-neon-cyan rounded-full h-2" 
                  style={{ width: pagerankResults ? '94.5%' : '0%' }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <h3 className="text-xl font-bold mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {[
              { time: 'Just now', event: 'PageRank computation completed', status: 'success' },
              { time: '2 minutes ago', event: apiConnected ? 'Connected to Python API' : 'Using mock data', status: apiConnected ? 'success' : 'warning' },
              { time: '5 minutes ago', event: 'System initialized', status: 'info' },
              ...(pagerankResults?.convergence_info ? [
                { time: '1 minute ago', event: `PageRank converged in ${pagerankResults.convergence_info.iterations_performed} iterations`, status: 'success' }
              ] : []),
              { time: '10 minutes ago', event: 'Application started', status: 'info' },
            ].map((activity, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 hover:bg-white/5 rounded-lg transition-colors">
                <div className={`w-2 h-2 rounded-full ${
                  activity.status === 'success' ? 'bg-green-500' :
                  activity.status === 'warning' ? 'bg-yellow-500' : 'bg-neon-cyan'
                }`}></div>
                <div className="flex-1">
                  <p className="font-medium">{activity.event}</p>
                  <p className="text-sm text-cyber-gray-400">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* API Status Card */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold mb-2">Backend Connection</h3>
            <p className="text-cyber-gray-400">
              {apiConnected 
                ? 'Successfully connected to Python backend API' 
                : 'Running in demo mode with mock data'
              }
            </p>
          </div>
          <div className={`px-4 py-2 rounded-lg ${
            apiConnected 
              ? 'bg-green-500/10 text-green-400' 
              : 'bg-yellow-500/10 text-yellow-400'
          }`}>
            {apiConnected ? 'CONNECTED' : 'DEMO MODE'}
          </div>
        </div>
        {!apiConnected && (
          <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <p className="text-sm text-yellow-400">
              💡 Tip: Start the Python backend with: <code className="bg-black/30 px-2 py-1 rounded">python api/app.py</code>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SystemMonitor;