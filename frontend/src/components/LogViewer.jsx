import { useEffect, useState } from "react";

export default function LogsViewer({ runId }) {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    if (!runId) return;
    const events = new EventSource(`http://localhost:8000/logs/${runId}`);

    events.onmessage = (event) => {
      setLogs((prev) => [...prev, event.data]);
    };

    return () => events.close();
  }, [runId]);

  return (
    <div className="bg-black text-green-400 p-3 rounded h-80 overflow-auto text-sm">
      {logs.map((line, i) => <div key={i}>{line}</div>)}
    </div>
  );
}
