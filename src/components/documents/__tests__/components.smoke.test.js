import React from 'react';
import { render } from '@testing-library/react';
import { DocumentSelector, DynamicForm, DynamicPreview, FieldRenderer } from '../index';

describe('Components Smoke Tests', () => {
  test('DocumentSelector renders without crashing', () => {
    const { container } = render(<DocumentSelector stateCode="UT" />);
    expect(container).toBeInTheDocument();
  });

  test('DynamicForm renders without crashing', () => {
    const { container } = render(<DynamicForm documentId="utah-3day-notice" />);
    expect(container).toBeInTheDocument();
  });

  test('DynamicPreview renders without crashing', () => {
    const { container } = render(<DynamicPreview documentId="utah-3day-notice" data={{}} />);
    expect(container).toBeInTheDocument();
  });

  test('FieldRenderer renders without crashing', () => {
    const field = {
      id: 'test',
      label: 'Test',
      type: 'text'
    };
    const { container } = render(
      <FieldRenderer field={field} value="" onChange={() => {}} />
    );
    expect(container).toBeInTheDocument();
  });

  test('all components export correctly', () => {
    expect(DocumentSelector).toBeDefined();
    expect(DynamicForm).toBeDefined();
    expect(DynamicPreview).toBeDefined();
    expect(FieldRenderer).toBeDefined();
  });
});
