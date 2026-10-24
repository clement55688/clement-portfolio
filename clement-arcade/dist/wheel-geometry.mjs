export function sectorGeometry(pivotY, innerEdge, spacing) {
  const outerRadius = pivotY - 8;
  const innerRadius = pivotY - innerEdge;
  const halfAngle = (spacing / 2 - 1.5) * Math.PI / 180;
  const width = 2 * outerRadius * Math.sin(halfAngle) + 4;
  const height = pivotY - innerRadius * Math.cos(halfAngle) + 2;
  const centerX = width / 2;
  const point = (radius, side) => [centerX + side * radius * Math.sin(halfAngle), pivotY - radius * Math.cos(halfAngle)];
  const points = [point(outerRadius, -1), point(outerRadius, 1), point(innerRadius, 1), point(innerRadius, -1)];
  function path(sx, sy) {
    const xy = p => `${(p[0] / sx).toFixed(7)} ${(p[1] / sy).toFixed(7)}`;
    const arc = radius => `${(radius / sx).toFixed(7)} ${(radius / sy).toFixed(7)}`;
    return `M${xy(points[0])} A${arc(outerRadius)} 0 0 1 ${xy(points[1])} L${xy(points[2])} A${arc(innerRadius)} 0 0 0 ${xy(points[3])} Z`;
  }
  return { width, height, centerX, pivotY, outerRadius, innerRadius, halfAngle, points, path: path(1, 1), clipPath: path(width, height) };
}
