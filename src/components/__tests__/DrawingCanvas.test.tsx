import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DrawingCanvas from '@/components/DrawingCanvas';

// Mock getBoundingClientRect
HTMLElement.prototype.getBoundingClientRect = jest.fn(() => ({
  width: 400,
  height: 400,
  top: 0,
  left: 0,
  bottom: 400,
  right: 400,
  x: 0,
  y: 0,
  toJSON: jest.fn(),
}));

describe('DrawingCanvas', () => {
  const mockOnStrokeUpdate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders canvas with correct dimensions', () => {
    render(
      <DrawingCanvas 
        width={400} 
        height={400} 
        onStrokeUpdate={mockOnStrokeUpdate} 
      />
    );

    const canvas = screen.getByRole('img', { hidden: true }) as HTMLCanvasElement;
    expect(canvas).toBeInTheDocument();
    expect(canvas.width).toBe(400);
    expect(canvas.height).toBe(400);
  });

  it('renders drawing controls', () => {
    render(<DrawingCanvas onStrokeUpdate={mockOnStrokeUpdate} />);

    // Check for size buttons
    expect(screen.getByText('Size:')).toBeInTheDocument();
    
    // Check for color picker
    const colorPicker = screen.getByDisplayValue('#000000');
    expect(colorPicker).toBeInTheDocument();
    expect(colorPicker).toHaveAttribute('type', 'color');

    // Check for control buttons
    expect(screen.getByText('Undo')).toBeInTheDocument();
    expect(screen.getByText('Clear')).toBeInTheDocument();
  });

  it('changes brush size when size button is clicked', async () => {
    const user = userEvent.setup();
    render(<DrawingCanvas onStrokeUpdate={mockOnStrokeUpdate} />);

    // Get size buttons (they contain divs with different sizes)
    const sizeButtons = screen.getAllByRole('button').filter(btn => 
      btn.querySelector('div')
    );

    // Click on medium size button (should have w-2 h-2 class)
    const mediumSizeButton = sizeButtons.find(btn => 
      btn.querySelector('div.w-2.h-2')
    );
    
    if (mediumSizeButton) {
      await user.click(mediumSizeButton);
      expect(mediumSizeButton).toHaveClass('border-blue-500');
    }
  });

  it('changes brush color when color picker is changed', async () => {
    const user = userEvent.setup();
    render(<DrawingCanvas onStrokeUpdate={mockOnStrokeUpdate} />);

    const colorPicker = screen.getByDisplayValue('#000000') as HTMLInputElement;
    
    await user.clear(colorPicker);
    await user.type(colorPicker, '#ff0000');
    
    expect(colorPicker.value).toBe('#ff0000');
  });

  it('disables undo and clear buttons when no strokes exist', () => {
    render(<DrawingCanvas onStrokeUpdate={mockOnStrokeUpdate} />);

    const undoButton = screen.getByText('Undo').parentElement!;
    const clearButton = screen.getByText('Clear').parentElement!;

    expect(undoButton).toBeDisabled();
    expect(clearButton).toBeDisabled();
  });

  it('calls onStrokeUpdate when drawing is performed', async () => {
    render(<DrawingCanvas onStrokeUpdate={mockOnStrokeUpdate} />);

    const canvas = screen.getByRole('img', { hidden: true }) as HTMLCanvasElement;

    // Simulate mouse down, move, and up
    fireEvent.mouseDown(canvas, { clientX: 10, clientY: 10 });
    fireEvent.mouseMove(canvas, { clientX: 20, clientY: 20 });
    fireEvent.mouseUp(canvas);

    await waitFor(() => {
      expect(mockOnStrokeUpdate).toHaveBeenCalled();
    });
  });

  it('handles touch events for drawing', async () => {
    render(<DrawingCanvas onStrokeUpdate={mockOnStrokeUpdate} />);

    const canvas = screen.getByRole('img', { hidden: true }) as HTMLCanvasElement;

    // Simulate touch events
    const touchEvent = {
      touches: [{ clientX: 15, clientY: 15 }],
      preventDefault: jest.fn(),
    };

    fireEvent.touchStart(canvas, touchEvent);
    fireEvent.touchMove(canvas, {
      ...touchEvent,
      touches: [{ clientX: 25, clientY: 25 }],
    });
    fireEvent.touchEnd(canvas);

    await waitFor(() => {
      expect(mockOnStrokeUpdate).toHaveBeenCalled();
    });
  });

  it('clears canvas when clear button is clicked', async () => {
    const user = userEvent.setup();
    render(<DrawingCanvas onStrokeUpdate={mockOnStrokeUpdate} />);

    const canvas = screen.getByRole('img', { hidden: true }) as HTMLCanvasElement;

    // First draw something
    fireEvent.mouseDown(canvas, { clientX: 10, clientY: 10 });
    fireEvent.mouseMove(canvas, { clientX: 20, clientY: 20 });
    fireEvent.mouseUp(canvas);

    await waitFor(() => {
      expect(mockOnStrokeUpdate).toHaveBeenCalled();
    });

    // Clear the canvas
    const clearButton = screen.getByText('Clear').parentElement!;
    await user.click(clearButton);

    expect(mockOnStrokeUpdate).toHaveBeenCalledWith([]);
  });

  it('applies custom className', () => {
    const { container } = render(
      <DrawingCanvas 
        onStrokeUpdate={mockOnStrokeUpdate} 
        className="custom-class"
      />
    );

    const canvasContainer = container.querySelector('.drawing-canvas-container');
    expect(canvasContainer).toHaveClass('custom-class');
  });

  it('prevents default behavior on mouse and touch events', () => {
    render(<DrawingCanvas onStrokeUpdate={mockOnStrokeUpdate} />);

    const canvas = screen.getByRole('img', { hidden: true }) as HTMLCanvasElement;
    const mockPreventDefault = jest.fn();

    // Test mouse events
    fireEvent.mouseDown(canvas, { 
      clientX: 10, 
      clientY: 10, 
      preventDefault: mockPreventDefault 
    });
    
    fireEvent.mouseMove(canvas, { 
      clientX: 20, 
      clientY: 20, 
      preventDefault: mockPreventDefault 
    });

    expect(mockPreventDefault).toHaveBeenCalledTimes(2);
  });
});