export default function Navbar() {
  return (
    <header className="w-full py-4 px-8 backdrop-blur-xl bg-white/5 border-b border-white/10">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight text-white">
          AD-Agent
        </h1>

        <nav className="flex gap-6 text-gray-300 text-sm">
          <a href="/" className="hover:text-cyan-400 transition">Home</a>
          <a href="/console" className="hover:text-cyan-400 transition">Console</a>
          <a href="/results" className="hover:text-cyan-400 transition">Results</a>
        </nav>
      </div>
    </header>
  );
}
