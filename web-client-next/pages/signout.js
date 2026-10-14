import React, { useCallback, useEffect } from "react";
import { useRouter } from "next/router";
import Cookies from "js-cookie";
import { useDispatch } from "react-redux";
import { Spin } from "antd";
import { SIGN_IN_EXPIRE_DAYS } from "../src/constants/codes";
import { checkAndGenerateUserId, clearStorages, generateSessionId } from "../src/helper/utils";
import { logoutVenlyUser } from "../src/helper/venlyUtils";
import { getUserCollectionsReset, getUserInfo, getUserInfoSuccess, getWishlistUserCollectionReset } from "../src/pageComponents/Auth/redux/actions";
import { is_store_instance } from "../src/constants/config";
import { fetchCategoriesReset } from "../src/pageComponents/categories/redux/actions";
import { clearInfluencerCollections } from "../src/pageComponents/Influencer/redux/actions";
import { fetchCartReset } from "../src/pageComponents/DeliveryDetails/redux/action";

const SignOut = () => {
  const router = useRouter();
  const dispatch = useDispatch();

  const getRedirectPath = useCallback(() => {
    const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
    const redirect = params ? params.get("redirect") : null;
    if (redirect) return redirect;
    if (router.pathname.startsWith("/kiosk")) return "/kiosk";
    return is_store_instance ? "/" : "/store";
  }, [router.pathname]);

  useEffect(() => {
    const handleSignOut = async () => {
      try {
        // Clear cookies and storage
        Cookies.set("isGuestLoggedIn", false, { expires: SIGN_IN_EXPIRE_DAYS });
        localStorage.removeItem("adminRolePopupShown", "false");
         
         
        clearStorages();
        
        // Generate new user ID for guest user
        checkAndGenerateUserId();
        generateSessionId();

        // Logout from Venly
        try {
          logoutVenlyUser();
        } catch {
          console.log("wallet error");
        }

        // Reset Redux state
        dispatch(getUserInfoSuccess({}));
        dispatch(getUserCollectionsReset());
        dispatch(getWishlistUserCollectionReset());
        dispatch(fetchCartReset());
        dispatch(clearInfluencerCollections());
        dispatch(fetchCategoriesReset());
        sessionStorage.removeItem("plp-scroll");
        sessionStorage.removeItem("plp-collection");

        setTimeout(() => {
          dispatch(getUserInfo());
          // Redirect to home or store page
          router.push(getRedirectPath());

        }, 2000);
      } catch (error) {
        console.log("Sign out error:", error);
        router.push(getRedirectPath());
      }
    };

    handleSignOut();
  }, [dispatch, getRedirectPath, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-md px-6">
        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
          {/* Header */}
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </div>
          </div>

          {/* Loading Spinner */}
          <div className="flex justify-center mb-6">
            <Spin size="large" className="pink-spinner" />
          </div>

          {/* Main Text */}
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Signing you out</h1>
          <p className="text-gray-600 mb-6">Please wait while we log you out securely.</p>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-1 overflow-hidden">
            <div className="bg-linear-to-r from-red-500 to-red-600 h-1 rounded-full animate-pulse" style={{ width: "100%" }}></div>
          </div>

          {/* Info Text */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-2">You will be redirected shortly...</p>
            <p className="text-xs text-gray-400">Session cleared • Cache emptied • Ready to reconnect</p>
          </div>
        </div>

        {/* Footer Message */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            If you are not redirected automatically,{" "}
            <button
              onClick={() => {
                router.push(getRedirectPath());
              }}
              className="text-red-600 font-semibold hover:text-red-700 transition-colors underline"
            >
              click here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignOut;
