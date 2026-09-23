import React from 'react';
import { render } from '@testing-library/react';
import { AssistantErrorBoundary } from './AssistantErrorBoundary';

const Thrower: React.FC = () => {
  throw new Error('Bad reply');
};

describe('AssistantErrorBoundary', () => {
  let errorSpy: jest.SpyInstance;

  beforeEach(() => {
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    errorSpy.mockRestore();
  });

  it('renders its children', () => {
    const { getByText } = render(
      <AssistantErrorBoundary>
        <p>Fine</p>
      </AssistantErrorBoundary>,
    );

    expect(getByText('Fine')).toBeInTheDocument();
  });

  it('renders the fallback when a child throws', () => {
    const { getByText } = render(
      <AssistantErrorBoundary>
        <Thrower />
      </AssistantErrorBoundary>,
    );

    expect(
      getByText('Something went wrong showing this reply.'),
    ).toBeInTheDocument();
  });
});
