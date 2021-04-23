import React from 'react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@material-ui/core';
import {
  render,
  waitFor,
} from '../../../../../../../__tests__/util/testingLibraryReactMock';
import { AppState } from '../../../../../App/rootReducer';
import { useApp } from '../../../../../App';
import { getTopBarMock } from '../../TopBar.mock';
import TestWrapper from '../../../../../../../__tests__/util/TestWrapper';
import theme from '../../../../../../theme';
import ProfileMenu from './ProfileMenu';

let state: AppState;
const dispatch = jest.fn();

describe('ProfileMenu', () => {
  it('default', async () => {
    beforeEach(() => {
      state = { accountListId: '1', breadcrumb: 'Dashboard' };
      (useApp as jest.Mock).mockReturnValue({
        state,
        dispatch,
      });
    });

    const { getByTestId, queryByText, getByText } = render(
      <ThemeProvider theme={theme}>
        <TestWrapper
          initialState={{ accountListId: '1' }}
          mocks={[getTopBarMock()]}
        >
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
