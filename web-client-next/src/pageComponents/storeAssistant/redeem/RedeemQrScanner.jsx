import React, { useCallback, useEffect, useRef, useState } from "react";
import { FiCamera, FiImage, FiRefreshCw } from "react-icons/fi";
import { canRetryCamera, getCameraFailure, getVideoProgress, readCameraPermission, withTimeout } from "./cameraRecovery";
import styles from "../StoreAssistantDashboard.module.scss";

const CAMERA_ID = "store-assistant-redeem-scanner";
const IMAGE_ID = "store-assistant-redeem-image-scanner";
const START_TIMEOUT_MS = 20000;
const FRAME_TIMEOUT_MS = 8000;
let cameraSessionId = 0;

const stopVideoTracks = () => {
  const video = document.getElementById(CAMERA_ID)?.querySelector("video");
  video?.srcObject?.getTracks?.().forEach((track) => track.stop());
};

const releaseScanner = async (scanner, surface) => {
  if (!scanner) return;
  try {
    // start() may resolve before the first frame, when isScanning is still false.
    if (scanner.getState() > 1) await scanner.stop();
  } finally {
    surface?.querySelector("video")?.srcObject?.getTracks?.().forEach((track) => track.stop());
    scanner.clear();
  }
};

const RedeemQrScanner = ({ onScan }) => {
  const onScanRef = useRef(onScan);
  const cleanupRef = useRef(Promise.resolve());
  const pendingStart = useRef(false);
  const recoveryCount = useRef(0);
  const currentDevice = useRef(null);
  const photoInput = useRef(null);
  const imageInput = useRef(null);
  const mounted = useRef(true);
  const readingImage = useRef(false);
  const imageJob = useRef(0);
  const permissionState = useRef("unknown");
  const permissionIntent = useRef(0);
  const helpRef = useRef(null);
  const [checkingPermission, setCheckingPermission] = useState(false);
  const [active, setActive] = useState(false);
  const [busy, setBusy] = useState(false);
  const [cameraId, setCameraId] = useState(null);
  const [restart, setRestart] = useState(0);
  const [cameras, setCameras] = useState([]);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");
  const [blocked, setBlocked] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [imageBusy, setImageBusy] = useState(false);
  const [hasTried, setHasTried] = useState(false);
  const [helpPlatform, setHelpPlatform] = useState("android");

  useEffect(() => { onScanRef.current = onScan; }, [onScan]);
  useEffect(() => {
    mounted.current = true;
    const userAgent = navigator.userAgent || "";
    const isIos = /iPad|iPhone|iPod/i.test(userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    setHelpPlatform(isIos ? (/CriOS/i.test(userAgent) ? "iosChrome" : "iosSafari") : /Android/i.test(userAgent) ? "android" : "desktop");
    return () => { mounted.current = false; permissionIntent.current += 1; };
  }, []);

  const updatePermission = useCallback((state) => {
    const wasDenied = permissionState.current === "denied";
    permissionState.current = state;
    setBlocked(state === "denied");
    if (wasDenied && state !== "denied") {
      setError("");
      setShowHelp(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    let watchedStatus;
    let refreshId = 0;
    const onChange = () => {
      if (!cancelled && watchedStatus) updatePermission(watchedStatus.state);
    };
    const refresh = async () => {
      if (document.hidden) return;
      const id = ++refreshId;
      const status = await readCameraPermission(navigator.permissions);
      if (cancelled || id !== refreshId || !status) return;
      watchedStatus?.removeEventListener?.("change", onChange);
      watchedStatus = status;
      updatePermission(status.state);
      watchedStatus.addEventListener?.("change", onChange);
    };
    refresh();
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      cancelled = true;
      watchedStatus?.removeEventListener?.("change", onChange);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [updatePermission]);

  useEffect(() => {
    if (!showHelp || !blocked) return;
    helpRef.current?.scrollIntoView?.({ behavior: "smooth", block: "nearest" });
  }, [blocked, showHelp]);

  const acceptQr = useCallback((text) => {
    if (onScanRef.current(text)) {
      setActive(false);
      return true;
    }
    setError("This QR does not contain customer details. Please scan the customer’s My Points badge or checkout QR.");
    return false;
  }, []);

  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    let scanner;
    let surface;
    let watchdog;
    let lastProgress = null;
    let lastFrameAt = Date.now();
    const previousCleanup = cleanupRef.current;
    setBusy(true);
    setProgress(recoveryCount.current ? "Restarting camera…" : "Opening camera… Tap Allow if Chrome asks.");

    const session = (async () => {
      await previousCleanup;
      if (cancelled) return;
      if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
        throw new Error("Camera unavailable in this browser");
      }
      const { Html5Qrcode, Html5QrcodeSupportedFormats } = await import("html5-qrcode");
      if (cancelled) return;
      surface = document.createElement("div");
      surface.id = `${CAMERA_ID}-${++cameraSessionId}`;
      document.getElementById(CAMERA_ID).appendChild(surface);
      scanner = new Html5Qrcode(surface.id, { formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE], verbose: false });
      const choices = [cameraId || { facingMode: recoveryCount.current ? "user" : "environment" }, { facingMode: "user" }];
      // No fixed aspect ratio/resolution: older cameras may reject those constraints.
      for (let attempt = 0; attempt < choices.length; attempt += 1) {
        try {
          pendingStart.current = true;
          await scanner.start(choices[attempt], {
            fps: 6,
            qrbox: (width, height) => {
              const size = Math.floor(Math.min(width, height) * 0.72);
              return { width: size, height: size };
            },
          }, (text) => { if (!cancelled) acceptQr(text); }, () => {});
          break;
        } catch (failure) {
          if (cancelled || !canRetryCamera(failure) || attempt === choices.length - 1) throw failure;
          await releaseScanner(scanner, surface);
          if (cancelled) return;
          setProgress("Trying another camera…");
        } finally {
          pendingStart.current = false;
        }
      }
      if (cancelled) return;
      currentDevice.current = scanner.getRunningTrackSettings().deviceId || cameraId;
      // Show "ready" only after frames are delivered, not merely after permission.
      lastFrameAt = Date.now();
      watchdog = window.setInterval(() => {
        if (cancelled || document.hidden) return;
        const video = document.getElementById(CAMERA_ID)?.querySelector("video");
        const value = getVideoProgress(video);
        if (value !== null && value !== lastProgress) {
          lastProgress = value;
          lastFrameAt = Date.now();
          setBusy(false);
          setProgress("Point the camera at the customer’s QR.");
        } else if (Date.now() - lastFrameAt > FRAME_TIMEOUT_MS) {
          window.clearInterval(watchdog);
          stopVideoTracks();
          if (recoveryCount.current < 1) {
            recoveryCount.current += 1;
            setRestart((value) => value + 1);
          } else {
            setActive(false);
            setBusy(false);
            setError("The camera has stopped responding. Try Camera Again, or use Take Photo / Choose QR Image below.");
          }
        }
      }, 1000);
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        if (!cancelled) setCameras(devices.filter((device) => device.kind === "videoinput").map((device) => ({ id: device.deviceId, label: device.label })));
      } catch {
        // Live scanning can continue even if camera switching isn't supported.
      }
    })();

    // A browser permission request cannot be cancelled by a website. If it remains
    // unanswered, leave the photo path usable and stop any stream that arrives late.
    withTimeout(session, START_TIMEOUT_MS, "Camera startup timed out").catch((failure) => {
      if (cancelled) return;
      const result = getCameraFailure(failure);
      setBlocked(result.blocked);
      setShowHelp(result.blocked);
      setError(result.message);
      setBusy(false);
      setActive(false);
    });

    const onVisibilityChange = (event) => {
      if (document.hidden || event.type === "pagehide") {
        stopVideoTracks();
        setActive(false);
        setBusy(false);
        setError("The camera was paused when you left this screen. Tap Try Camera Again to continue.");
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("pagehide", onVisibilityChange);
    return () => {
      cancelled = true;
      window.clearInterval(watchdog);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("pagehide", onVisibilityChange);
      stopVideoTracks();
      cleanupRef.current = session.catch(() => {}).then(() => releaseScanner(scanner, surface)).catch(() => {}).finally(() => surface?.remove());
    };
  }, [acceptQr, active, cameraId, restart]);

  const startCamera = async () => {
    setHasTried(true);
    if (pendingStart.current) {
      setError("Finish or close Chrome’s camera permission question first, or choose a QR image below.");
      return;
    }
    const intent = ++permissionIntent.current;
    setCheckingPermission(true);
    const status = await readCameraPermission(navigator.permissions);
    if (!mounted.current || intent !== permissionIntent.current) return;
    setCheckingPermission(false);
    if (status) updatePermission(status.state);
    if (status?.state === "denied") {
      setBlocked(true);
      setShowHelp(true);
      setError("Camera access is turned off in your browser. Follow the steps below to allow it, then tap Try Camera Again. You can also take a photo or choose a QR image.");
      helpRef.current?.scrollIntoView?.({ behavior: "smooth", block: "nearest" });
      return;
    }
    setError("");
    setBlocked(false);
    setShowHelp(false);
    setCameraId(null);
    recoveryCount.current = 0;
    setActive(true);
  };

  const switchCamera = () => {
    if (cameras.length < 2) return;
    const index = cameras.findIndex((camera) => camera.id === currentDevice.current);
    setError("");
    recoveryCount.current = 0;
    setCameraId(cameras[(index + 1) % cameras.length].id);
  };

  const chooseImage = (input) => {
    permissionIntent.current += 1;
    setCheckingPermission(false);
    // Release the live stream immediately, before opening the native camera app.
    stopVideoTracks();
    setActive(false);
    setBusy(false);
    input.current?.click();
  };

  const scanImage = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = ""; // Selecting the same photo again must trigger a retry.
    if (!file || readingImage.current) return;
    readingImage.current = true;
    setImageBusy(true);
    setError("");
    let decoder;
    let decoding;
    let scanTarget;
    try {
      const { Html5Qrcode, Html5QrcodeSupportedFormats } = await import("html5-qrcode");
      if (!mounted.current) return;
      // Isolate timed-out image jobs so a late result cannot clear a new retry.
      scanTarget = document.createElement("div");
      scanTarget.id = `${IMAGE_ID}-${++imageJob.current}`;
      document.getElementById(IMAGE_ID).appendChild(scanTarget);
      decoder = new Html5Qrcode(scanTarget.id, { formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE], verbose: false });
      decoding = decoder.scanFile(file, false);
      const text = await withTimeout(decoding, 15000, "Image reading timed out");
      if (mounted.current) acceptQr(text);
    } catch {
      if (mounted.current) setError("We couldn’t read a customer QR in that photo. Take a clear, close photo of the whole QR, or choose another image.");
    } finally {
      // Keep a timed-out decode isolated; don't clear its canvas during decoding.
      Promise.resolve(decoding).catch(() => {}).finally(() => {
        try { decoder?.clear(); } catch {}
        scanTarget?.remove();
      });
      readingImage.current = false;
      if (mounted.current) setImageBusy(false);
    }
  };

  return (
    <div className={styles.redeemScannerWrap}>
      <div className={styles.redeemScannerCard}>
        {!active && <div className={styles.cameraGuidance}>
          <strong>{blocked ? "Camera access is turned off" : "Ready to scan?"}</strong>
          {blocked ? <p>Tap <b>Allow Camera Access</b> below for the steps to turn it on. Chrome won’t ask again while access is blocked.</p> : <p>Tap {hasTried ? "Try Camera Again" : "Open Camera"}, then tap <b>Allow</b> when the browser asks to use the camera.</p>}
        </div>}
        <div className={styles.redeemCameraPreview}>
          <div id={CAMERA_ID} className={styles.qrScanner} />
          {(!active || busy) && <div className={styles.redeemCameraPlaceholder}><FiCamera /><span>{active ? progress : "Scan the customer’s badge or checkout QR"}</span></div>}
        </div>
        <div className={styles.redeemScannerActions}>
          <button type="button" onClick={active ? () => { setActive(false); setBusy(false); } : startCamera} disabled={imageBusy || checkingPermission}>
            {checkingPermission ? "Checking camera access…" : active ? (busy ? "Cancel Camera" : "Stop Camera") : blocked ? "Allow Camera Access" : hasTried ? "Try Camera Again" : "Open Camera"}
          </button>
          {active && cameras.length > 1 && <button type="button" onClick={switchCamera} disabled={busy || imageBusy}><FiRefreshCw /> Switch Camera</button>}
        </div>
        <div role="status" aria-live="polite">{error ? <small>{error}</small> : active && <p>{progress}</p>}</div>
        <div className={styles.qrPhotoActions}>
          <strong>Take Photo / Choose QR Image</strong>
          <p>Live camera not working? Take a photo of the customer’s QR or choose a saved image.</p>
          <div className={styles.redeemScannerActions}>
            <button type="button" disabled={imageBusy} onClick={() => chooseImage(photoInput)}><FiCamera /> Take Photo</button>
            <button type="button" disabled={imageBusy} onClick={() => chooseImage(imageInput)}><FiImage /> Choose QR Image</button>
          </div>
          {imageBusy && <p role="status">Reading QR image…</p>}
        </div>
        <input ref={photoInput} type="file" accept="image/*" capture="environment" onChange={scanImage} hidden />
        <input ref={imageInput} type="file" accept="image/*" onChange={scanImage} hidden />
        <div id={IMAGE_ID} hidden />
        <details ref={helpRef} className={styles.cameraHelp} open={showHelp} onToggle={(event) => setShowHelp(event.currentTarget.open)}>
          <summary>How to allow camera</summary>
          <p>Your browser remembers when camera access is blocked. Follow these steps once, then tap Try Camera Again.</p>
          {helpPlatform === "android" && <ol>
            <li>Tap the controls or lock icon beside the website address.</li>
            <li>Open Permissions → Camera and choose Allow. If Chrome shows Reset permissions instead, reset and reload, then tap Allow when asked.</li>
            <li>Return here and tap Try Camera Again.</li>
          </ol>}
          {helpPlatform === "iosChrome" && <ol>
            <li>Open the device Settings.</li>
            <li>Open Apps → Chrome (or Settings → Chrome) and turn Camera on.</li>
            <li>Return to Chrome and tap Try Camera Again. If Chrome asks for this website’s camera access, tap Allow.</li>
          </ol>}
          {helpPlatform === "iosSafari" && <ol>
            <li>Open Safari’s page menu beside the website address.</li>
            <li>Open Website Settings → Camera → Allow.</li>
            <li>Return here and tap Try Camera Again.</li>
          </ol>}
          {helpPlatform === "desktop" && <ol>
            <li>Click the controls beside the website address.</li>
            <li>Open Site settings → Camera → Allow.</li>
            <li>Return here and tap Try Camera Again. Reload the page if Chrome asks.</li>
          </ol>}
          {helpPlatform === "android" && <p>If camera access is also off for Chrome itself: open the device Settings → Apps → Chrome → Permissions → Camera and allow it.</p>}
          <p>Button names may vary by device. A website cannot reopen a permission question that the browser has blocked.</p>
          <p>You can also use Take Photo / Choose QR Image above. Available photo options depend on your device.</p>
          <div className={styles.redeemScannerActions}>
            <button type="button" onClick={startCamera} disabled={active || imageBusy || checkingPermission}>
              {checkingPermission ? "Checking camera access…" : "Try Camera Again"}
            </button>
          </div>
        </details>
      </div>
    </div>
  );
};

export default RedeemQrScanner;
