import { NextRequest, NextResponse } from 'next/server'
import { sampAPI } from '@/lib/samp-api'

// GET /api/samp/server-stats - Get SA:MP server statistics
export async function GET(request: NextRequest) {
  try {
    const stats = await sampAPI.getServerStats()

    return NextResponse.json({
      success: true,
      data: stats,
    })
  } catch (error) {
    console.error('Error fetching server stats:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch server statistics' },
      { status: 500 }
    )
  }
}