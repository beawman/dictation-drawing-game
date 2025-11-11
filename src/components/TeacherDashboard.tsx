'use client';

import React, { useState, useEffect } from 'react';
import { 
  Upload, 
  Play, 
  Pause, 
  Users, 
  BookOpen, 
  Settings, 
  Download,
  Eye,
  Star,
  Check,
  X
} from 'lucide-react';

interface WordSet {
  id: number;
  title: string;
  startDate: string;
  endDate: string;
  items: Array<{
    word: string;
    image?: string;
    order: number;
  }>;
  active: boolean;
  createdAt: string;
}

interface Submission {
  id: number;
  studentId: string;
  word: string;
  imageURL: string;
  teacherScore?: {
    rating: number;
    reviewedBy: string;
    reviewedAt: string;
  };
  autoScore?: {
    confidence: number;
    label: string;
  };
  createdAt: string;
}

export default function TeacherDashboard() {
  const [activeTab, setActiveTab] = useState<'wordsets' | 'submissions' | 'students'>('wordsets');
  const [wordSets, setWordSets] = useState<WordSet[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState('');

  // Load data on mount
  useEffect(() => {
    loadWordSets();
    loadSubmissions();
  }, []);

  const loadWordSets = async () => {
    try {
      const response = await fetch('/api/wordsets');
      if (response.ok) {
        const data = await response.json();
        setWordSets(data);
      }
    } catch (error) {
      console.error('Error loading wordsets:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSubmissions = async () => {
    try {
      const response = await fetch('/api/submissions');
      if (response.ok) {
        const data = await response.json();
        setSubmissions(data);
      }
    } catch (error) {
      console.error('Error loading submissions:', error);
    }
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!uploadFile || !uploadTitle.trim()) return;

    const formData = new FormData();
    formData.append('file', uploadFile);
    formData.append('title', uploadTitle.trim());

    try {
      const response = await fetch('/api/wordsets', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const newWordSet = await response.json();
        setWordSets(prev => [newWordSet, ...prev]);
        setUploadFile(null);
        setUploadTitle('');
        alert('Word set uploaded successfully!');
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Error uploading wordset:', error);
      alert('Failed to upload word set. Please try again.');
    }
  };

  const activateWordSet = async (wordSetId: number) => {
    try {
      const response = await fetch(`/api/wordsets/${wordSetId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ active: true }),
      });

      if (response.ok) {
        setWordSets(prev =>
          prev.map(ws => ({
            ...ws,
            active: ws.id === wordSetId
          }))
        );
        alert('Word set activated successfully!');
      }
    } catch (error) {
      console.error('Error activating wordset:', error);
      alert('Failed to activate word set.');
    }
  };

  const rateSubmission = async (submissionId: number, rating: number) => {
    try {
      const response = await fetch(`/api/submissions/${submissionId}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rating }),
      });

      if (response.ok) {
        setSubmissions(prev =>
          prev.map(sub =>
            sub.id === submissionId
              ? {
                  ...sub,
                  teacherScore: {
                    rating,
                    reviewedBy: 'current_teacher',
                    reviewedAt: new Date().toISOString(),
                  },
                }
              : sub
          )
        );
      }
    } catch (error) {
      console.error('Error rating submission:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Teacher Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage word sets and track student progress</p>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-8">
            {[
              { id: 'wordsets', label: 'Word Sets', icon: BookOpen },
              { id: 'submissions', label: 'Student Work', icon: Users },
              { id: 'students', label: 'Settings', icon: Settings },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex items-center px-3 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Word Sets Tab */}
        {activeTab === 'wordsets' && (
          <div className="space-y-8">
            {/* Upload Form */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">Upload New Word Set</h2>
              <form onSubmit={handleFileUpload} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Week 1 - Animals"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Word File (CSV or TXT)
                  </label>
                  <input
                    type="file"
                    accept=".csv,.txt"
                    onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={!uploadFile || !uploadTitle.trim()}
                  className="teacher-button disabled:opacity-50"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Word Set
                </button>
              </form>
            </div>

            {/* Word Sets List */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <h2 className="text-xl font-bold">Your Word Sets</h2>
              </div>
              <div className="divide-y">
                {wordSets.map((wordSet) => (
                  <div key={wordSet.id} className="p-6 flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-medium">{wordSet.title}</h3>
                        {wordSet.active && (
                          <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {wordSet.items?.length || 0} words • Created {new Date(wordSet.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => activateWordSet(wordSet.id)}
                        disabled={wordSet.active}
                        className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                          wordSet.active
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-blue-500 hover:bg-blue-600 text-white'
                        }`}
                      >
                        {wordSet.active ? <Check className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Submissions Tab */}
        {activeTab === 'submissions' && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold">Student Submissions</h2>
            </div>
            <div className="grid gap-4 p-6">
              {submissions.map((submission) => (
                <div key={submission.id} className="border rounded-lg p-4 flex items-center gap-4">
                  <div className="w-24 h-24 border rounded-lg overflow-hidden bg-gray-50">
                    <img
                      src={submission.imageURL}
                      alt={`Drawing of ${submission.word}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">Word: {submission.word}</h3>
                    <p className="text-sm text-gray-500">
                      Student: {submission.studentId} • {new Date(submission.createdAt).toLocaleDateString()}
                    </p>
                    {submission.autoScore && (
                      <p className="text-sm text-blue-600">
                        AI Confidence: {Math.round(submission.autoScore.confidence * 100)}%
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {submission.teacherScore ? (
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < submission.teacherScore!.rating
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <button
                            key={rating}
                            onClick={() => rateSubmission(submission.id, rating)}
                            className="w-8 h-8 rounded-full border-2 border-gray-300 hover:border-yellow-400 hover:bg-yellow-50 flex items-center justify-center transition-colors"
                          >
                            <Star className="w-4 h-4 text-gray-400 hover:text-yellow-400" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'students' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Settings</h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-medium mb-2">Export Data</h3>
                <button className="teacher-button">
                  <Download className="w-4 h-4 mr-2" />
                  Export All Submissions (CSV)
                </button>
              </div>
              <div>
                <h3 className="font-medium mb-2">Class Management</h3>
                <p className="text-gray-600 text-sm">
                  Class management features will be available in the next update.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}