import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import DynamicPreview from '../DynamicPreview';

describe('DynamicPreview', () => {
  test('renders preview component', async () => {
    render(<DynamicPreview documentId="utah-3day-notice" data={{}} />);
    
    await waitFor(() => {
      expect(screen.getByText(/Fill out the form/i)).toBeInTheDocument();
    });
  });

  test('shows message when no data', async () => {
    render(<DynamicPreview documentId="utah-3day-notice" data={null} />);
    
    await waitFor(() => {
      expect(screen.getByText(/Fill out the form to see a preview/i)).toBeInTheDocument();
    });
  });

  test('renders preview with data', async () => {
    const data = {
      tenantNames: 'John Doe',
      street: '123 Main St',
      city: 'Salt Lake City',
      state: 'UT',
      zipCode: '84101',
      pastDueAmount: '1200',
      landlordName: 'ABC Property'
    };

    render(<DynamicPreview documentId="utah-3day-notice" data={data} />);
    
    await waitFor(() => {
      expect(screen.getByText('Preview')).toBeInTheDocument();
      expect(screen.getByText(/John Doe/)).toBeInTheDocument();
      expect(screen.getByText(/123 Main St/)).toBeInTheDocument();
    });
  });

  test('formats currency values', async () => {
    const data = {
      tenantNames: 'John Doe',
      pastDueAmount: '1200'
    };

    render(<DynamicPreview documentId="utah-3day-notice" data={data} />);
    
    await waitFor(() => {
      expect(screen.getByText(/\$1,200\.00/)).toBeInTheDocument();
    });
  });

  test('updates preview when data changes', async () => {
    const { rerender } = render(
      <DynamicPreview documentId="utah-3day-notice" data={{ tenantNames: 'John' }} />
    );
    
    await waitFor(() => {
      expect(screen.getByText(/John/)).toBeInTheDocument();
    });

    rerender(
      <DynamicPreview documentId="utah-3day-notice" data={{ tenantNames: 'Jane' }} />
    );
    
    await waitFor(() => {
      expect(screen.getByText(/Jane/)).toBeInTheDocument();
    });
  });

  test('handles rent increase document', async () => {
    const data = {
      tenantNames: 'Jane Smith',
      currentRent: '1200',
      newRent: '1350'
    };

    render(<DynamicPreview documentId="utah-rent-increase" data={data} />);
    
    await waitFor(() => {
      expect(screen.getByText(/Jane Smith/)).toBeInTheDocument();
      expect(screen.getByText(/\$1,200\.00/)).toBeInTheDocument();
      expect(screen.getByText(/\$1,350\.00/)).toBeInTheDocument();
    });
  });
});
