import React, { ReactElement } from 'react';
import Rollbar from 'rollbar';
import { ErrorBoundary, Provider } from '@rollbar/react';
import type { AppProps } from 'next/app';
import StyledEngineProvider from '@mui/material/StyledEngineProvider';
import { ThemeProvider } from '@mui/material/styles';
import { Box } from '@mui/material';
import { ApolloProvider } from '@apollo/client';
import { AnimatePresence } from 'framer-motion';
import { Session } from 'next-auth';
import { SessionProvider } from 'next-auth/react';
import { NextPage } from 'next';
import Head from 'next/head';
import { I18nextProvider, useTranslation } from 'react-i18next';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { SnackbarProvider } from 'notistack';
import theme from '../src/theme';
import './helpscout.css';
import client from '../src/lib/client';
import PrimaryLayout from '../src/components/Layouts/Primary';
import Loading from '../src/components/Loading';
import i18n from '../src/lib/i18n';
import TaskModalProvider from '../src/components/Task/Modal/TaskModalProvider';
import { SnackbarUtilsConfigurator } from '../src/components/Snackbar/Snackbar';
import { GlobalStyles } from '../src/components/GlobalStyles/GlobalStyles';
import { RouterGuard } from '../src/components/RouterGuard/RouterGuard';
import HelpscoutBeacon from '../src/components/Helpscout/HelpscoutBeacon';
import { UserPreferenceProvider } from 'src/components/User/Preferences/UserPreferenceProvider';

const handleExitComplete = (): void => {
  if (typeof window !== 'undefined') {
    window.scrollTo({ top: 0 });
  }
};

export type PageWithLayout = NextPage & {
  layout?: React.FC;
};

const App = ({
  Component,
  pageProps,
  router,
}: AppProps<{
  session: Session;
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
  };

  // useEffect(() => {
  //     // Remove the server-side injected CSS.
  //     const jssStyles = document.querySelector('#jss-server-side');
  //     if (jssStyles) {
  //         jssStyles.parentElement.removeChild(jssStyles);
  //     }
  // }, []);
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
        <link href="/favicon.png" rel="icon" type="image/png" sizes="32x32" />
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
          <ApolloProvider client={client}>
            <SessionProvider session={session}>
              <UserPreferenceProvider>
                <I18nextProvider i18n={i18n}>
                  <StyledEngineProvider injectFirst>
                    <ThemeProvider theme={theme}>
                      <LocalizationProvider
                        dateAdapter={AdapterLuxon}
                        localeText={{
                          cancelButtonLabel: `${t('Cancel')}`,
                          clearButtonLabel: `${t('Clear')}`,
                          okButtonLabel: `${t('OK')}`,
                          todayButtonLabel: `${t('Today')}`,
                        }}
                      >
                        <SnackbarProvider maxSnack={3}>
                          <GlobalStyles />
                          <AnimatePresence
                            mode="wait"
                            onExitComplete={handleExitComplete}
                          >
                            <RouterGuard>
                              <TaskModalProvider>
                                <Layout>
                                  <SnackbarUtilsConfigurator />
                                  <Box
                                    sx={(theme) => ({
                                      fontFamily: theme.typography.fontFamily,
                                    })}
                                  >
                                    <Component
                                      {...pageProps}
                                      key={router.route}
                                    />
                                  </Box>
                                </Layout>
                              </TaskModalProvider>
                            </RouterGuard>
                          </AnimatePresence>
                          <Loading />
                        </SnackbarProvider>
                      </LocalizationProvider>
                    </ThemeProvider>
                  </StyledEngineProvider>
                </I18nextProvider>
              </UserPreferenceProvider>
            </SessionProvider>
          </ApolloProvider>
          <HelpscoutBeacon />
        </ErrorBoundary>
      </Provider>
    </>
  );
};

export default App;
