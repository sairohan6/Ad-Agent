import os
import uuid
import threading
import time
import bcrypt
import jwt
from datetime import datetime, timedelta
from flask import Flask, request, jsonify, Response
from flask_cors import CORS
from pymongo import MongoClient
from functools import wraps

from main import compiled_full_graph, FullToolState
from agents.agent_processor import AgentProcessor
from agents.agent_info_miner import AgentInfoMiner
from agents.agent_code_generator import AgentCodeGenerator
from agents.agent_reviewer import AgentReviewer
from agents.agent_evaluator import AgentEvaluator
from agents.agent_optimizer import AgentOptimizer

app = Flask(__name__)
app.config['SECRET_KEY'] = 'ad-agent-secret-key-change-in-production'
CORS(app,
     resources={r"/*": {"origins": ["http://localhost:5173"]}},
     supports_credentials=True,
     allow_headers=["Content-Type", "Authorization"],
     methods=["GET", "POST", "OPTIONS"]
)


# MongoDB connection
try:
    mongo_client = MongoClient('mongodb://localhost:27017/')
    db = mongo_client['ad_agent_db']
    users_collection = db['users']
    print("[INFO] Connected to MongoDB successfully")
except Exception as e:
    print(f"[WARNING] MongoDB connection failed: {e}")
    users_collection = None

# Stores streaming log history
LOG_BUFFERS = {}
# Stores final pipeline output
RESULTS = {}
# Stores additional metadata (processor/selector output)
METADATA = {}


def run_pipeline(run_id, cmd, train, test):
    # Initialize storage for logs for this run
    LOG_BUFFERS[run_id] = []
    METADATA[run_id] = {"processor_output": None, "selector_output": None, "dataset_stats": {}}

    # Local log method to push logs into buffer
    def log(msg):
        print(msg)
        LOG_BUFFERS[run_id].append(msg)

    try:
        log("PROCESSOR START")
        processor = AgentProcessor()
        cfg = processor.process_command(cmd)

        # Attach dataset paths
        cfg["dataset_train"] = train
        cfg["dataset_test"] = test

        # Store processor output
        METADATA[run_id]["processor_output"] = cfg
        log("PROCESSOR DONE")

        # Full pipeline state
        state: FullToolState = {
            "messages": [],
            "current_tool": "",
            "input_parameters": {},
            "data_path_train": "",
            "data_path_test": "",
            "package_name": "",
            "agent_info_miner": AgentInfoMiner(),
            "agent_code_generator": AgentCodeGenerator(),
            "agent_reviewer": AgentReviewer(),
            "agent_evaluator": AgentEvaluator(),
            "agent_optimizer": AgentOptimizer(),
            "vectorstore": None,
            "code_quality": None,
            "should_rerun": False,
            "agent_processor": processor,
            "agent_selector": None,
            "experiment_config": cfg,
            "results": None,
            "algorithm_doc": None,
            "log_fn": log,
        }

        log("PIPELINE START")
        final = compiled_full_graph.invoke(state)

        # Store selector output
        if final.get("agent_selector"):
            selector = final["agent_selector"]
            METADATA[run_id]["selector_output"] = {
                "algorithm": selector.algorithm_name,
                "package": selector.package_name
            }

        # Compute dataset statistics
        try:
            from data_loader.data_loader import DataLoader
            train_loader = DataLoader(train, store_script=False)
            X_train, y_train = train_loader.load_data(split_data=False)

            import numpy as np
            if isinstance(X_train, np.ndarray):
                num_samples = X_train.shape[0]
                num_features = X_train.shape[1] if len(X_train.shape) > 1 else 1

                # Count anomalies if labels exist
                if isinstance(y_train, np.ndarray) and set(np.unique(y_train)).issubset({0, 1}):
                    num_anomalies = int(np.sum(y_train == 1))
                else:
                    num_anomalies = "Unknown"

                METADATA[run_id]["dataset_stats"] = {
                    "num_samples": num_samples,
                    "num_features": num_features,
                    "num_anomalies": num_anomalies
                }
            else:
                METADATA[run_id]["dataset_stats"] = {
                    "num_samples": "N/A",
                    "num_features": "N/A",
                    "num_anomalies": "Unknown"
                }
        except Exception as e:
            print(f"[WARNING] Failed to compute dataset stats: {e}")
            METADATA[run_id]["dataset_stats"] = {
                "num_samples": "N/A",
                "num_features": "N/A",
                "num_anomalies": "Unknown"
            }

        # Store final results (fallback to empty dict if missing)
        result_data = final.get("results", {})
        if isinstance(result_data, dict):
            result_data["dataset_stats"] = METADATA[run_id]["dataset_stats"]
        RESULTS[run_id] = result_data
        log("DONE")

    except Exception as e:
        RESULTS[run_id] = []
        LOG_BUFFERS[run_id].append(f"[ERROR] {str(e)}")
        LOG_BUFFERS[run_id].append("DONE")


