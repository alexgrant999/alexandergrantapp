import { Video } from "@remotion/media";
import { CSSProperties } from "react";
import { AbsoluteFill, Freeze, Img } from "remotion";
import { COLORS, SANS } from "./theme";
import { PlannedShot, pushIn, Slot } from "./timeline";

// Footage is drawn at the screen's width and its own aspect ratio, anchored to the top, so it is
// never stretched. A shot taller than the screen loses a strip at the bottom, never at the top.
export const ShotMedia = ({ shot, slot, f, width }: { shot: PlannedShot; slot: Slot; f: number; width: number }) => {
  const style: CSSProperties = {
    position: "absolute",
    top: 0,
    left: 0,
    width,
    height: Math.round((width * shot.height) / shot.width),
    display: "block",
    maxWidth: "none",
  };
  return (
    <AbsoluteFill style={{ transform: `scale(${pushIn(slot, f)})`, transformOrigin: "50% 30%" }}>
      {shot.still ? (
        <Img src={shot.src} style={style} />
      ) : (
        <Freeze frame={f}>
          <Video src={shot.src} muted playbackRate={slot.rate} objectFit="fill" style={style} />
        </Freeze>
      )}
    </AbsoluteFill>
  );
};

export const Label = ({ text, opacity, style }: { text: string; opacity: number; style: CSSProperties }) => (
  <div
    style={{
      position: "absolute",
      opacity,
      padding: "10px 18px 11px",
      background: COLORS.paper,
      border: `2px solid ${COLORS.ink}`,
      borderRadius: 4,
      fontFamily: SANS,
      fontWeight: 600,
      fontSize: 32,
      lineHeight: 1,
      letterSpacing: "-0.005em",
      color: COLORS.ink,
      whiteSpace: "nowrap",
      ...style,
    }}
  >
    {text}
  </div>
);
