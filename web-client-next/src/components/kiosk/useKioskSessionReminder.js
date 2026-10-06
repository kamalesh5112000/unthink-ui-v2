import React, { useEffect, useRef, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { KIOSK_LOGIN_CHANGE_EVENT } from "../../constants/codes";
import { clearStoragesKiosk } from "../../helper/utils";
import { getUserCollectionsReset, getWishlistUserCollectionReset } from "../../pageComponents/Auth/redux/actions";
import { fetchCategoriesReset } from "../../pageComponents/categories/redux/actions";
import { clearInfluencerCollections } from "../../pageComponents/Influencer/redux/actions";
import { fetchCartReset } from "../../pageComponents/DeliveryDetails/redux/action";
import timer_clock from "../../images/kiosk/timer_clock.png";
import { useRouter } from "next/router";

const notifyKioskLoginChange = () => {
  if (typeof window === "undefined") return;

  window.dispatchEvent(new Event(KIOSK_LOGIN_CHANGE_EVENT));
};

// Hook: manages kiosk session reminder timer and actions
export default function useKioskSessionReminder({ time } = {}) {
  const intervalMs = time || 120 * 1000;
  // console.log('time',time);
  
  const dispatch = useDispatch();
  const isUserLogin = useSelector((state) => state.auth.user.isUserLogin);
  const kioskLogin = useSelector((state) => state.kiosk.login);
  const [showSessionPopup, setShowSessionPopup] = useState(false);
// console.log('showSessionPopup',showSessionPopup);

  const timerRef = useRef(null);
  const startSessionTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (!kioskLogin || !isUserLogin) return;

    timerRef.current = setInterval(() => {
      if (kioskLogin && isUserLogin) {
        setShowSessionPopup(true);
      } else {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      }
    }, intervalMs);
  }, [isUserLogin, intervalMs, kioskLogin]);

  useEffect(() => {
    startSessionTimer();
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [startSessionTimer]);

  const handleStayLoggedIn = useCallback(() => {
    setShowSessionPopup(false);
    startSessionTimer();
  }, [startSessionTimer]);
    const router = useRouter()
  const handleLogout = useCallback(async () => {

    try {
      // clearStorages();
      clearStoragesKiosk();
      notifyKioskLoginChange();
      router.replace('/kiosk')
    } catch (e) {}
    try {
      dispatch(getUserCollectionsReset());
      dispatch(getWishlistUserCollectionReset());
      dispatch(fetchCartReset());
      dispatch(fetchCategoriesReset());
      dispatch(clearInfluencerCollections());
      sessionStorage.removeItem("plp-scroll");
    sessionStorage.removeItem("plp-collection");
    } catch (e) {}

    setShowSessionPopup(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, [dispatch, router]);

  return {
    showSessionPopup,
    setShowSessionPopup,
    handleStayLoggedIn,
    handleLogout,
    startSessionTimer,
  };
}

// Simple presentational popup component exported alongside the hook so consumers can import both from one file
export function KioskSessionPopup({ onStay, onLogout }) {
  const kioskLoginMail = useSelector((state) => state.kiosk.login?.email);
  const maskedEmail = kioskLoginMail?.replace(/^(.{5})[^@]*(@.*)$/, "$1....$2");

  useEffect(() => {
    const timer = setTimeout(() => {
      onLogout();
    }, 30000);

    return () => clearTimeout(timer);
  }, [onLogout]);
  // console.log('timer_clock',timer_clock);

  return (
    <div className="fixed top-10 right-8 transform   z-60">
      <div className="relative bg-white border border-gray-200 rounded-[18px] shadow-xl p-6 w-[369px] md:w-[420px] max-w-[95%] text-center">
        <img
          src={timer_clock.src}
          alt="session timer"
          className="  absolute top-5 left-1/2  -translate-x-1/2 -translate-y-1/2  w-30 h-30 rounded-full object-cover"
        />

        <h3 className="mt-6 text-2xl md:text-3xl font-semibold leading-none text-[#5163c1] ">
          The session will expire soon.
        </h3>

        <div className=" flex gap-2 items-center px-4">
          <button
            onClick={onStay}
            className="w-full max-w-[260px] mt-4 bg-[#2fa04a] hover:bg-[#2b9442] text-white text-base font-medium py-2.5 px-4 rounded-full shadow-lg"
          >
            Stay Logged In
          </button>
          <button
            onClick={onLogout}
            className="mt-3 w-full max-w-[260px] bg-alert text-white text-base font-medium py-2.5 px-4 rounded-full shadow-sm"
          >
            Logout
          </button>
        </div>
        <p className="mt-2 text-[11px] text-gray-500">{maskedEmail}</p>
        <div
          className="absolute -bottom-3 left-8 w-6 h-6 bg-white border-r border-gray-200 transform rotate-45"
          aria-hidden="true"
        />
      </div>
    </div>
  );
}

// attach popup to default hook so consumers can access it as useKioskSessionReminder.Popup
try {
  // eslint-disable-next-line no-undef
  if (typeof useKioskSessionReminder === "function") {
    useKioskSessionReminder.Popup = KioskSessionPopup;
  }
} catch (e) {
  // ignore in environments where module scope is immutable
}
