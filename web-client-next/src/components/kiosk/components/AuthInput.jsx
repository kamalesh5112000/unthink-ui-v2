import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { authAPIs, collectionAPIs } from "../../../helper/serverAPIs";
import { current_store_name } from "../../../constants/config";
import { KIOSK_LOGIN_STORAGE_KEY } from "../../../helper/utils";
import MiniKioskCard from "../MiniKioskCard";
import { KIOSK_LOGIN_CHANGE_EVENT } from "../../../constants/codes";
import { buildKioskAutoLoginUrls } from "../../../helper/autoLogin";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { getWishlistUserCollectionReset } from "../../../pageComponents/Auth/redux/actions";
import { fetchCartReset } from "../../../pageComponents/DeliveryDetails/redux/action";
import { clearInfluencerCollections } from "../../../pageComponents/Influencer/redux/actions";
import { setKioskLogin as setKioskLoginRedux } from "../redux/actions";

const INITIAL_COLLECTION_QR_STATE = {
  isOpen: false,
  isLoading: false,
  title: "",
  message: "",
  products: [],
  qrUrl: "",
  qrTargetUrl: "",
};

const KIOSK_COLLECTION_ACTIONS = [
  {
    key: "wishlist",
    label: "Wishlist",
    pathPrefix: "my_wishlist",
    modalTitle: "Wishlist Products",
    emptyMessage: "No wishlist there. Create the Wishlist",
  },
  {
    key: "cart",
    label: "Cart",
    pathPrefix: "my_cart",
    modalTitle: "My Cart",
    emptyMessage: "No items in the cart. Please add items to your cart.",
  },
  {
    key: "tryon",
    label: "Try ons",
    modalTitle: "Try-on Products",
    emptyMessage: "No try-on there. Please create a try-on using the mobile .",
    getFetchParams: (userId) => ({
      collection_name: "my tryons",
      user_id: userId,
      type: "system",
    }),
  },
];

const getGuestLoginName = (user) =>
  user?.user_name || user?.email || user?.emailId || user?.phone;

const getPhoneValue = (value) => value.replace(/[^\d+]/g, "");

const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const isValidPhone = (value) => /^\+?\d{10,15}$/.test(getPhoneValue(value));

const getCollectionListFromResponse = (response) => {
  const data = response?.data?.data;

  if (Array.isArray(data)) return data.filter(Boolean);
  if (Array.isArray(data?.data)) return data.data.filter(Boolean);
  if (data && typeof data === "object") return [data];

  return [];
};

const getCollectionProductCount = (collection) => {
  const productLists = collection?.product_lists;

  return Array.isArray(productLists) ? productLists.filter(Boolean).length : 0;
};

const getCollectionAutoLoginRoute = (collection, kioskLogin) => {
  const userName =
    collection?.user_name ||
    kioskLogin?.user_name ||
    kioskLogin?.email ||
    kioskLogin?.phone ||
    "";
  const collectionId =
    collection?._id || collection?.collection_id || collection?.id || "";

  if (!userName || !collectionId) return null;

  const encodedUserName = encodeURIComponent(userName);
  const encodedCollectionId = encodeURIComponent(collectionId);
  const pagePath = `influencer/${encodedUserName}/${encodedCollectionId}`;

  return {
    targetPath: `/${pagePath}`,
    pageParam: `?page=${pagePath}`,
  };
};

const getFetchedCollection = (response, collectionPath) => {
  const collections = getCollectionListFromResponse(response);

  return (
    collections.find((collection) => collection?.path === collectionPath) ||
    collections.find(
      (collection) => getCollectionProductCount(collection) > 0,
    ) ||
    collections[1] ||
    collections[0] ||
    null
  );
};

const renderCollectionActionIcon = (actionKey) => {
  if (actionKey === "wishlist") {
    return (
      <svg
        className="w-5 h-5 text-red"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        ></path>
      </svg>
    );
  }

  if (actionKey === "cart") {
    return (
      <svg
        className="w-5 h-5 "
        fill="none"
        style={{ color: "#3B82F6" }}
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
        ></path>
      </svg>
    );
  }

  return (
    <svg
      className="w-5 h-5"
      fill="none"
      style={{ color: "#22C55E" }}
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
      ></path>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
      ></path>
    </svg>
  );
};

