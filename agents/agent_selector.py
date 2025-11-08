import os
import sys
import numpy as np
from data_loader.data_loader import DataLoader
from ad_model_selection.prompts.pygod_ms_prompt import generate_model_selection_prompt_from_pygod
from ad_model_selection.prompts.pyod_ms_prompt import generate_model_selection_prompt_from_pyod
from ad_model_selection.prompts.timeseries_ms_prompt import generate_model_selection_prompt_from_timeseries
from utils.gemini_client import query_gemini

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

class AgentSelector:

    def __init__(self, user_input):
        self.user_input = user_input
        self.data_path_train = user_input["dataset_train"]
        self.data_path_test = user_input.get("dataset_test")
        self.parameters = user_input.get("parameters", {}) or {}

        # Load datasets
        self._load_data()

        # Detect package type
        self._detect_package()

        # Select algorithm (strict or auto-smart)
        self._select_algorithm()

        # Final output (pipeline expects tools list)
        self.tools = [self.algorithm_name]
        self.vectorstore = None  # remains unused but required by pipeline

        print("\n=== Selector Summary ===")
        print(f"[INFO] Package Detected: {self.package_name}")
        print(f"[INFO] Final Algorithm Selected: {self.algorithm_name}")
        print(f"[INFO] Parameters: {self.parameters}\n")

    # -------------------- Data Loading --------------------
       # -------------------- Data Loading --------------------
    def _load_data(self):
        train_loader = DataLoader(self.data_path_train, store_script=True, store_path="train_data_loader.py")
        self.X_train, self.y_train = train_loader.load_data(split_data=False)

        # If test data exists → load normally
        if self.data_path_test and os.path.exists(self.data_path_test):
            test_loader = DataLoader(self.data_path_test, store_script=True, store_path="test_data_loader.py")
            self.X_test, self.y_test = test_loader.load_data(split_data=False)
        else:
            # ✅ NEW: No test dataset → use training data as test dataset
            print("[Selector] No test dataset detected → using training dataset as test set.")
            self.X_test, self.y_test = self.X_train.copy(), (
                self.y_train.copy() if isinstance(self.y_train, np.ndarray) else None
            )

        # Determine supervised or unsupervised mode
        self.supervised = (
            isinstance(self.y_train, np.ndarray)
            and set(np.unique(self.y_train)).issubset({0, 1})
        )

    # -------------------- Package Detection --------------------
    def _detect_package(self):
        # Graph dataset → PyGOD
        if hasattr(self.X_train, "num_nodes"):
            self.package_name = "pygod"
            return

        # Tabular time-series / standard input
        if isinstance(self.X_train, np.ndarray):
            if not self.supervised:
                self.package_name = "pyod"
            else:
                # Darts supervised forecasting processing
                self.package_name = "darts"
                dim = self.X_train.shape[1] if len(self.X_train.shape) > 1 else 1
                self.parameters["enc_in"] = dim
                self.parameters["c_out"] = dim
            return

        # Safe fallback
        self.package_name = "pyod"

    # -------------------- Auto Model Selection --------------------
    def _select_algorithm(self):
        algo_list = self.user_input.get("algorithm") or []

        # STRICT MODE: user provided model
        if len(algo_list) > 0:
            self.algorithm_name = algo_list[0]
            return

        # AUTO MODE: ask Gemini for best model
        name = os.path.basename(self.data_path_train)

        if self.package_name == "pyod":
            size, dim = self.X_train.shape
            prompt_msgs = generate_model_selection_prompt_from_pyod(name, size, dim)

        elif self.package_name == "pygod":
            num_node = self.X_train.num_nodes
            num_edge = self.X_train.num_edges
            num_feature = self.X_train.num_features
            avg_degree = num_edge / max(num_node, 1)
            prompt_msgs = generate_model_selection_prompt_from_pygod(name, num_node, num_edge, num_feature, avg_degree)

        else:  # darts
            try:
                dim = self.X_train.shape[1] if len(self.X_train.shape) > 1 else 1
            except:
                dim = 1
            num_signals = len(self.X_train)
            series_type = "multivariate" if dim > 1 else "univariate"
            prompt_msgs = generate_model_selection_prompt_from_timeseries(name, num_signals, dim, series_type)

        # Build final prompt
        prompt = "\n".join([msg["content"] for msg in prompt_msgs])
        prompt += "\n\nReturn ONLY JSON: {\"choice\": \"MODEL_NAME\"}"

        raw_response = query_gemini(prompt)
        choice = self._parse_gemini_choice(raw_response)

        # Robust fallback defaults
        if not choice:
            choice = (
                "ECOD" if self.package_name == "pyod" else
                "SCAN" if self.package_name == "pygod" else
                "RNNModel"
            )

        self.algorithm_name = choice

    # -------------------- Gemini Response Parser --------------------
    def _parse_gemini_choice(self, text: str):
        import json, re
        try:
            cleaned = re.sub(r"```(?:json)?|```", "", text, flags=re.MULTILINE).strip()
            match = re.search(r"\{.*\}", cleaned, flags=re.DOTALL)
            if match:
                cleaned = match.group(0)
            data = json.loads(cleaned)
            return data.get("choice", None)
        except:
            print("[WARN] Selector: Could not parse Gemini output → using fallback.")
            return None


if __name__ == "__main__":
    # For manual debug testing
    user_input = {
        "algorithm": [],  # empty → auto smart choosing
        "dataset_train": "./data/MSL.csv",
        "dataset_test": "./data/MSL.csv",
        "parameters": {}
    }
    selector = AgentSelector(user_input)
