import React, { ReactElement } from 'react';
import { AppProps } from 'next/app';
import { ThemeProvider } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import { ApolloProvider } from '@apollo/client';
import { AnimatePresence } from 'framer-motion';
import { Provider } from 'next-auth/client';
import { NextPage } from 'next';
import Head from 'next/head';
import theme from '../src/theme';
import client from '../src/lib/client';
import PrimaryLayout from '../src/components/Layouts/Primary';
import Loading from '../src/components/Loading';

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
                    name="viewport"
                    content="viewport-fit=cover,width=device-width,initial-scale=1,minimum-scale=1,maximum-scale=1,user-scalable=no"
                />
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
            <Provider options={{ site: process.env.SITE_URL }} session={session}>
                <ApolloProvider client={client}>
                    <ThemeProvider theme={theme}>
                        <CssBaseline />
                        <AnimatePresence exitBeforeEnter onExitComplete={handleExitComplete}>
                            <Layout>
                                <Component {...pageProps} key={router.route} />
                            </Layout>
                        </AnimatePresence>
                        <Loading />
                    </ThemeProvider>
                </ApolloProvider>
            </Provider>
        </>
    );
};

export default App;
