import type { AppProps } from 'next/app';
import React from 'react';
import { render } from '@testing-library/react';
import { session } from '__tests__/fixtures/session';
import TestRouter from '__tests__/util/TestRouter';
import App from './_app.page';

const mockProviderRender = jest.fn();

const passThrough = ({ children }: { children: React.ReactNode }) => children;

jest.mock('@rollbar/react', () => ({
  Provider: ({ children }: { children: React.ReactNode }) => {
    mockProviderRender();
    return children;
  },
  ErrorBoundary: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('next-auth/react', () => ({
  useSession: () => ({
    status: 'authenticated',
    data: jest.requireActual('__tests__/fixtures/session').session,
  }),
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Stays suspended, like a cache restore that hasn't finished
jest.mock('src/components/CacheRestoreGate/CacheRestoreGate', () => ({
  CacheRestoreGate: () => {
    throw new Promise(() => {});
  },
}));

jest.mock('src/components/DataDog/DataDog', () => () => null);
jest.mock('src/lib/serviceWorker/register', () => ({
  registerServiceWorker: jest.fn(),
}));

const Page = Object.assign(() => <div>Page</div>, { layout: passThrough });

const router = { pathname: '/accountLists', route: '/accountLists' };
const pageProps = { session };

const TestComponent: React.FC = () => (
  <TestRouter router={router}>
    <App
      Component={Page}
      pageProps={pageProps}
      router={router as unknown as AppProps['router']}
    />
  </TestRouter>
);

describe('App', () => {
  // A context change above the cache restore Suspense boundary while it
  // hydrates makes React drop the server HTML
  it('does not re-render the providers above the cache restore gate when App re-renders', () => {
    const { rerender } = render(<TestComponent />);
    expect(mockProviderRender).toHaveBeenCalledTimes(1);

    rerender(<TestComponent />);

    expect(mockProviderRender).toHaveBeenCalledTimes(1);
  });
});
