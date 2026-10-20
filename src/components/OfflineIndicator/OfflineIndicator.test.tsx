import { StrictMode } from 'react';
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

// Snackbar transitions chain timers (hide, then exit), so advance in steps
// for each one to get scheduled and run
const advanceTimersInSteps = (ms: number) => {
  for (let elapsed = 0; elapsed < ms; elapsed += 250) {
    act(() => {
      jest.advanceTimersByTime(250);
    });
  }
};

describe('OfflineIndicator', () => {
  afterEach(() => {
    jest.useRealTimers();
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

  it('shows one notice and clears it under StrictMode', async () => {
    jest.useFakeTimers();
    setOnline(false);
    // StrictMode runs effects twice in dev, which must not leave an extra notice behind
    const { findByText, getAllByText, queryByText } = render(
      <StrictMode>
        <TestComponent />
      </StrictMode>,
    );

    expect(await findByText(offlineMessage)).toBeInTheDocument();
    advanceTimersInSteps(3_000);
    expect(getAllByText(offlineMessage)).toHaveLength(1);

    goOnline();
    advanceTimersInSteps(3_000);
    expect(queryByText(offlineMessage)).not.toBeInTheDocument();
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
    advanceTimersInSteps(30_000);
    expect(getByText(offlineMessage)).toBeInTheDocument();
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

  it('shows the notice again when the connection drops right after coming back', async () => {
    jest.useFakeTimers();
    setOnline(true);
    const { findByText, getAllByText } = render(<TestComponent />);

    goOffline();
    expect(await findByText(offlineMessage)).toBeInTheDocument();

    // Drop again while the first notice is still closing
    goOnline();
    goOffline();

    // Wait out the first notice's exit transition
    advanceTimersInSteps(3_000);
    expect(getAllByText(offlineMessage)).toHaveLength(1);
  });
});
