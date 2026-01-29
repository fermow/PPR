import React, { useState } from 'react';
import { User, Link, Shield, Activity, ArrowUpRight, ArrowDownRight, Cpu, Zap } from 'lucide-react';

const NodeDetails = ({ data, pagerankResults }) => {
  const [selectedNode, setSelectedNode] = useState(null);

  if (!data || !data.nodes || data.nodes.length === 0) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8 text-cyber-gray-500">
          No node data available
        </div>
      </div>
    );
  }

  // Initialize with first node if none selected
  if (!selectedNode && data.nodes.length > 0) {
    setSelectedNode(data.nodes[0]);
  }

  const nodeDetails = pagerankResults?.node_details || [];

  return (
    <div className="space-y-6">
      {/* Node Selector */}
      <div className="flex flex-wrap gap-2">
        {data.nodes.map(node => (
          <button
            key={node.id}
            onClick={() => setSelectedNode(node)}
            className={`px-4 py-2 rounded-lg transition-all ${
              selectedNode?.id === node.id
                ? 'bg-gradient-to-r from-neon-cyan to-neon-purple text-white'
                : 'glass-card hover:bg-white/5'
            }`}
          >
            {node.id}
          </button>
        ))}
      </div>

      {/* Node Details */}
      {selectedNode && (
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className={`p-3 rounded-full ${
                selectedNode.suspicious
                  ? 'bg-neon-pink/10'
                  : 'bg-neon-cyan/10'
              }`}>
                {selectedNode.suspicious ? (
                  <Shield className="w-6 h-6 text-neon-pink" />
                ) : (
                  <User className="w-6 h-6 text-neon-cyan" />
                )}
              </div>
              <div>
                <h3 className="text-xl font-bold">Node {selectedNode.id}</h3>
                <p className={`text-sm ${
                  selectedNode.suspicious
                    ? 'text-neon-pink'
                    : 'text-neon-cyan'
                }`}>
                  {selectedNode.suspicious ? 'Suspicious Activity' : 'Normal Activity'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold">
                {((selectedNode.ppr || 0) * 100).toFixed(1)}%
              </p>
              <p className="text-sm text-cyber-gray-400">PageRank Score</p>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="glass-card p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Activity className="w-4 h-4 text-neon-cyan" />
                <span className="text-sm text-cyber-gray-400">Transactions</span>
              </div>
              <p className="text-2xl font-bold">{selectedNode.transactions || 0}</p>
            </div>

            <div className="glass-card p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <ArrowUpRight className="w-4 h-4 text-green-500" />
                <span className="text-sm text-cyber-gray-400">Outgoing</span>
              </div>
              <p className="text-2xl font-bold">
                {data.links.filter(l => l.source === selectedNode.id).length}
              </p>
            </div>

            <div className="glass-card p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <ArrowDownRight className="w-4 h-4 text-neon-pink" />
                <span className="text-sm text-cyber-gray-400">Incoming</span>
              </div>
              <p className="text-2xl font-bold">
                {data.links.filter(l => l.target === selectedNode.id).length}
              </p>
            </div>

            <div className="glass-card p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Link className="w-4 h-4 text-neon-purple" />
                <span className="text-sm text-cyber-gray-400">Connections</span>
              </div>
              <p className="text-2xl font-bold">
                {data.links.filter(l => 
                  l.source === selectedNode.id || l.target === selectedNode.id
                ).length}
              </p>
            </div>
          </div>

          {/* Additional Info */}
          {pagerankResults && (
            <div className="mb-6 p-4 bg-white/5 rounded-lg">
              <div className="flex items-center space-x-2 mb-3">
                <Cpu className="w-4 h-4 text-neon-cyan" />
                <span className="font-medium">PageRank Details</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-cyber-gray-400">Suspicion Score:</span>
                  <span className="ml-2 text-white">
                    {((selectedNode.suspicionScore || 0) * 100).toFixed(1)}%
                  </span>
                </div>
                <div>
                  <span className="text-cyber-gray-400">Risk Level:</span>
                  <span className={`ml-2 ${
                    (selectedNode.suspicionScore || 0) > 0.7 ? 'text-neon-pink' :
                    (selectedNode.suspicionScore || 0) > 0.4 ? 'text-yellow-400' : 'text-green-400'
                  }`}>
                    {(selectedNode.suspicionScore || 0) > 0.7 ? 'High' :
                     (selectedNode.suspicionScore || 0) > 0.4 ? 'Medium' : 'Low'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Connected Nodes */}
          <div>
            <h4 className="font-semibold mb-3">Connected Nodes</h4>
            <div className="space-y-2">
              {data.links
                .filter(link => 
                  link.source === selectedNode.id || link.target === selectedNode.id
                )
                .map((link, index) => {
                  const isOutgoing = link.source === selectedNode.id;
                  const connectedNodeId = isOutgoing ? link.target : link.source;
                  const connectedNode = data.nodes.find(n => n.id === connectedNodeId);
                  
                  return (
                    <div key={index} className="flex items-center justify-between p-3 glass-card rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          connectedNode?.suspicious 
                            ? 'bg-neon-pink/20' 
                            : 'bg-neon-cyan/20'
                        }`}>
                          <span className="text-sm font-bold">
                            {connectedNodeId}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">
                            {isOutgoing ? '→ ' + connectedNodeId : '← ' + connectedNodeId}
                          </p>
                          <p className="text-sm text-cyber-gray-400">
                            Value: ${((link.value || 0) / 1000).toFixed(1)}K
                          </p>
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs ${
                        isOutgoing
                          ? 'bg-neon-cyan/10 text-neon-cyan'
                          : 'bg-neon-pink/10 text-neon-pink'
                      }`}>
                        {isOutgoing ? 'Outgoing' : 'Incoming'}
                      </div>
                    </div>
                  );
                })}
              
              {data.links.filter(link => 
                link.source === selectedNode.id || link.target === selectedNode.id
              ).length === 0 && (
                <div className="text-center py-4 text-cyber-gray-500">
                  No connections found
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NodeDetails;