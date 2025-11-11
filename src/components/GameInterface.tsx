'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Play, Volume2, Eye, ArrowRight, Star, RotateCcw } from 'lucide-react';
import DrawingCanvas, { Stroke, canvasUtils } from '@/components/DrawingCanvas';

interface WordItem {
  word: string;
  image?: string;
  order: number;
}

interface WordSet {
  id: number;
  title: string;
  items: WordItem[];
}

interface GameProps {
  wordSet?: WordSet;
  onSubmission?: (word: string, strokeData: Stroke[], imageBlob: Blob) => void;
}

export default function GameInterface({ wordSet, onSubmission }: GameProps) {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [score, setScore] = useState(0);
  const [submissions, setSubmissions] = useState<number[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  // Initialize speech synthesis
  useEffect(() => {
    if (typeof window !== 'undefined') {
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  const currentWord = wordSet?.items?.[currentWordIndex];
  const progress = wordSet ? ((submissions.length / wordSet.items.length) * 100) : 0;

  // Text-to-Speech function
  const speakWord = useCallback(() => {
    if (!currentWord || !synthRef.current) return;
    
    setIsPlaying(true);
    
    // Cancel any ongoing speech
    synthRef.current.cancel();
    
    const utterance = new SpeechSynthesisUtterance(currentWord.word);
    utterance.rate = 0.7; // Slower for children
    utterance.pitch = 1.2; // Higher pitch for children
    utterance.volume = 1.0;
    
    utterance.onend = () => {
      setIsPlaying(false);
    };
    
    utterance.onerror = () => {
      setIsPlaying(false);
      console.error('Speech synthesis error');
    };
    
    synthRef.current.speak(utterance);
  }, [currentWord]);

  // Show hint (reveal image temporarily)
  const showWordHint = useCallback(() => {
    if (!currentWord?.image) return;
    
    setShowHint(true);
    setTimeout(() => {
      setShowHint(false);
    }, 3000); // Show for 3 seconds
  }, [currentWord]);

  // Submit drawing
  const submitDrawing = useCallback(async () => {
    if (!currentWord || strokes.length === 0) return;

    try {
      // Export canvas to blob
      const imageBlob = await canvasUtils.exportToPNG(canvasRef);
      if (!imageBlob) {
        console.error('Failed to export canvas');
        return;
      }

      // Call submission callback
      onSubmission?.(currentWord.word, strokes, imageBlob);

      // Add to submissions
      setSubmissions(prev => [...prev, currentWordIndex]);
      
      // Show success animation
      setShowConfetti(true);
      setScore(prev => prev + 1);
      
      setTimeout(() => {
        setShowConfetti(false);
      }, 2000);

      // Auto advance after a delay
      setTimeout(() => {
        nextWord();
      }, 2500);
      
    } catch (error) {
      console.error('Submission error:', error);
    }
  }, [currentWord, strokes, onSubmission, currentWordIndex]);

  // Go to next word
  const nextWord = useCallback(() => {
    if (!wordSet) return;
    
    if (currentWordIndex < wordSet.items.length - 1) {
      setCurrentWordIndex(prev => prev + 1);
      setStrokes([]);
      setShowHint(false);
    } else {
      // Game completed
      alert(`Great job! You completed all ${wordSet.items.length} words!`);
    }
  }, [wordSet, currentWordIndex]);

  // Restart current word
  const restartWord = useCallback(() => {
    setStrokes([]);
    setShowHint(false);
  }, []);

  // Auto-play word when component mounts or word changes
  useEffect(() => {
    if (currentWord) {
      const timer = setTimeout(() => {
        speakWord();
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [currentWord, speakWord]);

  if (!wordSet || !currentWord) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Loading your words...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4" data-testid="game-interface">
      {/* Confetti Effect */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                backgroundColor: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#f0932b'][Math.floor(Math.random() * 5)],
                width: '10px',
                height: '10px',
              }}
            />
          ))}
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-800 child-friendly">
              {wordSet.title}
            </h1>
            <div className="flex items-center gap-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-8 h-8 ${
                    i < score ? 'text-yellow-400 fill-current' : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
            <div
              className="bg-gradient-to-r from-green-400 to-blue-500 h-4 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-center text-lg child-friendly text-gray-600" data-testid="progress-indicator">
            Word {currentWordIndex + 1} of {wordSet.items.length}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Column - Word and Controls */}
          <div className="space-y-6">
            {/* Word Display */}
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
              <h2 className="text-6xl font-bold child-friendly text-gray-800 mb-6">
                Draw this word:
              </h2>
              <div className="text-8xl font-black child-friendly text-blue-600 mb-4" data-testid="current-word">
                {currentWord.word}
              </div>
              
              {/* Play Word Button */}
              <button
                onClick={speakWord}
                disabled={isPlaying}
                className={`game-button text-4xl py-8 px-12 mb-6 ${
                  isPlaying ? 'opacity-75 cursor-not-allowed' : ''
                }`}
              >
                {isPlaying ? (
                  <Volume2 className="w-12 h-12 animate-pulse mx-auto" />
                ) : (
                  <Play className="w-12 h-12 mx-auto" />
                )}
                <span className="block mt-2">
                  {isPlaying ? 'Playing...' : 'Listen'}
                </span>
              </button>

              {/* Hint Button */}
              {currentWord.image && (
                <button
                  onClick={showWordHint}
                  className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-4 px-8 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200 mr-4"
                >
                  <Eye className="w-6 h-6 inline mr-2" />
                  Show Hint
                </button>
              )}

              {/* Restart Button */}
              <button
                onClick={restartWord}
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 px-8 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                <RotateCcw className="w-6 h-6 inline mr-2" />
                Start Over
              </button>
            </div>

            {/* Hint Image */}
            {showHint && currentWord.image && (
              <div className="bg-white rounded-2xl shadow-lg p-6 text-center animate-bounce-in">
                <h3 className="text-2xl font-bold child-friendly text-gray-800 mb-4">
                  Hint!
                </h3>
                <img
                  src={currentWord.image}
                  alt={`Hint for ${currentWord.word}`}
                  className="max-w-full h-48 object-contain mx-auto rounded-lg"
                />
              </div>
            )}
          </div>

          {/* Right Column - Drawing Canvas */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-2xl font-bold child-friendly text-gray-800 mb-4 text-center">
              Draw Here!
            </h3>
            
            <div className="flex justify-center mb-4">
              <DrawingCanvas
                width={400}
                height={400}
                onStrokeUpdate={setStrokes}
                className="mx-auto"
              />
            </div>

            {/* Submit Button */}
            <div className="text-center">
              <button
                onClick={submitDrawing}
                disabled={strokes.length === 0}
                className={`game-button text-2xl py-6 px-12 ${
                  strokes.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <ArrowRight className="w-8 h-8 inline mr-2" />
                I'm Done!
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}