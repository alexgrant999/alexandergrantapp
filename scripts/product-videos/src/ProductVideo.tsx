import { useMemo } from "react";
import { AbsoluteFill } from "remotion";
import { BrowserLayout } from "./BrowserLayout";
import { PhoneLayout } from "./PhoneLayout";
import { COLORS } from "./theme";
import { PlannedShot, planSlots } from "./timeline";

export type ProductVideoProps = {
  slug: string;
  url: string;
  frame: "browser" | "phone" | "card";
  shots: PlannedShot[];
};

export const ProductVideo = ({ url, frame, shots }: ProductVideoProps) => {
  const slots = useMemo(() => planSlots(shots), [shots]);
  return (
    <AbsoluteFill style={{ background: COLORS.paper }}>
      {shots.length === 0 ? null : frame === "browser" ? (
        <BrowserLayout url={url} shots={shots} slots={slots} />
      ) : (
        <PhoneLayout shots={shots} slots={slots} body={frame} />
      )}
    </AbsoluteFill>
  );
};
