// "use client";

// import React from "react";
// import { Goti, GotiColor } from "./Goti";

// export function LudoBoard({ lastRoll }: { lastRoll: number | null }) {
//   const size = 15; // 15x15 grid like classic boards
//   const rows = Array.from({ length: size }, (_, r) => r);
//   const cols = Array.from({ length: size }, (_, c) => c);

//   // --------------------------------------------------
//   // PIECE STATE
//   // --------------------------------------------------

//   const [pieces, setPieces] = React.useState<Piece[]>(() =>
//     initialPieces()
//   );

//   React.useEffect(() => {
//     if (lastRoll == null) return;

//     setPieces((prev) => {
//       // if nothing is selected, don't move anything
//       const hasSelected = prev.some((p) => p.selected);
//       if (!hasSelected) return prev;

//       return prev.map((p) =>
//         p.selected
//           ? {
//               ...p,
//               trackIndex: Math.min(
//                 p.trackIndex + lastRoll,
//                 p.track.length - 1
//               ),
//             }
//           : p
//       );
//     });
//   }, [lastRoll]);


//   // Select / unselect a single piece by id
//   const handlePieceClick = (id: string) => {
//     setPieces((prev) =>
//       prev.map((p) =>
//         p.id === id
//           ? { ...p, selected: !p.selected } // toggle clicked one
//           : { ...p, selected: false } // unselect all others
//       )
//     );
//   };

//   // Demo: move ONLY the selected piece one step along its track
//   const handleMoveAll = () => {
//     setPieces((prev) =>
//       prev.map((p) =>
//         p.selected
//           ? { ...p, trackIndex: (p.trackIndex + 1) % p.track.length }
//           : p
//       )
//     );
//   };

//   return (
//     <div className="w-full max-w-sm mx-auto">
//       <div className="relative aspect-square rounded-2xl border border-white/15 bg-slate-950 overflow-hidden shadow-lg">
//         {/* Base grid */}
//         <div
//           className="grid w-full h-full"
//           style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}
//         >
//           {rows.map((r) =>
//             cols.map((c) => <BoardCell key={`${r}-${c}`} r={r} c={c} />)
//           )}
//         </div>

//         {/* Moving goti layer */}
//         <PiecesLayer pieces={pieces} onPieceClick={handlePieceClick} />

//         {/* Corner home boxes + starting pieces (overlay) */}
//         <HomeOverlay
//           position="top-left"
//           boxColor="bg-emerald-700/90"
//           pieceColor="bg-emerald-200"
//         />
//         <HomeOverlay
//           position="top-right"
//           boxColor="bg-amber-600/90"
//           pieceColor="bg-amber-100"
//         />
//         <HomeOverlay
//           position="bottom-left"
//           boxColor="bg-sky-700/90"
//           pieceColor="bg-sky-200"
//         />
//         <HomeOverlay
//           position="bottom-right"
//           boxColor="bg-rose-700/90"
//           pieceColor="bg-rose-200"
//         />
//       </div>

//       <p className="mt-2 text-[11px] text-gray-500 text-center">
//         Dark-themed Ludo board with four homes, a 3-cell-wide cross-shaped
//         track, colored home stretches to the center, and marked safe cells.
//         Click a goti to select it, then move the selected goti with the demo
//         button.
//       </p>

//       <div className="mt-3 flex justify-center">
//         <button
//           onClick={handleMoveAll}
//           className="px-3 py-1 text-xs rounded-full bg-slate-800 text-slate-100 border border-slate-600 hover:bg-slate-700 transition"
//         >
//           Move selected piece (demo)
//         </button>
//       </div>
//     </div>
//   );
// }

// // --------------------------------------------------
// // Board cell + styling
// // --------------------------------------------------

// const MID = 7; // center index (0..14)
// const HOME_SIZE = 6;

// // Safe cells (your current positions)
// const SAFE_CELLS: Array<{ r: number; c: number }> = [
//   { r: 6, c: 1 },
//   { r: 8, c: 2 },

//   { r: 1, c: 8 },
//   { r: 2, c: 6 },

//   { r: 8, c: 13 },
//   { r: 6, c: 12 },

