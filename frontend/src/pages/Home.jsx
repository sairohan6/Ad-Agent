import { useState } from "react";
import { motion } from "framer-motion";
import FileUpload from "../components/FileUpload";
import { runPipeline } from "../api/backend";
import { PlayIcon, SparklesIcon, ArrowRightOnRectangleIcon } from "@heroicons/react/24/solid";

export default function Home({ setJobId, trainPath, testPath, onLogout }) {
  const [cmd, setCmd] = useState("");
  const [loading, setLoading] = useState(false);

  const start = async () => {
    setLoading(true);
    const id = await runPipeline(cmd, trainPath.current, testPath.current);
    setJobId(id);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-[#0a0c1f] to-black flex justify-center items-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMDMpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30" />

      {onLogout && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          onClick={onLogout}
          className="absolute top-6 right-6 z-20 flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl text-black-300 hover:text-red-400 hover:bg-white/10 transition-all"
        >
          <ArrowRightOnRectangleIcon className="w-4 h-4" />
          <span className="text-sm font-semibold">Logout</span>
        </motion.button>
      )}

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative w-full max-w-5xl z-10"
      >
        <div className="text-center space-y-6 mb-12">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-full backdrop-blur-xl"
          >
            <SparklesIcon className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-semibold text-cyan-700 tracking-wide uppercase">AI-Powered Pipeline</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-7xl font-black tracking-tight"
          >
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-black via-cyan-200 to-blue-300">
              AD-Agent
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed"
          >
            Automated anomaly detection pipeline generation powered by advanced AI reasoning.
            Upload your data and let our agents build, test, and optimize your models.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="backdrop-blur-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-3xl p-10 shadow-2xl space-y-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FileUpload label="Training Dataset" onUploaded={(p) => (trainPath.current = p)} />
            <FileUpload label="Testing Dataset (Optional)" onUploaded={(p) => (testPath.current = p)} />
          </div>

          <div className="space-y-3">
            <label className="text-sm font-semibold text-black-200 tracking-wide block">
              Pipeline Command
            </label>
            <div className="relative">
              <textarea
                rows={3}
                className="w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 text-base text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all duration-300 resize-none"
                placeholder="Example: Run IForest with contamination=0.1"
                value={cmd}
                onChange={(e) => setCmd(e.target.value)}
              />
            </div>
            <p className="text-xs text-gray-500 flex items-start gap-2">
              <span>Tip: Describe your model and parameters in natural language.</span>
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.01, y: -2 }}
            whileTap={{ scale: 0.99 }}
            disabled={loading}
            onClick={start}
            className="w-full relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-500 to-blue-600 rounded-2xl" />
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-blue-400 to-blue-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative py-5 px-6 flex items-center justify-center gap-3">
              {loading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="w-5 h-5 border-3 border-white border-t-transparent rounded-full"
                  />
                  <span className="text-white text-lg font-bold">Initializing Pipeline...</span>
                </>
              ) : (
                <>
                  <PlayIcon className="w-5 h-5 text-white" />
                  <span className="text-white text-lg font-bold tracking-wide">Run Pipeline</span>
                </>
              )}
            </div>
          </motion.button>

          <div className="flex items-center justify-center gap-8 pt-4 text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span>6 Agents Active</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
              <span>Real-time Processing</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
