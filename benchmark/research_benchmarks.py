import numpy as np
import networkx as nx
import time
import matplotlib.pyplot as plt
import os

def ppr_core(G, seed_nodes, alpha=0.15, epsilon=1e-6):
    nodes = list(G.nodes())
    n = len(nodes)
    node_to_idx = {node: i for i, node in enumerate(nodes)}
    
    p = np.zeros(n)
    for seed in seed_nodes:
        if seed in node_to_idx:
            p[node_to_idx[seed]] = 1.0 / len(seed_nodes)
    
    M = nx.google_matrix(G, alpha=1).T 
    
    r = p.copy()
    iterations = 0
    start_time = time.time()
    
    while True:
        r_new = (1 - alpha) * np.dot(M, r).flatten() + alpha * p
        
        if np.linalg.norm(r_new - r, ord=1) < epsilon:
            break
        
        r = r_new
        iterations += 1
    
    return time.time() - start_time, iterations

def run_scalability_test():
    sizes = [100, 500, 1000, 2000, 5000]
    times = []
    
    print("Starting Scalability Test...")
    for size in sizes:
        G = nx.fast_gnp_random_graph(size, 0.01, directed=True)
        duration, _ = ppr_core(G, [0])
        times.append(duration)
        print(f"Size {size} finished in {duration:.4f}s")

    plt.figure(figsize=(10, 5))
    plt.plot(sizes, times, marker='o', color='#22d3ee', linewidth=2)
    plt.title("Scalability Test: Execution Time vs Graph Size")
    plt.xlabel("Number of Nodes (V)")
    plt.ylabel("Time (seconds)")
    plt.grid(True, linestyle='--', alpha=0.7)
    plt.savefig('../results/scalability_plot.png')
    print("Scalability plot saved to results/")

def run_alpha_sensitivity():
    alphas = [0.05, 0.15, 0.3, 0.5, 0.8]
    G = nx.fast_gnp_random_graph(1000, 0.01, directed=True)
    avg_iterations = []

    print("\nStarting Alpha Sensitivity Analysis...")
    for a in alphas:
        _, iters = ppr_core(G, [0], alpha=a)
        avg_iterations.append(iters)
        print(f"Alpha {a} converged in {iters} iterations")

    plt.figure(figsize=(10, 5))
    plt.bar([str(a) for a in alphas], avg_iterations, color='#ec4899')
    plt.title("Parameter Sensitivity: Alpha vs Convergence Speed")
    plt.xlabel("Damping Factor (Alpha)")
    plt.ylabel("Number of Iterations")
    plt.savefig('../results/alpha_sensitivity.png')
    print("Alpha sensitivity plot saved to results/")

if __name__ == "__main__":
    if not os.path.exists('../results'):
        os.makedirs('../results')
    
    run_scalability_test()
    run_alpha_sensitivity()