//   { r: 13, c: 6 },
//   { r: 12, c: 8 },
// ];

// // force specific colors on specific cells
// const SPECIAL_CELL_COLORS: Record<string, string> = {
//   "6-1": "bg-emerald-600", // green
//   "1-8": "bg-amber-600", // yellow/orange
//   "13-6": "bg-sky-600", // blue
//   "8-13": "bg-rose-600", // red
// };

// function isSafeCell(r: number, c: number): boolean {
//   return SAFE_CELLS.some((cell) => cell.r === r && cell.c === c);
// }

// function BoardCell({ r, c }: { r: number; c: number }) {
//   const baseClass = getCellClass(r, c);
//   const safe = isSafeCell(r, c);

//   return (
//     <div className={`relative border border-slate-800 ${baseClass}`}>
//       {safe && (
//         <>
//           {/* subtle overlay so safe cells feel special
//               without killing the path color */}
//           <div className="absolute inset-0 bg-black/10 pointer-events-none" />
//           <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
//             <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-slate-900/90 border border-slate-200/60 flex items-center justify-center text-[9px] text-slate-200">
//               ★
//             </div>
//           </div>
//         </>
//       )}
//     </div>
//   );
// }

// // 0-based indices: 0..14 for both row and col
// function getCellClass(r: number, c: number): string {
//   // --- Homes (4 big colored areas, 6x6 each) ---
//   const inGreenHome = r < HOME_SIZE && c < HOME_SIZE; // top-left
//   const inYellowHome = r < HOME_SIZE && c >= 15 - HOME_SIZE; // top-right
//   const inBlueHome = r >= 15 - HOME_SIZE && c < HOME_SIZE; // bottom-left
//   const inRedHome = r >= 15 - HOME_SIZE && c >= 15 - HOME_SIZE; // bottom-right

//   if (inGreenHome) return "bg-emerald-950";
//   if (inYellowHome) return "bg-amber-950";
//   if (inBlueHome) return "bg-sky-950";
//   if (inRedHome) return "bg-rose-950";

//   // Base background for non-track cells
//   let cls = "bg-slate-900";

//   // --- Main cross-shaped track (3 cells wide) ---
//   const inVerticalArm = c >= MID - 1 && c <= MID + 1;
//   const inHorizontalArm = r >= MID - 1 && r <= MID + 1;
//   const inCross = inVerticalArm || inHorizontalArm;

//   if (inCross) {
//     cls = "bg-slate-800";
//   }

//   // --- Center 3x3 goal pattern ---
//   const inCenterSquare =
//     r >= MID - 1 && r <= MID + 1 && c >= MID - 1 && c <= MID + 1;

//   if (inCenterSquare) {
//     cls = "bg-slate-800";
//   }

//   // Colored wedges at the four corners of the 3×3 center
//   const inCenterCorner =
//     (r === MID - 1 || r === MID + 1) && (c === MID - 1 || c === MID + 1);

//   if (inCenterCorner) {
//     if (r === MID - 1 && c === MID - 1) cls = "bg-emerald-700"; // top-left
//     if (r === MID - 1 && c === MID + 1) cls = "bg-amber-700"; // top-right
//     if (r === MID + 1 && c === MID - 1) cls = "bg-sky-700"; // bottom-left
//     if (r === MID + 1 && c === MID + 1) cls = "bg-rose-700"; // bottom-right
//   }

//   // exact center tile
//   if (r === MID && c === MID) {
//     cls = "bg-slate-900";
//   }

//   // --- Colored home stretches (towards center) ---
//   // each color gets 5 tiles leading to the center

//   // Green: top → center (column MID, rows 1..5)
//   if (c === MID && r >= 1 && r <= 5) {
//     cls = "bg-amber-600";
//   }

//   // Red: bottom → center (column MID, rows 9..13)
//   if (c === MID && r >= 9 && r <= 13) {
//     cls = "bg-sky-600";
//   }

//   // Blue: left → center (row MID, cols 1..5)
//   if (r === MID && c >= 1 && c <= 5) {
//     cls = "bg-emerald-600";
//   }

