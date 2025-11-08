import { useState, useRef } from "react";
import Home from "./pages/Home";
import Console from "./pages/Console";
import Results from "./pages/Results";

export default function App() {
  const [page, setPage] = useState("home");
  const [jobId, setJobId] = useState(null);
  const [logs, setLogs] = useState("");
  const [results, setResults] = useState(null);

  const trainPath = useRef(null);
  const testPath = useRef(null);

  if (page === "home")
    return <Home setJobId={(id)=>{ setJobId(id); setPage("console"); }} trainPath={trainPath} testPath={testPath} />;

  if (page === "console")
    return <Console jobId={jobId} logs={logs} setLogs={setLogs} setResults={setResults} setPage={setPage} />;

if (page === "results")
  return <Results jobId={jobId} results={results} />;


  return null;
}
