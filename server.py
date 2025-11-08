import os
import uuid
import threading
import time
from flask import Flask, request, jsonify, Response
from flask_cors import CORS

from main import compiled_full_graph, FullToolState
from agents.agent_processor import AgentProcessor
from agents.agent_info_miner import AgentInfoMiner
from agents.agent_code_generator import AgentCodeGenerator
from agents.agent_reviewer import AgentReviewer
from agents.agent_evaluator import AgentEvaluator
from agents.agent_optimizer import AgentOptimizer

app = Flask(__name__)
CORS(app)

# Stores streaming log history
LOG_BUFFERS = {}
# Stores final pipeline output
RESULTS = {}


def run_pipeline(run_id, cmd, train, test):
    # Initialize storage for logs for this run
    LOG_BUFFERS[run_id] = []

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

        # Store final results (fallback to empty list if missing)
        RESULTS[run_id] = final.get("results", [])
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

app.run(port=8000, debug=False)
