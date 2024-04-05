import * as nextRouter from 'next/router';
import React from 'react';
import { MockedProvider } from '@apollo/client/testing';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import { SnackbarProvider } from 'notistack';
import TestRouter from '../../../../../__tests__/util/TestRouter';
import theme from '../../../../theme';
import { getNotificationsMocks } from './Items/NotificationMenu/NotificationMenu.mock';
import TopBar from './TopBar';
import { getTopBarMultipleMock } from './TopBar.mock';

const accountListId = 'accountListId';
const onMobileNavOpen = jest.fn();

const router = {
  query: { accountListId },
  isReady: true,
};

const mockEnqueue = jest.fn();

jest.mock('notistack', () => ({
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  ...jest.requireActual('notistack'),
  useSnackbar: () => {
    return {
      enqueueSnackbar: mockEnqueue,
    };
  },
}));

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
      <SnackbarProvider>
        <ThemeProvider theme={theme}>
          <TestRouter router={router}>
            <MockedProvider mocks={mocks} addTypename={false}>
              <TopBar
                accountListId={accountListId}
                onMobileNavOpen={onMobileNavOpen}
              />
            </MockedProvider>
          </TestRouter>
        </ThemeProvider>
      </SnackbarProvider>,
    );

    expect(getByTestId('TopBar')).toBeInTheDocument();
  });
});
