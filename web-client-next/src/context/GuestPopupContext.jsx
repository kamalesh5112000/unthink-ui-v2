import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Router from "next/router";
import { useDispatch, useSelector } from "react-redux";
import GuestUserPopUp from "../pageComponents/Auth/GuestUserPopUp";
import { GuestPopUpShow } from "../pageComponents/Auth/redux/actions";
import { current_store_name } from "../constants/config";

const GuestPopupContext = createContext({
  openGuestPopup: () => {},
  closeGuestPopup: () => {},
  hasPendingAction: false,
});

const DEFAULT_POPUP_OPTIONS = {
  persistKioskLogin: false,
  waitForAuth: true,
};

export const GuestPopupProvider = ({ children }) => {
  const dispatch = useDispatch();
  const pendingActionRef = useRef(null);
  const executionRef = useRef(null);
  const [popupOptions, setPopupOptions] = useState(DEFAULT_POPUP_OPTIONS);
  const [pendingSuccess, setPendingSuccess] = useState(null);

  const [
    isGuestPopUpShow,
    storeName,
    authUserId,
    isUserLogin,
    authUserFetching,
  ] = useSelector((state) => [
    state.GuestPopUpReducer.isGuestPopUpShow,
    state.store.data?.store_name,
    state.auth.user.data?.user_id,
    state.auth.user.isUserLogin,
    state.auth.user.isFetching,
  ]);

  const clearPendingAction = useCallback((reason = "cancel") => {
    const pendingAction = pendingActionRef.current;
    pendingActionRef.current = null;
    executionRef.current = null;
    setPendingSuccess(null);
    setPopupOptions(DEFAULT_POPUP_OPTIONS);

    if (pendingAction && reason !== "success" && reason !== "skip") {
      pendingAction.onCancel?.({ reason, action: pendingAction.action });
    }
  }, []);

  const closeGuestPopup = useCallback(
    (reason = "cancel") => {
      dispatch(GuestPopUpShow(false));
      clearPendingAction(reason);
    },
    [clearPendingAction, dispatch],
  );

  const openGuestPopup = useCallback(
    ({
      action = null,
      onSuccess,
      onSkip,
      onCancel,
      metadata,
      login_msg,
      ...options
    } = {}) => {
      const id = `${Date.now()}-${Math.random()}`;

      pendingActionRef.current = {
        id,
        action,
        metadata,
        onSuccess,
        onSkip,
        onCancel,
        login_msg,
        waitForAuth: options.waitForAuth ?? DEFAULT_POPUP_OPTIONS.waitForAuth,
      };
      executionRef.current = null;
      setPendingSuccess(null);
      setPopupOptions({
        ...DEFAULT_POPUP_OPTIONS,
        ...options,
        login_msg,
      });
      dispatch(GuestPopUpShow(true));
    },
    [dispatch],
  );

  const executePendingSuccess = useCallback(
    async ({ pendingAction, successPayload }) => {
      if (!pendingAction || executionRef.current === pendingAction.id) return;

      executionRef.current = pendingAction.id;
      try {
        await pendingAction.onSuccess?.({
          ...successPayload,
          action: pendingAction.action,
          metadata: pendingAction.metadata,
        });
      } finally {
        clearPendingAction("success");
      }
    },
    [clearPendingAction],
  );

  const handleSuccess = useCallback(
    async (successPayload) => {
      const pendingAction = pendingActionRef.current;

      if (!pendingAction?.onSuccess) {
        clearPendingAction("success");
        return;
      }

      if (pendingAction.waitForAuth === false) {
        await executePendingSuccess({ pendingAction, successPayload });
        return;
      }

      setPendingSuccess({
        pendingActionId: pendingAction.id,
        successPayload,
      });
    },
    [clearPendingAction, executePendingSuccess],
  );

  const handleCancel = useCallback(() => {
    clearPendingAction("cancel");
  }, [clearPendingAction]);

  const handleSkip = useCallback(() => {
    const pendingAction = pendingActionRef.current;
    pendingAction?.onSkip?.({ action: pendingAction.action });
    clearPendingAction("skip");
  }, [clearPendingAction]);

  const handlePopupOpenChange = useCallback(
    (show) => {
      if (!show) {
        dispatch(GuestPopUpShow(false));
      }
    },
    [dispatch],
  );

  useEffect(() => {
    if (!pendingSuccess) return;

    const pendingAction = pendingActionRef.current;
    if (!pendingAction || pendingAction.id !== pendingSuccess.pendingActionId) {
      setPendingSuccess(null);
      return;
    }

    const successUserId = pendingSuccess.successPayload?.userId;
    const hasRecognizedUser =
      !authUserFetching &&
      (isUserLogin || (successUserId && authUserId === successUserId));

    if (hasRecognizedUser) {
      executePendingSuccess({
        pendingAction,
        successPayload: pendingSuccess.successPayload,
      });
    }
  }, [
    authUserFetching,
    authUserId,
    executePendingSuccess,
    isUserLogin,
    pendingSuccess,
  ]);

  useEffect(() => {
    const handleRouteChangeStart = () => closeGuestPopup("route-change");

    Router.events.on("routeChangeStart", handleRouteChangeStart);
    return () => {
      Router.events.off("routeChangeStart", handleRouteChangeStart);
    };
  }, [closeGuestPopup]);

  const contextValue = useMemo(
    () => ({
      openGuestPopup,
      closeGuestPopup,
      hasPendingAction: !!pendingActionRef.current,
    }),
    [closeGuestPopup, openGuestPopup],
  );

  return (
    <GuestPopupContext.Provider value={contextValue}>
      {children}
      <GuestUserPopUp
        isOpen={isGuestPopUpShow}
        setIsOpen={handlePopupOpenChange}
        storeName={popupOptions.storeName || storeName || current_store_name}
        persistKioskLogin={popupOptions.persistKioskLogin}
        cookieExpireDays={popupOptions.cookieExpireDays}
        phoneValidator={popupOptions.phoneValidator}
        phoneErrorMessage={popupOptions.phoneErrorMessage}
        isUserLogin={popupOptions.refreshUserInfo ?? !isUserLogin}
        login_msg={popupOptions.login_msg}
        onSuccess={handleSuccess}
        onSkip={handleSkip}
        onClose={handleCancel}
      />
    </GuestPopupContext.Provider>
  );
};

export const useGuestPopup = () => useContext(GuestPopupContext);

export default GuestPopupContext;
