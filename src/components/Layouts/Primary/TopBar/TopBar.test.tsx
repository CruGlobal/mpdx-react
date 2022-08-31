import React from 'react';
import { render } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { ThemeProvider } from '@mui/material';
import * as nextRouter from 'next/router';
import theme from '../../../../theme';
import { getNotificationsMocks } from './Items/NotificationMenu/NotificationMenu.mock';
import { getTopBarMultipleMock } from './TopBar.mock';
import TopBar from './TopBar';

const accountListId = 'accountListId';
const onMobileNavOpen = jest.fn();

describe('TopBar', () => {
  const useRouter = jest.spyOn(nextRouter, 'useRouter');
  const mocks = [getTopBarMultipleMock(), ...getNotificationsMocks()];
  beforeEach(() => {
    (
      useRouter as jest.SpyInstance<
        Pick<nextRouter.NextRouter, 'query' | 'isReady'>
      >
    ).mockImplementation(() => ({
      query: { accountListId },
      isReady: true,
    }));
  });

  it('default', () => {
    const { getByTestId } = render(
      <ThemeProvider theme={theme}>
        <MockedProvider mocks={mocks} addTypename={false}>
          <TopBar
            accountListId={accountListId}
            onMobileNavOpen={onMobileNavOpen}
          />
        </MockedProvider>
      </ThemeProvider>,
    );

    expect(getByTestId('TopBar')).toBeInTheDocument();
  });
});
