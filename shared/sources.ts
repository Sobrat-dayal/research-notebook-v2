import {z} from 'zod';
export const sourceSchema=z.object({
 id:z.string().min(1).max(100),title:z.string().trim().min(1).max(250),text:z.string().trim().min(20,'A source needs at least 20 characters of readable text.').max(600000),
 url:z.string().url().refine(v=>/^https?:\/\//i.test(v)).optional(),authors:z.string().max(4000).optional(),coverage:z.string().min(1).max(1000),
 pages:z.array(z.object({page:z.number().int().min(1).max(120),text:z.string().max(600000)})).max(120).optional(),
});
export const normalizeText=(text:string)=>text.normalize('NFKC').replace(/\s+/g,' ').trim();
export function isDuplicate(sources:{text:string;url?:string}[],source:{text:string;url?:string}){return sources.some(s=>(!!s.url&&s.url===source.url)||normalizeText(s.text)===normalizeText(source.text));}
export function validateSourceAddition(sources:{text:string;url?:string}[],input:unknown){
 const source=sourceSchema.parse(input);if(sources.length>=12)throw new Error('A notebook supports up to 12 sources. Create another notebook for more papers.');
 if(isDuplicate(sources,source))throw new Error('This source is already in this notebook.');
 if(sources.reduce((sum,s)=>sum+s.text.length,source.text.length)>1800000)throw new Error('This notebook has reached its text limit. Create another notebook.');
 return source;
}
