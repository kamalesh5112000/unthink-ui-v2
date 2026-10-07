import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { MdOutlineKeyboardArrowLeft } from "react-icons/md";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode } from "swiper";
import { isEmpty } from "../../helper/utils";
import "swiper/css";
import "swiper/css/free-mode";
import dynamic from "next/dynamic";
const   VirtualTryOnModal  = dynamic( () => import ("../common/VirtualTryOnModal"),{ssr:false})

const ProductGallery = ({
  productDetails,
  fetchProductImage,
  discountPer,
  storeData,
  kioskLogin,
  hasKioskAccess,
  buildProductAutoLoginQr,
  setIsPopupShow,
  setGuestPopupAction,
  authUser,
  pdploader,
}) => {
  const [additionalimg, setAdditionalImg] = useState(null);
  const thumbnailSwiperRef = useRef(null);
  const [isThumbnailOverflowing, setIsThumbnailOverflowing] = useState(false);

  const checkThumbnailOverflow = () => {
    if (thumbnailSwiperRef.current && thumbnailSwiperRef.current.wrapperEl) {
      const { scrollWidth, clientWidth } = thumbnailSwiperRef.current.wrapperEl;
      setIsThumbnailOverflowing(scrollWidth > clientWidth);
    }
  };

  useEffect(() => {
    checkThumbnailOverflow();

    if (typeof window !== "undefined") {
      const handleResize = () => {
        checkThumbnailOverflow();
      };
      window.addEventListener("resize", handleResize);
      return () => {
        window.removeEventListener("resize", handleResize);
      };
    }
  }, [productDetails, pdploader]);

  const Additionalimages = [
    productDetails?.image,
    ...(Array.isArray(productDetails?.additional_image)
      ? productDetails?.additional_image
      : productDetails?.additional_image
        ? [productDetails?.additional_image]
        : []),
  ];

  return (
    <div className="w-full  lg:w-full   mx-auto border-2 border-[#f2f2f2] rounded-3xl   p-3 sm:p-4  ">
      <div className="h-auto rounded-2xl bg-white/70   overflow-hidden max-h-590">
        {!isEmpty(productDetails?.image || fetchProductImage) ? (
          <div className="relative">
            <img
              className="w-full h-full object-contain rounded-2xl lg:max-h-590 max-w-640 max-h-[350px] lg:min-h-[590px]"
              src={additionalimg || productDetails?.image || fetchProductImage}
              alt="Product Image"
              loading="eager"
              fetchPriority="high"
            />
            {/* {discountPer ? (
              <span className="text-[12px] font-bold text-white absolute top-[18px] left-[15px] bg-red-500 px-[8px] py-[3px] rounded-[25px]">
                {discountPer}% OFF
              </span>
            ) : null} */}
            {storeData?.is_tryon_enabled && (
              <VirtualTryOnModal
                isFloating
                className="group"
                product={productDetails}
                login={kioskLogin}
                hasKioskAccess={hasKioskAccess}
                buildProductAutoLoginQr={buildProductAutoLoginQr}
                setIsPopupShow={setIsPopupShow}
                setGuestPopupAction={setGuestPopupAction}
                storeData={storeData}
                saveUserId={kioskLogin?.user_id || authUser?.user_id || null}
                kioskEmail={kioskLogin?.email || null}
                kioskUserName={kioskLogin?.user_name || null}
                iconClassName="h-[18px] w-[18px] transition-transform duration-300 group-hover:scale-110"
                textClassName="text-whit text-xs font-semibold whitespace-nowrap sm:text-sm"
              />
            )}
          </div>
        ) : null}
      </div>
      {productDetails?.additional_image &&
      productDetails?.additional_image.length > 0 ? (
        <div className="relative mt-4">
          <Swiper
            modules={[FreeMode]}
            freeMode={true}
            slidesPerView={"auto"}
            spaceBetween={10}
            onSwiper={(swiper) => {
              thumbnailSwiperRef.current = swiper;
              if (swiper?.wrapperEl) {
                const { scrollWidth, clientWidth } = swiper.wrapperEl;
                setIsThumbnailOverflowing(scrollWidth > clientWidth);
              }
            }}
            className="w-full cursor-pointer"
          >
            {Additionalimages?.map((img, i) => (
              <SwiperSlide key={i} style={{ width: "auto" }}>
                <div className="flex">
                  <Image
                    src={img}
                    height={50}
                    width={50}
                    className={`w-[110px] h-[120px] rounded-xl border transition ${
                      additionalimg === img
                        ? "border-brand border-2  "
                        : "border-[#e8e2ff] hover:border-secondary  "
                    }`}
                    onClick={() => setAdditionalImg(img)}
                    alt="product"
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {isThumbnailOverflowing && (
            <>
              <button
                type="button"
                className="absolute -left-2 sm:-left-3 top-1/2 -translate-y-1/2 h-8 w-8 lg:h-10 lg:w-10 hover:shadow-lg bg-white border border-[#ddd6ff] rounded-full flex justify-center items-center z-10"
                onClick={() => {
                  if (thumbnailSwiperRef.current) {
                    thumbnailSwiperRef.current.slidePrev();
                  }
                }}
              >
                <MdOutlineKeyboardArrowLeft className="text-xl text-[#1f2c3b]" />
              </button>
              <button
                type="button"
                className="absolute -right-2 sm:-right-3 top-1/2 -translate-y-1/2 h-8 w-8 lg:h-10 lg:w-10 hover:shadow-lg bg-white border border-[#ddd6ff] rounded-full flex justify-center items-center z-10"
                onClick={() => {
                  if (thumbnailSwiperRef.current) {
                    thumbnailSwiperRef.current.slideNext();
                  }
                }}
              >
                <MdOutlineKeyboardArrowLeft className="transform rotate-180 text-xl text-[#1f2c3b]" />
              </button>
            </>
          )}
        </div>
      ) : null}
    </div>
  );
};

export default React.memo(ProductGallery);
