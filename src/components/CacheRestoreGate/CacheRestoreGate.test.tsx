import React, { Suspense } from 'react';
import {
  ApolloClient,
  ApolloLink,
  ApolloProvider,
  InMemoryCache,
} from '@apollo/client';
import { render, waitFor } from '@testing-library/react';
import { useSession } from 'next-auth/react';
import { session } from '__tests__/fixtures/session';
import {
  isCachePersistenceEnabled,
  startCachePersistence,
  stopCachePersistence,
} from 'src/lib/apollo/persistence/cachePersistence';
import { onSessionEnded } from 'src/lib/apollo/persistence/sessionChannel';
import { addDatadogError } from 'src/lib/dataDog';
import { CacheRestoreGate } from './CacheRestoreGate';

jest.mock('src/lib/apollo/persistence/cachePersistence');
jest.mock('src/lib/apollo/persistence/sessionChannel');
jest.mock('src/lib/dataDog');

const mockIsEnabled = isCachePersistenceEnabled as jest.MockedFn<
  typeof isCachePersistenceEnabled
>;
const mockStart = startCachePersistence as jest.MockedFn<
  typeof startCachePersistence
>;
const mockStop = stopCachePersistence as jest.MockedFn<
  typeof stopCachePersistence
>;
const mockOnSessionEnded = onSessionEnded as jest.MockedFn<
  typeof onSessionEnded
>;
const mockUseSession = useSession as jest.MockedFn<typeof useSession>;

const unsubscribe = jest.fn();
let client: ApolloClient<object>;

const deferred = () => {
  let resolve: () => void = () => {};
  const promise = new Promise<void>((res) => {
    resolve = res;
  });
  return { promise, resolve };
};

const TestComponent: React.FC = () => (
  <ApolloProvider client={client}>
    <Suspense fallback={<div>fallback</div>}>
      <CacheRestoreGate>
        <div>children</div>
      </CacheRestoreGate>
    </Suspense>
  </ApolloProvider>
);

const fireSessionEnded = () => mockOnSessionEnded.mock.calls[0][0]();

describe('CacheRestoreGate', () => {
  beforeEach(() => {
    client = new ApolloClient({
      cache: new InMemoryCache(),
      link: ApolloLink.empty(),
    });
    mockIsEnabled.mockReturnValue(true);
    // The real start is memoized, so every render gets the same promise
    mockStart.mockReturnValue(Promise.resolve());
    mockStop.mockResolvedValue();
    mockOnSessionEnded.mockReturnValue(unsubscribe);
  });

  afterEach(() => {
    mockUseSession.mockReturnValue({
      status: 'authenticated',
      data: session,
      update: () => Promise.resolve(null),
    });
  });

  it('renders the children right away when persistence is disabled', () => {
    mockIsEnabled.mockReturnValue(false);
    const { getByText, queryByText } = render(<TestComponent />);

    expect(getByText('children')).toBeInTheDocument();
    expect(queryByText('fallback')).not.toBeInTheDocument();
    expect(mockStart).not.toHaveBeenCalled();
  });

  it('shows the fallback until the restore finishes', async () => {
    const { promise, resolve } = deferred();
    mockStart.mockReturnValue(promise);
    const { getByText, findByText, queryByText } = render(<TestComponent />);

    expect(getByText('fallback')).toBeInTheDocument();
    expect(queryByText('children')).not.toBeInTheDocument();
    expect(mockStart).toHaveBeenCalledWith({
      cache: client.cache,
      userId: 'user-1',
      impersonating: false,
    });

    resolve();

    expect(await findByText('children')).toBeInTheDocument();
    expect(queryByText('fallback')).not.toBeInTheDocument();
  });

  it('stops persistence while impersonating', async () => {
    mockUseSession.mockReturnValue({
      status: 'authenticated',
      data: { ...session, user: { ...session.user, impersonating: true } },
      update: () => Promise.resolve(null),
    });
    const { findByText } = render(<TestComponent />);

    expect(await findByText('children')).toBeInTheDocument();
    expect(mockStart).toHaveBeenCalledWith(
      expect.objectContaining({ impersonating: true }),
    );
    expect(mockStop).toHaveBeenCalled();
  });

  it('does not stop persistence when not impersonating', async () => {
    const { findByText } = render(<TestComponent />);

    expect(await findByText('children')).toBeInTheDocument();
    expect(mockStop).not.toHaveBeenCalled();
  });

  it('stops persistence and clears the store when the session ends', async () => {
    const clearStore = jest.spyOn(client, 'clearStore');
    const { findByText } = render(<TestComponent />);
    expect(await findByText('children')).toBeInTheDocument();

    fireSessionEnded();

    expect(mockStop).toHaveBeenCalled();
    expect(clearStore).toHaveBeenCalled();
  });

  it('reports a clearStore failure when the session ends', async () => {
    const error = new Error('clearStore failed');
    jest.spyOn(client, 'clearStore').mockRejectedValue(error);
    const { findByText } = render(<TestComponent />);
    expect(await findByText('children')).toBeInTheDocument();

    fireSessionEnded();

    await waitFor(() =>
      expect(addDatadogError).toHaveBeenCalledWith(error, {
        mpdxErrorType: 'cache_persistence',
        step: 'clearStore',
      }),
    );
  });

  it('stops persistence and clears the store when the user changes', async () => {
    const clearStore = jest.spyOn(client, 'clearStore');
    const { findByText, rerender } = render(<TestComponent />);
    expect(await findByText('children')).toBeInTheDocument();

    mockUseSession.mockReturnValue({
      status: 'authenticated',
      data: { ...session, user: { ...session.user, userID: 'user-2' } },
      update: () => Promise.resolve(null),
    });
    rerender(<TestComponent />);

    await waitFor(() => expect(mockStop).toHaveBeenCalled());
    expect(clearStore).toHaveBeenCalled();
  });

  it('keeps persisting when rerendered for the same user', async () => {
    const clearStore = jest.spyOn(client, 'clearStore');
    const { findByText, rerender } = render(<TestComponent />);
    expect(await findByText('children')).toBeInTheDocument();

    mockUseSession.mockReturnValue({
      status: 'authenticated',
      data: { ...session, user: { ...session.user } },
      update: () => Promise.resolve(null),
    });
    rerender(<TestComponent />);
    expect(await findByText('children')).toBeInTheDocument();

    expect(mockStop).not.toHaveBeenCalled();
    expect(clearStore).not.toHaveBeenCalled();
  });

  it('unsubscribes from session-ended messages on unmount', async () => {
    const { findByText, unmount } = render(<TestComponent />);
    expect(await findByText('children')).toBeInTheDocument();
    expect(unsubscribe).not.toHaveBeenCalled();

    unmount();

    expect(unsubscribe).toHaveBeenCalled();
  });
});
