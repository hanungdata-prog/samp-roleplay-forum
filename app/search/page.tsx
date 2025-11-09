'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { MessageSquare, Search, User, Clock, Eye, Loader2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'

interface SearchResult {
  threads: any[]
  posts: any[]
  users: any[]
  total: {
    threads: number
    posts: number
    users: number
  }
  pagination: any
}

export default function SearchPage() {
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('query') || '')
  const [type, setType] = useState(searchParams.get('type') || 'all')
  const [results, setResults] = useState<SearchResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)

  const performSearch = async (searchQuery: string, searchType: string, searchPage: number = 1) => {
    if (!searchQuery.trim()) return

    setLoading(true)
    try {
      const params = new URLSearchParams({
        query: searchQuery,
        type: searchType,
        page: searchPage.toString(),
        limit: '20',
      })

      const response = await fetch(`/api/search?${params}`)
      const data = await response.json()

      if (data.success) {
        setResults(data.data)
        setPage(searchPage)
      }
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (query) {
      performSearch(query, type)
    }
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    performSearch(query, type, 1)
  }

  const handleTypeChange = (newType: string) => {
    setType(newType)
    if (query) {
      performSearch(query, newType, 1)
    }
  }

  const handlePageChange = (newPage: number) => {
    performSearch(query, type, newPage)
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Search Forum</h1>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search threads, posts, or users..."
              className="pl-10"
            />
          </div>
          <Select value={type} onValueChange={handleTypeChange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="threads">Threads</SelectItem>
              <SelectItem value="posts">Posts</SelectItem>
              <SelectItem value="users">Users</SelectItem>
            </SelectContent>
          </Select>
          <Button type="submit" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            Search
          </Button>
        </form>

        {/* Results Summary */}
        {results && (
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>Found {results.total.threads + results.total.posts + results.total.users} results</span>
            <div className="flex gap-4">
              <span>{results.total.threads} threads</span>
              <span>{results.total.posts} posts</span>
              <span>{results.total.users} users</span>
            </div>
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      )}

      {/* Results */}
      {results && !loading && (
        <Tabs value={type} onValueChange={handleTypeChange}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="threads">
              Threads ({results.total.threads})
            </TabsTrigger>
            <TabsTrigger value="posts">
              Posts ({results.total.posts})
            </TabsTrigger>
            <TabsTrigger value="users">
              Users ({results.total.users})
            </TabsTrigger>
          </TabsList>

          {/* All Results */}
          <TabsContent value="all" className="space-y-6">
            {/* Threads */}
            {results.threads.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-medium">Threads</h3>
                {results.threads.map((thread: any) => (
                  <Card key={thread.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="secondary">
                              {thread.category.name}
                            </Badge>
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
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Posts */}
            {results.posts.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-medium">Posts</h3>
                {results.posts.map((post: any) => (
                  <Card key={post.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <Link
                            href={`/threads/${post.thread.id}`}
                            className="font-medium hover:text-primary transition-colors"
                          >
                            {post.thread.title}
                          </Link>
                          <div className="text-sm text-muted-foreground mb-2 line-clamp-3">
                            <ReactMarkdown>{post.content}</ReactMarkdown>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {post.author.profile?.playerName || post.author.name}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Users */}
            {results.users.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-medium">Users</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {results.users.map((user: any) => (
                    <Card key={user.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage
                              src={user.profile?.avatar}
                              alt={user.name}
                            />
                            <AvatarFallback>
                              {user.name?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium">
                              {user.profile?.playerName || user.name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {user.profile?.bio || 'No bio available'}
                            </div>
                            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                              <span>{user.profile?.totalPosts || 0} posts</span>
                              <span>{user.profile?.reputation || 0} reputation</span>
                            </div>
                          </div>
                          <Link href={`/users/${user.id}`}>
                            <Button variant="ghost" size="sm">
                              View Profile
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Individual type tabs would be similar but show only that type */}
          <TabsContent value="threads">
            {results.threads.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No threads found matching your search.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {results.threads.map((thread: any) => (
                  <Card key={thread.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
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
                              <Clock className="h-3 w-3" />
                              {formatDistanceToNow(new Date(thread.createdAt), { addSuffix: true })}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="posts">
            {results.posts.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No posts found matching your search.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {results.posts.map((post: any) => (
                  <Card key={post.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <Link
                            href={`/threads/${post.thread.id}`}
                            className="font-medium hover:text-primary transition-colors"
                          >
                            {post.thread.title}
                          </Link>
                          <div className="text-sm text-muted-foreground mb-2 line-clamp-3">
                            <ReactMarkdown>{post.content}</ReactMarkdown>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {post.author.profile?.playerName || post.author.name}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="users">
            {results.users.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No users found matching your search.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {results.users.map((user: any) => (
                  <Card key={user.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-12 h-12">
                          <AvatarImage
                            src={user.profile?.avatar}
                            alt={user.name}
                          />
                          <AvatarFallback>
                            {user.name?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium">
                            {user.profile?.playerName || user.name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {user.profile?.bio || 'No bio available'}
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                            <span>{user.profile?.totalPosts || 0} posts</span>
                            <span>{user.profile?.reputation || 0} reputation</span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-3">
                        <Link href={`/users/${user.id}`}>
                          <Button variant="outline" size="sm" className="w-full">
                            View Profile
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}

      {/* Pagination */}
      {results && !loading && results.pagination && type !== 'all' && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            disabled={page === 1}
            onClick={() => handlePageChange(page - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {results.pagination.pages}
          </span>
          <Button
            variant="outline"
            disabled={page === results.pagination.pages}
            onClick={() => handlePageChange(page + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}