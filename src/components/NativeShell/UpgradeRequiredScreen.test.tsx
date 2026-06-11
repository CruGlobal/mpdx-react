import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import userEvent from '@testing-library/user-event';
import { signOut } from 'next-auth/react';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { render, waitFor } from '__tests__/util/testingLibraryReactMock';
import { clearApolloData } from 'src/lib/apollo/clearApolloData';
import { clearDataDogUser } from 'src/lib/dataDog';
import { getDevicePlatform } from 'src/lib/nativeShell/nativeShell';
import theme from 'src/theme';
import { UpgradeRequiredScreen } from './UpgradeRequiredScreen';

jest.mock('src/lib/nativeShell/nativeShell');
jest.mock('src/lib/apollo/clearApolloData');
jest.mock('src/lib/dataDog');

const getDevicePlatformMock = getDevicePlatform as jest.MockedFunction<
  typeof getDevicePlatform
>;

const TestComponent: React.FC = () => (
  <ThemeProvider theme={theme}>
    <GqlMockedProvider>
      <UpgradeRequiredScreen />
    </GqlMockedProvider>
  </ThemeProvider>
);

describe('UpgradeRequiredScreen', () => {
  it('renders the upgrade message', () => {
    getDevicePlatformMock.mockReturnValue('APNS');
    const { getByRole, getByText } = render(<TestComponent />);

    expect(
      getByRole('heading', { name: 'Update Required' }),
    ).toBeInTheDocument();
    expect(
      getByText(
        'This version of the MPDX app is no longer supported. Update to the latest version to keep using MPDX.',
      ),
    ).toBeInTheDocument();
  });

  it('links to the App Store on iOS', () => {
    getDevicePlatformMock.mockReturnValue('APNS');
    const { getByRole } = render(<TestComponent />);

    expect(getByRole('link', { name: 'Update MPDX' })).toHaveAttribute(
      'href',
      expect.stringContaining('apps.apple.com'),
    );
  });

  it('links to Google Play on Android', () => {
    getDevicePlatformMock.mockReturnValue('GCM');
    const { getByRole } = render(<TestComponent />);

    expect(getByRole('link', { name: 'Update MPDX' })).toHaveAttribute(
      'href',
      expect.stringContaining('play.google.com'),
    );
  });

  it('renders a working sign out affordance', async () => {
    getDevicePlatformMock.mockReturnValue('APNS');
    const { getByRole } = render(<TestComponent />);

    const signOutButton = getByRole('button', { name: 'Sign Out' });
    expect(signOutButton).toBeEnabled();
    userEvent.click(signOutButton);

    await waitFor(() =>
      expect(signOut).toHaveBeenCalledWith({ callbackUrl: 'signOut' }),
    );
    expect(clearApolloData).toHaveBeenCalled();
    expect(clearDataDogUser).toHaveBeenCalled();
  });
});
