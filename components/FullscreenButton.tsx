"use client";

import React from "react";

export function FullscreenButton() {
  const toggleFullscreen = () => {
    if (typeof document === "undefined") return;

    const elem = document.documentElement;

    if (!document.fullscreenElement) {
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  return (
    <button
      onClick={toggleFullscreen}
      className="inline-flex items-center justify-center rounded-full border border-white/20 bg-black/40 px-3 py-2 text-xs text-white shadow-sm backdrop-blur hover:bg-black/70 active:scale-95 transition"
      aria-label="Toggle fullscreen"
    >
      {/* Simple fullscreen icon */}
      <span className="text-lg leading-none">⛶</span>
    </button>
  );
}
