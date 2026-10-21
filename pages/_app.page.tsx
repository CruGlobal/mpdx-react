import { NextPage } from 'next';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import React, {
  ReactElement,
  Suspense,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { ApolloProvider } from '@apollo/client';
import createEmotionCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import { Box, StyledEngineProvider } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { LocalizationProvider as RawLocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { ErrorBoundary, Provider } from '@rollbar/react';
import { Session } from 'next-auth';
import { SessionProvider } from 'next-auth/react';
import { SnackbarProvider } from 'notistack';
import { I18nextProvider, useTranslation } from 'react-i18next';
import Rollbar from 'rollbar';
import { Announcements } from 'src/components/Announcements/Announcements';
import { CacheRestoreGate } from 'src/components/CacheRestoreGate/CacheRestoreGate';
import DataDog from 'src/components/DataDog/DataDog';
import { DefaultAccountListRedirect } from 'src/components/DefaultAccountListRedirect/DefaultAccountListRedirect';
import { GlobalStyles } from 'src/components/GlobalStyles/GlobalStyles';
import { Helpjuice } from 'src/components/Helpjuice/Helpjuice';
import PrimaryLayout from 'src/components/Layouts/Primary';
import Loading from 'src/components/Loading';
import { OfflineIndicator } from 'src/components/OfflineIndicator/OfflineIndicator';
import { RefetchOnReconnect } from 'src/components/RefetchOnReconnect/RefetchOnReconnect';
import { RouterGuard } from 'src/components/RouterGuard/RouterGuard';
import { SetupProvider } from 'src/components/Setup/SetupProvider';
import { SnackbarUtilsConfigurator } from 'src/components/Snackbar/Snackbar';
import TaskModalProvider from 'src/components/Task/Modal/TaskModalProvider';
import { UserPreferenceProvider } from 'src/components/User/Preferences/UserPreferenceProvider';
import { useLocale } from 'src/hooks/useLocale';
import { useRequiredSession } from 'src/hooks/useRequiredSession';
import makeClient from 'src/lib/apollo/client';
import { suppressedErrorPatterns } from 'src/lib/error';
import i18n from 'src/lib/i18n';
import { addGraphQLErrorsToRollbarItem } from 'src/lib/rollbar';
import { registerServiceWorker } from 'src/lib/serviceWorker/register';
import theme from 'src/theme';
import './helpjuice.css';
import './print.css';

export type PageWithLayout = NextPage & {
  layout?: React.FC;
};

// Wrapper for LocalizationProvider that adds translated button labels and the
// user's preferred locale
const LocalizationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();
  const localeText = useMemo(
    () => ({
      cancelButtonLabel: t('Cancel'),
      clearButtonLabel: t('Clear'),
      okButtonLabel: t('OK'),
      todayButtonLabel: t('Today'),
    }),
    [t],
  );

  return (
    <RawLocalizationProvider
      dateAdapter={AdapterLuxon}
      localeText={localeText}
      adapterLocale={locale}
    >
      {children}
    </RawLocalizationProvider>
  );
};

// This provider contains all components and providers that depend on having an Apollo client or a valid session
// It will not be present on the login page
const GraphQLProviders: React.FC<{
  children: React.ReactNode;
}> = ({ children = null }) => {
  const { apiToken } = useRequiredSession();
  const client = useMemo(() => makeClient(apiToken), [apiToken]);

  return (
    <ApolloProvider client={client}>
      <RefetchOnReconnect />
      <Suspense fallback={<Loading loading />}>
        <CacheRestoreGate>
          <DefaultAccountListRedirect>
            {/* Below the gate because its labels change when translations load,
                and any context change above the gate drops the server HTML */}
            <LocalizationProvider>
              <SetupProvider>
                <UserPreferenceProvider>
                  <TaskModalProvider>{children}</TaskModalProvider>
                </UserPreferenceProvider>
              </SetupProvider>
            </LocalizationProvider>
          </DefaultAccountListRedirect>
        </CacheRestoreGate>
      </Suspense>
    </ApolloProvider>
  );
};

const nonAuthenticatedPages = new Set(['/login', '/404', '/500', '/offline']);

const rollbarConfig: Rollbar.Configuration = {
  accessToken: process.env.ROLLBAR_ACCESS_TOKEN,
  environment: `react_${process.env.NODE_ENV}`,
  codeVersion: process.env.GIT_COMMIT_SHA,
  captureUncaught: true,
  captureUnhandledRejections: true,
  payload: {
    client: {
      javascript: {
        code_version: process.env.GIT_COMMIT_SHA,
      },
    },
  },
  enabled: Boolean(process.env.ROLLBAR_ACCESS_TOKEN),
  checkIgnore: (_, args) => {
    const message = args[0];
    return (
      typeof message === 'string' &&
      suppressedErrorPatterns.some((pattern) => message.includes(pattern))
    );
  },
  transform: addGraphQLErrorsToRollbarItem,
};

// Memoized because a context change above the cache restore Suspense boundary
// while it hydrates makes React drop the server HTML, and Rollbar's Provider
// hands down a new context value every time it renders
const AppProviders = React.memo(function AppProviders({
  session,
  children,
}: {
  session?: Session;
  children: React.ReactNode;
}) {
  const [emotionCache] = useState(() => createEmotionCache({ key: 'css' }));

  return (
    <Provider config={rollbarConfig}>
      <ErrorBoundary>
        <SessionProvider session={session}>
          <I18nextProvider i18n={i18n}>
            <StyledEngineProvider injectFirst>
              <CacheProvider value={emotionCache}>
                <ThemeProvider theme={theme}>
                  <SnackbarProvider maxSnack={3}>
                    <GlobalStyles />
                    {children}
                    <Loading />
                    <OfflineIndicator />
                  </SnackbarProvider>
                </ThemeProvider>
              </CacheProvider>
            </StyledEngineProvider>
          </I18nextProvider>
          <DataDog />
        </SessionProvider>
      </ErrorBoundary>
    </Provider>
  );
});

const App = ({
  Component,
  pageProps,
  router,
}: AppProps<{
  session?: Session;
}>): ReactElement => {
  const Layout = (Component as PageWithLayout).layout || PrimaryLayout;
  const { session } = pageProps;
  const isPublicPage = nonAuthenticatedPages.has(router.pathname);

  const pageContent = useMemo(
    () => (
      <TaskModalProvider>
        <Layout>
          <SnackbarUtilsConfigurator />
          <Helpjuice />
          <Announcements />
          <Box
            sx={(theme) => ({
              fontFamily: theme.typography.fontFamily,
            })}
          >
            <Component {...pageProps} key={router.route} />
          </Box>
        </Layout>
      </TaskModalProvider>
    ),
    [Layout, Component, pageProps, router.route],
  );

  // On the login page and error pages, the user isn't authenticated and
  // doesn't have an API token, so don't include the session or Apollo
  // providers because they require an API token
  const content = useMemo(
    () =>
      isPublicPage ? (
        <LocalizationProvider>{pageContent}</LocalizationProvider>
      ) : (
        <RouterGuard>
          <GraphQLProviders>{pageContent}</GraphQLProviders>
        </RouterGuard>
      ),
    [isPublicPage, pageContent],
  );

  useEffect(() => {
    registerServiceWorker();
  }, []);

  return (
    <>
      <Head>
        <meta
          name="description"
          content="Fundraising software built for ministries, missionaries and churches."
        />
        <meta
          name="viewport"
          content="viewport-fit=cover,width=device-width,initial-scale=1,minimum-scale=1"
        />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <link rel="manifest" href="/manifest.json" />
        <link
          rel="preconnect"
          href={process.env.API_URL}
          crossOrigin="anonymous"
        />
        <link
          href={process.env.NEXT_PUBLIC_MEDIA_FAVICON}
          rel="icon"
          type="image/png"
          sizes="32x32"
        />
        <link
          rel="apple-touch-icon"
          href="/icons/apple-touch-icon-iphone-60x60.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="60x60"
          href="/icons/apple-touch-icon-ipad-76x76.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="114x114"
          href="/icons/apple-touch-icon-iphone-retina-120x120.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="144x144"
          href="/icons/apple-touch-icon-ipad-retina-152x152.png"
        />
        <meta name="apple-mobile-web-app-status-bar-style" content="black" />
      </Head>
      <AppProviders session={session}>{content}</AppProviders>
    </>
  );
};

export default App;
