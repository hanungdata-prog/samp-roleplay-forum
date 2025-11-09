import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, MessageSquare, Eye, Clock, User, ThumbsUp, ThumbsDown, Reply, Pin, Lock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'

interface PageProps {
  params: { threadId: string }
}

async function getThread(threadId: string) {
  const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/threads/${threadId}`, {
    cache: 'no-store',
  })

  if (!response.ok) {
    return null
  }

  const data = await response.json()
  return data.data
}

export default async function ThreadPage({ params }: PageProps) {
  const thread = await getThread(params.threadId)

  if (!thread) {
    return <div>Thread not found</div>
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Link href={`/forums/${thread.category.id}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to {thread.category.name}
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-3">
                  {thread.isPinned && (
                    <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                      <Pin className="h-3 w-3 mr-1" />
                      Pinned
                    </Badge>
                  )}
                  {thread.isLocked && (
                    <Badge variant="outline" className="text-red-600 border-red-600">
                      <Lock className="h-3 w-3 mr-1" />
                      Locked
                    </Badge>
                  )}
                  <Badge
                    variant="secondary"
                    style={{ backgroundColor: `${thread.category.color}20`, color: thread.category.color }}
                  >
                    {thread.category.name}
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
                <CardTitle className="text-2xl mb-2">{thread.title}</CardTitle>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    Started by {thread.author.profile?.playerName || thread.author.name}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDistanceToNow(new Date(thread.createdAt), { addSuffix: true })}
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {thread.views} views
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageSquare className="h-3 w-3" />
                    {thread._count.posts} replies
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Posts */}
      <div className="space-y-4">
        {/* First Post (Thread Content) */}
        <Card>
          <CardContent className="p-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <Avatar className="w-12 h-12">
                  <AvatarImage
                    src={thread.author.profile?.avatar}
                    alt={thread.author.name}
                  />
                  <AvatarFallback>
                    {thread.author.name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-3">
                  <div>
                    <div className="font-medium">
                      {thread.author.profile?.playerName || thread.author.name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(thread.createdAt), { addSuffix: true })}
                    </div>
                  </div>
                </div>
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <ReactMarkdown>{thread.content}</ReactMarkdown>
                </div>
                {thread.author.profile?.signature && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="text-sm text-muted-foreground italic">
                      {thread.author.profile.signature}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Replies */}
        {thread.posts.map((post: any, index: number) => (
          <Card key={post.id}>
            <CardContent className="p-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <Avatar className="w-10 h-10">
                    <AvatarImage
                      src={post.author.profile?.avatar}
                      alt={post.author.name}
                    />
                    <AvatarFallback>
                      {post.author.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div>
                        <div className="font-medium">
                          {post.author.profile?.playerName || post.author.name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <ThumbsUp className="h-4 w-4" />
                        {post.votes.filter((v: any) => v.type === 'UP').length}
                      </Button>
                      <Button variant="ghost" size="sm">
                        <ThumbsDown className="h-4 w-4" />
                        {post.votes.filter((v: any) => v.type === 'DOWN').length}
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Reply className="h-4 w-4" />
                        Reply
                      </Button>
                    </div>
                  </div>
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <ReactMarkdown>{post.content}</ReactMarkdown>
                  </div>
                  {post.author.profile?.signature && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="text-sm text-muted-foreground italic">
                        {post.author.profile.signature}
                      </div>
                    </div>
                  )}

                  {/* Nested Replies */}
                  {post.replies && post.replies.length > 0 && (
                    <div className="mt-4 space-y-3 border-l-2 border-muted pl-4">
                      {post.replies.map((reply: any) => (
                        <div key={reply.id} className="flex gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarImage
                              src={reply.author.profile?.avatar}
                              alt={reply.author.name}
                            />
                            <AvatarFallback>
                              {reply.author.name?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <div className="font-medium text-sm">
                                  {reply.author.profile?.playerName || reply.author.name}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
                                <Button variant="ghost" size="sm">
                                  <ThumbsUp className="h-3 w-3" />
                                  {reply.votes.filter((v: any) => v.type === 'UP').length}
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Reply className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                            <div className="prose prose-xs max-w-none dark:prose-invert">
                              <ReactMarkdown>{reply.content}</ReactMarkdown>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Reply Form */}
      {!thread.isLocked && (
        <Card>
          <CardHeader>
            <CardTitle>Reply to Thread</CardTitle>
            <CardDescription>
              Share your thoughts on this discussion
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <textarea
                className="w-full min-h-32 p-3 border rounded-md resize-none"
                placeholder="Write your reply..."
                required
              />
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  You can use Markdown for formatting
                </div>
                <Button type="submit">Post Reply</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {thread.isLocked && (
        <Card>
          <CardContent className="p-6 text-center">
            <Lock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">Thread is Locked</h3>
            <p className="text-muted-foreground">
              This thread has been locked and no new replies can be posted.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}