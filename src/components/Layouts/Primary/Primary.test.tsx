import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import TestRouter from '__tests__/util/TestRouter';
import TestWrapper from '__tests__/util/TestWrapper';
import matchMediaMock from '__tests__/util/matchMediaMock';
import { mockSession } from '__tests__/util/mockSession';
import { AssistantProvider } from 'src/components/Assistant/AssistantProvider';
import { AssistantSettingsDocument } from 'src/components/Assistant/AssistantSettings.generated';
import {
  assistantSettingsMock,
  getAssistantSettingsMock,
} from 'src/components/Assistant/AssistantSettings.mock';
import {
  SetupProvider,
  TestSetupProvider,
} from 'src/components/Setup/SetupProvider';
import { createCache } from 'src/lib/apollo/cache';
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

    it('hides with the top bar button when the Hide the Guide button setting is on', async () => {
      const { queryAllByRole } = render(
        <ThemeProvider theme={theme}>
          <TestWrapper
            mocks={[
              ...mocks,
              {
                request: { query: AssistantSettingsDocument },
                result: {
                  data: {
                    assistantSettings: {
                      __typename: 'AssistantSettings',
                      ...assistantSettingsMock({
                        enabled: true,
                        launcherHidden: true,
                      }),
                    },
                  },
                },
              },
            ]}
            cache={createCache()}
          >
            <TestRouter router={router}>
              <TestSetupProvider onSetupTour={false}>
                <Primary>
                  <div />
                </Primary>
              </TestSetupProvider>
            </TestRouter>
          </TestWrapper>
        </ThemeProvider>,
      );

      await new Promise((resolve) => setTimeout(resolve, 50));
      expect(
        queryAllByRole('button', { name: 'Open MPDX Guide' }),
      ).toHaveLength(0);
    });

    it('hides with the top bar button while impersonating', async () => {
      mockSession({ developer: true, impersonating: true });
      const { queryAllByRole } = renderPrimary(false);

      await new Promise((resolve) => setTimeout(resolve, 50));
      expect(
        queryAllByRole('button', { name: 'Open MPDX Guide' }),
      ).toHaveLength(0);
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
