export const MAX_CHARGE = 1;
export function padAt(index) {
  const n=Math.min(index,30), extra=Math.max(0,index-30);
  return {index,z:5*n+.025*n*(n-1)+extra*6.5,x:index<3?0:Math.sin(index*1.17)*.9,halfWidth:Math.max(.54,1.03-index*.014),halfDepth:1.25};
}
export function createFrog(){return {status:'ready',x:0,z:0,vx:0,pad:0,hops:0,charges:[0,0],rear:[false,false],hands:[false,false],flight:null,splash:0,message:'Hold your rear feet. Release to hop.'}}
export function landingAt(s){return {x:s.x,z:s.z+2+(s.charges[0]+s.charges[1])*3};}
export function findPad(x,z,after){for(let i=after+1;i<=after+3;i++){const p=padAt(i);if(Math.abs(z-p.z)<=p.halfDepth&&Math.abs(x-p.x)<=p.halfWidth)return p;}return null;}
export function pressRear(s,i){if(s.status!=='playing'||s.flight||i<0||i>1)return false;s.rear[i]=true;return true;}
export function releaseRear(s,i){if(!s.rear[i])return false;s.rear[i]=false;if(s.rear.some(Boolean)||s.flight||s.status!=='playing')return false;const power=s.charges[0]+s.charges[1];if(power<.16){s.charges=[0,0];s.message='Hold a little longer to load your springs.';return false;}s.flight={elapsed:0,duration:.65+power*.2,startZ:s.z,range:2+power*3,power};s.vx+=(s.charges[0]-s.charges[1])*.24;s.charges=[0,0];s.message='Front hands steer. Stick the landing!';return true;}
export function hand(s,i,down){if(s.status!=='playing')return;s.hands[i]=down;if(down){s.vx+=(i===0?-1:1)*.22;}}
export function cancelControls(s){s.rear=[false,false];s.hands=[false,false];s.charges=[0,0];}
export function advance(s,elapsed){if(s.status!=='playing')return;const dt=Math.min(.04,Math.max(0,elapsed));const steering=Number(s.hands[1])-Number(s.hands[0]);s.vx+=steering*(s.flight?4:3)*dt;s.vx*=Math.exp(-4*dt);s.x=Math.max(-1.9,Math.min(1.9,s.x+s.vx*dt));if(!s.flight){for(let i=0;i<2;i++)if(s.rear[i])s.charges[i]=Math.min(MAX_CHARGE,s.charges[i]+dt*.95);const p=padAt(s.pad);s.x=Math.max(p.x-p.halfWidth+.07,Math.min(p.x+p.halfWidth-.07,s.x));return;}const f=s.flight;f.elapsed+=dt;const t=Math.min(1,f.elapsed/f.duration);s.z=f.startZ+f.range*t;if(t>=1){const p=findPad(s.x,s.z,s.pad);s.flight=null;s.vx*=.3;if(p){s.pad=p.index;s.z=p.z;s.hops++;s.message=s.hops===1?'NICE. Now aim for the next pad.':s.hops%4===0?'Smaller pads. Bigger frog energy.':'Clean landing! Load those feet again.';}else{s.status='over';s.splash=1;s.message='A spectacularly unnecessary swim.';cancelControls(s);}}}
