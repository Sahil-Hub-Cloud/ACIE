import { NextResponse } from 'next/server';

export async function GET() {
    // Return empty array if no real DB
    return NextResponse.json([]);
}
