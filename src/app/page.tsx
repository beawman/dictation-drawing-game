import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Play, GraduationCap, BookOpen } from 'lucide-react';

export default async function HomePage() {
  const session = await auth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold child-friendly text-gray-800 mb-6">
            🎨 Dictation Drawing Game 🎨
          </h1>
          <p className="text-2xl text-gray-600 child-friendly">
            Listen, Draw, Learn!
          </p>
        </div>

        {/* Authentication Status */}
        <div className="text-center mb-12">
          {session ? (
            <div className="bg-white rounded-2xl shadow-lg p-6 inline-block">
              <p className="text-xl child-friendly text-gray-700 mb-4">
                Welcome back, {session.user?.name || 'Friend'}!
              </p>
              <p className="text-lg text-gray-600">
                Role: <span className="font-bold capitalize">{session.user?.role || 'student'}</span>
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-lg p-6 inline-block">
              <p className="text-xl child-friendly text-gray-700 mb-4">
                Please sign in to start playing!
              </p>
              <Link
                href="/auth/signin"
                className="game-button inline-flex items-center"
              >
                <GraduationCap className="w-6 h-6 mr-2" />
                Sign In
              </Link>
            </div>
          )}
        </div>

        {/* Main Navigation */}
        {session && (
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Student Play Area */}
            <div className="bg-white rounded-3xl shadow-xl p-8 text-center transform hover:scale-105 transition-all duration-300">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Play className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-3xl font-bold child-friendly text-gray-800 mb-4">
                Play Game
              </h2>
              <p className="text-lg text-gray-600 child-friendly mb-6">
                Listen to words and draw what you hear!
              </p>
              <Link
                href="/game"
                className="game-button inline-flex items-center"
              >
                <Play className="w-6 h-6 mr-2" />
                Start Playing
              </Link>
            </div>

            {/* Teacher Dashboard */}
            {session.user?.role === 'teacher' && (
              <div className="bg-white rounded-3xl shadow-xl p-8 text-center transform hover:scale-105 transition-all duration-300">
                <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <BookOpen className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-3xl font-bold child-friendly text-gray-800 mb-4">
                  Teacher Dashboard
                </h2>
                <p className="text-lg text-gray-600 child-friendly mb-6">
                  Manage words and track student progress
                </p>
                <Link
                  href="/teacher"
                  className="teacher-button inline-flex items-center"
                >
                  <BookOpen className="w-6 h-6 mr-2" />
                  Open Dashboard
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Features */}
        <div className="mt-16 grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
            <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🎧</span>
            </div>
            <h3 className="text-xl font-bold child-friendly mb-2">Listen</h3>
            <p className="text-gray-600">Hear words spoken clearly with child-friendly voices</p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
            <div className="w-16 h-16 bg-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">✏️</span>
            </div>
            <h3 className="text-xl font-bold child-friendly mb-2">Draw</h3>
            <p className="text-gray-600">Use easy drawing tools designed for little hands</p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
            <div className="w-16 h-16 bg-purple-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⭐</span>
            </div>
            <h3 className="text-xl font-bold child-friendly mb-2">Learn</h3>
            <p className="text-gray-600">Get encouraging feedback and earn stars!</p>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center mt-16 text-gray-500">
          <p>&copy; 2025 Dictation Drawing Game. Made with ❤️ for kids.</p>
        </footer>
      </div>
    </div>
  );
}