import { useState } from "react";
import { uploadFile } from "../api/backend";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpTrayIcon, CheckCircleIcon, DocumentTextIcon } from "@heroicons/react/24/outline";

export default function FileUpload({ label, onUploaded }) {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file) => {
    if (!file) return;
    setUploading(true);
    setFileName(file.name);
    const path = await uploadFile(file);
    onUploaded(path);
    setUploading(false);
  };

  return (
    <div className="space-y-3">
      <label className="text-sm font-semibold text-black-200 tracking-wide block">
        {label}
      </label>

      <motion.div
        whileHover={{ scale: 1.01, y: -2 }}
        whileTap={{ scale: 0.99 }}
        className={`relative backdrop-blur-xl border-2 border-dashed rounded-3xl p-8 cursor-pointer transition-all duration-500 group ${
          isDragging
            ? "border-cyan-400 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 shadow-2xl shadow-cyan-500/30"
            : fileName
            ? "border-green-400/50 bg-gradient-to-br from-green-500/10 to-emerald-500/10 shadow-xl shadow-green-500/20"
            : "border-white/10 bg-white/5 hover:border-cyan-400/60 hover:bg-gradient-to-br hover:from-cyan-500/10 hover:to-blue-500/10 hover:shadow-xl hover:shadow-cyan-500/20"
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]);
        }}
      >
        <input
          type="file"
          accept=".csv,.mat,.pt,.npy"
          className="absolute inset-0 opacity-0 cursor-pointer z-10"
          onChange={(e) => e.target.files.length && handleFile(e.target.files[0])}
        />

        <div className="flex flex-col items-center text-center pointer-events-none relative z-0">
          <AnimatePresence mode="wait">
            {uploading ? (
              <motion.div
                key="uploading"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex flex-col items-center"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full mb-3"
                />
                <p className="text-cyan-300 text-sm font-medium">Uploading file...</p>
                <p className="text-gray-400 text-xs mt-1">Please wait</p>
              </motion.div>
            ) : fileName ? (
              <motion.div
                key="uploaded"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex flex-col items-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                >
                  <CheckCircleIcon className="w-12 h-12 text-green-400 mb-3" />
                </motion.div>
                <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
                  <DocumentTextIcon className="w-4 h-4 text-green-400" />
                  <p className="text-green-300 font-medium text-sm truncate max-w-[200px]">{fileName}</p>
                </div>
                <p className="text-gray-400 text-xs mt-2">Ready to process</p>
              </motion.div>
            ) : (
              <motion.div
                key="idle"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex flex-col items-center"
              >
                <motion.div
                  animate={isDragging ? { y: [0, -10, 0] } : {}}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  <ArrowUpTrayIcon className="w-12 h-12 text-black-400 group-hover:text-cyan-400 transition-colors mb-3" />
                </motion.div>
                <p className="text-black-200 font-semibold text-base mb-1">
                  {isDragging ? "Drop your file here" : "Drag & drop or click to upload"}
                </p>
                <p className="text-black-500 text-xs">Supports CSV, MAT, PT, NPY files</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {isDragging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-3xl pointer-events-none"
          />
        )}
      </motion.div>
    </div>
  );
}
