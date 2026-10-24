import test from 'node:test';
import assert from 'node:assert/strict';
import {STAGES,stageFor,stageIndex} from '../dist/catvolution/stages.mjs';
import {readFile} from 'node:fs/promises';
test('every merge milestone has a unique named cat and later values retain the final form',()=>{assert.equal(STAGES.length,11);assert.equal(new Set(STAGES.map(s=>s.name)).size,11);STAGES.forEach((s,i)=>{assert.equal(s.value,2**(i+1));assert.equal(stageIndex(s.value),i);assert.equal(stageFor(s.value).name,s.name);});assert.equal(stageFor(4096).name,'Cosmic Mochi');});
test('the generated transparent cat sheet is packaged as an actual WebP asset',async()=>{const image=await readFile(new URL('../dist/catvolution/cats/evolution-atlas.webp',import.meta.url));assert.equal(image.toString('ascii',0,4),'RIFF');assert.equal(image.toString('ascii',8,12),'WEBP');assert.ok(image.length>10000);});
