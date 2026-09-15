import test from 'node:test';
import assert from 'node:assert/strict';
import JSZip from 'jszip';
import {buildPowerPoint,buildWord,buildBib,exportFilename} from '../src/v2/exports';
import type {Notebook} from '../src/v2/types';
import {mkdir,writeFile} from 'node:fs/promises';
const fixture:Notebook={id:'export-qa',title:'Research export QA',revision:1,updated:'2026-09-11',tags:[],sources:[{id:'paper',title:'Synthetic evaluation',text:'The test achieved 82 percent accuracy.',coverage:'Synthetic fixture, not a real paper',url:'https://example.org/paper'}],selected:['paper'],tools:{Method:'A synthetic method explanation.'},notes:[{id:'note',created:'2026-09-11',text:'Saved note for export.'}],messages:[{role:'assistant',text:'Discussion marker',evidence:[{sourceId:'paper',quote:'The test achieved 82 percent accuracy.',page:2}]}],deck:{title:'Research export QA',theme:'editorial',audience:'Students',sourceIds:['paper'],slides:[{id:'one',title:'A small study tests a three-stage process',bullets:['The test achieved 82 percent accuracy.','This is synthetic test data, not a published result.'],notes:'Speaker note marker',visual:'Input → Analysis → Result'},{id:'two',title:'Evidence has limits',bullets:['Only one dataset was evaluated.','Do not generalize these results.'],notes:'State the limitations clearly.',visual:'One dataset → Limited evidence'},{id:'three',title:'The next experiment should test broader coverage',bullets:['Repeat the evaluation on independent datasets.','Report uncertainty alongside point estimates.'],notes:'These are proposed next steps.',visual:'Replicate → Compare → Review'}]}};
test('exports retain editable slides, notes, evidence, and optional discussion',async()=>{
 const pptx=await buildPowerPoint(fixture);const zip=await JSZip.loadAsync(await pptx.arrayBuffer());
 assert.equal(Object.keys(zip.files).filter(x=>/^ppt\/slides\/slide\d+.xml$/.test(x)).length,3);
 const slide=await zip.file('ppt/slides/slide1.xml')!.async('string');assert.match(slide,/82 percent/);assert.match(slide,/<a:prstGeom prst="rect"/);assert.match(slide,/Analysis/);
 const notes=await zip.file('ppt/notesSlides/notesSlide1.xml')!.async('string');assert.match(notes,/Speaker note marker/);assert.match(notes,/Synthetic evaluation/);assert.match(notes,/https:\/\/example.org\/paper/);
 const docx=await buildWord(fixture,true);const doc=await JSZip.loadAsync(await docx.arrayBuffer());const xml=await doc.file('word/document.xml')!.async('string');for(const text of ['Discussion marker','page 2','Saved note for export','synthetic method explanation'])assert.ok(xml.includes(text));
 const noChat=await JSZip.loadAsync(await (await buildWord(fixture,false)).arrayBuffer());assert.ok(!(await noChat.file('word/document.xml')!.async('string')).includes('Discussion marker'));
 assert.match(buildBib(fixture),/Synthetic evaluation/);assert.equal(exportFilename('研究','pptx'),'研究.pptx');assert.equal(exportFilename('///','docx'),'Research notebook.docx');
 if(process.env.EXPORT_QA==='1'){await mkdir('work/export-qa',{recursive:true});await writeFile('work/export-qa/research.docx',Buffer.from(await docx.arrayBuffer()));await writeFile('work/export-qa/editorial.pptx',Buffer.from(await pptx.arrayBuffer()));for(const theme of ['midnight','botanical'])await writeFile(`work/export-qa/${theme}.pptx`,Buffer.from(await (await buildPowerPoint({...fixture,deck:{...fixture.deck!,theme}})).arrayBuffer()));}
});
test('live deck generation, edit, new version and restoration persist',{skip:process.env.LIVE_DECK!=='1'},async()=>{
 const base=process.env.TEST_URL||'http://127.0.0.1:8787';let cookie='';
 async function req(path:string,body?:any,method=body?'POST':'GET'){const r=await fetch(base+'/api'+path,{method,headers:{'Content-Type':'application/json',Cookie:cookie},body:body?JSON.stringify(body):undefined});const data=await r.json();if(r.headers.get('set-cookie'))cookie=r.headers.get('set-cookie')!.split(';')[0];return {status:r.status,data};}
 const auth=await req('/auth/signup',{name:'Deck QA',email:`deck-${Date.now()}@example.test`,password:crypto.randomUUID()+'Qa!'});assert.equal(auth.status,200);
 const created=await req('/sources',{source:fixture.sources[0]});assert.equal(created.status,200);const id=created.data.id;
 try{
  const first=await req('/ai',{notebookId:id,kind:'deck',count:3,theme:'midnight',audience:'Students'});assert.equal(first.status,200,JSON.stringify(first.data));assert.equal(first.data.notebook.deck.slides.length,3);
  let n=(await req('/notebooks/'+id)).data;assert.equal(n.deck.theme,'midnight');n.deck.slides[0].title='My edited title';n.deck.slides[0].notes='My edited speaker notes';assert.equal((await req('/notebooks/'+id,n,'PUT')).status,200);
  const next=await req('/ai',{notebookId:id,kind:'deck',count:4,theme:'botanical'});assert.equal(next.status,200,JSON.stringify(next.data));assert.equal(next.data.notebook.deck.slides.length,4);assert.equal(next.data.notebook.previousDeck.slides[0].title,'My edited title');
  n=next.data.notebook;[n.deck,n.previousDeck]=[n.previousDeck,n.deck];assert.equal((await req('/notebooks/'+id,n,'PUT')).status,200);
  n=(await req('/notebooks/'+id)).data;assert.equal(n.deck.slides[0].notes,'My edited speaker notes');assert.equal(n.deck.slides.length,3);
  assert.equal((await req('/ai',{notebookId:id,kind:'deck',count:99})).status,400);assert.equal((await req('/notebooks/'+id)).data.deck.slides[0].title,'My edited title');
 }finally{await req('/notebooks/'+id,undefined,'DELETE');await req('/auth/logout',{});}
});
