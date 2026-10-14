import React from "react";
import { useRouter } from "next/router";
import Modal from "../modal/Modal";

const getProductPrice = (product) =>
  product?.listprice ||
  product?.price ||
  "";

const MiniKioskCard = ({
  title,
  isOpen,
  isLoading,
  products = [],
  message,
  qrUrl,
  qrTargetUrl,
  onClose,
}) => {
  const router = useRouter();

  const handleProductOpen = (mfrCode) => {
    if (!mfrCode) return;
    router.push(`/kiosk/product/${mfrCode}`);
  };

  return (
    <Modal
      headerText={title}
      isOpen={isOpen}
      onClose={onClose}
      size="md"
    >
      <div className="flex flex-col items-center gap-4">
        {isLoading ? (
          <div className="flex h-72 w-full items-center justify-center bg-gray-100 text-sm text-gray-500">
            Loading products...
          </div>
        ) : products?.length ? (
          <div className="grid max-h-[70vh] w-full grid-cols-2 gap-4 overflow-y-auto pr-2 md:grid-cols-3">
              {qrUrl ? (
              <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                <div className="flex aspect-square w-full items-center justify-center bg-gray-100 p-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={qrUrl}
                    alt="Collection QR code"
                    className="h-full w-full object-contain"
                  />
                </div>
                <div className="space-y-1 p-3">
                  <div className="text-sm font-semibold text-gray-900">
                    Scan on mobile
                  </div>
                  {qrTargetUrl ? (
                    <div className="break-all text-xs text-gray-500">
                      {qrTargetUrl}
                    </div>
                  ) : null}
                </div>
              </div>
            ) : null}
            {products.map((product, index) => {
              const price = getProductPrice(product);

              return (
                <div
                  key={product?._id || product?.product_id || product?.mfr_code || index}
                  className={`overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm ${
                    product?.mfr_code ? "cursor-pointer hover:border-gray-400" : ""
                  }`}
                  role={product?.mfr_code ? "button" : undefined}
                  tabIndex={product?.mfr_code ? 0 : undefined}
                  onClick={() => handleProductOpen(product?.mfr_code)}
                  onKeyDown={(e) => {
                    if (!product?.mfr_code || (e.key !== "Enter" && e.key !== " ")) return;
                    e.preventDefault();
                    handleProductOpen(product.mfr_code);
                  }}
                >
                  <div className="flex aspect-square w-full items-center justify-center bg-gray-100">
                    {product?.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={product.image}
                        alt={product?.name || "Product"}
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <span className="px-3 text-center text-sm text-gray-500">
                        No image
                      </span>
                    )}
                  </div>
                  <div className="space-y-1 p-3">
                    <div className="line-clamp-2 text-sm font-semibold text-gray-900">
                      {product?.name}
                    </div>
                    {product?.brand || product?.brand_name ? (
                      <div className="truncate text-xs text-gray-500">
                        {product?.brand || product?.brand_name}
                      </div>
                    ) : null}
                    {price ? (
                      <div className="text-sm font-medium text-gray-900">
                        {price}
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })}
          
          </div>
        ) : (
          <div className="flex min-h-32 w-full items-center justify-center rounded bg-gray-100 px-4 text-center text-sm text-gray-600">
            {message || "No products available"}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default MiniKioskCard;
