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
      wordSets: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
      },
    },
    insert: jest.fn(() => ({
      values: jest.fn(() => ({
        returning: jest.fn(),
      })),
    })),
    update: jest.fn(() => ({
      set: jest.fn(() => ({
        where: jest.fn(() => ({
          returning: jest.fn(),
        })),
      })),
    })),
  },
  wordSets: {},
}));

const { auth } = require('@/lib/auth');
const { db } = require('@/lib/db');

// Import the API route handlers
const wordsetsRoute = require('@/app/api/wordsets/route');
const { GET, POST, PUT } = wordsetsRoute;

describe('/api/wordsets', () => {
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

      const request = new NextRequest('http://localhost:3000/api/wordsets');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('returns word sets for authenticated user', async () => {
      const mockWordSets = [
        {
          id: 1,
          name: 'Animals',
          words: ['cat', 'dog', 'bird'],
          isActive: true,
          weekOf: '2024-01-01',
          createdBy: 'teacher1',
          createdAt: '2024-01-01T10:00:00Z',
        },
      ];

      auth.mockResolvedValue(mockSession);
      db.query.wordSets.findMany.mockResolvedValue(mockWordSets);

      const request = new NextRequest('http://localhost:3000/api/wordsets');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockWordSets);
    });

    it('handles database errors gracefully', async () => {
      auth.mockResolvedValue(mockSession);
      db.query.wordSets.findMany.mockRejectedValue(new Error('Database error'));

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const request = new NextRequest('http://localhost:3000/api/wordsets');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal server error');
      expect(consoleSpy).toHaveBeenCalledWith('Error fetching word sets:', expect.any(Error));

      consoleSpy.mockRestore();
    });
  });

  describe('POST', () => {
    it('returns 401 when user is not authenticated', async () => {
      auth.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/wordsets', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Animals',
          words: ['cat', 'dog'],
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('returns 403 when user is not a teacher', async () => {
      auth.mockResolvedValue(mockSession);

      const request = new NextRequest('http://localhost:3000/api/wordsets', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Animals',
          words: ['cat', 'dog'],
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe('Only teachers can create word sets');
    });

    it('creates new word set successfully', async () => {
      const requestData = {
        name: 'Animals',
        words: ['cat', 'dog', 'bird'],
        weekOf: '2024-01-01',
      };

      const mockNewWordSet = {
        id: 1,
        name: 'Animals',
        words: ['cat', 'dog', 'bird'],
        isActive: false,
        weekOf: '2024-01-01',
        createdBy: 'teacher1',
        createdAt: '2024-01-01T10:00:00Z',
      };

      auth.mockResolvedValue(mockTeacherSession);

      const mockInsertChain = {
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([mockNewWordSet]),
        }),
      };
      db.insert.mockReturnValue(mockInsertChain);

      const request = new NextRequest('http://localhost:3000/api/wordsets', {
        method: 'POST',
        body: JSON.stringify(requestData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockNewWordSet);
    });

    it('returns 400 when required fields are missing', async () => {
      auth.mockResolvedValue(mockTeacherSession);

      const request = new NextRequest('http://localhost:3000/api/wordsets', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Animals',
          // Missing words array
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Name and words array are required');
    });

    it('handles database insert errors', async () => {
      const requestData = {
        name: 'Animals',
        words: ['cat', 'dog'],
        weekOf: '2024-01-01',
      };

      auth.mockResolvedValue(mockTeacherSession);

      const mockInsertChain = {
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockRejectedValue(new Error('Database error')),
        }),
      };
      db.insert.mockReturnValue(mockInsertChain);

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const request = new NextRequest('http://localhost:3000/api/wordsets', {
        method: 'POST',
        body: JSON.stringify(requestData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal server error');
      expect(consoleSpy).toHaveBeenCalledWith('Error creating word set:', expect.any(Error));

      consoleSpy.mockRestore();
    });
  });

  describe('PUT', () => {
    it('returns 401 when user is not authenticated', async () => {
      auth.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/wordsets', {
        method: 'PUT',
        body: JSON.stringify({
          id: 1,
          isActive: true,
        }),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('returns 403 when user is not a teacher', async () => {
      auth.mockResolvedValue(mockSession);

      const request = new NextRequest('http://localhost:3000/api/wordsets', {
        method: 'PUT',
        body: JSON.stringify({
          id: 1,
          isActive: true,
        }),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe('Only teachers can update word sets');
    });

    it('updates word set active status successfully', async () => {
      const mockUpdatedWordSet = {
        id: 1,
        name: 'Animals',
        words: ['cat', 'dog'],
        isActive: true,
        weekOf: '2024-01-01',
        createdBy: 'teacher1',
        createdAt: '2024-01-01T10:00:00Z',
      };

      auth.mockResolvedValue(mockTeacherSession);

      const mockUpdateChain = {
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([mockUpdatedWordSet]),
          }),
        }),
      };
      db.update.mockReturnValue(mockUpdateChain);

      const request = new NextRequest('http://localhost:3000/api/wordsets', {
        method: 'PUT',
        body: JSON.stringify({
          id: 1,
          isActive: true,
        }),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockUpdatedWordSet);
    });

    it('returns 400 when id is missing', async () => {
      auth.mockResolvedValue(mockTeacherSession);

      const request = new NextRequest('http://localhost:3000/api/wordsets', {
        method: 'PUT',
        body: JSON.stringify({
          isActive: true,
        }),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Word set ID is required');
    });

    it('handles database update errors', async () => {
      auth.mockResolvedValue(mockTeacherSession);

      const mockUpdateChain = {
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockRejectedValue(new Error('Database error')),
          }),
        }),
      };
      db.update.mockReturnValue(mockUpdateChain);

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const request = new NextRequest('http://localhost:3000/api/wordsets', {
        method: 'PUT',
        body: JSON.stringify({
          id: 1,
          isActive: true,
        }),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal server error');
      expect(consoleSpy).toHaveBeenCalledWith('Error updating word set:', expect.any(Error));

      consoleSpy.mockRestore();
    });
  });
});