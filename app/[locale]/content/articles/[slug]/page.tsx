'use client'

import Image from 'next/image'
import { FavoriteButton } from '@/components/shared/favorite-button'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useArticleQuery } from '@/lib/api/hooks/use-articles'
import { ArrowLeft, Calendar, Tag, User } from 'lucide-react'
import Link from 'next/link'
import { use } from 'react'

export default function ArticleDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const {
    data: article,
    isLoading,
    isError,
  } = useArticleQuery(slug)

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-base" style={{ color: 'var(--deep-grey)' }}>
          Loading article...
        </p>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold" style={{ color: 'var(--kmed-navy)' }}>
            We couldn’t load this article
          </h1>
          <p className="text-base" style={{ color: 'var(--deep-grey)' }}>
            Please try again in a moment.
          </p>
          <Link href="/content">
            <Button>Back to Content Hub</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold" style={{ color: 'var(--kmed-navy)' }}>
            Article Not Found
          </h1>
          <Link href="/content">
            <Button>Back to Content Hub</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--soft-grey)' }}>
      <div className="container mx-auto max-w-4xl px-4 sm:px-6 py-16">
        <Link href="/content">
          <Button variant="ghost" className="mb-8">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Content Hub
          </Button>
        </Link>

        <Card className="overflow-hidden bg-white border-[var(--border-grey)]">
          {/* Article Header */}
          <div className="relative h-96 overflow-hidden">
            <Image
              src={article.imageUrl || "/placeholder.svg"}
              alt={article.title}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="inline-block px-3 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: 'var(--kmed-teal)', color: 'white' }}>
                  {article.category ?? 'General'}
                </div>
                <FavoriteButton
                  item={{
                    id: article.id,
                    type: 'article',
                    title: article.title,
                    slug: article.slug,
                    category: article.category,
                  }}
                  showLabel
                />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 text-balance">
                {article.title}
              </h1>
              <div className="flex flex-wrap gap-4 text-sm text-gray-300">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {article.author ?? 'K-MedTour Team'}
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {article.publishedAt ?? '—'}
                </div>
              </div>
            </div>
          </div>

          {/* Article Content */}
          <div className="p-8 md:p-12">
            <div className="prose max-w-none">
              <p className="text-xl leading-relaxed mb-8" style={{ color: 'var(--deep-grey)' }}>
                {article.excerpt}
              </p>

              <div className="text-base leading-relaxed space-y-4" style={{ color: 'var(--deep-grey)' }}>
                {article.content.split('\n\n').map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div className="mt-12 pt-8 border-t" style={{ borderColor: 'var(--border-grey)' }}>
              <div className="flex items-center gap-2 mb-4">
                <Tag className="h-4 w-4" style={{ color: 'var(--kmed-blue)' }} />
                <span className="text-sm font-semibold" style={{ color: 'var(--kmed-navy)' }}>
                  Tags:
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {(article.tags ?? []).map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-full text-sm"
                    style={{ backgroundColor: 'var(--soft-grey)', color: 'var(--deep-grey)' }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* CTA */}
        <div className="mt-12 p-8 rounded-2xl text-center" style={{ backgroundColor: 'var(--kmed-blue)' }}>
          <h3 className="text-2xl font-bold text-white mb-4">
            Ready to Start Your Medical Journey?
          </h3>
          <p className="text-lg text-white/90 mb-6">
            Get personalized clinic recommendations in minutes
          </p>
          <Link href="/patient-intake">
            <Button size="lg" className="bg-white hover:bg-gray-100" style={{ color: 'var(--kmed-blue)' }}>
              Get Started Free
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
