import React from 'react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@material-ui/core';
import {
  render,
  waitFor,
} from '../../../../../../../__tests__/util/testingLibraryReactMock';
import { getTopBarMock } from '../../TopBar.mock';
import TestWrapper from '../../../../../../../__tests__/util/TestWrapper';
import theme from '../../../../../../theme';
import ProfileMenu from './ProfileMenu';

describe('ProfileMenu', () => {
  it('default', async () => {
    const { getByTestId, queryByText, getByText } = render(
      <ThemeProvider theme={theme}>
        <TestWrapper mocks={[getTopBarMock()]}>
          <ProfileMenu />
        </TestWrapper>
      </ThemeProvider>,
    );
    await waitFor(() => expect(getByText('John Smith')).toBeInTheDocument());
    userEvent.click(getByTestId('profileMenuButton'));
    expect(queryByText('Manage Organizations')).toBeInTheDocument();
    expect(queryByText('Admin Console')).toBeInTheDocument();
    expect(queryByText('Backend Admin')).toBeInTheDocument();
    expect(queryByText('Sidekiq')).toBeInTheDocument();
  });
});
