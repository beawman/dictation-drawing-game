import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { submissions } from '@/lib/db/schema';
import { put } from '@vercel/blob';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const studentId = url.searchParams.get('studentId');    let query = db.query.submissions.findMany();
    
    if (session.user.role === 'student') {
      // Students can only see their own submissions
      query = db.query.submissions.findMany({
        where: (submissions, { eq }) => eq(submissions.studentId, session.user.id)
      });
    } else if (studentId) {
      query = db.query.submissions.findMany({
        where: (submissions, { eq }) => eq(submissions.studentId, studentId)
      });
    }

    const allSubmissions = await query;
    return NextResponse.json(allSubmissions);
  } catch (error) {
    console.error('Error fetching submissions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const word = formData.get('word') as string;
    const wordId = parseInt(formData.get('wordId') as string);
    const strokeData = JSON.parse(formData.get('strokeData') as string);
    const imageBlob = formData.get('image') as File;

    if (!word || !wordId || !strokeData || !imageBlob) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Upload image to Vercel Blob
    const imageUrl = await put(`drawings/${session.user.id}-${wordId}-${Date.now()}.png`, imageBlob, {
      access: 'public',
    });

    // Create submission
    const [newSubmission] = await db.insert(submissions).values({
      studentId: session.user.id,
      wordId,
      word,
      imageURL: imageUrl.url,
      strokeData,
    }).returning();

    return NextResponse.json(newSubmission);
  } catch (error) {
    console.error('Error creating submission:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}