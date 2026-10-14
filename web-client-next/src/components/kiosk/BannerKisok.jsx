import { useRouter } from "next/router";
import React, { useEffect, useMemo, useState } from "react";
import KioskPromoSection from "./KioskPromoSection";
import {
  collectionQRCodeGenerator,
  getBlogCollectionPagePath,
} from "../../helper/utils";
import { gTagKioskCollectionClick } from "../../helper/webTracker/gtag";

const BannerKisok = ({ products, Tags, lookBooks, storeData }) => {
  const router = useRouter();
  const [collectionQrUrls, setCollectionQrUrls] = useState({});
  const isNeeladriStore = storeData?.store_name === "giva_neeladri_hs";
  const desktopColumnCount = isNeeladriStore ? 3 : 4;

  const trendingProducts = useMemo(
    () => (products || []).filter((x) => x.cover_image && x.path),
    [products],
  );

  const lookBooksProducts = useMemo(
    () => (lookBooks || []).filter((x) => x.cover_image && x.path),
    [lookBooks],
  );

  const displayedProducts = useMemo(
    () => (Tags === "#Trending" ?  storeData?.store_name === "giva_neeladri_hs"? trendingProducts.slice(0,6) : trendingProducts  : lookBooksProducts),
    [Tags, lookBooksProducts, trendingProducts],
  );

  const getCollectionPagePath = (currentCollection) =>
    getBlogCollectionPagePath(
      currentCollection?.path,
      currentCollection?.path,
      currentCollection?._id || currentCollection?.collection_id,
      currentCollection?.user_id,
      currentCollection?.status,
      currentCollection?.hosted_stores,
      currentCollection?.collection_theme,
    ) || `/collections/${currentCollection?.path || ""}`;

  const displayedProductPaths = useMemo(
    () => displayedProducts.map((product) => product.path).filter(Boolean),
    [displayedProducts],
  );

  useEffect(() => {
    const qrEntries = displayedProducts
      .map((currentCollection) => {
        if (!currentCollection?.path) return null;

        const collectionPagePath = getCollectionPagePath(currentCollection);
        const qrUrl = collectionQRCodeGenerator(collectionPagePath);

        return [
          currentCollection.path,
          {
            qrUrl,
            shareUrl: collectionPagePath,
          },
        ];
      })
      .filter(Boolean);

    setCollectionQrUrls(Object.fromEntries(qrEntries));
  }, [displayedProductPaths, displayedProducts]);

  const handleNavCollection = (Singlecollectiondata) => {
    gTagKioskCollectionClick({
      collection: Singlecollectiondata,
      tab_name: Tags,
      source: "kiosk_collection_grid",
    });
    router.push(`/kiosk/collections/${Singlecollectiondata.path}`);
  };

  const desktopColumns = Array.from(
    { length: desktopColumnCount },
    (_, columnIndex) =>
      displayedProducts.filter(
        (_, index) => index % desktopColumnCount === columnIndex,
      ),
  );


  const tileStyles = isNeeladriStore
    ? [
        ["h-[360px]", "h-[330px]"],
        ["h-[330px]", "h-[360px]"],
        ["h-[360px]", "h-[330px]"],
      ]
    : [
        ["h-[268px]", "h-[237px]"],
        ["h-[237px]", "h-[268px]"],
        ["h-[268px]", "h-[237px]"],
        ["h-[237px]", "h-[268px]"],
      ];

  return (
    <div className="min-[1025px]:flex items-start justify-center gap-3">
      {/* Banner Section */}
      <div className="relative max-h-[800px] w-full  rounded-[18px] bg-white p-2 md:p-5">
        <div className="relative z-10 h-full w-full">
          <div className="relative grid max-h-[calc(600px-1rem)] grid-cols-2 gap-4 overflow-y-auto pr-1 md:hidden">
            {displayedProducts.map((product) => (
              <button
                type="button"
                className="group flex h-[184px] cursor-pointer flex-col overflow-hidden rounded-[16px] border-[6px] border-[#eeeeee] bg-kiosk-support text-left shadow-[0_3px_8px_rgba(0,0,0,0.12)] transition-transform duration-300 ease-out active:scale-[0.99]"
                key={product.collection_id}
                onClick={() => handleNavCollection(product)}
              >
                <div className="relative min-h-0 w-full flex-1 overflow-hidden rounded-t-[10px] bg-[#ead8bd]">
                  {product.cover_image && (
                    <img
                      src={product.cover_image}
                      className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.035]"
                      alt={product.collection_name || product.cover_image}
                      loading="lazy"
                    />
                  )}
                </div>
                <div className="grid min-h-[104px] shrink-0 grid-cols-[minmax(0,1fr)_auto] items-start gap-2 bg-kiosk-support px-3 py-3">
                  <div className="min-w-0">
                    <p className="max-w-full truncate whitespace-nowrap text-[15px] font-semibold leading-tight text-[#1d2345]">
                      {product.collection_name || "Untitled collection"}
                    </p>
                    {/* <div className="mt-3 flex items-center gap-2 text-[#d5548e]">
                      <span className="inline-block h-4 w-2.5 rounded-sm border-2 border-current" />
                      <span className="text-[11px] font-semibold leading-none">
                        Scan to view
                      </span>
                    </div> */}
                  </div>
                  {collectionQrUrls[product?.path]?.qrUrl && (
                    <div className="rounded bg-white p-1 shadow-md">
                      <img
                        src={collectionQrUrls[product.path].qrUrl}
                        alt={`QR code for ${product?.collection_name || "collection"}`}
                        className="h-14 w-14 object-contain"
                        loading="lazy"
                      />
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
          <div
            className={`relative hidden max-h-[calc(800px-2.5rem)] p-1 gap-5 overflow-auto md:grid ${
              isNeeladriStore ? "grid-cols-3" : "grid-cols-4"
            }`}
          >
            {desktopColumns.map((columnProducts, columnIndex) => (
              <div className="flex min-w-0 flex-col gap-[22px]" key={columnIndex}>
                {columnProducts.map((product, productIndex) => (
                  
                  <button
                    type="button"
                    className={`group flex cursor-pointer flex-col overflow-hidden rounded-[16px] border-[6px] border-[#eeeeee] bg-kiosk-support text-left shadow-[0_3px_8px_rgba(0,0,0,0.12)] transition-transform duration-300 ease-out active:scale-[0.99] ${tileStyles[columnIndex][productIndex % tileStyles[columnIndex].length]}`}
                    key={product.collection_id}
                    onClick={() => handleNavCollection(product)}
                  >
                    
                    <div className="relative min-h-0 w-full flex-1 overflow-hidden rounded-t-[10px] bg-[#ead8bd]">
                      {product.cover_image && (
                        <img
                          src={product.cover_image}
                          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.035]"
                          alt={product.collection_name || product.cover_image}
                          loading="lazy"
                        />
                      )}
                    </div>
                     <p className="max-w-full  pt-3 px-2 truncate whitespace-nowrap text-[18px] font-semibold leading-tight text-[#1d2345]">
                          {product.collection_name || "Untitled collection"}
                        </p>
                        {storeData?.store_name === 'giva_neeladri_hs'&&
                    <div className="grid min-h-[98px] shrink-0 grid-cols-[minmax(0,1fr)_auto] items-start gap-2 bg-kiosk-support px-3">
                      {/* <div className="min-w-0">
                       
                        <div className="mt-3 flex items-center gap-2 text-kiosk-primary">
                          <span className="inline-block h-5 w-3 rounded-sm border-2 border-current" />
                          <span className="text-sm font-semibold ">
                            Scan to view
                          </span>
                        </div>
                      </div> */}
                      {collectionQrUrls[product?.path]?.qrUrl && (
                        <div className="rounded  m-auto">
                          <img
                            src={collectionQrUrls[product.path].qrUrl}
                            alt={`QR code for ${product?.collection_name || "collection"}`}
                            className="h-20 w-20 object-contain"
                            loading="lazy"
                          />
                        </div>
                      )}
                    </div>
}
                  </button>
                  // console.log('dfdf',collectionQrUrls[product.path])
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
      <KioskPromoSection showTags={Tags} storeData={storeData} />
    </div>
  );
};

export default BannerKisok;
