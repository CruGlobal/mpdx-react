import React, { ReactElement } from 'react';
import { AppProps } from 'next/app';
import { ThemeProvider } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import { ApolloProvider } from '@apollo/client';
import { AnimatePresence } from 'framer-motion';
import { Provider as NextAuthProvider } from 'next-auth/client';
import { NextPage } from 'next';
import Head from 'next/head';
import { I18nextProvider } from 'react-i18next';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { SnackbarProvider } from 'notistack';
import theme from '../src/theme';
import client from '../src/lib/client';
import PrimaryLayout from '../src/components/Layouts/Primary';
import Loading from '../src/components/Loading';
import i18n from '../src/lib/i18n';
import { AppProvider } from '../src/components/App';

const handleExitComplete = (): void => {
    if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0 });
    }
};

export type PageWithLayout = NextPage & {
    layout?: ({ children }) => ReactElement;
};

const App = ({ Component, pageProps, router }: AppProps): ReactElement => {
    const { session } = pageProps;
    const Layout = (Component as PageWithLayout).layout || PrimaryLayout;

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
                <meta name="viewport" content="viewport-fit=cover,width=device-width,initial-scale=1,minimum-scale=1" />
                <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
                <link rel="manifest" href="/manifest.json" />
                <link href="/favicon.png" rel="icon" type="image/png" sizes="32x32" />
                <link rel="apple-touch-icon" href="/icons/apple-touch-icon-iphone-60x60.png" />
                <link rel="apple-touch-icon" sizes="60x60" href="/icons/apple-touch-icon-ipad-76x76.png" />
                <link rel="apple-touch-icon" sizes="114x114" href="/icons/apple-touch-icon-iphone-retina-120x120.png" />
                <link rel="apple-touch-icon" sizes="144x144" href="/icons/apple-touch-icon-ipad-retina-152x152.png" />
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
                            <CssBaseline />
                            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                <SnackbarProvider maxSnack={3}>
                                    <AnimatePresence exitBeforeEnter onExitComplete={handleExitComplete}>
                                        <AppProvider>
                                            <Layout>
                                                <Component {...pageProps} key={router.route} />
                                            </Layout>
                                        </AppProvider>
                                    </AnimatePresence>
                                    <Loading />
                                </SnackbarProvider>
                            </MuiPickersUtilsProvider>
                        </ThemeProvider>
                    </ApolloProvider>
                </NextAuthProvider>
            </I18nextProvider>
        </>
    );
};

export default App;
