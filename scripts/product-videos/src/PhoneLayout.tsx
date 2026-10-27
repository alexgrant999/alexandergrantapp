import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Label, ShotMedia } from "./ShotMedia";
import { COLORS, HEIGHT, RULE, WIDTH } from "./theme";
import { advance, labelOpacity, localFrame, PlannedShot, Slot } from "./timeline";

const MARGIN_Y = 40;
const GAP = 72;
const SIDE_SCALE = 0.86;
const SIDE_OPACITY = 0.4;

// A phone has an ink bezel. A card (an App Store image that already draws its own phone and
// title) gets only a thin ink outline and never a label.
const BODY = {
  phone: { edge: 12, radius: 54 },
  card: { edge: RULE, radius: 24 },
};

// A ring of phones or cards that slides one place left per shot. The ring wraps, so the last slide
// brings the first one back to the centre exactly as it stood on frame 0. Copies from the previous
// lap hold their last frame and copies from the next lap hold their first.
export const PhoneLayout = ({ shots, slots, body }: { shots: PlannedShot[]; slots: Slot[]; body: "phone" | "card" }) => {
  const frame = useCurrentFrame();
  const { edge, radius } = BODY[body];
  const aspect = Math.min(...shots.map((shot) => shot.height / shot.width));
  const screenH = HEIGHT - 2 * MARGIN_Y - 2 * edge;
  const screenW = Math.round(screenH / aspect);
  const spacing = screenW + 2 * edge + GAP;
  const position = advance(slots, frame);
  const reach = (WIDTH / 2 + screenW) / spacing;

  const copies = [-1, 0, 1]
    .flatMap((lap) => shots.map((shot, index) => ({ shot, index, lap, offset: index + lap * shots.length - position })))
    .filter(({ offset }) => Math.abs(offset) < reach)
    .sort((a, b) => Math.abs(b.offset) - Math.abs(a.offset));

  return (
    <AbsoluteFill>
      {copies.map(({ shot, index, lap, offset }) => {
        const slot = slots[index];
        const f = localFrame(slot, frame, lap);
        const side = Math.min(1, Math.abs(offset));
        return (
          <div
            key={`${index}:${lap}`}
            style={{
              position: "absolute",
              left: WIDTH / 2 + offset * spacing - screenW / 2 - edge,
              top: MARGIN_Y,
              padding: edge,
              borderRadius: radius,
              background: COLORS.ink,
              opacity: 1 - (1 - SIDE_OPACITY) * side,
              transform: `scale(${1 - (1 - SIDE_SCALE) * side})`,
            }}
          >
            <div style={{ position: "relative", width: screenW, height: screenH, borderRadius: radius - edge, overflow: "hidden", background: "#fff" }}>
              <ShotMedia shot={shot} slot={slot} f={f} width={screenW} />
            </div>
            {shot.label && body === "phone" ? (
              <Label
                text={shot.label}
                opacity={labelOpacity(index, slot, f) * Math.max(0, 1 - Math.abs(offset) * 3)}
                style={{ right: "calc(100% - 44px)", bottom: 120 }}
              />
            ) : null}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
