'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Server,
  Users,
  Gamepad2,
  Clock,
  TrendingUp,
  RefreshCw,
  Trophy,
  MapPin,
  Cloud,
  Sun
} from 'lucide-react'

interface ServerStats {
  onlinePlayers: number
  maxPlayers: number
  uptime: string
  gamemode: string
  mapname: string
  version: string
  password: boolean
  weather: number
  time: string
}

interface Player {
  id: number
  name: string
  level: number
  money: number
  faction?: string
  factionRank?: string
  isOnline: boolean
  lastSeen: Date
  playTime: number
  score: number
  ping: number
}

interface Faction {
  id: number
  name: string
  type: string
  members: Player[]
  isOnline: boolean
  memberCount: number
  color: string
}

interface Leaderboard {
  money: Array<{ playerName: string; amount: number; position: number }>
  level: Array<{ playerName: string; level: number; position: number }>
  playtime: Array<{ playerName: string; minutes: number; position: number }>
}

export default function SampServerStatsCard() {
  const [serverStats, setServerStats] = useState<ServerStats | null>(null)
  const [onlinePlayers, setOnlinePlayers] = useState<Player[]>([])
  const [factions, setFactions] = useState<Faction[]>([])
  const [leaderboard, setLeaderboard] = useState<Leaderboard | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [statsRes, playersRes, factionsRes, leaderboardRes] = await Promise.all([
        fetch('/api/samp/server-stats'),
        fetch('/api/samp/players'),
        fetch('/api/samp/factions'),
        fetch('/api/samp/leaderboard'),
      ])

      if (!statsRes.ok || !playersRes.ok || !factionsRes.ok || !leaderboardRes.ok) {
        throw new Error('Failed to fetch server data')
      }

      const [statsData, playersData, factionsData, leaderboardData] = await Promise.all([
        statsRes.json(),
        playersRes.json(),
        factionsRes.json(),
        leaderboardRes.json(),
      ])

      setServerStats(statsData.data)
      setOnlinePlayers(playersData.data)
      setFactions(factionsData.data)
      setLeaderboard(leaderboardData.data)
    } catch (error) {
      console.error('Error fetching SA-MP data:', error)
      setError('Failed to load server data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    // Refresh data every 30 seconds
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [])

  const getWeatherIcon = (weather: number) => {
    switch (weather) {
      case 1: return <Sun className="h-4 w-4" />
      case 8: return <Cloud className="h-4 w-4" />
      default: return <MapPin className="h-4 w-4" />
    }
  }

  const getPingColor = (ping: number) => {
    if (ping < 50) return 'text-green-600'
    if (ping < 100) return 'text-yellow-600'
    return 'text-red-600'
  }

  if (loading && !serverStats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            Live Server Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            Live Server Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Server className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Server is offline or unavailable</p>
            <Button onClick={fetchData} className="mt-4" size="sm">
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="col-span-1 md:col-span-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            Live Server Status
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchData}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        <CardDescription>
          Real-time SA:MP server information
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="players">Players</TabsTrigger>
            <TabsTrigger value="factions">Factions</TabsTrigger>
            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {serverStats && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Online Players</div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-green-600" />
                    <span className="text-2xl font-bold">{serverStats.onlinePlayers}</span>
                    <span className="text-sm text-muted-foreground">/ {serverStats.maxPlayers}</span>
                  </div>
                  <Progress
                    value={(serverStats.onlinePlayers / serverStats.maxPlayers) * 100}
                    className="h-2"
                  />
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Server Uptime</div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span className="font-medium">{serverStats.uptime}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Gamemode</div>
                  <div className="font-medium text-sm">{serverStats.gamemode}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Time & Weather</div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm">{serverStats.time}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {getWeatherIcon(serverStats.weather)}
                      <span className="text-sm">
                        {serverStats.weather === 1 ? 'Sunny' : serverStats.weather === 8 ? 'Cloudy' : 'Clear'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="players" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Online Players ({onlinePlayers.length})</h3>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {onlinePlayers.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  No players online
                </div>
              ) : (
                onlinePlayers.map((player) => (
                  <div key={player.id} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                        <Gamepad2 className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-medium text-sm">{player.name}</div>
                        <div className="text-xs text-muted-foreground">
                          Level {player.level} • ${player.money.toLocaleString()}
                        </div>
                        {player.faction && (
                          <div className="text-xs text-muted-foreground">
                            {player.faction} - {player.factionRank}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-medium ${getPingColor(player.ping)}`}>
                        {player.ping}ms
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="factions" className="space-y-4">
            <div className="space-y-3">
              {factions.map((faction) => (
                <div key={faction.id} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: faction.color }}
                    />
                    <div>
                      <div className="font-medium">{faction.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {faction.memberCount} members
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {faction.isOnline && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        Active
                      </Badge>
                    )}
                    <div className="text-sm">
                      {faction.members.filter(m => m.isOnline).length} online
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="leaderboard" className="space-y-4">
            {leaderboard && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Richest Players
                  </h4>
                  <div className="space-y-1">
                    {leaderboard.money.slice(0, 5).map((entry, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center">
                            {entry.position}
                          </Badge>
                          <span>{entry.playerName}</span>
                        </div>
                        <span className="font-medium">${entry.amount.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Trophy className="h-4 w-4" />
                    Highest Level
                  </h4>
                  <div className="space-y-1">
                    {leaderboard.level.slice(0, 5).map((entry, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center">
                            {entry.position}
                          </Badge>
                          <span>{entry.playerName}</span>
                        </div>
                        <span className="font-medium">Level {entry.level}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Most Playtime
                  </h4>
                  <div className="space-y-1">
                    {leaderboard.playtime.slice(0, 5).map((entry, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center">
                            {entry.position}
                          </Badge>
                          <span>{entry.playerName}</span>
                        </div>
                        <span className="font-medium">
                          {Math.floor(entry.minutes / 60)}h {entry.minutes % 60}m
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}