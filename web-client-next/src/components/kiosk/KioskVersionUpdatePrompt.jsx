import React, { useEffect, useRef, useState } from "react";
import { is_kiosk } from "../../constants/config";
import styles from "./KioskVersionUpdatePrompt.module.scss";

const VERSION_URL = "/kiosk-version.json";
const POLL_INTERVAL_MS = 5 * 60 * 1000;
const AUTO_REFRESH_DELAY_SECONDS = 2 * 60;
const DEV_PREVIEW_VERSION = "dev-preview";
const shouldShowDevPrompt =
  process.env.NODE_ENV === "development" &&
  process.env.NEXT_PUBLIC_SHOW_KIOSK_UPDATE_PROMPT === "true";

const fetchKioskVersion = async () => {
  const response = await fetch(`${VERSION_URL}?t=${Date.now()}`, {
    cache: "no-store",
  });

  if (!response.ok) return "";

  const data = await response.json();
  return typeof data?.version === "string" ? data.version : "";
};

const refreshKiosk = () => {
  const url = new URL(window.location.href);
  url.searchParams.set("kioskRefreshAt", Date.now().toString());
  window.location.replace(url.toString());
};

export default function KioskVersionUpdatePrompt() {
  const currentVersionRef = useRef("");
  const [hasUpdate, setHasUpdate] = useState(false);
  const [latestVersion, setLatestVersion] = useState("");
  const [dismissedVersion, setDismissedVersion] = useState("");
  const [secondsUntilRefresh, setSecondsUntilRefresh] = useState(AUTO_REFRESH_DELAY_SECONDS);

  useEffect(() => {
    if (!is_kiosk || typeof window === "undefined") return;

    const url = new URL(window.location.href);
    if (!url.searchParams.has("kioskRefreshAt")) return;

    url.searchParams.delete("kioskRefreshAt");
    window.history.replaceState(window.history.state, "", url.toString());
  }, []);

  useEffect(() => {
    if (!is_kiosk || !shouldShowDevPrompt || dismissedVersion === DEV_PREVIEW_VERSION) return;

    setLatestVersion(DEV_PREVIEW_VERSION);
    setSecondsUntilRefresh(AUTO_REFRESH_DELAY_SECONDS);
    setHasUpdate(true);
  }, [dismissedVersion]);

  useEffect(() => {
    if (!is_kiosk || typeof window === "undefined") return undefined;

    let isActive = true;

    const checkVersion = async () => {
      try {
        const fetchedVersion = await fetchKioskVersion();
        if (!isActive || !fetchedVersion) return;

        if (!currentVersionRef.current) {
          currentVersionRef.current = fetchedVersion;
          return;
        }

        if (fetchedVersion !== currentVersionRef.current && fetchedVersion !== dismissedVersion) {
          setLatestVersion(fetchedVersion);
          setSecondsUntilRefresh(AUTO_REFRESH_DELAY_SECONDS);
          setHasUpdate(true);
        }
      } catch (error) {
        // Keep kiosk usage uninterrupted if the version check temporarily fails.
      }
    };

    checkVersion();
    const intervalId = window.setInterval(checkVersion, POLL_INTERVAL_MS);

    return () => {
      isActive = false;
      window.clearInterval(intervalId);
    };
  }, [dismissedVersion]);

  useEffect(() => {
    if (!hasUpdate) return undefined;

    if (secondsUntilRefresh <= 0) {
      refreshKiosk();
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setSecondsUntilRefresh((seconds) => seconds - 1);
    }, 1000);

    return () => window.clearTimeout(timeoutId);
  }, [hasUpdate, secondsUntilRefresh]);

  const dismissUpdate = () => {
    setDismissedVersion(latestVersion);
    setHasUpdate(false);
  };

  const minutes = Math.floor(secondsUntilRefresh / 60);
  const seconds = String(secondsUntilRefresh % 60).padStart(2, "0");

  if (!is_kiosk || !hasUpdate) return null;

  return (
    <div className={styles.wrapper} role="status" aria-live="polite">
      <button
        className={styles.closeButton}
        type="button"
        aria-label="Dismiss update prompt"
        onClick={dismissUpdate}
      >
        x
      </button>
      <div className={styles.content}>
        <div className={styles.icon} aria-hidden="true">
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
            <path
              d="M20 12a8 8 0 1 1-2.34-5.66M20 4v5h-5"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div>
          <h3 className={styles.title}>Refresh to update</h3>
          <p className={styles.message}>
            A newer version of the kiosk is available.
            <button className={styles.button} type="button" onClick={refreshKiosk}>
              Refresh
            </button>
          </p>
          <p className={styles.countdown}>Auto-refreshing in {minutes}:{seconds}</p>
        </div>
      </div>
    </div>
  );
}
