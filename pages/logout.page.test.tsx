import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import { signOut } from 'next-auth/react';
import TestWrapper from '__tests__/util/TestWrapper';
import { logoutCleanup } from 'src/lib/auth/logoutCleanup';
import theme from 'src/theme';
import LogoutPage from './logout.page';

jest.mock('src/lib/auth/logoutCleanup', () => ({
  logoutCleanup: jest.fn().mockResolvedValue(undefined),
}));

const TestComponent: React.FC = () => (
  <ThemeProvider theme={theme}>
    <TestWrapper>
      <LogoutPage />
    </TestWrapper>
  </ThemeProvider>
);

describe('Logout page', () => {
  it('renders the logout message', () => {
    const { getByText } = render(<TestComponent />);

    expect(
      getByText("You're currently being logged out."),
    ).toBeInTheDocument();
  });

  it('runs the full logout cleanup chain to completion before signing out', async () => {
    let resolveCleanup!: () => void;
    jest.mocked(logoutCleanup).mockImplementationOnce(
      () =>
        new Promise<void>((resolve) => {
          resolveCleanup = resolve;
        }),
    );
    render(<TestComponent />);

    await waitFor(() => expect(logoutCleanup).toHaveBeenCalledTimes(1));
    // logoutCleanup (push unregister + CacheStorage + DataDog +
    // clearApolloData) must finish — not merely be invoked — before signOut
    // navigates away
    expect(signOut).not.toHaveBeenCalled();

    resolveCleanup();
    await waitFor(() =>
      expect(signOut).toHaveBeenCalledWith({ callbackUrl: 'signOut' }),
    );
  });
});
