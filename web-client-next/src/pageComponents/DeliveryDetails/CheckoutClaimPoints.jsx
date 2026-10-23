import React, { useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { fetchCart } from "./redux/action";
import ClaimPoints from "./ClaimPoints";
import { getRedeemCustomerName } from "../storeAssistant/redeem/redeemQr";

const getRouteValue = (value) => (Array.isArray(value) ? value[0] : value);

const CheckoutClaimPoints = ({ customerUserId, customerStoreName, customerData }) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const routeUserId = customerUserId || getRouteValue(router.query.user_id);

  const [
    collection,
    loading,
    storeData,
  ] = useSelector((state) => [
    state.cart?.collection,
    state.cart?.loading,
    state.store.data,
  ]);

  const cartPath = routeUserId ? `my_cart_${routeUserId}` : "";

  useEffect(() => {
    if (cartPath) {
      dispatch(fetchCart(cartPath));
    }
  }, [cartPath, dispatch]);

  const products = useMemo(
    () => (collection?.product_lists || []).map((product) => ({
      ...product,
      qty: product.qty || 1,
    })),
    [collection]
  );

  const orderTotal = collection?.total_amount || 0;
  const customerName = getRedeemCustomerName(customerData);

  return (
    <main className="bg-[#f7f7f8] p-3 text-[#242424] md:p-5">
      <section className="mx-auto max-w-6xl overflow-hidden rounded-lg border border-[#d7d7d7] bg-white shadow-sm">
        <header className="border-b border-[#d7d7d7] px-5 py-4">
          <p className="text-2xl font-semibold">
            Checkout at the counter - [Customer Name: {customerName}]
          </p>
          <p className="mt-1 capitalize text-sm text-gray-500">{storeData?.store_name}</p>
        </header>

        <div className="grid gap-0 xl:grid-cols-[1fr_1.55fr]">
          <div className="border-b border-[#d7d7d7] p-5 xl:border-b-0 xl:border-r">
            <h2 className="mb-4 text-xl font-semibold">Order Summary</h2>

            <div className="min-h-[132px] space-y-3 text-sm">
              {loading && <p className="text-gray-500">Loading cart...</p>}

              {!loading && products.length === 0 && (
                <p className="text-gray-500">No cart products found.</p>
              )}

              {products.map((product, index) => (
                <div
                  key={`${product.mfr_code || product.product_id || index}`}
                  className="flex items-start justify-between gap-4"
                >
                  <div className="lg:flex items-start gap-3">
                    {(
                      product.image ||
                      product.product_image ||
                      product.thumbnail ||
                      product.cover_image
                    ) && (
                      <img
                        src={
                          product.image ||
                          product.product_image ||
                          product.thumbnail ||
                          product.cover_image
                        }
                        alt={product.name || product.mfr_code || `Product ${index + 1}`}
                        className="h-20 w-20 flex-none rounded-md border border-[#e5e5e5] object-cover"
                      />
                    )}
                    <div>
                      <p className="font-medium  overflow-hidden ">
                         ({product.name || product.mfr_code || "Item"})
                      </p>
                      <p className="text-gray-500">Qty {product.qty}</p>
                    </div>
                  </div>
                  <p className="font-semibold">
                    {product.display_amount || product.price
                      ? `Rs ${Number(product.display_amount || product.price).toLocaleString()}`
                      : "SX"}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-5 border-t border-[#d7d7d7] pt-4 text-right">
              <p className="text-lg font-semibold">
                {orderTotal ? `Rs ${orderTotal.toLocaleString()}` : "SX"} Total
              </p>
            </div>
          </div>

          <ClaimPoints
            checkoutPage={true}
            customerUserId={routeUserId}
            customerStoreName={customerStoreName}
            customerData={customerData}
          />
        </div>
      </section>
    </main>
  );
};

export default CheckoutClaimPoints;
