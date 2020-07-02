import React, { ReactElement } from 'react';
import Document, { Head, Main, NextScript, DocumentInitialProps } from 'next/document';
import { ServerStyleSheets } from '@material-ui/core/styles';
import { RenderPageResult } from 'next/dist/next-server/lib/utils';
import theme from '../src/theme';

class MyDocument extends Document {
    render(): ReactElement {
        return (
            <html lang="en">
                <Head>
                    <meta name="theme-color" content={theme.palette.primary.main} />
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
                    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
                    <link
                        href="https://fonts.googleapis.com/css2?family=Source+Sans+Pro:wght@300;400;700&display=swap"
                        rel="stylesheet"
                    />
                </Head>
                <body>
                    <Main />
                    <NextScript />
                </body>
            </html>
        );
    }
}

MyDocument.getInitialProps = async (ctx): Promise<DocumentInitialProps> => {
    // Resolution order
    //
    // On the server:
    // 1. app.getInitialProps
    // 2. page.getInitialProps
    // 3. document.getInitialProps
    // 4. app.render
    // 5. page.render
    // 6. document.render
    //
    // On the server with error:
    // 1. document.getInitialProps
    // 2. app.render
    // 3. page.render
    // 4. document.render
    //
    // On the client
    // 1. app.getInitialProps
    // 2. page.getInitialProps
    // 3. app.render
    // 4. page.render

    // Render app and page and get the context of the page with collected side effects.
    const sheets = new ServerStyleSheets();
    const originalRenderPage = ctx.renderPage;

    ctx.renderPage = (): RenderPageResult | Promise<RenderPageResult> =>
        originalRenderPage({
            enhanceApp: (App) => (props): ReactElement => sheets.collect(<App {...props} />),
        });

    const initialProps = await Document.getInitialProps(ctx);

    return {
        ...initialProps,
        // Styles fragment is rendered after the app and page rendering finish.
        styles: [...React.Children.toArray(initialProps.styles), sheets.getStyleElement()],
    };
};

export default MyDocument;
