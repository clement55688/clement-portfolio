export const STAGES = [
  {value:2,name:'Tiny Bean',line:'Two paws. One big adventure.',color:'#f7e6cf'},
  {value:4,name:'Baby Mochi',line:'Those eyes could get away with anything.',color:'#f4d9c4'},
  {value:8,name:'Pocket Floof',line:'Small cat. Very large opinions.',color:'#f4d1bc'},
  {value:16,name:'Little Menace',line:'The curtains never stood a chance.',color:'#f4c4c2'},
  {value:32,name:'Fluff Supreme',line:'An extremely distinguished cloud.',color:'#e6cdec'},
  {value:64,name:'Certified Chonk',line:'A little more cat to love.',color:'#d6d4f3'},
  {value:128,name:'Mega Loaf',line:'Paws have left the chat.',color:'#c6e1e0'},
  {value:256,name:'Absolute Unit',line:'Your sofa belongs to Mochi now.',color:'#bfe0ce'},
  {value:512,name:'Lord of the Floof',line:'This is technically still a house cat.',color:'#e0e8b5'},
  {value:1024,name:'His Meowjesty',line:'All hail the roundest ruler.',color:'#f4dc9f'},
  {value:2048,name:'Cosmic Mochi',line:'You raised a tiny bean into a Cat God.',color:'#d8c8fa'}
];
export function stageIndex(value){return Math.min(STAGES.length-1,Math.max(0,Math.floor(Math.log2(Math.max(2,value)))-1));}
export function stageFor(value){return STAGES[stageIndex(value)];}
const FRAMES=[
 [0,0,362,324],[362,0,362,324],[724,0,362,324],
 [0,324,362,356],[362,324,375,356],[737,324,349,356],
 [0,680,356,354],[356,680,395,354],[751,672,335,362],
 [0,1034,386,414],[386,1030,400,418]
];
export function portrait(value,extra=''){
  const i=stageIndex(value),node=document.createElement('div');node.className=`cat-sprite ${extra}`;
  const [x,y,w,h]=FRAMES[i];
  node.style.backgroundSize=`${1086/w*100}% ${1448/h*100}%`;
  node.style.backgroundPosition=`${x/(1086-w)*100}% ${y/(1448-h)*100}%`;
  node.setAttribute('role','img');node.setAttribute('aria-label',stageFor(value).name);return node;
}