//   // Yellow: right → center (row MID, cols 9..13)
//   if (r === MID && c >= 9 && c <= 13) {
//     cls = "bg-rose-600";
//   }

//   const key = `${r}-${c}`;
//   if (SPECIAL_CELL_COLORS[key]) {
//     cls = SPECIAL_CELL_COLORS[key];
//   }

//   return cls;
// }

// // --------------------------------------------------
// // GOTI / PIECES
// // --------------------------------------------------

// type Color = GotiColor;

// type Coord = { r: number; c: number };

// type Piece = {
//   id: string;
//   color: Color;
//   trackIndex: number; // current index in its track
//   track: Coord[]; // path this piece follows
//   selected?: boolean;
// };

// // simple demo tracks – you can replace these with your real full paths
// const TRACK_GREEN: Coord[] = [
//   { r: 6, c: 1 },
//   { r: 6, c: 2 },
//   { r: 6, c: 3 },
//   { r: 6, c: 4 },
//   { r: 6, c: 5 },
//   { r: 6, c: 6 },
//   { r: 6, c: 7 },
//   { r: 5, c: 7 },
//   { r: 4, c: 7 },
//   { r: 3, c: 7 },
//   { r: 2, c: 7 },
//   { r: 1, c: 7 },
// ];

// const TRACK_YELLOW: Coord[] = TRACK_GREEN.map(({ r, c }) => ({
//   r: c,
//   c: 14 - r,
// }));

// const TRACK_RED: Coord[] = TRACK_GREEN.map(({ r, c }) => ({
//   r: 14 - r,
//   c: 14 - c,
// }));

// const TRACK_BLUE: Coord[] = TRACK_GREEN.map(({ r, c }) => ({
//   r: 14 - c,
//   c: r,
// }));

// function initialPieces(): Piece[] {
//   return [
//     { id: "g1", color: "green", trackIndex: 0, track: TRACK_GREEN },
//     { id: "y1", color: "yellow", trackIndex: 0, track: TRACK_YELLOW },
//     { id: "r1", color: "red", trackIndex: 0, track: TRACK_RED },
//     { id: "b1", color: "blue", trackIndex: 0, track: TRACK_BLUE },
//   ];
// }

// function PiecesLayer({
//   pieces,

//   onPieceClick,
// }: {
//   pieces: Piece[];
//   onPieceClick: (id: string) => void;
// }) {
//   const cellPercent = 100 / 15;

//   return (
//     <div className="absolute inset-0">
//       {pieces.map((p) => {
//         const { r, c } = p.track[p.trackIndex];
//         const top = r * cellPercent;
//         const left = c * cellPercent;

//         return (
//           <div
//             key={p.id}
//             className="absolute transition-all duration-200 ease-linear"
//             style={{
//               top: `${top}%`,
//               left: `${left}%`,
//               width: `${cellPercent}%`,
//               height: `${cellPercent}%`,
//             }}
//           >
//             <Goti
//               color={p.color}
//               selected={p.selected}
//               // we'll define onClick prop in Goti.tsx
//               onClick={() => onPieceClick(p.id)}
//             />
//           </div>
//         );
//       })}
//     </div>
//   );
// }

// // --------------------------------------------------
// // Home overlays (smaller boxes + 4 goti)
// // --------------------------------------------------

// type HomeOverlayProps = {
//   position: "top-left" | "top-right" | "bottom-left" | "bottom-right";
//   boxColor: string;
//   pieceColor: string;
// };

// /**
//  * Smaller home box + 4 goti circles, aligned with the 6x6 home regions.
//  */
// function HomeOverlay({ position, boxColor, pieceColor }: HomeOverlayProps) {
//   // 6 cells out of 15 ≈ 40% of the board
//   const common =
//     "absolute w-[40%] h-[40%] flex items-center justify-center pointer-events-none";

//   let posClass = "";
//   if (position === "top-left") posClass = "top-0 left-0";
//   if (position === "top-right") posClass = "top-0 right-0";
//   if (position === "bottom-left") posClass = "bottom-0 left-0";
//   if (position === "bottom-right") posClass = "bottom-0 right-0";

