import React, { ReactElement } from 'react';
import { AppProps } from 'next/app';
import { StylesProvider, ThemeProvider } from '@material-ui/core/styles';
import { ApolloProvider } from '@apollo/client';
import { AnimatePresence } from 'framer-motion';
import { Provider as NextAuthProvider } from 'next-auth/client';
import { NextPage } from 'next';
import Head from 'next/head';
import { I18nextProvider } from 'react-i18next';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import LuxonUtils from '@date-io/luxon';
import { SnackbarProvider } from 'notistack';
import theme from '../src/theme';
import client from '../src/lib/client';
import PrimaryLayout from '../src/components/Layouts/Primary';
import Loading from '../src/components/Loading';
import i18n from '../src/lib/i18n';
import TaskDrawerProvider from '../src/components/Task/Drawer/TaskDrawerProvider';
import { SnackbarUtilsConfigurator } from '../src/components/Snackbar/Snackbar';
import { GlobalStyles } from '../src/components/GlobalStyles/GlobalStyles';
import { RouterGuard } from '../src/components/RouterGuard/RouterGuard';

const handleExitComplete = (): void => {
  if (typeof window !== 'undefined') {
    window.scrollTo({ top: 0 });
  }
};

export type PageWithLayout = NextPage & {
  layout?: React.FC;
};

const App = ({ Component, pageProps, router }: AppProps): ReactElement => {
  const Layout = (Component as PageWithLayout).layout || PrimaryLayout;
  const { session } = pageProps;
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
        <link
          href="https://fonts.googleapis.com/css2?family=Source+Sans+Pro:wght@300;400;700&display=swap"
          rel="stylesheet"
        />
      </Head>
      <I18nextProvider i18n={i18n}>
        <NextAuthProvider session={session}>
          <ApolloProvider client={client}>
            <ThemeProvider theme={theme}>
              <StylesProvider>
                <MuiPickersUtilsProvider utils={LuxonUtils}>
                  <SnackbarProvider maxSnack={3}>
                    <GlobalStyles />
                    <AnimatePresence
                      exitBeforeEnter
                      onExitComplete={handleExitComplete}
                    >
                      <RouterGuard>
                        <TaskDrawerProvider>
                          <Layout>
                            <SnackbarUtilsConfigurator />
                            <Component {...pageProps} key={router.route} />
                          </Layout>
                        </TaskDrawerProvider>
                      </RouterGuard>
                    </AnimatePresence>
                    <Loading />
                  </SnackbarProvider>
                </MuiPickersUtilsProvider>
              </StylesProvider>
            </ThemeProvider>
          </ApolloProvider>
        </NextAuthProvider>
      </I18nextProvider>
    </>
  );
};

export default App;
