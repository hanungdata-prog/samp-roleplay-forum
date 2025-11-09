import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MessageSquare, ThumbsUp, Calendar, MapPin, Globe, Gamepad2, Users, Clock, Award } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'

interface PageProps {
  params: { userId: string }
}

async function getUser(userId: string) {
  const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/users/${userId}?includeStats=true`, {
    cache: 'no-store',
  })

  if (!response.ok) {
    return null
  }

  const data = await response.json()
  return data.data
}

export default async function UserProfilePage({ params }: PageProps) {
  const user = await getUser(params.userId)

  if (!user) {
    return <div>User not found</div>
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-500 text-white'
      case 'MODERATOR':
        return 'bg-blue-500 text-white'
      default:
        return 'bg-gray-500 text-white'
    }
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/forums">
          <Button variant="ghost" size="sm">
            ← Back to Forums
          </Button>
        </Link>
      </div>

      {/* Profile Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-6">
            <div className="flex-shrink-0">
              <Avatar className="w-24 h-24">
                <AvatarImage
                  src={user.profile?.avatar}
                  alt={user.name}
                />
                <AvatarFallback className="text-2xl">
                  {user.name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold">
                  {user.profile?.playerName || user.name}
                </h1>
                <Badge className={getRoleColor(user.role)}>
                  {user.role}
                </Badge>
              </div>
              <p className="text-muted-foreground mb-4">
                {user.profile?.bio || 'No bio available'}
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">{user.profile?.totalPosts || 0}</div>
                  <div className="text-sm text-muted-foreground">Posts</div>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">{user.profile?.totalLikes || 0}</div>
                  <div className="text-sm text-muted-foreground">Likes</div>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">{user.profile?.reputation || 0}</div>
                  <div className="text-sm text-muted-foreground">Reputation</div>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">{user._count?.threads || 0}</div>
                  <div className="text-sm text-muted-foreground">Threads</div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                {user.profile?.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {user.profile.location}
                  </div>
                )}
                {user.profile?.website && (
                  <div className="flex items-center gap-1">
                    <Globe className="h-4 w-4" />
                    <a
                      href={user.profile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Website
                    </a>
                  </div>
                )}
                {user.profile?.discord && (
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {user.profile.discord}
                  </div>
                )}
                {user.profile?.steam && (
                  <div className="flex items-center gap-1">
                    <Gamepad2 className="h-4 w-4" />
                    {user.profile.steam}
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Game Character Info */}
      {user.profile?.playerName && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gamepad2 className="h-5 w-5" />
              Game Character
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Character Name</div>
                <div className="font-medium">{user.profile.playerName}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Level</div>
                <div className="font-medium">{user.profile.playerLevel || 'N/A'}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Money</div>
                <div className="font-medium">${user.profile.playerMoney || '0'}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Activity Tabs */}
      <Tabs defaultValue="threads" className="space-y-4">
        <TabsList>
          <TabsTrigger value="threads">Threads</TabsTrigger>
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="threads" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Threads</CardTitle>
              <CardDescription>
                Threads started by {user.profile?.playerName || user.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {user.threads?.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No threads started yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {user.threads?.map((thread: any) => (
                    <div key={thread.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/threads/${thread.id}`}
                          className="font-medium hover:text-primary transition-colors"
                        >
                          {thread.title}
                        </Link>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
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
                      <Badge variant="secondary">
                        {thread.category.name}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="posts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Posts</CardTitle>
              <CardDescription>
                Recent posts by {user.profile?.playerName || user.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {user.posts?.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No posts yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {user.posts?.map((post: any) => (
                    <div key={post.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <Link
                          href={`/threads/${post.thread.id}`}
                          className="font-medium hover:text-primary transition-colors"
                        >
                          {post.thread.title}
                        </Link>
                        <div className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground line-clamp-3">
                        <ReactMarkdown>{post.content}</ReactMarkdown>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>
                Account details and activity history
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Member Since</div>
                  <div className="font-medium">
                    {user.profile?.joinDate
                      ? formatDistanceToNow(new Date(user.profile.joinDate), { addSuffix: true })
                      : formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Last Seen</div>
                  <div className="font-medium">
                    {user.lastLoginAt
                      ? formatDistanceToNow(new Date(user.lastLoginAt), { addSuffix: true })
                      : 'Never'}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Account Status</div>
                  <div className="font-medium">
                    {user.isActive ? (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-red-100 text-red-800">
                        Inactive
                      </Badge>
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Forum Role</div>
                  <div className="font-medium">
                    <Badge className={getRoleColor(user.role)}>
                      {user.role}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}