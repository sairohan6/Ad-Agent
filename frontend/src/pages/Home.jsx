import { useState } from "react";
import { motion } from "framer-motion";
import FileUpload from "../components/FileUpload";
import { runPipeline } from "../api/backend";

export default function Home({ setJobId, trainPath, testPath }) {
  const [cmd, setCmd] = useState("");
  const [loading, setLoading] = useState(false);

  const start = async () => {
    setLoading(true);
    const id = await runPipeline(cmd, trainPath.current, testPath.current);
    setJobId(id);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0c1f] via-[#0d0f23] to-[#1b1f3b] flex justify-center items-center p-6 relative overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative w-full max-w-4xl backdrop-blur-2xl bg-white/10 border border-white/20 rounded-3xl p-10 shadow-2xl space-y-8"
      >
        <div className="text-center space-y-3">
          <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500">
            AD-Agent
          </h1>
          <p className="text-gray-400">AI-Powered Anomaly Detection Pipeline Builder</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FileUpload label="Training Dataset" onUploaded={(p) => (trainPath.current = p)} />
          <FileUpload label="Testing Dataset" onUploaded={(p) => (testPath.current = p)} />
        </div>

        <textarea
          className="w-full bg-white/10 border border-white/20 rounded-2xl p-4 text-sm text-white placeholder-gray-500 focus:ring-2 focus:ring-cyan-400 resize-none"
          placeholder="Example: Run IForest with contamination=0.1"
          value={cmd}
          onChange={(e) => setCmd(e.target.value)}
        />

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={loading}
          onClick={start}
          className="w-full py-4 bg-gradient-to-r from-cyan-500 via-blue-500 to-blue-600 text-white text-lg font-bold rounded-2xl shadow-lg disabled:opacity-50"
        >
          {loading ? "Processing..." : "Run Pipeline 🚀"}
        </motion.button>
      </motion.div>
    </div>
  );
}
