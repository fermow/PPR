"""
FastAPI/Flask API for Fraud Detection System
Connects Python backend to React frontend
"""

import sys
import os

# اضافه کردن مسیر parent directory به sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from flask import Flask, jsonify, request
from flask_cors import CORS
import numpy as np
from domain.pagerank import PowerIterationEngine
from infrastructure.graph import SparseGraph
import json
from datetime import datetime

app = Flask(__name__)
CORS(app)  # Allow frontend to connect

# Store graphs in memory (in production, use database)
graphs = {}
current_graph_id = None

@app.route('/')
def home():
    return jsonify({
        'status': 'active',
        'service': 'Fraud Detection API',
        'version': '2.1.0',
        'endpoints': {
            '/health': 'GET - Check API health',
            '/graph/create': 'POST - Create a new graph',
            '/graph/current': 'GET - Get current graph',
            '/pagerank/compute': 'POST - Compute PageRank',
            '/nodes/suspicious': 'POST - Mark nodes as suspicious'
        }
    })

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'python_version': '3.10+'
    })

@app.route('/graph/create', methods=['POST'])
def create_graph():
    """Create a graph from JSON data"""
    try:
        data = request.json
        
        # Create graph
        graph = SparseGraph(directed=data.get('directed', True))
        
        # Add edges
        edges = data.get('edges', [])
        for edge in edges:
            if len(edge) == 2:
                source, target = edge
                weight = 1.0
            elif len(edge) == 3:
                source, target, weight = edge
            else:
                continue
            graph.add_edge(source, target, weight)
        
        # Generate graph ID
        graph_id = f"graph_{len(graphs) + 1}"
        graphs[graph_id] = graph
        global current_graph_id
        current_graph_id = graph_id
        
        # Prepare response
        nodes = graph.get_nodes()
        edges_list = []
        for source, target, weight in graph.get_edges():
            edges_list.append({
                'source': source,
                'target': target,
                'weight': float(weight)
            })
        
        return jsonify({
            'success': True,
            'graph_id': graph_id,
            'nodes': nodes,
            'edges': edges_list,
            'node_count': len(nodes),
            'edge_count': len(edges_list),
            'directed': graph.directed
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400

@app.route('/graph/current', methods=['GET'])
def get_current_graph():
    """Get the current graph data"""
    if current_graph_id is None or current_graph_id not in graphs:
        return jsonify({
            'success': False,
            'error': 'No graph created yet'
        }), 404
    
    graph = graphs[current_graph_id]
    nodes = graph.get_nodes()
    
    # Get adjacency matrix for visualization
    adj_matrix, node_ids = graph.get_adjacency_matrix()
    
    edges_list = []
    for source, target, weight in graph.get_edges():
        edges_list.append({
            'source': source,
            'target': target,
            'weight': float(weight)
        })
    
    # Calculate node degrees for visualization
    node_degrees = []
    for node in nodes:
        out_degree = graph.get_out_degree(node)
        in_degree = graph.get_in_degree(node)
        node_degrees.append({
            'id': node,
            'out_degree': float(out_degree),
            'in_degree': float(in_degree),
            'total_degree': float(out_degree + in_degree)
        })
    
    return jsonify({
        'success': True,
        'graph_id': current_graph_id,
        'nodes': nodes,
        'node_degrees': node_degrees,
        'edges': edges_list,
        'adjacency_matrix': adj_matrix.tolist(),
        'directed': graph.directed
    })

@app.route('/graph/demo', methods=['GET'])
def create_demo_graph():
    """Create a demo graph for testing"""
    demo_data = {
        'directed': True,
        'edges': [
            ['A', 'B', 15000],
            ['A', 'C', 45000],
            ['B', 'D', 12000],
            ['C', 'E', 78000],
            ['D', 'F', 9000],
            ['E', 'G', 125000],
            ['F', 'H', 8000],
            ['G', 'A', 95000],
            ['H', 'B', 11000],
            ['C', 'H', 32000],
            ['E', 'F', 56000],
            ['G', 'D', 87000]
        ]
    }
    
    # Reuse create_graph functionality
    return jsonify({
        'success': True,
        'graph_id': 'demo_graph',
        'nodes': ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
        'edges': [
            {'source': 'A', 'target': 'B', 'weight': 15000},
            {'source': 'A', 'target': 'C', 'weight': 45000},
            {'source': 'B', 'target': 'D', 'weight': 12000},
            {'source': 'C', 'target': 'E', 'weight': 78000},
            {'source': 'D', 'target': 'F', 'weight': 9000},
            {'source': 'E', 'target': 'G', 'weight': 125000},
            {'source': 'F', 'target': 'H', 'weight': 8000},
            {'source': 'G', 'target': 'A', 'weight': 95000},
            {'source': 'H', 'target': 'B', 'weight': 11000},
            {'source': 'C', 'target': 'H', 'weight': 32000},
            {'source': 'E', 'target': 'F', 'weight': 56000},
            {'source': 'G', 'target': 'D', 'weight': 87000}
        ],
        'node_count': 8,
        'edge_count': 12,
        'directed': True
    })

@app.route('/pagerank/compute', methods=['POST'])
def compute_pagerank():
    """Compute Personalized PageRank"""
    try:
        data = request.json
        
        # If no graph is created yet, use demo graph
        if current_graph_id is None:
            # Create a demo graph
            demo_response = create_demo_graph()
            if not demo_response.json.get('success'):
                return jsonify({
                    'success': False,
                    'error': 'No graph available'
                }), 400
        
        # For demo purposes, we'll use hardcoded nodes
        nodes = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
        
        # Get parameters
        damping_factor = data.get('damping_factor', 0.85)
        max_iterations = data.get('max_iterations', 100)
        tolerance = data.get('tolerance', 1e-8)
        
        # Get suspicious nodes
        suspicious_nodes = data.get('suspicious_nodes', {})
        
        # Get base weights (transaction volumes)
        base_weights = data.get('base_weights', {})
        
        # Create demo adjacency matrix (8x8)
        adj_matrix = np.array([
            [0, 1, 1, 0, 0, 0, 0, 0],  # A -> B, C
            [0, 0, 0, 1, 0, 0, 0, 0],  # B -> D
            [0, 0, 0, 0, 1, 0, 0, 1],  # C -> E, H
            [0, 0, 0, 0, 0, 1, 0, 0],  # D -> F
            [0, 0, 0, 0, 0, 1, 1, 0],  # E -> F, G
            [0, 0, 0, 0, 0, 0, 0, 1],  # F -> H
            [1, 0, 0, 1, 0, 0, 0, 0],  # G -> A, D
            [0, 1, 0, 0, 0, 0, 0, 0],  # H -> B
        ], dtype=np.float64)
        
        # Add some random weights
        adj_matrix *= np.random.rand(8, 8) * 0.5 + 0.5
        
        # Create and configure PageRank engine
        engine = PowerIterationEngine(
            damping_factor=damping_factor,
            max_iterations=max_iterations,
            tolerance=tolerance
        )
        
        # Compute PageRank
        start_time = datetime.now()
        pagerank_scores = engine.compute_page_rank(
            node_ids=nodes,
            adjacency_matrix=adj_matrix,
            suspicious_nodes=suspicious_nodes,
            base_weights=base_weights
        )
        compute_time = (datetime.now() - start_time).total_seconds() * 1000
        
        # Get top fraud candidates
        top_candidates = engine.get_top_fraud_candidates(
            page_rank_scores=pagerank_scores,
            suspicion_scores=suspicious_nodes,
            top_k=10
        )
        
        # Format results
        formatted_candidates = []
        for node_id, ppr_score, suspicion in top_candidates:
            formatted_candidates.append({
                'node_id': node_id,
                'page_rank_score': float(ppr_score),
                'suspicion_score': float(suspicion),
                'risk_score': float(ppr_score * (1.0 + suspicion))
            })
        
        # Get convergence info
        convergence_info = engine.get_convergence_info()
        
        # Prepare node details for response
        node_details = []
        for node in nodes:
            # Mock connections
            outgoing_count = np.random.randint(1, 4)
            incoming_count = np.random.randint(1, 4)
            
            node_details.append({
                'id': node,
                'page_rank': float(pagerank_scores.get(node, 0)),
                'outgoing_count': outgoing_count,
                'incoming_count': incoming_count,
                'total_connections': outgoing_count + incoming_count,
                'is_suspicious': node in suspicious_nodes,
                'suspicion_score': float(suspicious_nodes.get(node, 0))
            })
        
        return jsonify({
            'success': True,
            'compute_time_ms': compute_time,
            'pagerank_scores': pagerank_scores,
            'top_fraud_candidates': formatted_candidates,
            'node_details': node_details,
            'convergence_info': convergence_info,
            'graph_summary': {
                'node_count': len(nodes),
                'edge_count': 12,
                'suspicious_node_count': len(suspicious_nodes)
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400

@app.route('/nodes/suspicious', methods=['POST'])
def mark_suspicious_nodes():
    """Mark nodes as suspicious with scores"""
    try:
        data = request.json
        suspicious_nodes = data.get('suspicious_nodes', {})
        
        # Validate scores are between 0 and 1
        for node_id, score in suspicious_nodes.items():
            if not 0 <= score <= 1:
                return jsonify({
                    'success': False,
                    'error': f'Score for node {node_id} must be between 0 and 1'
                }), 400
        
        return jsonify({
            'success': True,
            'suspicious_nodes': suspicious_nodes,
            'count': len(suspicious_nodes),
            'message': f'Marked {len(suspicious_nodes)} nodes as suspicious'
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400

@app.route('/analysis/summary', methods=['GET'])
def get_analysis_summary():
    """Get summary of current analysis"""
    # For now, return mock summary
    return jsonify({
        'success': True,
        'summary': {
            'total_analyses': 1,
            'average_compute_time': '2.3ms',
            'fraud_detection_rate': '94.5%',
            'high_risk_nodes': 4,
            'medium_risk_nodes': 2,
            'low_risk_nodes': 2
        }
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)