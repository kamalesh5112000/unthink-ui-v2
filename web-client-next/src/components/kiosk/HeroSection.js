import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import Image from "next/image";
import { current_store_name } from "../../constants/config";
import { collectionQRCodeGenerator } from "../../helper/utils";
import {
  gTagKioskCollectionClick,
  gTagKioskProductClick,
} from "../../helper/webTracker/gtag";

const ReactPlayer = dynamic(() => import("react-player/lazy"), { ssr: false });
const HeroProductSwiper = dynamic(() => import("./HeroProductSwiper"), {
  ssr: false,
});

const HeroSection = ({ storeData, collectiondata }) => {
  const router = useRouter();


  // const videoUrlRaw = "https://www.youtube.com/watch?v=hrAOIj01B6E";
  const thumbnailImage =
    collectiondata?.thumbnail_image || collectiondata?.image;
  const [isClient, setIsClient] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const collectionPagePath = collectiondata?.path
    ? `/kiosk/collections/${collectiondata.path}`
    : "";
  const collectionQRCodeUrl =
    isClient && collectionPagePath
      ? collectionQRCodeGenerator(collectionPagePath)
      : "";

  useEffect(() => {
    // mark client after mount to avoid running client-only effects on SSR
    setIsClient(true);
  }, []);

  const videoContainerRef = useRef(null);
  const handlePlayClick = () => setIsPlaying(true);
  const handlePauseClick = () => setIsPlaying(false);

  useEffect(() => {
    if (!isClient) return;
    const node = videoContainerRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        const visible = entry.intersectionRatio >= 0.5;

        setIsPlaying(visible);
      },
      { threshold: [0, 0.25, 0.5, 0.75, 1] },
    );

    observer.observe(node);
    return () => observer.disconnect();
    // re-run when `products` changes so we attach observer when the
    // video container is mounted after the loading spinner.
  }, [isClient, collectiondata]);
  return (
    <div className="relative w-full mb-24">
      <div
        className="relative cursor-pointer rounded-4xl "
        style={{ maxHeight: "78vh", height: "700px" }}
        onClick={handlePlayClick}
        ref={videoContainerRef}
      >
        {isClient ? (
          collectiondata?.video_url ? (
            <ReactPlayer
              key={collectiondata?.video_url}
              url={collectiondata?.video_url}
              playing={isPlaying}
              onPlay={handlePlayClick}
              onPause={handlePauseClick}
              muted={true}
              loop={true}
              width="100%"
              height="100%"
              playsinline
              controls={false}
              style={{
                borderRadius: "16px",
                overflow: "hidden",
              }}
              config={{
                youtube: {
                  playerVars: {
                    controls: 0,
                    modestbranding: 1,
                    rel: 0,
                    iv_load_policy: 3,
                    playsinline: 1,
                    disablekb: 1,
                  },
                },
              }}
              light={isPlaying ? false : thumbnailImage || false}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-lightgray-102">
              <p className="text-black-103">No video available</p>
            </div>
          )
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-lightgray-102">
            <p className="text-black-103">Loading...</p>
          </div>
        )}

        <div className="absolute -bottom-20 left-0 right-0 px-3 md:px-6">
          <div className="relative pb-4">
            {/* subtle ash gradient behind the swiper cards */}
            <div
              aria-hidden="true"
              className="absolute -bottom-0.5 md:-bottom-1 mx-auto rounded-2xl pointer-events-none"
              style={{
                left: 0,
                right: 0,
                width: "100%",
                height: 168,
                zIndex: 1,
                background:
                  "linear-gradient(90deg, rgba(245,246,247,0.95) 0%, rgba(234,236,238,0.95) 50%, rgba(245,246,247,0.95) 100%)",
                filter: "blur(18px)",
              }}
            />

            <div
              style={{ position: "relative", zIndex: 10 }}
              className="flex items-stretch gap-3 overflow-hidden rounded-xl pb-2"
            >
              {current_store_name === 'giva_neeladri_hs' && 
                 <div key="collection-qr" className="flex-none">
                <div
                  className="h-44 w-50 rounded-xl shadow-lg flex items-center justify-center p-4"
                  style={{ backgroundColor: "rgba(250,251,252,0.96)" }}
                >
                  {collectionQRCodeUrl && (
                    <Image
                      src={collectionQRCodeUrl}
                      alt={`${collectiondata?.collection_name || "Collection"} QR code`}
                      width={160}
                      height={160}
                      unoptimized
                      className="h-full w-full object-contain"
                    />
                  )}
                </div>
              </div>
              }
              
              <div key="collection-info" className="flex-none">
                {collectiondata?.product_lists?.length > 0 && (
                <div
                  className="h-44 w-50 rounded-xl shadow-lg flex items-center justify-center p-4"
                  style={{ backgroundColor: "rgba(250,251,252,0.96)" }}
                >
                  <div className="text-center">
                    <h3 className="text-base md:text-lg font-semibold leading-snug text-black">
                      {collectiondata?.collection_name}
                    </h3>
                    <button
                      onClick={(event) => {
                        event.stopPropagation();
                        gTagKioskCollectionClick({
                          collection: collectiondata,
                          tab_name: "Social Media",
                          source: "kiosk_shop_all",
                        });
                        router.push(
                          `/kiosk/collections/${collectiondata?.path}`,
                        );
                      }}
                      className="mt-4 bg-black text-white px-4 py-2 rounded-md font-semibold"
                    >
                      Shop All
                    </button>
                  </div>
                </div>
                )}
              </div>
              
                <HeroProductSwiper
                  products={collectiondata?.product_lists}
                  onProductClick={(product) => {
                    gTagKioskProductClick({
                      product,
                      collection: collectiondata,
                      tab_name: "Social Media",
                      source: "kiosk_social_media_carousel",
                    });
                    router.push(`/kiosk/product/${product.mfr_code}`);
                  }}
                />
              
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
