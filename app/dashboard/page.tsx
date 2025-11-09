import { requireAuth } from '@/lib/auth-utils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import SampServerStatsCard from '@/components/samp-server-stats-card'

export default async function DashboardPage() {
  const user = await requireAuth()

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user.name || user.email}!
          </p>
        </div>
        <Badge variant={user.role === 'ADMIN' ? 'destructive' : user.role === 'MODERATOR' ? 'default' : 'secondary'}>
          {user.role}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>
              Manage your forum profile and settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/profile">
              <Button className="w-full">Edit Profile</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Forum Activity</CardTitle>
            <CardDescription>
              View your recent posts and threads
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div>Total Posts: {user.profile?.totalPosts || 0}</div>
              <div>Total Likes: {user.profile?.totalLikes || 0}</div>
              <div>Reputation: {user.profile?.reputation || 0}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Game Character</CardTitle>
            <CardDescription>
              Your in-game character information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div>Name: {user.profile?.playerName || 'Not set'}</div>
              <div>Level: {user.profile?.playerLevel || 'N/A'}</div>
              <div>Money: ${user.profile?.playerMoney || '0'}</div>
            </div>
          </CardContent>
        </Card>

        {/* Live Server Stats */}
        <SampServerStatsCard />

        {user.role === 'ADMIN' && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Admin Panel</CardTitle>
                <CardDescription>
                  Manage users, categories, and system settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/admin">
                  <Button className="w-full" variant="destructive">
                    Admin Panel
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>
                  View and manage all forum users
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/admin/users">
                  <Button className="w-full" variant="outline">
                    Manage Users
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </>
        )}

        {(user.role === 'MODERATOR' || user.role === 'ADMIN') && (
          <Card>
            <CardHeader>
              <CardTitle>Moderation</CardTitle>
              <CardDescription>
                Review reports and moderate content
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/moderator">
                <Button className="w-full" variant="outline">
                  Moderator Panel
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common tasks and navigation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Link href="/forums">
              <Button variant="outline">Browse Forums</Button>
            </Link>
            <Link href="/create-thread">
              <Button>Create Thread</Button>
            </Link>
            <Link href="/search">
              <Button variant="outline">Search</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}