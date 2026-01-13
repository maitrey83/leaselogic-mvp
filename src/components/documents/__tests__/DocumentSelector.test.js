import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import DocumentSelector from '../DocumentSelector';

describe('DocumentSelector', () => {
  test('renders document selector', () => {
    render(<DocumentSelector stateCode="UT" />);
    
    expect(screen.getByText('Select Document Type')).toBeInTheDocument();
  });

  test('displays documents for state', () => {
    render(<DocumentSelector stateCode="UT" />);
    
    expect(screen.getByText(/3-Day Notice/i)).toBeInTheDocument();
    expect(screen.getByText(/Rent Increase/i)).toBeInTheDocument();
  });

  test('shows document prices', () => {
    render(<DocumentSelector stateCode="UT" />);
    
    expect(screen.getByText('$9.99')).toBeInTheDocument();
    expect(screen.getByText('$7.99')).toBeInTheDocument();
  });

  test('calls onSelect when document clicked', () => {
    const mockOnSelect = jest.fn();
    render(<DocumentSelector stateCode="UT" onSelect={mockOnSelect} />);
    
    const firstDoc = screen.getByText(/3-Day Notice/i).closest('div');
    fireEvent.click(firstDoc);
    
    expect(mockOnSelect).toHaveBeenCalledWith('utah-3day-notice');
  });

  test('displays document categories', () => {
    render(<DocumentSelector stateCode="UT" />);
    
    expect(screen.getByText('eviction')).toBeInTheDocument();
    expect(screen.getByText('rent-change')).toBeInTheDocument();
  });
});
