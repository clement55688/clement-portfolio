import {createTiles} from './tiles.mjs';
import{BASE_COATS,COATS,EVOLUTION,newGame,move,spawn,canMove}from'./core.mjs';
const $=id=>document.getElementById(id),KEY='catvolution.v2';let starter=null,board=[],score=0,undo=null,sound=true,audio;
function load(){try{const s=JSON.parse(localStorage.getItem(KEY)||'{}');sound=s.sound!==false;starter=COATS[s.starter]?s.starter:null;$('best').textContent=Number(s.best)||0}catch{}}
function save(){try{const old=JSON.parse(localStorage.getItem(KEY)||'{}');localStorage.setItem(KEY,JSON.stringify({sound,starter,best:Math.max(Number(old.best)||0,score)}))}catch{}}
function image(coat){return `cats/${coat}.webp`}
function beep(){if(!sound)return;try{audio??=new AudioContext();const o=audio.createOscillator(),g=audio.createGain();o.frequency.value=520;g.gain.setValueAtTime(.04,audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+.09);o.connect(g).connect(audio.destination);o.start();o.stop(audio.currentTime+.1)}catch{}}
function renderOptions(){$('cat-options').innerHTML=BASE_COATS.map(c=>`<button class="cat-card" data-coat="${c}" aria-pressed="${starter===c}"><img src="${image(c)}" alt="${COATS[c][0]}"><div><strong>${COATS[c][0]}</strong><span>${COATS[c][1]}</span></div></button>`).join('');document.querySelectorAll('[data-coat]').forEach(b=>b.onclick=()=>{starter=b.dataset.coat;save();renderOptions();$('start').disabled=false})}
const tiles=createTiles($('board'));let busy=false,queued=[],epoch=0;
function resetMotion(){epoch++;busy=false;queued=[];tiles.clear();}
function renderGuide(){$('collection-grid').replaceChildren();for(const value of Object.keys(EVOLUTION).map(Number)){const card=document.createElement('article');card.className='number-guide';const swatch=document.createElement('div');swatch.className=`tile v${value}`;const inner=document.createElement('div');inner.className='tile-inner';inner.textContent=value;swatch.append(inner);card.append(swatch);$('collection-grid').append(card);}}
function render(options={}){const max=Math.max(2,...board.filter(Boolean).map(t=>t.value));tiles.sync(board,options);$('score').textContent=score;$('best').textContent=Math.max(Number($('best').textContent)||0,score);$('highest').textContent=max;$('undo').disabled=!undo;save();}
function begin(){if(!starter)return;resetMotion();board=newGame(starter);score=0;undo=null;$('select-screen').hidden=true;$('game-screen').hidden=false;$('status').textContent='Swipe or use arrow keys. Match numbers. Reach 2048.';render({newIds:board.filter(Boolean).map(t=>t.id)});}
async function act(direction){
  if(document.querySelector('dialog[open]')||$('game-screen').hidden)return;
  if(busy){if(queued.length<4)queued.push(direction);return;}
  const result=move(board,direction);if(!result.changed){const next=queued.shift();if(next)act(next);return;}
  busy=true;const version=epoch;undo={board:board.map(t=>t&&({...t})),score};
  await tiles.slide(result.movements);
  if(version!==epoch)return;
  board=spawn(result.board,starter);score+=result.score;
  const beforeSpawn=new Set(result.board.filter(Boolean).map(t=>t.id));
  render({mergedIds:result.mergedIds,newIds:board.filter(t=>t&&!beforeSpawn.has(t.id)).map(t=>t.id)});
  if(result.score){beep();$('status').textContent=`+${result.score} · Nice merge! Keep going.`;}
  busy=false;
  if(!canMove(board)){$('game-over').showModal();queued=[];return;}
  const next=queued.shift();if(next)act(next);
}
load();renderOptions();renderGuide();$('start').disabled=!starter;$('start').onclick=begin;$('random').onclick=()=>{starter=BASE_COATS[Math.floor(Math.random()*BASE_COATS.length)];renderOptions();$('start').disabled=false};$('home').onclick=()=>{resetMotion();$('game-screen').hidden=true;$('select-screen').hidden=false;renderOptions()};$('restart').onclick=begin;$('again').onclick=()=>{$('game-over').close();begin()};$('undo').onclick=()=>{if(!undo)return;const previous=undo;resetMotion();board=previous.board;score=previous.score;undo=null;$('status').textContent='Move undone.';render()};$('sound').onclick=()=>{sound=!sound;$('sound').textContent=sound?'Sound on':'Sound off';$('sound').setAttribute('aria-pressed',sound);save()};$('sound').textContent=sound?'Sound on':'Sound off';$('collection-open').onclick=()=>{queued=[];renderGuide();$('collection').showModal()};$('collection-close').onclick=()=>$('collection').close();
const dirs={ArrowLeft:'left',a:'left',A:'left',ArrowRight:'right',d:'right',D:'right',ArrowUp:'up',w:'up',W:'up',ArrowDown:'down',s:'down',S:'down'};
addEventListener('keydown',e=>{if(!$('game-screen').hidden&&!document.querySelector('dialog[open]')&&dirs[e.key]&&!e.altKey&&!e.ctrlKey&&!e.metaKey){e.preventDefault();act(dirs[e.key]);}});
let gesture=null;
$('board').addEventListener('pointerdown',e=>{if(e.button!==0)return;e.preventDefault();$('board').setPointerCapture(e.pointerId);gesture={id:e.pointerId,x:e.clientX,y:e.clientY};});
$('board').addEventListener('pointerup',e=>{if(!gesture||gesture.id!==e.pointerId)return;const dx=e.clientX-gesture.x,dy=e.clientY-gesture.y;gesture=null;if(Math.max(Math.abs(dx),Math.abs(dy))<20)return;act(Math.abs(dx)>Math.abs(dy)?dx>0?'right':'left':dy>0?'down':'up');});
$('board').addEventListener('pointercancel',()=>{gesture=null;});
