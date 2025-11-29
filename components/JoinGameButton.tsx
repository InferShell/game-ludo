"use client";

import React from "react";
import { useRouter } from "next/navigation";

export function JoinGameButton() {
  const router = useRouter();

  const handleClick = () => {
    router.push("/game");
  };

  return (
    <button
      onClick={handleClick}
      className="px-6 py-3 rounded-full bg-amber-500 text-black font-semibold text-sm shadow-md hover:bg-amber-400 active:scale-95 transition"
    >
      Join Game
    </button>
  );
}
