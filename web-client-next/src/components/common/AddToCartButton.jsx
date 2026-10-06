import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FiShoppingCart } from "react-icons/fi";
import { FaCartArrowDown } from "react-icons/fa";
import { addToCart } from "../../pageComponents/DeliveryDetails/redux/action";
import { GuestPopUpShow } from "../../pageComponents/Auth/redux/actions";
import { getTTid } from "../../helper/getTrackerInfo";
import { getNormalizedCartQty } from "../../helper/product/productCardHelpers";
import { useRouter } from "next/router";
import GuestUserPopUp from "../../pageComponents/Auth/GuestUserPopUp";

export const addProductToCart = ({
  dispatch,
  product,
  qty = 1,
  userId,
  source,
  collection,
  eventId,
}) => {
  if (!product?.mfr_code || !dispatch) return;

  const cartUserId = userId || getTTid();
  const cartProduct = {
    mfr_code: product.mfr_code,
    tagged_by: product?.tagged_by || [],
    qty: getNormalizedCartQty(qty),
  };

  if (source) cartProduct.source = source;
  if (collection) cartProduct.collection = collection;
  if (eventId) cartProduct.event_id = eventId;

  dispatch(
    addToCart({
      is_display_amount: true,
      products: [cartProduct],
      product_lists: [],
      collection_name: "my cart",
      type: "system",
      user_id: cartUserId,
      path: `my_cart_${cartUserId}`,
    }),
  );
};

const AddToCartButton = ({
  product,
  qty = 1,
  kiosk = {},
  authUserId,
  onGuestPopupOpen,
  source,
  collection,
  eventId,
  isOutOfStock = false,
  disabled,
  className,
  iconClassName,
  showIcon = false,
  style,
  type = "button",
  showQuantityControls = false,
  hasKioskAccess = false,
  storeName,
  isUserLogin,
  wrapperClassName = "flex flex-wrap gap-3 sm:gap-4 items-center w-full",
  quantityControlsClassName = "h-12 items-center flex gap-6 sm:gap-8 px-4 border border-support rounded-xl bg-white",
  quantityButtonClassName = "text-xl font-medium text-[#1f2c3b] cursor-pointer",
  quantityValueClassName = "text-base sm:text-lg font-semibold text-[#1f2c3b] cursor-pointer",
  buttonWrapperClassName = "text-white h-12 sm:h-14 w-full sm:w-auto sm:min-w-[210px]",
}) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const [isCartPopupOpen, setIsCartPopupOpen] = useState(false);
  const [pendingCartQty, setPendingCartQty] = useState(null);
  const isDisabled = disabled ?? (!product?.price && !product?.listprice);
  const normalizedQty = getNormalizedCartQty(qty);
  const { collection: cartData } = useSelector((state) => state.cart);
  const kioskLoginFromStore = useSelector((state) => state.kiosk.login);

  const cartItem = cartData?.product_lists?.find(
    (item) => item?.mfr_code === product?.mfr_code,
  );
  const cartCollection = cartItem?.mfr_code;
  const {
    hasAccess: hasKioskAccessFromConfig,
    getLogin: getKioskLogin,
    enableGuestPopup: enableKioskGuestPopup,
  } = kiosk;
  const shouldUseKioskGuest = hasKioskAccess || hasKioskAccessFromConfig;

  const openCartGuestPopup = (nextQty) => {
    setIsCartPopupOpen(true);
    setPendingCartQty(nextQty);
    onGuestPopupOpen?.({
      type: "cart",
      product: product
        ? {
            mfr_code: product.mfr_code,
            tagged_by: product.tagged_by || [],
          }
        : null,
      qty: nextQty,
    });
    dispatch(GuestPopUpShow(true));
  };

  const handleGoToCart = (event) => {
    event.stopPropagation();
    event.preventDefault();
    router.push(router.pathname.startsWith("/kiosk") ? "/kiosk/cart" : "/cart");
  };

  const handleCartAction = (nextQty = 1, userIdOverride = null) => {
    if (!product?.mfr_code) return;

    const nextNormalizedQty = getNormalizedCartQty(nextQty);
    const kioskLogin = getKioskLogin?.() || kioskLoginFromStore;
    const kioskUserId = userIdOverride || kioskLogin?.user_id;

    if ((shouldUseKioskGuest || enableKioskGuestPopup) && !kioskUserId) {
      openCartGuestPopup(nextNormalizedQty);
      return;
    }

    addProductToCart({
      dispatch,
      product,
      qty: nextNormalizedQty,
      userId: kioskUserId || authUserId || getTTid(),
      source,
      collection,
      eventId,
    });
  };

  const handleAddToCart = (event) => {
    event?.stopPropagation?.();
    event?.preventDefault?.();

    if (isOutOfStock) return;

    if (cartCollection) {
      handleGoToCart(event);
      return;
    }

    if (!product?.mfr_code) return;

    handleCartAction(normalizedQty);
  };

  const icon = cartCollection ? (
    <FaCartArrowDown className={isOutOfStock ? "hidden" : iconClassName} />
  ) : (
    <FiShoppingCart className={isOutOfStock ? "hidden" : iconClassName} />
  );

  const button = (
    <button
      type={type}
      className={className}
      onClick={handleAddToCart}
      disabled={isDisabled}
      style={style}
    >
      {showIcon ? icon : null}
      { isOutOfStock
          ? "Out of Stock"
          : cartCollection
            ? " Go to Cart "
            : " Add to Cart"}
    </button>
  );

  if (showQuantityControls) {
    return (
      <>
        <div className={wrapperClassName}>
          <div className={quantityControlsClassName}>
            <button
              type="button"
              className={quantityButtonClassName}
              onClick={() => handleCartAction((cartItem?.qty || 0) - 1)}
            >
              -
            </button>
            <button type="button" className={quantityValueClassName}>
              {cartItem?.qty || 0}
            </button>
            <button
              type="button"
              className={quantityButtonClassName}
              onClick={() => handleCartAction((cartItem?.qty || 0) + 1)}
            >
              +
            </button>
          </div>
          <div className={buttonWrapperClassName}>{button}</div>
        </div>
        <GuestUserPopUp
          isOpen={isCartPopupOpen}
          setIsOpen={setIsCartPopupOpen}
          storeName={storeName}
          isUserLogin={!isUserLogin ? true : false}
          persistKioskLogin
          onSuccess={({ userId }) => {
            handleCartAction(pendingCartQty ?? 1, userId);
            setPendingCartQty(null);
          }}
          onSkip={() => setPendingCartQty(null)}
        />
      </>
    );
  }

  return button;
};

export default AddToCartButton;
