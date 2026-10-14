import React, { useCallback } from "react";
import { StarFilled, StarOutlined } from "@ant-design/icons";
import openInNewTabIcon from "../../images/open_in_new_tab.svg";
import useTheme from "../../hooks/chat/useTheme";
import { isProductUrlAvailable } from "../../helper/product/productDisplayHelpers";
import  VirtualTryOnModal  from "../common/VirtualTryOnModal";

const ProductCardHeaderBottom = ({
  productCard = {},
  isActionCoverWidget,
  kiosk = {},
  wishlist = {},
  callbacks = {},
  isMyTryonsCollection,
  buyNowTitle,
  showProductStarAction,
}) => {
  const {
    product,
    size,
    isCustomProductsPage,
    storeData,
    enableSelect,
    tryonConfig,
    saveUserId,
  } = productCard;
  const {
    hasAccess: hasKioskAccess,
    loginAuth: kioskLoginAuth,
    enableGuestPopup: enableKioskGuestPopup,
    onGuestPopupOpen,
    onTryonClick: onKioskTryonClick,
  } = kiosk;
  const { showModal: showWishlistModal } = wishlist;
  const { onSetMfrCode: setOnMfrCode, onVtoClick, onStarClick } = callbacks;
  const { themeCodes } = useTheme();
  const productHasUrl = isProductUrlAvailable(product);
  const handleStarClick = useCallback(
    (e) => {
      e.stopPropagation();
      onStarClick && onStarClick();
    },
    [onStarClick],
  );

  return (
    <>
      {product?.avlble === 0 && (
        <div className="absolute bottom-4 left-3.5 rounded-3xl bg-danger px-2 py-1 text-[10px] font-medium text-white">
          SOLD
        </div>
      )}

      {!isCustomProductsPage &&
        storeData.is_tryon_enabled &&
        !enableSelect &&
        !isActionCoverWidget &&
        !showWishlistModal &&
        product?.custom_product !== false &&
        !isMyTryonsCollection && (
          <VirtualTryOnModal
            isFloating
            size={size}
            product={product}
            login={kioskLoginAuth}
            hasKioskAccess={hasKioskAccess}
            enableKioskGuestPopup={enableKioskGuestPopup}
            onGuestPopupOpen={onGuestPopupOpen}
            onKioskTryonClick={onKioskTryonClick}
            setOnMfrCode={setOnMfrCode}
            onVtoClick={onVtoClick}
            storeData={storeData}
            tryonConfig={tryonConfig}
            saveUserId={saveUserId}
          />
        )}

        {/* now now this funciton future we need  */}

      {/* <div
        className="absolute top-0 z-10 hidden h-full w-full flex-col items-center justify-center rounded-lg"
        style={{ background: themeCodes.productCard.hover_bg }}
      >
        {!enableSelect ? (
          <h1
            className={`product_buy_now m-0 flex items-center justify-between gap-1 text-center font-semibold text-white lg:gap-2 ${
              size === "small" ? "text-base" : "text-2xl"
            }`}
          >
            {productHasUrl ? buyNowTitle : null}
            {productHasUrl ? (
              <img
                src={openInNewTabIcon}
                alt="open"
                width={20}
                height={20}
                className="ml-2.5 h-5 w-5 text-white"
              />
            ) : null}
          </h1>
        ) : null}
      </div> */}

      {!enableSelect && (
        <div className="flex items-center justify-between gap-1 lg:gap-2">
          <div>
            {showProductStarAction ? (
              <button
                className="absolute bottom-2.5 right-2.5 z-20 flex cursor-pointer items-center justify-center rounded-full bg-white p-1.5 shadow-sm transition-all duration-300 ease-in-out hover:bg-gray-50"
                tabIndex="-1"
                role={onStarClick ? "button" : "img"}
                onClick={handleStarClick}
              >
                {product.starred ? (
                  <StarFilled className="flex text-amber-300" />
                ) : (
                  <StarOutlined className="flex text-black" />
                )}
              </button>
            ) : null}
          </div>
        </div>
      )}
    </>
  );
};

export default React.memo(ProductCardHeaderBottom);
