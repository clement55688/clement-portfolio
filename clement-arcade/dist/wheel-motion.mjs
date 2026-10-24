export const wrap = (value, size) => ((value % size) + size) % size;
export function nearestGame(position, game, count) {
  return game + Math.round((position - game) / count) * count;
}
// A near-critically damped spring: velocity survives retargeting and rapid reversals.
export function advanceSpring(state, elapsed) {
  let remaining = Math.min(.05, Math.max(0, elapsed));
  while (remaining > 0) {
    const dt = Math.min(remaining, 1 / 120);
    state.velocity += ((state.target - state.position) * 170 - state.velocity * 26) * dt;
    state.position += state.velocity * dt;
    remaining -= dt;
  }
  if (Math.abs(state.target - state.position) < .0002 && Math.abs(state.velocity) < .002) {
    state.position = state.target; state.velocity = 0;
  }
}
