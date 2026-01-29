"""
PageRank engine implementation using power iteration.
Implements the formula: r(t+1) = (1 - α) * r(t)M + α * p
"""

from typing import Dict, List, Optional, Tuple
import numpy as np
from numpy.typing import NDArray
from scipy import sparse

from .strategies import (
    BaseDanglingNodeStrategy, 
    BasePersonalizationStrategy,
    UniformDanglingStrategy,
    SuspicionBasedPersonalization
)


class PowerIterationEngine:
    """
    Personalized PageRank engine for fraud detection using power iteration.
    """
    
    def __init__(
        self,
        damping_factor: float = 0.85,
        max_iterations: int = 100,
        tolerance: float = 1e-8,
        dangling_strategy: Optional[BaseDanglingNodeStrategy] = None,
        personalization_strategy: Optional[BasePersonalizationStrategy] = None
    ):
        """
        Initialize the PageRank engine.
        
        Args:
            damping_factor: α in PageRank formula (probability of teleportation)
            max_iterations: Maximum number of power iterations
            tolerance: Convergence threshold
            dangling_strategy: Strategy for handling dangling nodes
            personalization_strategy: Strategy for personalization vector
        """
        if not 0 < damping_factor < 1:
            raise ValueError("Damping factor must be between 0 and 1")
        
        self.damping_factor = damping_factor
        self.max_iterations = max_iterations
        self.tolerance = tolerance
        
        # Use default strategies if none provided
        self.dangling_strategy = dangling_strategy or UniformDanglingStrategy()
        self.personalization_strategy = personalization_strategy or SuspicionBasedPersonalization()
        
        # Cache for computed values
        self._transition_matrix: Optional[NDArray[np.float64]] = None
        self._personalization_vector: Optional[NDArray[np.float64]] = None
        self._page_rank: Optional[NDArray[np.float64]] = None
        self._iterations_performed: int = 0
        self._converged: bool = False
    
    def build_transition_matrix(
        self,
        adjacency_matrix: NDArray[np.float64],
        weights: Optional[NDArray[np.float64]] = None
    ) -> NDArray[np.float64]:
        """
        Build column-stochastic transition matrix from adjacency matrix.
        
        Args:
            adjacency_matrix: Binary adjacency matrix (n x n)
            weights: Optional weight matrix for weighted edges
            
        Returns:
            Column-stochastic transition matrix
        """
        n = adjacency_matrix.shape[0]
        
        if weights is not None:
            # Use weighted adjacency
            weighted_adj = adjacency_matrix * weights
        else:
            weighted_adj = adjacency_matrix.astype(np.float64)
        
        # Identify dangling nodes (columns with zero out-degree)
        out_degree = weighted_adj.sum(axis=0)
        dangling_mask = out_degree == 0
        
        # Create initial transition matrix
        transition_matrix = np.zeros((n, n), dtype=np.float64)
        
        # Normalize columns to sum to 1 (column-stochastic)
        for j in range(n):
            if out_degree[j] > 0:
                transition_matrix[:, j] = weighted_adj[:, j] / out_degree[j]
        
        # Apply dangling node strategy
        transition_matrix = self.dangling_strategy.handle_dangling_nodes(
            transition_matrix, dangling_mask
        )
        
        self._transition_matrix = transition_matrix
        return transition_matrix
    
    def compute_personalization_vector(
        self,
        node_ids: List[str],
        suspicious_nodes: Optional[Dict[str, float]] = None,
        base_weights: Optional[Dict[str, float]] = None
    ) -> NDArray[np.float64]:
        """
        Compute the personalization vector using the configured strategy.
        
        Args:
            node_ids: List of all node identifiers
            suspicious_nodes: Dict of node_id -> suspicion_score
            base_weights: Dict of node_id -> base_weight
            
        Returns:
            Personalization vector (probability distribution)
        """
        personalization = self.personalization_strategy.compute_personalization_vector(
            node_ids, suspicious_nodes, base_weights
        )
        
        self._personalization_vector = personalization
        return personalization
    def computeـpage_rank(self, graph, suspicious_nodes=None):
        matrix, dangling_mask, node_ids = graph.get_normalized_matrix()
        n = len(node_ids)
    
        p = np.zeros(n)
        if suspicious_nodes:
            for node_id, score in suspicious_nodes.items():
                if node_id in graph._node_to_idx:
                    p[graph._node_to_idx[node_id]] = score
    
        if np.sum(p) > 0:
            p /= np.sum(p)
        else:
            p = np.ones(n) / n

        r = p.copy()
    
        for iteration in range(self.max_iterations):
            r_prev = r.copy()
        
            dangling_sum = np.sum(r_prev[dangling_mask])
        
            r = (1 - self.damping_factor) * (matrix @ r_prev)
            r += (self.damping_factor + (1 - self.damping_factor) * dangling_sum) * p
        
            diff = np.linalg.norm(r - r_prev, ord=1)
            if diff < self.tolerance:
                self._converged = True
                self._iterations_performed = iteration + 1
                break
        return {node_id: float(score) for node_id, score in zip(node_ids, r)}
 
    def get_top_fraud_candidates(
        self,
        page_rank_scores: Dict[str, float],
        top_k: int = 10,
        suspicion_scores: Optional[Dict[str, float]] = None
    ) -> List[Tuple[str, float, float]]:
        """
        Identify top fraud candidates based on PageRank and suspicion scores.
        
        Args:
            page_rank_scores: PageRank scores from compute_page_rank
            top_k: Number of top candidates to return
            suspicion_scores: Optional suspicion scores for ranking
            
        Returns:
            List of (node_id, page_rank_score, suspicion_score) tuples
        """
        # Combine scores if suspicion scores provided
        if suspicion_scores:
            candidates = []
            for node_id, pr_score in page_rank_scores.items():
                suspicion = suspicion_scores.get(node_id, 0.0)
                # Simple weighted combination (can be customized)
                combined_score = pr_score * (1.0 + suspicion)
                candidates.append((node_id, pr_score, suspicion, combined_score))
            
            # Sort by combined score
            candidates.sort(key=lambda x: x[3], reverse=True)
        else:
            # Sort by PageRank alone
            candidates = [
                (node_id, score, 0.0, score)
                for node_id, score in page_rank_scores.items()
            ]
            candidates.sort(key=lambda x: x[1], reverse=True)
        
        # Return top k
        return [(node_id, pr_score, suspicion) 
                for node_id, pr_score, suspicion, _ in candidates[:top_k]]
    
    def get_convergence_info(self) -> Dict[str, any]:
        """
        Get information about the last PageRank computation.
        
        Returns:
            Dictionary with convergence information
        """
        return {
            'converged': self._converged,
            'iterations_performed': self._iterations_performed,
            'damping_factor': self.damping_factor,
            'tolerance': self.tolerance,
            'dangling_strategy': self.dangling_strategy.get_description(),
            'personalization_strategy': self.personalization_strategy.get_description()
        }
    
    def compute_sparse_page_rank(
        self,
        node_ids: List[str],
        sparse_adjacency: sparse.spmatrix,
        weights: Optional[sparse.spmatrix] = None,
        suspicious_nodes: Optional[Dict[str, float]] = None,
        base_weights: Optional[Dict[str, float]] = None
    ) -> Dict[str, float]:
        """
        Optimized PageRank computation for sparse graphs.
        
        Args:
            node_ids: List of node identifiers
            sparse_adjacency: Sparse adjacency matrix (CSR format recommended)
            weights: Optional sparse weight matrix
            suspicious_nodes: Suspicion scores for fraud detection
            base_weights: Base importance weights
            
        Returns:
            Dictionary mapping node_id to PageRank score
        """
        n = len(node_ids)
        
        if weights is not None:
            # Element-wise multiplication for sparse matrices
            weighted_adj = sparse_adjacency.multiply(weights)
        else:
            weighted_adj = sparse_adjacency.astype(np.float64)
        
        # Convert to CSC format for efficient column operations
        weighted_adj_csc = weighted_adj.tocsc()
        
        # Compute out-degree (sum of each column)
        out_degree = np.array(weighted_adj_csc.sum(axis=0)).flatten()
        dangling_mask = out_degree == 0
        
        # Create personalization vector
        p = self.compute_personalization_vector(node_ids, suspicious_nodes, base_weights)
        
        # Initialize rank vector
        r = np.ones(n) / n
        
        # Handle dangling nodes according to strategy
        # For sparse implementation, we handle this during iteration
        dangling_teleport = np.zeros(n)
        if np.any(dangling_mask):
            # Get dangling node indices
            dangling_indices = np.where(dangling_mask)[0]
            
            # Apply dangling strategy
            if hasattr(self.dangling_strategy, 'handle_dangling_nodes'):
                # For sparse, we need a different approach
                # Create a dense representation of dangling columns
                dummy_matrix = np.eye(n)[:, dangling_indices]
                handled = self.dangling_strategy.handle_dangling_nodes(
                    dummy_matrix, np.ones(len(dangling_indices), dtype=bool)
                )
                # For simplicity in sparse version, we'll teleport from dangling nodes
                # according to personalization vector
                dangling_teleport = p.copy()
            else:
                # Default: teleport uniformly
                dangling_teleport = np.ones(n) / n
        
        # Power iteration for sparse matrices
        for iteration in range(self.max_iterations):
            r_prev = r.copy()
            
            # Multiply r_prev by M (sparse matrix multiplication)
            # M = normalized weighted_adj + dangling adjustments
            rM = np.zeros(n)
            
            # Handle non-dangling columns
            non_dangling = out_degree > 0
            if np.any(non_dangling):
                # Normalize columns and multiply
                for j in np.where(non_dangling)[0]:
                    col = weighted_adj_csc[:, j].toarray().flatten()
                    rM += r_prev[j] * (col / out_degree[j])
            
            # Handle dangling columns
            if np.any(dangling_mask):
                for j in np.where(dangling_mask)[0]:
                    rM += r_prev[j] * dangling_teleport
            
            # Apply damping factor
            r = (1 - self.damping_factor) * rM + self.damping_factor * p
            
            # Check convergence
            diff = np.linalg.norm(r - r_prev, ord=1)
            
            if diff < self.tolerance:
                self._converged = True
                self._iterations_performed = iteration + 1
                break
        
        else:
            self._converged = False
            self._iterations_performed = self.max_iterations
        
        self._page_rank = r
        
        return {node_id: float(score) for node_id, score in zip(node_ids, r)}