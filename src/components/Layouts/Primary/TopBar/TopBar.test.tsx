import React from 'react';
import { MockedProvider } from '@apollo/client/testing';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { mockSession } from '__tests__/util/mockSession';
import { AssistantProvider } from 'src/components/Assistant/AssistantProvider';
import { getAssistantSettingsMock } from 'src/components/Assistant/AssistantSettings.mock';
import { TestSetupProvider } from 'src/components/Setup/SetupProvider';
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

interface TestComponentProps {
  onSetupTour?: boolean;
}

const TestComponent: React.FC<TestComponentProps> = ({ onSetupTour }) => (
  <SnackbarProvider>
    <ThemeProvider theme={theme}>
      <TestRouter router={router}>
        <MockedProvider
          mocks={[
            getTopBarMultipleMock(),
            ...getNotificationsMocks(),
            getAssistantSettingsMock({ enabled: true }),
          ]}
          addTypename={false}
        >
          <TestSetupProvider onSetupTour={onSetupTour}>
            <AssistantProvider>
              <TopBar
                accountListId={accountListId}
                onMobileNavOpen={onMobileNavOpen}
              />
            </AssistantProvider>
          </TestSetupProvider>
        </MockedProvider>
      </TestRouter>
    </ThemeProvider>
  </SnackbarProvider>
);

describe('TopBar', () => {
  afterEach(() => {
    process.env.DEVELOPMENT_ENV = 'false';
    mockSession({});
  });

  it('default', () => {
    const { getByTestId, getByText } = render(<TestComponent />);

    expect(getByTestId('TopBar')).toBeInTheDocument();
    expect(getByText('Dashboard')).toBeInTheDocument();
  });

  it('hides links during the setup tour', () => {
    const { queryByText } = render(<TestComponent onSetupTour />);

    expect(queryByText('Dashboard')).not.toBeInTheDocument();
  });

  it('shows the assistant launcher for a developer in a development env', async () => {
    process.env.DEVELOPMENT_ENV = 'true';
    mockSession({ developer: true });

    const { findByRole } = render(<TestComponent />);

    expect(
      await findByRole('button', { name: 'Open MPDX Guide' }),
    ).toBeInTheDocument();
  });
});
