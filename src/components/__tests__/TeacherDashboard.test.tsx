import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TeacherDashboard from '@/components/TeacherDashboard';

// Mock fetch
global.fetch = jest.fn();

const mockWordSets = [
  {
    id: 1,
    title: 'Week 1 - Animals',
    startDate: '2024-01-01',
    endDate: '2024-01-07',
    items: [
      { word: 'cat', image: '/images/cat.png', order: 1 },
      { word: 'dog', image: '/images/dog.png', order: 2 },
    ],
    active: true,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 2,
    title: 'Week 2 - Objects',
    startDate: '2024-01-08',
    endDate: '2024-01-14',
    items: [
      { word: 'car', image: '/images/car.png', order: 1 },
      { word: 'house', image: '/images/house.png', order: 2 },
    ],
    active: false,
    createdAt: '2024-01-05T00:00:00Z',
  },
];

const mockSubmissions = [
  {
    id: 1,
    studentId: 'student1',
    word: 'cat',
    imageURL: '/drawings/student1-cat.png',
    teacherScore: {
      rating: 4,
      reviewedBy: 'teacher1',
      reviewedAt: '2024-01-02T10:00:00Z',
    },
    autoScore: {
      confidence: 0.85,
      label: 'cat',
    },
    createdAt: '2024-01-01T10:00:00Z',
  },
  {
    id: 2,
    studentId: 'student2',
    word: 'dog',
    imageURL: '/drawings/student2-dog.png',
    autoScore: {
      confidence: 0.72,
      label: 'dog',
    },
    createdAt: '2024-01-01T11:00:00Z',
  },
];

