export const ORDER = [0, 3, 1, 2];
export const COLORS = ['#d4ee54', '#ff8b74', '#bfadf5', '#8bc9f5'];
export function createRun() {
  return { status: 'ready', distance: 0, speed: 0, tilt: 0, angular: 0, time: 0, lastTap: 0, lastLeg: -1, combo: 0, next: 0, taps: 0, legs: [0, 0, 0, 0], feedback: 'Your dignity is the only thing at stake.', reason: '' };
}
export function tapLeg(s, leg) {
  if (s.status !== 'running' || leg < 0 || leg > 3) return false;
  // Ignore simultaneous/machine-speed taps rather than rewarding button mashing.
  if (s.taps && s.time - s.lastTap < .095) return false;
  const correct = leg === ORDER[s.next];
  const repeated = leg === s.lastLeg;
  s.legs[leg] = 1;
  s.taps++;
  s.lastTap = s.time;
  s.lastLeg = leg;
  if (correct) {
    s.next = (s.next + 1) % 4;
    s.combo++;
    s.speed = Math.min(10, s.speed + 1.25 + Math.min(s.combo, 12) * .07);
    s.angular += -s.tilt * .65;
    s.tilt *= .78;
    s.feedback = s.combo > 15 ? 'Suspiciously horse-like. Keep going.' : s.combo > 5 ? 'Wait. You’re actually doing it.' : 'Good hoof. Now the next one.';
  } else {
    s.combo = 0;
    s.next = (ORDER.indexOf(leg) + 1) % 4;
    s.speed = Math.min(8, s.speed + (repeated ? .08 : .65));
    s.angular += (leg < 2 ? -1 : 1) * (repeated ? 1.05 : .43);
    s.feedback = repeated ? 'That is still the same leg.' : 'Creative interpretation of walking.';
  }
  return true;
}
export function step(s, elapsed) {
  if (s.status !== 'running') return;
  const dt = Math.min(Math.max(elapsed, 0), .04);
  s.time += dt;
  s.speed = Math.max(0, s.speed - dt * 2.05);
  s.distance += s.speed * dt;
  s.angular += (s.tilt * .6 - s.angular * 1.9) * dt;
  s.tilt += s.angular * dt;
  for (let i = 0; i < 4; i++) s.legs[i] = Math.max(0, s.legs[i] - dt * 3.5);
  if (Math.abs(s.tilt) > .92) { s.status = 'over'; s.reason = 'Gravity has entered the chat.'; }
  else if (s.time - s.lastTap > 4.5) { s.status = 'over'; s.reason = s.taps ? 'Your horse has quietly resigned.' : 'Horse.exe has stopped responding.'; }
  else if (s.time - s.lastTap > 2) s.feedback = 'The horse would like some legs, please.';
}
