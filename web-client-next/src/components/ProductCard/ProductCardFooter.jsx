import React, { useEffect, useMemo, useRef, useState } from "react";
import { Typography } from "antd";
import { Swiper, SwiperSlide } from "swiper/react";
import AddToCartButton from "../common/AddToCartButton";
import BuyNowButton from "../common/BuyNowButton";
import {
  getProductCardAttributes,
} from "../../helper/product/productCardHelpers";
import {
  getProductCurrencySymbol,
  getProductDiscountPercentage,
  isProductOutOfStock,
} from "../../helper/product/productDisplayHelpers";

const { Text } = Typography;

const ProductCardFooter = ({
  productCard = {},
  user = {},
  kiosk = {},
  wishlist = {},
  cart = {},
}) => {
  const { product, size, storeData, isCustomProductsPage } = productCard;
  const { authUserId, authUser, storeId, source } = user;
  const {
    hasAccess: hasKioskAccess,
    getLogin: getKioskLogin,
    enableGuestPopup: enableKioskGuestPopup,
  } = kiosk;
  const { showModal: showWishlistModal } = wishlist;
  const {
    onGuestPopupOpen,
    sourceCollection: cartSourceCollection,
  } = cart;

  const containerRef = useRef(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  const productCardAttributes = useMemo(() => {
    const attributes = storeData?.pdp_settings?.product_card_attributes || [];
    return getProductCardAttributes(product, attributes);
  }, [product, storeData?.pdp_settings?.product_card_attributes]);

  const currencySymbol = useMemo(
    () => getProductCurrencySymbol(product),
    [product],
  );
  const discountPer = getProductDiscountPercentage(product);
  const isOutOfStock = isProductOutOfStock(product);
  const hasProductPrice = (product?.price ?? product?.listprice) != null;
  const productActionBaseClass =
    size === "small"
      ? ""
      : " md:px-1.5 md:py-3 md:text-base";

  const addToCartClassName = `box-border flex items-center justify-center gap-2 rounded-xl px-px py-1.5 text-sm font-semibold text-white transition-all duration-300 ease-in-out ${productActionBaseClass} ${
    isOutOfStock
      ? "bg-secondary product-out-of-stock-button"
      : "cursor-pointer gradient hover:bg-none hover:bg-brand"
  } ${!hasProductPrice ? "hidden" : ""}`;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const checkOverflow = () => {
      setIsOverflowing(el.scrollWidth > el.clientWidth);
    };

    checkOverflow();
    window.addEventListener("resize", checkOverflow);

    return () => window.removeEventListener("resize", checkOverflow);
  }, []);

  return (
    <div
      className={`box-border flex h-full w-full flex-col px-2 pb-2 pt-0 lg:p-3 ${size === "small" ? "gap-0.5" : ""}`}
    >
      <div className="flex flex-col gap-0 md:gap-1">
        <p className="m-0 text-xs uppercase text-neutral-600 md:text-xs">
          {" "}
          <span className="font-medium">{product?.brand || "\u00A0"}</span>
        </p>

        <Text
          ellipsis={{ tooltip: product.name }}
          className="m-0 mb-1 overflow-hidden text-ellipsis whitespace-nowrap text-sm font-bold text-gray-900 md:text-base"
        >
          {product.name || "\u00A0"}
        </Text>
      </div>

      {productCardAttributes.length > 0 ? (
        <div
          className={`product-card-tags-wrapper relative overflow-hidden ${
            isOverflowing ? "is-overflowing" : ""
          }`}
        >
          <Swiper
            ref={containerRef}
            spaceBetween={8}
            slidesPerView={"auto"}
            freeMode={true}
            className="flex items-center gap-1 overflow-x-scroll [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {productCardAttributes.map((attribute) => (
              <SwiperSlide key={attribute.key} style={{ width: "auto" }}>
                <span className="mb-1 text-gray-dark mr-1 block whitespace-nowrap rounded-lg bg-gray-100 p-1 text-xs font-medium md:px-2 md:py-1  ">
                  {attribute.label}: {attribute.value}
                </span>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      ) : (
        <div className="flex items-center gap-1 overflow-x-scroll p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          &nbsp;
        </div>
      )}

      <div className="mt-0 flex min-h-7 items-center justify-between gap-2 md:mt-2 md:min-h-8">
        <div className={isOutOfStock || product?.custom_product === false ? "hidden" : ""}>
          <span
            className={`text-danger ${
              size === "small"
                ? "text-sm font-bold"
                : "pr-1 text-sm font-extrabold lg:text-xl"
            }`}
          >
            {hasProductPrice ? (
              <span>
                {currencySymbol}
                {(product.price ?? product.listprice)?.toLocaleString()}
              </span>
            ) : null}
          </span>

          {product?.price > 0 &&
            product?.listprice > product?.price &&
            discountPer > 0 && (
              <>
                <span className="mt-px text-xs text-slate-400 line-through md:text-sm">
                  <span className="text-[#90a1b9]">
                    {currencySymbol}
                    {product?.listprice}
                  </span>
                </span>
                <span className="absolute left-4 top-5 rounded-3xl bg-danger px-2 py-1 text-xs font-bold text-white">
                  {(discountPer && `${discountPer}% OFF`) || null}
                </span>
              </>
            )}
        </div>
      </div>

      {(storeData?.pdp_settings?.is_buy_button ||
        storeData?.pdp_settings?.is_add_to_cart_button) &&
        !isCustomProductsPage && (
          <>
            {storeData?.pdp_settings?.is_buy_button && product?.custom_product !== false  ? (
              <BuyNowButton
                product={product}
                authUserId={authUserId}
                authUser={authUser}
                storeId={storeId}
                className={`${
                  size === "small"
                    ? "box-border flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand px-1.5 py-2 text-xs font-semibold text-white transition-all duration-300 ease-in-out hover:bg-secondary"
                    : "box-border flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand px-px py-1.5 text-sm font-semibold text-white transition-all duration-300 ease-in-out hover:!bg-secondary md:px-1.5 md:py-3 md:text-base"
                } ${
                  !hasProductPrice
                    ? "!cursor-not-allowed !bg-tertiary !text-neutral-600"
                    : ""
                }`}
                disabled={!hasProductPrice}
                hasKioskAccess={hasKioskAccess}
                showStartIcon
                showWishlistModal={showWishlistModal}
                size={size}
              >
                Buy Now
              </BuyNowButton>
            ) : product?.custom_product !== false &&  (
              <AddToCartButton
                product={product}
                authUserId={authUserId}
                kiosk={kiosk}
                onGuestPopupOpen={onGuestPopupOpen}
                source={source}
                collection={cartSourceCollection}
                eventId={storeData?.event_id}
                isOutOfStock={isOutOfStock}
                className={addToCartClassName}
                disabled={isOutOfStock || !hasProductPrice}
                iconClassName={
                  showWishlistModal || size === "small"
                    ? "h-6 w-6"
                    : "h-4 w-4 md:h-5 md:w-5"
                }
                showIcon
              />
            )}
          </>
        )}
    </div>
  );
};

export default React.memo(ProductCardFooter);
