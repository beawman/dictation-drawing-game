import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import GameInterface from '@/components/GameInterface';

interface WordSet {
  id: number;
  title: string;
  items: Array<{
    word: string;
    image?: string;
    order: number;
  }>;
}

async function getActiveWordSet(): Promise<WordSet | null> {
  try {
    const response = await fetch(
      `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/active-week`,
      {
        cache: 'no-store',
      }
    );
    
    if (!response.ok) {
      return null;
    }
    
    return response.json();
  } catch (error) {
    console.error('Error fetching active word set:', error);
    return null;
  }
}

export default async function GamePage() {
  const session = await auth();
  
  if (!session) {
    redirect('/auth/signin');
  }

  const wordSet = await getActiveWordSet();

  const handleSubmission = async (word: string, strokeData: any[], imageBlob: Blob) => {
    'use server';
    
    // This would be handled client-side in the actual implementation
    console.log('Submission received:', { word, strokeData, imageBlob });
  };

  if (!wordSet) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-3xl font-bold child-friendly text-gray-800 mb-4">
            No Words Available
          </h2>
          <p className="text-lg text-gray-600 child-friendly mb-6">
            Your teacher hasn't set up any words yet. Please check back later!
          </p>
          <a
            href="/"
            className="game-button inline-flex items-center"
          >
            Go Home
          </a>
        </div>
      </div>
    );
  }

  return <GameInterface wordSet={wordSet} onSubmission={handleSubmission} />;
}