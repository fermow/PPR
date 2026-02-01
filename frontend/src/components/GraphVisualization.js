import React, { useRef, useEffect, useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';

const GraphVisualization = ({ data, interactive = false }) => {
  const graphRef = useRef();
  const [dimensions, setDimensions] = useState({ width: 800, height: 400 });

  useEffect(() => {
    // Update dimensions on resize
    const updateDimensions = () => {
      const container = graphRef.current?.parentElement;
      if (container) {
        setDimensions({
          width: container.clientWidth,
          height: container.clientHeight
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    if (graphRef.current && data) {
      graphRef.current.d3Force('charge').strength(-300);
      graphRef.current.d3Force('link').distance(100);
    }
  }, [data]);

  if (!data || !data.nodes || !data.links) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-cyber-gray-500 text-lg mb-2">No Graph Data</div>
          <div className="text-cyber-gray-600 text-sm">Loading graph visualization...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <div className="absolute inset-0 bg-gradient-to-br from-neon-cyan/5 to-neon-purple/5 rounded-lg"></div>
     <ForceGraph2D
  ref={graphRef}
  graphData={data}

  nodeLabel="id"

  nodeRelSize={14}
  nodeVal={node => {
    if (node.group === 2) return 1.5;
    if (node.group === 3) return 1;
    return 0.5;
  }}

  nodeColor={node => {
    if (node.group === 2) return '#ec4899'; // صورتی
    if (node.group === 3) return '#facc15';   // طلایی
    return '#22d3ee';                      // آبی
  }}

  linkColor={() => 'rgba(34, 211, 238, 0.25)'}
  linkWidth={0.5}

  linkDirectionalParticles={interactive ? 1 : 0}
  linkDirectionalParticleWidth={1}
  linkDirectionalParticleColor={() => '#22d3ee'}

  backgroundColor="rgba(2, 6, 23, 0)"
  width={dimensions.width}
  height={dimensions.height}

  enableNodeDrag={interactive}
  enableZoomInteraction={interactive}
  enablePanInteraction={interactive}

  onNodeClick={node => {
    console.log('FULL NODE:', node);

    console.log('Node clicked:', node);
  }}
/>

    </div>
  );
};

export default GraphVisualization;