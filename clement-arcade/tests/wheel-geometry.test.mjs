import test from 'node:test';
import assert from 'node:assert/strict';
import { sectorGeometry } from '../dist/wheel-geometry.mjs';
test('slice edges lie on exact circles around the rotation pivot at every supported size',()=>{
  for(const [pivot,inner,spacing] of [[535,274,45],[490,260,45],[395,212,45],[535,274,60]]){
    const g=sectorGeometry(pivot,inner,spacing);
    g.points.forEach(([x,y],i)=>assert.ok(Math.abs(Math.hypot(x-g.centerX,y-pivot)-(i<2?g.outerRadius:g.innerRadius))<1e-9));
    assert.ok(g.halfAngle*2<spacing*Math.PI/180);
    assert.equal(pivot-g.outerRadius,8);
    assert.ok(g.points.every(([x,y])=>x>=0&&x<=g.width&&y>=0&&y<=g.height));
  }
});
