import React from 'react';
import { MockedProvider } from '@apollo/client/testing';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
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
          mocks={[getTopBarMultipleMock(), ...getNotificationsMocks()]}
          addTypename={false}
        >
          <TestSetupProvider onSetupTour={onSetupTour}>
            <TopBar
              accountListId={accountListId}
              onMobileNavOpen={onMobileNavOpen}
            />
          </TestSetupProvider>
        </MockedProvider>
      </TestRouter>
    </ThemeProvider>
  </SnackbarProvider>
);

describe('TopBar', () => {
  it('default', () => {
    const { getByTestId, getByText } = render(<TestComponent />);

    expect(getByTestId('TopBar')).toBeInTheDocument();
    expect(getByText('Dashboard')).toBeInTheDocument();
  });

  it('hides links during the setup tour', () => {
    const { queryByText } = render(<TestComponent onSetupTour />);

    expect(queryByText('Dashboard')).not.toBeInTheDocument();
  });
});
