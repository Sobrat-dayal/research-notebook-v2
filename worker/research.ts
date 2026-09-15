import {normalizeText} from '../shared/sources';
export function researchContext(sources:any[],budget=180000){
 const perSource=Math.min(60000,Math.floor(budget/sources.length));
 const coverage=sources.map(s=>({sourceId:s.id,title:s.title,charactersRead:Math.min(s.text.length,perSource),totalCharacters:s.text.length,truncated:s.text.length>perSource,coverage:s.coverage}));
 const context=sources.map((s,i)=>`SOURCE ${s.id}\nTITLE ${s.title}\nCOVERAGE ${s.coverage}${coverage[i].truncated?' (only the beginning is included due to context limits)':''}\n${s.text.slice(0,perSource)}`).join('\n\n');
 return {context,coverage};
}
export function verifiedEvidence(e:any,sources:any[]){
 const source=sources.find(s=>s.id===e?.sourceId);if(!source||typeof e?.quote!=='string'||e.quote.trim().length<12)return null;
 const quote=normalizeText(e.quote);if(!normalizeText(source.text).includes(quote))return null;
 const page=source.pages?.find((p:any)=>normalizeText(p.text).includes(quote))?.page;
 return {sourceId:source.id,quote:e.quote.trim(),...(page?{page}:{})};
}
export function validateResearch(result:any,sources:any[]){
 for(const key of ['contributions','methodology','results','limitations','implications'])for(const f of result[key]){const evidence=verifiedEvidence(f.evidence,sources);if(evidence)f.evidence=evidence;else delete f.evidence;}
 result.metrics=result.metrics.filter((m:any)=>{if(!verifiedEvidence(m,sources)||!Number.isFinite(m.value))return false;const numbers=m.quote.replace(/(?<=\d),(?=\d{3}\b)/g,'').match(/[-+]?\d+(?:\.\d+)?/g)||[];return numbers.some((v:string)=>Number(v)===m.value);});
 result.references=result.references.map((r:any)=>{if(r.url&&(!/^https?:\/\//i.test(r.url)||!sources.some(s=>s.text.includes(r.url))))delete r.url;return r;});
 return result;
}
