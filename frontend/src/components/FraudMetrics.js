import React from 'react';
import { AlertTriangle, TrendingUp, DollarSign, Activity, ShieldAlert, UserSearch } from 'lucide-react';

const FraudMetrics = ({ data, pagerankResults, suspiciousNodes }) => {
  if (!data || !data.nodes) {
    return (
      <div className="space-y-4">
        <div className="glass-card p-6 text-center">
          <div className="text-cyber-gray-500">No data available</div>
        </div>
      </div>
    );
  }

  // استخراج نودهای بذر از suspiciousNodes
  const manualSeedNodeIds = Object.keys(suspiciousNodes || {});
  
  // پیدا کردن نودهای شناسایی شده توسط الگوریتم (با PPR بالا)
  const getTopFraudCandidates = () => {
    if (!pagerankResults?.pagerank_scores) return [];
    
    const nodesWithScores = Object.entries(pagerankResults.pagerank_scores)
      .map(([nodeId, score]) => ({
        node_id: nodeId,
        risk_score: score,
        is_manual_seed: manualSeedNodeIds.includes(nodeId)
      }))
      .sort((a, b) => b.risk_score - a.risk_score);
    
    // بازگشت 10 نود برتر که بذر دستی نیستند
    return nodesWithScores
      .filter(node => !node.is_manual_seed)
      .slice(0, 10);
  };

  const newlyDetectedItems = getTopFraudCandidates();
  
  const totalTransactionValue = data.links?.reduce((sum, link) => sum + (link.value || 0), 0) || 0;

  return (
    <div className="space-y-4 max-h-[80vh] overflow-y-auto pr-2 custom-scrollbar">
      
      {/* بخش اول: نودهای بذر دستی */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2 px-1 mb-2">
          <ShieldAlert className="w-4 h-4 text-neon-pink" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-neon-pink">Manual Seed Nodes</h3>
        </div>
        {manualSeedNodeIds.length > 0 ? manualSeedNodeIds.slice(0, 5).map((nodeId) => (
          <div key={nodeId} className="glass-card p-3 border-l-4 border-neon-pink bg-neon-pink/5">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-mono text-sm text-white">@{nodeId}</p>
                <p className="text-[10px] text-cyber-gray-400">Seed Suspicion</p>
              </div>
              <div className="text-right">
                <p className="text-neon-pink font-bold">
                  {((suspiciousNodes?.[nodeId] || 0.9) * 100).toFixed(0)}%
                </p>
                <p className="text-[10px] uppercase text-cyber-gray-500">Confidence</p>
              </div>
            </div>
          </div>
        )) : (
          <p className="text-[10px] text-center text-cyber-gray-500">No seeds defined</p>
        )}
      </div>

      {/* بخش دوم: نودهای شناسایی شده توسط الگوریتم */}
      <div className="space-y-2 pt-2">
        <div className="flex items-center space-x-2 px-1 mb-2">
          <UserSearch className="w-4 h-4 text-neon-cyan" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-neon-cyan">Algorithm Detected</h3>
        </div>
        {newlyDetectedItems.length > 0 ? (
          newlyDetectedItems.slice(0, 5).map((item) => (
            <div key={item.node_id} className="glass-card p-3 border-l-4 border-neon-cyan">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-mono text-sm text-white">@{item.node_id}</p>
                  <p className="text-[10px] text-cyber-gray-400">Guilt by Association</p>
                </div>
                <div className="text-right">
                  <p className="text-neon-cyan font-bold">{(item.risk_score * 100).toFixed(3)}%</p>
                  <p className="text-[10px] uppercase text-cyber-gray-500">PPR Score</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-4 glass-card border-dashed border-white/10">
            <p className="text-[10px] text-cyber-gray-500 italic">
              {pagerankResults ? 'Run analysis to detect fraud' : 'Analyzing network patterns...'}
            </p>
          </div>
        )}
      </div>

      {/* خلاصه وضعیت */}
      <div className="grid grid-cols-2 gap-3 pt-2">
        <div className="glass-card p-3 text-center border-b-2 border-neon-cyan/30">
          <TrendingUp className="w-4 h-4 text-neon-cyan mx-auto mb-1" />
          <p className="text-lg font-bold text-white">{manualSeedNodeIds.length}</p>
          <p className="text-[9px] text-cyber-gray-400 uppercase">Seed Nodes</p>
        </div>
        <div className="glass-card p-3 text-center border-b-2 border-neon-purple/30">
          <DollarSign className="w-4 h-4 text-neon-purple mx-auto mb-1" />
          <p className="text-lg font-bold text-white">${(totalTransactionValue / 1000).toFixed(1)}K</p>
          <p className="text-[9px] text-cyber-gray-400 uppercase">Net Volume</p>
        </div>
      </div>

      {/* اطلاعات فنی الگوریتم */}
      {pagerankResults?.convergence_info && (
        <div className="p-3 glass-card bg-white/5 border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Activity className="w-3 h-3 text-neon-purple" />
              <span className="text-[10px] font-bold uppercase text-neon-purple">Power Iteration</span>
            </div>
            <span className={`text-[9px] px-2 py-0.5 rounded-sm font-bold ${
              pagerankResults.convergence_info.converged ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
            }`}>
              {pagerankResults.convergence_info.converged ? 'CONVERGED' : 'RUNNING'}
            </span>
          </div>
          <div className="flex justify-between text-[10px] font-mono">
            <span className="text-cyber-gray-500">ITERATIONS:</span>
            <span className="text-white">{pagerankResults.convergence_info.iterations_performed}</span>
          </div>
          <div className="flex justify-between text-[10px] font-mono mt-1">
            <span className="text-cyber-gray-500">TIME:</span>
            <span className="text-white">{pagerankResults.compute_time_ms?.toFixed(1) || '0.0'}ms</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default FraudMetrics;