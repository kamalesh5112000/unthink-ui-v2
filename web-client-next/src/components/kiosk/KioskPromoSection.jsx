import React from "react";
import KioskPromoCard from "./KioskPromoCard";
import cart from "../../images/kiosk/cart.png";
import gift from "../../images/kiosk/gift.png";
import { collectionQRCodeGenerator } from "../../helper/utils";
import { current_store_name } from "../../constants/config";

const KioskPromoSection = ({ showTags, storeData }) => {
  const qr1 =
    "https://aurastage.unthink.ai/settings/build_qrcode/?page_url=https://unthink-ui-next-stage-ui-v2-314035436999.us-central1.run.app/collections/testing-product-detail-page-173081113277330";
  const fetchedData = React.useMemo(() => {
    const data = storeData?.kiosk_settings?.tabs || [];
    return data.find((item) => item?.label === showTags) || null;
  }, [showTags, storeData?.kiosk_settings?.tabs]);

  const shareQrCodeImage = (sharePageUrl) => {
    try {
      return collectionQRCodeGenerator(sharePageUrl);
    } catch (e) {
      console.log(e);
    }
  };
const qrImage = shareQrCodeImage(fetchedData?.event_app_list?.[0]) || qr1;
  // if (
  //   current_store_name === 'giva_indiranagar2_hs'
  // ) {
    

    return (
      <>
      <div className="w-[272px] hidden min-[1025px]:block shrink-0">
        <div className="rounded-[20px] flex min-[1025px]:block bg-giva-away-primary px-[16px] pb-[16px] pt-[20px] shadow-[0_14px_34px_rgba(0,0,0,0.22)]">
          <div className="rounded-[16px] bg-white px-[14px] py-5 shadow-[0_7px_10px_rgba(0,0,0,0.22)]">
            <div className="flex items-center justify-center gap-[16px]">             
              
                <h3 className="text-xl text-center font-extrabold leading-[1.15] text-[#202020]">
                 {fetchedData?.tag_line || 'Shop & Play with GIVA '} 
                </h3>              
             
            </div>
          </div>

          <div className="mt-[14px] rounded-[14px] bg-white px-[12px] pb-[24px] pt-[14px] shadow-[0_5px_9px_rgba(0,0,0,0.2)]">
            <div className="flex items-center gap-[12px]">
              <div className="flex relative h-[70px] w-[74px] shrink-0 items-center justify-center overflow-hidden">
                <img
                  src={fetchedData?.title_icon || cart.src}
                  className="max-h-full max-w-full object-contain"
                  alt={fetchedData?.title_icon || "Cart Icon"}
                />
                {/* <p className=" h-[70px] w-[74px] bg-brand absolute top-0 left-0 "></p> */}
              </div>
              <div className="min-w-0">
                <h3 className="text-[16px] font-extrabold leading-[1.15] text-[#202020]">
                  {fetchedData?.event_message || "GIVA AI Assistant"}
                </h3>
                <p className="mt-[8px] text-[14px] font-medium leading-[1.2] text-[#777777]">
                  {fetchedData?.event_description || "Get personalized jewelry picks made for you."}
                </p>
              </div>
            </div>

         

            <div className="mx-auto mt-[16px] flex h-[200px] w-[205px] items-center justify-center border-[3px] border-brand bg-white">
              <img
                src={qrImage}
                alt="GIVA AI Assistant QR"
                className="h-full w-full object-contain"
              />
            </div>
          </div>

          <div className="mt-[20px] rounded-[14px] bg-white px-[16px] pb-[16px] pt-[12px] shadow-[0_5px_9px_rgba(0,0,0,0.2)]">
            <div className="flex items-center gap-[14px]">
              <img
                src={fetchedData?.gift ||  gift.src}
                className="h-[52px] w-[52px] shrink-0 object-contain"
                alt=""
              />
              <h3 className="text-center text-[16px] font-extrabold leading-[1.15] text-[#202020]">
               {fetchedData?.offer_message || "Special Offer!"}
              </h3>
            </div>
            {/* <div className="mx-auto mt-[12px] flex h-[46px] w-[202px] flex-col items-center justify-center rounded-[10px] bg-[#ffeef4]">
              <span className="text-[12px] font-medium leading-none text-[#202020]">
                Earn up to
              </span>
              <span className="mt-[3px] text-[25px] font-extrabold leading-none text-[#ff5685]">
                ₹1000
              </span>
            </div> */}
            <img
              src={fetchedData?.offer_image}
              alt={fetchedData?.offer_image || "Offer Image"}
              className="mt-[12px] object-contain m-auto"
            />
          </div>
        </div>
      </div>
 
    <div className="w-full block min-[1025px]:hidden mt-4 pb-4">
      <div className="">
       <KioskPromoCard
        variant="promo"
        title={fetchedData?.tag_line || "Shop & Play with GIVA "}
        subtitle={
          fetchedData?.event_description ||
          "Get personalized jewelry picks made for you."
        }
        eventTitle={fetchedData?.event_message || "GIVA AI Assistant"}
        qrSrc={qrImage}
        titleIcon={fetchedData?.title_icon || cart.src}
        giftIcon={fetchedData?.gift || gift.src}
        offerMessage={fetchedData?.offer_message || "Special Offer!"}
        offerImage={fetchedData?.offer_image}
      />
      </div>
    </div>
      </>
  );
// };
}
export default KioskPromoSection;
