import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import FieldRenderer from '../FieldRenderer';

describe('FieldRenderer', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  test('renders text input', () => {
    const field = {
      id: 'name',
      label: 'Name',
      type: 'text',
      required: true
    };

    render(<FieldRenderer field={field} value="" onChange={mockOnChange} />);
    
    expect(screen.getByLabelText(/Name/)).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  test('renders textarea', () => {
    const field = {
      id: 'notes',
      label: 'Notes',
      type: 'textarea'
    };

    render(<FieldRenderer field={field} value="" onChange={mockOnChange} />);
    
    expect(screen.getByLabelText(/Notes/)).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveAttribute('rows', '4');
  });

  test('renders select dropdown', () => {
    const field = {
      id: 'type',
      label: 'Type',
      type: 'select',
      options: [
        { value: 'a', label: 'Option A' },
        { value: 'b', label: 'Option B' }
      ]
    };

    render(<FieldRenderer field={field} value="" onChange={mockOnChange} />);
    
    expect(screen.getByLabelText(/Type/)).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByText('Option A')).toBeInTheDocument();
    expect(screen.getByText('Option B')).toBeInTheDocument();
  });

  test('renders date input', () => {
    const field = {
      id: 'date',
      label: 'Date',
      type: 'date'
    };

    render(<FieldRenderer field={field} value="" onChange={mockOnChange} />);
    
    const input = screen.getByLabelText(/Date/);
    expect(input).toHaveAttribute('type', 'date');
  });

  test('renders email input', () => {
    const field = {
      id: 'email',
      label: 'Email',
      type: 'email'
    };

    render(<FieldRenderer field={field} value="" onChange={mockOnChange} />);
    
    const input = screen.getByLabelText(/Email/);
    expect(input).toHaveAttribute('type', 'email');
  });

  test('renders phone input', () => {
    const field = {
      id: 'phone',
      label: 'Phone',
      type: 'phone'
    };

    render(<FieldRenderer field={field} value="" onChange={mockOnChange} />);
    
    const input = screen.getByLabelText(/Phone/);
    expect(input).toHaveAttribute('type', 'tel');
  });

  test('renders currency input', () => {
    const field = {
      id: 'amount',
      label: 'Amount',
      type: 'currency'
    };

    render(<FieldRenderer field={field} value="" onChange={mockOnChange} />);
    
    const input = screen.getByLabelText(/Amount/);
    expect(input).toHaveAttribute('type', 'number');
    expect(input).toHaveAttribute('step', '0.01');
  });

  test('shows required indicator', () => {
    const field = {
      id: 'name',
      label: 'Name',
      type: 'text',
      required: true
    };

    render(<FieldRenderer field={field} value="" onChange={mockOnChange} />);
    
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  test('displays error message', () => {
    const field = {
      id: 'name',
      label: 'Name',
      type: 'text'
    };

    render(
      <FieldRenderer 
        field={field} 
        value="" 
        onChange={mockOnChange}
        error="This field is required"
      />
    );
    
    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  test('calls onChange when value changes', () => {
    const field = {
      id: 'name',
      label: 'Name',
      type: 'text'
    };

    render(<FieldRenderer field={field} value="" onChange={mockOnChange} />);
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'John' } });
    
    expect(mockOnChange).toHaveBeenCalledWith('name', 'John');
  });

  test('displays current value', () => {
    const field = {
      id: 'name',
      label: 'Name',
      type: 'text'
    };

    render(<FieldRenderer field={field} value="John Doe" onChange={mockOnChange} />);
    
    expect(screen.getByRole('textbox')).toHaveValue('John Doe');
  });
});
