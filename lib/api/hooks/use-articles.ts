import { getArticleBySlug, getArticles } from '@/lib/api/repositories/articles-repository'
import { Article } from '@/lib/schemas/article'
import { useQuery } from '@tanstack/react-query'

export function useArticlesQuery() {
  return useQuery<Article[]>({
    queryKey: ['articles'],
    queryFn: () => getArticles(),
  })
}

export function useArticleQuery(slug: string | undefined) {
  return useQuery<Article | null>({
    queryKey: ['article', slug],
    queryFn: () => (slug ? getArticleBySlug(slug) : Promise.resolve(null)),
    enabled: Boolean(slug),
  })
}
