import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { wordSets } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    // Note: Students should be able to access active word sets without authentication
    // Only check session for tracking purposes, but don't require it
    const session = await auth();
    
    // Get active word set - anyone can access this for the game
    const activeWordSet = await db.query.wordSets.findFirst({
      where: eq(wordSets.active, true)
    });

    if (!activeWordSet) {
      return NextResponse.json({ error: 'No active week found' }, { status: 404 });
    }

    // Log for analytics if user is authenticated
    if (session?.user) {
      console.log(`Active week accessed by: ${session.user.email}`);
    }

    return NextResponse.json(activeWordSet);
  } catch (error) {
    console.error('Error fetching active week:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}