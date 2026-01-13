import React, { useState } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DocumentSelector, DynamicForm, DynamicPreview } from '../index';

// Integration test component
const DocumentWorkflow = () => {
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [formData, setFormData] = useState({});

  return (
    <div>
      {!selectedDoc && (
        <DocumentSelector 
          stateCode="UT" 
          onSelect={setSelectedDoc}
        />
      )}
      
      {selectedDoc && (
        <>
          <DynamicForm 
            documentId={selectedDoc}
            onSubmit={setFormData}
          />
          <DynamicPreview 
            documentId={selectedDoc}
            data={formData}
          />
        </>
      )}
    </div>
  );
};

describe('Components Integration', () => {
  test('complete document workflow', async () => {
    render(<DocumentWorkflow />);
    
    // Step 1: Select document
    expect(screen.getByText('Select Document Type')).toBeInTheDocument();
    
    const doc = screen.getByText(/3-Day Notice/i).closest('div');
    fireEvent.click(doc);
    
    // Step 2: Form should appear
    await waitFor(() => {
      expect(screen.getByText(/Utah 3-Day Notice/i)).toBeInTheDocument();
    });
    
    // Step 3: Preview should show "fill out form" message
    await waitFor(() => {
      expect(screen.getByText(/Fill out the form/i)).toBeInTheDocument();
    });
  });

  test('form and preview work together', async () => {
    const [formData, setFormData] = useState({});
    
    const TestComponent = () => (
      <>
        <DynamicForm 
          documentId="utah-3day-notice"
          onSubmit={setFormData}
        />
        <DynamicPreview 
          documentId="utah-3day-notice"
          data={formData}
        />
      </>
    );

    render(<TestComponent />);
    
    await waitFor(() => {
      expect(screen.getByText(/Utah 3-Day Notice/i)).toBeInTheDocument();
    });
  });

  test('selector shows correct documents for state', () => {
    render(<DocumentSelector stateCode="UT" />);
    
    const documents = screen.getAllByRole('heading', { level: 3 });
    expect(documents.length).toBe(2); // Utah has 2 documents
  });

  test('field renderer integrates with dynamic form', async () => {
    render(<DynamicForm documentId="utah-3day-notice" />);
    
    await waitFor(() => {
      // All field types should be rendered
      expect(screen.getByLabelText(/Street Address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Past Due Amount/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Notice Date/i)).toBeInTheDocument();
    });
  });

  test('validation errors display in field renderer', async () => {
    render(<DynamicForm documentId="utah-3day-notice" />);
    
    await waitFor(() => {
      fireEvent.click(screen.getByText('Generate Preview'));
    });

    await waitFor(() => {
      // Validation errors should appear
      const errors = screen.getAllByText(/required/i);
      expect(errors.length).toBeGreaterThan(0);
    });
  });
});
