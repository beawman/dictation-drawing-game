/**
 * @jest-environment node
 */

const { NextRequest } = require('next/server');

// Mock the auth function
jest.mock('@/lib/auth', () => ({
  auth: jest.fn(),
}));

// Mock the database
jest.mock('@/lib/db', () => ({
  db: {
    query: {
      submissions: {
        findMany: jest.fn(),
      },
    },
    insert: jest.fn(() => ({
      values: jest.fn(() => ({
        returning: jest.fn(),
      })),
    })),
  },
  submissions: {},
}));

// Mock Vercel Blob
jest.mock('@vercel/blob', () => ({
  put: jest.fn(),
}));

const { auth } = require('@/lib/auth');
const { db } = require('@/lib/db');
const { put } = require('@vercel/blob');

// Import the API route handlers
const submissionsRoute = require('@/app/api/submissions/route');
const { GET, POST } = submissionsRoute;

describe('/api/submissions', () => {
  const mockSession = {
    user: {
      id: 'user1',
      name: 'Test Student',
      email: 'student@example.com',
      role: 'student',
    },
  };

  const mockTeacherSession = {
    user: {
      id: 'teacher1',
      name: 'Test Teacher',
      email: 'teacher@example.com',
      role: 'teacher',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('returns 401 when user is not authenticated', async () => {
      auth.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/submissions');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('returns student submissions for student user', async () => {
      const mockSubmissions = [
        {
          id: 1,
          studentId: 'user1',
          word: 'cat',
          imageURL: '/drawings/cat.png',
          createdAt: '2024-01-01T10:00:00Z',
        },
      ];

      auth.mockResolvedValue(mockSession);
      db.query.submissions.findMany.mockResolvedValue(mockSubmissions);

      const request = new NextRequest('http://localhost:3000/api/submissions');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockSubmissions);
    });

    it('returns all submissions for teacher with student filter', async () => {
      const mockSubmissions = [
        {
          id: 1,
          studentId: 'student1',
          word: 'cat',
          imageURL: '/drawings/cat.png',
          createdAt: '2024-01-01T10:00:00Z',
        },
      ];

      auth.mockResolvedValue(mockTeacherSession);
      db.query.submissions.findMany.mockResolvedValue(mockSubmissions);

      const request = new NextRequest('http://localhost:3000/api/submissions?studentId=student1');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockSubmissions);
    });

    it('handles database errors gracefully', async () => {
      auth.mockResolvedValue(mockSession);
      db.query.submissions.findMany.mockRejectedValue(new Error('Database error'));

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const request = new NextRequest('http://localhost:3000/api/submissions');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal server error');
      expect(consoleSpy).toHaveBeenCalledWith('Error fetching submissions:', expect.any(Error));

      consoleSpy.mockRestore();
    });
  });

  describe('POST', () => {
    it('returns 401 when user is not authenticated', async () => {
      auth.mockResolvedValue(null);

      const formData = new FormData();
      const request = new NextRequest('http://localhost:3000/api/submissions', {
        method: 'POST',
        body: formData,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('creates new submission successfully', async () => {
      const mockImageBlob = new Blob(['image data'], { type: 'image/png' });
      const mockStrokeData = [{ color: '#000', size: 4, points: [[10, 10], [20, 20]] }];

      const formData = new FormData();
      formData.append('word', 'cat');
      formData.append('wordId', '1');
      formData.append('strokeData', JSON.stringify(mockStrokeData));
      formData.append('image', mockImageBlob);

      const mockNewSubmission = {
        id: 1,
        studentId: 'user1',
        wordId: 1,
        word: 'cat',
        imageURL: 'https://blob.vercel-storage.com/drawings/image.png',
        strokeData: mockStrokeData,
        createdAt: '2024-01-01T10:00:00Z',
      };

      auth.mockResolvedValue(mockSession);
      put.mockResolvedValue({
        url: 'https://blob.vercel-storage.com/drawings/image.png',
      });

      const mockInsertChain = {
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([mockNewSubmission]),
        }),
      };
      db.insert.mockReturnValue(mockInsertChain);

      const request = new NextRequest('http://localhost:3000/api/submissions', {
        method: 'POST',
        body: formData,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockNewSubmission);
      expect(put).toHaveBeenCalledWith(
        expect.stringContaining('drawings/user1-1-'),
        mockImageBlob,
        { access: 'public' }
      );
    });

    it('returns 400 when required fields are missing', async () => {
      auth.mockResolvedValue(mockSession);

      const formData = new FormData();
      formData.append('word', 'cat');
      // Missing wordId, strokeData, and image

      const request = new NextRequest('http://localhost:3000/api/submissions', {
        method: 'POST',
        body: formData,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Missing required fields');
    });

    it('handles blob upload errors', async () => {
      const mockImageBlob = new Blob(['image data'], { type: 'image/png' });
      const mockStrokeData = [{ color: '#000', size: 4, points: [[10, 10], [20, 20]] }];

      const formData = new FormData();
      formData.append('word', 'cat');
      formData.append('wordId', '1');
      formData.append('strokeData', JSON.stringify(mockStrokeData));
      formData.append('image', mockImageBlob);

      auth.mockResolvedValue(mockSession);
      put.mockRejectedValue(new Error('Blob upload failed'));

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const request = new NextRequest('http://localhost:3000/api/submissions', {
        method: 'POST',
        body: formData,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal server error');
      expect(consoleSpy).toHaveBeenCalledWith('Error creating submission:', expect.any(Error));

      consoleSpy.mockRestore();
    });

    it('handles database insert errors', async () => {
      const mockImageBlob = new Blob(['image data'], { type: 'image/png' });
      const mockStrokeData = [{ color: '#000', size: 4, points: [[10, 10], [20, 20]] }];

      const formData = new FormData();
      formData.append('word', 'cat');
      formData.append('wordId', '1');
      formData.append('strokeData', JSON.stringify(mockStrokeData));
      formData.append('image', mockImageBlob);

      auth.mockResolvedValue(mockSession);
      put.mockResolvedValue({
        url: 'https://blob.vercel-storage.com/drawings/image.png',
      });

      const mockInsertChain = {
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockRejectedValue(new Error('Database error')),
        }),
      };
      db.insert.mockReturnValue(mockInsertChain);

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const request = new NextRequest('http://localhost:3000/api/submissions', {
        method: 'POST',
        body: formData,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal server error');
      expect(consoleSpy).toHaveBeenCalledWith('Error creating submission:', expect.any(Error));

      consoleSpy.mockRestore();
    });
  });
});