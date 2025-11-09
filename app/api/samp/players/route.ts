import { NextRequest, NextResponse } from 'next/server'
import { sampAPI } from '@/lib/samp-api'

// GET /api/samp/players - Get online players
export async function GET(request: NextRequest) {
  try {
    const players = await sampAPI.getOnlinePlayers()

    return NextResponse.json({
      success: true,
      data: players,
    })
  } catch (error) {
    console.error('Error fetching players:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch players' },
      { status: 500 }
    )
  }
}