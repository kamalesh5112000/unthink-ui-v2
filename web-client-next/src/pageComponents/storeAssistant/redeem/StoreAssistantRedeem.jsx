import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";
import { FiCamera, FiRefreshCw } from "react-icons/fi";

import ClaimPoints from "../../DeliveryDetails/ClaimPoints";
import styles from "../StoreAssistantDashboard.module.scss";

const SCANNER_ELEMENT_ID = "store-assistant-redeem-scanner";
const BACK_CAMERA_LABEL_PATTERN = /back|rear|environment|facing back/i;

const getRouteValue = (value) => (Array.isArray(value) ? value[0] : value);

const getCameraErrorMessage = (error) => {
  const errorName = error?.name || "";
  const errorMessage = error?.message || "";

  if (/notallowed|permission|denied/i.test(`${errorName} ${errorMessage}`)) {
    return "Camera permission is blocked or unavailable. Allow camera access in browser settings, then tap Start Scanner again.";
  }

  if (/notfound|overconstrained|notreadable/i.test(`${errorName} ${errorMessage}`)) {
    return "Unable to find or start a usable camera. Check the device camera and tap Start Scanner again.";
  }

  return "Unable to open camera. Please allow camera permission and tap Start Scanner again.";
};

const getRedeemPayloadFromText = (value) => {
  const rawValue = String(value || "").trim();
  if (!rawValue) return null;

  try {
    const parsedUrl = new URL(rawValue, window.location.origin);
    const userId =
      parsedUrl.searchParams.get("user_id") ||
      parsedUrl.searchParams.get("userId") ||
      parsedUrl.searchParams.get("customer_user_id");
    const storeName =
      parsedUrl.searchParams.get("store_name") ||
      parsedUrl.searchParams.get("storeName");

    if (userId) {
      return { userId, storeName };
    }

    const pathParts = parsedUrl.pathname.split("/").filter(Boolean);
    const redeemRouteIndex = pathParts.findIndex((part) =>
      ["claim-points", "checkout-claim-badge"].includes(part)
    );

    if (redeemRouteIndex >= 0 && pathParts[redeemRouteIndex + 1]) {
      return {
        userId: decodeURIComponent(pathParts[redeemRouteIndex + 1]),
        storeName: pathParts[redeemRouteIndex + 2]
          ? decodeURIComponent(pathParts[redeemRouteIndex + 2])
          : "",
      };
    }
  } catch (error) {
    // Treat non-URL text as a direct customer id below.
  }

  return { userId: rawValue, storeName: "" };
};

