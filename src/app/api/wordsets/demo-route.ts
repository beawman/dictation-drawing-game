import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { wordSets } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    // TEMPORARY: Show all system word sets without authentication
    console.log('⚠️ WARNING: Running in demo mode without authentication');
    
    const allWordSets = await db.query.wordSets.findMany({
      where: eq(wordSets.createdBy, 'system')
    });

    return NextResponse.json(allWordSets);
  } catch (error) {
    console.error('Error fetching wordsets:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}