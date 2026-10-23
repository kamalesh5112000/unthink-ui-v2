import React, { useCallback } from "react";
import WishlistHeartButton from "../../pageComponents/storePage/CardComponents/WishlistHeartButton";
import { getTTid } from "../../helper/getTrackerInfo";
import ProductMenuButton from "./ProductMenuButton";
import ProductRemoveAction from "./ProductRemoveAction";

const ProductCardHeaderTop = ({
  productCard = {},
  collectionId,
  isSelected,
  isActionCoverWidget,
  isDefaultWidget,
  kiosk = {},
  wishlist = {},
  callbacks = {},
  enableCopyFeature,
  user = {},
  source,
  showRemoveIcon,
  showCustomProductsMenu,
  allowEdit,
  isMyWishlistCollection,
  isPriority,
}) => {
  const { authUserId, isLoggedIn: isUserLogin } = user;
  const { product, size, isCustomProductsPage, storeData, enableSelect } =
    productCard;
  const {
    hasAccess: hasKioskAccess,
    login: kioskLogin,
    enableGuestPopup: enableKioskGuestPopup,
    getLogin: getKioskLogin,
    onGuestPopupOpen,
  } = kiosk;
  const {
    showModal: showWishlistModal,
    hideAddButton: hideAddToWishlist,
    collections: wishlistCollections,
  } = wishlist;
  const heartRedProduct = wishlistCollections?.product_lists?.find(
    (x) => x.mfr_code === product.mfr_code,
  );
  const {
    onSetSelectValue: setSelectValue,
    onEditClick,
    onRemoveIconClick,
    onAddSelectedProductsToCollection,
  } = callbacks;

  const removeFromWishlistClick = useCallback(
    (event) => {
      event.stopPropagation();
      event.preventDefault();

      if (onRemoveIconClick) {
        onRemoveIconClick(product.mfr_code);
      }
    },
    [onRemoveIconClick, product?.mfr_code],
  );

  const handleSelectProduct = useCallback(
    (e) => {
      e.stopPropagation();
      setSelectValue && setSelectValue(!isSelected);
    },
    [isSelected, setSelectValue],
  );

  return (
    <>
    <div className="w-full">
      <img
        src={product.image}
        alt={product.name || "Product image"}
        width="100%"
        className={`h-44 w-full object-contain ${
          size === "small"
            ? "rounded-2xl bg-gray-200 backdrop-blur-md lg:h-44"
            : "rounded-xl shadow-md lg:h-60"
        }`}
      loading={isPriority ? "eager" : "lazy"}
      fetchPriority={isPriority ? "high" : "auto"}
      />
    </div>

    
      {enableSelect && product?.custom_product !== false && (
        <div
          className={`m-1 flex h-6 w-6 items-center self-baseline box-border lg:pl-0 lg:pt-0 ${size === "small" ? "pl-1 pt-1" : ""}`}
        >
          <input
            type="checkbox"
            checked={isSelected}
            onClick={handleSelectProduct}
            onChange={() => {}}
            className={`cursor-pointer accent-secondary ${
              size === "small" ? "lg:h-4 lg:w-4" : "h-6 w-6"
            }`}
          />
        </div>
      ) }
      <>
          <ProductRemoveAction
            isVisible={showWishlistModal && isDefaultWidget || isActionCoverWidget}
            size={size}
            onRemove={removeFromWishlistClick}
            hideOnMedium
          />
          <ProductMenuButton
            product={product}
            collectionId={collectionId}
            showCustomProductsMenu={showCustomProductsMenu}
            size={size}
            isDefaultWidget={isDefaultWidget}
            showRemoveIcon={showRemoveIcon}
            removeFromWishlistClick={removeFromWishlistClick}
            enableCopyFeature={enableCopyFeature}
            isCustomProductsPage={isCustomProductsPage}
            allowEdit={allowEdit}
            onEditClick={onEditClick}
          />
        </>
   
    {(!hideAddToWishlist || !isUserLogin )&&
      !showWishlistModal &&
      !enableSelect &&
      product?.custom_product !== false &&
      !isMyWishlistCollection && (
        <>          
            <WishlistHeartButton
              isActive={!!heartRedProduct}
              containerClassName={`absolute ${
                hasKioskAccess
                  ? "right-3 top-3.5"
                  : "right-4 top-4 max-lg:top-2.5"
              } z-40 transition-all duration-300 ease-out max-lg:right-2.5 max-lg:z-30`}
              product={product}
              productMfrCode={product?.mfr_code}
              storeData={storeData}
              authUserId={authUserId}
              hasKioskAccess={hasKioskAccess}
              enableKioskGuestPopup={enableKioskGuestPopup}
              getKioskLogin={getKioskLogin}
              onGuestPopupOpen={onGuestPopupOpen}
              onRemoveIconClick={onRemoveIconClick}
              userId={kioskLogin?.user_id || authUserId || getTTid()}
              userLogin={isUserLogin}
              onAddSelectedProductsToCollection={onAddSelectedProductsToCollection}
              source={source}
            /> 
          </> )}
    </>
  );
};

export default React.memo(ProductCardHeaderTop);
