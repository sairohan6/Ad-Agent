import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircleIcon, ClipboardDocumentIcon, ClipboardDocumentCheckIcon, ChartBarIcon, CpuChipIcon, DocumentTextIcon } from "@heroicons/react/24/outline";

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

  if (!data) {
    return (
      <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-[#0a0c1f] to-black flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-[#0a0c1f] to-black p-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMDMpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-6xl mx-auto space-y-8 relative z-10"
      >
        <div className="text-center space-y-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full shadow-lg shadow-green-500/30 mb-4"
          >
            <CheckCircleIcon className="w-10 h-10 text-white" />
          </motion.div>

          <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-black via-green-200 to-emerald-300">
            Pipeline Complete
          </h1>
          <p className="text-gray-400 text-lg">Your anomaly detection model has been successfully built and evaluated</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 backdrop-blur-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-3xl p-8 shadow-2xl space-y-6"
          >
            <div className="flex items-center gap-3 pb-4 border-b border-white/10">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
                <CpuChipIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-black">{data.algorithm?.toUpperCase()}</h2>
                <p className="text-sm text-black-400">Selected Algorithm</p>
              </div>
            </div>

            {data.metrics && (
              <div className="grid grid-cols-2 gap-4">
                <motion.div
                  whileHover={{ scale: 1.02, y: -2 }}
                  className="p-6 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 shadow-lg"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <ChartBarIcon className="w-5 h-5 text-cyan-400" />
                    <p className="text-xs font-semibold text-cyan-300 uppercase tracking-wide">AUROC Score</p>
                  </div>
                  <p className="text-4xl font-black text-black">{data.metrics.auroc !== null && data.metrics.auroc !== -1 ? data.metrics.auroc.toFixed(4) : 'N/A'}</p>
                  <p className="text-xs text-gray-400 mt-1">Area Under ROC Curve</p>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02, y: -2 }}
                  className="p-6 rounded-2xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 shadow-lg"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <ChartBarIcon className="w-5 h-5 text-green-400" />
                    <p className="text-xs font-semibold text-green-300 uppercase tracking-wide">AUPRC Score</p>
                  </div>
                  <p className="text-4xl font-black text-black">{data.metrics.auprc !== null && data.metrics.auprc !== -1 ? data.metrics.auprc.toFixed(4) : 'N/A'}</p>
                  <p className="text-xs text-gray-400 mt-1">Average Precision Score</p>
                </motion.div>
              </div>
            )}

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <DocumentTextIcon className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-bold text-black">Model Parameters</h3>
              </div>
              <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 overflow-auto">
                <pre className="text-sm text-green-400 font-mono">
{JSON.stringify(data.parameters, null, 2)}
                </pre>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            <div className="backdrop-blur-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-3xl p-6 shadow-2xl space-y-4">
              <h3 className="text-lg font-bold text-black">Dataset Info</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-400 mb-1">Training Data</p>
                  <p className="text-black font-mono text-xs bg-white/5 px-3 py-2 rounded-lg break-all">
                    {data.dataset_train?.split('/').pop() || 'N/A'}
                  </p>
                </div>
                {data.dataset_test && (
                  <div>
                    <p className="text-gray-400 mb-1">Testing Data</p>
                    <p className="text-black font-mono text-xs bg-white/5 px-3 py-2 rounded-lg break-all">
                      {data.dataset_test?.split('/').pop() || 'N/A'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="backdrop-blur-2xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-3xl p-6 shadow-2xl">
              <h3 className="text-sm font-semibold text-cyan-300 mb-3 uppercase tracking-wide">Quick Stats</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Status</span>
                  <span className="text-green-600 font-semibold flex items-center gap-1">
                    <CheckCircleIcon className="w-4 h-4" />
                    Complete
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Pipeline</span>
                  <span className="text-black font-semibold">6 Stages</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Model Type</span>
                  <span className="text-black font-semibold">Anomaly Detection</span>
                </div>
                {data.dataset_stats && (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Samples</span>
                      <span className="text-black font-semibold">{data.dataset_stats?.num_samples}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Features</span>
                      <span className="text-black font-semibold">{data.dataset_stats?.num_features}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Anomalies Detected</span>
                      <span className="text-black font-semibold">{data.dataset_stats?.num_anomalies}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="backdrop-blur-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-3xl p-8 shadow-2xl space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DocumentTextIcon className="w-5 h-5 text-black-400" />
              <h3 className="text-lg font-bold text-black">Generated Code</h3>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={copyCode}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-cyan-500/20 transition-all"
            >
              {copied ? (
                <>
                  <ClipboardDocumentCheckIcon className="w-4 h-4" />
                  Copied
                </>
              ) : (
                <>
                  <ClipboardDocumentIcon className="w-4 h-4" />
                  Copy Code
                </>
              )}
            </motion.button>
          </div>

          <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 overflow-auto max-h-96">
            <pre className="text-sm text-green-300 font-mono leading-relaxed">
{data.code}
            </pre>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
