export const levelForScore=score=>Math.floor(Math.max(0,score)/20)+1;
export const watcherCount=level=>Math.min(3,1+Math.floor((Math.max(1,level)-1)/2));
export const timingForLevel=level=>({awayMin:Math.max(900,2800-level*150),awayMax:Math.max(1500,4800-level*230),warning:Math.max(320,950-level*55),watchMin:900,watchMax:Math.min(2500,1300+level*100)});
export function createWatcher(index,level,now,random=Math.random){const t=timingForLevel(level);return{id:index,phase:'away',next:now+t.awayMin+random()*(t.awayMax-t.awayMin)}}
export function advanceWatcher(watcher,level,now,random=Math.random){if(now<watcher.next)return watcher;const t=timingForLevel(level);if(watcher.phase==='away')return{...watcher,phase:'warning',next:now+t.warning};if(watcher.phase==='warning')return{...watcher,phase:'watching',next:now+t.watchMin+random()*(t.watchMax-t.watchMin)};return{...watcher,phase:'away',next:now+t.awayMin+random()*(t.awayMax-t.awayMin)}}
export const isCaught=(watchers,isScratching)=>isScratching&&watchers.some(w=>w.phase==='watching');
