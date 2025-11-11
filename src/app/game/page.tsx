import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
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

  if (!wordSet) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-3xl font-bold child-friendly text-gray-800 mb-4">
            No Words Available
          </h2>
                  <p className="text-lg text-gray-600 mb-8">
          Let&apos;s draw some words! Listen carefully and draw what you hear.
        </p>
        <Link
          href="/"
          className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
        >
          Go Back
        </Link>
        </div>
      </div>
    );
  }

  return <GameInterface wordSet={wordSet} />;
}