import { getSupabaseContext, isSupabaseConfigured } from '@/lib/api/client/supabase'
import articlesJson from '@/lib/data/articles.json'
import { Article, articleSchema } from '@/lib/schemas/article'

interface ArticleRow {
  external_id?: string | null
  id?: string
  slug?: string
  title?: string
  excerpt?: string
  content?: string
  category?: string | null
  author?: string | null
  published_at?: string | null
  publishedAt?: string | null
  image_url?: string | null
  imageUrl?: string | null
  tags?: string[] | null
}

function normalizeArticleRow(row: ArticleRow): Article {
  return articleSchema.parse({
    id: row.external_id ?? row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    content: row.content,
    category: row.category,
    author: row.author,
    publishedAt: row.published_at ?? row.publishedAt,
    imageUrl: row.image_url ?? row.imageUrl,
    tags: row.tags ?? [],
  })
}

async function fetchArticlesFromSupabase(): Promise<Article[] | null> {
  if (!isSupabaseConfigured()) return null

  const { client } = getSupabaseContext()
  if (!client) return null

  try {
    const { data, error } = await client
      .from('articles')
      .select('*')
      .order('published_at', { ascending: false })

    if (error || !data) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('[repo:articles] Supabase error, falling back to JSON:', error)
      }
      return null
    }

    return data.map((row) => normalizeArticleRow(row as ArticleRow))
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('[repo:articles] Unexpected error, falling back to JSON:', error)
    }
    return null
  }
}

export async function getArticles(): Promise<Article[]> {
  const fromDb = await fetchArticlesFromSupabase()
  if (fromDb && fromDb.length > 0) return fromDb

  return articleSchema.array().parse(articlesJson)
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const fromDb = await fetchArticlesFromSupabase()
  if (fromDb) {
    const match = fromDb.find((a) => a.slug === slug)
    if (match) return match
  }

  const fromJson = articleSchema.array().parse(articlesJson)
  return fromJson.find((a) => a.slug === slug) ?? null
}
