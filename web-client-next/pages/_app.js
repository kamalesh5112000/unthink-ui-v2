import React, { useEffect, useLayoutEffect, useState } from 'react';
import Head from 'next/head';
import Script from 'next/script';
import dynamic from 'next/dynamic';
import Router from 'next/router';
import '../src/style/antd.css'
// Ant Design base styles (required for Grid/Row/Col gutters and component alignment)
import "antd/dist/reset.css";

// Import Tailwind CSS first (must be before SCSS that uses @layer)
import "../src/style/global.css";
// Then import SCSS utilities that extend Tailwind
import "../src/style/index.module.scss";
import "../src/pageComponents/swiftlyStyled/pageContents/mainContent.scss";
import "../src/libs/index.css";
// Import custom Ant Design modal and carousel styles
import "../src/pageComponents/Home/Popup.css";

// Import context and state wrappers
import ReduxWrapper from "../src/state/reduxWrapper";
import ActionWrapper from "../src/state/actionWrapper";
import ContextWrapper from "../src/context/contextWrapper";
import { ThemeContextWrapper } from "../src/context/themeContext";

const ProductDetailsCopyModalComponent = dynamic(() => import("../src/pageComponents/productDetailsCopyModal"), { ssr: false });
const CollectionShareModalComponent = dynamic(() => import("../src/pageComponents/collectionShareModal"), { ssr: false });
const AppLoaderComponent = dynamic(() => import("../src/pageComponents/appLoader"), { ssr: false });
const AppMessageModal = dynamic(() => import("../src/pageComponents/appMessageModal"), { ssr: false });
const EarnedRewardModal = dynamic(() => import("../src/pageComponents/earnedRewardModal"), { ssr: false });
const AiExtractionDataModal = dynamic(() => import("../src/pageComponents/aiExtractionDataModal"), { ssr: false });
const CustomProductModal = dynamic(() => import("../src/pageComponents/customProductModal"), { ssr: false });
const AutoCreateCollectionModal = dynamic(() => import("../src/pageComponents/autoCreateCollectionModal"), { ssr: false });

// Import utilities
import appTracker from "../src/helper/webTracker/appTracker";
import AnalyticsTracker from "../src/helper/webTracker/AnalyticsTracker";
import { checkAndGenerateUserId, generateSessionId } from "../src/helper/utils";
import {
  STORE_USER_NAME_BUDGETTRAVEL,
  STORE_USER_NAME_DOTHELOOK,
  STORE_USER_NAME_HEROESVILLAINS,
  STORE_USER_NAME_SAMSKARA,
  STORE_USER_NAME_SWIFTLYSTYLED,
} from "../src/constants/codes";
import { is_store_instance, current_store_name, GA_TRACKING_ID } from '../src/constants/config';
import { UserDataProvider } from '../src/context/UserDataContext';
import styles from './_app.module.css';

const RouteLoader = () => (
  <div className={styles.routeLoaderOverlay}>
    <div className={styles.routeLoaderPanel}>
      <span className={styles.routeLoaderSpinner} />
      <p>Loading...</p>
    </div>
  </div>
);

function MyApp({ Component, pageProps }) {
  const [mounted, setMounted] = useState(false);
  const [isRouteLoading, setIsRouteLoading] = useState(false);

  // Use useLayoutEffect to set mounted state before browser paints
  useLayoutEffect(() => {
    setMounted(true);
    // Initialize user tracking
    checkAndGenerateUserId();
    generateSessionId();

    // Initialize app tracker
    appTracker.onVisit();
  }, []);

  useEffect(() => {
    const handleRouteChangeStart = (url) => {
      if (url !== Router.asPath) setIsRouteLoading(true);
    };
    const handleRouteChangeEnd = () => setIsRouteLoading(false);

    Router.events.on('routeChangeStart', handleRouteChangeStart);
    Router.events.on('routeChangeComplete', handleRouteChangeEnd);
    Router.events.on('routeChangeError', handleRouteChangeEnd);

    return () => {
      Router.events.off('routeChangeStart', handleRouteChangeStart);
      Router.events.off('routeChangeComplete', handleRouteChangeEnd);
      Router.events.off('routeChangeError', handleRouteChangeEnd);
    };
  }, []);

  // Determine font styling based on store
  const fontStyle = is_store_instance
    ? current_store_name === STORE_USER_NAME_SAMSKARA
      ? { fontFamily: "sans-serif" }
      : current_store_name === STORE_USER_NAME_HEROESVILLAINS
        ? { fontFamily: '"Crimson Text", serif' }
        : {}
    : {};

  return (
    <>
      <Head>
        <title>{current_store_name}</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta
          name="description"
          content="Reach audiences of publishers, creators, and influencers"
        />
        <meta property="og:title" content="Unthink" />
        <meta property="og:image" content="/unthink-logo.png" />
        <meta
          property="og:description"
          content="Reach audiences of publishers, creators, and influencers"
        />
      </Head>

      {GA_TRACKING_ID ? (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_TRACKING_ID}', { send_page_view: false });
            `}
          </Script>
        </>
      ) : null}

      <div style={fontStyle} suppressHydrationWarning>
        <ThemeContextWrapper>
          <ReduxWrapper>
            <ActionWrapper>
              <ContextWrapper>
                <UserDataProvider>
                <AnalyticsTracker />
                {mounted ? (
                  <>
                    {isRouteLoading ? <RouteLoader /> : null}
                    <AppLoaderComponent />
                    <AppMessageModal />
                    <ProductDetailsCopyModalComponent />
                    <CollectionShareModalComponent />
                    <EarnedRewardModal />
                    <AiExtractionDataModal />
                    <CustomProductModal />
                    <AutoCreateCollectionModal />
                  </>
                ) : null}
                <Component {...pageProps} />
                </UserDataProvider>
              </ContextWrapper>
            </ActionWrapper>
          </ReduxWrapper>
        </ThemeContextWrapper>
      </div>
    </>
  );
}

export default MyApp;
