import React from 'react';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TestWrapper from '../../../../../../__tests__/util/TestWrapper';
import AddMenu from './AddMenu';

describe('AddMenu', () => {
  it('default', async () => {
    const { getByRole, getByText } = render(
      <TestWrapper>
        <AddMenu />
      </TestWrapper>,
    );
    userEvent.click(getByRole('button'));
    await waitFor(() => expect(getByText('Add Menu')).toBeInTheDocument());
  });
});
