import test from 'node:test';
import assert from 'node:assert/strict';
const base=process.env.TEST_URL||'http://127.0.0.1:8787';
test('local preview accepts same-origin writes and rejects cross-site writes', async () => {
 const preview=process.env.PREVIEW_URL||'http://127.0.0.1:5173';
 for (const [origin, expected] of [[preview,200],['https://untrusted.example',403]] as const) {
  const response=await fetch(preview+'/api/auth/logout',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:'{}'});
  assert.equal(response.status,expected,await response.text());
 }
});
async function req(path:string,body?:any,cookie='',method?:string){const r=await fetch(base+'/api'+path,{method:method||(body?'POST':'GET'),headers:{'Content-Type':'application/json',Cookie:cookie},body:body?JSON.stringify(body):undefined});return {status:r.status,data:await r.json(),cookie:r.headers.get('set-cookie')?.split(';')[0]||''};}
test('source import is atomic, deduplicated, and validates empty inputs',async()=>{
 const auth=await req('/auth/signup',{name:'Import QA',email:`import-${Date.now()}@example.test`,password:'A-secure-test-'+crypto.randomUUID()});assert.equal(auth.status,200);const cookie=auth.cookie;
 const before=await req('/notebooks',undefined,cookie);
 assert.equal((await req('/sources',{source:{title:'Empty',text:''}},cookie)).status,400);
 assert.equal((await req('/notebooks',undefined,cookie)).data.notebooks.length,before.data.notebooks.length);
 const source={id:'qa-source',title:'QA paper',text:'A test method achieved 82 percent accuracy on 100 examples. These observations are for an integration test.',coverage:'Test fixture'};
 const imported=await req('/sources',{source},cookie);assert.equal(imported.status,200);const id=imported.data.id;
 assert.equal((await req('/sources',{notebookId:id,source:{...source,id:'duplicate'}},cookie)).status,400);
 assert.equal((await req('/notebooks/'+id,undefined,cookie)).data.sources.length,1);
 assert.equal((await req('/resolve',{input:'https://localhost/private'},cookie)).status,400);
 await req('/notebooks/'+id,undefined,cookie,'DELETE');await req('/auth/logout',{},cookie);
});
test('live arXiv import resolves title, abstract and version',{skip:process.env.LIVE_SOURCES!=='1'},async()=>{
 const auth=await req('/auth/signup',{name:'arXiv QA',email:`arxiv-${Date.now()}@example.test`,password:'A-secure-test-'+crypto.randomUUID()});assert.equal(auth.status,200);
 const paper=await req('/resolve',{input:'https://arxiv.org/abs/1706.03762'},auth.cookie);assert.equal(paper.status,200,JSON.stringify(paper.data));assert.match(paper.data.title,/Attention Is All You Need/i);assert.ok(paper.data.abstract.length>100);assert.match(paper.data.url,/1706\.03762/);await req('/auth/logout',{},auth.cookie);
});
test('live summary, cited chat, edited topic prompt and notes survive reopening',{skip:process.env.LIVE_AI!=='1'},async()=>{
 const auth=await req('/auth/signup',{name:'Research QA',email:`research-${Date.now()}@example.test`,password:'A-secure-test-'+crypto.randomUUID()});assert.equal(auth.status,200);const cookie=auth.cookie;
 const source={id:'paper-qa',title:'Synthetic evaluation fixture',text:'This is synthetic test data, not a published paper. Method A achieved accuracy of 82 percent on 100 examples. The baseline achieved accuracy of 70 percent on the same examples. The main limitation is that only one dataset was evaluated. The method uses a linear classifier. A held-out test set was used.',coverage:'Synthetic test fixture'};
 const imported=await req('/sources',{source},cookie);assert.equal(imported.status,200);const id=imported.data.id;
 try{
  const summary=await req('/ai',{notebookId:id,kind:'summary'},cookie);assert.equal(summary.status,200,JSON.stringify(summary.data));assert.ok(summary.data.notebook.summary.overview);
  const chat=await req('/ai',{notebookId:id,kind:'chat',prompt:'What accuracy did Method A achieve? Include an exact supporting quote.'},cookie);assert.equal(chat.status,200,JSON.stringify(chat.data));assert.match(chat.data.result,/82/);assert.ok(chat.data.evidence.length>0);assert.ok(source.text.includes(chat.data.evidence[0].quote));
  const prompt='Explain the linear classifier in two short sentences for a beginner. Quote the source sentence that mentions it.';
  const topic=await req('/ai',{notebookId:id,kind:'tool',toolName:'Linear classifier',prompt},cookie);assert.equal(topic.status,200,JSON.stringify(topic.data));assert.equal(topic.data.notebook.prompts['Linear classifier'],prompt);
  let saved=await req('/notebooks/'+id,undefined,cookie);assert.equal(saved.data.messages.at(-1).text,chat.data.result);assert.equal(saved.data.tools['Linear classifier'],topic.data.result);
  saved=await req('/notebooks/'+id,{...saved.data,notes:[{id:'note-qa',text:topic.data.result,created:new Date().toISOString()}]},cookie,'PUT');assert.equal(saved.status,200);
  const reopened=await req('/notebooks/'+id,undefined,cookie);assert.equal(reopened.data.notes[0].text,topic.data.result);assert.equal(reopened.data.prompts['Linear classifier'],prompt);
  const deselected=await req('/notebooks/'+id,{...reopened.data,selected:[]},cookie,'PUT');assert.equal(deselected.status,200);
  assert.equal((await req('/ai',{notebookId:id,kind:'summary'},cookie)).status,400);
  assert.equal((await req('/notebooks/'+id,undefined,cookie)).data.summary.overview,summary.data.result.overview);
 }finally{await req('/notebooks/'+id,undefined,cookie,'DELETE');await req('/auth/logout',{},cookie);}
});
