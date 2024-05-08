import { NextPage } from 'next';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import React, { ReactElement, useMemo } from 'react';
import { ApolloProvider as RawApolloProvider } from '@apollo/client';
import createEmotionCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import { Box, StyledEngineProvider } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import {
  LocalizationProviderProps,
  LocalizationProvider as RawLocalizationProvider,
} from '@mui/x-date-pickers/LocalizationProvider';
import { ErrorBoundary, Provider } from '@rollbar/react';
import { DateTime } from 'luxon';
import { Session } from 'next-auth';
import { SessionProvider } from 'next-auth/react';
import { SnackbarProvider } from 'notistack';
import { I18nextProvider, useTranslation } from 'react-i18next';
import Rollbar from 'rollbar';
import DataDog from 'src/components/DataDog/DataDog';
import { GlobalStyles } from 'src/components/GlobalStyles/GlobalStyles';
import { HelpBeacon } from 'src/components/HelpBeacon/HelpBeacon';
import PrimaryLayout from 'src/components/Layouts/Primary';
import Loading from 'src/components/Loading';
import { RouterGuard } from 'src/components/RouterGuard/RouterGuard';
import { AlertBanner } from 'src/components/Shared/alertBanner/AlertBanner';
import { SnackbarUtilsConfigurator } from 'src/components/Snackbar/Snackbar';
import TaskModalProvider from 'src/components/Task/Modal/TaskModalProvider';
import { UserPreferenceProvider } from 'src/components/User/Preferences/UserPreferenceProvider';
import { AppSettingsProvider } from 'src/components/common/AppSettings/AppSettingsProvider';
import { useLocale } from 'src/hooks/useLocale';
import { useRequiredSession } from 'src/hooks/useRequiredSession';
import makeClient from 'src/lib/apollo/client';
import i18n from 'src/lib/i18n';
import theme from 'src/theme';
import './print.css';

export type PageWithLayout = NextPage & {
  layout?: React.FC;
};

// Wrapper for LocalizationProvider that adds the user's preferred locale
const LocalizationProvider = (
  props: LocalizationProviderProps<DateTime, string>,
): JSX.Element => {
  const locale = useLocale();

  return <RawLocalizationProvider {...props} adapterLocale={locale} />;
};

// This provider contains all components and providers that depend on having an Apollo client or a valid session
// It will not be present on the login page
const GraphQLProviders: React.FC<{
  children: React.ReactNode;
}> = ({ children = null }) => {
  const { apiToken } = useRequiredSession();
  const client = useMemo(() => makeClient(apiToken), [apiToken]);

  return (
    <RawApolloProvider client={client}>
      <UserPreferenceProvider>
        <TaskModalProvider>{children}</TaskModalProvider>
      </UserPreferenceProvider>
    </RawApolloProvider>
  );
};

const nonAuthenticatedPages = new Set(['/login', '/404', '/500']);

const App = ({
  Component,
  pageProps,
  router,
}: AppProps<{
  session?: Session;
}>): ReactElement => {
  const { t } = useTranslation();
  const Layout = (Component as PageWithLayout).layout || PrimaryLayout;
  const { session } = pageProps;
  const rollbarConfig: Rollbar.Configuration = {
    accessToken: process.env.ROLLBAR_ACCESS_TOKEN,
    environment: 'react_' + process.env.NODE_ENV,
    codeVersion: React.version,
    captureUncaught: true,
    captureUnhandledRejections: true,
    payload: {
      client: {
        javascript: {
          code_version: React.version,
        },
      },
    },
    enabled: !!process.env.ROLLBAR_ACCESS_TOKEN,
  };
  const emotionCache = createEmotionCache({ key: 'css' });

  if (!session && !nonAuthenticatedPages.has(router.pathname)) {
    throw new Error(
      'A session was not provided via page props. Make sure that getServerSideProps for this page returns the session in its props.',
    );
  }

  const pageContent = (
    <TaskModalProvider>
      <Layout>
        <SnackbarUtilsConfigurator />
        <Box
          sx={(theme) => ({
            fontFamily: theme.typography.fontFamily,
          })}
        >
          <Component {...pageProps} key={router.route} />
        </Box>
      </Layout>
    </TaskModalProvider>
  );

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
      <Provider config={rollbarConfig}>
        <ErrorBoundary>
          <AppSettingsProvider>
            <SessionProvider session={session}>
              <I18nextProvider i18n={i18n}>
                <StyledEngineProvider injectFirst>
                  <CacheProvider value={emotionCache}>
                    <ThemeProvider theme={theme}>
                      {process.env.HELP_URL && (
                        <HelpBeacon helpUrl={process.env.HELP_URL} />
                      )}
                      <LocalizationProvider
                        dateAdapter={AdapterLuxon}
                        localeText={{
                          cancelButtonLabel: t('Cancel'),
                          clearButtonLabel: t('Clear'),
                          okButtonLabel: t('OK'),
                          todayButtonLabel: t('Today'),
                        }}
                      >
                        <SnackbarProvider maxSnack={3}>
                          <GlobalStyles />
                          {/* On the login page and error pages, the user isn't not authenticated and doesn't have an API token,
                              so don't include the session or Apollo providers because they require an API token */}
                          {nonAuthenticatedPages.has(router.pathname) ? (
                            pageContent
                          ) : (
                            <RouterGuard>
                              <GraphQLProviders>{pageContent}</GraphQLProviders>
                            </RouterGuard>
                          )}
                          <Loading />
                        </SnackbarProvider>
                      </LocalizationProvider>
                    </ThemeProvider>
                  </CacheProvider>
                </StyledEngineProvider>
              </I18nextProvider>
              <DataDog />
            </SessionProvider>
            {process.env.ALERT_MESSAGE ? (
              <AlertBanner
                text={process.env.ALERT_MESSAGE}
                localStorageName="ALERT_MESSAGE"
              />
            ) : null}
          </AppSettingsProvider>
        </ErrorBoundary>
      </Provider>
    </>
  );
};

export default App;
