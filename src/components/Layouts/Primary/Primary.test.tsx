import * as nextRouter from 'next/router';
import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import TestWrapper from '__tests__/util/TestWrapper';
import matchMediaMock from '__tests__/util/matchMediaMock';
import { SetupProvider } from 'src/components/Setup/SetupProvider';
import theme from '../../../theme';
import { getNotificationsMocks } from './TopBar/Items/NotificationMenu/NotificationMenu.mock';
import { getTopBarMock } from './TopBar/TopBar.mock';
import Primary from '.';

describe('Primary', () => {
  const useRouter = jest.spyOn(nextRouter, 'useRouter');
  const mocks = [...getNotificationsMocks(), getTopBarMock()];
  beforeEach(() => {
    matchMediaMock({ width: '1024px' });
    (
      useRouter as jest.SpyInstance<
        Pick<nextRouter.NextRouter, 'query' | 'isReady'>
      >
    ).mockImplementation(() => ({
      query: { accountListId: 'accountListId' },
      isReady: true,
    }));
  });

  it('has correct defaults', () => {
    const { getByTestId } = render(
      <ThemeProvider theme={theme}>
        <TestWrapper mocks={mocks}>
          <SetupProvider>
            <Primary>
              <div data-testid="PrimaryTestChildren"></div>
            </Primary>
          </SetupProvider>
        </TestWrapper>
      </ThemeProvider>,
    );
    expect(getByTestId('PrimaryTestChildren')).toBeInTheDocument();
  });
});
