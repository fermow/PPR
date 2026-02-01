Fraud Detection System with Personalized PageRank
=================================================

Table of Contents
-----------------

*   [Overview](https://www.google.com/search?q=#overview)
    
*   [Key Features](https://www.google.com/search?q=#key-features)
    
*   [Project Architecture](https://www.google.com/search?q=#project-architecture)
    
*   [Project Structure](https://www.google.com/search?q=#project-structure)
    
*   [Installation & Dependencies](https://www.google.com/search?q=#installation--dependencies)
    
*   [Usage Guide](https://www.google.com/search?q=#usage-guide)
    
*   [API Reference](https://www.google.com/search?q=#api-reference)
    
*   [Algorithms & Core Logic](https://www.google.com/search?q=#algorithms--core-logic)
    

Overview
--------

This project implements a **Fraud Detection System** using **Personalized PageRank (PPR)** on transaction or interaction graphs. The system identifies high-risk or suspicious nodes (e.g., fraudulent accounts) in a network by biasing a graph-based ranking algorithm toward known suspicious entities.

The backend is built with **Python** and exposes robust APIs via **Flask**, allowing easy integration with frontends like React or other web interfaces.

Key Features
------------

*   **Weighted & Directed Graphs**: Fully supports complex transaction networks with edge weights representing transaction volumes.
    
*   **Intelligent Dangling Node Handling**: Strategies to redistribute rank from "dead-end" nodes efficiently.
    
*   **Personalized Suspicion Scoring**: Biases the PageRank algorithm to highlight nodes connected to known fraudulent entities.
    
*   **REST API**: Comprehensive endpoints for graph creation, manipulation, and analysis.
    
*   **High Performance**: Utilizes **Sparse Matrix** optimizations (SciPy) to handle large-scale graphs without excessive memory usage.
    
*   **Extensible Design**: Modular strategies for personalization and dangling node behaviors.
    

Project Architecture
--------------------

The system follows a clean, **layered architecture** to ensure separation of concerns:

1.  **Infrastructure Layer**: Handles graph data structures and storage (SparseGraph).
    
2.  **Domain Layer**: Defines strategies for handling dangling nodes and personalization logic (strategies.py).
    
3.  **Application Layer**: The core engine that executes the PageRank power iteration (pagerank.py).
    
4.  **API Layer**: RESTful endpoints to interact with the system via Flask (app.py).
    

Project Structure
-----------------

```
   ├── app.py # Flask API for graph management and PageRank computation
   ├── pagerank.py # Power iteration engine implementing Personalized PageRank
   ├── strategies.py # Domain abstractions for dangling node and personalization
   ├── graph.py # SparseGraph class for memory-efficient graph storage
   └── README.md # Project documentation
```

Installation & Dependencies
---------------------------

### Prerequisites

*   **Python**: 3.10+
    

### Setup

Install the required libraries:

```bash
pip install flask flask-cors numpy scipy
```

Usage Guide
-----------

### 1\. Start the Server

Run the Flask application:
```bash
python app.py
```

### 2\. Create a Graph

Initialize a graph with edges (e.g., transactions) via cURL:
```bash
curl -X POST [http://127.0.0.1:5000/graph/create](http://127.0.0.1:5000/graph/create)


\-H "Content-Type: application/json"

\-d '{"directed": true, "edges": \[\["A", "B", 100\], \["B", "C", 50\]\]}'
```

### 3\. Compute Suspicion Scores

Run the Personalized PageRank algorithm, boosting known suspicious nodes (e.g., Node 'A'):
```bash
curl -X POST [http://127.0.0.1:5000/pagerank/compute](http://127.0.0.1:5000/pagerank/compute)


\-H "Content-Type: application/json"

\-d '{"suspicious\_nodes": {"A": 0.7, "C": 0.5}}'
```

API Reference
-------------

### Graph Management

#### POST/graph/create

Initializes a new graph.**Payload:**
```json
  {"directed": true,
  "edges": [["A", "B", 100],
            ["B", "C", 50]]}
```

#### GET/graph/current

Returns the current graph's adjacency matrix, node degrees, and edge list.

#### GET/graph/demo

Populates the system with a pre-defined demo graph for quick testing.

### Analysis & Computation

#### POST/pagerank/compute

Computes Personalized PageRank scores.**Payload:**
```json
  {"damping\_factor": 0.85,
  "max\_iterations": 100,
  "tolerance": 1e-8,
  "suspicious\_nodes": {"A": 0.8, "B": 0.5}}
```

#### POST/nodes/suspicious

Manually marks nodes with suspicion scores for future personalization.

#### GET/analysis/summary

Returns a summary of the current analysis (mock data).

> **Note**: Graphs are currently stored in-memory for simplicity. For production, integrate a database (e.g., Neo4j or PostgreSQL).

Algorithms & Core Logic
-----------------------

### Power Iteration for PageRank

The system calculates the rank vector r using the power iteration method. The fundamental update rule is:

rnew​=(1−α)Mr+αp+dangling\_contribution

Where:

*   α: Damping factor (probability of continuing the walk).
    
*   M: The transition matrix.
    
*   p: The personalization vector (biasing the walk toward suspicious nodes).
    

### Workflow

1.  **Initialization**: Rank vector r is initialized to the personalization vector p.
    
2.  **Iteration**: Update r using the formula above.
    
3.  **Convergence**: Check if the change in r (L1 norm) is below the tolerance threshold.
    
4.  **Termination**: Stop when converged or maxi​terations is reached.
    

### Strategies

*   **Dangling Nodes**:
    
    *   _Uniform_: Redistribute rank equally among all nodes.
        
    *   _Teleport_: Redistribute rank based on the personalization vector p.
        
*   **Personalization**:
    
    *   Suspicious nodes receive higher weights in vector p.
        
    *   Transaction volumes act as edge weights, influencing the transition matrix M.