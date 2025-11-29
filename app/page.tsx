"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const STORAGE_KEY = "golgappa:playerName";

export default function EntryPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [touched, setTouched] = useState(false);

  // Pre-fill if we've already stored a name earlier
  useEffect(() => {
    if (typeof window === "undefined") return;
    const existing = window.localStorage.getItem(STORAGE_KEY);
    if (existing) {
      setName(existing);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setTouched(true);
      return;
    }

    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, trimmed);
    }

    router.push("/hub");
  };

  const showError = touched && name.trim().length === 0;

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-950 to-black text-white flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-xs space-y-6">
        <h1 className="text-3xl font-bold text-center mb-2">Golgappa Hub</h1>
        <p className="text-sm text-gray-300 text-center mb-4">
          Who&apos;s playing? Enter your name so we can keep track of matches.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label
              htmlFor="name"
              className="block text-xs font-medium text-gray-300"
            >
              Your name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (!touched) setTouched(true);
              }}
              className="w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder="e.g. Aditya or Golu"
              autoComplete="off"
            />
            {showError && (
              <p className="text-xs text-red-400 mt-1">
                Please enter a name to continue.
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full rounded-full bg-amber-500 text-black font-semibold text-sm py-2.5 shadow-md hover:bg-amber-400 active:scale-95 transition"
          >
            Continue
          </button>
        </form>

        {name && (
          <p className="text-[11px] text-gray-400 text-center">
            You&apos;ll join as <span className="font-semibold">{name}</span>.
          </p>
        )}
      </div>
    </main>
  );
}
