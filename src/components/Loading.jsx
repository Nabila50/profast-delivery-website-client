
import React from "react";
import { FiTruck, FiPackage, FiMapPin } from "react-icons/fi";

const Loading = ({
  message = "Your parcel is on its way...",
  fullScreen = true,
}) => {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex items-center justify-center bg-base-100 px-4 ${
        fullScreen ? "min-h-screen" : "min-h-[350px]"
      }`}
    >
      <div className="w-full max-w-sm rounded-3xl border border-base-300 bg-white p-8 text-center shadow-xl">
        {/* Animated package icon */}
        <div className="relative mx-auto mb-6 flex h-24 w-24 items-center justify-center">
          <div className="absolute inset-0 animate-ping rounded-full bg-[#CAEB66]/30" />

          <div className="relative flex h-20 w-20 animate-bounce items-center justify-center rounded-2xl bg-[#CAEB66] shadow-md">
            <FiPackage className="text-4xl text-gray-900" />
          </div>
        </div>

        {/* Application name */}
        <h2 className="text-2xl font-extrabold tracking-tight text-gray-900">
          Zap<span className="text-[#8AAC20]">Shift</span>
        </h2>

        <p className="mt-2 text-sm text-gray-500">
          {message}
        </p>

        {/* Animated delivery route */}
        <div className="relative mx-auto mt-8 flex max-w-[260px] items-center justify-between">
          <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 border-t-2 border-dashed border-gray-300" />

          <div className="relative z-10 flex h-9 w-9 items-center justify-center rounded-full bg-[#CAEB66] text-gray-900">
            <FiPackage size={18} />
          </div>

          <div className="relative z-10 flex h-12 w-12 animate-pulse items-center justify-center rounded-full bg-gray-900 text-[#CAEB66] shadow-md">
            <FiTruck size={25} />
          </div>

          <div className="relative z-10 flex h-9 w-9 items-center justify-center rounded-full bg-gray-200 text-gray-600">
            <FiMapPin size={18} />
          </div>
        </div>

        {/* DaisyUI loading indicator */}
        <div className="mt-7 flex items-center justify-center gap-3">
          <span className="loading loading-spinner loading-sm text-[#8AAC20]" />
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
            Loading
          </span>
        </div>

        <p className="mt-5 text-xs text-gray-400">
          Fast, safe, and reliable delivery.
        </p>
      </div>
    </div>
  );
};

export default Loading;