const StoreAssistantRedeem = () => {
  const router = useRouter();
  const scannerRef = useRef(null);
  const [scannerActive, setScannerActive] = useState(false);
  const [scannerError, setScannerError] = useState("");
  const [cameras, setCameras] = useState([]);
  const [activeCameraIndex, setActiveCameraIndex] = useState(0);

  const scannedPayload = useMemo(() => {
    const userId = getRouteValue(router.query.user_id);
    const storeName = getRouteValue(router.query.store_name);

    return userId ? { userId, storeName } : null;
  }, [router.query.store_name, router.query.user_id]);

  const applyRedeemPayload = useCallback((payload) => {
    if (!payload?.userId) {
      setScannerError("The QR code does not contain a valid customer id.");
      return;
    }

    setScannerError("");
    setScannerActive(false);
    router.replace(
      {
        pathname: router.pathname,
        query: {
          ...router.query,
          tab: "redeem",
          user_id: payload.userId,
          ...(payload.storeName ? { store_name: payload.storeName } : {}),
        },
      },
      undefined,
      { shallow: true }
    );
  }, [router]);

  const getPreferredCameraIndex = useCallback((availableCameras) => {
    const backCameraIndex = availableCameras.findIndex((camera) =>
      BACK_CAMERA_LABEL_PATTERN.test(camera.label || "")
    );

    return backCameraIndex >= 0 ? backCameraIndex : 0;
  }, []);

  useEffect(() => {
    if (!scannerActive) return undefined;

    let cancelled = false;
    const qrboxSize =
      typeof window === "undefined"
        ? 240
        : Math.min(280, Math.max(190, window.innerWidth - 72));

    const stopScanner = async () => {
      try {
        if (scannerRef.current?.isScanning) {
          await scannerRef.current.stop();
        }
        await scannerRef.current?.clear?.();
      } catch (error) {
        console.error("Unable to stop QR scanner:", error);
      } finally {
        scannerRef.current = null;
      }
    };

    import("html5-qrcode")
      .then(async ({ Html5Qrcode }) => {
        if (cancelled) return;

        const scanner = new Html5Qrcode(SCANNER_ELEMENT_ID, false);
        scannerRef.current = scanner;

        let availableCameras = [];
        try {
          availableCameras = await Html5Qrcode.getCameras();
        } catch (error) {
          console.error("Unable to list cameras:", error);
        }

        if (cancelled) {
          await stopScanner();
          return;
        }

        const nextCameras = Array.isArray(availableCameras) ? availableCameras : [];
        const hasReadableCameraLabels = nextCameras.some((camera) => camera.label);
        setCameras(nextCameras);

        const preferredCameraIndex = getPreferredCameraIndex(nextCameras);
        const nextCameraIndex = nextCameras[activeCameraIndex]
          ? activeCameraIndex
          : preferredCameraIndex;

        if (nextCameraIndex !== activeCameraIndex) {
          setActiveCameraIndex(nextCameraIndex);
          await stopScanner();
          return;
        }

        const shouldPreferEnvironmentConstraint =
          !hasReadableCameraLabels && nextCameraIndex === 0;
        const cameraConfig = shouldPreferEnvironmentConstraint
          ? { facingMode: "environment" }
          : nextCameras[nextCameraIndex]?.id || { facingMode: "environment" };

        await scanner.start(
          cameraConfig,
          {
            fps: 10,
            qrbox: { width: qrboxSize, height: qrboxSize },
            aspectRatio: 1,
          },
          (decodedText) => applyRedeemPayload(getRedeemPayloadFromText(decodedText)),
          () => {}
        );
      })
      .catch((error) => {
        if (cancelled) return;

        console.error("Unable to open QR scanner:", error);
        stopScanner();
        setScannerActive(false);
        setScannerError(getCameraErrorMessage(error));
      });

    return () => {
      cancelled = true;
      stopScanner();
    };
  }, [activeCameraIndex, applyRedeemPayload, getPreferredCameraIndex, scannerActive]);

  const handleStartScanner = () => {
    setScannerError("");
    setScannerActive((active) => !active);
  };

  const handleSwitchCamera = () => {
    if (cameras.length <= 1) return;
    setScannerError("");
    setActiveCameraIndex((index) => (index + 1) % cameras.length);
  };

  const clearCustomer = () => {
    const nextQuery = { ...router.query, tab: "redeem" };
    delete nextQuery.user_id;
    delete nextQuery.store_name;

    router.replace({ pathname: router.pathname, query: nextQuery }, undefined, {
      shallow: true,
    });
  };

  return (
    <section className={styles.redeemPanel}>
      <div className={styles.redeemHeader}>
        <div>
          <p className={styles.eyebrow}>Points Redemption</p>
          <h1>Scan customer badge</h1>
          <p>Open the customer badge QR here before exchanging points for a real coupon.</p>
        </div>
        {scannedPayload?.userId ? (
          <button type="button" onClick={clearCustomer}>
            <FiRefreshCw /> Scan another
          </button>
        ) : null}
      </div>

      {!scannedPayload?.userId ? (
        <div className={styles.redeemScannerWrap}>
          <div className={styles.redeemScannerCard}>
            <FiCamera />
            <h2>Camera scanner</h2>
            <p>Use the mobile or tablet camera to scan the customer badge QR.</p>
            <div className={styles.redeemScannerActions}>
              <button type="button" onClick={handleStartScanner}>
                {scannerActive ? "Stop Scanner" : "Start Scanner"}
              </button>
              {scannerActive && cameras.length > 1 ? (
                <button type="button" onClick={handleSwitchCamera}>
                  Switch Camera
                </button>
              ) : null}
            </div>
            {scannerError ? <small>{scannerError}</small> : null}
            {scannerActive ? <div id={SCANNER_ELEMENT_ID} className={styles.qrScanner} /> : null}
          </div>
        </div>
      ) : (
        <div className={styles.redeemFormWrap}>
          <div className={styles.redeemCustomerBar}>
            <span>Customer ID</span>
            <strong>{scannedPayload.userId}</strong>
            {scannedPayload.storeName ? <small>{scannedPayload.storeName}</small> : null}
          </div>
          <ClaimPoints
            customerUserId={scannedPayload.userId}
            customerStoreName={scannedPayload.storeName}
          />
        </div>
      )}
    </section>
  );
};

export default StoreAssistantRedeem;
