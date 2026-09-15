import test from 'node:test';
import assert from 'node:assert/strict';
import {sourceSchema,isDuplicate,validateSourceAddition} from '../shared/sources';
import {readDocument,extractPdfText} from '../src/v2/importing';
import {researchContext,verifiedEvidence,validateResearch} from '../worker/research';
const source={id:'paper-a',title:'Example paper',text:'The method achieves accuracy of 82 percent on a test set of 100 examples.',coverage:'Test text',pages:[{page:2,text:'The method achieves accuracy of 82 percent on a test set of 100 examples.'}]};
test('text imports validate content, size, file type and duplicate sources',async()=>{
 const result=await readDocument(new File([source.text],'NOTES.TXT',{type:'text/plain'}));assert.equal(result.text,source.text);assert.equal(result.title,'NOTES');
 await assert.rejects(()=>readDocument(new File(['\0'.repeat(100)],'notes.txt')),/binary/);
 await assert.rejects(()=>readDocument(new File(['short'],'notes.txt')));
 await assert.rejects(()=>readDocument(new File([source.text],'notes.exe')),/Choose a PDF/);
 await assert.rejects(()=>readDocument(new File(['not a PDF'],'paper.PDF')),/not a valid PDF/);
 assert.ok(isDuplicate([source],{text:source.text.replaceAll(' ','  ')}));
 assert.throws(()=>validateSourceAddition([source],source),/already/);
 assert.throws(()=>validateSourceAddition(Array.from({length:12},()=>source),{...source,text:'Another sufficiently lengthy source'}),/12 sources/);
 assert.equal(sourceSchema.safeParse({...source,url:'javascript:alert(1)'}).success,false);
});
test('PDF extraction preserves page numbers and flags partly scanned documents',async()=>{
 const progress:string[]=[];const result=await extractPdfText({numPages:2,getPage:async(i:number)=>({getTextContent:async()=>({items:i===1?[{str:source.text,hasEOL:true},{str:'A second line of research.',hasEOL:true}]:[]}),cleanup(){}})},x=>progress.push(x));
 assert.equal(result.pages.length,2);assert.match(result.text,/\[Page 1\]/);assert.match(result.coverage,/1 pages have little/);assert.equal(progress.length,2);
 await assert.rejects(()=>extractPdfText({numPages:121}),/120 pages/);
 await assert.rejects(()=>extractPdfText({numPages:1,getPage:async()=>({getTextContent:async()=>({items:[]})})}),/OCR/);
});
test('actual PDF parsing extracts expected source text',async()=>{
 const content='BT /F1 12 Tf 50 750 Td ('+source.text+') Tj ET';
 const objects=['<< /Type /Catalog /Pages 2 0 R >>','<< /Type /Pages /Kids [3 0 R] /Count 1 >>','<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>','<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',`<< /Length ${content.length} >>\nstream\n${content}\nendstream`];
 let pdf='%PDF-1.4\n';const offsets=[0];for(const [i,obj] of objects.entries()){offsets.push(pdf.length);pdf+=`${i+1} 0 obj\n${obj}\nendobj\n`;}const xref=pdf.length;pdf+='xref\n0 6\n0000000000 65535 f \n'+offsets.slice(1).map(o=>String(o).padStart(10,'0')+' 00000 n \n').join('')+`trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
 const {getDocument}=await import('pdfjs-dist/legacy/build/pdf.mjs');const loading=getDocument({data:new TextEncoder().encode(pdf),useSystemFonts:true});
 try{const result=await extractPdfText(await loading.promise);assert.match(result.text,/accuracy of 82 percent/);}finally{await loading.destroy();}
});
test('research context distributes the budget across every selected paper',()=>{
 const sources=Array.from({length:12},(_,i)=>({...source,id:'p'+i,text:'x'.repeat(70000)}));const {coverage}=researchContext(sources);assert.equal(coverage.length,12);assert.ok(coverage.every(c=>c.charactersRead===15000&&c.truncated));
});
test('evidence rejects invented quotes and finds actual pages',()=>{
 assert.equal(verifiedEvidence({sourceId:'paper-a',quote:'This quote never appeared.'},[source]),null);
 const valid=verifiedEvidence({sourceId:'paper-a',quote:source.text,page:99},[source]);assert.equal(valid?.page,2);
 const result=validateResearch({contributions:[{title:'x',text:'x',evidence:{sourceId:'paper-a',quote:'invented source sentence'}}],methodology:[],results:[],limitations:[],implications:[],references:[{title:'fake',url:'https://invented.example/paper'}],metrics:[{label:'Wrong substring',value:8,unit:'percent',sourceId:'paper-a',quote:source.text},{label:'Accuracy',value:82,unit:'percent',sourceId:'paper-a',quote:source.text}]},[source]);
 assert.equal(result.contributions[0].evidence,undefined);assert.equal(result.references[0].url,undefined);assert.deepEqual(result.metrics.map(m=>m.value),[82]);
});
