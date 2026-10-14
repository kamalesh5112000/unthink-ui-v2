import { Html, Head, Main, NextScript } from 'next/document';
import GoogleTagManagerNoscript from './GoogleTagManagerNoscript';
import {  super_admin } from '../src/constants/config';

export default function Document() {
  const store =super_admin
  return (
    <Html lang="en"  data-theme={store}>
      <Head>
        {process.env.NODE_ENV === 'development' ? (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                (function () {
                  function isExtensionUrl(value) {
                    return typeof value === 'string' && value.indexOf('chrome-extension://') === 0;
                  }

                  window.addEventListener('error', function (event) {
                    if (isExtensionUrl(event.filename)) {
                      event.preventDefault();
                      event.stopImmediatePropagation();
                    }
                  }, true);

                  window.addEventListener('unhandledrejection', function (event) {
                    var reason = event.reason || {};
                    var stack = reason.stack || '';
                    var message = reason.message || '';

                    if (stack.indexOf('chrome-extension://') !== -1 || message.indexOf('chrome-extension://') !== -1) {
                      event.preventDefault();
                      event.stopImmediatePropagation();
                    }
                  }, true);
                })();
              `,
            }}
          />
        ) : null}
        {/* Favicon and manifest */}
        <link
          rel="icon"
          href="/images/staticpageimages/unthink_favicon.png"
        />
        <link rel="manifest" href="/manifest.webmanifest" />
        
        {/* Apple touch icon */}
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        
        {/* Meta tags */}
        <meta name="theme-color" content="#DF5A43" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </Head>
      
      <body>
        <GoogleTagManagerNoscript />
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
