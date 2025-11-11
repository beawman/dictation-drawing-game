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
        findFirst: jest.fn(),
      },
    },
  },
}));

const { auth } = require('@/lib/auth');
const { db } = require('@/lib/db');

// Import the API route handlers
const activeWeekRoute = require('@/app/api/active-week/route');
const { GET } = activeWeekRoute;

describe('/api/active-week', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('returns 401 when user is not authenticated', async () => {
      auth.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/active-week');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('returns active word set for authenticated user', async () => {
      const mockSession = {
        user: {
          id: 'user1',
          name: 'Test User',
          email: 'test@example.com',
          role: 'student',
        },
      };

      const mockWordSet = {
        id: 1,
        title: 'Week 1 - Animals',
        items: [
          { word: 'cat', image: '/images/cat.png', order: 1 },
          { word: 'dog', image: '/images/dog.png', order: 2 },
        ],
        active: true,
        createdAt: '2024-01-01T00:00:00Z',
      };

      auth.mockResolvedValue(mockSession);
      db.query.wordSets.findFirst.mockResolvedValue(mockWordSet);

      const request = new NextRequest('http://localhost:3000/api/active-week');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockWordSet);
      expect(db.query.wordSets.findFirst).toHaveBeenCalledWith({
        where: expect.any(Function),
      });
    });

    it('returns 404 when no active word set exists', async () => {
      const mockSession = {
        user: {
          id: 'user1',
          name: 'Test User',
          email: 'test@example.com',
          role: 'student',
        },
      };

      auth.mockResolvedValue(mockSession);
      db.query.wordSets.findFirst.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/active-week');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('No active week found');
    });

    it('handles database errors gracefully', async () => {
      const mockSession = {
        user: {
          id: 'user1',
          name: 'Test User',
          email: 'test@example.com',
          role: 'student',
        },
      };

      auth.mockResolvedValue(mockSession);
      db.query.wordSets.findFirst.mockRejectedValue(new Error('Database error'));

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const request = new NextRequest('http://localhost:3000/api/active-week');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal server error');
      expect(consoleSpy).toHaveBeenCalledWith('Error fetching active week:', expect.any(Error));

      consoleSpy.mockRestore();
    });
  });
});