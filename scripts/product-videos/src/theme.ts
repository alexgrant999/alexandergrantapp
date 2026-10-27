import { loadFont } from "@remotion/google-fonts/InstrumentSans";

export const SANS = loadFont("normal", { weights: ["500", "600"], subsets: ["latin"] }).fontFamily;

export const COLORS = {
  paper: "#f3f0e8",
  ink: "#191916",
  red: "#e43b2f",
  faint: "#d6d1c5",
  muted: "#66635c",
} as const;

export const WIDTH = 1280;
export const HEIGHT = 800;
export const FPS = 30;
export const DURATION = 600;

// Shown at 320 to 480 px wide, so 3 px here reads as a 1 px rule on the page.
export const RULE = 3;
