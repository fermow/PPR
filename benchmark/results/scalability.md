# Scalability Analysis Report

**Objective:** To examine the temporal behavior of the algorithm as the network size increases (number of nodes and edges).

## Chart Analysis:
In this experiment, the number of graph nodes was increased from 100 to 5,000. According to the output chart:
- **Linear Growth:** The execution time increases with a constant slope, indicating a time complexity of $O(V + E)$.
- **Optimization:** By using a **Sparse Matrix** data structure (adjacency list), unnecessary computations on zero-weight edges were avoided.

## Conclusion:
The implemented algorithm is resilient to *data explosion*. This means the system can analyze large transactional networks without performance degradation, which is one of the key requirements stated in Dr. Katanforoush’s project documentation.
