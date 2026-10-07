import React from "react";
import { useSelector } from "react-redux";
import AddToCartButton from "../common/AddToCartButton";
import BuyNowButton from "../common/BuyNowButton";

const ProductActions = ({
  brandsDetails,
  storeData,
  productDetails,
  authUserId,
  hasKioskAccess,
  isUserLogin,
  authUser,
  storeId,
}) => {
  const kioskLogin = useSelector((state) => state.kiosk.login);

  return (
    <>
      {brandsDetails?.paymentMethod && productDetails?.avlble > 0 ? (
        <div className="lg:mt-8 mt-4">
          <div className="grid gap-2">
            {brandsDetails.paymentMethod.split(",").map((item, idx) => {
              const link = item.trim();
              return (
                <a
                  key={`${link}-${idx}`}
                  style={{ background: "#7c75ec" }}
                  className=" text-white flex justify-center items-center  py-2.5 w-36 font-semibold text-sm sm:text-base rounded-xl shadow-md hover:shadow-lg   "
                  target="_blank"
                  rel="noreferrer"
                  href={link}
                >
                  Buy Now
                </a>
              );
            })}
          </div>
        </div>
      ) : null}

      {(storeData?.pdp_settings?.is_buy_button ||
        storeData?.pdp_settings?.is_add_to_cart_button) && productDetails?.avlble > 0 && (
        <div className="my-8 pb-2">
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            {storeData?.pdp_settings?.is_add_to_cart_button && (
              <AddToCartButton
                product={productDetails}
                authUserId={authUserId}
                kiosk={{
                  hasAccess: hasKioskAccess,
                  getLogin: () => kioskLogin,
                }}
                hasKioskAccess={hasKioskAccess}
                storeName={storeData?.store_name}
                isUserLogin={isUserLogin}
                disabled={false}
                showQuantityControls
                className=" h-full px-6 bg-brand text-white font-semibold w-full rounded-xl  text-sm sm:text-base shadow-md hover:shadow-lg transition"
              />
            )}

            {storeData?.pdp_settings?.is_buy_button &&
              (productDetails?.url && productDetails.url !== "dummy_url" ? (
                <a
                  href={productDetails.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline text-white py-2.5 w-36 font-semibold text-sm sm:text-base rounded-xl shadow-md hover:shadow-lg transition flex justify-center items-center"
                  style={{
                    background: "#7c75ec",
                  }}
                >
                  Buy
                </a>
              ) : (
                <BuyNowButton
                  product={productDetails}
                  authUserId={authUserId}
                  authUser={authUser}
                  storeId={storeId}
                  className="inline text-white disabled:opacity-50 disabled:cursor-not-allowed py-2.5 w-36 font-semibold text-sm sm:text-base rounded-xl shadow-md hover:shadow-lg transition"
                  disabled={!productDetails?.price && !productDetails?.listprice}
                  style={{
                    background: "#7c75ec",
                    cursor:
                      !productDetails?.price && !productDetails?.listprice
                        ? "not-allowed"
                        : "",
                  }}
                >
                  Buy
                </BuyNowButton>
              ))}
          </div>
        </div>
      )}
    </>
  );
};

export default ProductActions;
