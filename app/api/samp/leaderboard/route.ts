import { NextRequest, NextResponse } from 'next/server'
import { sampAPI } from '@/lib/samp-api'

// GET /api/samp/leaderboard - Get player leaderboards
export async function GET(request: NextRequest) {
  try {
    const leaderboard = await sampAPI.getLeaderboard()

    return NextResponse.json({
      success: true,
      data: leaderboard,
    })
  } catch (error) {
    console.error('Error fetching leaderboard:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch leaderboard' },
      { status: 500 }
    )
  }
}