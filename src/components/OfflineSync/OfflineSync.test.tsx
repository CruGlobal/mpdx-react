import { MockedProvider } from '@apollo/client/testing';
import { act, render } from '@testing-library/react';
import { useOptionalAccountListId } from 'src/hooks/useAccountListId';
import { useIsOnline } from 'src/hooks/useIsOnline';
import { useIsStandalone } from 'src/hooks/useIsStandalone';
import { useRequiredSession } from 'src/hooks/useRequiredSession';
import { isCachePersistenceEnabled } from 'src/lib/apollo/persistence/cachePersistence';
import { contactsSync } from 'src/lib/offlineSync/contacts/contactsSync';
import { runOfflineSync } from 'src/lib/offlineSync/offlineSync';
import { OfflineSync } from './OfflineSync';

jest.mock('src/hooks/useAccountListId');
jest.mock('src/hooks/useIsOnline');
jest.mock('src/hooks/useIsStandalone');
jest.mock('src/hooks/useRequiredSession');
jest.mock('src/lib/apollo/persistence/cachePersistence');
jest.mock('src/lib/offlineSync/offlineSync');

const TestComponent: React.FC = () => (
  <MockedProvider>
    <OfflineSync />
  </MockedProvider>
);

describe('OfflineSync', () => {
  let idleCallbacks: (() => void)[];
  let accountListId: string | null;
  let standalone: boolean;
  let online: boolean;
  let impersonating: boolean;
  let persistenceEnabled: boolean;

  const setMocks = () => {
    (useOptionalAccountListId as jest.Mock).mockReturnValue(accountListId);
    (useIsStandalone as jest.Mock).mockReturnValue(standalone);
    (useIsOnline as jest.Mock).mockReturnValue(online);
    (useRequiredSession as jest.Mock).mockReturnValue({ impersonating });
    (isCachePersistenceEnabled as jest.Mock).mockReturnValue(
      persistenceEnabled,
    );
  };

  const runIdle = async () => {
    await act(async () => {
      idleCallbacks.splice(0).forEach((callback) => callback());
    });
  };

  beforeEach(() => {
    jest.useFakeTimers();
    idleCallbacks = [];
    accountListId = 'a';
    standalone = true;
    online = true;
    impersonating = false;
    persistenceEnabled = true;
    setMocks();
    (runOfflineSync as jest.Mock).mockResolvedValue('completed');
    window.requestIdleCallback = jest.fn((callback) => {
      idleCallbacks.push(() => callback({} as IdleDeadline));
      return idleCallbacks.length;
    });
    window.cancelIdleCallback = jest.fn();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.resetAllMocks();
    delete (window as Partial<Window>).requestIdleCallback;
    delete (window as Partial<Window>).cancelIdleCallback;
  });

  it('runs each definition for the open account list when idle', async () => {
    render(<TestComponent />);

    expect(runOfflineSync).not.toHaveBeenCalled();

    await runIdle();

    expect(runOfflineSync).toHaveBeenCalledTimes(1);
    expect(runOfflineSync).toHaveBeenCalledWith(
      expect.objectContaining({
        definition: contactsSync,
        accountListId: 'a',
      }),
    );
  });

  it('does not run in a browser tab', async () => {
    standalone = false;
    setMocks();
    render(<TestComponent />);
    await runIdle();

    expect(runOfflineSync).not.toHaveBeenCalled();
  });

  it('does not run while offline', async () => {
    online = false;
    setMocks();
    render(<TestComponent />);
    await runIdle();

    expect(runOfflineSync).not.toHaveBeenCalled();
  });

  it('does not run while impersonating', async () => {
    impersonating = true;
    setMocks();
    render(<TestComponent />);
    await runIdle();

    expect(runOfflineSync).not.toHaveBeenCalled();
  });

  it('does not run when cache persistence is disabled', async () => {
    persistenceEnabled = false;
    setMocks();
    render(<TestComponent />);
    await runIdle();

    expect(runOfflineSync).not.toHaveBeenCalled();
  });

  it('does not run without an account list', async () => {
    accountListId = null;
    setMocks();
    render(<TestComponent />);
    await runIdle();

    expect(runOfflineSync).not.toHaveBeenCalled();
  });

  it('falls back to setTimeout without requestIdleCallback', async () => {
    delete (window as Partial<Window>).requestIdleCallback;
    render(<TestComponent />);

    expect(runOfflineSync).not.toHaveBeenCalled();

    await act(async () => {
      jest.advanceTimersByTime(2000);
    });

    expect(runOfflineSync).toHaveBeenCalledTimes(1);
  });

  it('aborts a running sync when the device goes offline', async () => {
    (runOfflineSync as jest.Mock).mockReturnValue(new Promise(() => {}));
    const { rerender } = render(<TestComponent />);
    await runIdle();
    const { signal } = (runOfflineSync as jest.Mock).mock.calls[0][0];

    expect(signal.aborted).toBe(false);

    online = false;
    setMocks();
    rerender(<TestComponent />);

    expect(signal.aborted).toBe(true);
  });

  it('keeps the previous account list sync running after switching', async () => {
    (runOfflineSync as jest.Mock).mockReturnValue(new Promise(() => {}));
    const { rerender } = render(<TestComponent />);
    await runIdle();
    const { signal } = (runOfflineSync as jest.Mock).mock.calls[0][0];

    accountListId = 'b';
    setMocks();
    rerender(<TestComponent />);
    await runIdle();

    expect(signal.aborted).toBe(false);
    expect(runOfflineSync).toHaveBeenCalledTimes(2);
    expect(runOfflineSync).toHaveBeenLastCalledWith(
      expect.objectContaining({ accountListId: 'b' }),
    );
  });

  it('does not start a second run for an account list that is already syncing', async () => {
    (runOfflineSync as jest.Mock).mockReturnValue(new Promise(() => {}));
    const { rerender } = render(<TestComponent />);
    await runIdle();

    rerender(<TestComponent />);
    await runIdle();

    expect(runOfflineSync).toHaveBeenCalledTimes(1);
  });

  it('cancels the pending idle callback on unmount', async () => {
    const { unmount } = render(<TestComponent />);
    unmount();

    expect(window.cancelIdleCallback).toHaveBeenCalled();
  });

  it('aborts on unmount', async () => {
    (runOfflineSync as jest.Mock).mockReturnValue(new Promise(() => {}));
    const { unmount } = render(<TestComponent />);
    await runIdle();
    const { signal } = (runOfflineSync as jest.Mock).mock.calls[0][0];

    unmount();

    expect(signal.aborted).toBe(true);
  });
});
