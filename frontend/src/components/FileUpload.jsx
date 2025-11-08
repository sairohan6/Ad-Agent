import { useState } from "react";
import { uploadFile } from "../api/backend";
import { motion } from "framer-motion";

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
    <div className="space-y-2">
      <label className="text-sm font-medium text-cyan-300 block">{label}</label>

      <motion.div
        whileHover={{ scale: 1.02 }}
        className={`relative backdrop-blur-md bg-white/5 border-2 border-dashed rounded-2xl p-6 cursor-pointer transition-all duration-300 ${
          isDragging
            ? "border-cyan-400 bg-cyan-400/10"
            : "border-white/20 hover:border-cyan-400/40 hover:bg-white/10"
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
          className="absolute inset-0 opacity-0 cursor-pointer z-10"
          onChange={(e) => e.target.files.length && handleFile(e.target.files[0])}
        />

        <div className="flex flex-col items-center text-center pointer-events-none">
          {uploading ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                className="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full"
              />
              <p className="text-cyan-300 text-sm mt-2">Uploading…</p>
            </>
          ) : fileName ? (
            <>
              <p className="text-green-400 font-medium">{fileName}</p>
              <p className="text-xs text-gray-400">Uploaded</p>
            </>
          ) : (
            <>
              <p className="text-gray-300 font-medium">Drop or Click to Upload</p>
              <p className="text-xs text-gray-500">CSV supported</p>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
