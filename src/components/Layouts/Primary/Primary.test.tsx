import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import TestRouter from '__tests__/util/TestRouter';
import TestWrapper from '__tests__/util/TestWrapper';
import matchMediaMock from '__tests__/util/matchMediaMock';
import { mockSession } from '__tests__/util/mockSession';
import { AssistantProvider } from 'src/components/Assistant/AssistantProvider';
import { getAssistantSettingsMock } from 'src/components/Assistant/AssistantSettings.mock';
import {
  SetupProvider,
  TestSetupProvider,
} from 'src/components/Setup/SetupProvider';
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

  it('has correct defaults', () => {
    const { getByTestId } = render(
      <ThemeProvider theme={theme}>
        <TestWrapper mocks={mocks}>
          <TestRouter router={router}>
            <SetupProvider>
              <AssistantProvider>
                <Primary>
                  <div data-testid="PrimaryTestChildren"></div>
                </Primary>
              </AssistantProvider>
            </SetupProvider>
          </TestRouter>
        </TestWrapper>
      </ThemeProvider>,
    );
    expect(getByTestId('PrimaryTestChildren')).toBeInTheDocument();
  });

  describe('Guide orb', () => {
    const renderPrimary = (onSetupTour: boolean) =>
      render(
        <ThemeProvider theme={theme}>
          <TestWrapper
            mocks={[...mocks, getAssistantSettingsMock({ enabled: true })]}
          >
            <TestRouter router={router}>
              <TestSetupProvider onSetupTour={onSetupTour}>
                <AssistantProvider>
                  <Primary>
                    <div />
                  </Primary>
                </AssistantProvider>
              </TestSetupProvider>
            </TestRouter>
          </TestWrapper>
        </ThemeProvider>,
      );

    beforeEach(() => {
      process.env.DEVELOPMENT_ENV = 'true';
      mockSession({ developer: true });
    });

    afterEach(() => {
      process.env.DEVELOPMENT_ENV = 'false';
      mockSession({});
    });

    it('shows beside the top bar button', async () => {
      const { findAllByRole } = renderPrimary(false);

      expect(
        await findAllByRole('button', { name: 'Open MPDX Guide' }),
      ).toHaveLength(2);
    });

    it('stays hidden during the setup tour like the top bar button', async () => {
      const { queryAllByRole } = renderPrimary(true);

      await waitFor(() =>
        expect(
          queryAllByRole('button', { name: 'Open MPDX Guide' }),
        ).toHaveLength(0),
      );
      await new Promise((resolve) => setTimeout(resolve, 50));
      expect(
        queryAllByRole('button', { name: 'Open MPDX Guide' }),
      ).toHaveLength(0);
    });
  });
});
