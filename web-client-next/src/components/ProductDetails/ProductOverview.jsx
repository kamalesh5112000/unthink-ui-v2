import React, { useMemo } from "react";
import { EditOutlined } from "@ant-design/icons";
import ShareOptions from "../../pageComponents/shared/shareOptions";
import WishlistHeartButton from "../../pageComponents/storePage/CardComponents/WishlistHeartButton";
import { getTTid } from "../../helper/getTrackerInfo";
import { normalizeCurrencySymbol } from "../../helper/product/productDisplayHelpers";
import {
  CURRENCY_SYMBOLS,
  CURRENCY_USD,
} from "../../constants/codes";

import share_icon from "../../images/profilePage/share_icon.svg";

const ProductOverview = ({
  productDetails,
  authUser,
  isUserLogin,
  onEditProduct,
  heartRedProduct,
  showHeartWishlist,
  onAddToWishlist,
  kioskLogin,
  authUserId,
  showShareProductDetails,
  shareContext,
  sharePageUrl,
  setShowShareProductDetails,
  shareQrCodeImage,
  onShareClick,
  brandsDetails,
}) => {
  const currency = useMemo(
    () =>
      productDetails?.currency
        ? productDetails.currency
        : brandsDetails?.currency || CURRENCY_USD,
    [productDetails?.currency, brandsDetails?.currency],
  );

  const currencySymbol = useMemo(
    () =>
      normalizeCurrencySymbol(
        productDetails?.currency_symbol || CURRENCY_SYMBOLS[currency],
      ),
    [productDetails?.currency_symbol, currency],
  );

  return (
    <>
      <div>
        <div className="flex justify-between items-start gap-4">
          <h1 className="text-xl sm:text-2xl lg:text-[34px] leading-tight font-semibold  text-[#1f2c3b]">
            {productDetails?.name}
          </h1>
          <div className="flex justify-between items-center gap-3 shrink-0">
            <div className="flex gap-3 justify-end items-start">
              {(productDetails?.user_id === authUser?.user_id ||
                productDetails?.brand === authUser?.user_name) &&
              isUserLogin ? (
                <button
                  className="h-8 lg:h-10 w-8 lg:w-10 rounded-full border border-[#e0d9ff] text-[#1f2c3b] bg-white hover:bg-[#f2eeff]"
                  title="Edit product details"
                  onClick={onEditProduct}
                >
                  <EditOutlined className="text-xl lg:h-6 lg:w-6 h-5 w-5" />
                </button>
              ) : null}
            </div>
            <WishlistHeartButton
              isActive={!!(heartRedProduct && showHeartWishlist)}
              buttonClassName="h-8 lg:h-10 w-8 lg:w-10 flex justify-center items-center rounded-full border border-common text-[#1f2c3b] bg-white hover:bg-common"
              onAdd={onAddToWishlist}
              productMfrCode={productDetails?.mfr_code}
              userId={kioskLogin?.user_id || authUserId || getTTid()}
              title="Add to wishlist"
              activeIconClassName="h-6 w-6 text-red-500"
              inactiveIconClassName="h-6 w-6 text-black"
            />

            <div className="relative flex justify-between  h-8 lg:h-10 w-8 lg:w-10 ">
              {showShareProductDetails && (
                <ShareOptions
                  headerText={
                    shareContext === "product" ? "Share" : "Virtual Try-On"
                  }
                  url={sharePageUrl}
                  setShow={setShowShareProductDetails}
                  onClose={() => setShowShareProductDetails(false)}
                  isOpen={showShareProductDetails}
                  qrCodeGeneratorURL={shareQrCodeImage}
                  true
                  fromCollection={shareContext === "vto" || !!kioskLogin}
                  kioskHeader={
                    shareContext === "vto"
                      ? "Scan to Try On (Then tap the camera icon on your phone)"
                      : ""
                  }
                  subHeaderText={productDetails?.name}
                />
              )}
              <button
                className="flex h-8 lg:h-10 w-8 lg:w-10  items-center justify-center rounded-full border border-common bg-white hover:bg-common"
                onClick={onShareClick}
              >
                <img
                  className="cursor-pointer lg:h-6 lg:w-6 h-5 w-5"
                  src={share_icon}
                  alt="Share"
                  preview={false}
                />
              </button>
            </div>
          </div>
        </div>

        <div className="mt-4 lg:mt-6">
          <div className="flex flex-wrap gap-x-3 gap-y-1 items-center">
            {(productDetails?.price ?? productDetails?.listprice) != null ? (
              <span className="text-xl sm:text-2xl lg:text-3xl font-semibold text-[#101828]">
                {currencySymbol}
                {productDetails.price ?? productDetails.listprice}
              </span>
            ) : null}
            {productDetails?.price &&
            +productDetails.listprice > +productDetails?.price ? (
              <span className="text-sm sm:text-base text-[#6b7280]">
                <span className="line-through">
                  {currencySymbol}
                  {productDetails.listprice}
                </span>
              </span>
            ) : null}
          </div>

          {productDetails?.avlbl > 0 ? (
            <span
              className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs sm:text-sm font-semibold uppercase tracking-wide ${
                productDetails.avlbl === 0
                  ? "bg-danger text-white"
                  : "bg-green-100 text-green-700"
              }`}
            >
              {productDetails.avlbl === 0 
                ? "SOLD"
                : 'IN STOCK'}
            </span>
          ) : null}
        </div>
      </div>

      {!brandsDetails && productDetails?.brand ? (
        <div className=" mt-5">
          <span className="text-base sm:text-lg font-semibold leading-loose text-[#182438]">
            Brand :
          </span>
          <span className="ml-1 text-slat-103 text-sm sm:text-[15px] lg:text-base">
            {productDetails?.brand}
          </span>
        </div>
      ) : null}
    </>
  );
};

export default React.memo(ProductOverview);
