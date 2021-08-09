import React from 'react';
import { render } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@material-ui/core';
import * as nextRouter from 'next/router';
import theme from '../../../../theme';
import { getNotificationsMocks } from './Items/NotificationMenu/NotificationMenu.mock';
import { getTopBarMultipleMock } from './TopBar.mock';
import TopBar from './TopBar';

describe('TopBar', () => {
  const useRouter = jest.spyOn(nextRouter, 'useRouter');
  const mocks = [getTopBarMultipleMock(), ...getNotificationsMocks()];
  beforeEach(() => {
    (useRouter as jest.SpyInstance<
      Pick<nextRouter.NextRouter, 'query' | 'isReady'>
    >).mockImplementation(() => ({
      query: { accountListId: 'accountListId' },
      isReady: true,
    }));
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
