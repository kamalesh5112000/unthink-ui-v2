import React, { useCallback } from "react";
import { useDispatch } from "react-redux";
import { notification } from "antd";
import { FaHeart, FaRegHeart } from "react-icons/fa6";
import { current_store_name } from "../../../constants/config";
import { WISHLIST_TITLE } from "../../../constants/codes";
import {
  getwishlistUserCollection,
} from "../../Auth/redux/actions";
import { addProductToWishlistCollection } from "../../wishlistActions/addProductToWishlistCollection/redux/actions";
import { removeFromWishlist } from "../../wishlistActions/removeFromWishlist/redux/actions";
import { getTTid } from "../../../helper/getTrackerInfo";
import { useGuestPopup } from "../../../context/GuestPopupContext";

const DEFAULT_BUTTON_CLASS =
  "box-border flex h-8 w-8 items-center justify-center rounded-full bg-white p-0 shadow-[0px_2px_12px_rgba(0,0,0,0.1)] min-[1000px]:transition-all min-[1000px]:duration-200 min-[1000px]:ease-in-out min-[1000px]:hover:bg-hover-light min-[1000px]:hover:shadow-[0px_4px_16px_rgba(0,0,0,0.15)] max-[1024px]:p-1";

const WishlistHeartButton = ({
  isActive = false,
  onClick,
  onRemoveIconClick,
  onAdd,
  product,
  productMfrCode,
  userId,
  storeData,
  authUserId,
  hasKioskAccess,
  enableKioskGuestPopup,
  getKioskLogin,
  onGuestPopupOpen,
  onAddSelectedProductsToCollection,
  source,
  store = current_store_name,
  containerClassName = "",
  buttonClassName = DEFAULT_BUTTON_CLASS,
  activeIconClassName = "text-red",
  inactiveIconClassName = "",
  title = "Add to wishlist",
  userLogin,
}) => {
  const dispatch = useDispatch();
  const { openGuestPopup } = useGuestPopup();
  const callHandpickedAPI = useCallback(
    async (wishlistUserId) => {
      if (!wishlistUserId) {
        notification.error({ message: "Unable to add to wishlist" });
        return null;
      }

      const payload = {
        user_id: wishlistUserId,
        store: storeData?.store_name || "dothelook",
        Event_id: storeData?.event_id || "dothelookwebpage_447990",

        mfr_code: product?.mfr_code || productMfrCode,
        product_name: product?.name,
        product_image: product?.image,
        callback: () => {
          dispatch(
            getwishlistUserCollection({
              path: `my_wishlist_${wishlistUserId}`,
            }),
          );
        },
      };

      dispatch(addProductToWishlistCollection(payload));
    },
    [
      dispatch,
      product?.image,
      product?.mfr_code,
      product?.name,
      productMfrCode,
      storeData?.event_id,
      storeData?.store_name,
    ],
  );

  const removeFromWishlistClick = useCallback(
    (event) => {
      event.stopPropagation();
      event.preventDefault();

      if (onRemoveIconClick) {
        onRemoveIconClick(product?.mfr_code || productMfrCode);
        return;
      }

      if (!productMfrCode) return;

      dispatch(
        removeFromWishlist({
          products: [productMfrCode],
          collection_name: "my wishlist",
          type: "system",
          successMessage: `${WISHLIST_TITLE} has been successfully deleted`,
          errorMessage: `Failed to delete ${WISHLIST_TITLE}, try after sometime`,
          removeCollectionFromUserCollections: true,
          wishlistCallBack: true,
          user_id: userId || getTTid(),
          store,
          clearSelectedCollectionData: true,
        }),
      );
    },
    [
      dispatch,
      onRemoveIconClick,
      product?.mfr_code,
      productMfrCode,
      store,
      userId,
    ],
  );

  const addToWishlistClick = useCallback(
    async (event) => {
      event.preventDefault();
      event.stopPropagation();
      onGuestPopupOpen?.("");

      const kioskLogin = getKioskLogin?.();

      if ((hasKioskAccess || enableKioskGuestPopup) && !kioskLogin) {
        openGuestPopup({
          action: "wishlist",
          storeName: storeData?.store_name || store,
          persistKioskLogin: true,
          refreshUserInfo: !userLogin,
          onSuccess: ({ userId }) => callHandpickedAPI(userId),
        });
        return;
      }

      callHandpickedAPI(kioskLogin?.user_id || authUserId || userId);
    },
    [
      authUserId,
      callHandpickedAPI,
      dispatch,
      enableKioskGuestPopup,
      getKioskLogin,
      hasKioskAccess,
      onGuestPopupOpen,
      openGuestPopup,
      store,
      storeData?.store_name,
      userId,
      userLogin,
    ],
  );

  const handleGuestWishlistClick = useCallback(
    (event) => {
      event.preventDefault();
      event.stopPropagation();

      if (!onAddSelectedProductsToCollection) {
        onGuestPopupOpen?.("");
        openGuestPopup({
          action: "wishlist",
          storeName: storeData?.store_name || store,
          persistKioskLogin: hasKioskAccess || enableKioskGuestPopup,
          refreshUserInfo: !userLogin,
          onSuccess: ({ userId }) => callHandpickedAPI(userId),
        });
        return;
      }

      // if (source === "SEARCH") {
      //   onAddSelectedProductsToCollection(
      //     event,
      //     { isSave: true, product, skipWishlistStateAfterGuest: true },
      //     {
      //       addToHandpickedWishlist: ({ userId: selectedUserId } = {}) => {
      //         const latestKioskLogin = getKioskLogin?.();
      //         return callHandpickedAPI(
      //           selectedUserId ||
      //             latestKioskLogin?.user_id ||
      //             authUserId ||
      //             getTTid(),
      //         );
      //       },
      //     },
      //   );
      //   return;
      // }

      onAddSelectedProductsToCollection(event, product, {
        addToHandpickedWishlist: ({ userId: selectedUserId } = {}) => {
          const latestKioskLogin = getKioskLogin?.();
          return callHandpickedAPI(
            selectedUserId || latestKioskLogin?.user_id || authUserId || getTTid(),
          );
        },
      });
    },
    [
      authUserId,
      callHandpickedAPI,
      dispatch,
      enableKioskGuestPopup,
      getKioskLogin,
      hasKioskAccess,
      onAddSelectedProductsToCollection,
      onGuestPopupOpen,
      openGuestPopup,
      product,
      source,
      store,
      storeData?.store_name,
      userLogin,
    ],
  );

  const handleClick = useCallback((event) => {
    if (onClick) {
      onClick(event);
      return;
    }

    if (isActive) {
      removeFromWishlistClick(event);
      return;
    }

    if (onAdd) {
      onAdd(event, { addToHandpickedWishlist: callHandpickedAPI });
      return;
    }

    if (!userLogin) {
      handleGuestWishlistClick(event);
      return;
    }

    addToWishlistClick(event);
  }, [
    addToWishlistClick,
    callHandpickedAPI,
    handleGuestWishlistClick,
    isActive,
    onAdd,
    onClick,
    removeFromWishlistClick,
    userLogin,
  ]);

  const button = (
    <button
      aria-label={title}
      className={buttonClassName}
      onClick={handleClick}
      title={title}
      type="button"
    >
      {isActive ? (
        <FaHeart className={activeIconClassName} />
      ) : (
        <FaRegHeart className={inactiveIconClassName} />
      )}
    </button>
  );

  if (!containerClassName) return button;

  return <div className={containerClassName}>{button}</div>;
};

export default React.memo(WishlistHeartButton);
