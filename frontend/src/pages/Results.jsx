import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function Results({ results }) {
  const [data, setData] = useState(results);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (results) setData(results);
  }, [results]);

  const copyCode = () => {
    navigator.clipboard.writeText(data.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!data) return <div className="text-white p-10">Waiting...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0c1f] to-[#1b1f3b] p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <h2 className="text-center text-4xl text-cyan-300 font-bold">Pipeline Complete ✅</h2>

        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 space-y-6 shadow-xl">
          <p className="text-white text-2xl font-bold">{data.algorithm?.toUpperCase()}</p>

          {data.metrics && (
            <div className="grid grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-center">
                <p className="text-gray-400 text-sm">AUROC</p>
                <p className="text-white text-3xl font-bold">{data.metrics.auroc}</p>
              </div>
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-center">
                <p className="text-gray-400 text-sm">AUPRC</p>
                <p className="text-white text-3xl font-bold">{data.metrics.auprc}</p>
              </div>
            </div>
          )}

          <pre className="bg-black/40 rounded-xl p-6 text-green-300 overflow-auto text-sm">
{JSON.stringify(data.parameters, null, 2)}
          </pre>

          <div>
            <button onClick={copyCode} className="px-4 py-2 bg-cyan-500 rounded-lg text-white mb-3">
              {copied ? "✅ Copied" : "Copy Code"}
            </button>
            <pre className="bg-black/40 rounded-xl p-6 text-green-300 overflow-auto text-sm">
{data.code}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
