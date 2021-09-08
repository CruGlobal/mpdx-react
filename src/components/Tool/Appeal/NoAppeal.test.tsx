import React from 'react';
import { render } from '@testing-library/react';
import TestWrapper from '../../../../__tests__/util/TestWrapper';
import NoAppeals from './NoAppeals';

describe('NoAppeals', () => {
  it('regular', () => {
    const { queryByText } = render(
      <TestWrapper>
        <NoAppeals />
      </TestWrapper>,
    );
    expect(queryByText('No Appeals have been setup yet.')).toBeInTheDocument();
    expect(
      queryByText('No Primary Appeal has been selected.'),
    ).not.toBeInTheDocument();
  });

  it('primary', () => {
    const { queryByText } = render(
      <TestWrapper>
        <NoAppeals primary />
      </TestWrapper>,
    );
    expect(
      queryByText('No Appeals have been setup yet.'),
    ).not.toBeInTheDocument();
    expect(
      queryByText('No Primary Appeal has been selected.'),
    ).toBeInTheDocument();
  });
});
