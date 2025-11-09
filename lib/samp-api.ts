// SA-MP Server API Integration Service
// This service handles communication with the SA:MP game server

export interface SAPlayer {
  id: number
  name: string
  level: number
  money: number
  faction?: string
  factionRank?: string
  isOnline: boolean
  lastSeen: Date
  playTime: number // minutes
  score: number
  ping: number
}

export interface SAFaction {
  id: number
  name: string
  type: string
  members: SAPlayer[]
  isOnline: boolean
  memberCount: number
  color: string
}

export interface SAServerStats {
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

export interface SALeaderboard {
  money: Array<{ playerName: string; amount: number; position: number }>
  level: Array<{ playerName: string; level: number; position: number }>
  playtime: Array<{ playerName: string; minutes: number; position: number }>
}

class SAMPAPIService {
  private baseUrl: string
  private apiKey: string
  private cache: Map<string, { data: any; timestamp: number }> = new Map()
  private readonly CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

  constructor() {
    this.baseUrl = process.env.SAMP_API_URL || 'http://localhost:8080'
    this.apiKey = process.env.SAMP_API_KEY || 'default-key'
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${this.baseUrl}/api${endpoint}`

    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, defaultOptions)

      if (!response.ok) {
        throw new Error(`SA-MP API Error: ${response.status} ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error(`SA-MP API request failed for ${endpoint}:`, error)
      // Return mock data for development
      return this.getMockData(endpoint)
    }
  }

  private getCacheKey(endpoint: string): string {
    return `samp:${endpoint}`
  }

  private getCachedData(endpoint: string): any | null {
    const key = this.getCacheKey(endpoint)
    const cached = this.cache.get(key)

    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data
    }

