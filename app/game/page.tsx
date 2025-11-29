"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  LudoBoard,
  type Piece,
  initialPieces,
} from "@/components/LudoBoard";

const STORAGE_KEY = "golgappa:playerName";

type PresencePayload = {
  name: string;
  joinedAt?: string;
};

type RollEvent = {
  name: string;
  value: number;
  timestamp: string;
};

type GameState = {
  currentTurn: string | null;
  lastRoll: RollEvent | null;
  pieces: Piece[];
};

type Status =
  | "idle"
  | "connecting"
  | "connected"
  | "waiting-opponent"
  | "ready"
  | "error";

export default function GamePage() {
  const [status, setStatus] = useState<Status>("idle");
  const [playerName, setPlayerName] = useState<string>("Someone");
  const [players, setPlayers] = useState<string[]>([]);
  const [gameState, setGameState] = useState<GameState>({
    currentTurn: null,
    lastRoll: null,
    pieces: initialPieces(),
  });
  const [rolling, setRolling] = useState(false);

  // how many steps I still have to spend from my last roll
  const [pendingSteps, setPendingSteps] = useState<number | null>(null);

  // Keep a ref to the channel so we can reuse it in handlers
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // Load name from localStorage once on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setPlayerName(stored);
    }
  }, []);

  useEffect(() => {
    setStatus("connecting");

    const channel = supabase.channel("golgappa-game", {
      config: {
        presence: { key: "player" },
        broadcast: { ack: true },
      },
    });

    channelRef.current = channel;

    // Presence sync: update list of players
    channel.on("presence", { event: "sync" }, () => {
      const state = channel.presenceState() as Record<
        string,
        PresencePayload[]
      >;

      const names = Object.values(state)
        .flat()
        .map((p) => p.name)
        .filter(Boolean);

      setPlayers(names);

      if (names.length < 2) {
        setStatus("waiting-opponent");
      } else {
        setStatus("ready");
      }

      // If both players are here and we don't yet have a turn, pick one deterministically
      setGameState((prev) => {
        if (prev.currentTurn || names.length < 2) return prev;

        // Simple deterministic choice: alphabetically first name starts
        const sorted = [...names].sort();
        const starter = sorted[0] ?? null;

        const newState: GameState = {
          currentTurn: starter,
          lastRoll: prev.lastRoll,
          pieces: prev.pieces,
        };

        // Broadcast initial state so both clients sync up
        channel.send({
          type: "broadcast",
          event: "state",
          payload: newState,
        });

        return newState;
      });
    });

    // Broadcast listener: listen for game state updates
    channel.on("broadcast", { event: "state" }, (payload) => {
      const data = payload.payload as GameState;
      setGameState(data);
      setRolling(false);
      // note: pendingSteps stays local, we don't touch it here
    });

    // Subscribe and track our presence
    channel.subscribe((event) => {
      if (event === "SUBSCRIBED") {
        channel.track<PresencePayload>({
          name: playerName,
          joinedAt: new Date().toISOString(),
        });
        setStatus("connected");
      } else if (event === "CHANNEL_ERROR") {
        console.error("Supabase game channel error");
        setStatus("error");
      } else if (event === "TIMED_OUT") {
        console.error("Supabase game channel timed out");
        setStatus("error");
      }
    });

    return () => {
      channel.unsubscribe();
      channelRef.current = null;
    };
  }, [playerName]);

  const opponentName = useMemo(() => {
    return (
      players.find((n) => n !== playerName) || "Waiting for opponent..."
    );
  }, [players, playerName]);

  const isMyTurn = gameState.currentTurn === playerName;

  // Did *I* roll last?
  const myLastRoll =
    gameState.lastRoll?.name === playerName
      ? gameState.lastRoll.value
      : null;

  const canRoll =
    status === "ready" &&
    players.length >= 2 &&
    isMyTurn &&
    !rolling &&
    pendingSteps == null; // can't roll again until you've used your last roll

  const handleRoll = async () => {
    if (!canRoll || !channelRef.current) return;

    setRolling(true);
    const value = Math.floor(Math.random() * 6) + 1;

    const rollEvent: RollEvent = {
      name: playerName,
      value,
      timestamp: new Date().toISOString(),
    };

    // After rolling, it's still *my* turn until I move a goti
    const newState: GameState = {
      currentTurn: playerName,
      lastRoll: rollEvent,
      pieces: gameState.pieces,
    };

    // This client (the roller) now has steps to spend
    setPendingSteps(value);

    await channelRef.current.send({
      type: "broadcast",
      event: "state",
      payload: newState,
    });

    // Optimistic update
    setGameState(newState);
    setRolling(false);
  };

  const handlePieceClick = async (id: string) => {
    // Only allow move if:
    // - we have pendingSteps
    // - there is a lastRoll
    // - that lastRoll belongs to this player
    if (pendingSteps == null) return;
    if (!gameState.lastRoll) return;
    if (gameState.lastRoll.name !== playerName) return;
    if (!channelRef.current) return;

    const steps = pendingSteps;

    // Consume steps locally so we can’t reuse this roll
    setPendingSteps(null);

    // Apply movement logic to the clicked piece
    const newPieces = gameState.pieces.map((p) => {
      if (p.id !== id) {
        return { ...p, selected: false };
      }

      let newState = p.state;
      let newIndex = p.trackIndex;

      if (steps > 0) {
        if (p.state === "home") {
          // simple rule: leaving home requires a 6
          if (steps === 6) {
            newState = "track";
            newIndex = 0; // first cell on the track
          }
        } else if (p.state === "track") {
          newIndex = Math.min(
            p.trackIndex + steps,
            p.track.length - 1
          );
        }
      }

      return {
        ...p,
        selected: true,
        state: newState,
        trackIndex: newIndex,
      };
    });

    // Next player's turn after you move
    const current = gameState.currentTurn ?? playerName;
    const nextPlayer =
      players.find((n) => n !== current) ?? current;

    const newState: GameState = {
      currentTurn: nextPlayer,
      lastRoll: gameState.lastRoll,
      pieces: newPieces,
    };

    await channelRef.current.send({
      type: "broadcast",
      event: "state",
      payload: newState,
    });

    // Optimistic update
    setGameState(newState);
  };

  let statusText: string;
  if (status === "connecting" || status === "idle") {
    statusText = "Connecting to game room...";
  } else if (status === "waiting-opponent") {
    statusText = "Waiting for the other player to join...";
  } else if (status === "ready") {
    if (gameState.currentTurn) {
      statusText = `It's ${gameState.currentTurn}'s turn`;
    } else {
      statusText = "Both players connected!";
    }
  } else if (status === "error") {
    statusText = "Connection error. Try refreshing the page.";
  } else {
    statusText = "";
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center px-4 text-center">
      <div className="w-full max-w-sm space-y-6">
        <h1 className="text-3xl font-semibold mb-2">Golgappa Game Room</h1>

        <div className="rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-left space-y-1">
          <div>
            <span className="text-gray-400">You: </span>
            <span className="font-semibold">{playerName}</span>
          </div>
          <div>
            <span className="text-gray-400">Opponent: </span>
            <span className="font-semibold">{opponentName}</span>
          </div>
          <div className="text-xs text-gray-400 mt-2">
            Players in room: {players.length}/2
          </div>
          {gameState.currentTurn && (
            <div className="text-xs text-amber-300 mt-1">
              Turn:{" "}
              <span className="font-semibold">
                {gameState.currentTurn}
              </span>
            </div>
          )}
        </div>

        <p className="text-xs text-gray-400">{statusText}</p>

        {/* Ludo board visual */}
        <LudoBoard
          pieces={gameState.pieces}
          lastRoll={myLastRoll}
          onPieceClick={handlePieceClick}
        />

        <button
          onClick={handleRoll}
          disabled={!canRoll}
          className="w-full rounded-full bg-amber-500 text-black font-semibold text-sm py-2.5 shadow-md hover:bg-amber-400 active:scale-95 transition disabled:opacity-40 disabled:hover:scale-100"
        >
          {rolling
            ? "Rolling..."
            : isMyTurn
            ? pendingSteps != null
              ? "Move your goti"
              : "Roll Dice"
            : "Wait for your turn"}
        </button>

        {gameState.lastRoll && (
          <div className="mt-4 text-sm text-gray-200">
            <p className="mb-1">
              <span className="font-semibold">
                {gameState.lastRoll.name}
              </span>{" "}
              rolled a{" "}
              <span className="font-bold text-2xl align-middle">
                {gameState.lastRoll.value}
              </span>
            </p>
            <p className="text-[11px] text-gray-500">
              {new Date(
                gameState.lastRoll.timestamp
              ).toLocaleTimeString()}
            </p>
          </div>
        )}

        <p className="text-[11px] text-gray-500 mt-6">
          Board is now synced between players. Roll the dice, then click a goti
          to move it – both boards should show the same positions.
        </p>
      </div>
    </main>
  );
}
