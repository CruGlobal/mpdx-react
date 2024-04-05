import { RenderPageResult } from 'next/dist/shared/lib/utils';
import Document, {
  DocumentContext,
  DocumentInitialProps,
  Head,
  Html,
  Main,
  NextScript,
} from 'next/document';
import Script from 'next/script';
import React, { ReactElement } from 'react';
import { ServerStyleSheets } from '@mui/styles';
import theme from 'src/theme';

class MyDocument extends Document {
  render(): ReactElement {
    return (
      <Html lang="en">
        <Head>
          <meta name="theme-color" content={theme.palette.mpdxBlue.main} />
          <link
            href="https://fonts.googleapis.com/css2?family=Source+Sans+Pro:wght@300;400;700&display=swap"
            rel="stylesheet"
          />
          {process.env.DATADOG_CONFIGURED === 'true' && (
            <Script id="datadog-rum" strategy="afterInteractive">
              {`!function(a,e,t,n,s){a=a[s]=a[s]||{q:[],onReady:function(e){a.q.push(e)}},(s=e.createElement(t)).async=1,s.src=n,(n=e.getElementsByTagName(t)[0]).parentNode.insertBefore(s,n)}(window,document,"script","https://www.datadoghq-browser-agent.com/datadog-rum-v4.js","DD_RUM"),DD_RUM.onReady(function(){DD_RUM.init({clientToken:"${process.env.DATADOG_CLIENT_TOKEN}",applicationId:"${process.env.DATADOG_APP_ID}",site:"datadoghq.com",service:"mpdx-web-react",sessionSampleRate:100,sessionReplaySampleRate:20,trackUserInteractions:!0,trackResources:!0,trackLongTasks:!0,defaultPrivacyLevel:"mask-user-input"}),DD_RUM.startSessionReplayRecording()});`}
            </Script>
          )}
          {process.env.GOOGLE_TAG_MANAGER_CONTAINER_ID && (
            <Script id="google-analytics" strategy="afterInteractive">
              {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${process.env.GOOGLE_TAG_MANAGER_CONTAINER_ID}');`}
            </Script>
          )}
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
  static async getInitialProps(
    ctx: DocumentContext,
  ): Promise<DocumentInitialProps> {
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
        enhanceApp:
          (App) =>
          (props): ReactElement =>
            sheets.collect(<App {...props} />),
      });

    const initialProps = await Document.getInitialProps(ctx);

    return {
      ...initialProps,
      // Styles fragment is rendered after the app and page rendering finish.
      styles: [
        ...React.Children.toArray(initialProps.styles),
        sheets.getStyleElement(),
      ],
    };
  }
}

export default MyDocument;
