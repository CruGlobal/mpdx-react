import React from 'react';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TestWrapper from '../../../../../../__tests__/util/TestWrapper';
import SearchMenu from '.';

describe('SearchMenu', () => {
  it('default', async () => {
    const { getByRole, getByText } = render(
      <TestWrapper>
        <SearchMenu />
      </TestWrapper>,
    );
    userEvent.click(getByRole('button'));
    await waitFor(() => expect(getByText('Search Menu')).toBeInTheDocument());
  });
});
