import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import TestRouter from '__tests__/util/TestRouter';
import TestWrapper from '__tests__/util/TestWrapper';
import matchMediaMock from '__tests__/util/matchMediaMock';
import { SetupProvider } from 'src/components/Setup/SetupProvider';
import theme from '../../../theme';
import { getNotificationsMocks } from './TopBar/Items/NotificationMenu/NotificationMenu.mock';
import { getTopBarMock } from './TopBar/TopBar.mock';
import Primary from '.';

const router = {
  query: { accountListId: 'accountListId' },
  isReady: true,
};

describe('Primary', () => {
  const mocks = [...getNotificationsMocks(), getTopBarMock()];
  beforeEach(() => {
    matchMediaMock({ width: '1024px' });
  });

  const renderPrimary = () =>
    render(
      <ThemeProvider theme={theme}>
        <TestWrapper mocks={mocks}>
          <TestRouter router={router}>
            <SetupProvider>
              <Primary>
                <div data-testid="PrimaryTestChildren"></div>
              </Primary>
            </SetupProvider>
          </TestRouter>
        </TestWrapper>
      </ThemeProvider>,
    );

  it('has correct defaults', () => {
    const { getByTestId } = renderPrimary();
    expect(getByTestId('PrimaryTestChildren')).toBeInTheDocument();
  });

  it('only shows a horizontal scrollbar when the page is too wide', () => {
    const { container } = renderPrimary();

    expect(container.firstElementChild).toHaveStyle({
      overflowX: 'auto',
      overflowY: 'scroll',
    });
  });
});
