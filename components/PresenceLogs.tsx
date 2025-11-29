"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type PresencePayload = {
  name: string;
  joinedAt?: string;
};

const STORAGE_KEY = "golgappa:playerName";

export function PresenceLogs() {
  const [onlineNames, setOnlineNames] = useState<string[]>([]);
  const [status, setStatus] = useState<"idle" | "connecting" | "connected" | "error">(
    "idle"
  );

  useEffect(() => {
    setStatus("connecting");

    const name =
      (typeof window !== "undefined" &&
        window.localStorage.getItem(STORAGE_KEY)) ||
      "Someone";

    const channel = supabase.channel("golgappa-hub", {
      config: {
        presence: {
          key: "player", // arbitrary key; identifies presence entries
        },
      },
    });

    // When presence state syncs, update our online list
    channel.on("presence", { event: "sync" }, () => {
      const state = channel.presenceState() as Record<string, PresencePayload[]>;

      const names = Object.values(state)
        .flat()
        .map((p) => p.name)
        .filter(Boolean);

      setOnlineNames(names);
      setStatus("connected");
    });

    // Subscribe to the channel
    channel.subscribe((event) => {
      if (event === "SUBSCRIBED") {
        channel.track({
          name,
          joinedAt: new Date().toISOString(),
        });
      } else if (event === "CHANNEL_ERROR") {
        console.error("Supabase channel error");
        setStatus("error");
      } else if (event === "TIMED_OUT") {
        console.error("Supabase channel timed out");
        setStatus("error");
      } else if (event === "CLOSED") {
        // optional: mark disconnected
      }
    });


    return () => {
      channel.unsubscribe();
    };
  }, []);

  let logs: string[];

  if (status === "connecting") {
    logs = ["Connecting..."];
  } else if (status === "error") {
    logs = ["Presence error"];
  } else if (onlineNames.length === 0) {
    logs = ["Nobody is online"];
  } else {
    logs = onlineNames.map((n) => `${n} is online`);
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 px-4 py-2 bg-black/80 text-xs text-gray-100 flex gap-4 justify-center items-center">
      {logs.map((log, idx) => (
        <span key={idx} className="font-mono">
          {log}
        </span>
      ))}
    </div>
  );
}
