import { z } from 'zod';

/** Bloques de contenido tipados que edita el panel y renderiza la web. */
export const blockSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('h2'), text: z.string().min(1), id: z.string().optional() }),
  z.object({ type: z.literal('h3'), text: z.string().min(1) }),
  z.object({ type: z.literal('p'), text: z.string().min(1) }),
  /** Respuesta directa de 40–60 palabras al inicio de una sección (GEO). */
  z.object({ type: z.literal('answer'), text: z.string().min(1) }),
  z.object({
    type: z.literal('list'),
    ordered: z.boolean().default(false),
    items: z.array(z.string()),
  }),
  z.object({ type: z.literal('quote'), text: z.string(), cite: z.string().optional() }),
  z.object({ type: z.literal('callout'), title: z.string(), text: z.string() }),
  z.object({
    type: z.literal('image'),
    src: z.string(),
    alt: z.string().min(1),
    width: z.number().int().positive(),
    height: z.number().int().positive(),
    caption: z.string().optional(),
  }),
]);
export type Block = z.infer<typeof blockSchema>;
export const blocksSchema = z.array(blockSchema);

/** Utilidad: cuenta palabras útiles de una lista de bloques (mínimo 800 en landings). */
export function countWords(blocks: Block[]): number {
  return blocks.reduce((total, b) => {
    const text =
      b.type === 'list'
        ? b.items.join(' ')
        : b.type === 'image'
          ? ''
          : b.type === 'callout'
            ? `${b.title} ${b.text}`
            : b.text;
    return total + text.split(/\s+/).filter(Boolean).length;
  }, 0);
}
