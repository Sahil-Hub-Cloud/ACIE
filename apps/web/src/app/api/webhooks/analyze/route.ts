import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    console.log("Webhook received:", data.prUrl);
    // TODO: Connect to Turso to save analysis
    return NextResponse.json({ success: true, message: "Webhook received" });
  } catch(e) {
    return NextResponse.json({ success: false }, { status: 400 });
  }
}
