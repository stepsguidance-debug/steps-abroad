export function polar(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

export function donutSectorPath(cx: number, cy: number, rIn: number, rOut: number, startDeg: number, endDeg: number): string {
  const pOs = polar(cx, cy, rOut, startDeg);
  const pOe = polar(cx, cy, rOut, endDeg);
  const pIe = polar(cx, cy, rIn, endDeg);
  const pIs = polar(cx, cy, rIn, startDeg);
  const sweepDeg = endDeg - startDeg;
  const large = Math.abs(sweepDeg) > 180 ? 1 : 0;
  return [
    "M",
    pOs.x,
    pOs.y,
    "A",
    rOut,
    rOut,
    0,
    large,
    1,
    pOe.x,
    pOe.y,
    "L",
    pIe.x,
    pIe.y,
    "A",
    rIn,
    rIn,
    0,
    large,
    0,
    pIs.x,
    pIs.y,
    "Z",
  ].join(" ");
}

/** Same wedge math as web Recharts `innerRadius` 45 / `outerRadius` 70 scaled to `size`. */
export function buildTraitDonutSlices(
  data: { name: string; value: number }[],
  colors: string[],
  size: number,
): { key: string; path: string; fill: string }[] {
  const cx = size / 2;
  const cy = size / 2;
  const outerR = 70 * (size / 200);
  const innerR = 45 * (size / 200);
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const gapDeg = 3;
  const usable = 360 - gapDeg * data.length;
  let start = -90;
  const slices: { key: string; path: string; fill: string }[] = [];

  data.forEach((d, i) => {
    const sweepDeg = usable * (d.value / total);
    const end = start + sweepDeg;
    slices.push({
      path: donutSectorPath(cx, cy, innerR, outerR, start, end),
      fill: colors[i % colors.length],
      key: d.name,
    });
    start = end + gapDeg;
  });

  return slices;
}
