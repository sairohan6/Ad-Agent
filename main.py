import logging, sys, operator
from typing import TypedDict, Annotated, Sequence, Any, Tuple

from langgraph.graph import StateGraph, END

from agents.agent_processor import AgentProcessor
from agents.agent_selector import AgentSelector
from agents.agent_info_miner import AgentInfoMiner
from agents.agent_code_generator import AgentCodeGenerator
from agents.agent_reviewer import AgentReviewer
from agents.agent_evaluator import AgentEvaluator
from agents.agent_optimizer import AgentOptimizer
from entity.code_quality import CodeQuality

logging.basicConfig(stream=sys.stdout, level=logging.ERROR)


class FullToolState(TypedDict):
    messages: Annotated[Sequence[Any], operator.add]
    current_tool: str
    input_parameters: dict
    data_path_train: str
    data_path_test: str
    package_name: str
    agent_info_miner: Any
    agent_code_generator: Any
    agent_reviewer: Any
    agent_evaluator: Any
    agent_optimizer: Any
    vectorstore: Any
    code_quality: Any | None
    should_rerun: bool
    agent_processor: Any
    agent_selector: Any | None
    experiment_config: dict | None
    results: dict | None
    algorithm_doc: str | None
    log_fn: Any


def call_processor(state: FullToolState) -> dict:
    state["log_fn"]("[Processor] Starting pipeline…")
    state["log_fn"](f"[Processor] Parsed config → {state['experiment_config']}")
    return state


def call_selector(state: FullToolState) -> dict:
    state["log_fn"]("[Selector] Loading dataset(s) & selecting algorithm…")
    selector = AgentSelector(state["experiment_config"])
    state.update(
        agent_selector=selector,
        input_parameters=selector.parameters,
        data_path_train=selector.data_path_train,
        data_path_test=selector.data_path_test,
        package_name=selector.package_name,
        vectorstore=selector.vectorstore,
        current_tool=selector.tools[0],
    )
    state["log_fn"](f"[Selector] Final model → {state['current_tool']}")
    return state


def call_info_miner(state: FullToolState) -> dict:
    tool = state["current_tool"]
    state["log_fn"](f"[InfoMiner] Fetching documentation for {tool}…")
    doc = state["agent_info_miner"].query_docs(tool, state["vectorstore"], state["package_name"])
    return {"algorithm_doc": doc}


def call_code_generator(state: FullToolState) -> dict:
    tool = state["current_tool"]
    state["log_fn"](f"[CodeGen] Generating executable code for {tool}…")
    code = state["agent_code_generator"].generate_code(
        tool,
        state["data_path_train"],
        state["data_path_test"],
        state["algorithm_doc"],
        state["input_parameters"],
        state["package_name"]
    )
    params = state["agent_code_generator"]._extract_init_params_dict(state["algorithm_doc"])
    state["code_quality"] = CodeQuality(code, tool, params, "", "", -1, -1, [], 0)
    return state


def call_reviewer(state: FullToolState):
    tool = state["current_tool"]
    state["log_fn"](f"[Reviewer] Validating code for {tool}…")
    res, cleaned = state["agent_reviewer"].test_code(
        state["code_quality"].code, tool, state["package_name"]
    )
    state["code_quality"].code = cleaned
    return state


def call_evaluator(state: FullToolState):
    tool = state["current_tool"]
    state["log_fn"](f"[Evaluator] Running full execution for {tool}…")
    final = state["agent_evaluator"].execute_code(state["code_quality"].code, tool)
    state["code_quality"] = final
    return state


def call_optimizer(state: FullToolState):
    tool = state["current_tool"]
    state["log_fn"](f"[Finish] Completed → {tool} ✅")

    cq = state["code_quality"]

    final_result = {
        "algorithm": tool,
        "dataset_train": state["data_path_train"],
        "dataset_test": state["data_path_test"],
        "parameters": state["input_parameters"],
        "code": getattr(cq, "code", ""),
        "metrics": {
            "auroc": getattr(cq, "auroc", None),
            "auprc": getattr(cq, "auprc", None),
        }
    }

    state["results"] = final_result
    return state


graph = StateGraph(FullToolState)
graph.add_node("processor", call_processor)
graph.add_node("selector", call_selector)
graph.add_node("info", call_info_miner)
graph.add_node("code", call_code_generator)
graph.add_node("review", call_reviewer)
graph.add_node("eval", call_evaluator)
graph.add_node("opt", call_optimizer)

graph.set_entry_point("processor")
graph.add_edge("processor", "selector")
graph.add_edge("selector", "info")
graph.add_edge("info", "code")
graph.add_edge("code", "review")
graph.add_edge("review", "eval")
graph.add_edge("eval", "opt")
graph.add_edge("opt", END)

compiled_full_graph = graph.compile()
