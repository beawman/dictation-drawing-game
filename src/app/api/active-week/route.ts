import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { wordSets } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get active word set for the current user's class
    const activeWordSet = await db.query.wordSets.findFirst({
      where: eq(wordSets.active, true)
    });

    if (!activeWordSet) {
      return NextResponse.json({ error: 'No active week found' }, { status: 404 });
    }

    return NextResponse.json(activeWordSet);
  } catch (error) {
    console.error('Error fetching active week:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}