import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fetchResults } from "../api/backend";
import { CheckCircleIcon, ClockIcon } from "@heroicons/react/24/solid";
import { CpuChipIcon, MagnifyingGlassIcon, DocumentMagnifyingGlassIcon, CodeBracketIcon, EyeIcon, RocketLaunchIcon } from "@heroicons/react/24/outline";

const STEPS = [
  { key: "PROCESSOR", label: "Command Processor", desc: "Parsing input and configuration", Icon: CpuChipIcon },
  { key: "SELECTOR", label: "Algorithm Selector", desc: "Choosing optimal model", Icon: MagnifyingGlassIcon },
  { key: "INFOMINER", label: "Documentation Miner", desc: "Fetching API references", Icon: DocumentMagnifyingGlassIcon },
  { key: "CODEGEN", label: "Code Generator", desc: "Building executable script", Icon: CodeBracketIcon },
  { key: "REVIEWER", label: "Code Reviewer", desc: "Validating syntax and logic", Icon: EyeIcon },
  { key: "EVALUATOR", label: "Model Evaluator", desc: "Training and computing metrics", Icon: RocketLaunchIcon },
];

export default function Console({ jobId, setResults, setPage }) {
  const [progress, setProgress] = useState({});
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const stream = new EventSource(`http://127.0.0.1:8000/logs/${jobId}`);

    stream.onmessage = async (e) => {
      const msg = e.data;

      if (msg.includes("PROCESSOR DONE")) {
        setProgress(p => ({ ...p, PROCESSOR: "done" }));
        setCurrentStep(1);
      }
      if (msg.includes("Selector]")) {
        setProgress(p => ({ ...p, SELECTOR: "done" }));
        setCurrentStep(2);
      }
      if (msg.includes("[InfoMiner]")) {
        setProgress(p => ({ ...p, INFOMINER: "done" }));
        setCurrentStep(3);
      }
      if (msg.includes("[CodeGen]")) {
        setProgress(p => ({ ...p, CODEGEN: "done" }));
        setCurrentStep(4);
      }
      if (msg.includes("[Reviewer]")) {
        setProgress(p => ({ ...p, REVIEWER: "done" }));
        setCurrentStep(5);
      }
      if (msg.includes("[Finish]") || msg.includes("Evaluator")) {
        setProgress(p => ({ ...p, EVALUATOR: "done" }));
        setCurrentStep(6);
      }

      if (msg.includes("DONE") || msg.includes("[Finish] Completed")) {
        const r = await fetchResults(jobId);
        setResults(r);
        stream.close();
        setTimeout(() => setPage("results"), 1000);
      }
    };

    return () => stream.close();
  }, [jobId]);

  const getStepStatus = (index) => {
    const step = STEPS[index];
    if (progress[step.key] === "done") return "done";
    if (index === currentStep) return "active";
    return "waiting";
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-[#0a0c1f] to-black flex justify-center items-center p-10 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMDMpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-4xl relative z-10"
      >
        <div className="text-center mb-12 space-y-4">
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-full backdrop-blur-xl"
          >
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
            <span className="text-xs font-semibold text-cyan-300 tracking-wide uppercase">Pipeline Running</span>
          </motion.div>

          <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-blue-300">
            Building Your Model
          </h2>
          <p className="text-gray-400">Watch as our agents construct your anomaly detection pipeline</p>
        </div>

        <div className="backdrop-blur-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-3xl p-8 shadow-2xl space-y-1">
          {STEPS.map((step, index) => {
            const status = getStepStatus(index);
            const Icon = step.Icon;
            const isLast = index === STEPS.length - 1;

            return (
              <div key={step.key}>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative flex items-start gap-4 p-5 rounded-2xl transition-all duration-500 ${
                    status === "done"
                      ? "bg-green-500/5 border border-green-500/20"
                      : status === "active"
                      ? "bg-cyan-500/10 border border-cyan-500/30 shadow-lg shadow-cyan-500/20"
                      : "bg-white/[0.02] border border-white/5"
                  }`}
                >
                  <div className="flex-shrink-0 relative">
                    <AnimatePresence mode="wait">
                      {status === "done" ? (
                        <motion.div
                          key="done"
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          exit={{ scale: 0 }}
                          transition={{ type: "spring", stiffness: 200, damping: 15 }}
                          className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/30"
                        >
                          <CheckCircleIcon className="w-7 h-7 text-white" />
                        </motion.div>
                      ) : status === "active" ? (
                        <motion.div
                          key="active"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30 relative"
                        >
                          <Icon className="w-6 h-6 text-white" />
                          <motion.div
                            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="absolute inset-0 rounded-full bg-cyan-400"
                          />
                        </motion.div>
                      ) : (
                        <motion.div
                          key="waiting"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center"
                        >
                          <Icon className="w-6 h-6 text-gray-600" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="flex-1 pt-2">
                    <h3 className={`font-bold text-lg mb-1 transition-colors ${
                      status === "done" ? "text-green-300" : status === "active" ? "text-cyan-300" : "text-gray-500"
                    }`}>
                      {step.label}
                    </h3>
                    <p className="text-sm text-gray-400">{step.desc}</p>
                  </div>

                  <div className="flex-shrink-0 pt-3">
                    {status === "done" && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full text-xs font-semibold text-green-300"
                      >
                        Complete
                      </motion.div>
                    )}
                    {status === "active" && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="px-3 py-1 bg-cyan-500/20 border border-cyan-500/30 rounded-full text-xs font-semibold text-cyan-300 flex items-center gap-2"
                      >
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                          className="w-3 h-3 border-2 border-cyan-400 border-t-transparent rounded-full"
                        />
                        Running
                      </motion.div>
                    )}
                    {status === "waiting" && (
                      <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-semibold text-gray-500 flex items-center gap-2">
                        <ClockIcon className="w-3 h-3" />
                        Queued
                      </div>
                    )}
                  </div>
                </motion.div>

                {!isLast && (
                  <div className="flex justify-start pl-6 py-1">
                    <div className={`w-0.5 h-6 rounded-full transition-all duration-500 ${
                      status === "done" ? "bg-gradient-to-b from-green-500 to-cyan-500" : "bg-white/10"
                    }`} />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center text-sm text-gray-500"
        >
          <p>This process typically takes 30-60 seconds</p>
        </motion.div>
      </motion.div>
    </div>
  );
}
