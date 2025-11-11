'use client';

import { useEffect, useState } from 'react';
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

export default function GamePage() {
  const [wordSet, setWordSet] = useState<WordSet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchWordSet() {
      try {
        const response = await fetch('/api/active-week');
        
        if (!response.ok) {
          throw new Error(`API Error: ${response.status}`);
        }
        
        const data = await response.json();
        setWordSet(data);
      } catch (err) {
        console.error('Error fetching word set:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchWordSet();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading word set...</p>
        </div>
      </div>
    );
  }

  if (error || !wordSet) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-3xl font-bold child-friendly text-gray-800 mb-4">
            No Words Available
          </h2>
          <p className="text-lg text-gray-600 mb-4">
            {error || 'No active word set found'}
          </p>
          <p className="text-sm text-gray-500 mb-8">
            Please ask your teacher to set up a word list for this week.
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