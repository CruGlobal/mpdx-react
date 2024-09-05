import React from 'react';
import { MockedProvider } from '@apollo/client/testing';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { useSetupContext } from 'src/components/Setup/SetupProvider';
import theme from '../../../../theme';
import { getNotificationsMocks } from './Items/NotificationMenu/NotificationMenu.mock';
import TopBar from './TopBar';
import { getTopBarMultipleMock } from './TopBar.mock';

jest.mock('src/components/Setup/SetupProvider');

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

const TestComponent = () => (
  <SnackbarProvider>
    <ThemeProvider theme={theme}>
      <TestRouter router={router}>
        <MockedProvider
          mocks={[getTopBarMultipleMock(), ...getNotificationsMocks()]}
          addTypename={false}
        >
          <TopBar
            accountListId={accountListId}
            onMobileNavOpen={onMobileNavOpen}
          />
        </MockedProvider>
      </TestRouter>
    </ThemeProvider>
  </SnackbarProvider>
);

describe('TopBar', () => {
  it('default', () => {
    (useSetupContext as jest.MockedFn<typeof useSetupContext>).mockReturnValue({
      onSetupTour: false,
    });

    const { getByTestId, getByText } = render(<TestComponent />);

    expect(getByTestId('TopBar')).toBeInTheDocument();
    expect(getByText('Dashboard')).toBeInTheDocument();
  });

  it('hides links during the setup tour', () => {
    (useSetupContext as jest.MockedFn<typeof useSetupContext>).mockReturnValue({
      onSetupTour: true,
    });

    const { queryByText } = render(<TestComponent />);

    expect(queryByText('Dashboard')).not.toBeInTheDocument();
  });
});
