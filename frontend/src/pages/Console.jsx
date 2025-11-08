import { useEffect, useState } from "react";
import { fetchResults } from "../api/backend";

const STEPS = [
  { key: "PROCESSOR", label: "Processor", icon: "⚡" },
  { key: "SELECTOR", label: "Selector", icon: "🎯" },
  { key: "INFOMINER", label: "Info Miner", icon: "⛏" },
  { key: "CODEGEN", label: "Code Generator", icon: "💻" },
  { key: "REVIEWER", label: "Reviewer", icon: "👁" },
  { key: "EVALUATOR", label: "Evaluator / Execution", icon: "🚀" },
];

export default function Console({ jobId, setResults, setPage }) {
  const [progress, setProgress] = useState({});

  useEffect(() => {
    const stream = new EventSource(`http://127.0.0.1:8000/logs/${jobId}`);

    stream.onmessage = async (e) => {
      const msg = e.data;

      if (msg.includes("PROCESSOR DONE")) setProgress(p => ({ ...p, PROCESSOR: "done" }));
      if (msg.includes("Selector]")) setProgress(p => ({ ...p, SELECTOR: "done" }));
      if (msg.includes("[InfoMiner]")) setProgress(p => ({ ...p, INFOMINER: "done" }));
      if (msg.includes("[CodeGen]")) setProgress(p => ({ ...p, CODEGEN: "done" }));
      if (msg.includes("[Reviewer]")) setProgress(p => ({ ...p, REVIEWER: "done" }));
      if (msg.includes("[Finish]") || msg.includes("Evaluator")) setProgress(p => ({ ...p, EVALUATOR: "done" }));

      if (msg.includes("DONE") || msg.includes("[Finish] Completed")) {
        const r = await fetchResults(jobId);
        setResults(r);
        stream.close();
        setPage("results");
      }
    };

    return () => stream.close();
  }, [jobId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0c1f] to-[#1b1f3b] flex justify-center items-center p-10">
      <div className="w-full max-w-3xl bg-white/10 backdrop-blur-2xl border border-white/20 p-10 rounded-3xl shadow-2xl space-y-6">
        <h2 className="text-center text-3xl font-bold text-cyan-300">Pipeline Execution</h2>

        {STEPS.map((s) => (
          <div key={s.key} className="flex justify-between items-center border-b border-white/10 py-2">
            <span className="text-gray-300 text-lg">{s.icon} {s.label}</span>
            <span className="text-cyan-300">
              {progress[s.key] === "done" ? "✅ Done" : "⏳ Waiting"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
