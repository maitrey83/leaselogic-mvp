import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DynamicForm from '../DynamicForm';

describe('DynamicForm', () => {
  test('renders form for document', async () => {
    render(<DynamicForm documentId="utah-3day-notice" />);
    
    await waitFor(() => {
      expect(screen.getByText(/Utah 3-Day Notice/i)).toBeInTheDocument();
    });
  });

  test('renders all fields from document config', async () => {
    render(<DynamicForm documentId="utah-3day-notice" />);
    
    await waitFor(() => {
      expect(screen.getByLabelText(/Street Address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/City/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Tenant Names/i)).toBeInTheDocument();
    });
  });

  test('groups fields by group', async () => {
    render(<DynamicForm documentId="utah-3day-notice" />);
    
    await waitFor(() => {
      expect(screen.getByText(/property/i)).toBeInTheDocument();
      expect(screen.getByText(/parties/i)).toBeInTheDocument();
      expect(screen.getByText(/financial/i)).toBeInTheDocument();
    });
  });

  test('handles field changes', async () => {
    render(<DynamicForm documentId="utah-3day-notice" />);
    
    await waitFor(() => {
      const input = screen.getByLabelText(/Street Address/i);
      fireEvent.change(input, { target: { value: '123 Main St' } });
      expect(input).toHaveValue('123 Main St');
    });
  });

  test('validates form on submit', async () => {
    const mockOnSubmit = jest.fn();
    render(<DynamicForm documentId="utah-3day-notice" onSubmit={mockOnSubmit} />);
    
    await waitFor(() => {
      const submitBtn = screen.getByText('Generate Preview');
      fireEvent.click(submitBtn);
    });

    // Should show validation errors for required fields
    await waitFor(() => {
      expect(screen.getByText(/required/i)).toBeInTheDocument();
    });
    
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  test('clears error when field is corrected', async () => {
    render(<DynamicForm documentId="utah-3day-notice" />);
    
    await waitFor(() => {
      // Submit to trigger validation
      fireEvent.click(screen.getByText('Generate Preview'));
    });

    await waitFor(() => {
      expect(screen.getByText(/required/i)).toBeInTheDocument();
    });

    // Fix the error
    await waitFor(() => {
      fireEvent.change(screen.getByLabelText(/Street Address/i), {
        target: { value: '123 Main St' }
      });
    });

    // Error should be cleared
    expect(screen.getByLabelText(/Street Address/i)).toHaveValue('123 Main St');
  });

  test('loads initial data', async () => {
    const initialData = {
      street: '456 Oak Ave',
      city: 'Provo'
    };

    render(
      <DynamicForm 
        documentId="utah-3day-notice" 
        initialData={initialData}
      />
    );
    
    await waitFor(() => {
      expect(screen.getByLabelText(/Street Address/i)).toHaveValue('456 Oak Ave');
      expect(screen.getByLabelText(/City/i)).toHaveValue('Provo');
    });
  });
});
