import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../dist/server/index.js';
test('all game entries and their linked local artwork, scripts, and styles are packaged',async()=>{
  for(const route of ['/', '/hoof/', '/catvolution/', '/frog/', '/cabin-chaos/', '/ten-seconds/', '/sneaky-scratch/']){
    const url=new URL(route,'https://arcade.test');
    const response=await worker.fetch(new Request(url),{});
    assert.equal(response.status,200,route);
    const html=await response.text();
    assert.match(html,/Clement|CLEMENT/);
    for(const match of html.matchAll(/(?:src|href)="([^"#]+)"/g)){
      const asset=new URL(match[1],url);
      if(asset.origin!==url.origin)continue;
      const result=await worker.fetch(new Request(asset),{});
      assert.equal(result.status,200,asset.pathname);
    }
  }
});
