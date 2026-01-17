import { z } from 'zod'

export const articleSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  excerpt: z.string(),
  content: z.string(),
  category: z.string().optional(),
  author: z.string().optional(),
  publishedAt: z.string().optional(),
  imageUrl: z.string().optional(),
  tags: z.array(z.string()).default([]),
})

export type Article = z.infer<typeof articleSchema>
