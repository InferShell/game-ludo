"use client";

import React from "react";

export type GotiColor = "green" | "yellow" | "blue" | "red";

const COLOR_TO_CLASS: Record<GotiColor, string> = {
  green: "bg-emerald-300",
  yellow: "bg-amber-200",
  blue: "bg-sky-300",
  red: "bg-rose-300",
};

type GotiProps = {
  color: GotiColor;
  selected?: boolean;
  onClick?: () => void;
};

export function Goti({ color, selected, onClick }: GotiProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full h-full flex items-center justify-center focus:outline-none"
    >
      <div
        className={`w-[70%] h-[70%] rounded-full shadow-lg border border-black/40
        ${COLOR_TO_CLASS[color]}
        ${selected ? "ring-2 ring-offset-2 ring-offset-slate-900 ring-white" : ""}`}
      />
    </button>
  );
}
