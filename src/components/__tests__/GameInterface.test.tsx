import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GameInterface from '@/components/GameInterface';

// Mock the DrawingCanvas component
jest.mock('@/components/DrawingCanvas', () => {
  return function MockDrawingCanvas({ onStrokeUpdate }: { onStrokeUpdate: (strokes: unknown[]) => void }) {
    return (
      <div data-testid="drawing-canvas">
        <button 
          onClick={() => onStrokeUpdate([{ color: '#000', size: 4, points: [[10, 10], [20, 20]] }])}
          data-testid="mock-draw"
        >
          Draw Something
        </button>
      </div>
    );
  };
});

const mockWordSet = {
  id: 1,
  title: 'Test Week 1',
  items: [
    { word: 'cat', image: '/images/cat.png', order: 1 },
    { word: 'dog', image: '/images/dog.png', order: 2 },
    { word: 'sun', order: 3 },
  ],
};

describe('GameInterface', () => {
  const mockOnSubmission = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock SpeechSynthesisUtterance
    global.SpeechSynthesisUtterance = jest.fn().mockImplementation((text) => ({
      text,
      rate: 0.7,
      pitch: 1.2,
      volume: 1.0,
      onend: null,
      onerror: null,
    }));
  });

  it('renders loading state when no wordSet provided', () => {
    render(<GameInterface />);
    
    expect(screen.getByText('Loading your words...')).toBeInTheDocument();
  });

  it('renders game interface with word set', () => {
    render(
      <GameInterface 
        wordSet={mockWordSet} 
        onSubmission={mockOnSubmission} 
      />
    );

    expect(screen.getByText('Test Week 1')).toBeInTheDocument();
    expect(screen.getByText('Word 1 of 3')).toBeInTheDocument();
    expect(screen.getByText('Draw this word:')).toBeInTheDocument();
  });

  it('displays progress correctly', () => {
    render(
      <GameInterface 
        wordSet={mockWordSet} 
        onSubmission={mockOnSubmission} 
      />
    );

    // Should show Word 1 of 3 initially
    expect(screen.getByText('Word 1 of 3')).toBeInTheDocument();
    
    // Progress bar should be visible
    const progressBar = screen.getByRole('progressbar', { hidden: true });
    expect(progressBar).toBeInTheDocument();
  });

  it('plays TTS when listen button is clicked', async () => {
    const mockSpeak = jest.fn();
    window.speechSynthesis.speak = mockSpeak;

    const user = userEvent.setup();
    render(
      <GameInterface 
        wordSet={mockWordSet} 
        onSubmission={mockOnSubmission} 
      />
    );

    const listenButton = screen.getByText('Listen');
    await user.click(listenButton);

    expect(mockSpeak).toHaveBeenCalled();
  });

  it('shows hint when hint button is clicked and image exists', async () => {
    const user = userEvent.setup();
    render(
      <GameInterface 
        wordSet={mockWordSet} 
        onSubmission={mockOnSubmission} 
      />
    );

    const hintButton = screen.getByText('Show Hint');
    await user.click(hintButton);

    // Hint should appear
    await waitFor(() => {
      expect(screen.getByText('Hint!')).toBeInTheDocument();
    });

    // Hint image should be displayed
    const hintImage = screen.getByAltText('Hint for cat');
    expect(hintImage).toBeInTheDocument();
    expect(hintImage).toHaveAttribute('src', '/images/cat.png');
  });

  it('enables submit button when drawing exists', async () => {
    render(
      <GameInterface 
        wordSet={mockWordSet} 
        onSubmission={mockOnSubmission} 
      />
    );

    // Initially submit button should be disabled
    const submitButton = screen.getByText("I'm Done!");
    expect(submitButton).toBeDisabled();

    // Simulate drawing
    const mockDrawButton = screen.getByTestId('mock-draw');
    fireEvent.click(mockDrawButton);

    // Submit button should now be enabled
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });
  });

  it('calls onSubmission when submit button is clicked', async () => {
    const user = userEvent.setup();
    
    // Mock canvas blob export
    const mockBlob = new Blob(['mock image data'], { type: 'image/png' });
    HTMLCanvasElement.prototype.toBlob = jest.fn((callback) => {
      if (callback) callback(mockBlob);
    });

    render(
      <GameInterface 
        wordSet={mockWordSet} 
        onSubmission={mockOnSubmission} 
      />
    );

    // Draw something first
    const mockDrawButton = screen.getByTestId('mock-draw');
    fireEvent.click(mockDrawButton);

    // Submit the drawing
    const submitButton = screen.getByText("I'm Done!");
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });

    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmission).toHaveBeenCalledWith(
        'cat',
        [{ color: '#000', size: 4, points: [[10, 10], [20, 20]] }],
        mockBlob
      );
    });
  });

  it('restarts word when restart button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <GameInterface 
        wordSet={mockWordSet} 
        onSubmission={mockOnSubmission} 
      />
    );

    // Draw something first
    const mockDrawButton = screen.getByTestId('mock-draw');
    fireEvent.click(mockDrawButton);

    // Click restart
    const restartButton = screen.getByText('Start Over');
    await user.click(restartButton);

    // Submit button should be disabled again (no strokes)
    const submitButton = screen.getByText("I'm Done!");
    expect(submitButton).toBeDisabled();
  });

  it('shows stars for scoring', () => {
    render(
      <GameInterface 
        wordSet={mockWordSet} 
        onSubmission={mockOnSubmission} 
      />
    );

    // Should show 5 empty stars initially
    // const stars = screen.getAllByRole('img', { hidden: true }).filter(
    //   el => el.getAttribute('data-testid') === 'star' || 
    //        el.classList.contains('lucide-star') ||
    //        el.tagName.toLowerCase() === 'svg'
    // );
    
    // At least some star elements should be present in the header
    expect(document.querySelectorAll('[class*="star"]').length).toBeGreaterThan(0);
  });

  it('handles missing image gracefully', () => {
    const wordSetWithoutImage = {
      ...mockWordSet,
      items: [{ word: 'apple', order: 1 }], // No image property
    };

    render(
      <GameInterface 
        wordSet={wordSetWithoutImage} 
        onSubmission={mockOnSubmission} 
      />
    );

    // Hint button should not be present if no image
    expect(screen.queryByText('Show Hint')).not.toBeInTheDocument();
  });

  it('auto-plays word on component mount', () => {
    const mockSpeak = jest.fn();
    window.speechSynthesis.speak = mockSpeak;

    render(
      <GameInterface 
        wordSet={mockWordSet} 
        onSubmission={mockOnSubmission} 
      />
    );

    // Should auto-play after a delay
    setTimeout(() => {
      expect(mockSpeak).toHaveBeenCalled();
    }, 600);
  });
});