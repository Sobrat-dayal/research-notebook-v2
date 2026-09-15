import {z} from 'zod';
export const slideSchema=z.object({
  id:z.string().optional(),
  title:z.string().trim().min(1).max(100),
  bullets:z.array(z.string().trim().min(1).max(180)).max(4),
  notes:z.string().max(10000),
  visual:z.string().max(160),
});
export const savedDeckSchema=z.object({
  title:z.string().trim().min(1).max(250),
  theme:z.enum(['editorial','midnight','botanical']),
  audience:z.string().max(100),
  slides:z.array(slideSchema).min(1).max(15),
}).passthrough();
