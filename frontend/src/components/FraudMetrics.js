import React from 'react';
import { AlertTriangle, TrendingUp, Users, DollarSign, Shield, Activity } from 'lucide-react';

const FraudMetrics = ({ data, pagerankResults }) => {
  if (!data || !data.nodes) {
    return (
      <div className="space-y-4">
        <div className="glass-card p-6 text-center">
          <div className="text-cyber-gray-500">No data available</div>
        </div>
      </div>
    );
  }

  const suspiciousNodes = data.nodes.filter(node => node.suspicious);
  const topSuspicious = suspiciousNodes
    .sort((a, b) => (b.suspicionScore || 0) - (a.suspicionScore || 0))
    .slice(0, 5);

  const totalTransactionValue = data.links.reduce((sum, link) => sum + (link.value || 0), 0);

  // If we have pagerank results, use them for more accurate data
  const topCandidates = pagerankResults?.top_fraud_candidates || [];
  
  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {(topCandidates.length > 0 ? topCandidates.slice(0, 5) : topSuspicious).map((item, index) => {
          const node = typeof item === 'object' ? item : data.nodes.find(n => n.id === item);
          const nodeId = node?.id || item?.node_id || item?.id || `Node ${index + 1}`;
          const pprScore = node?.ppr || item?.page_rank_score || 0;
          const suspicionScore = node?.suspicionScore || item?.suspicion_score || 0;
          const riskScore = item?.risk_score || pprScore * (1 + suspicionScore);
          
          return (
            <div
              key={nodeId}
              className="glass-card p-4 relative overflow-hidden border-l-4 border-neon-pink"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-full bg-neon-pink/10">
                    <AlertTriangle className="w-4 h-4 text-neon-pink" />
                  </div>
                  <div>
                    <p className="font-semibold">Node {nodeId}</p>
                    <p className="text-sm text-cyber-gray-400">
                      Risk Score: {(riskScore * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-neon-pink font-bold">
                    {pprScore ? `${(pprScore * 100).toFixed(1)}%` : 'N/A'}
                  </p>
                  <p className="text-xs text-cyber-gray-400">
                    Suspicion: {(suspicionScore * 100).toFixed(0)}%
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
        <div className="text-center p-4 glass-card rounded-lg">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-neon-cyan/10 mb-2">
            <TrendingUp className="w-5 h-5 text-neon-cyan" />
          </div>
          <p className="text-2xl font-bold">{suspiciousNodes.length}</p>
          <p className="text-sm text-cyber-gray-400">Suspicious Nodes</p>
        </div>

        <div className="text-center p-4 glass-card rounded-lg">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-neon-purple/10 mb-2">
            <DollarSign className="w-5 h-5 text-neon-purple" />
          </div>
          <p className="text-2xl font-bold">
            ${(totalTransactionValue / 1000).toFixed(1)}K
          </p>
          <p className="text-sm text-cyber-gray-400">Total Volume</p>
        </div>
      </div>

      {pagerankResults?.convergence_info && (
        <div className="mt-4 p-3 glass-card rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <Activity className="w-4 h-4 text-neon-cyan" />
            <span className="text-sm font-medium">Algorithm Info</span>
          </div>
          <div className="text-xs text-cyber-gray-400">
            <div className="flex justify-between">
              <span>Status:</span>
              <span className={pagerankResults.convergence_info.converged ? 'text-green-400' : 'text-yellow-400'}>
                {pagerankResults.convergence_info.converged ? 'Converged ✓' : 'Processing...'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Iterations:</span>
              <span>{pagerankResults.convergence_info.iterations_performed}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FraudMetrics;