import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
export { default as GraphVisualization } from './components/GraphVisualization';
export { default as FraudMetrics } from './components/FraudMetrics';
export { default as NodeDetails } from './components/NodeDetails';
export { default as SystemMonitor } from './components/SystemMonitor';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);