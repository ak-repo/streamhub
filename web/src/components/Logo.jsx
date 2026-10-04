import { useNavigate } from "react-router-dom";

function Logo() {
  const navigate = useNavigate();
  return (
    <div
      className="flex items-center space-x-3"
      onClick={() => navigate("/home")}
    >
      {/* Cloud Icon Container */}
      <div className="relative">
        <div className="w-12 h-12 bg-gradient-to-br from-sky-400 to-blue-500 rounded-2xl flex items-center justify-center shadow-xl">
          {/* Cloud with multiple layers */}
          <div className="relative">
            <div className="w-6 h-4 bg-white rounded-full"></div>
            <div className="absolute -top-1 -left-1 w-4 h-3 bg-white rounded-full opacity-90"></div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full opacity-80"></div>
          </div>
        </div>
        {/* Floating dots */}
        <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-300 rounded-full animate-bounce"></div>
        <div className="absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-blue-200 rounded-full animate-bounce delay-75"></div>
      </div>

      {/* Text */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-baseline">
          <span className="bg-gradient-to-r from-blue-100 to-sky-200 bg-clip-text text-transparent">
            Stream
          </span>
          <span className="ml-1.5 px-2 py-1 bg-white/20 backdrop-blur-sm text-white rounded-lg text-sm font-bold border border-white/30">
            HUB
          </span>
        </h1>
        <p className="text-xs text-blue-300 font-medium mt-0.5">
          File & Collaboration
        </p>
      </div>
    </div>
  );
}

export default Logo;

// // second
// function Logo() {
//   return (
//     <div className="flex items-center space-x-3 group cursor-pointer">
//       {/* Animated Cloud Container */}
//       <div className="relative">
//         <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-blue-500/25 transition-all duration-300 group-hover:scale-110">
//           {/* Cloud SVG with animation */}
//           <svg
//             className="w-5 h-5 text-white group-hover:scale-110 transition-transform duration-300"
//             fill="currentColor"
//             viewBox="0 0 24 24"
//           >
//             <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z"/>
//           </svg>
//         </div>
//         {/* Floating animation */}
//         <div className="absolute inset-0 bg-cyan-300 rounded-xl blur-md opacity-0 group-hover:opacity-40 transition-opacity duration-300 animate-pulse"></div>
//       </div>

//       {/* Text with hover effects */}
//       <div className="flex flex-col">
//         <h1 className="text-2xl font-bold text-white flex items-baseline">
//           <span className="bg-gradient-to-r from-blue-50 to-cyan-100 bg-clip-text text-transparent group-hover:from-white group-hover:to-cyan-200 transition-all duration-300">
//             Stream
//           </span>
//           <span className="ml-1.5 px-2 py-1 bg-gradient-to-br from-blue-600 to-cyan-500 text-white rounded-lg text-sm font-bold shadow-inner group-hover:from-cyan-500 group-hover:to-blue-600 transition-all duration-300">
//             HUB
//           </span>
//         </h1>
//         <div className="flex items-center space-x-1 mt-0.5">
//           <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full group-hover:bg-cyan-300 transition-colors duration-300"></div>
//           <span className="text-xs text-cyan-300 group-hover:text-cyan-200 font-medium transition-colors duration-300">
//             Cloud Storage
//           </span>
//         </div>
//       </div>
//     </div>
//   );
// }
