"""
Domain layer abstractions for PageRank strategies.
Defines interfaces for dangling node handling and personalization vectors.
"""

from abc import ABC, abstractmethod
from typing import Dict, List, Optional
import numpy as np
from numpy.typing import NDArray


class BaseDanglingNodeStrategy(ABC):
    """
    Abstract base class for handling dangling nodes (nodes with no outgoing edges).
    Defines the contract for redistributing PageRank from dangling nodes.
    """
    
    @abstractmethod
    def handle_dangling_nodes(
        self, 
        transition_matrix: NDArray[np.float64],
        dangling_mask: NDArray[np.bool_]
    ) -> NDArray[np.float64]:
        """
        Adjust the transition matrix to handle dangling nodes.
        
        Args:
            transition_matrix: The original transition matrix (n x n)
            dangling_mask: Boolean array where True indicates a dangling node
            
        Returns:
            Adjusted transition matrix with dangling node handling
        """
        pass
    
    @abstractmethod
    def get_description(self) -> str:
        """Returns a human-readable description of the strategy."""
        pass


class BasePersonalizationStrategy(ABC):
    """
    Abstract base class for personalization vector strategies.
    Enables fraud detection by biasing PageRank toward suspicious nodes.
    """
    
    @abstractmethod
    def compute_personalization_vector(
        self, 
        node_ids: List[str],
        suspicious_nodes: Optional[Dict[str, float]] = None,
        base_weights: Optional[Dict[str, float]] = None
    ) -> NDArray[np.float64]:
        """
        Compute the personalization vector for PageRank.
        
        Args:
            node_ids: List of all node identifiers in the graph
            suspicious_nodes: Dict mapping node_id to suspicion score (0 to 1)
            base_weights: Dict mapping node_id to base importance weight
            
        Returns:
            Personalization vector (probability distribution) as numpy array
        """
        pass
    
    @abstractmethod
    def get_description(self) -> str:
        """Returns a human-readable description of the strategy."""
        pass


# Concrete implementations for common strategies

class UniformDanglingStrategy(BaseDanglingNodeStrategy):
    """
    Redistributes dangling node rank uniformly to all nodes.
    Standard approach in classic PageRank.
    """
    
    def handle_dangling_nodes(
        self, 
        transition_matrix: NDArray[np.float64],
        dangling_mask: NDArray[np.bool_]
    ) -> NDArray[np.float64]:
        n = transition_matrix.shape[0]
        adjusted_matrix = transition_matrix.copy()
        
        # For each dangling node, distribute its probability mass uniformly
        for i in np.where(dangling_mask)[0]:
            adjusted_matrix[i, :] = 1.0 / n
            
        return adjusted_matrix
    
    def get_description(self) -> str:
        return "Uniform redistribution of dangling node rank to all nodes"


class TeleportDanglingStrategy(BaseDanglingNodeStrategy):
    """
    Redirects dangling nodes to teleport according to personalization vector.
    More sophisticated than uniform redistribution.
    """
    
    def __init__(self, personalization_vector: Optional[NDArray[np.float64]] = None):
        self.personalization_vector = personalization_vector
    
    def handle_dangling_nodes(
        self, 
        transition_matrix: NDArray[np.float64],
        dangling_mask: NDArray[np.bool_]
    ) -> NDArray[np.float64]:
        n = transition_matrix.shape[0]
        adjusted_matrix = transition_matrix.copy()
        
        if self.personalization_vector is None:
            # Fallback to uniform if no personalization vector provided
            personalization = np.ones(n) / n
        else:
            personalization = self.personalization_vector
        
        # Redirect dangling nodes according to personalization
        for i in np.where(dangling_mask)[0]:
            adjusted_matrix[i, :] = personalization
            
        return adjusted_matrix
    
    def get_description(self) -> str:
        return "Redirect dangling nodes according to personalization vector"


class SuspicionBasedPersonalization(BasePersonalizationStrategy):
    """
    Personalization vector biased toward suspicious nodes for fraud detection.
    """
    
    def __init__(self, suspicion_weight: float = 5.0):
        """
        Args:
            suspicion_weight: Multiplier for suspicious nodes' importance
        """
        self.suspicion_weight = max(1.0, suspicion_weight)
    
    def compute_personalization_vector(
        self, 
        node_ids: List[str],
        suspicious_nodes: Optional[Dict[str, float]] = None,
        base_weights: Optional[Dict[str, float]] = None
    ) -> NDArray[np.float64]:
        n = len(node_ids)
        
        # Create node_id to index mapping
        node_to_idx = {node_id: i for i, node_id in enumerate(node_ids)}
        
        # Initialize with uniform distribution
        personalization = np.ones(n) / n
        
        # Apply base weights if provided
        if base_weights:
            for node_id, weight in base_weights.items():
                if node_id in node_to_idx:
                    idx = node_to_idx[node_id]
                    personalization[idx] = weight
        
        # Boost suspicious nodes
        if suspicious_nodes:
            for node_id, suspicion_score in suspicious_nodes.items():
                if node_id in node_to_idx:
                    idx = node_to_idx[node_id]
                    # Scale by suspicion weight and score
                    boost = 1.0 + (self.suspicion_weight - 1.0) * suspicion_score
                    personalization[idx] *= boost
        
        # Normalize to sum to 1
        total = np.sum(personalization)
        if total > 0:
            personalization /= total
        
        return personalization
    
    def get_description(self) -> str:
        return f"Suspicion-biased personalization (weight={self.suspicion_weight})"


class TransactionVolumePersonalization(BasePersonalizationStrategy):
    """
    Personalization based on transaction volume or monetary weight.
    """
    
    def compute_personalization_vector(
        self, 
        node_ids: List[str],
        suspicious_nodes: Optional[Dict[str, float]] = None,
        base_weights: Optional[Dict[str, float]] = None
    ) -> NDArray[np.float64]:
        n = len(node_ids)
        
        # If no base weights provided, use uniform
        if not base_weights:
            return np.ones(n) / n
        
        # Create node_id to index mapping
        node_to_idx = {node_id: i for i, node_id in enumerate(node_ids)}
        
        # Start with zeros
        personalization = np.zeros(n)
        
        # Apply base weights (transaction volumes)
        total_weight = 0.0
        for node_id, weight in base_weights.items():
            if node_id in node_to_idx:
                idx = node_to_idx[node_id]
                personalization[idx] = weight
                total_weight += weight
        
        # Apply suspicion boost if provided
        if suspicious_nodes:
            for node_id, suspicion_score in suspicious_nodes.items():
                if node_id in node_to_idx:
                    idx = node_to_idx[node_id]
                    # Add suspicion as additional weight
                    personalization[idx] += suspicion_score * total_weight / n
        
        # Normalize if we have any weights
        total = np.sum(personalization)
        if total > 0:
            personalization /= total
        else:
            personalization = np.ones(n) / n
        
        return personalization
    
    def get_description(self) -> str:
        return "Transaction volume weighted personalization"