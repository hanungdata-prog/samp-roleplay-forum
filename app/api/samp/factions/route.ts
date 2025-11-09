import { NextRequest, NextResponse } from 'next/server'
import { sampAPI } from '@/lib/samp-api'

// GET /api/samp/factions - Get factions with members
export async function GET(request: NextRequest) {
  try {
    const factions = await sampAPI.getFactions()

    return NextResponse.json({
      success: true,
      data: factions,
    })
  } catch (error) {
    console.error('Error fetching factions:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch factions' },
      { status: 500 }
    )
  }
}