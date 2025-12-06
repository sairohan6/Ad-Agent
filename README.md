Multi Agent Anomaly Detection

Multi Agent Anomaly Detection is an LLM-driven multi-agent framework that automatically converts natural language instructions into fully runnable anomaly detection (AD) pipelines. It supports multiple data types such as tabular data, graph-structured data, and time-series data. The system eliminates the need for manual coding or deep knowledge of AD libraries, making anomaly detection accessible to everyone.

Key Features

End-to-end pipeline generation from a simple text command

Support for multiple data modalities

Multivariate (PyOD)

Graph (PyGOD)

Time-Series (TSLib)

Automatic model and library selection based on dataset type

Code generation and self-debugging using a Reviewer agent

Optional evaluation metrics if ground-truth labels are provided

Automated hyperparameter optimization to improve detection accuracy

Shared short-term memory and cached long-term memory to speed up repeated tasks

System Architecture

The workflow is driven by multiple specialized LLM agents that coordinate through structured memory:

Processor
Interprets user input, identifies data type, and prepares the dataset

Selector
Selects the most suitable AD library and model

Info Miner
Gathers model parameters and documentation from prior knowledge or cache

Code Generator
Produces an executable Python script for anomaly detection

Code Reviewer
Executes a synthetic dry-run to detect issues and automatically corrects them

Evaluator (Optional)
Computes metrics such as AUROC or F1-Score when labels exist

Optimizer (Optional)
Improves model hyperparameters through an iterative tuning loop

Supported Libraries
Library	Domain Type	Example Datasets
PyOD	Multivariate / Tabular	cardio, mnist, satellite, pima
PyGOD	Graph-based anomaly detection	books, enron, reddit, weibo
TSLib	Time-series anomaly detection	MSL, SMAP, SMD, SWaT
Example User Command

A simple natural language instruction such as:

Run VAE on cardio.mat


The system will automatically:

Load the dataset

Select PyOD and the VAE model

Gather relevant model configuration

Generate and validate code

Save the final script in the generated scripts folder

The user does not need to write a single line of code.

Installation

Clone the repository:

git clone https://github.com/sairohan6/Multi-Agent-Anomaly-Detection.git
cd Multi-Agent-Anomaly-Detection


Install dependencies:

pip install -r requirements.txt


Run the system:

python main.py


Enter commands in plain English to generate pipelines.

Usage Instructions

Place your dataset inside the data folder

Use simple text-based instructions such as:

Detect anomalies in cardio.mat

Use DeepSVDD for mnist.mat

Perform time-series anomaly detection on MSL

Every execution produces a new detection script that can be executed independently using Python.

Experimental Highlights

Achieves over 90 percent valid pipeline generation across all library types

Model recommendations closely match top-performing models in benchmarks

Long-term memory reduces documentation lookup time from seconds to instant

Hyperparameter optimization significantly improves AUROC and AUPRC scores

Project Goals

Reduce dependency on AD expert knowledge

Provide a reusable, extensible AD assistant

Enable anomaly detection for various industries including:

Cybersecurity

Finance and fraud detection

Healthcare and medical signal monitoring

Industrial IoT analytics

Limitations

Depends on library versions and LLM behavior

Some models may require user-provided constraints for perfect performance

Not all uncommon dataset formats are supported yet

Future Enhancements

Support additional AD libraries and data modalities

Add conversational refinement of pipelines

Provide cloud execution environment with pre-built configurations

Adaptive model selection based on accuracy-to-cost ratio