const AuthInput = ({ onLoginChange, styles }) => {
  const dispatch = useDispatch();
  const kioskLoginFromStore = useSelector((state) => state.kiosk.login);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [emailPhone, setEmailPhone] = useState("");
  const [kioskLogin, setKioskLogin] = useState(null);
  // console.log('kioskLogin',kioskLogin);
  const router = useRouter();

  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [qrState, setQrState] = useState(INITIAL_COLLECTION_QR_STATE);
  const [activeCollectionAction, setActiveCollectionAction] = useState("");
  const containerRef = useRef(null);

  const activeMenuKey = useMemo(() => {
    const currentPath = router.asPath?.split("?")[0] || router.pathname || "";
    if (currentPath === "/cart" || currentPath.startsWith("/cart/") || currentPath === "/kiosk/cart") {
      return "cart";
    }

    return "";
  }, [router.asPath, router.pathname]);

  const syncKioskLogin = useCallback(
    (login) => {
      setKioskLogin(login);
      dispatch(setKioskLoginRedux(login));
      onLoginChange?.(login);
    },
    [dispatch, onLoginChange],
  );

  const clearKioskLogin = useCallback(
    ({ resetInput = true } = {}) => {
      if (typeof window !== "undefined") {
        sessionStorage.removeItem(KIOSK_LOGIN_STORAGE_KEY);
        window.dispatchEvent(new Event(KIOSK_LOGIN_CHANGE_EVENT));
      }
      if (resetInput) setEmailPhone("");
      setStatus("");
      sessionStorage.removeItem("selectedTag");
      setIsDropdownOpen(false);
      syncKioskLogin(null);
      dispatch(getWishlistUserCollectionReset());
      dispatch(fetchCartReset());
      dispatch(clearInfluencerCollections());
      router.replace('/kiosk')
      // notifyKioskLoginChange();
    },
    [dispatch, router, syncKioskLogin],
  );

  useEffect(() => {
    if (!kioskLoginFromStore) {
      setEmailPhone("");
      setStatus("");
      setIsDropdownOpen(false);
      setKioskLogin(null);
      // onLoginChange?.(null);
      return;
    }

    setEmailPhone(getGuestLoginName(kioskLoginFromStore) || "");
    setKioskLogin(kioskLoginFromStore);
    onLoginChange?.(kioskLoginFromStore);
  }, [kioskLoginFromStore, onLoginChange]);

  useEffect(() => {
    if (!isDropdownOpen) return undefined;

    const handleOutsideClick = (e) => {
      if (!containerRef.current?.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("touchstart", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
    };
  }, [isDropdownOpen]);

  const handleGuestLogin = useCallback(async () => {
    if (isSubmitting) return;

    const value = emailPhone.trim();
    const isEmail = isValidEmail(value);
    const isPhone = isValidPhone(value);

    if (!value) {
      setStatus("Email or phone number is required");
      return;
    }

    if (!isEmail && !isPhone) {
      setStatus("Enter a valid email or phone number");
      return;
    }

    setIsSubmitting(true);
    setStatus("Logging in...");

    try {
      const phone = isPhone ? getPhoneValue(value) : "";
      const email = isEmail ? value : "";
      const res = await authAPIs.GuestRegisterAPICall({
        emailId: email,
        store: current_store_name,
        phone,
      });
      const responseData = res?.data?.data || {};
      const userId = responseData.user_id;
      const registeredUserName = responseData.user_name;
      const registeredEmail = responseData.email || responseData.emailId;
      const loginName = registeredUserName || registeredEmail;

      if (res?.data?.status_code === 200 && userId) {
        const loginData = {
          user_id: userId,
          user_name: loginName,
          email: registeredEmail,
          phone,
        };

        sessionStorage.setItem(
          KIOSK_LOGIN_STORAGE_KEY,
          JSON.stringify(loginData),
        );
        window.dispatchEvent(new Event(KIOSK_LOGIN_CHANGE_EVENT));
        setEmailPhone(loginName);
        syncKioskLogin(loginData);
        setStatus("");
        setIsDropdownOpen(true);
        return;
      }

      clearKioskLogin({ resetInput: false });
      setStatus("Login failed. Please try again.");
    } catch (error) {
      console.error("Kiosk guest login error:", error);
      clearKioskLogin({ resetInput: false });
      setStatus("Login failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }, [clearKioskLogin, emailPhone, isSubmitting, syncKioskLogin]);

  const handleInputChange = (e) => {
    if (kioskLogin) {
      clearKioskLogin({ resetInput: false });
    }
    setEmailPhone(e.target.value);
  };

  const handleInputKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (!kioskLogin) handleGuestLogin();
    }
  };

  const handleUserButtonClick = () => {
    if (kioskLogin) {
      setIsDropdownOpen((isOpen) => !isOpen);
      return;
    }

    handleGuestLogin();
  };

  const handleLogout = () => {
    clearKioskLogin();
  };

  const handleCollectionActionClick = useCallback(
    async (action) => {
      if (activeCollectionAction) return;

      const userId = kioskLogin?.user_id;
      if (!userId) {
        setStatus("Login is required");
        return;
      }
      if (action.key === "cart") {
        setIsDropdownOpen(false);
        router.push("/kiosk/cart");
        return;
      }
      const collectionPath = action.pathPrefix ? `${action.pathPrefix}_${userId}` : "";
      const fetchParams = action.getFetchParams
        ? action.getFetchParams(userId)
        : {
            path: collectionPath,
            ...(action.key === "cart" ? { is_display_amount: true } : {}),
          };

      setIsDropdownOpen(false);
      setStatus("");
      setActiveCollectionAction(action.key);

      try {
        const response =
          await collectionAPIs.fetchCollectionsAPICall(fetchParams);
        const collection = getFetchedCollection(response, collectionPath);
        // console.log('collection',collection.product_lists);

        const hasCollectionData = getCollectionProductCount(collection) > 0;
        const autoLoginRoute = hasCollectionData
          ? getCollectionAutoLoginRoute(collection, kioskLogin)
          : null;
        const autoLoginUrls = autoLoginRoute
          ? await buildKioskAutoLoginUrls({
              ...autoLoginRoute,
              errorLabel: `${action.label} collection auto-login`,
              kioskLogin,
              requireUserId: true,
            })
          : null;

        setQrState({
          ...INITIAL_COLLECTION_QR_STATE,
          isOpen: true,
          isLoading: true,
          title: action.modalTitle,
        });
        if (!collection?.product_lists || !hasCollectionData) {
          setQrState((prev) => ({
            ...prev,
            isLoading: false,
            message: action.emptyMessage,
          }));
          return;
        }

        setQrState((prev) => ({
          ...prev,
          isLoading: false,
          products: collection.product_lists.filter(Boolean),
          qrUrl: autoLoginUrls?.qrUrl || "",
          qrTargetUrl: autoLoginUrls?.shareUrl || "",
        }));
      } catch (error) {
        console.error(`${action.label} QR build failed`, error);
        setQrState((prev) => ({
          ...prev,
          isLoading: false,
          message: `${action.emptyMessage}`,
        }));
      } finally {
        setActiveCollectionAction("");
      }
    },
    [activeCollectionAction, kioskLogin, router],
  );

  const loginName = getGuestLoginName(kioskLogin);

  return (
    <div
      ref={containerRef}
      className={`flex justify-end items-center    ${styles ? styles : " "} gap-4 relative ml-auto`}
    >
      <div
        className={`flex items-center w-full  bg-white border border-gray-200 rounded-full pl-2 pr-4 py-2 shadow-sm ${
          kioskLogin
            ? "w-fit justify-start cursor-pointer "
            : "justify-evenly   "
        }`}
        onClick={kioskLogin ? handleUserButtonClick : undefined}
      >
        {!kioskLogin && (
          <input
            type="text"
            placeholder="email/phone number"
            value={emailPhone}
            onChange={handleInputChange}
            onKeyDown={handleInputKeyDown}
            className="outline-none border-none bg-transparent text-sm w-40 text-black placeholder-gray-700"
          />
        )}
        <button
          disabled={isSubmitting}
          title={kioskLogin ? "Open user menu" : "Login"}
          className={`${kioskLogin ? "mr-2" : "ml-2"} bg-black text-white p-2 rounded-full flex items-center justify-center w-8 h-8 ${
            isSubmitting ? "cursor-not-allowed opacity-60" : ""
          }`}
          onClick={!kioskLogin ? handleUserButtonClick : undefined}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-4 h-4"
          >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </button>
        {kioskLogin && (
          <span className="text-sm font-medium text-black whitespace-nowrap">
            {loginName}
          </span>
        )}
      </div>

      {status && (
        <div className="absolute top-12 pt-0.5  z-30 right-1 text-xs text-red-500">
          {status}
        </div>
      )}

      {kioskLogin && isDropdownOpen && (
        <div className="absolute top-14 right-0 bg-white border border-gray-200 shadow-lg rounded-xl py-2 w-48 z-50">
          {KIOSK_COLLECTION_ACTIONS.map((action) => {
            const isActive = activeMenuKey === action.key;

            return (
              <button
                key={action.key}
                onClick={() => handleCollectionActionClick(action)}
                disabled={Boolean(activeCollectionAction)}
                aria-current={isActive ? "page" : undefined}
                className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors ${
                  isActive
                    ? "bg-support text-black font-semibold"
                    : "text-gray-700 hover:bg-gray-50"
                } ${activeCollectionAction ? "cursor-not-allowed opacity-60" : ""}`}
              >
                {renderCollectionActionIcon(action.key)}
                {activeCollectionAction === action.key
                  ? "Loading..."
                  : action.label}
              </button>
            );
          })}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            <svg
              className="w-5 h-5 "
              fill="none"
              style={{ color: "#6a7282" }}
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1"
              ></path>
            </svg>
            Logout
          </button>
        </div>
      )}

      <MiniKioskCard
        title={qrState.title}
        isOpen={qrState.isOpen}
        isLoading={qrState.isLoading}
        products={qrState.products}
        message={qrState.message}
        qrUrl={qrState.qrUrl}
        qrTargetUrl={qrState.qrTargetUrl}
        onClose={() => setQrState(INITIAL_COLLECTION_QR_STATE)}
      />
    </div>
  );
};

export default AuthInput;
