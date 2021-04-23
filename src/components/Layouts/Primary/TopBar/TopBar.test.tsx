import React from 'react';
import { render } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import userEvent from '@testing-library/user-event';
import { AppState } from '../../../App/rootReducer';
import { useApp } from '../../../App';
import { getNotificationsMocks } from './Items/NotificationMenu/NotificationMenu.mock';
import { getTopBarMultipleMock } from './TopBar.mock';
import TopBar from './TopBar';
import { ThemeProvider } from '@material-ui/core';
import theme from '../../../../theme';

let state: AppState;
const dispatch = jest.fn();

jest.mock('../../../App', () => ({
  useApp: jest.fn(),
}));

describe('TopBar', () => {
  const mocks = [getTopBarMultipleMock(), ...getNotificationsMocks()];
  beforeEach(() => {
    state = { accountListId: 'accountListId-1', breadcrumb: '' };
    (useApp as jest.Mock).mockReturnValue({
      state,
      dispatch,
    });
  });

  it('has correct defaults', () => {
    const { queryByText, getByTestId } = render(
      <ThemeProvider theme={theme}>
        <MockedProvider mocks={mocks} addTypename={false}>
          <TopBar />
        </MockedProvider>
      </ThemeProvider>,
    );
    userEvent.click(getByTestId('profileMenuButton'));
    expect(queryByText('Manage Organizations')).not.toBeInTheDocument();
    expect(queryByText('Admin Console')).not.toBeInTheDocument();
    expect(queryByText('Backend Admin')).not.toBeInTheDocument();
    expect(queryByText('Sidekiq')).not.toBeInTheDocument();
  });
});
