import React, { useState } from 'react';
import { User, Link, Shield, Activity, ArrowUpRight, ArrowDownRight, Search } from 'lucide-react';

const NodeDetails = ({ data, pagerankResults }) => {
  const [selectedNode, setSelectedNode] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  if (!data || !data.nodes || data.nodes.length === 0) {
    return (
      <div className="space-y-6 text-center py-10 glass-card">
        <div className="text-cyber-gray-500">No node data available</div>
      </div>
    );
  }

  // مقداردهی اولیه نود انتخاب شده
  if (!selectedNode && data.nodes.length > 0) {
    setSelectedNode(data.nodes[0]);
  }

  // تابع کمکی برای استخراج ID (جلوگیری از خطای Objects are not valid as a React child)
  const getSafeId = (nodeRef) => {
    if (typeof nodeRef === 'object' && nodeRef !== null) {
      return nodeRef.id || nodeRef.node_id;
    }
    return nodeRef;
  };

  // فیلتر کردن نودها بر اساس جستجو
  const filteredNodes = data.nodes.filter(node => 
    getSafeId(node).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedNodeId = getSafeId(selectedNode);

  return (
    <div className="space-y-6">
      {/* جستجو و انتخاب نود */}
      <div className="glass-card p-4">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -transform -translate-y-1/2 w-4 h-4 text-cyber-gray-400" />
          <input 
            type="text"
            placeholder="Search nodes (e.g. RepAdamSchiff)..."
            className="w-full bg-black/40 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm focus:border-neon-cyan outline-none transition-colors text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
          {filteredNodes.map(node => {
            const nodeId = getSafeId(node);
            return (
              <button
                key={nodeId}
                onClick={() => setSelectedNode(node)}
                className={`px-3 py-1.5 rounded-md text-xs font-mono transition-all ${
                  selectedNodeId === nodeId
                    ? 'bg-neon-cyan text-black font-bold'
                    : 'bg-white/5 hover:bg-white/10 text-cyber-gray-300'
                } ${node.suspicious ? 'border-b-2 border-neon-pink' : ''}`}
              >
                {nodeId}
              </button>
            );
          })}
        </div>
      </div>

      {/* نمایش جزئیات نود انتخاب شده */}
      {selectedNode && (
        <div className="glass-card p-6 border-t-2 border-neon-purple/50">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center space-x-4">
              <div className={`p-4 rounded-xl ${selectedNode.suspicious ? 'bg-neon-pink/20' : 'bg-neon-cyan/20'}`}>
                {selectedNode.suspicious ? (
                  <Shield className="w-8 h-8 text-neon-pink" />
                ) : (
                  <User className="w-8 h-8 text-neon-cyan" />
                )}
              </div>
              <div>
                <h3 className="text-2xl font-bold font-mono text-white">@{selectedNodeId}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`w-2 h-2 rounded-full ${selectedNode.suspicious ? 'bg-neon-pink' : 'bg-neon-cyan'}`}></span>
                  <p className="text-sm uppercase tracking-widest text-cyber-gray-400">
                    {selectedNode.suspicious ? 'Identified Source' : 'Network Member'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/5 p-4 rounded-xl text-center md:text-right border border-white/5">
              <p className="text-3xl font-black text-neon-purple font-mono">
                {((selectedNode.ppr || 0) * 100).toFixed(4)}%
              </p>
              <p className="text-[10px] uppercase tracking-tighter text-cyber-gray-500 font-bold">PPR Influence Score</p>
            </div>
          </div>

          {/* متریک‌های چهارگانه */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-black/20 p-4 rounded-lg border border-white/5 text-center">
              <span className="text-[10px] text-cyber-gray-400 uppercase block mb-1">Out-Degree</span>
              <p className="text-xl font-bold text-neon-cyan">
                {data.links.filter(l => getSafeId(l.source) === selectedNodeId).length}
              </p>
            </div>
            <div className="bg-black/20 p-4 rounded-lg border border-white/5 text-center">
              <span className="text-[10px] text-cyber-gray-400 uppercase block mb-1">In-Degree</span>
              <p className="text-xl font-bold text-neon-pink">
                {data.links.filter(l => getSafeId(l.target) === selectedNodeId).length}
              </p>
            </div>
            <div className="bg-black/20 p-4 rounded-lg border border-white/5 text-center">
              <span className="text-[10px] text-cyber-gray-400 uppercase block mb-1">Transactions</span>
              <p className="text-xl font-bold">{selectedNode.transactions || 0}</p>
            </div>
            <div className="bg-black/20 p-4 rounded-lg border border-white/5 text-center">
              <span className="text-[10px] text-cyber-gray-400 uppercase block mb-1">Risk Level</span>
              <p className={`text-xl font-bold ${selectedNode.suspicious ? 'text-neon-pink' : 'text-green-400'}`}>
                {selectedNode.suspicious ? 'HIGH' : 'LOW'}
              </p>
            </div>
          </div>

          {/* لیست اتصالات با اسکرول */}
          <div>
            <h4 className="text-sm font-bold uppercase mb-4 text-cyber-gray-400">Network Connections</h4>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
              {data.links
                .filter(link => getSafeId(link.source) === selectedNodeId || getSafeId(link.target) === selectedNodeId)
                .map((link, index) => {
                  const sourceId = getSafeId(link.source);
                  const targetId = getSafeId(link.target);
                  const isOutgoing = sourceId === selectedNodeId;
                  const connectedWith = isOutgoing ? targetId : sourceId;
                  
                  return (
                    <div key={`link-${index}`} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5 hover:bg-white/10 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`p-1.5 rounded ${isOutgoing ? 'text-neon-cyan bg-neon-cyan/10' : 'text-neon-pink bg-neon-pink/10'}`}>
                          {isOutgoing ? <ArrowUpRight size={14}/> : <ArrowDownRight size={14}/>}
                        </div>
                        <span className="font-mono text-sm text-white">@{connectedWith}</span>
                      </div>
                      <span className="text-[10px] text-cyber-gray-500 font-mono">
                        {link.value > 0 ? `W: ${link.value.toFixed(2)}` : "DIRECT"}
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NodeDetails;