//   return (
//     <div className={`${common} ${posClass}`}>
//       <div
//         className={`w-[86%] h-[86%] rounded-2xl ${boxColor} flex flex-col items-center justify-center`}
//       >
//         <div className="grid grid-cols-2 grid-rows-2 gap-2">
//           {Array.from({ length: 4 }).map((_, i) => (
//             <div
//               key={i}
//               className={`w-5 h-5 md:w-6 md:h-6 rounded-full ${pieceColor} shadow-md border border-black/40`}
//             />
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }


"use client";

import React from "react";
import { Goti, GotiColor } from "./Goti";

export type Coord = { r: number; c: number };
export type PieceState = "home" | "track";
export type Color = GotiColor;

export type Piece = {
  id: string; // e.g. g1, g2, r3, b4
  color: Color;
  state: PieceState;
  home: Coord; // where it sits inside the colored home box
  trackIndex: number; // current index in its track (used when state === "track")
  track: Coord[]; // path this piece follows
  selected?: boolean;
};

type LudoBoardProps = {
  pieces: Piece[];
  lastRoll: number | null; // not used yet, but handy for future highlights
  onPieceClick: (id: string) => void;
};

export function LudoBoard({ pieces, lastRoll, onPieceClick }: LudoBoardProps) {
  const size = 15; // 15x15 grid like classic boards
  const rows = Array.from({ length: size }, (_, r) => r);
  const cols = Array.from({ length: size }, (_, c) => c);

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="relative aspect-square rounded-2xl border border-white/15 bg-slate-950 overflow-hidden shadow-lg">
        {/* Base grid */}
        <div
          className="grid w-full h-full"
          style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}
        >
          {rows.map((r) =>
            cols.map((c) => <BoardCell key={`${r}-${c}`} r={r} c={c} />)
          )}
        </div>

        {/* Moving goti layer */}
        <PiecesLayer pieces={pieces} onPieceClick={onPieceClick} />

        {/* Corner home boxes + starting pieces (overlay) */}
        <HomeOverlay
          position="top-left"
          boxColor="bg-emerald-700/90"
          pieceColor="bg-emerald-200"
        />
        <HomeOverlay
          position="top-right"
          boxColor="bg-amber-600/90"
          pieceColor="bg-amber-100"
        />
        <HomeOverlay
          position="bottom-left"
          boxColor="bg-sky-700/90"
          pieceColor="bg-sky-200"
        />
        <HomeOverlay
          position="bottom-right"
          boxColor="bg-rose-700/90"
          pieceColor="bg-rose-200"
        />
      </div>

      <p className="mt-2 text-[11px] text-gray-500 text-center">
        Dark-themed Ludo board with four homes, a 3-cell-wide cross-shaped
        track, colored home stretches to the center, and marked safe cells.
        Roll the dice, then click a goti to move it by that many cells.
      </p>
    </div>
  );
}

// --------------------------------------------------
// Board cell + styling
// --------------------------------------------------

const MID = 7; // center index (0..14)
const HOME_SIZE = 6;

// Safe cells (your current positions)
const SAFE_CELLS: Array<{ r: number; c: number }> = [
  { r: 6, c: 1 },
  { r: 8, c: 2 },

  { r: 1, c: 8 },
  { r: 2, c: 6 },

  { r: 8, c: 13 },
  { r: 6, c: 12 },

  { r: 13, c: 6 },
  { r: 12, c: 8 },
];

// force specific colors on specific cells
const SPECIAL_CELL_COLORS: Record<string, string> = {
  "6-1": "bg-emerald-600", // green
  "1-8": "bg-amber-600", // yellow/orange
  "13-6": "bg-sky-600", // blue
  "8-13": "bg-rose-600", // red
};

function isSafeCell(r: number, c: number): boolean {
  return SAFE_CELLS.some((cell) => cell.r === r && cell.c === c);
}

