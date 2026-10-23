export const LIMBS=['front-left','front-right','rear-left','rear-right'];
export const RHYTHM=[2,0,3,1];
export function createFrog(){return{status:'ready',z:0,x:0,speed:0,stamina:100,strokes:0,combo:0,next:0,active:[false,false,false,false],lastStroke:-9,message:'Alternate rear and front limbs to swim.'}}
export function stroke(s,i,now=0){if(s.status!=='playing'||i<0||i>3)return false;s.active[i]=true;const expected=RHYTHM[s.next],gap=now-s.lastStroke;if(i===expected&&gap>.11&&(s.lastStroke<0||gap<1.15)){s.next=(s.next+1)%4;s.combo=Math.min(12,s.combo+1);s.speed=Math.min(9,s.speed+1.25+s.combo*.035);s.stamina=Math.min(100,s.stamina+1.8);s.strokes++;s.message=s.combo>7?'PERFECT POND RHYTHM!':s.combo>3?'Nice stroke. Keep alternating.':'Good pull! Follow the glowing limb.';s.lastStroke=now;return true}s.combo=0;s.speed=Math.max(0,s.speed-.7);s.stamina=Math.max(0,s.stamina-4);s.message=i===expected?'Too fast—let the frog glide.':'Wrong limb. Follow the glow.';s.lastStroke=now;return false}
export function release(s,i){if(i>=0&&i<4)s.active[i]=false}
export function cancelControls(s){s.active=[false,false,false,false]}
export function currentAt(z){return Math.sin(z*.045)*.48+Math.sin(z*.013)*.22}
export function obstacleAt(index){const z=12+index*13+(index%3)*2;return{z,x:Math.sin(index*2.17)*.72,kind:index%3===0?'log':index%3===1?'lily':'bottle'}}
export function advance(s,elapsed){if(s.status!=='playing')return;const dt=Math.min(.05,Math.max(0,elapsed));s.speed*=Math.exp(-.62*dt);s.z+=s.speed*dt;s.x+=currentAt(s.z)*dt*.18;s.x=Math.max(-1.12,Math.min(1.12,s.x));s.stamina=Math.max(0,s.stamina-dt*(s.speed<.65?5.5:.32));if(s.stamina<=0){s.status='over';s.message='Out of steam. The frog is taking a float break.'}}
export function nudge(s,amount){if(s.status==='playing')s.x=Math.max(-1.12,Math.min(1.12,s.x+amount))}
