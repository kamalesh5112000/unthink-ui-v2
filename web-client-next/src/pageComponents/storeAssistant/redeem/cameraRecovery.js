export const getCameraFailure = (error) => {
  const message = `${error?.name || ""} ${error?.message || error || ""}`;
  if (/notallowed|permission|denied|securityerror/i.test(message)) {
    return { blocked: true, message: "Camera access wasn’t allowed. Tap How to allow camera below, or take a photo of the customer’s QR instead." };
  }
  if (/notfound|devicesnotfound/i.test(message)) {
    return { blocked: false, message: "No camera was found. You can choose a photo of the customer’s QR instead." };
  }
  return { blocked: false, message: "The camera couldn’t start. Try Camera Again, or take a photo of the customer’s QR." };
};

export const canRetryCamera = (error) =>
  !getCameraFailure(error).blocked && !/notfound|devicesnotfound/i.test(`${error?.name || ""} ${error?.message || error || ""}`);

// Count delivered frames where available; currentTime supports older browsers.
// Do not inspect brightness: a dark scene is not evidence of a frozen camera.
export const getVideoProgress = (video) => {
  if (!video || video.readyState < 2 || !video.videoWidth) return null;
  const quality = video.getVideoPlaybackQuality?.();
  return quality?.totalVideoFrames > 0 ? quality.totalVideoFrames : video.currentTime;
};

export const withTimeout = (promise, milliseconds, message) => {
  let timer;
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      timer = setTimeout(() => reject(new Error(message)), milliseconds);
    }),
  ]).finally(() => clearTimeout(timer));
};

// Safari and older browsers may expose Permissions but reject the camera name.
// An unsupported/slow query must not prevent an actual camera request.
export const readCameraPermission = async (permissions) => {
  if (!permissions?.query) return null;
  try {
    return await withTimeout(permissions.query({ name: "camera" }), 1200, "Permission check timed out");
  } catch {
    return null;
  }
};
