import { Easing, interpolate } from "remotion";
import { z } from "zod";
import { DURATION, FPS } from "./theme";

// The shape the capture agents write to footage/<slug>/shots.json (see CONTRACT.md).
export const shotListSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string(),
  url: z.string().min(1),
  frame: z.enum(["browser", "phone", "card"]),
  shots: z
    .array(
      z.object({
        file: z.string().min(1),
        seconds: z.number().positive(),
        label: z.string().max(40).optional(),
        still: z.boolean().optional(),
      }),
    )
    .min(1),
});

export type ShotList = z.infer<typeof shotListSchema>;

export type PlannedShot = {
  src: string;
  still: boolean;
  label: string | null;
  width: number;
  height: number;
  seconds: number;
};

export type Slot = { start: number; length: number; rate: number; push: number };

// Frames each crossfade or slide lasts, including the one at the end that returns to frame 0.
export const TRANSITION = 15;
const MAX_RATE = 1.25;
// Stop this far short of a clip's last frame so playback never runs past it.
const TAIL_SECS = 0.15;
// A still has no motion of its own, so it gets a deeper push in than footage does.
const PUSH = 0.04;
const STILL_PUSH = 0.08;

// Slots overlap by TRANSITION frames and the last one runs to the final frame, so their lengths
// sum to DURATION plus the overlaps. Each shot gets a share in proportion to its footage, which
// keeps one playback rate across shots: slower when the footage is short, up to MAX_RATE (and
// then cut at the tail) when there is more than the 20 seconds can hold.
export const planSlots = (shots: PlannedShot[]): Slot[] => {
  const total = DURATION + (shots.length - 1) * TRANSITION;
  const sum = shots.reduce((acc, shot) => acc + shot.seconds, 0);
  const slots: Slot[] = [];
  let before = 0;
  let start = 0;
  for (const shot of shots) {
    const length = Math.round((total * (before + shot.seconds)) / sum) - Math.round((total * before) / sum);
    before += shot.seconds;
    const rate = shot.still ? 1 : Math.min(MAX_RATE, ((shot.seconds - TAIL_SECS) * FPS) / (length - 1));
    slots.push({ start, length, rate, push: shot.still ? STILL_PUSH : PUSH });
    start += length - TRANSITION;
  }
  return slots;
};

// lap is -1 for a copy from the previous loop (held on its last frame), 1 for a copy from the
// next loop (held on its first frame), and 0 for the shot playing in this loop.
export const localFrame = (slot: Slot, frame: number, lap = 0) => {
  if (lap > 0) return 0;
  if (lap < 0) return slot.length - 1;
  return Math.min(slot.length - 1, Math.max(0, frame - slot.start));
};

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const inOut = Easing.bezier(0.45, 0, 0.55, 1);

// 0 to 1 across the transition that brings shot `index` in. The first shot is in from frame 0.
// The final transition brings the first shot back and reaches 1 on the last frame, so the last
// frame matches frame 0.
export const entry = (slots: Slot[], index: number, frame: number) => {
  if (index === 0) return 1;
  return interpolate(frame, [slots[index].start, slots[index].start + TRANSITION - 1], [0, 1], { ...clamp, easing: inOut });
};

export const loopBack = (frame: number) =>
  interpolate(frame, [DURATION - TRANSITION, DURATION - 1], [0, 1], { ...clamp, easing: inOut });

// How far the shots have advanced, from 0 at frame 0 to slots.length on the last frame.
export const advance = (slots: Slot[], frame: number) =>
  slots.reduce((acc, _, i) => acc + (i === 0 ? 0 : entry(slots, i, frame)), 0) + loopBack(frame);

export const pushIn = (slot: Slot, f: number) =>
  1 + slot.push * interpolate(f, [0, slot.length - 1], [0, 1], { ...clamp, easing: Easing.inOut(Easing.sin) });

// Labels settle in after their shot arrives and leave before the next transition starts, so two
// labels never overlap. The first shot's label is already up on frame 0 (the poster).
export const labelOpacity = (index: number, slot: Slot, f: number) => {
  const fadeIn = index === 0 ? 1 : interpolate(f, [TRANSITION, TRANSITION + 9], [0, 1], clamp);
  const out = slot.length - TRANSITION;
  return Math.min(fadeIn, interpolate(f, [out - 9, out], [1, 0], clamp));
};
