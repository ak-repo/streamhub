import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="h-screen flex flex-col items-center justify-center bg-slate-100 px-4">
      <h1 className="text-7xl font-bold text-slate-900">404</h1>

      <p className="text-xl text-gray-600 mt-4">
        Oops! The page you are looking for doesn’t exist.
      </p>

      {/* Animated emoji */}
      <div className="text-6xl mt-6 animate-bounce">🧐</div>

      <Link
        to="/hub/home"
        className="mt-8 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition"
      >
        Go Back Home
      </Link>
    </div>
  );
}
