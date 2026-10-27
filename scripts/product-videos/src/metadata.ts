import { ALL_FORMATS, Input, UrlSource } from "mediabunny";
import { CalculateMetadataFunction, staticFile } from "remotion";
import type { ProductVideoProps } from "./ProductVideo";
import { PlannedShot, shotListSchema } from "./timeline";

const probeVideo = async (src: string) => {
  const input = new Input({ formats: ALL_FORMATS, source: new UrlSource(src, { getRetryDelay: () => null }) });
  try {
    const track = await input.getPrimaryVideoTrack();
    if (!track) throw new Error(`${src} has no video track`);
    return { width: track.displayWidth, height: track.displayHeight, seconds: await input.computeDuration() };
  } finally {
    input.dispose();
  }
};

const probeImage = (src: string) =>
  new Promise<{ width: number; height: number }>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => reject(new Error(`Could not load ${src}`));
    img.src = src;
  });

export const calculateMetadata: CalculateMetadataFunction<ProductVideoProps> = async ({ props }) => {
  const res = await fetch(staticFile(`${props.slug}/shots.json`));
  if (!res.ok) throw new Error(`footage/${props.slug}/shots.json not found`);
  const parsed = shotListSchema.safeParse(await res.json());
  if (!parsed.success) throw new Error(`footage/${props.slug}/shots.json: ${parsed.error.message}`);
  const list = parsed.data;

  const shots: PlannedShot[] = await Promise.all(
    list.shots.map(async (shot) => {
      const src = staticFile(`${props.slug}/${shot.file}`);
      const label = shot.label?.trim() || null;
      if (shot.still) return { src, still: true, label, seconds: shot.seconds, ...(await probeImage(src)) };
      const probe = await probeVideo(src);
      // shots.json can round up, the file is the truth.
      return { src, still: false, label, width: probe.width, height: probe.height, seconds: Math.min(shot.seconds, probe.seconds) };
    }),
  );

  return { props: { ...props, url: list.url.replace(/^https?:\/\//, ""), frame: list.frame, shots } };
};
