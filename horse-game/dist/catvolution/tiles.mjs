export function createFace(value, coat){
  const inner=document.createElement('div');inner.className='tile-inner';
  const art=document.createElement('div');art.className='cat-watermark';art.setAttribute('aria-hidden','true');
  const cat=document.createElement('img');cat.className='tile-cat';cat.alt='';cat.draggable=false;
  const stage=value>=512?'-giant':value>=32?'-adult':'';
  cat.src=`cats/${coat}${stage}.webp`;
  art.append(cat);
  const number=document.createElement('b');number.className='value';number.textContent=String(value);
  inner.append(art,number);return inner;
}
// Separate the stationary grid from the moving numbered tiles, as in classic 2048.
export function createTiles(element){
  element.replaceChildren();
  const cells=Array.from({length:16},()=>{const cell=document.createElement('div');cell.className='cell';cell.setAttribute('aria-hidden','true');element.append(cell);return cell;});
  const layer=document.createElement('div');layer.className='tile-container';element.append(layer);
  const nodes=new Map();let current=[];
  function position(node,index){const cell=cells[index];node.style.width=`${cell.offsetWidth}px`;node.style.height=`${cell.offsetHeight}px`;node.style.transform=`translate(${cell.offsetLeft}px,${cell.offsetTop}px)`;}
  function sync(board,{mergedIds=[],newIds=[]}={}){
    current=board;
    const ids=new Set(board.filter(Boolean).map(tile=>tile.id));
    for(const [id,node]of nodes)if(!ids.has(id)){node.remove();nodes.delete(id);}
    board.forEach((tile,index)=>{
      if(!tile)return;
      let node=nodes.get(tile.id);
      if(!node){node=document.createElement('div');node.className=`tile v${Math.min(tile.value,2048)}`;node.dataset.tileId=String(tile.id);node.setAttribute('aria-label',String(tile.value));const inner=createFace(tile.value,tile.coat);node.append(inner);nodes.set(tile.id,node);layer.append(node);
        if(mergedIds.includes(tile.id))inner.classList.add('tile-merged');else if(newIds.includes(tile.id))inner.classList.add('tile-new');
      }
      position(node,index);
    });
  }
  function slide(movements){for(const movement of movements){const node=nodes.get(movement.id);if(node)position(node,movement.to);}return new Promise(resolve=>setTimeout(resolve,matchMedia('(prefers-reduced-motion: reduce)').matches?0:110));}
  function clear(){nodes.clear();layer.replaceChildren();current=[];}
  new ResizeObserver(()=>{current.forEach((tile,i)=>{if(tile&&nodes.has(tile.id))position(nodes.get(tile.id),i);});}).observe(element);
  return{sync,slide,clear};
}
