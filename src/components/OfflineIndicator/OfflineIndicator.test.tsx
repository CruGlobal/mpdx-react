import { act, render, waitFor } from '@testing-library/react';
import { SnackbarProvider } from 'notistack';
import { OfflineIndicator } from './OfflineIndicator';

const offlineMessage = "You're offline. Showing saved data.";

const setOnline = (online: boolean) => {
  jest.spyOn(navigator, 'onLine', 'get').mockReturnValue(online);
};

const goOffline = () => {
  setOnline(false);
  act(() => {
    window.dispatchEvent(new Event('offline'));
  });
};

const goOnline = () => {
  setOnline(true);
  act(() => {
    window.dispatchEvent(new Event('online'));
  });
};

const TestComponent: React.FC = () => (
  <SnackbarProvider>
    <OfflineIndicator />
  </SnackbarProvider>
);

describe('OfflineIndicator', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('shows nothing while online', () => {
    setOnline(true);
    const { queryByText } = render(<TestComponent />);

    expect(queryByText(offlineMessage)).not.toBeInTheDocument();
    expect(queryByText('Back online')).not.toBeInTheDocument();
  });

  it('shows the notice when the page loads offline', async () => {
    setOnline(false);
    const { findByText } = render(<TestComponent />);

    expect(await findByText(offlineMessage)).toBeInTheDocument();
  });

  it('shows the notice when the connection drops', async () => {
    setOnline(true);
    const { findByText } = render(<TestComponent />);

    goOffline();

    expect(await findByText(offlineMessage)).toBeInTheDocument();
  });

  it('keeps the notice up while offline', async () => {
    jest.useFakeTimers();
    setOnline(true);
    const { findByText, getByText } = render(<TestComponent />);

    goOffline();
    expect(await findByText(offlineMessage)).toBeInTheDocument();

    // Longer than notistack's default 5 second auto hide
    act(() => {
      jest.advanceTimersByTime(30_000);
    });
    expect(getByText(offlineMessage)).toBeInTheDocument();
    jest.useRealTimers();
  });

  it('hides the notice and shows a toast when the connection comes back', async () => {
    setOnline(true);
    const { findByText, queryByText } = render(<TestComponent />);

    goOffline();
    expect(await findByText(offlineMessage)).toBeInTheDocument();

    goOnline();

    expect(await findByText('Back online')).toBeInTheDocument();
    await waitFor(() =>
      expect(queryByText(offlineMessage)).not.toBeInTheDocument(),
    );
  });

  it('shows only one notice when the offline event fires twice', async () => {
    setOnline(true);
    const { findByText, getAllByText } = render(<TestComponent />);

    goOffline();
    goOnline();
    goOffline();

    expect(await findByText(offlineMessage)).toBeInTheDocument();
    expect(getAllByText(offlineMessage)).toHaveLength(1);
  });
});
