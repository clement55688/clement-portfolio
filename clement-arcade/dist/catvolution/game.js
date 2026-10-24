import {createTiles} from './tiles.mjs';
import {newGame,move,spawn,canMove} from './core.mjs';
import {STAGES,stageFor,stageIndex,portrait} from './stages.mjs';
const $=id=>document.getElementById(id),KEY='catvolution.v3';
let board=[],score=0,best=0,undo=null,sound=true,audio,busy=false,queued=[],epoch=0,runHighest=2;
let discovered=new Set([2]),celebrationTimer;
try{const old=JSON.parse(localStorage.getItem('catvolution.v2')||'{}');const saved=JSON.parse(localStorage.getItem(KEY)||'{}');best=Math.max(Number(old.best)||0,Number(saved.best)||0);sound=saved.sound??old.sound??true;for(const v of saved.discovered||[])if(STAGES.some(s=>s.value===v))discovered.add(v);}catch{}
function save(){try{localStorage.setItem(KEY,JSON.stringify({best,sound,discovered:[...discovered]}));}catch{}}
function beep(){if(!sound)return;try{audio??=new AudioContext();const now=audio.currentTime;[440,554,659].forEach((freq,i)=>{const o=audio.createOscillator(),g=audio.createGain();o.type='sine';o.frequency.value=freq;g.gain.setValueAtTime(0,now+i*.04);g.gain.linearRampToValueAtTime(.025,now+i*.04+.01);g.gain.exponentialRampToValueAtTime(.001,now+.2+i*.04);o.connect(g).connect(audio.destination);o.start(now+i*.04);o.stop(now+.25+i*.04);});}catch{}}
const tiles=createTiles($('board'));
function resetMotion(){epoch++;busy=false;queued=[];tiles.clear();clearTimeout(celebrationTimer);$('discovery').hidden=true;}
function updateAlbum(){
  $('album-count').textContent=`${discovered.size}/11`;$('collection-grid').replaceChildren();
  STAGES.forEach(stage=>{const known=discovered.has(stage.value),card=document.createElement('article');card.className=`album-card ${known?'':'locked'}`;card.style.setProperty('--album-color',stage.color);const cat=portrait(stage.value);if(!known)cat.setAttribute('aria-label','Undiscovered cat');const name=document.createElement('b');name.textContent=known?stage.name:'???';const label=document.createElement('small');label.textContent=known?'DISCOVERED ♡':'KEEP GROWING';card.append(cat,name,label);$('collection-grid').append(card);});
}
function updatePet(){
  const index=stageIndex(runHighest),stage=STAGES[index],next=STAGES[index+1];
  if($('spotlight-art').dataset.stage!==String(index)){$('spotlight-art').replaceChildren(portrait(runHighest));$('spotlight-art').dataset.stage=String(index);}
  $('pet-stage').textContent=`STAGE ${String(index+1).padStart(2,'0')} / 11`;$('pet-name').textContent=stage.name;$('pet-line').textContent=stage.line;$('highest').textContent=stage.name;
  const nextArt=portrait(next?.value||2048,'silhouette');if(next&&!discovered.has(next.value))nextArt.setAttribute('aria-label','Undiscovered next cat');$('next-portrait').replaceChildren(nextArt);
  $('next-name').textContent=next?(discovered.has(next.value)?next.name:'A little mystery…'):'You raised a Cat God.';
  $('next-instruction').textContent=next?`Merge two ${stage.name}s.`:'Mochi has reached cosmic floof.';
  $('growth-track').replaceChildren();STAGES.forEach((s,i)=>{const dot=document.createElement('span');dot.className=i<=index?'grown':'';dot.title=s.name;dot.setAttribute('aria-label',`${i<=index?'Reached':'Next'} stage ${i+1}`);$('growth-track').append(dot);});
}
function celebrate(value){clearTimeout(celebrationTimer);$('discovery-art').replaceChildren(portrait(value));$('discovery-name').textContent=stageFor(value).name;$('discovery').hidden=false;celebrationTimer=setTimeout(()=>{$('discovery').hidden=true;},matchMedia('(prefers-reduced-motion: reduce)').matches?650:1450);}
function render(options={}){
  const maximum=Math.max(2,...board.filter(Boolean).map(t=>t.value));runHighest=Math.max(runHighest,maximum);best=Math.max(best,score);tiles.sync(board,options);$('score').textContent=score;$('best').textContent=best;$('undo').disabled=!undo;updatePet();save();
}
function begin(){resetMotion();board=newGame('orange').map(t=>t?{...t,value:2}:null);score=0;undo=null;runHighest=2;$('select-screen').hidden=true;$('game-screen').hidden=false;$('status').textContent='Swipe to bring matching cats together.';render({newIds:board.filter(Boolean).map(t=>t.id)});}
function finish(){$('final-cat').replaceChildren(portrait(runHighest));$('final-name').textContent=`You grew ${stageFor(runHighest).name}!`;$('final-copy').textContent=`${stageFor(runHighest).line} Your score: ${score}.`;$('game-over').showModal();}
async function act(direction){
  if(document.querySelector('dialog[open]')||$('game-screen').hidden)return;
  if(busy){if(queued.length<4)queued.push(direction);return;}
  const result=move(board,direction);if(!result.changed){const next=queued.shift();if(next)act(next);return;}
  busy=true;const version=epoch;undo={board:board.map(t=>t&&({...t})),score};await tiles.slide(result.movements);if(version!==epoch)return;
  board=spawn(result.board,'orange');score+=result.score;const prior=new Set(result.board.filter(Boolean).map(t=>t.id));
  const newStages=result.board.filter(Boolean).map(t=>Math.min(2048,t.value)).filter(v=>!discovered.has(v));
  newStages.forEach(v=>discovered.add(v));
  render({mergedIds:result.mergedIds,newIds:board.filter(t=>t&&!prior.has(t.id)).map(t=>t.id)});
  if(result.score){beep();$('status').textContent=`${stageFor(Math.max(...result.board.filter(Boolean).map(t=>t.value))).name} is getting comfortable. ♡`;}
  if(newStages.length){updateAlbum();celebrate(Math.max(...newStages));}
  busy=false;if(!canMove(board)){queued=[];clearTimeout(celebrationTimer);$('discovery').hidden=true;finish();return;}
  const next=queued.shift();if(next)act(next);
}
$('welcome-cat').append(portrait(4));[2,16,64,1024].forEach((v,i)=>{const cat=portrait(v,i>1?'silhouette':'');$('welcome-trail').append(cat);});
$('best').textContent=best;updateAlbum();
$('start').onclick=begin;$('restart').onclick=begin;$('again').onclick=()=>{$('game-over').close();begin();};
$('home').onclick=()=>{resetMotion();$('game-screen').hidden=true;$('select-screen').hidden=false;};
$('undo').onclick=()=>{if(!undo)return;const previous=undo;resetMotion();board=previous.board;score=previous.score;undo=null;$('status').textContent='One little pawstep back.';render();};
$('sound').onclick=()=>{sound=!sound;updateSound();save();};
function updateSound(){$('sound').setAttribute('aria-pressed',String(sound));$('sound').querySelector('span').textContent=sound?'Sound on':'Sound off';}updateSound();
$('collection-open').onclick=()=>{queued=[];updateAlbum();$('collection').showModal();};$('collection-close').onclick=()=>$('collection').close();
$('share').onclick=async()=>{const text=`I grew ${stageFor(runHighest).name} in Catvolution. Your turn to raise a tiny bean. 🐱`,url=new URL('/catvolution/',location.href).href;try{if(navigator.share)await navigator.share({title:'Meet my Mochi',text,url});else{await navigator.clipboard.writeText(`${text} ${url}`);$('share').textContent='Mochi’s link copied ♡';}}catch{}};
const dirs={ArrowLeft:'left',a:'left',ArrowRight:'right',d:'right',ArrowUp:'up',w:'up',ArrowDown:'down',s:'down'};
addEventListener('keydown',e=>{const direction=dirs[e.key]||dirs[e.key.toLowerCase()];if(!$('game-screen').hidden&&!document.querySelector('dialog[open]')&&direction&&!e.altKey&&!e.ctrlKey&&!e.metaKey){e.preventDefault();act(direction);}});
let gesture=null;$('board').addEventListener('pointerdown',e=>{if(e.button!==0)return;e.preventDefault();$('board').setPointerCapture(e.pointerId);gesture={id:e.pointerId,x:e.clientX,y:e.clientY};});
$('board').addEventListener('pointerup',e=>{if(!gesture||gesture.id!==e.pointerId)return;const dx=e.clientX-gesture.x,dy=e.clientY-gesture.y;gesture=null;if(Math.max(Math.abs(dx),Math.abs(dy))<20)return;act(Math.abs(dx)>Math.abs(dy)?dx>0?'right':'left':dy>0?'down':'up');});$('board').addEventListener('pointercancel',()=>{gesture=null;});
