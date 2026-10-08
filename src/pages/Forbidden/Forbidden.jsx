
// import { useNavigate } from "react-router-dom";

import { useNavigate } from "react-router";

const Forbidden = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 px-4">
      <div className="w-full max-w-lg text-center">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 rounded-full bg-error/10 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-12 h-12 text-error"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M18.364 18.364A9 9 0 105.636 5.636a9 9 0 0012.728 12.728z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 9l6 6m0-6l-6 6"
              />
            </svg>
          </div>
        </div>

        {/* 403 */}
        <h1 className="text-7xl sm:text-8xl font-bold text-[#CAEB66]">
          403
        </h1>

        {/* Title */}
        <h2 className="mt-4 text-2xl sm:text-3xl font-bold text-base-content">
          Access Forbidden
        </h2>

        {/* Description */}
        <p className="mt-4 text-base sm:text-lg text-base-content/70 leading-relaxed">
          Sorry, you don't have permission to access this page.
          Please contact an administrator if you believe this is a mistake.
        </p>

        {/* Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
          <button
            onClick={() => navigate("/")}
            className="btn bg-[#CAEB66] hover:bg-[#b9db55] text-black border-none"
          >
            Go Home
          </button>
        </div>

        {/* Error code */}
        <p className="mt-8 text-sm text-base-content/50">
          Error code: 403 — Forbidden
        </p>
      </div>
    </div>
  );
};

export default Forbidden;

