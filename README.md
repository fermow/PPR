# Fraud Detection System - Personalized PageRank (PPR)

This repository contains a full-stack application designed to detect fraudulent nodes in transaction networks using the Personalized PageRank algorithm.

## 📋 Prerequisites
Ensure you have the following installed on your system:
* **Python 3.10+**
* **Node.js (v16.0+)** and **npm**

---

## 🚀 Step-by-Step Setup Guide

### 1. Backend Setup (Python & Flask)
The backend handles the graph logic, sparse matrix computations, and the PPR engine.

1.  **Open your terminal** and navigate to the project root or `backend` folder.
2.  **Create a virtual environment** to keep dependencies isolated:
    ```bash
    python -m venv venv
    ```
3.  **Activate the virtual environment**:
    * **Windows**: `venv\Scripts\activate`
    * **macOS/Linux**: `source venv/bin/activate`
4.  **Install required packages**:
    ```bash
    pip install -r requirements.txt
    ```
5.  **Run the Flask server**:
    ```bash
    python app.py
    ```
    *The backend should now be running at `http://localhost:5000`.*

---

### 2. Frontend Setup (React.js)
The frontend provides a dashboard to visualize the graph and monitor fraud metrics.

1.  **Open a new terminal** and navigate to the `frontend` directory.
2.  **Install NPM dependencies**:
    ```bash
    npm install
    ```
3.  **Start the React development server**:
    ```bash
    npm start
    ```
    *The dashboard will automatically open in your browser at `http://localhost:3000`.*

---

## 🛠 Project Components
* **`app.py`**: The main Flask API entry point.
* **`domain/`**: Contains the core logic (`pagerank.py`) and strategies (`strategies.py`).
* **`infrastructure/`**: Handles graph data structures and sparse matrix conversions (`graph.py`).
* **`src/components/`**: React components for graph visualization and metrics.

## 💡 Troubleshooting
* **CORS Issues**: The backend is configured with `flask-cors`. If you change ports, update the `CORS(app)` settings in `app.py`.
* **Port Conflict**: If port 5000 is occupied, you can change the port in the last line of `app.py`: `app.run(port=XXXX)`.
* **Missing Data**: Ensure you have a valid graph loaded or use the `/graph/demo` endpoint to generate test data.
