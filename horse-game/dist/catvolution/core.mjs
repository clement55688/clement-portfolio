export const BASE_COATS=['orange','black','white','gray'];
export const COATS={orange:['Orange Tabby','Certified troublemaker'],black:['Black Cat','Tiny void'],white:['White Cat','Fluffy royalty'],gray:['Gray Tabby','Professional napper']};
export const EVOLUTION={2:'2 months old',4:'4 months old',8:'8 months old',16:'1 year old',32:'2 years old',64:'Adult cat',128:'Chonky adult',256:'Mega chonk',512:'Giant cat',1024:'Cat King',2048:'Cat God'};
let nextId=1; export const tile=(value,coat)=>({id:nextId++,value,coat});
export function emptyBoard(){return Array(16).fill(null)}
export function spawn(board,starter,rng=Math.random){const open=[];board.forEach((v,i)=>{if(!v)open.push(i)});if(!open.length)return board;const out=board.map(x=>x&&{...x});const i=open[Math.floor(rng()*open.length)];out[i]=tile(rng()<.9?2:4,starter);return out}
export function newGame(starter,rng=Math.random){return spawn(spawn(emptyBoard(),starter,rng),starter,rng)}
const lines={left:[[0,1,2,3],[4,5,6,7],[8,9,10,11],[12,13,14,15]],right:[[3,2,1,0],[7,6,5,4],[11,10,9,8],[15,14,13,12]],up:[[0,4,8,12],[1,5,9,13],[2,6,10,14],[3,7,11,15]],down:[[12,8,4,0],[13,9,5,1],[14,10,6,2],[15,11,7,3]]};
export function move(board,direction){const out=Array(16).fill(null),mergedIds=[];let score=0;for(const indexes of lines[direction]){const source=indexes.map(i=>board[i]).filter(Boolean).map(x=>({...x}));const result=[];for(let i=0;i<source.length;i++){const current=source[i];if(i+1<source.length&&source[i+1].value===current.value){const value=current.value*2;result.push(tile(value,current.coat));score+=value;mergedIds.push(result.at(-1).id);i++}else result.push(current)}result.forEach((v,i)=>out[indexes[i]]=v)}const changed=board.some((v,i)=>v?.id!==out[i]?.id);return{board:out,changed,score,mergedIds}}
export function canMove(board){if(board.some(x=>!x))return true;return ['left','up'].some(d=>move(board,d,()=>0).changed)}