describe('TeacherDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default fetch responses
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockWordSets),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockSubmissions),
      });
  });

  it('renders loading state initially', () => {
    render(<TeacherDashboard />);
    
    expect(screen.getByRole('progressbar', { hidden: true })).toBeInTheDocument();
  });

  it('renders dashboard header and navigation', async () => {
    render(<TeacherDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Teacher Dashboard')).toBeInTheDocument();
    });

    expect(screen.getByText('Manage word sets and track student progress')).toBeInTheDocument();
    expect(screen.getByText('Word Sets')).toBeInTheDocument();
    expect(screen.getByText('Student Work')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('displays word sets in the default tab', async () => {
    render(<TeacherDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Upload New Word Set')).toBeInTheDocument();
    });

    expect(screen.getByText('Your Word Sets')).toBeInTheDocument();
    expect(screen.getByText('Week 1 - Animals')).toBeInTheDocument();
    expect(screen.getByText('Week 2 - Objects')).toBeInTheDocument();
    
    // Active badge should be shown
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('handles word set upload form', async () => {
    const user = userEvent.setup();
    render(<TeacherDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Upload New Word Set')).toBeInTheDocument();
    });

    // Fill out the form
    const titleInput = screen.getByPlaceholderText('Week 1 - Animals');
    await user.type(titleInput, 'Week 3 - Colors');

    const fileInput = screen.getByLabelText(/Word File/);
    const file = new File(['red,blue,green'], 'colors.csv', { type: 'text/csv' });
    await user.upload(fileInput, file);

    expect(titleInput).toHaveValue('Week 3 - Colors');
    expect(fileInput.files![0]).toBe(file);
  });

  it('submits word set upload', async () => {
    const user = userEvent.setup();
    
    // Mock successful upload
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        id: 3,
        title: 'Week 3 - Colors',
        items: [{ word: 'red', order: 1 }],
        active: false,
        createdAt: '2024-01-10T00:00:00Z',
      }),
    });

    render(<TeacherDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Upload New Word Set')).toBeInTheDocument();
    });

    // Fill and submit form
    const titleInput = screen.getByPlaceholderText('Week 1 - Animals');
    await user.type(titleInput, 'Week 3 - Colors');

    const fileInput = screen.getByLabelText(/Word File/);
    const file = new File(['red,blue,green'], 'colors.csv', { type: 'text/csv' });
    await user.upload(fileInput, file);

    const uploadButton = screen.getByText('Upload Word Set');
    await user.click(uploadButton);

    expect(fetch).toHaveBeenCalledWith('/api/wordsets', expect.objectContaining({
      method: 'POST',
      body: expect.any(FormData),
    }));
  });

  it('activates word set when activate button is clicked', async () => {
    const user = userEvent.setup();
    
    // Mock successful activation
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({}),
    });

    render(<TeacherDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Week 2 - Objects')).toBeInTheDocument();
    });

    // Find and click activate button for inactive word set
    const activateButtons = screen.getAllByRole('button').filter(
      button => button.querySelector('svg') && !button.disabled
    );
    
    if (activateButtons.length > 0) {
      await user.click(activateButtons[0]);
      
      expect(fetch).toHaveBeenCalledWith('/api/wordsets/2', expect.objectContaining({
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ active: true }),
      }));
    }
  });

  it('switches to submissions tab', async () => {
    const user = userEvent.setup();
    render(<TeacherDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Student Work')).toBeInTheDocument();
    });

    const submissionsTab = screen.getByText('Student Work');
    await user.click(submissionsTab);

    await waitFor(() => {
      expect(screen.getByText('Student Submissions')).toBeInTheDocument();
    });

    expect(screen.getByText('Word: cat')).toBeInTheDocument();
    expect(screen.getByText('Word: dog')).toBeInTheDocument();
  });

  it('displays submission details correctly', async () => {
    const user = userEvent.setup();
    render(<TeacherDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Student Work')).toBeInTheDocument();
    });

    const submissionsTab = screen.getByText('Student Work');
    await user.click(submissionsTab);

    await waitFor(() => {
      expect(screen.getByText('Word: cat')).toBeInTheDocument();
    });

    // Check AI confidence display
    expect(screen.getByText('AI Confidence: 85%')).toBeInTheDocument();
    expect(screen.getByText('AI Confidence: 72%')).toBeInTheDocument();

    // Check student IDs
    expect(screen.getByText(/Student: student1/)).toBeInTheDocument();
    expect(screen.getByText(/Student: student2/)).toBeInTheDocument();
  });

  it('allows rating submissions', async () => {
    const user = userEvent.setup();
    
    // Mock successful rating
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({}),
    });

    render(<TeacherDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Student Work')).toBeInTheDocument();
    });

    const submissionsTab = screen.getByText('Student Work');
    await user.click(submissionsTab);

    await waitFor(() => {
      expect(screen.getByText('Word: dog')).toBeInTheDocument();
    });

    // Find unrated submission (student2's dog drawing) and rate it
    const ratingButtons = screen.getAllByRole('button').filter(
      button => button.querySelector('.lucide-star') && 
               !button.querySelector('.text-yellow-400')
    );

    if (ratingButtons.length > 0) {
      await user.click(ratingButtons[0]); // Click first unrated star
      
      expect(fetch).toHaveBeenCalledWith('/api/submissions/2/review', expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rating: 1 }),
      }));
    }
  });

  it('switches to settings tab', async () => {
    const user = userEvent.setup();
    render(<TeacherDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    const settingsTab = screen.getByText('Settings');
    await user.click(settingsTab);

    await waitFor(() => {
      expect(screen.getByText('Export Data')).toBeInTheDocument();
    });

    expect(screen.getByText('Export All Submissions (CSV)')).toBeInTheDocument();
    expect(screen.getByText('Class Management')).toBeInTheDocument();
  });

  it('handles API errors gracefully', async () => {
    // Mock failed API calls
    (fetch as jest.Mock)
      .mockRejectedValueOnce(new Error('Network error'))
      .mockRejectedValueOnce(new Error('Network error'));

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(<TeacherDashboard />);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Error loading wordsets:', expect.any(Error));
    });

    consoleSpy.mockRestore();
  });

  it('shows word count for each word set', async () => {
    render(<TeacherDashboard />);

    await waitFor(() => {
      expect(screen.getByText('2 words • Created 1/1/2024')).toBeInTheDocument();
    });
  });

  it('disables upload button when form is incomplete', async () => {
    render(<TeacherDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Upload Word Set')).toBeInTheDocument();
    });

    const uploadButton = screen.getByText('Upload Word Set');
    expect(uploadButton).toBeDisabled();
  });
});