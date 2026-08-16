import { NextResponse } from 'next/server';

export async function GET() {
    return NextResponse.json({
        totalFiles: 0,
        totalNodes: 0,
        totalEdges: 0,
        totalServices: 0,
        avgRiskScore: 0,
        highRiskCount: 0,
        totalAnalyses: 0,
        riskTrend: []
    });
}
