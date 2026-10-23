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

jest.mock('next-auth/react', () => jest.requireActual('next-auth/react'));

// Stays suspended, like a cache restore that hasn't finished
jest.mock('src/components/CacheRestoreGate/CacheRestoreGate', () => ({
  CacheRestoreGate: () => {
    throw new Promise(() => {});
  },
}));

// DataDog renders inside SessionProvider, so it doubles as a probe of the session
jest.mock(
  'src/components/DataDog/DataDog',
  () => () =>
    jest.requireActual('next-auth/react').useSession().data?.user.name ??
    'No session',
);
jest.mock('src/lib/serviceWorker/register', () => ({
  registerServiceWorker: jest.fn(),
}));

const Page = Object.assign(() => <div>Page</div>, { layout: passThrough });

const pagePropsWithSession = { session };

interface TestComponentProps {
  pageProps?: { session?: typeof session };
  route?: string;
}

const TestComponent: React.FC<TestComponentProps> = ({
  pageProps = pagePropsWithSession,
  route = '/accountLists',
}) => {
  const router = { pathname: route, route };
  return (
    <TestRouter router={router}>
      <App
        Component={Page}
        pageProps={pageProps}
        router={router as unknown as AppProps['router']}
      />
    </TestRouter>
  );
};

describe('App', () => {
  // A context change above the cache restore Suspense boundary while it
  // hydrates makes React drop the server HTML
  it('does not re-render the providers above the cache restore gate when App re-renders', () => {
    const { rerender } = render(<TestComponent />);
    expect(mockProviderRender).toHaveBeenCalledTimes(1);

    rerender(<TestComponent />);

    expect(mockProviderRender).toHaveBeenCalledTimes(1);
  });

  // Client navigation from a page with getServerSideProps to one without it
  it('keeps the session when the next page does not provide one', () => {
    const { getByText, rerender } = render(<TestComponent />);
    expect(getByText('First Last')).toBeInTheDocument();

    rerender(<TestComponent pageProps={{}} />);

    expect(getByText('First Last')).toBeInTheDocument();
  });

  // The service worker shows this page offline, so it must skip the login
  // guard and the cache restore gate like the other public pages
  it('renders the offline page without waiting for the cache restore gate', () => {
    const { getByText } = render(<TestComponent route="/offline" />);

    expect(getByText('Page')).toBeInTheDocument();
  });

  it('holds a signed-in page behind the cache restore gate', () => {
    const { queryByText } = render(<TestComponent />);

    expect(queryByText('Page')).not.toBeInTheDocument();
  });
});
