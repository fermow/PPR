"""
Graph infrastructure layer implementing sparse adjacency list representation.
"""

from typing import Dict, List, Tuple, Optional, Set
import numpy as np
from numpy.typing import NDArray
from scipy import sparse


class SparseGraph:
    """
    Sparse graph implementation using adjacency lists with optional edge weights.
    Supports directed and undirected graphs.
    """
    
    def __init__(self, directed: bool = True):
        """
        Initialize an empty graph.
        
        Args:
            directed: Whether the graph is directed (default: True)
        """
        self.directed = directed
        self._adjacency_list: Dict[str, Dict[str, float]] = {}
        self._node_to_idx: Dict[str, int] = {}
        self._idx_to_node: Dict[int, str] = {}
        self._edge_count: int = 0
        
    def add_node(self, node_id: str) -> None:
        """Add a node to the graph if it doesn't exist."""
        if node_id not in self._adjacency_list:
            idx = len(self._adjacency_list)
            self._adjacency_list[node_id] = {}
            self._node_to_idx[node_id] = idx
            self._idx_to_node[idx] = node_id
    
    def add_edge(self, source: str, target: str, weight: float = 1.0) -> None:
        """
        Add an edge between source and target nodes.
        
        Args:
            source: Source node identifier
            target: Target node identifier
            weight: Edge weight (default: 1.0)
        """
        # Ensure nodes exist
        self.add_node(source)
        self.add_node(target)
        
        # Add edge from source to target
        if target not in self._adjacency_list[source]:
            self._edge_count += 1
        self._adjacency_list[source][target] = weight
        
        # If undirected, add reverse edge
        if not self.directed and source != target:
            if source not in self._adjacency_list[target]:
                self._edge_count += 1
            self._adjacency_list[target][source] = weight
    
    def remove_edge(self, source: str, target: str) -> bool:
        """
        Remove edge between source and target.
        
        Returns:
            True if edge was removed, False if it didn't exist
        """
        if source in self._adjacency_list and target in self._adjacency_list[source]:
            del self._adjacency_list[source][target]
            self._edge_count -= 1
            
            # If undirected, remove reverse edge
            if not self.directed and source != target:
                del self._adjacency_list[target][source]
                self._edge_count -= 1
            
            return True
        return False
    
    def get_neighbors(self, node_id: str) -> Dict[str, float]:
        """Get all neighbors of a node with edge weights."""
        return self._adjacency_list.get(node_id, {}).copy()
    
    def get_out_degree(self, node_id: str) -> float:
        """Get the total out-degree (sum of edge weights) of a node."""
        neighbors = self._adjacency_list.get(node_id, {})
        return sum(neighbors.values())
    
    def get_in_degree(self, node_id: str) -> float:
        """Get the total in-degree of a node (sum of incoming edge weights)."""
        if not self.directed:
            return self.get_out_degree(node_id)
        
        total = 0.0
        for source, neighbors in self._adjacency_list.items():
            if node_id in neighbors:
                total += neighbors[node_id]
        return total
    
    def get_nodes(self) -> List[str]:
        """Get all node identifiers in the graph."""
        return list(self._adjacency_list.keys())
    
    def get_edges(self) -> List[Tuple[str, str, float]]:
        """Get all edges as (source, target, weight) tuples."""
        edges = []
        for source, neighbors in self._adjacency_list.items():
            for target, weight in neighbors.items():
                edges.append((source, target, weight))
        return edges
    
    def get_adjacency_matrix(self) -> Tuple[NDArray[np.float64], List[str]]:
        """
        Get dense adjacency matrix representation.
        
        Returns:
            Tuple of (adjacency_matrix, node_ids)
        """
        node_ids = self.get_nodes()
        n = len(node_ids)
        
        matrix = np.zeros((n, n), dtype=np.float64)
        
        for i, source in enumerate(node_ids):
            neighbors = self._adjacency_list[source]
            for target, weight in neighbors.items():
                j = self._node_to_idx[target]
                matrix[i, j] = weight
        
        return matrix, node_ids
    
    def get_sparse_adjacency_matrix(self) -> Tuple[sparse.csr_matrix, List[str]]:
        """
        Get sparse CSR adjacency matrix representation.
        
        Returns:
            Tuple of (sparse_matrix, node_ids)
        """
        node_ids = self.get_nodes()
        n = len(node_ids)
        
        # Build data, row, and column arrays for COO format
        data = []
        rows = []
        cols = []
        
        for i, source in enumerate(node_ids):
            neighbors = self._adjacency_list[source]
            for target, weight in neighbors.items():
                j = self._node_to_idx[target]
                data.append(weight)
                rows.append(i)
                cols.append(j)
        
        # Create COO matrix and convert to CSR
        coo_matrix = sparse.coo_matrix((data, (rows, cols)), shape=(n, n))
        csr_matrix = coo_matrix.tocsr()
        
        return csr_matrix, node_ids
    
    def subgraph(self, nodes: Set[str]) -> 'SparseGraph':
        """
        Create a subgraph containing only the specified nodes.
        
        Args:
            nodes: Set of node identifiers to include
            
        Returns:
            New SparseGraph containing only the specified nodes and edges between them
        """
        subgraph = SparseGraph(directed=self.directed)
        
        # Add nodes
        for node in nodes:
            if node in self._adjacency_list:
                subgraph.add_node(node)
        
        # Add edges between included nodes
        for source in nodes:
            if source in self._adjacency_list:
                for target, weight in self._adjacency_list[source].items():
                    if target in nodes:
                        subgraph.add_edge(source, target, weight)
        
        return subgraph
    
    def save_to_file(self, filepath: str) -> None:
        """Save graph to text file."""
        with open(filepath, 'w') as f:
            f.write(f"directed:{self.directed}\n")
            f.write(f"nodes:{len(self._adjacency_list)}\n")
            f.write(f"edges:{self._edge_count}\n")
            
            for source, neighbors in self._adjacency_list.items():
                for target, weight in neighbors.items():
                    f.write(f"{source},{target},{weight}\n")
    
    @classmethod
    def load_from_file(cls, filepath: str) -> 'SparseGraph':
        """Load graph from text file."""
        with open(filepath, 'r') as f:
            lines = f.readlines()
        
        # Parse header
        directed = lines[0].strip().split(':')[1] == 'True'
        graph = cls(directed=directed)
        
        # Parse edges
        for line in lines[3:]:  # Skip header lines
            if line.strip():
                parts = line.strip().split(',')
                if len(parts) >= 2:
                    source = parts[0]
                    target = parts[1]
                    weight = float(parts[2]) if len(parts) > 2 else 1.0
                    graph.add_edge(source, target, weight)
        
        return graph
    
    def __str__(self) -> str:
        """String representation of the graph."""
        return (f"SparseGraph(nodes={len(self._adjacency_list)}, "
                f"edges={self._edge_count}, directed={self.directed})")
    
    def __len__(self) -> int:
        """Number of nodes in the graph."""
        return len(self._adjacency_list)
    
    def to_sparse_matrix(self):
        node_ids = list(self._adjacency_list.keys())
        n = len(node_ids)
        row = []
        col = []
        data = []

        for source, neighbors in self._adjacency_list.items():
            u = self._node_to_idx[source]
            total_weight = sum(neighbors.values())
        for target, weight in neighbors.items():
                v = self._node_to_idx[target]
                row.append(v)
                col.append(u)
                data.append(weight / total_weight)
        return sparse.coo_matrix((data, (row, col)), shape=(n, n)).tocsr(), node_ids
    def get_dangling_nodes(self):
        n = len(self._adjacency_list)
        dangling_mask = np.zeros(n, dtype=bool)
    
        for node_id, neighbors in self._adjacency_list.items():
            if not neighbors:
                idx = self._node_to_idx[node_id]
                dangling_mask[idx] = True
            
        return dangling_mask