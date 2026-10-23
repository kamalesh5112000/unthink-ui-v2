import React, { useEffect, useMemo, useState, useCallback } from "react";
// import icon_all_products from "../../images/Logo.svg";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, removeFromCart } from "./redux/action";
// import inputIcon from "../../images/icons/input-icon.svg";
import Link from "next/link";
import { useNavigate } from "../../helper/useNavigate";
import cart_icon from "../../images/cart.svg";
import { getTTid } from "../../helper/getTrackerInfo";
import Cookies from "js-cookie";
import { SIGN_IN_EXPIRE_DAYS } from "../../constants/codes";
import { collectionAPIs } from "../../helper/serverAPIs";
import { current_store_name, isGivaStore } from "../../constants/config";
import { collectionQRCodeGenerator } from "../../helper/utils";
import Modal from "../../components/modal/Modal";
import { buildKioskAutoLoginUrls } from "../../helper/autoLogin";
import { useGuestPopup } from "../../context/GuestPopupContext";

const DeliveryDetails = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { openGuestPopup } = useGuestPopup();
  const [authUserId, cart_attributes, storeData, hasKioskAccess, kioskUser_id, kioskLogin] = useSelector((state) => [
    state.auth.user.data.user_id,
    state.store.data.cart_attributes,
    state.store.data,
    state.kiosk.hasAccess,
    state.kiosk.userId,
    state.kiosk.login,
  ]);
  const { collection, loading } = useSelector((state) => state.cart);
  // console.log("collection", storeData?.store_name   );
  const [isCheckoutClaimQrModalOpen, setIsCheckoutClaimQrModalOpen] =
    useState(false);
  const [checkoutClaimQr, setCheckoutClaimQr] = useState({
    isLoading: false,
    qrUrl: "",
    shareUrl: "",
  });
  
  const guestTrackerId = getTTid();
  const mycartcollectionpath = `${ kioskUser_id || authUserId || guestTrackerId}`;
 
  const shouldShowCheckoutClaimQr = authUserId && isGivaStore;
  const checkoutClaimMessage =
    storeData?.cart_settings?.checkout_claim_message;

  useEffect(() => {
    if (!(kioskUser_id || authUserId)) return undefined;

    let isActive = true;
    const checkoutClaimRoute ={
      targetPath: `/cart`,
      pageParam: `?page=cart`,
    };
    const buildCheckoutClaimQr = async () => {
      setCheckoutClaimQr((prev) => ({
        ...prev,
        isLoading: true,
      }));

      const autoLoginUrls = await buildKioskAutoLoginUrls({
        ...checkoutClaimRoute,
        kioskLogin,
        userId: kioskUser_id || authUserId,
        requireUserId: true,
        errorLabel: "checkout claim auto-login",
      });

      if (!isActive) return;

      setCheckoutClaimQr({
        isLoading: false,
        qrUrl: autoLoginUrls?.qrUrl || "",
        shareUrl: autoLoginUrls?.shareUrl || "",
      });
    };

    buildCheckoutClaimQr();

    return () => {
      isActive = false;
    };
  }, [
    authUserId,
    kioskLogin,
    kioskUser_id,
  ]);


  const handleRemove = (products) => {
    const payload = {
      products: [products],
      collection_id: collection?.collection_id || collection?._id,
    };
    dispatch(removeFromCart(payload));
  };

  // ✅ Update Quantity
  const updateCartQuantity = (product, newQty) => {
    const payload = {
      is_display_amount: true,
      products: [
        {
          mfr_code: product.mfr_code,
          tagged_by: product?.tagged_by || [],
          qty: newQty,
        },
      ],
      product_lists: [],
      collection_name: "my cart",
      type: "system",
      user_id: mycartcollectionpath,
      path:`my_cart_${ mycartcollectionpath}`,
    };
    dispatch(addToCart(payload));
  };

  // Memoized function to get cart attribute values for a product
  const getCartAttributeValues = useMemo(() => {
    return (product) => {
      const attrs = cart_attributes || [];
      return attrs
        .map((attr) => {
          const value = product[attr];

          if (value && Array.isArray(value) && value.length > 0) {
            return { name: attr, value: value.join(", ") };
          } else if (
            value &&
            !Array.isArray(value) &&
            value.toString().trim() !== ""
          ) {
            return { name: attr, value: value.toString() };
          }

          return null;
        })
        .filter(Boolean);
    };
  }, [cart_attributes]);

  const products = (collection?.product_lists || []).map((p) => ({
    ...p,
    qty: p.qty || 1,
  }));

  console.log("products", products);

  function formatValue(value) {
    if (!value) return "";

    // If it's already a proper array → return as comma string
    if (Array.isArray(value)) {
      return value.join(", ");
    }

    // If it's the broken format → fix it
    if (typeof value === "string" && value.includes("['")) {
      return value
        .replace(/[\[\]']+/g, "") // remove [ ] '
        .split(",")
        .map((v) => v.trim())
        .join(", ");
    }

    return value;
  }

  const validateGuestPhone = useCallback((phone) => {
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(phone.replace(/\D/g, ""));
  }, []);

  const handleGuestSuccess = useCallback(
    async ({ userId }) => {
      Cookies.set("isGuestLoggedIn", true, {
        expires: SIGN_IN_EXPIRE_DAYS,
      });

      if (!userId || !guestTrackerId) return;

      try {
        const unsignedCartResponse =
          await collectionAPIs.fetchCollectionsAPICall({
            is_display_amount: true,
            path: `my_cart_${guestTrackerId}`,
          });

        const signedCartResponse =
          await collectionAPIs.fetchCollectionsAPICall({
            is_display_amount: true,
            path: `my_cart_${userId}`,
          });

        const unsignedProducts =
          unsignedCartResponse?.data?.data?.[0]?.product_lists?.map((item) => ({
            mfr_code: item.mfr_code,
            qty: item.qty,
            tagged_by: item.tagged_by,
            collection:item.collection[0],
            source:item.source[0],
            event_id:item.event_id

          }));
          // console.log("unsignedProducts", unsignedProducts);
        const signedProducts =
          signedCartResponse?.data?.data?.[0]?.product_lists?.map((item) => ({
            mfr_code: item.mfr_code,
            qty: item.qty,
            tagged_by: item.tagged_by,
          }));
          // console.log("signedProducts", signedProducts);

        const mergedProducts = {};

        [unsignedProducts, signedProducts].forEach((productList) => {
          if (!Array.isArray(productList)) return;

          productList.forEach((item) => {
            const key = item.mfr_code;
            if (!mergedProducts[key]) {
              mergedProducts[key] = { ...item };
            } else {
              mergedProducts[key].qty += item.qty;
            }
          });
        });

        const mergedProductsArray = Object.values(mergedProducts);
        if (!mergedProductsArray.length) return;

        dispatch(
          addToCart({
            is_display_amount: true,
            products: mergedProductsArray,
            product_lists: [],
            collection_name: "my cart",
            type: "system",
            user_id: userId,
            path: `my_cart_${userId}`,
          }),
        );
      } catch (error) {
        console.log(error);
      }
    },
    [dispatch, guestTrackerId],
  );

  let shareUrl
  // console.log('sharePageUrl', shareUrl);
    const shareQrCodeImage = (sharePageUrl) => {
      shareUrl =sharePageUrl

      try {
        return collectionQRCodeGenerator(sharePageUrl);
      } catch (e) {
        console.log(e);
      }
    };
  // Handle continue button click
  const handleContinueClick = () => {
    const isUserLoginCookies = Cookies.get("isGuestLoggedIn") === "true";

    // If user is not authenticated and not already a guest, show popup
    if (!authUserId && !isUserLoginCookies) {
      openGuestPopup({
        action: "checkout",
        storeName: storeData?.store_name || current_store_name,
        cookieExpireDays: SIGN_IN_EXPIRE_DAYS,
        phoneValidator: validateGuestPhone,
        phoneErrorMessage: "Please enter a valid 10-digit phone number",
        refreshUserInfo: true,
        onSuccess: handleGuestSuccess,
      });
    } else if (shouldShowCheckoutClaimQr && ( hasKioskAccess && kioskUser_id || authUserId )) {
      setIsCheckoutClaimQrModalOpen(true);
    } else {
      // navigate("/cart/checkout");
      navigate(`/checkout-claim-badge`)
    }
  };

  return (
    <>
      <div className=" ">
        <div className="text-4xl lg:text-4xl font-semibold flex flex-col items-center mb-14 text-center">
          <span>CART</span>
            
        </div>
        
        <div className="lg:flex w-full px-10 ">
          <div className="flex-1">
            {products.length === 0 ? (
              <div className="text-center py-20 text-gray-500 text-2xl font-medium ">
                <div className="flex gap-1 items-center  justify-center">
                  <img src={cart_icon} className="h-16 w-16" />
                  Your cart is empty
                </div>
              </div>
            ) : (
              <div>
                {products.map((item, index) =>
                  item && item.mfr_code ? (
                    <div key={index} className="border-b pb-8 mb-6">
                      <div className="flex lg:gap-10 gap-3  md:p-4 w-full items-start">
                        <Link href={`/product/${item.mfr_code}`}>
                          <img
                            className="md:h-40 md:w-32 h-14  w-14 object-cover rounded-2xl "
                            src={item.image}
                            alt={item.name}
                          />
                        </Link>
                        <div className="flex flex-col flex-1">
                          <Link
                            href={`/product/${item.mfr_code}`}
                            className="p-0 m-0"
                          >
                            <h4 className="md:text-2xl text-xl font-semibold text-black-100">
                              {item.name}
                            </h4>
                          </Link>

                          {/* Cart Attributes with proper styling */}
                          <div className="mt-2 flex flex-wrap gap-2">
                            {
                              getCartAttributeValues(item).length > 0 &&
                                getCartAttributeValues(item).map(
                                  (attr, idx) => (
                                    <div
                                      key={idx}
                                      className="inline-flex bg-common items-center px-3 py-1 rounded-md text-xs font-medium"
                                      style={{
                                        //  boxShadow: `inset 8px -8px 12px rgba(0, 0, 0, 0.5),9px 9px 15px rgba(0, 0, 0, 0.3)`,
                                      }}
                                    >
                                      <span className="font-semibold  capitalize">
                                        {attr.name}:
                                      </span>
                                      <span className="ml-1 ">
                                        {formatValue(attr.value)}
                                      </span>
                                    </div>
                                  ),
                                )
                              // : (
                              // 	<div
                              // 		className='inline-flex items-center px-3 py-1 rounded-md text-xs'
                              // 		style={{
                              // 			background: "#770100",
                              // 			boxShadow: `inset 8px -8px 12px rgba(0, 0, 0, 0.5),9px 9px 15px rgba(0, 0, 0, 0.3)`,
                              // 		}}>
                              // 		<span className='text-gray-500'>
                              // 			No attributes available
                              // 		</span>
                              // 	</div>
                              // )
                            }
                          </div>

                          <div className="flex items-center lg:gap-16 md:gap-7 gap-4 mt-5">
                            <div
                              style={{ height: "52px" }}
                              className="flex md:gap-10 gap-4 border justify-between items-center md:py-4 px-2 md:px-4 rounded-md w-fit"
                            >
                              <button
                                style={{
                                  cursor: loading ? "not-allowed" : "pointer",
                                }}
                                className="text-xl font-bold"
                                disabled={loading}
                                onClick={() =>
                                  item.qty === 1
                                    ? handleRemove(item.mfr_code)
                                    : updateCartQuantity(item, item.qty - 1)
                                }
                              >
                                -
                              </button>
                              <p>{item.qty}</p>
                              <button
                                style={{
                                  cursor: loading ? "not-allowed" : "pointer",
                                }}
                                className="text-xl font-bold"
                                disabled={loading}
                                onClick={() =>
                                  updateCartQuantity(item, item.qty + 1)
                                }
                              >
                                +
                              </button>
                            </div>
                            <button
                              className="text-danger hover:underline"
                              disabled={loading}
                              onClick={() => handleRemove(item?.mfr_code)}
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-semibold">
                            ₹ {(item.price * item.qty).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : null,
                )}
              {!isGivaStore &&  (

                <div>
                  <p
                    className="md:p-5 p-3 text-sm md:text-base border"
                    style={{
                      background: "#faf5e7",
                      borderColor: "#FFC633",
                      borderRadius: 4,
                    }}
                  >
                    <span className="pr-3" style={{ color: "#FFC633" }}>
                      %
                    </span>
                    10% Instant Discount with Federal Bank Debit Cards on a min
                    spend of $150. TCA
                  </p>
                </div>
              )} 
              </div>
            )}
          </div>

          {/* Right Side - Order Summary */}
          <div>
            {hasKioskAccess && products?.length > 0  &&  (
                <div className="mt-6 flex flex-col items-center gap-3 text-center">
                  {checkoutClaimQr?.isLoading ? (
                    <div className="flex h-40 w-40 items-center justify-center rounded bg-gray-100 text-sm text-gray-500">
                      Loading QR...
                    </div>
                  ) : checkoutClaimQr?.qrUrl ? (
                    <img
                      src={checkoutClaimQr.qrUrl}
                      alt="Digital cart QR"
                      className="h-40 w-40 object-contain"
                    />
                  ) : (
                    <div className="flex h-40 w-40 items-center justify-center rounded bg-gray-100 px-4 text-sm text-gray-500">
                      QR unavailable
                    </div>
                  )}
                  {checkoutClaimQr?.shareUrl && (
                    <p className="break-all text-sm text-gray-500 mb-4">
                      Scan the QR code to view your cart on your phone.
                    </p>
                  )}
                </div>
              )}
          {products.length !== 0 && (
        
           
            <div
              className="border  lg:p-10 md:p-7 p-5 lg:w-[400px] lg:ml-10 rounded-sm shadow-lg h-fit sticky top-36 lg:mt-0 mt-6"
              style={{ borderColor: "#D1D1D8", minWidth: "250px" }}
            >
              <h2 className="text-center font-bold md:text-3xl text-2xl mb-6 md:mb-10">
                ORDER SUMMARY
              </h2>
              {!isGivaStore &&( 
                <>
              <div className="flex justify-between mb-5">
                <p className="md:text-lg text-base">Subtotal</p>
                <p className="md:text-lg text-base font-medium">
                  ₹ {collection?.total_amount?.toLocaleString()}
                </p>
              </div>
              <div className="flex justify-between mb-5">
                <p className="md:text-lg text-base">Discount</p>
                <p className="md:text-lg text-base font-medium">20%</p>
              </div>
              <div className="flex justify-between mb-5">
                <p className="md:text-lg text-base">Shipping</p>
                <p
                  className="md:text-lg text-base font-medium text-teal-600"
                  style={{ color: "#3AA39F" }}
                >
                  Free
                </p>
              </div>
              <div
                className="flex justify-between border-b-2 pb-5 mb-6"
                style={{ borderColor: "#D1D1D8" }}
              >
                <p className="md:text-lg text-base">Coupon Applied</p>
                <p className="md:text-lg text-base font-medium">0.00</p>
              </div>
                </>

              )}

              <div className="flex justify-between font-bold md:mb-8 mb-5">
                <p className="md:text-xl text-lg">TOTAL</p>
                <p className="md:text-xl text-lg ">
                  ₹ {collection?.total_amount?.toLocaleString()}
                </p>
              </div>
              {!isGivaStore && (

              <div className="flex justify-between text-gray-600 text-sm">
                <p>Estimated Delivery by</p>
                <p className="font-semibold text-black">1st Nov 2025</p>
              </div>
                )}
              {/* {storeData?.store_name=== 'giva_indiranagar2_hs' && (
                <button className="text-xl cursor-pointer " onClick={() => navigate(`/claim-points/${authUserId}/${storeData?.store_name}`)} > Claim Rewards </button>
              )} */}
              {/* <div className="relative mt-6"> 
                <input
                  placeholder="Coupon Code"
                  type="text"
                  className="border p-5 w-full mb-6"
                />
                <img src="" alt="input" className="absolute right-5 top-5" />
              </div> */}

              <div className="p-0">
                <button
                  onClick={handleContinueClick}
                  className="text-white mt-5 w-full rounded-xl lg:h-13 h-11 bg-brand"
                >
                  Continue
                </button>
              </div>
           
            </div>
        

          )}
          </div>

        </div>
      </div>

      <Modal
        headerText="Scan QR"
        isOpen={isCheckoutClaimQrModalOpen}
        onClose={() => setIsCheckoutClaimQrModalOpen(false)}
        size="sm"
      >
        <div className="flex flex-col items-center gap-4 text-center">
          {checkoutClaimMessage && hasKioskAccess && (
            <p className="text-base font-medium text-gray-900">
              {checkoutClaimMessage}
            </p>
          )}
  
            <img
              src={shareQrCodeImage(`/checkout-claim-badge/${kioskUser_id || authUserId}/${storeData?.store_name}`)}
              alt="Digital cart QR"
              className="h-48 w-48 object-contain "
            />
      
          <p> {shareUrl}</p>

        </div>
      </Modal>
    </>
  );
};

export default DeliveryDetails;
