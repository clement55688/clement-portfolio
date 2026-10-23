export const ORDER = [0, 3, 1, 2];
export const COLORS = ['#d4ee54', '#ff8b74', '#bfadf5', '#8bc9f5'];
export const RECORD_KEY = 'hoof-best-v2';
export function createRun() {
  return { status: 'ready', distance: 0, speed: 0, tilt: 0, angular: 0, time: 0, lastTap: 0, lastLeg: -1, combo: 0, next: 0, taps: 0, legs: [0, 0, 0, 0], feedback: 'Your dignity is the only thing at stake.', reason: '' };
}
export function tapLeg(s, leg) {
  if (s.status !== 'running' || leg < 0 || leg > 3) return false;
  // Ignore simultaneous/machine-speed taps rather than rewarding button mashing.
  if (s.taps && s.time - s.lastTap < .095) return false;
  const interval = s.time - s.lastTap;
  const correct = leg === ORDER[s.next];
  const rushed = s.taps > 0 && interval < .24;
  const late = s.taps > 0 && interval > .66;
  const repeated = leg === s.lastLeg;
  s.legs[leg] = 1;
  s.taps++;
  s.lastTap = s.time;
  s.lastLeg = leg;
  if (correct && !rushed && !late) {
    s.next = (s.next + 1) % 4;
    s.combo++;
    s.speed = Math.min(6.5, s.speed + 1.08);
    s.angular += -s.tilt * .28 + (leg < 2 ? -.16 : .16);
    s.tilt *= .93;
    s.feedback = s.combo > 15 ? 'Getting tired. Keep a steady rhythm!' : s.combo > 5 ? 'Nice! Keep that rhythm.' : 'Good! Tap the next number.';
  } else {
    s.combo = 0;
    s.next = (ORDER.indexOf(leg) + 1) % 4;
    s.speed = Math.min(5, s.speed + (repeated ? .03 : .35));
    s.angular += (leg < 2 ? -1 : 1) * (repeated ? 1.25 : .65);
    s.feedback = repeated ? 'Same leg again! Try another.' : rushed ? 'Too fast! Slow your taps.' : late ? 'Too slow! Keep moving.' : 'Wrong leg! Follow the numbers.';
  }
  return true;
}
export function step(s, elapsed) {
  if (s.status !== 'running') return;
  const dt = Math.min(Math.max(elapsed, 0), .04);
  s.time += dt;
  // A weaker horse loses momentum faster and tires as the run gets longer.
  const fatigue = Math.min(s.distance / 65, 1.4);
  s.speed = Math.max(0, s.speed - dt * (2.5 + fatigue));
  s.distance += s.speed * dt;
  const unevenGround = (Math.sin(s.time * 2.3) + Math.sin(s.time * 4.7) * .4) * (.22 + fatigue * .48);
  s.angular += (s.tilt * 1.5 - s.angular * 1.35 + unevenGround) * dt;
  s.tilt += s.angular * dt;
  for (let i = 0; i < 4; i++) s.legs[i] = Math.max(0, s.legs[i] - dt * 3.5);
  if (Math.abs(s.tilt) > .68) { s.status = 'over'; s.reason = 'Oops. Your horse fell over.'; }
  else if (s.time - s.lastTap > (s.taps ? 2.4 : 4.5)) { s.status = 'over'; s.reason = s.taps ? 'Too long without a tap. Horse gave up.' : 'Tap a leg to move your horse!'; }
  else if (s.time - s.lastTap > 1.2) s.feedback = 'Keep tapping! Your horse is stopping.';
}
