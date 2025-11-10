"""
AgentProcessor - Few-shot CoT Extraction (API Mode)
--------------------------------------------------
Uses Gemini to extract:
- algorithm (list)
- dataset_train (string)
- dataset_test (string)
- parameters (object)

If dataset_test is missing → dataset_test = dataset_train
If algorithm is missing → algorithm=["all"] (Selector will decide best model)
"""

import os
import re
import json
import sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from utils.gemini_client import query_gemini


class AgentProcessor:

    FEW_SHOT_COT_PROMPT = [
        {
            "role": "system",
            "content": (
                "You are an extraction assistant. "
                "Read USER_INSTRUCTION and return four fields as JSON:\n"
                "algorithm (array), dataset_train, dataset_test, parameters (object).\n"
                "Think step-by-step, THEN output one line starting with FINAL: {...}\n"
                "Do not invent values. Only return what is explicitly stated."
            ),
        },
        # Example 1
        {"role": "user", "content": "Run IForest on ./data/train.mat and ./data/test.mat with contamination=0.1"},
        {"role": "assistant", "content":
            'FINAL: {"algorithm":["IForest"],"dataset_train":"./data/train.mat","dataset_test":"./data/test.mat","parameters":{"contamination":0.1}}'
        },
        # Example 2
        {"role": "user", "content": "Run LOF"},
        {"role": "assistant", "content":
            'FINAL: {"algorithm":["LOF"],"dataset_train":null,"dataset_test":null,"parameters":{}}'
        },
        # User Placeholder
        {"role": "user", "content": "USER_INSTRUCTION:\n<START>\n{user_input}\n<END>"}
    ]

    def __init__(self):
        self.experiment_config = {
            "algorithm": [],
            "dataset_train": None,
            "dataset_test": None,
            "parameters": {},
        }

    def _call_gemini(self, prompt_list):
        prompt_text = ""
        for msg in prompt_list:
            role = msg["role"]
            content = msg["content"]
            if role == "system":
                prompt_text += f"{content}\n\n"
            elif role == "user":
                prompt_text += f"User: {content}\n"
            else:
                prompt_text += f"Assistant: {content}\n"
        return query_gemini(prompt_text).strip()

    def extract_config(self, user_input: str) -> dict:
        prompt = [dict(p) for p in self.FEW_SHOT_COT_PROMPT]
        prompt[-1]["content"] = prompt[-1]["content"].format(user_input=user_input)

        response = self._call_gemini(prompt)
        print("\n=== Gemini Extraction ===\n", response, "\n")

        match = re.search(r"FINAL:\s*(\{.*\})", response, flags=re.DOTALL)
        if not match:
            print("[Processor] No FINAL JSON found.")
            return {}

        try:
            parsed = json.loads(match.group(1))
        except Exception:
            print("[Processor] JSON parse error.")
            return {}

        # Normalize paths
        def clean_path(value):
            if value is None or str(value).lower() in ["none", "null", ""]:
                return None
            return os.path.normpath(value)

        parsed["dataset_train"] = clean_path(parsed.get("dataset_train"))
        parsed["dataset_test"] = clean_path(parsed.get("dataset_test"))

        # Ensure algorithm is always a list
        algo = parsed.get("algorithm", [])
        if isinstance(algo, str):
            parsed["algorithm"] = [algo]
        elif not isinstance(algo, list):
            parsed["algorithm"] = []

        return parsed

    def process_command(self, cmd: str) -> dict:
        parsed = self.extract_config(cmd)

        # ✅ Detect explicit "run all"
        user_lower = cmd.lower()
        if any(keyword in user_lower for keyword in ["run all", "run everything", "all models"]):
            parsed["algorithm"] = ["all"]

        # ✅ If user explicitly names a model (keep first only)
        elif parsed.get("algorithm"):
            parsed["algorithm"] = [parsed["algorithm"][0]]

        # ✅ If NO algorithm mentioned → AUTO
        else:
            parsed["algorithm"] = []

        train = parsed.get("dataset_train")
        test = parsed.get("dataset_test")

        # ✅ If no test dataset → use train dataset
        if not test or str(test).lower() in ["", "none", "null"]:
            print("[Processor] No test dataset provided → using training dataset for evaluation.")
            test = train

        # ✅ Ensure parameters is always a dictionary
        params = parsed.get("parameters")
        if not isinstance(params, dict):
            params = {}

        self.experiment_config.update({
            "algorithm": parsed["algorithm"],
            "dataset_train": train,
            "dataset_test": test,
            "parameters": params,
        })

        print("\n=== Processor Output ===")
        print(self.experiment_config, "\n")

        return self.experiment_config
