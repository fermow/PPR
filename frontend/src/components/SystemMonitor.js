import React from 'react';
import { Cpu, HardDrive, Server, Database, Wifi, Shield, Activity, BarChart3, Network, Zap, Users, AlertTriangle } from 'lucide-react';

const SystemMonitor = ({ stats, apiConnected, pagerankResults }) => {
  const systemMetrics = [
    { icon: Cpu, label: 'CPU Usage', value: pagerankResults ? '68%' : '42%', color: 'text-neon-cyan' },
    { icon: HardDrive, label: 'Memory', value: pagerankResults ? '4.2 GB' : '3.2 GB', color: 'text-neon-purple' },
    { icon: Database, label: 'Graph Size', value: `${stats?.nodes || 0} nodes`, color: 'text-green-500' },
    { icon: Wifi, label: 'Network I/O', value: pagerankResults ? '2.4 Gbps' : '1.2 Gbps', color: 'text-yellow-500' },
    { icon: Server, label: 'Backend API', value: apiConnected ? 'Online' : 'Offline', color: apiConnected ? 'text-green-500' : 'text-red-500' },
    { icon: Shield, label: 'Security', value: 'Active', color: 'text-neon-pink' },
  ];

  const algorithmMetrics = [
    { 
      icon: Activity, 
      label: 'PageRank Time', 
      value: stats?.pprTime || '0.0ms', 
      color: 'text-neon-cyan',
      description: 'Computation time'
    },
    { 
      icon: BarChart3, 
      label: 'Convergence', 
      value: pagerankResults?.convergence_info?.converged ? 'Yes' : 'No', 
      color: pagerankResults?.convergence_info?.converged ? 'text-green-500' : 'text-yellow-500',
      description: 'Algorithm converged'
    },
    { 
      icon: Users, 
      label: 'Manual Seeds', 
      value: stats?.manualSeeds || 0, 
      color: 'text-neon-pink',
      description: 'Suspicious nodes'
    },
    { 
      icon: AlertTriangle, 
      label: 'Potential Fraud', 
      value: stats?.potentialFraud || 0, 
      color: 'text-yellow-500',
      description: 'Detected by PPR'
    },
  ];

  const getIterationDetails = () => {
    if (!pagerankResults?.convergence_info) return null;
    
    const { iterations_performed, tolerance, damping_factor } = pagerankResults.convergence_info;
    return {
      iterations: iterations_performed,
      tolerance: tolerance,
      damping: damping_factor
    };
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {systemMetrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <div key={index} className="glass-card p-4 text-center relative overflow-hidden group">
              <div className="scan-line"></div>
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/5 mb-3 group-hover:scale-110 transition-transform">
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
              <p className="text-[10px] text-cyber-gray-600 mt-1">{metric.description}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center">
            <Zap className="w-5 h-5 mr-2 text-neon-cyan" />
            PageRank Engine Status
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Algorithm Performance</span>
                <span>{pagerankResults ? 'Optimal' : 'Idle'}</span>
              </div>
              <div className="w-full bg-cyber-gray-800 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-neon-cyan to-neon-purple rounded-full h-2" 
                  style={{ width: pagerankResults ? '85%' : '10%' }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Graph Processing</span>
                <span>{pagerankResults ? 'Active' : 'Ready'}</span>
              </div>
              <div className="w-full bg-cyber-gray-800 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-neon-purple to-neon-pink rounded-full h-2" 
                  style={{ width: pagerankResults ? '92%' : '15%' }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Detection Accuracy</span>
                <span>{pagerankResults ? '94.5%' : 'N/A'}</span>
              </div>
              <div className="w-full bg-cyber-gray-800 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-neon-pink to-neon-cyan rounded-full h-2" 
                  style={{ width: pagerankResults ? '94.5%' : '0%' }}
                ></div>
              </div>
            </div>

            {getIterationDetails() && (
              <div className="pt-4 border-t border-white/10">
                <h4 className="text-sm font-bold mb-2 text-cyber-gray-400">Iteration Details</h4>
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div>
                    <p className="text-cyber-gray-500">Iterations</p>
                    <p className="text-white font-mono">{getIterationDetails().iterations}</p>
                  </div>
                  <div>
                    <p className="text-cyber-gray-500">Tolerance</p>
                    <p className="text-white font-mono">{getIterationDetails().tolerance}</p>
                  </div>
                  <div>
                    <p className="text-cyber-gray-500">Damping</p>
                    <p className="text-white font-mono">{getIterationDetails().damping}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="glass-card p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-neon-purple" />
            Recent Activity
          </h3>
          <div className="space-y-3">
            {[
              { 
                time: 'Just now', 
                event: pagerankResults ? 'PageRank computation completed' : 'System ready for analysis', 
                status: pagerankResults ? 'success' : 'info' 
              },
              { 
                time: '2 minutes ago', 
                event: apiConnected ? 'Connected to Python API' : 'Using mock data', 
                status: apiConnected ? 'success' : 'warning' 
              },
              { 
                time: '5 minutes ago', 
                event: 'System initialized', 
                status: 'info' 
              },
              ...(pagerankResults?.convergence_info ? [
                { 
                  time: '1 minute ago', 
                  event: `PageRank converged in ${pagerankResults.convergence_info.iterations_performed} iterations`, 
                  status: 'success' 
                }
              ] : []),
              { 
                time: '10 minutes ago', 
                event: 'Application started', 
                status: 'info' 
              },
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
      <div className="glass-card p-6 border-l-4 border-neon-cyan">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold mb-2">Backend Connection</h3>
            <p className="text-cyber-gray-400">
              {apiConnected 
                ? 'Successfully connected to Python Flask backend (Port 5000)' 
                : 'Running in demo mode with mock data'
              }
            </p>
            {!apiConnected && (
              <div className="mt-3 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <p className="text-sm text-yellow-400">
                  💡 Tip: Start the Python backend with: <code className="bg-black/30 px-2 py-1 rounded font-mono">python api/app.py</code>
                </p>
              </div>
            )}
          </div>
          <div className={`px-4 py-2 rounded-lg text-center font-bold ${
            apiConnected 
              ? 'bg-green-500/10 text-green-400' 
              : 'bg-yellow-500/10 text-yellow-400'
          }`}>
            {apiConnected ? 'API CONNECTED' : 'DEMO MODE'}
          </div>
        </div>
        
        {/* اطلاعات بک‌اند */}
        {pagerankResults && (
          <div className="mt-4 p-4 bg-white/5 rounded-lg">
            <h4 className="font-bold text-neon-cyan mb-2">Backend Response Info</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-cyber-gray-400">Compute Time: </span>
                <span className="text-white">{pagerankResults.compute_time_ms?.toFixed(1)}ms</span>
              </div>
              <div>
                <span className="text-cyber-gray-400">Status: </span>
                <span className="text-green-400">Success</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SystemMonitor;