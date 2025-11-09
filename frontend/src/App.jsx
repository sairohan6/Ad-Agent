import { useState, useRef, useEffect } from "react";
import Home from "./pages/Home";
import Console from "./pages/Console";
import Results from "./pages/Results";
import Login from "./pages/Login";

export default function App() {
  const [page, setPage] = useState("home");
  const [jobId, setJobId] = useState(null);
  const [logs, setLogs] = useState("");
  const [results, setResults] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const trainPath = useRef(null);
  const testPath = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsAuthenticated(false);
    setPage("home");
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} setPage={setPage} />;
  }

  if (page === "home")
    return <Home setJobId={(id)=>{ setJobId(id); setPage("console"); }} trainPath={trainPath} testPath={testPath} onLogout={handleLogout} />;

  if (page === "console")
    return <Console jobId={jobId} logs={logs} setLogs={setLogs} setResults={setResults} setPage={setPage} />;

  if (page === "results")
    return <Results jobId={jobId} results={results} />;

  return null;
}
