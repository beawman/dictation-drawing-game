// Temporary development version - remove authentication check
// File: src/app/api/wordsets/route.ts (for testing only)

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { wordSets } from '@/lib/db/schema';
import { eq, or } from 'drizzle-orm';

export async function GET() {
  try {
    // TEMPORARY: Skip authentication for testing
    console.log('⚠️  WARNING: Authentication disabled for testing');
    
    const allWordSets = await db.query.wordSets.findMany({
      where: eq(wordSets.createdBy, 'system')
    });

    return NextResponse.json(allWordSets);
  } catch (error) {
    console.error('Error fetching wordsets:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}