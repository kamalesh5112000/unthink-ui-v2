import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";
import { FiCamera, FiRefreshCw } from "react-icons/fi";

import { authAPIs } from "../../../helper/serverAPIs";
import ClaimPoints from "../../DeliveryDetails/ClaimPoints";
import CheckoutClaimPoints from "../../DeliveryDetails/CheckoutClaimPoints";
import { getRedeemCustomerName, parseRedeemQr } from "./redeemQr";
import styles from "../StoreAssistantDashboard.module.scss";

const SCANNER_ELEMENT_ID = "store-assistant-redeem-scanner";
const getRouteValue = (value) => (Array.isArray(value) ? value[0] : value);

const getCameraErrorMessage = (error) => {
  const message = `${error?.name || ""} ${error?.message || error || ""}`;
  if (/notallowed|permission|denied/i.test(message)) {
    return "Camera permission is blocked or unavailable. Allow camera access in browser settings, then tap Start Scanner again.";
  }
  if (/notfound|overconstrained|notreadable/i.test(message)) {
    return "Unable to start a usable camera. Check that another app is not using it, then tap Start Scanner again.";
  }
  return "Unable to open camera. Please allow camera permission and tap Start Scanner again.";
};

const StoreAssistantRedeem = () => {
  const router = useRouter();
  // Serialize teardown/startup so switching cameras cannot leave two streams open.
  const cameraCleanup = useRef(Promise.resolve());
  const currentCameraId = useRef(null);
  const scanHandled = useRef(false);
  const [scannerActive, setScannerActive] = useState(false);
  const [cameraBusy, setCameraBusy] = useState(false);
  const [cameraId, setCameraId] = useState(null);
  const [cameras, setCameras] = useState([]);
  const [scannerError, setScannerError] = useState("");
  const [customerResult, setCustomerResult] = useState(null);

  const userId = getRouteValue(router.query.user_id);
  const storeName = getRouteValue(router.query.store_name) || "";
  const mode = router.query.mode === "checkout" ? "checkout" : "points";
  const scannedPayload = useMemo(() => {
    if (!userId) return null;
    const params = new URLSearchParams({ tab: "redeem", user_id: userId, store_name: storeName, mode });
    return parseRedeemQr(`/store-assistant?${params}`, "https://redeem.local");
  }, [mode, storeName, userId]);

  useEffect(() => {
    if (!scannedPayload) return;
    let cancelled = false;
    const requestedUserId = scannedPayload.userId;
    setCustomerResult(null);
    authAPIs.getUserInfoAPICall({ user_id: requestedUserId }).then((response) => {
      if (cancelled) return;
      const customer = response?.data?.data;
      setCustomerResult({
        userId: requestedUserId,
        customer: String(customer?.user_id) === requestedUserId ? customer : null,
      });
    }).catch(() => {
      if (!cancelled) setCustomerResult({ userId: requestedUserId, customer: null });
    });
    return () => { cancelled = true; };
  }, [scannedPayload]);

  const applyScan = useCallback((decodedText) => {
    if (scanHandled.current) return;
    const payload = parseRedeemQr(decodedText, window.location.origin);
    if (!payload) {
      setScannerError("This QR does not contain customer details. Please scan the customer's My Points badge or checkout QR.");
      return;
    }
    scanHandled.current = true;
    setScannerError("");
    setScannerActive(false);
    router.replace({
      pathname: router.pathname,
      query: { tab: "redeem", mode: payload.mode, user_id: payload.userId, store_name: payload.storeName },
    }, undefined, { shallow: true });
  }, [router]);

  useEffect(() => {
    if (!scannerActive) return;
    let cancelled = false;
    let scanner;
    const previousCleanup = cameraCleanup.current;
    setCameraBusy(true);

    const start = (async () => {
      await previousCleanup;
      const { Html5Qrcode, Html5QrcodeSupportedFormats } = await import("html5-qrcode");
      if (cancelled) return;
      scanner = new Html5Qrcode(SCANNER_ELEMENT_ID, {
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
        verbose: false,
      });
      await scanner.start(cameraId || { facingMode: "environment" }, {
        fps: 10,
        aspectRatio: 1,
        qrbox: (width, height) => {
          const size = Math.floor(Math.min(width, height) * 0.72);
          return { width: size, height: size };
        },
      }, (text) => { if (!cancelled) applyScan(text); }, () => {});
      if (cancelled) return;
      currentCameraId.current = scanner.getRunningTrackSettings().deviceId || cameraId;
      setCameraBusy(false);
      // Permission is already granted by start(); enumeration does not prompt twice.
      try {
        const devices = await Html5Qrcode.getCameras();
        if (!cancelled) setCameras(devices);
      } catch {
        // Scanning still works when a browser cannot enumerate camera devices.
      }
    })();
    start.catch((error) => {
      if (cancelled) return;
      setScannerError(getCameraErrorMessage(error));
      setCameraBusy(false);
      setScannerActive(false);
    });

    return () => {
      cancelled = true;
      cameraCleanup.current = start.catch(() => {}).then(async () => {
        if (!scanner) return;
        try {
          if (scanner.isScanning) await scanner.stop();
        } finally {
          scanner.clear();
        }
      }).catch((error) => console.error("Unable to stop QR scanner:", error));
    };
  }, [applyScan, cameraId, scannerActive]);

  const toggleScanner = () => {
    setScannerError("");
    scanHandled.current = false;
    if (!scannerActive) setCameraId(null);
    setScannerActive((active) => !active);
  };
  const switchCamera = () => {
    const index = cameras.findIndex((camera) => camera.id === currentCameraId.current);
    setScannerError("");
    setCameraId(cameras[(index + 1) % cameras.length].id);
  };
  const clearCustomer = () => {
    setCustomerResult(null);
    router.replace({ pathname: router.pathname, query: { tab: "redeem" } }, undefined, { shallow: true });
  };
  const lookupComplete = customerResult?.userId === scannedPayload?.userId && Boolean(customerResult);
  const customer = lookupComplete ? customerResult.customer : null;

  return (
    <section className={styles.redeemPanel}>
      <div className={styles.redeemHeader}>
        <div>
          <p className={styles.eyebrow}>Points Redemption</p>
          <h1>{scannedPayload ? (mode === "checkout" ? "Checkout redemption" : "Redeem customer points") : "Scan customer badge"}</h1>
          <p>{scannedPayload ? "Review the customer details before redeeming." : "Scan a My Points badge or checkout QR to begin."}</p>
        </div>
        {userId ? <button type="button" onClick={clearCustomer}><FiRefreshCw /> Scan another</button> : null}
      </div>
      {!scannedPayload ? (
        <div className={styles.redeemScannerWrap}>
          <div className={styles.redeemScannerCard}>
            <div className={styles.redeemCameraPreview}>
              <div id={SCANNER_ELEMENT_ID} className={styles.qrScanner} />
              {!scannerActive && <div className={styles.redeemCameraPlaceholder}><FiCamera /><span>Position the customer QR inside the camera view</span></div>}
            </div>
            <div className={styles.redeemScannerActions}>
              <button type="button" onClick={toggleScanner} disabled={cameraBusy && scannerActive}>
                {cameraBusy && scannerActive ? "Opening camera…" : scannerActive ? "Stop Scanner" : "Start Scanner"}
              </button>
              {scannerActive && cameras.length > 1 && <button type="button" onClick={switchCamera} disabled={cameraBusy}><FiRefreshCw /> Switch Camera</button>}
            </div>
            <div role="status" aria-live="polite">
              {scannerError ? <small>{scannerError}</small> : <p>{userId ? "Invalid customer link. Please scan the customer QR again." : "The back camera opens by default. Allow camera access when asked."}</p>}
            </div>
          </div>
        </div>
      ) : (
        <div className={styles.redeemFormWrap}>
          <div className={styles.redeemCustomerBar}>
            <span>Customer</span>
            <strong>{!lookupComplete ? "Loading customer…" : customer ? getRedeemCustomerName(customer) : "Customer unavailable"}</strong>
          </div>
          {customer ? (mode === "checkout" ? (
            <CheckoutClaimPoints key={`checkout:${userId}:${storeName}`} customerUserId={userId} customerStoreName={storeName} customerData={customer} />
          ) : (
            <ClaimPoints key={`points:${userId}:${storeName}`} customerUserId={userId} customerStoreName={storeName} customerData={customer} />
          )) : lookupComplete ? <p role="alert" className="p-5">Unable to load this customer. Please scan their badge or checkout QR again.</p> : null}
        </div>
      )}
    </section>
  );
};

export default StoreAssistantRedeem;
