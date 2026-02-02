# Alpha Parameter Sensitivity Analysis Report

**Objective:** To determine the effect of the damping factor ($\alpha$) on convergence speed and the accuracy of fraud detection.

## Key Findings:
1. **Inverse Relationship:** As the value of $\alpha$ decreases, the number of iterations required for convergence increases significantly.
2. **Mass Distribution:**
   - At low alpha (0.05), the propagation of “suspicion” penetrates deeper layers of the graph, but at the cost of longer computation time.
   - At high alpha (0.8), the algorithm converges rapidly; however, detection remains limited to the immediate neighbors of the seed nodes.

## Research Conclusion:
The value **0.15** was selected as the optimal setting. This value allows the *Suspicion Score* to sufficiently diffuse throughout the network to identify **golden nodes** (hidden fraudsters), while maintaining an acceptable convergence speed.
