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
    expect(queryByText('You do not have any appeals.')).toBeInTheDocument();
    expect(
      queryByText('You do not have a primary appeal.'),
    ).not.toBeInTheDocument();
  });

  it('primary', () => {
    const { queryByText } = render(
      <TestWrapper>
        <NoAppeals primary />
      </TestWrapper>,
    );
    expect(queryByText('You do not have any appeals.')).not.toBeInTheDocument();
    expect(
      queryByText('You do not have a primary appeal.'),
    ).toBeInTheDocument();
  });
});
