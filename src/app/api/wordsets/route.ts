import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { wordSets } from '@/lib/db/schema';
import { eq, or } from 'drizzle-orm';
import Papa from 'papaparse';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'teacher') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get word sets created by this teacher OR system word sets
    const allWordSets = await db.query.wordSets.findMany({
      where: or(
        eq(wordSets.createdBy, session.user.id),
        eq(wordSets.createdBy, 'system')
      )
    });

    return NextResponse.json(allWordSets);
  } catch (error) {
    console.error('Error fetching wordsets:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'teacher') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;

    if (!file || !title) {
      return NextResponse.json({ error: 'Missing file or title' }, { status: 400 });
    }

    const fileContent = await file.text();
    let parsedItems: Array<{ word: string; image?: string; order: number }> = [];

    // Parse CSV or text file
    if (file.name.endsWith('.csv')) {
      const parsed = Papa.parse(fileContent, { header: true });
      parsedItems = (parsed.data as { word?: string; Word?: string; image?: string; Image?: string }[])
        .map((row, index) => ({
          word: row.word || row.Word || '',
          image: row.image || row.Image,
          order: index + 1
        })).filter(item => item.word.trim());
    } else {
      // Plain text format
      const lines = fileContent.split('\n').filter(line => line.trim());
      parsedItems = lines.map((line, index) => ({
        word: line.trim(),
        order: index + 1
      }));
    }

    // Create new wordset
    const [newWordSet] = await db.insert(wordSets).values({
      title,
      items: parsedItems,
      createdBy: session.user.id,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    }).returning();

    return NextResponse.json(newWordSet);
  } catch (error) {
    console.error('Error creating wordset:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}