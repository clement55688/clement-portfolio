import { createRun, step, tapLeg, RULESET } from '../dist/core.mjs';

/* ASSETS */
const json = (data, status = 200) => Response.json(data, { status, headers: { 'Cache-Control': 'no-store' } });
const rankingSql = `SELECT name, score FROM (SELECT name, score, created_at,
  ROW_NUMBER() OVER (PARTITION BY name_key ORDER BY score DESC, created_at ASC) AS place
  FROM hoof_scores WHERE ruleset = ${RULESET}) WHERE place = 1 ORDER BY score DESC, created_at ASC LIMIT 10`;
async function hash(value) {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return Array.from(new Uint8Array(bytes), b => b.toString(16).padStart(2, '0')).join('');
}
const roomCode=()=>{const alphabet='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';let value='';for(let i=0;i<5;i++)value+=alphabet[Math.floor(Math.random()*alphabet.length)];return value};
const cleanName=value=>typeof value==='string'?value.normalize('NFKC').replace(/[^\p{L}\p{N} _.-]/gu,'').trim().slice(0,16):'';
async function readJson(request){if(!request.headers.get('content-type')?.includes('application/json'))throw new Error('Expected JSON');const text=await request.text();if(text.length>12000)throw new Error('Request too large');return JSON.parse(text)}
async function roomState(env,code,token){const room=await env.DB.prepare('SELECT code,status,target_ms,penalty,start_at,round,updated_at,host_token_hash FROM timer_rooms WHERE code=?').bind(code).first();if(!room)return null;const tokenHash=token?await hash(token):'';const viewer=tokenHash?await env.DB.prepare('SELECT id,name,token_hash FROM timer_players WHERE room_code=? AND token_hash=?').bind(code,tokenHash).first():null;const {results}=await env.DB.prepare('SELECT id,name,tap_ms,joined_at FROM timer_players WHERE room_code=? ORDER BY joined_at ASC').bind(code).all();const now=Date.now(),allTapped=results.length>0&&results.every(p=>p.tap_ms!==null),timedOut=room.start_at&&now-room.start_at>30000,revealed=room.status==='results'||allTapped||timedOut;if(revealed&&room.status!=='results'){await env.DB.prepare("UPDATE timer_rooms SET status='results',updated_at=? WHERE code=?").bind(now,code).run();room.status='results'}const ranked=revealed?[...results].filter(p=>p.tap_ms!==null).sort((a,b)=>Math.abs(a.tap_ms-room.target_ms)-Math.abs(b.tap_ms-room.target_ms)):[];return{serverNow:now,room:{code:room.code,status:room.status,targetMs:room.target_ms,penalty:room.penalty,startAt:room.start_at,round:room.round},me:viewer?{id:viewer.id,name:viewer.name,isHost:tokenHash===room.host_token_hash,hasTapped:results.find(p=>p.id===viewer.id)?.tap_ms!==null}:null,players:results.map(p=>({id:p.id,name:p.name,hasTapped:p.tap_ms!==null,...(revealed&&p.tap_ms!==null?{tapMs:p.tap_ms,deltaMs:Math.abs(p.tap_ms-room.target_ms),rank:ranked.findIndex(x=>x.id===p.id)+1}:{})}))}}
async function handleTimerApi(request,env,pathname){if(!env.DB)return json({error:'Online rooms are temporarily unavailable.'},503);const origin=request.headers.get('origin');if(request.method!=='GET'&&origin&&origin!==new URL(request.url).origin)return json({error:'Use the game page to play.'},403);try{
  if(pathname==='/api/timer/room'&&request.method==='GET'){const url=new URL(request.url),code=(url.searchParams.get('code')||'').toUpperCase(),token=url.searchParams.get('token')||'';const state=await roomState(env,code,token);return state?json(state):json({error:'Room not found.'},404)}
  if(pathname==='/api/timer/rooms'&&request.method==='POST'){const body=await readJson(request),name=cleanName(body.name);if(!name)return json({error:'Enter a name.'},400);const penalty=typeof body.penalty==='string'?body.penalty.trim().slice(0,80):'';const code=roomCode(),hostToken=crypto.randomUUID(),playerToken=crypto.randomUUID(),now=Date.now(),playerId=crypto.randomUUID();await env.DB.prepare('DELETE FROM timer_rooms WHERE updated_at<?').bind(now-86400000).run();await env.DB.prepare('INSERT INTO timer_rooms(code,host_token_hash,penalty,created_at,updated_at) VALUES(?,?,?,?,?)').bind(code,await hash(hostToken),penalty||'Take one sip (or choose a non-alcoholic alternative)',now,now).run();await env.DB.prepare('INSERT INTO timer_players(id,room_code,name,token_hash,joined_at,seen_at) VALUES(?,?,?,?,?,?)').bind(playerId,code,name,await hash(playerToken),now,now).run();return json({code,hostToken,playerToken,state:await roomState(env,code,playerToken)},201)}
  if(pathname==='/api/timer/join'&&request.method==='POST'){const body=await readJson(request),code=String(body.code||'').toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,5),name=cleanName(body.name),room=await env.DB.prepare('SELECT status FROM timer_rooms WHERE code=?').bind(code).first();if(!room)return json({error:'That room does not exist.'},404);if(!['lobby','results'].includes(room.status))return json({error:'A round is already running. Join after the reveal.'},409);if(!name)return json({error:'Enter a name.'},400);const total=await env.DB.prepare('SELECT COUNT(*) AS count FROM timer_players WHERE room_code=?').bind(code).first();if(Number(total?.count||0)>=8)return json({error:'This room is full.'},409);const token=crypto.randomUUID(),now=Date.now();await env.DB.prepare('INSERT INTO timer_players(id,room_code,name,token_hash,joined_at,seen_at) VALUES(?,?,?,?,?,?)').bind(crypto.randomUUID(),code,name,await hash(token),now,now).run();return json({code,playerToken:token,state:await roomState(env,code,token)},201)}
  if(pathname==='/api/timer/start'&&request.method==='POST'){const body=await readJson(request),code=String(body.code||'').toUpperCase(),room=await env.DB.prepare('SELECT host_token_hash FROM timer_rooms WHERE code=?').bind(code).first();if(!room||await hash(String(body.hostToken||''))!==room.host_token_hash)return json({error:'Only the host can start the round.'},403);const now=Date.now(),startAt=now+3000;await env.DB.prepare('UPDATE timer_players SET tap_ms=NULL,submitted_at=NULL WHERE room_code=?').bind(code).run();await env.DB.prepare("UPDATE timer_rooms SET status='countdown',start_at=?,round=round+1,updated_at=? WHERE code=?").bind(startAt,now,code).run();return json(await roomState(env,code,body.playerToken))}
  if(pathname==='/api/timer/tap'&&request.method==='POST'){const body=await readJson(request),code=String(body.code||'').toUpperCase(),tokenHash=await hash(String(body.playerToken||'')),room=await env.DB.prepare('SELECT start_at,status FROM timer_rooms WHERE code=?').bind(code).first();if(!room||!room.start_at||!['countdown','playing'].includes(room.status))return json({error:'This round is not accepting taps.'},409);const now=Date.now(),elapsed=now-room.start_at;if(elapsed<0)return json({error:'Wait for GO.'},409);const result=await env.DB.prepare('UPDATE timer_players SET tap_ms=?,submitted_at=?,seen_at=? WHERE room_code=? AND token_hash=? AND tap_ms IS NULL').bind(elapsed,now,now,code,tokenHash).run();if(!result.meta.changes)return json({error:'You already tapped this round.'},409);await env.DB.prepare("UPDATE timer_rooms SET status='playing',updated_at=? WHERE code=?").bind(now,code).run();return json(await roomState(env,code,body.playerToken),201)}
  if(pathname==='/api/timer/reset'&&request.method==='POST'){const body=await readJson(request),code=String(body.code||'').toUpperCase(),room=await env.DB.prepare('SELECT host_token_hash FROM timer_rooms WHERE code=?').bind(code).first();if(!room||await hash(String(body.hostToken||''))!==room.host_token_hash)return json({error:'Only the host can reset the room.'},403);const now=Date.now();await env.DB.prepare('UPDATE timer_players SET tap_ms=NULL,submitted_at=NULL WHERE room_code=?').bind(code).run();await env.DB.prepare("UPDATE timer_rooms SET status='lobby',start_at=NULL,updated_at=? WHERE code=?").bind(now,code).run();return json(await roomState(env,code,body.playerToken))}
  return json({error:'Not found'},404)
}catch(error){return json({error:error instanceof Error?error.message:'Room error.'},400)}}
export function verifyRun(events, ticks) {
  if (!Array.isArray(events) || events.length < 1 || events.length > 1500 || !Number.isInteger(ticks) || ticks < 1 || ticks > 15000) throw new Error('Invalid run. Play again.');
  let previous = -1;
  for (const event of events) {
    if (!Array.isArray(event) || event.length !== 2 || !Number.isInteger(event[0]) || !Number.isInteger(event[1]) || event[0] < 0 || event[0] >= ticks || event[0] < previous || event[1] < 0 || event[1] > 3) throw new Error('Invalid run. Play again.');
    previous = event[0];
  }
  const s = createRun(); s.status = 'running';
  let cursor = 0;
  for (let tick = 0; tick < ticks; tick++) {
    while (cursor < events.length && events[cursor][0] === tick) {
      if (!tapLeg(s, events[cursor++][1])) throw new Error('Invalid input timing.');
    }
    if (s.status !== 'running') throw new Error('Run continued after the horse fell.');
    step(s, .02);
  }
  if (s.status !== 'over' || cursor !== events.length) throw new Error('Finish your run first.');
  const score = Math.round(s.distance * 10);
  if (score < 1) throw new Error('Reach 0.1 m to submit a score.');
  return score;
}
export async function handleApi(request, env) {
  const pathname = new URL(request.url).pathname;
  if(pathname.startsWith('/api/timer/'))return handleTimerApi(request,env,pathname);
  if (pathname !== '/api/leaderboard') return json({ error: 'Not found' }, 404);
  if (!env.DB) return json({ error: 'Leaderboard is temporarily unavailable. Your best is saved on this device.' }, 503);
  if (request.method === 'GET') {
    const { results } = await env.DB.prepare(rankingSql).all();
    return json({ scores: results.map((s, i) => ({ rank: i + 1, name: s.name, distance: s.score / 10 })) });
  }
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  const origin = request.headers.get('origin');
  if (origin && origin !== new URL(request.url).origin) return json({ error: 'Use the game page to submit.' }, 403);
  if (!request.headers.get('content-type')?.includes('application/json')) return json({ error: 'Expected JSON' }, 415);
  if (Number(request.headers.get('content-length')) > 50000) return json({ error: 'Run is too large.' }, 413);
  let body;
  try { const text = await request.text(); if (text.length > 50000) return json({ error: 'Run is too large.' }, 413); body = JSON.parse(text); } catch { return json({ error: 'Invalid submission.' }, 400); }
  if (typeof body?.name !== 'string') return json({ error: 'Enter your name.' }, 400);
  if (body.ruleset !== RULESET) return json({ error: 'The trail has been updated. Refresh the game before your next run.' }, 409);
  const name = body.name.normalize('NFKC').replace(/[^\p{L}\p{N} _.-]/gu, '').trim().slice(0, 16);
  if (name.length < 1) return json({ error: 'Use 1–16 letters or numbers for your name.' }, 400);
  let score;
  try { score = verifyRun(body.events, body.ticks); } catch (error) { return json({ error: error.message }, 400); }
  const now = Date.now();
  const ipHash = await hash(request.headers.get('cf-connecting-ip') || 'local-preview');
  const rate = await env.DB.prepare('SELECT COUNT(*) AS count FROM hoof_scores WHERE ip_hash = ? AND created_at > ?').bind(ipHash, now - 60000).first();
  if (rate.count >= 8) return json({ error: 'A lot of horses! Try submitting again in a minute.' }, 429);
  const replayHash = await hash(JSON.stringify([RULESET, body.events, body.ticks]));
  const result = await env.DB.prepare('INSERT OR IGNORE INTO hoof_scores (id, name, name_key, score, replay_hash, ip_hash, created_at, ruleset) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').bind(crypto.randomUUID(), name, name.toLowerCase(), score, replayHash, ipHash, now, RULESET).run();
  if (!result.meta.changes) return json({ error: 'This run was already submitted.' }, 409);
  const { results } = await env.DB.prepare(rankingSql).all();
  return json({ distance: score / 10, scores: results.map((s, i) => ({ rank: i + 1, name: s.name, distance: s.score / 10 })) }, 201);
}
export default {
  async fetch(request, env) {
    const pathname = new URL(request.url).pathname;
    try {
      if (pathname.startsWith('/api/')) return await handleApi(request, env);
      const assetPath = pathname === '/' ? '/index.html' : pathname.endsWith('/') ? `${pathname}index.html` : pathname;
      const asset = ASSETS[assetPath];
      if (!asset) return new Response('Not found', { status: 404 });
      return new Response(Uint8Array.from(atob(asset.data), c => c.charCodeAt(0)), { headers: { 'Content-Type': asset.type, 'Cache-Control': 'no-cache', 'X-Content-Type-Options': 'nosniff' } });
    } catch { return json({ error: 'Leaderboard is taking a grass break. Please try again.' }, 503); }
  }
};