    return null
  }

  private setCachedData(endpoint: string, data: any): void {
    const key = this.getCacheKey(endpoint)
    this.cache.set(key, { data, timestamp: Date.now() })
  }

  private async fetchWithCache<T>(endpoint: string): Promise<T> {
    // Check cache first
    const cached = this.getCachedData(endpoint)
    if (cached) {
      return cached
    }

    // Fetch from API
    const data = await this.makeRequest(endpoint)

    // Cache the result
    this.setCachedData(endpoint, data)

    return data
  }

  // Mock data for development/testing
  private getMockData(endpoint: string): any {
    switch (endpoint) {
      case '/server/stats':
        return {
          onlinePlayers: 42,
          maxPlayers: 100,
          uptime: '2 days, 14 hours, 32 minutes',
          gamemode: 'JGRP Roleplay v2.5',
          mapname: 'San Andreas',
          version: '0.3.7-R2',
          password: false,
          weather: 1,
          time: '14:32',
        }

      case '/players/online':
        return [
          {
            id: 0,
            name: 'Mike_Johnson',
            level: 5,
            money: 25000,
            faction: 'Grove Street Families',
            factionRank: 'Leader',
            isOnline: true,
            lastSeen: new Date(),
            playTime: 1250,
            score: 100,
            ping: 45,
          },
          {
            id: 1,
            name: 'Sarah_Davis',
            level: 7,
            money: 150000,
            faction: 'Davis Logistics',
            factionRank: 'CEO',
            isOnline: true,
            lastSeen: new Date(),
            playTime: 890,
            score: 250,
            ping: 32,
          },
          {
            id: 2,
            name: 'John_Moderator',
            level: 8,
            money: 500000,
            faction: 'Los Santos Police Department',
            factionRank: 'Chief',
            isOnline: true,
            lastSeen: new Date(),
            playTime: 2100,
            score: 500,
            ping: 28,
          },
        ]

      case '/factions':
        return [
          {
            id: 1,
            name: 'Los Santos Police Department',
            type: 'POLICE',
            members: [
              {
                id: 2,
                name: 'John_Moderator',
                level: 8,
                money: 500000,
                faction: 'Los Santos Police Department',
                factionRank: 'Chief',
                isOnline: true,
                lastSeen: new Date(),
                playTime: 2100,
                score: 500,
                ping: 28,
              },
            ],
            isOnline: true,
            memberCount: 8,
            color: '#0066cc',
          },
          {
            id: 2,
            name: 'Los Santos Medical',
            type: 'MEDICAL',
            members: [
              {
                id: 1,
                name: 'Sarah_Davis',
                level: 7,
                money: 150000,
                faction: 'Davis Logistics',
                factionRank: 'CEO',
                isOnline: true,
                lastSeen: new Date(),
                playTime: 890,
                score: 250,
                ping: 32,
              },
            ],
            isOnline: true,
            memberCount: 5,
            color: '#ff4444',
          },
          {
            id: 3,
            name: 'Grove Street Families',
            type: 'GANG',
            members: [
              {
                id: 0,
                name: 'Mike_Johnson',
                level: 5,
                money: 25000,
                faction: 'Grove Street Families',
                factionRank: 'Leader',
                isOnline: true,
                lastSeen: new Date(),
                playTime: 1250,
                score: 100,
                ping: 45,
              },
            ],
            isOnline: true,
            memberCount: 12,
            color: '#00aa00',
          },
        ]

      case '/leaderboard':
        return {
          money: [
            { playerName: 'John_Moderator', amount: 500000, position: 1 },
            { playerName: 'Sarah_Davis', amount: 150000, position: 2 },
            { playerName: 'Mike_Johnson', amount: 25000, position: 3 },
          ],
          level: [
            { playerName: 'John_Moderator', level: 8, position: 1 },
            { playerName: 'Sarah_Davis', level: 7, position: 2 },
            { playerName: 'Mike_Johnson', level: 5, position: 3 },
          ],
          playtime: [
            { playerName: 'John_Moderator', minutes: 2100, position: 1 },
            { playerName: 'Mike_Johnson', minutes: 1250, position: 2 },
            { playerName: 'Sarah_Davis', minutes: 890, position: 3 },
          ],
        }

      default:
        return null
    }
  }

  // Public API methods
  async getServerStats(): Promise<SAServerStats> {
    return this.fetchWithCache<SAServerStats>('/server/stats')
  }

  async getOnlinePlayers(): Promise<SAPlayer[]> {
    return this.fetchWithCache<SAPlayer[]>('/players/online')
  }

  async getPlayerByName(name: string): Promise<SAPlayer | null> {
    const players = await this.getOnlinePlayers()
    return players.find(player => player.name.toLowerCase() === name.toLowerCase()) || null
  }

  async getFactions(): Promise<SAFaction[]> {
    return this.fetchWithCache<SAFaction[]>('/factions')
  }

  async getFactionById(id: number): Promise<SAFaction | null> {
    const factions = await this.getFactions()
    return factions.find(faction => faction.id === id) || null
  }

  async getLeaderboard(): Promise<SALeaderboard> {
    return this.fetchWithCache<SALeaderboard>('/leaderboard')
  }

  // Admin methods (for server management)
  async kickPlayer(playerId: number, reason: string): Promise<boolean> {
    try {
      await this.makeRequest('/admin/kick', {
        method: 'POST',
        body: JSON.stringify({ playerId, reason }),
      })

      // Clear relevant cache
      this.cache.delete(this.getCacheKey('/players/online'))

      return true
    } catch (error) {
      console.error('Failed to kick player:', error)
      return false
    }
  }

  async banPlayer(playerId: number, reason: string, duration?: number): Promise<boolean> {
    try {
      await this.makeRequest('/admin/ban', {
        method: 'POST',
        body: JSON.stringify({ playerId, reason, duration }),
      })

      // Clear relevant cache
      this.cache.delete(this.getCacheKey('/players/online'))

      return true
    } catch (error) {
      console.error('Failed to ban player:', error)
      return false
    }
  }

  async sendServerMessage(message: string): Promise<boolean> {
    try {
      await this.makeRequest('/admin/message', {
        method: 'POST',
        body: JSON.stringify({ message }),
      })

      return true
    } catch (error) {
      console.error('Failed to send server message:', error)
      return false
    }
  }

  // Clear cache (useful for real-time updates)
  clearCache(): void {
    this.cache.clear()
  }

  clearCacheForEndpoint(endpoint: string): void {
    this.cache.delete(this.getCacheKey(endpoint))
  }
}

// Export singleton instance
export const sampAPI = new SAMPAPIService()