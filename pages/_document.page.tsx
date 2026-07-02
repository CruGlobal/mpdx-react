import Document, { Head, Html, Main, NextScript } from 'next/document';
import Script from 'next/script';
import { ReactElement } from 'react';
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
          {process.env.HELPJUICE_ORIGIN && (
            <link
              rel="stylesheet"
              href={`${process.env.HELPJUICE_ORIGIN}/swifty.css`}
            />
          )}
          {/* The swifty.js script initializes in response to a DOMContentLoaded
           * event, but that event has fired by the time the script is executed
           * when using the Next.js <Script> component. To workaround this, we
           * have to use a native <script> element and cannot use async or
           * defer. This is not ideal for first-load performance and should be
           * switched to <Script> as soon as Helpjuice can fix their swifty.js
           * script.
           * Caleb Cox reached out to HelpJuice on August 30, 2024, and they
           * a ticket for the issue on October 10, 2024.
           * https://helpjuice.canny.io/feature-requests/p/swifty-swiftyjs-beacon-setup-fails-due-to-domcontentloaded-event-already-fired
           */}
          {process.env.HELPJUICE_ORIGIN && (
            <script
              dangerouslySetInnerHTML={{
                __html: `window.helpjuice_account_url = window.location.origin + '/api/helpjuice';
window.helpjuice_contact_us_url = '${process.env.HELPJUICE_ORIGIN}/contact-us';
window.helpjuiceSwiftyConfig = { widgetPosition: 'bottomRight' };
window.helpjuiceSwiftyUrlMap = {};`,
              }}
            />
          )}
          {process.env.HELPJUICE_ORIGIN && (
            <script src={`${process.env.HELPJUICE_ORIGIN}/swifty.js`} />
          )}
          {process.env.DATADOG_CONFIGURED === 'true' && (
            <Script id="datadog-rum" strategy="afterInteractive">
              {`!function(a,e,t,n,s){a=a[s]=a[s]||{q:[],onReady:function(e){a.q.push(e)}},(s=e.createElement(t)).async=1,s.src=n,(n=e.getElementsByTagName(t)[0]).parentNode.insertBefore(s,n)}(window,document,"script","https://www.datadoghq-browser-agent.com/datadog-rum-v5.js","DD_RUM"),DD_RUM.onReady(function(){DD_RUM.init({clientToken:"${process.env.DATADOG_CLIENT_TOKEN}",applicationId:"${process.env.DATADOG_APP_ID}",site:"datadoghq.com",service:"mpdx-web-react",sessionSampleRate:100,sessionReplaySampleRate:20,trackUserInteractions:!0,trackResources:!0,trackLongTasks:!0,defaultPrivacyLevel:"mask-user-input",env:"${process.env.DD_ENV}",allowedTracingUrls:["${process.env.API_URL}"]})});`}
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
}

export default MyDocument;
