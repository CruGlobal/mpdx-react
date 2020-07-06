import React, { ReactElement, ReactNode } from 'react';
import { AppProps } from 'next/app';
import { ThemeProvider } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import { ApolloProvider } from '@apollo/client';
import { AnimatePresence } from 'framer-motion';
import { Provider } from 'next-auth/client';
import { NextPage } from 'next';
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
    );
};

export default App;
