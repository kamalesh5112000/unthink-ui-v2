import React, { useCallback, useState } from "react";
import { notification } from "antd";
import Cookies from "js-cookie";
import { useDispatch, useSelector } from "react-redux";
import GuestPopUp from "./GuestPopUp";
import { getUserInfo, GuestPopUpShow } from "./redux/actions";
import { authAPIs } from "../../helper/serverAPIs";
import { COOKIE_TT_ID, KIOSK_LOGIN_CHANGE_EVENT, SIGN_IN_EXPIRE_DAYS } from "../../constants/codes";
import { KIOSK_LOGIN_STORAGE_KEY, setCookie } from "../../helper/utils";
import { setKioskLogin } from "../../components/kiosk/redux/actions";

const DEFAULT_GUEST_COOKIE_EXPIRE_DAYS = 7;

function GuestUserPopUp({
  isOpen,
  setIsOpen,
  storeName,
  guestUserId,
  onSuccess,
  onSkip,
  onClose,
  phoneValidator,
  phoneErrorMessage = "Please enter a valid phone number",
  persistKioskLogin = false,
  cookieExpireDays = DEFAULT_GUEST_COOKIE_EXPIRE_DAYS,
  isUserLogin,
}) {
  const dispatch = useDispatch();
  const isGuestPopUpShow = useSelector(
    (state) => state.GuestPopUpReducer.isGuestPopUpShow,
  );
  const [guestData, setGuestData] = useState({ email: "", phone: "" });
  const [errors, setErrors] = useState({ email: "", phone: "" });

  const setPopupOpen = useCallback(
    (show) => {
      setIsOpen?.(show);
      if (!show) onClose?.();
    },
    [onClose, setIsOpen],
  );

  const closePopup = useCallback(() => {
    dispatch(GuestPopUpShow(false));
    setPopupOpen(false);
  }, [dispatch, setPopupOpen]);

  const validateEmail = useCallback((email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }, []);

  const guestChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      setGuestData((data) => ({ ...data, [name]: value }));
      if (name === "email" || name === "phone") {
        setErrors((currentErrors) => ({
          ...currentErrors,
          email: "",
          phone: "",
        }));
      }
    },
    [],
  );

  const handleGuestSkip = useCallback(
    (e) => {
      e?.preventDefault();
      closePopup();
      onSkip?.();
    },
    [closePopup, onSkip],
  );

  const handleGuestSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      const email = guestData.email?.trim();
      const phone = guestData.phone?.trim();

      if (!email && !phone) {
        setErrors({ email: "Email or phone number is required", phone: "" });
        return;
      }

      if (email && !validateEmail(email)) {
        setErrors({ email: "Please enter a valid email address", phone: "" });
        return;
      }

      if (phone && phoneValidator && !phoneValidator(phone)) {
        setErrors({ email: "", phone: phoneErrorMessage });
        return;
      }

      if (!Cookies.get("isGuestLoggedIn")) {
        Cookies.set("isGuestLoggedIn", false, {
          expires: cookieExpireDays,
        });
      }

      try {
        const guestRegisterPayload = {
          emailId: email,
          store: storeName,
          phone,
        };

        if (guestUserId) {
          guestRegisterPayload.user_id = guestUserId;
        }

        const res = await authAPIs.GuestRegisterAPICall(guestRegisterPayload);
        const userId = res?.data?.data?.user_id;
        // console.log('userId',userId);
        
        const registeredUserName =
          res?.data?.data?.user_name ||
          res?.data?.data?.name;
        const registeredEmail =
          res?.data?.data?.email || res?.data?.data?.emailId || email;
        if (res?.data?.status_code === 200 && userId) {
          const kioskLoginData = {
            user_id: userId,
            user_name: registeredUserName || registeredEmail || phone,
            email: registeredEmail,
            phone,
          };

          if (persistKioskLogin && typeof window !== "undefined") {
            sessionStorage.setItem(
              KIOSK_LOGIN_STORAGE_KEY,
              JSON.stringify(kioskLoginData),
            );
            dispatch(setKioskLogin(kioskLoginData));
            window.dispatchEvent(new Event(KIOSK_LOGIN_CHANGE_EVENT));
          }
          if(isUserLogin){
            setCookie(COOKIE_TT_ID, userId, SIGN_IN_EXPIRE_DAYS);
            dispatch(getUserInfo());
          }
          notification.success({
            message: "Login Successfully",
          });
          closePopup();
          onSuccess?.({
            userId,
            response: res,
            userName: registeredUserName || registeredEmail || phone,
            email: registeredEmail,
            phone,
          });
        }
      } catch (error) {
        console.error("Guest registration error:", error);
        setErrors({
          email: "Registration failed. Please try again.",
        });
      }
    },
    [
      closePopup,
      cookieExpireDays,
      guestData.email,
      guestData.phone,
      guestUserId,
      onSuccess,
      persistKioskLogin,
      phoneErrorMessage,
      phoneValidator,
      storeName,
      validateEmail,
      dispatch,
      isUserLogin,
    ],
  );

  if (!isOpen || !isGuestPopUpShow) return null;

  return (
    <GuestPopUp
      handleGuestSubmit={handleGuestSubmit}
      errors={errors}
      handleGuestSkip={handleGuestSkip}
      guestChange={guestChange}
      guestData={guestData}
      setIsPopupShow={setPopupOpen}
    />
  );
}

export default GuestUserPopUp;
