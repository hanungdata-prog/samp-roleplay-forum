import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import Link from 'next/link'
import { MessageSquare, Eye, Clock, User, Search, ArrowLeft } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface PageProps {
  params: { categoryId: string }
  searchParams: { page?: string; search?: string; sortBy?: string; sortOrder?: string }
}

async function getCategory(categoryId: string) {
  const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/categories/${categoryId}`, {
    cache: 'no-store',
  })

  if (!response.ok) {
    return null
  }

  const data = await response.json()
  return data.data
}

async function getThreads(categoryId: string, searchParams: any) {
  const params = new URLSearchParams({
    categoryId,
    page: searchParams.page || '1',
    limit: '20',
    ...(searchParams.search && { search: searchParams.search }),
    ...(searchParams.sortBy && { sortBy: searchParams.sortBy }),
    ...(searchParams.sortOrder && { sortOrder: searchParams.sortOrder }),
  })

  const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/threads?${params}`, {
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error('Failed to fetch threads')
  }

  const data = await response.json()
  return data.data
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const [category, threadsData] = await Promise.all([
    getCategory(params.categoryId),
    getThreads(params.categoryId, searchParams),
  ])

  if (!category) {
    return <div>Category not found</div>
  }

  const { threads, pagination } = threadsData

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Link href="/forums">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Forums
            </Button>
          </Link>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg"
              style={{ backgroundColor: category.color }}
            >
              {category.icon || '📁'}
            </div>
            <div>
              <h1 className="text-3xl font-bold">{category.name}</h1>
              <p className="text-muted-foreground">{category.description}</p>
            </div>
          </div>
          <Link href={`/create-thread?category=${category.id}`}>
            <Button>New Thread</Button>
          </Link>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <form className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                name="search"
                placeholder="Search threads..."
                className="pl-10"
                defaultValue={searchParams.search}
              />
            </div>
            <Select name="sortBy" defaultValue={searchParams.sortBy || 'createdAt'}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt">Latest</SelectItem>
                <SelectItem value="updatedAt">Updated</SelectItem>
                <SelectItem value="views">Views</SelectItem>
              </SelectContent>
            </Select>
            <Button type="submit">Search</Button>
          </form>
        </div>
      </div>

      {/* Sticky Threads */}
      {threads.some((thread: any) => thread.isPinned) && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Pinned Threads
          </h3>
          {threads
            .filter((thread: any) => thread.isPinned)
            .map((thread: any) => (
              <Card key={thread.id} className="border-l-4 border-l-yellow-500">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                          Pinned
                        </Badge>
                        {thread.tags.map((threadTag: any) => (
                          <Badge
                            key={threadTag.tag.id}
                            variant="secondary"
                            style={{ backgroundColor: `${threadTag.tag.color}20`, color: threadTag.tag.color }}
                          >
                            {threadTag.tag.name}
                          </Badge>
                        ))}
                      </div>
                      <Link
                        href={`/threads/${thread.id}`}
                        className="text-lg font-medium hover:text-primary transition-colors"
                      >
                        {thread.title}
                      </Link>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {thread.author.profile?.playerName || thread.author.name}
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          {thread._count.posts} replies
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {thread.views} views
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(new Date(thread.createdAt), { addSuffix: true })}
                        </div>
                      </div>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      <div className="w-8 h-8 rounded-full overflow-hidden">
                        <img
                          src={thread.author.profile?.avatar || '/default-avatar.png'}
                          alt={thread.author.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      )}

      {/* Regular Threads */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Threads {pagination.total > 0 && `(${pagination.total})`}
        </h3>

        {threads.filter((thread: any) => !thread.isPinned).length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No threads found</h3>
              <p className="text-muted-foreground mb-4">
                {searchParams.search
                  ? 'No threads match your search criteria.'
                  : 'Be the first to start a discussion in this category!'}
              </p>
              {!searchParams.search && (
                <Link href={`/create-thread?category=${category.id}`}>
                  <Button>Create First Thread</Button>
                </Link>
              )}
            </CardContent>
          </Card>
        )}

        {threads
          .filter((thread: any) => !thread.isPinned)
          .map((thread: any) => (
            <Card key={thread.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      {thread.tags.map((threadTag: any) => (
                        <Badge
                          key={threadTag.tag.id}
                          variant="secondary"
                          style={{ backgroundColor: `${threadTag.tag.color}20`, color: threadTag.tag.color }}
                        >
                          {threadTag.tag.name}
                        </Badge>
                      ))}
                    </div>
                    <Link
                      href={`/threads/${thread.id}`}
                      className="text-lg font-medium hover:text-primary transition-colors"
                    >
                      {thread.title}
                    </Link>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {thread.author.profile?.playerName || thread.author.name}
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        {thread._count.posts} replies
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {thread.views} views
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(thread.createdAt), { addSuffix: true })}
                      </div>
                    </div>
                  </div>
                  <div className="ml-4 flex-shrink-0">
                    <div className="w-8 h-8 rounded-full overflow-hidden">
                      <img
                        src={thread.author.profile?.avatar || '/default-avatar.png'}
                        alt={thread.author.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Link href={`/forums/${params.categoryId}?page=${Math.max(1, pagination.page - 1)}`}>
            <Button variant="outline" disabled={pagination.page === 1}>
              Previous
            </Button>
          </Link>
          <span className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.pages}
          </span>
          <Link href={`/forums/${params.categoryId}?page=${Math.min(pagination.pages, pagination.page + 1)}`}>
            <Button variant="outline" disabled={pagination.page === pagination.pages}>
              Next
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}