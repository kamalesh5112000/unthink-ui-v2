import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useSelector } from "react-redux";
import "swiper/css";
import "swiper/css/scrollbar";
import HeroSection from "../../components/kiosk/HeroSection";
import BannerKisok from "../../components/kiosk/BannerKisok";
import KioskPromoSection from "../../components/kiosk/KioskPromoSection";
import { Spin } from "antd";
import useKioskSessionReminder, {
  KioskSessionPopup,
} from "../../components/kiosk/useKioskSessionReminder";
import {
  LookBookApiCall,
  SocialMediaApiCall,
  TrendingApiCall,
} from "../../helper/serverAPIs";
import LoggedInInfo from "../../components/kiosk/components/LoggedInInfo";
import AuthInput from "../../components/kiosk/components/AuthInput";
import { current_store_name } from "../../constants/config";
import {
  gTagKioskTabAutoSwitch,
  gTagKioskTabClick,
} from "../../helper/webTracker/gtag";

const KIOSK_TAGS = ["Social Media", "Look Books", "#Trending"];
const GIVA_NEELADRI_TAB_ROTATION_DELAY = 60 * 1000;

const KioskHome = ({ props }) => {
  const userInfo = useSelector((state) => state.auth.user.data);
 
  const [products, setProducts] = useState([]);
  const [lookBooks, setLookBooks] = useState([]);
  const [socialMediaData, setSocialMediaData] = useState([]);

  const storeData = useSelector((state) => state.store.data);
  const Tags = useMemo(() => {
    const configuredTabs = storeData?.kiosk_settings?.tabs
      ?.map((tab) => tab?.label)
      ?.filter(Boolean);

    return configuredTabs?.length ? configuredTabs : KIOSK_TAGS;
  }, [storeData?.kiosk_settings?.tabs]);

  const [showTags, setShowTags] = useState(
    () => sessionStorage.getItem("selectedTag") || Tags[0],
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const rotationDelay = storeData?.kiosk_settings?.video_time_gap;
  const collectiondata = useMemo(
    () => socialMediaData[activeIndex] || null,
    [socialMediaData, activeIndex],
  );
  const handleKioskLoginChange = useCallback(
    (login) => {
      if (login) return;

      sessionStorage.removeItem("selectedTag");
      setShowTags(Tags[0]);
    },
    [Tags],
  );

  useEffect(() => {
    const fetchSocialMedia = async () => {
      try {
        const videoApiCall = await SocialMediaApiCall();
        // console.log('response',response.data.data);

        const videoData = Array.isArray(videoApiCall?.data?.data)
          ? videoApiCall.data.data
          : [];
        setSocialMediaData(videoData);
        setActiveIndex(0);
        const response = await TrendingApiCall();
        // console.log('response',response.data.data);
        const data =
          response && response.data && response.data.data
            ? response.data.data
            : [];
        // const shuffledData = [...data].sort(() => Math.random() - 0.5);
        setProducts(data);
        // console.log('shuffledData', shuffledData);
        const lookBookResponse = await LookBookApiCall();
        setLookBooks(lookBookResponse?.data?.data);
        // console.log('lookBookResponse',lookBookResponse?.data?.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchSocialMedia();
  }, []);
  useEffect(() => {
    if (socialMediaData.length <= 1 || !rotationDelay) return;

    const timer = setInterval(() => {
      setActiveIndex(
        (currentIndex) => (currentIndex + 1) % socialMediaData.length,
      );
    }, rotationDelay);

    return () => clearInterval(timer);
  }, [rotationDelay, socialMediaData.length]);

  useEffect(() => {
    if (current_store_name !== "giva_neeladri_hs") return undefined;

    const timer = setInterval(() => {
      setShowTags((currentTag) => {
        const currentTagIndex = Tags.indexOf(currentTag);
        const nextTag = Tags[(currentTagIndex + 1) % Tags.length];

        sessionStorage.setItem("selectedTag", nextTag);
        gTagKioskTabAutoSwitch({ tab_name: nextTag });
        return nextTag;
      });
    }, GIVA_NEELADRI_TAB_ROTATION_DELAY);

    return () => clearInterval(timer);
  }, [Tags]);

  // KioskSessionPopup is rendered in JSX below using showSessionPopup

  if (!Array.isArray(products) || products.length === 0) {
    return (
      <div className="min-h-screen mt-4 flex items-start justify-center">
        <Spin size="large" className="pink-spinner" />
      </div>
    );
  }

  return (
    <div className=" mx-auto w-full px-6 md:px-10 mt-4 ">
      {/* User Actions */}

      {/* Tag Buttons (pill-style tabs) */}
      <div className="flex items-center mb-3">
        <div className="w-full  flex items-center mx-auto">
          <div className="flex items-center rounded-full bg-kiosk-primary w-full p-1">
            {Tags.map((tag, i) => (
              <button
                key={i}
                onClick={() => {
                  gTagKioskTabClick({ tab_name: tag });
                  (setShowTags(tag),
                    sessionStorage.setItem("selectedTag", tag));
                }}
                aria-pressed={showTags === tag}
                className={`flex-1 text-center button-kiosk px-3 md:px-5 py-2 font-semibold transition rounded-full ${
                  showTags === tag
                    ? "bg-white text-black shadow-md"
                    : "text-white hover:text-black"
                } ${i > 0 ? "border-l border-gray-400" : ""}`}
              >
                {tag}
              </button>
            ))}
          </div>
          <AuthInput
            styles="lg:min-w-[272px] lg:max-w-[272px]"
            onLoginChange={handleKioskLoginChange}
          />
        </div>
      </div>  
      <div
        className={`lg:flex ${showTags === "Social Media" ? "items-start" : "items-center"} gap-3`}
      >
        {showTags === "Social Media" && (
          <>
            <div className="min-w-0 flex-1">
              <HeroSection
                storeData={storeData}
                collectiondata={collectiondata}
              />
            </div>
            <KioskPromoSection storeData={storeData} showTags={showTags} />
          </>
        )}
      </div>
      {showTags !== "Social Media" && (
        <div className="">
          <BannerKisok
            products={products}
            Tags={showTags}
            lookBooks={lookBooks}
            storeData={storeData}
          />
        </div>
      )}
      {/* Logged in info (fixed bottom-right) */}

      <LoggedInInfo userInfo={userInfo} />
    </div>
  );
};

export default KioskHome;
