import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import sharedPageTracker from "../../helper/webTracker/sharedPageTracker";
import { closeWishlistModal } from "../../pageComponents/wishlist/redux/actions";
import { GuestPopUpShow } from "../../pageComponents/Auth/redux/actions";
import {
  addSidInProductUrl,
  cleanImage,
  getCurrentTheme,
} from "../../helper/utils";

import { setShowChatModal } from "../../hooks/chat/redux/actions";
import {
  gTagAuraProductClick,
  gTagCollectionProductClick,
} from "../../helper/webTracker/gtag";
import { getTTid } from "../../helper/getTrackerInfo";
import { vtoIconState } from "../singleCollection/redux/actions";
import { useRouter } from "next/router";
import {
  getCollectionFlags,
  getCurrentCollectionForCard,
} from "../../helper/product/productCardHelpers";
import ProductCardFooter from "./ProductCardFooter";
import  ProductCardHeaderTop  from "./ProductCardHeaderTop";
import ProductCardHeaderBottom from "./ProductCardHeaderBottom";

export const PRODUCT_CARD_WIDGET_TYPES = {
  DEFAULT: "default",
  ACTION_COVER: "actionCover",
};

const ProductCard = ({
  product,
  isCustomProductsPage,
  enableClickTracking = false,
  selectedSearchOption,
  collection_id,
  onProductClick,
  productClickParam = {},
  hideAddToWishlist = false,
  showRemoveIcon = false,
  enableCopyFeature = true,
  size = "medium", // small, medium
  onRemoveIconClick,
  buyNowTitle = "Buy Now",
  enableSelect,
  isSelected,
  setSelectValue,
  showStar = false,
  widgetType = PRODUCT_CARD_WIDGET_TYPES.DEFAULT, // default | actionCover
  onEditClick,
  onStarClick,
  allowEdit = false,
  collection_name,
  collection_path,
  localChatMessage,
  blogCollectionPage,
  collectionCards,
  onAddSelectedProductsToCollection,
  enableKioskGuestPopup = false,
  setOnMfrCode,
  onGuestPopupOpen ,
  onKioskTryonClick,
  source,
  isPriority,
}) => {
  const dispatch = useDispatch();
  const router = useRouter();

  const [
    authUserId,
    authUserName,
    showChatModal,
    showWishlistModal,
    store_id,
    authUser,
    isUserLogin,
    collections,
    singleCollections,
    wishlistCollections,
    storeData,
    hasKioskAccess,
    kioskLogin,
  ] = useSelector((state) => [
    state.auth.user.data.user_id,
    state.auth.user.data.user_name,
    state.chatV2.showChatModal,
    state.appState.wishlist.showWishlistModal,
    state.store.data.store_id,
    state.auth.user.data,
    state?.auth?.user?.isUserLogin,
    state.auth.user.collections.data,
    state.auth.user.singleCollections.data,
    state.auth.user.wishlistCollections,
    state.store.data,
    state.kiosk.hasAccess,
    state.kiosk.login,
  ]);

  const [Collection_tryonStatement, setCollectionTryonStatement] =
    useState(null);
  const KioskLoginAuth = kioskLogin;
  const currentCollectionForCard = useMemo(
    () =>
      getCurrentCollectionForCard({
        blogCollectionPage,
        collectionId: collection_id,
        collectionName: collection_name,
        collections,
        singleCollections,
      }),
    [
      blogCollectionPage,
      collection_id,
      collection_name,
      collections,
      singleCollections,
    ],
  );
  const { isMyWishlistCollection, isMyTryonsCollection } = getCollectionFlags(
    currentCollectionForCard,
  );
  const getKioskLogin = useCallback(() => kioskLogin, [kioskLogin]);

  const handleProductClick = async ({ open }) => {
    // tracking event happens from here by prop enableClickTracking
    if (enableClickTracking) {
      await sharedPageTracker.onCollectionProductClick({
        mfrCode: product.mfr_code,
        redirectionUrl: product.url,
        product_brand: product.product_brand,
        brand: product.brand,
        sponsored: product.sponsored,
        collectionId: collection_id,
        ...productClickParam,
      });
    }
    // prop function to fetch recommendation on shared page
    if (onProductClick) onProductClick();

    if (selectedSearchOption?.title) {
      // GTAG CONFIGURATION AURA
      // START

      gTagAuraProductClick({
        mft_code: product?.mfr_code,
        aura_widget: selectedSearchOption?.id,
        user_id: getTTid(),
        user_name: authUserName,
        term: localChatMessage || "",
      });
      // END
    } else {
      // GTAG CONFIGURATION
      // START
      // I commented this code for causing some trubles in the navigation
      gTagCollectionProductClick({
        mft_code: product?.mfr_code,
        collection_path: authUserId
          ? addSidInProductUrl(
              product.url,
              authUserId,
              blogCollectionPage?.collection_id,
            )
          : product.url,
        user_id: getTTid(),
        user_name: authUserName,
        collection_id: blogCollectionPage?.collection_id || "",
        collection_name: blogCollectionPage?.collection_name,
      });
    }

    const cleaned = cleanImage(product?.image);
    if (cleaned) {
      localStorage.setItem(`pdp_image`, cleaned);
    }
    if (open && !hasKioskAccess) {
      window.open(`/product/${product.mfr_code}`, "_blank");
    } else {
      router.push(hasKioskAccess ? `/kiosk/product/${product.mfr_code}` : `/product/${product.mfr_code}`);
    }
    if (showChatModal) {
      dispatch(setShowChatModal(false));
    }
    if (showWishlistModal) {
      dispatch(closeWishlistModal());
    }
  };

  useEffect(() => {
    setCollectionTryonStatement(
      currentCollectionForCard?.tryon_statement
        ? currentCollectionForCard
        : null,
    );
  }, [currentCollectionForCard]);

  const Collection_vto = currentCollectionForCard?.tryon_type
    ? currentCollectionForCard
    : null;

  const productWrapperBaseClass =
    "box-content h-full overflow-y-hidden rounded-[20px] shadow-product-card transition-all duration-300 ease-in-out will-change-[box-shadow,transform] hover:shadow-product-card-hover min-[1440px]:rounded-3xl";
  const productWrapperActionCoverClass =
    widgetType === PRODUCT_CARD_WIDGET_TYPES.ACTION_COVER
      ? "flex flex-col rounded-xl"
      : "";
  const showCustomProductsMenu =
    isCustomProductsPage &&
    widgetType !== PRODUCT_CARD_WIDGET_TYPES.ACTION_COVER &&
    !showWishlistModal &&
    !enableSelect;
  const showProductStarAction =
    showStar &&
    (widgetType === PRODUCT_CARD_WIDGET_TYPES.DEFAULT ||
      widgetType === PRODUCT_CARD_WIDGET_TYPES.ACTION_COVER);
  const cartSourceCollection =useMemo(()=>
    source === "COLLECTION"
      ? {
          id: collection_id,
          name: collection_name,
          path: collection_path,
        }
      : undefined,
      [source, collection_id, collection_name, collection_path]
  )
    

  const handleVtoClick = useCallback((mfrCode) => {
    if (mfrCode) {
      dispatch(vtoIconState(mfrCode));
      return;
    }
    dispatch(GuestPopUpShow(true));
  },[]) 

  const kioskConfig = useMemo(()=>(
   {
    hasAccess: hasKioskAccess,
    login: kioskLogin,
    loginAuth: KioskLoginAuth,
    enableGuestPopup: enableKioskGuestPopup,
    getLogin: getKioskLogin,
    onGuestPopupOpen,
    onTryonClick: onKioskTryonClick,
  }),[hasKioskAccess,
  kioskLogin,
     KioskLoginAuth,
     enableKioskGuestPopup,
     getKioskLogin,
    onGuestPopupOpen,
     onKioskTryonClick,

  ])
  const wishlistConfig =useMemo(()=>(
   {
    showModal: showWishlistModal,
    hideAddButton: hideAddToWishlist,
    collections: wishlistCollections,
  }),[showWishlistModal,hideAddToWishlist,wishlistCollections])

  const productCardConfig =useMemo(()=>( {
    product,
    size,
    isCustomProductsPage,
    storeData,
    enableSelect,
    tryonConfig: Collection_vto || Collection_tryonStatement,
    saveUserId: KioskLoginAuth?.user_id || authUser?.user_id || null,
  }),[
     product,
    size,
    isCustomProductsPage,
    storeData,
    enableSelect,
     Collection_vto,
  Collection_tryonStatement,
  KioskLoginAuth?.user_id,
  authUser?.user_id
  ])
  const userConfig = useMemo(()=>(
  {
    authUserId,
    authUser,
    storeId: store_id,
    source,
    isLoggedIn: isUserLogin,
  }),[
    authUserId,
    authUser,
    store_id,
    source,
    isUserLogin
  ])
  const cartConfig = useMemo(()=>( {
    onGuestPopupOpen,
    sourceCollection: cartSourceCollection,
  }),[onGuestPopupOpen,cartSourceCollection])

 const headerTopCallbacks = useMemo(
  () => ({
    onSetSelectValue: setSelectValue,
    onEditClick,
    onRemoveIconClick,
    onAddSelectedProductsToCollection,
  }),
  [
    setSelectValue,
    onEditClick,
    onRemoveIconClick,
    onAddSelectedProductsToCollection,
  ]
);
  const headerBottomCallbacks = useMemo(()=>({
    onSetMfrCode: setOnMfrCode,
    onVtoClick: handleVtoClick,
    onStarClick
  }),[handleVtoClick,onStarClick])

  const handleCardClick = (event) => {
    if (enableSelect) return;

    const interactiveElement = event.target?.closest?.(
      "a, button, input, select, textarea, [role='button']",
    );
    if (interactiveElement) return;
    if (hasKioskAccess) {
      sessionStorage.setItem("plp-scroll", String(window.scrollY));
      sessionStorage.setItem("plp-collection", singleCollections?.path);
      handleProductClick({ open: false });
    }

    const openInNewTab =
      !hasKioskAccess && window.matchMedia("(min-width: 1024px)").matches;
    handleProductClick({ open: openInNewTab });
  };

  return (
    <div
      className={`${productWrapperBaseClass} ${getCurrentTheme()} ${productWrapperActionCoverClass} ${
        size === "small"
          ? "product-wrapper-small my-[7px] w-40 lg:w-[190px]"
          : collectionCards
            ? "product-wrapper-medium2 max-[499px]:w-[170px] transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] will-change-[box-shadow,transform] min-[500px]:max-[639px]:w-[230px] min-[640px]:max-[699px]:w-[210px] min-[700px]:max-[823px]:w-[300px] min-[1000px]:hover:shadow-product-card-hover"
            : "product-wrapper-medium-single mx-auto w-full max-w-[330px] max-[768px]:max-w-full min-[835px]:max-w-[325px] min-[1271px]:max-[1439px]:max-w-[278px] min-[1440px]:max-w-80"
      }`}
    >
      <div
        className="relative flex h-full shrink-0 cursor-pointer flex-col overflow-hidden rounded-xl bg-white"
        style={{ cursor: "pointer" }}
        onClick={handleCardClick}
      >
        <div
          className={
            size === "small"
              ? "relative flex shrink-0 overflow-hidden rounded-lg bg-white p-2"
              : "relative flex shrink-0 overflow-hidden rounded-lg bg-white p-3 max-[1024px]:p-2"
          }
          onClick={(e) => {
            if (isSelected) {
              e.stopPropagation();
              setSelectValue(!isSelected);
            }
          }}
        >
          <ProductCardHeaderTop
            productCard={productCardConfig}
            collectionId={collection_id}
            isSelected={isSelected}
            isActionCoverWidget={
              widgetType === PRODUCT_CARD_WIDGET_TYPES.ACTION_COVER
            }
            isDefaultWidget={widgetType === PRODUCT_CARD_WIDGET_TYPES.DEFAULT}
            kiosk={kioskConfig}
            wishlist={wishlistConfig}
            callbacks={headerTopCallbacks}
            enableCopyFeature={enableCopyFeature}
            user={userConfig}
            source={source}
            showRemoveIcon={showRemoveIcon}
            showCustomProductsMenu={showCustomProductsMenu}
            allowEdit={allowEdit}
            isMyWishlistCollection={isMyWishlistCollection}
            showStar={showStar}
            isPriority={isPriority}
          />
          <ProductCardHeaderBottom
            productCard={productCardConfig}
            isActionCoverWidget={
              widgetType === PRODUCT_CARD_WIDGET_TYPES.ACTION_COVER
            }
            kiosk={kioskConfig}
            wishlist={wishlistConfig}
            isMyTryonsCollection={isMyTryonsCollection}
            callbacks={headerBottomCallbacks}
            buyNowTitle={buyNowTitle}
            showProductStarAction={showProductStarAction}
          />
        </div>
        <ProductCardFooter
          productCard={productCardConfig}
          user={userConfig}
          kiosk={kioskConfig}
          wishlist={wishlistConfig}
          cart={cartConfig}
        />
      </div>
    </div>
  );
};

export default React.memo(ProductCard);