function BoardCell({ r, c }: { r: number; c: number }) {
  const baseClass = getCellClass(r, c);
  const safe = isSafeCell(r, c);

  return (
    <div className={`relative border border-slate-800 ${baseClass}`}>
      {safe && (
        <>
          {/* subtle overlay so safe cells feel special
              without killing the path color */}
          <div className="absolute inset-0 bg-black/10 pointer-events-none" />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-slate-900/90 border border-slate-200/60 flex items-center justify-center text-[9px] text-slate-200">
              ★
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// 0-based indices: 0..14 for both row and col
function getCellClass(r: number, c: number): string {
  // --- Homes (4 big colored areas, 6x6 each) ---
  const inGreenHome = r < HOME_SIZE && c < HOME_SIZE; // top-left
  const inYellowHome = r < HOME_SIZE && c >= 15 - HOME_SIZE; // top-right
  const inBlueHome = r >= 15 - HOME_SIZE && c < HOME_SIZE; // bottom-left
  const inRedHome = r >= 15 - HOME_SIZE && c >= 15 - HOME_SIZE; // bottom-right

  if (inGreenHome) return "bg-emerald-950";
  if (inYellowHome) return "bg-amber-950";
  if (inBlueHome) return "bg-sky-950";
  if (inRedHome) return "bg-rose-950";

  // Base background for non-track cells
  let cls = "bg-slate-900";

  // --- Main cross-shaped track (3 cells wide) ---
  const inVerticalArm = c >= MID - 1 && c <= MID + 1;
  const inHorizontalArm = r >= MID - 1 && r <= MID + 1;
  const inCross = inVerticalArm || inHorizontalArm;

  if (inCross) {
    cls = "bg-slate-800";
  }

  // --- Center 3x3 goal pattern ---
  const inCenterSquare =
    r >= MID - 1 && r <= MID + 1 && c >= MID - 1 && c <= MID + 1;

  if (inCenterSquare) {
    cls = "bg-slate-800";
  }

  // Colored wedges at the four corners of the 3×3 center
  const inCenterCorner =
    (r === MID - 1 || r === MID + 1) && (c === MID - 1 || c === MID + 1);

  if (inCenterCorner) {
    if (r === MID - 1 && c === MID - 1) cls = "bg-emerald-700"; // top-left
    if (r === MID - 1 && c === MID + 1) cls = "bg-amber-700"; // top-right
    if (r === MID + 1 && c === MID - 1) cls = "bg-sky-700"; // bottom-left
    if (r === MID + 1 && c === MID + 1) cls = "bg-rose-700"; // bottom-right
  }

  // exact center tile
  if (r === MID && c === MID) {
    cls = "bg-slate-900";
  }

  // --- Colored home stretches (towards center) ---
  // each color gets 5 tiles leading to the center

  // Green: top → center (column MID, rows 1..5)
  if (c === MID && r >= 1 && r <= 5) {
    cls = "bg-amber-600";
  }

  // Red: bottom → center (column MID, rows 9..13)
  if (c === MID && r >= 9 && r <= 13) {
    cls = "bg-sky-600";
  }

  // Blue: left → center (row MID, cols 1..5)
  if (r === MID && c >= 1 && c <= 5) {
    cls = "bg-emerald-600";
  }

  // Yellow: right → center (row MID, cols 9..13)
  if (r === MID && c >= 9 && c <= 13) {
    cls = "bg-rose-600";
  }

  const key = `${r}-${c}`;
  if (SPECIAL_CELL_COLORS[key]) {
    cls = SPECIAL_CELL_COLORS[key];
  }

  return cls;
}

// --------------------------------------------------
// GOTI / PIECES
// --------------------------------------------------

// simple demo tracks – you can replace these with your real full paths
const TRACK_GREEN: Coord[] = [
  { r: 6, c: 1 },
  { r: 6, c: 2 },
  { r: 6, c: 3 },
  { r: 6, c: 4 },
  { r: 6, c: 5 },
  { r: 6, c: 6 },
  { r: 6, c: 7 },
  { r: 5, c: 7 },
  { r: 4, c: 7 },
  { r: 3, c: 7 },
  { r: 2, c: 7 },
  { r: 1, c: 7 },
];

const TRACK_YELLOW: Coord[] = TRACK_GREEN.map(({ r, c }) => ({
  r: c,
  c: 14 - r,
}));

const TRACK_RED: Coord[] = TRACK_GREEN.map(({ r, c }) => ({
  r: 14 - r,
  c: 14 - c,
}));

const TRACK_BLUE: Coord[] = TRACK_GREEN.map(({ r, c }) => ({
  r: 14 - c,
  c: r,
}));

// four "home" positions inside each colored 6x6 area
// tweak these later if you want them prettier
const GREEN_HOME: Coord[] = [
  { r: 1, c: 1 },
  { r: 1, c: 4 },
  { r: 4, c: 1 },
  { r: 4, c: 4 },
];

const YELLOW_HOME: Coord[] = [
  { r: 1, c: 10 },
  { r: 1, c: 13 },
  { r: 4, c: 10 },
  { r: 4, c: 13 },
];

const BLUE_HOME: Coord[] = [
  { r: 10, c: 1 },
  { r: 10, c: 4 },
  { r: 13, c: 1 },
  { r: 13, c: 4 },
];

const RED_HOME: Coord[] = [
  { r: 10, c: 10 },
  { r: 10, c: 13 },
  { r: 13, c: 10 },
  { r: 13, c: 13 },
];

export function initialPieces(): Piece[] {
  const pieces: Piece[] = [];

  const configs: { color: Color; track: Coord[]; homes: Coord[] }[] = [
    { color: "green", track: TRACK_GREEN, homes: GREEN_HOME },
    { color: "yellow", track: TRACK_YELLOW, homes: YELLOW_HOME },
    { color: "red", track: TRACK_RED, homes: RED_HOME },
    { color: "blue", track: TRACK_BLUE, homes: BLUE_HOME },
  ];

  configs.forEach(({ color, track, homes }) => {
    homes.forEach((homeCoord, index) => {
      pieces.push({
        id: `${color[0]}${index + 1}`, // g1..g4, y1..y4, r1..r4, b1..b4
        color,
        state: "home",
        home: homeCoord,
        trackIndex: 0,
        track,
        selected: false,
      });
    });
  });

  return pieces;
}

function PiecesLayer({
  pieces,
  onPieceClick,
}: {
  pieces: Piece[];
  onPieceClick: (id: string) => void;
}) {
  const cellPercent = 100 / 15;

  return (
    <div className="absolute inset-0">
      {pieces.map((p) => {
        const pos = p.state === "home" ? p.home : p.track[p.trackIndex];

        const top = pos.r * cellPercent;
        const left = pos.c * cellPercent;

        return (
          <div
            key={p.id}
            className="absolute transition-all duration-200 ease-linear"
            style={{
              top: `${top}%`,
              left: `${left}%`,
              width: `${cellPercent}%`,
              height: `${cellPercent}%`,
            }}
          >
            <Goti
              color={p.color}
              selected={p.selected}
              onClick={() => onPieceClick(p.id)}
            />
          </div>
        );
      })}
    </div>
  );
}

// --------------------------------------------------
// Home overlays (smaller boxes + 4 goti)
// --------------------------------------------------

type HomeOverlayProps = {
  position: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  boxColor: string;
  pieceColor: string;
};

/**
 * Smaller home box + 4 goti circles, aligned with the 6x6 home regions.
 */
function HomeOverlay({ position, boxColor, pieceColor }: HomeOverlayProps) {
  // 6 cells out of 15 ≈ 40% of the board
  const common =
    "absolute w-[40%] h-[40%] flex items-center justify-center pointer-events-none";

  let posClass = "";
  if (position === "top-left") posClass = "top-0 left-0";
  if (position === "top-right") posClass = "top-0 right-0";
  if (position === "bottom-left") posClass = "bottom-0 left-0";
  if (position === "bottom-right") posClass = "bottom-0 right-0";

  return (
    <div className={`${common} ${posClass}`}>
      <div
        className={`w-[86%] h-[86%] rounded-2xl ${boxColor} flex flex-col items-center justify-center`}
      >
        <div className="grid grid-cols-2 grid-rows-2 gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className={`w-5 h-5 md:w-6 md:h-6 rounded-full ${pieceColor} shadow-md border border-black/40`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
