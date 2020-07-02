import React, { ReactElement } from 'react';
import { AppProps } from 'next/app';
import { ThemeProvider } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import { ApolloProvider } from '@apollo/client';
import { AnimatePresence } from 'framer-motion';
import { Provider } from 'next-auth/client';
import theme from '../src/theme';
import client from '../src/lib/client';
import Chrome from '../src/components/Chrome';
import Loading from '../src/components/Loading';

const handleExitComplete = (): void => {
    if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0 });
    }
};

const App = ({ Component, pageProps, router }: AppProps): ReactElement => {
    const { session } = pageProps;

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
                    <Chrome>
                        <AnimatePresence exitBeforeEnter onExitComplete={handleExitComplete}>
                            <Component {...pageProps} key={router.route} />
                        </AnimatePresence>
                    </Chrome>
                    <Loading />
                </ThemeProvider>
            </ApolloProvider>
        </Provider>
    );
};

export default App;