@app.post("/upload")
def upload():
    file = request.files["file"]
    os.makedirs("data", exist_ok=True)
    path = os.path.abspath(os.path.join("data", file.filename))
    file.save(path)
    return jsonify({"path": path})


@app.post("/run")
def run():
    data = request.json
    cmd = data.get("command")
    train = data.get("train_path")
    test = data.get("test_path")

    run_id = str(uuid.uuid4())

    threading.Thread(target=run_pipeline, args=(run_id, cmd, train, test)).start()

    return jsonify({"job_id": run_id})


@app.get("/logs/<run_id>")
def stream_logs(run_id):
    def stream():
        last = 0
        while True:
            logs = LOG_BUFFERS.get(run_id, [])
            if last < len(logs):
                for line in logs[last:]:
                    yield f"data: {line}\n\n"
                last = len(logs)
            if "DONE" in logs:
                break
            time.sleep(0.3)

    return Response(stream(), mimetype="text/event-stream")


@app.get("/results/<run_id>")
def get_results(run_id):
    result = RESULTS.get(run_id, None)

    if result is None:
        return jsonify({"error": "No results found"}), 404

    return jsonify(result), 200


@app.get("/metadata/<run_id>")
def get_metadata(run_id):
    metadata = METADATA.get(run_id, None)

    if metadata is None:
        return jsonify({"error": "No metadata found"}), 404

    return jsonify(metadata), 200


# ========== AUTH ENDPOINTS ==========

@app.route("/auth/signup", methods=["POST", "OPTIONS"])
def signup():
    if request.method == "OPTIONS":
        return ('', 200)

    if users_collection is None:
        return jsonify({"error": "Database not available"}), 500

    data = request.json
    email = data.get("email")
    password = data.get("password")
    name = data.get("name", "")

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    if users_collection.find_one({"email": email}):
        return jsonify({"error": "User already exists"}), 409

    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    user_doc = {
        "email": email,
        "password": hashed_password,
        "name": name,
        "created_at": datetime.utcnow()
    }

    users_collection.insert_one(user_doc)

    token = jwt.encode({
        "email": email,
        "exp": datetime.utcnow() + timedelta(days=7)
    }, app.config['SECRET_KEY'], algorithm="HS256")

    return jsonify({"token": token, "email": email, "name": name}), 201

@app.route("/auth/login", methods=["POST", "OPTIONS"])
def login():
    if request.method == "OPTIONS":
        return ('', 200)

    if users_collection is None:
        return jsonify({"error": "Database not available"}), 500

    data = request.json
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    user = users_collection.find_one({"email": email})

    if not user or not bcrypt.checkpw(password.encode('utf-8'), user['password'].encode('utf-8')):
        return jsonify({"error": "Invalid credentials"}), 401

    token = jwt.encode({
        "email": email,
        "exp": datetime.utcnow() + timedelta(days=7)
    }, app.config['SECRET_KEY'], algorithm="HS256")

    return jsonify({"token": token, "email": email, "name": user.get("name", "")}), 200


app.run(port=8000, debug=False)
