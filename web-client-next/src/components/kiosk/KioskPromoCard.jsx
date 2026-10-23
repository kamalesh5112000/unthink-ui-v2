import React from "react";


const KioskPromoCard = ({
  variant,
  title,
  subtitle,
  eventTitle,
  qrSrc,
  titleIcon,
  giftIcon,
  offerMessage,
  offerImage,
}) => {
  return (
       <div className="w-full shrink-0 md:mt-4 min-[1025px]:mt-0 min-[1025px]:w-[272px]">
        <div className="  min-h-[162px] items-center justify-between gap-6 rounded-[12px] bg-white px-10 py-5 shadow-[0_4px_18px_rgba(0,0,0,0.18)] flex ">
          <div className="flex flex-col min-w-[225px] items-start gap-8">
            <div className="flex flex-col items-center gap-3">
              <h3 className="whitespace-nowrap text-[20px] font-extrabold leading-none text-[#202020]">
                {title}
              </h3>
              <img
                src={titleIcon}
                className="h-[76px] w-[80px] object-contain"
                alt={titleIcon || "Cart Icon"}
              />
            </div>

            <div className="">
              <h3 className="text-[18px] font-extrabold leading-[1.08] text-[#202020]">
                {eventTitle}
              </h3>
              <p className="mt-[8px] text-[14px] font-medium leading-[1.2] text-[#777777]">
                {subtitle}
              </p>
            </div>
          </div>

          <div className="flex h-[180px] w-[180px] shrink-0 items-center justify-center border-[3px] border-brand bg-white">
            <img
              src={qrSrc}
              alt="GIVA AI Assistant QR"
              className="h-full w-full object-contain "
            />
          </div>

          <div className="flex min-w-[145px] flex-col items-center justify-center gap-2">
            <div className="flex  flex-col items-center gap-3">
              <span className="flex h-[66px] w-[65px] items-center justify-center rounded-[2px] bg-[#fff0f4]">
                <img
                  src={giftIcon}
                  className="h-[53px] w-[53px] object-contain"
                  alt="giftIcon"
                />
              </span>
              <span className="text-[16px] font-extrabold text-center mb-3 leading-none text-[#202020]">
                {offerMessage || "Rs 500"}
              </span>
            </div>
            {offerImage ? (
              <img
                src={offerImage}
                alt={offerImage || "Offer Image"}
                className="max-h-[78px] max-w-[178px] object-contain"
              />
            ) : (
              <span className="text-[36px] font-medium uppercase leading-none tracking-[0.08em] text-black">
                GIVA
              </span>
            )}
          </div>
        </div>

         
      </div>
  );
};

export default KioskPromoCard;
