import { Composition, getStaticFiles } from "remotion";
import { calculateMetadata } from "./metadata";
import { ProductVideo, ProductVideoProps } from "./ProductVideo";
import { DURATION, FPS, HEIGHT, WIDTH } from "./theme";

// The public dir is the footage folder, so every footage/<slug>/shots.json becomes a composition.
const slugs = getStaticFiles()
  .map((file) => /^([a-z0-9-]+)\/shots\.json$/.exec(file.name)?.[1])
  .filter((slug): slug is string => slug !== undefined)
  .sort();

export const RemotionRoot = () => (
  <>
    {slugs.map((slug) => (
      <Composition
        key={slug}
        id={slug}
        component={ProductVideo}
        width={WIDTH}
        height={HEIGHT}
        fps={FPS}
        durationInFrames={DURATION}
        defaultProps={{ slug, url: "", frame: "browser", shots: [] } satisfies ProductVideoProps}
        calculateMetadata={calculateMetadata}
      />
    ))}
  </>
);
