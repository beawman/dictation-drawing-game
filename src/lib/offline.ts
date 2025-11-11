'use client';

import localforage from 'localforage';

// Configure localforage for offline storage
localforage.config({
  name: 'DictationDrawingGame',
  version: 1.0,
  size: 4980736, // 5MB
  storeName: 'gameData',
  description: 'Offline storage for Dictation Drawing Game'
});

export interface CachedWordSet {
  id: number;
  title: string;
  items: Array<{
    word: string;
    image?: string;
    order: number;
  }>;
  cachedAt: number;
}

export interface PendingSubmission {
  id: string;
  studentId: string;
  wordId: number;
  word: string;
  strokeData: unknown[];
  imageBlob: Blob;
  createdAt: number;
}

class OfflineStorage {
  // Cache active word set
  async cacheActiveWordSet(wordSet: CachedWordSet): Promise<void> {
    try {
      const cachedWordSet: CachedWordSet = {
        ...wordSet,
        cachedAt: Date.now()
      };
      await localforage.setItem('activeWordSet', cachedWordSet);
    } catch (error) {
      console.error('Error caching word set:', error);
    }
  }

  // Get cached active word set
  async getCachedWordSet(): Promise<CachedWordSet | null> {
    try {
      const cached = await localforage.getItem<CachedWordSet>('activeWordSet');
      if (!cached) return null;

      // Check if cache is older than 24 hours
      const isExpired = Date.now() - cached.cachedAt > 24 * 60 * 60 * 1000;
      if (isExpired) {
        await this.clearCachedWordSet();
        return null;
      }

      return cached;
    } catch (error) {
      console.error('Error getting cached word set:', error);
      return null;
    }
  }

  // Clear cached word set
  async clearCachedWordSet(): Promise<void> {
    try {
      await localforage.removeItem('activeWordSet');
    } catch (error) {
      console.error('Error clearing cached word set:', error);
    }
  }

  // Queue submission for offline sync
  async queueSubmission(submission: Omit<PendingSubmission, 'id'>): Promise<string> {
    try {
      const id = `submission_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const pendingSubmission: PendingSubmission = {
        ...submission,
        id,
      };

      const existingQueue = await this.getPendingSubmissions();
      const newQueue = [...existingQueue, pendingSubmission];
      
      await localforage.setItem('pendingSubmissions', newQueue);
      return id;
    } catch (error) {
      console.error('Error queuing submission:', error);
      throw error;
    }
  }

  // Get all pending submissions
  async getPendingSubmissions(): Promise<PendingSubmission[]> {
    try {
      const submissions = await localforage.getItem<PendingSubmission[]>('pendingSubmissions');
      return submissions || [];
    } catch (error) {
      console.error('Error getting pending submissions:', error);
      return [];
    }
  }

  // Remove submission from queue after successful sync
  async removeSubmissionFromQueue(submissionId: string): Promise<void> {
    try {
      const existingQueue = await this.getPendingSubmissions();
      const newQueue = existingQueue.filter(sub => sub.id !== submissionId);
      await localforage.setItem('pendingSubmissions', newQueue);
    } catch (error) {
      console.error('Error removing submission from queue:', error);
    }
  }

  // Sync pending submissions when online
  async syncPendingSubmissions(): Promise<void> {
    if (!navigator.onLine) return;

    try {
      const pendingSubmissions = await this.getPendingSubmissions();
      
      for (const submission of pendingSubmissions) {
        try {
          const formData = new FormData();
          formData.append('word', submission.word);
          formData.append('wordId', submission.wordId.toString());
          formData.append('strokeData', JSON.stringify(submission.strokeData));
          formData.append('image', submission.imageBlob);

          const response = await fetch('/api/submissions', {
            method: 'POST',
            body: formData,
          });

          if (response.ok) {
            await this.removeSubmissionFromQueue(submission.id);
            console.log('Synced submission:', submission.id);
          } else {
            console.error('Failed to sync submission:', submission.id);
          }
        } catch (error) {
          console.error('Error syncing individual submission:', error);
        }
      }
    } catch (error) {
      console.error('Error syncing pending submissions:', error);
    }
  }

  // Save drawing progress (auto-save)
  async saveDrawingProgress(wordId: number, strokes: unknown[]): Promise<void> {
    try {
      const key = `drawing_progress_${wordId}`;
      await localforage.setItem(key, {
        strokes,
        savedAt: Date.now()
      });
    } catch (error) {
      console.error('Error saving drawing progress:', error);
    }
  }

  // Load drawing progress
  async loadDrawingProgress(wordId: number): Promise<unknown[] | null> {
    try {
      const key = `drawing_progress_${wordId}`;
      const saved = await localforage.getItem<{
        strokes: unknown[];
        savedAt: number;
      }>(key);

      if (!saved) return null;

      // Return saved strokes if less than 1 hour old
      const isRecent = Date.now() - saved.savedAt < 60 * 60 * 1000;
      return isRecent ? saved.strokes : null;
    } catch (error) {
      console.error('Error loading drawing progress:', error);
      return null;
    }
  }

  // Clear drawing progress after successful submission
  async clearDrawingProgress(wordId: number): Promise<void> {
    try {
      const key = `drawing_progress_${wordId}`;
      await localforage.removeItem(key);
    } catch (error) {
      console.error('Error clearing drawing progress:', error);
    }
  }
}

// Singleton instance
export const offlineStorage = new OfflineStorage();

// Service worker registration
export const registerServiceWorker = async (): Promise<void> => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered:', registration);
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }
};

// Check online status and sync when back online
export const setupOfflineSync = (): void => {
  if (typeof window === 'undefined') return;

  // Sync when coming back online
  window.addEventListener('online', () => {
    console.log('Back online, syncing pending submissions...');
    offlineStorage.syncPendingSubmissions();
  });

  // Initial sync if already online
  if (navigator.onLine) {
    offlineStorage.syncPendingSubmissions();
  }
};