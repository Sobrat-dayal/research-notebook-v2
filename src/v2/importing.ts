import type {Source} from './types';
import {sourceSchema} from '../../shared/sources';
export async function extractPdfText(doc:any,onProgress:(value:string)=>void=()=>{}){
 if(doc.numPages>120)throw new Error('Please use a PDF of 120 pages or fewer.');
 let text='';const pages:{page:number;text:string}[]=[];let sparse=0;
 for(let i=1;i<=doc.numPages;i++){
  onProgress(`Reading PDF page ${i} of ${doc.numPages}`);
  const page=await doc.getPage(i);const content=await page.getTextContent();
  const pageText=content.items.map((x:any)=>typeof x.str==='string'?x.str+(x.hasEOL?'\n':' '):'').join('').trim();
  if(pageText.length<30)sparse++;pages.push({page:i,text:pageText});text+=`\n[Page ${i}]\n${pageText}`;
  if(text.length>600000)throw new Error('This document is too long. Import a section at a time.');
  page.cleanup?.();
 }
 if(pages.reduce((sum,p)=>sum+p.text.length,0)<50)throw new Error('This PDF contains too little readable text. It may be scanned. Use OCR first or paste its text.');
 return {text,pages,coverage:`PDF text extracted from ${doc.numPages} pages; figures are not extracted.${sparse?` ${sparse} pages have little or no readable text and may need OCR.`:''}`};
}
export async function readDocument(file:File,onProgress:(value:string)=>void=()=>{}):Promise<Source>{
 if(file.size>12*1024*1024)throw new Error('Please choose a file smaller than 12 MB.');
 if(!/\.(pdf|txt|md)$/i.test(file.name))throw new Error('Choose a PDF, TXT or Markdown file.');
 const title=file.name.replace(/\.(pdf|txt|md)$/i,'').slice(0,250)||'Uploaded document';
 if(/\.pdf$/i.test(file.name)){
  const bytes=new Uint8Array(await file.arrayBuffer());
  if(!new TextDecoder().decode(bytes.slice(0,1024)).includes('%PDF-'))throw new Error('This file is not a valid PDF. Download it again or paste its text.');
  const pdfjs=await import('pdfjs-dist');
  pdfjs.GlobalWorkerOptions.workerSrc=new URL('pdfjs-dist/build/pdf.worker.min.mjs',import.meta.url).href;
  const loading=pdfjs.getDocument({data:bytes});
  try{return sourceSchema.parse({id:crypto.randomUUID(),title,...await extractPdfText(await loading.promise,onProgress)}) as Source;}
  catch(e:any){if(e.name==='PasswordException')throw new Error('This PDF is password protected. Upload an unlocked copy.');if(e.name==='InvalidPDFException')throw new Error('This PDF is damaged or unsupported. Try another copy.');throw e;}
  finally{await loading.destroy();}
 }
 const text=await file.text();if(text.includes('\0'))throw new Error('This file contains binary data. Please upload a readable text file.');
 return sourceSchema.parse({id:crypto.randomUUID(),title,text,coverage:'Uploaded text'}) as Source;
}

