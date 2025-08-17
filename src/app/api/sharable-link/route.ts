import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // Return a simple response to prevent 404 errors
  return NextResponse.json({ 
    message: 'Sharable link feature not implemented yet',
    status: 'ok'
  })
}

export async function POST(request: NextRequest) {
  // Return a simple response to prevent 404 errors
  return NextResponse.json({ 
    message: 'Sharable link feature not implemented yet',
    status: 'ok'
  })
} 