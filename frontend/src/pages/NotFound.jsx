import { Link } from "react-router-dom";

const NotFound = () => (
  <main className="min-h-screen bg-[#0f1115] text-white flex flex-col items-center justify-center px-6 text-center font-['Montserrat']">
    <p className="text-xs uppercase tracking-[0.4em] text-gray-500">error</p>
    <h1 className="text-6xl sm:text-7xl font-bold mt-3 bg-gradient-to-r from-cyan-400 to-blue-500 text-transparent bg-clip-text">
      404
    </h1>
    <p className="text-lg text-gray-300 mt-4 max-w-lg">
      This page is still in stealth mode. Head back to your dashboard while we build the rest of Thesis.io.
    </p>
    <Link
      to="/"
      className="mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-400 font-semibold shadow-lg shadow-emerald-500/30"
    >
      Go home
    </Link>
  </main>
);

export default NotFound;