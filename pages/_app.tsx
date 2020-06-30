import React, { ReactElement, useEffect } from 'react';
import { AppProps } from 'next/app';
import Head from 'next/head';
import { ThemeProvider } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import { ApolloProvider } from '@apollo/client';
import { AnimatePresence } from 'framer-motion';
import theme from '../src/theme';
import client from '../src/lib/client';
import Chrome from '../src/components/Chrome';

const App = ({ Component, pageProps }: AppProps): ReactElement => {
    useEffect(() => {
        // Remove the server-side injected CSS.
        const jssStyles = document.querySelector('#jss-server-side');
        if (jssStyles) {
            jssStyles.parentElement.removeChild(jssStyles);
        }
    });

    return (
        <AnimatePresence exitBeforeEnter>
            <ApolloProvider client={client}>
                <Head>
                    <title>MPDX | Fundraising software built for God’s people</title>
                    <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
                    <meta
                        name="viewport"
                        content="viewport-fit=cover,width=device-width,initial-scale=1,minimum-scale=1,maximum-scale=1,user-scalable=no"
                    />
                    <link rel="manifest" href="/manifest.json" />
                    <link href="/favicon.png" rel="icon" type="image/png" sizes="32x32" />
                    <link rel="apple-touch-icon" href="/icons/apple-touch-icon-iphone-60x60.png" />
                    <link rel="apple-touch-icon" sizes="60x60" href="/icons/apple-touch-icon-ipad-76x76.png" />
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
                    <meta name="theme-color" content="#05699b" />
                    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
                </Head>
                <ThemeProvider theme={theme}>
                    <CssBaseline />
                    <Chrome>
                        <Component {...pageProps} />
                    </Chrome>
                </ThemeProvider>
            </ApolloProvider>
        </AnimatePresence>
    );
};

export default App;
