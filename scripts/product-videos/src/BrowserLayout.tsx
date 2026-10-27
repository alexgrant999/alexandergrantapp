import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Label, ShotMedia } from "./ShotMedia";
import { COLORS, DURATION, HEIGHT, RULE, SANS, WIDTH } from "./theme";
import { entry, labelOpacity, localFrame, loopBack, PlannedShot, Slot, TRANSITION } from "./timeline";

const BAR = 58;
const MIN_MARGIN_X = 64;
const MIN_MARGIN_Y = 36;

// The chrome holds still and the page crossfades inside it, like moving around one site.
export const BrowserLayout = ({ url, shots, slots }: { url: string; shots: PlannedShot[]; slots: Slot[] }) => {
  const frame = useCurrentFrame();
  // The widest shot sets the viewport, so every shot fills its width.
  const aspect = Math.min(...shots.map((shot) => shot.height / shot.width));
  const innerW = Math.floor(Math.min(WIDTH - 2 * MIN_MARGIN_X - 2 * RULE, (HEIGHT - 2 * MIN_MARGIN_Y - BAR - 3 * RULE) / aspect));
  const innerH = Math.round(innerW * aspect);

  const layers = shots
    .map((shot, index) => ({ shot, index, lap: 0, opacity: entry(slots, index, frame) }))
    .filter(({ index }) => frame >= slots[index].start && frame < slots[index].start + slots[index].length);
  if (frame >= DURATION - TRANSITION) layers.push({ shot: shots[0], index: 0, lap: 1, opacity: loopBack(frame) });

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <div style={{ border: `${RULE}px solid ${COLORS.ink}`, borderRadius: 10, overflow: "hidden", background: COLORS.paper }}>
        <div style={{ position: "relative", height: BAR, borderBottom: `${RULE}px solid ${COLORS.ink}`, display: "flex", alignItems: "center", gap: 11, paddingLeft: 22 }}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{ width: 15, height: 15, borderRadius: 8, border: `${RULE - 0.5}px solid ${COLORS.ink}` }} />
          ))}
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              minWidth: Math.round(innerW * 0.42),
              padding: "7px 26px 8px",
              borderRadius: 999,
              background: COLORS.faint,
              textAlign: "center",
              fontFamily: SANS,
              fontWeight: 500,
              fontSize: 25,
              lineHeight: 1,
              color: COLORS.ink,
              whiteSpace: "nowrap",
            }}
          >
            {url}
          </div>
        </div>
        <div style={{ position: "relative", width: innerW, height: innerH, overflow: "hidden", background: "#fff" }}>
          {layers.map(({ shot, index, lap, opacity }) => {
            const slot = slots[index];
            const f = localFrame(slot, frame, lap);
            return (
              <AbsoluteFill key={`${index}:${lap}`} style={{ opacity }}>
                <ShotMedia shot={shot} slot={slot} f={f} width={innerW} />
                {shot.label ? <Label text={shot.label} opacity={labelOpacity(index, slot, f)} style={{ left: 24, bottom: 24 }} /> : null}
              </AbsoluteFill>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
