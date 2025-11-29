import { FullscreenButton } from "@/components/FullscreenButton";
import { JoinGameButton } from "@/components/JoinGameButton";
import { PresenceLogs } from "@/components/PresenceLogs";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-950 to-black text-white flex flex-col">
      {/* Top bar */}
      <header className="flex items-center justify-between px-4 py-3">
        <div className="text-sm font-light tracking-wide text-gray-300">
          Golgappa Hub
        </div>
        <FullscreenButton />
      </header>

      {/* Center content */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 text-center">
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          Golgappa Hub
        </h1>
        <p className="text-sm text-gray-300 mb-8 max-w-xs">
          A tiny corner of the internet just for us. Join a game and let&apos;s
          roll.
        </p>
        <JoinGameButton />
      </section>

      {/* Presence logs at the bottom */}
      <PresenceLogs />
    </main>
  );
}
