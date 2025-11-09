import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import Link from 'next/link'
import { MessageSquare, Users, Eye, TrendingUp } from 'lucide-react'

async function getCategories() {
  const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/categories?includeChildren=true`, {
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error('Failed to fetch categories')
  }

  const data = await response.json()
  return data.data
}

async function getForumStats() {
  const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/stats`, {
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error('Failed to fetch stats')
  }

  const data = await response.json()
  return data.data
}

export default async function ForumsPage() {
  const [categories, stats] = await Promise.all([
    getCategories(),
    getForumStats(),
  ])

  const mainCategories = categories.filter((cat: any) => !cat.parentId)
  const childCategories = categories.filter((cat: any) => cat.parentId)

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">JGRP Roleplay Forum</h1>
            <p className="text-muted-foreground">
              Join our community and engage in discussions about SA:MP roleplay
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/search">
              <Button variant="outline">Search</Button>
            </Link>
            <Link href="/create-thread">
              <Button>New Thread</Button>
            </Link>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-600" />
                <div>
                  <div className="text-2xl font-bold">{stats.totalUsers}</div>
                  <div className="text-xs text-muted-foreground">Users</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-green-600" />
                <div>
                  <div className="text-2xl font-bold">{stats.totalThreads}</div>
                  <div className="text-xs text-muted-foreground">Threads</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-purple-600" />
                <div>
                  <div className="text-2xl font-bold">{stats.totalPosts}</div>
                  <div className="text-xs text-muted-foreground">Posts</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-orange-600" />
                <div>
                  <div className="text-2xl font-bold">{stats.onlineUsers}</div>
                  <div className="text-xs text-muted-foreground">Online</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-6">
        {mainCategories.map((category: any) => (
          <Card key={category.id} className="overflow-hidden">
            <CardHeader
              className="pb-3"
              style={{ backgroundColor: `${category.color}10` }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: category.color }}
                  >
                    {category.icon || '📁'}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{category.name}</CardTitle>
                    <CardDescription>{category.description}</CardDescription>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">{category._count.threads}</div>
                  <div className="text-xs text-muted-foreground">threads</div>
                </div>
              </div>
            </CardHeader>

            {category.children && category.children.length > 0 && (
              <>
                <Separator />
                <CardContent className="p-0">
                  <div className="divide-y">
                    {category.children.map((child: any) => (
                      <Link
                        key={child.id}
                        href={`/forums/${child.id}`}
                        className="block p-4 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-6 h-6 rounded flex items-center justify-center text-white text-xs font-bold"
                              style={{ backgroundColor: child.color }}
                            >
                              {child.icon || '📄'}
                            </div>
                            <div>
                              <div className="font-medium">{child.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {child.description}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium">{child._count.threads}</div>
                            <div className="text-xs text-muted-foreground">threads</div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </>
            )}

            {(!category.children || category.children.length === 0) && (
              <Link
                href={`/forums/${category.id}`}
                className="block p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-6 h-6 rounded flex items-center justify-center text-white text-xs font-bold"
                      style={{ backgroundColor: category.color }}
                    >
                      {category.icon || '📄'}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      View all threads in this category
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{category._count.threads}</div>
                    <div className="text-xs text-muted-foreground">threads</div>
                  </div>
                </div>
              </Link>
            )}
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Latest posts from our community
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Browse the categories above to see recent activity</p>
            <Link href="/search">
              <Button variant="outline" className="mt-4">
                Search All Content
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}