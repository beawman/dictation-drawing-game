/**
 * @jest-environment node
 */

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

describe('/api/active-week', () => {
  const mockSession = {
    user: {
      id: 'user1',
      name: 'Test Student',
      email: 'student@example.com',
      role: 'student',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 401 when user is not authenticated', async () => {
    // Dynamic import for the API route
    const { GET } = await import('@/app/api/active-week/route');
    const { auth } = await import('@/lib/auth');
    
    (auth as jest.Mock).mockResolvedValue(null);

    const request = new Request('http://localhost:3000/api/active-week');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('returns active word set when available', async () => {
    const { GET } = await import('@/app/api/active-week/route');
    const { auth } = await import('@/lib/auth');
    const { db } = await import('@/lib/db');

    const mockWordSet = {
      id: 1,
      name: 'Animals',
      words: ['cat', 'dog', 'bird'],
      isActive: true,
      weekOf: '2024-01-01',
      createdBy: 'teacher1',
      createdAt: '2024-01-01T10:00:00Z',
    };

    (auth as jest.Mock).mockResolvedValue(mockSession);
    (db.query.wordSets.findFirst as jest.Mock).mockResolvedValue(mockWordSet);

    const request = new Request('http://localhost:3000/api/active-week');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(mockWordSet);
  });

  it('returns empty response when no active word set', async () => {
    const { GET } = await import('@/app/api/active-week/route');
    const { auth } = await import('@/lib/auth');
    const { db } = await import('@/lib/db');

    (auth as jest.Mock).mockResolvedValue(mockSession);
    (db.query.wordSets.findFirst as jest.Mock).mockResolvedValue(null);

    const request = new Request('http://localhost:3000/api/active-week');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({});
  });

  it('handles database errors gracefully', async () => {
    const { GET } = await import('@/app/api/active-week/route');
    const { auth } = await import('@/lib/auth');
    const { db } = await import('@/lib/db');

    (auth as jest.Mock).mockResolvedValue(mockSession);
    (db.query.wordSets.findFirst as jest.Mock).mockRejectedValue(new Error('Database error'));

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const request = new Request('http://localhost:3000/api/active-week');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Internal server error');
    expect(consoleSpy).toHaveBeenCalledWith('Error fetching active word set:', expect.any(Error));

    consoleSpy.mockRestore();
  });
});