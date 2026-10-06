import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getInfluencerCollection } from "../../pageComponents/Influencer/redux/actions";
import ProductCard from "../ProductCard";
import {
  filterAvailableProductList,
  filterProductListBySelectedTags,
} from "../../helper/utils";

import Cookies from "js-cookie";
import profilebanner from "../../images/package.jpg";
import { Spin } from "antd";
import ShareOptions from "../../pageComponents/shared/shareOptions";
import share_icon from "../../images/profilePage/share_icon.svg";
import {
  collectionQRCodeGenerator,
  getBlogCollectionPagePath,
  getProductDetailsPagePath,
} from "../../helper/utils";
import { buildKioskAutoLoginUrls } from "../../helper/autoLogin";
import useKioskSessionReminder, {
  KioskSessionPopup,
} from "./useKioskSessionReminder";
import GuestUserPopUp from "../../pageComponents/Auth/GuestUserPopUp";
import { GuestPopUpShow } from "../../pageComponents/Auth/redux/actions";
import LoggedInInfo from "./components/LoggedInInfo";
import { loggedInInfo } from "../../pageComponents/Auth/redux/selector";
import { useNavigate } from "../../helper/useNavigate";
import AuthInput from "./components/AuthInput";
import { addToCart } from "../../pageComponents/DeliveryDetails/redux/action";
import { current_store_name, is_kiosk } from "../../constants/config";
import GoBack from "../common/GoBack";
import {
  gTagKioskCollectionView,
  gTagKioskProductClick,
} from "../../helper/webTracker/gtag";

const CollectionPage = ({ params }) => {
  // console.log(params);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isTagsShowMoreActive, setIsTagsShowMoreActive] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedTags, setSelectedTags] = useState([]);
  const [onMfrCode, setOnMfrCode] = useState(null);
  // console.log("onMfrCode",onMfrCode);
  const requestedCollectionPath = params?.collection_name;

  const singleCollectionKiosk = useSelector(
    (state) => state.influencer.collections.cache?.[requestedCollectionPath],
  ); // Update based on your Redux store structure
  // console.log('singleCollectionKiosk',singleCollectionKiosk);
  
  const currentCollection =
    singleCollectionKiosk?.path === requestedCollectionPath
      ? singleCollectionKiosk
      : null;
  const [isUserLogin, storeData, isGuestPopUpShow, kioskLogin] = useSelector((state) => [
    state.auth.user.isUserLogin,
    state.store.data,
    state.GuestPopUpReducer.isGuestPopUpShow,
    state.kiosk.login,
  ]);
 
  const handleTagClick = useCallback((value) => {
    setActiveCategory(value);
    setSelectedTags(value === "All" ? [] : [value]);
  }, []);

  const productsData = useMemo(() => {
    if (!currentCollection?.product_lists) return [];

    let list = filterAvailableProductList(currentCollection.product_lists);

    if (selectedTags.length) {
      list = filterProductListBySelectedTags(
        list,
        selectedTags,
        currentCollection.tag_map,
      );
    }

    return list;
  }, [
    currentCollection?.product_lists,
    currentCollection?.tag_map,
    selectedTags,
  ]);
  // console.log('productsData',useSelector(userInfo));
useEffect(() => {
  const savedScroll = sessionStorage.getItem("plp-scroll");
  const savedCollection = sessionStorage.getItem("plp-collection");

  if (
    savedScroll &&
    savedCollection === currentCollection?.path &&
    productsData.length > 0
  ) {
    requestAnimationFrame(() => {
      window.scrollTo(0, Number(savedScroll));
    });
  } else {
    sessionStorage.removeItem("plp-scroll");
    sessionStorage.removeItem("plp-collection");
  }
}, [currentCollection?.path, productsData]);




  const [showShareProductDetails, setShowShareProductDetails] = useState(false);
  const [sharePageUrl, setSharePageUrl] = useState("");

  const [qrUrl, setQrUrl] = useState("");
  const [shareContext, setShareContext] = useState("collection");
  // console.log("sharePageUrl", sharePageUrl);
  const [isPopupShow, setIsPopupShow] = useState(false);
  const [pendingGuestAction, setPendingGuestAction] = useState(null);
  

  const collectionPagePath = useMemo(() => {
    if (!currentCollection) return "";
    try {
      return getBlogCollectionPagePath(
        currentCollection.user_name,
        currentCollection.path,
        currentCollection._id,
        currentCollection.user_id,
        currentCollection.status,
        currentCollection.hosted_stores,
        currentCollection.collection_theme,
      );
    } catch (e) {
      return "";
    }
  }, [currentCollection]);

  const qrCodeGeneratorURL = useMemo(() => {
    if (!collectionPagePath) return "";
    return collectionQRCodeGenerator(collectionPagePath);
  }, [collectionPagePath]);

  useEffect(() => {
    setQrUrl(qrCodeGeneratorURL);
  }, [qrCodeGeneratorURL]);

  // this page is a collection page
  const fromCollection = true;

  // console.log("singleCollectionKiosk", singleCollectionKiosk.product_lists);
  const tagsToShow = useMemo(() => {
    const allTag = ["All"];
    const allTags = currentCollection?.tags
      ? allTag.concat(currentCollection.tags)
      : allTag;
    return isTagsShowMoreActive ? allTags : allTags;
  }, [currentCollection?.tags, isTagsShowMoreActive]);

  useEffect(() => {
    setActiveCategory("All");
    setSelectedTags([]);
    setShowShareProductDetails(false);
    setSharePageUrl("");
    setQrUrl("");
    setShareContext("collection");
    if(!requestedCollectionPath) return 
    if (!singleCollectionKiosk) {
      dispatch(
        getInfluencerCollection({
          // collection_id: params.collection_name,
          path: requestedCollectionPath,
          store: current_store_name,
          cache: true,
          isStoreHomePage: false,
          product_sort_by: undefined,
          product_sort_order: undefined,
        }),
      );
    }
  }, [requestedCollectionPath, singleCollectionKiosk,dispatch]);

  useEffect(() => {
    if (!currentCollection?._id && !currentCollection?.collection_id) return;

    gTagKioskCollectionView({
      collection: currentCollection,
      tab_name: sessionStorage.getItem("selectedTag") || "",
    });
  }, [currentCollection]);

  //   console.log('colleztctionData',singleCollectionKiosk);
  const handleGuestPopupOpen = useCallback((action) => {
  if (action === "") {
    setPendingGuestAction(null);
    setOnMfrCode(null);
    return;
  }

  if (action?.product) {
    setOnMfrCode(action.product);
  }

  setPendingGuestAction(action || null);
  setIsPopupShow(true);
}, []);

  const productCardKiosk = (productdata,i) => {
    // console.log(productdata);
    return (
      <ProductCard
        product={productdata}
        isPriority={i < 2}
        onProductClick={() =>
          gTagKioskProductClick({
            product: productdata,
            collection: currentCollection,
            tab_name: sessionStorage.getItem("selectedTag") || "",
            source: "kiosk_collection_page",
          })
        }
        bannerImage
        enableKioskGuestPopup
        onGuestPopupOpen={handleGuestPopupOpen}
        onKioskTryonClick={buildVtoProductAutoLoginUrls}
        // onKioskCartClick={buildCartAutoLoginUrls}
        setOnMfrCode={setOnMfrCode}
      />
    );
  };
  const getProductKey = (product, index) => {
    const productId =
      product?._id || product?.product_id || product?.mfr_code || product?.id;

    return productId ? `${productId}-${index}` : `product-${index}`;
  };
  // const DummyImg =
  //   "https://cdn.unthink.ai/img/unthink_ai/DALL%C2%B7E%202024-11-22%2013.19.32%20-%20A%20stylish%20banner%20image%20for%20a%20website%20named%20%27dothelook%2C%27%20designed%20to%20reflect%20themes%20of%20both%20fashion%20and%20home%20products.%20The%20banner%20features%20a%20gradient%20b_giwegha.webp";
  const getCollectionAutoLoginUrls = useCallback(
    ({ userId = null, email = null, phone = null } = {}) =>
      buildKioskAutoLoginUrls({
        targetPath: collectionPagePath,
        pageParam:
          `?page=collections/${currentCollection?.path || ""}`.replace(
            /\/+/,
            "/",
          ),
        fallbackQrUrl: qrCodeGeneratorURL,
        errorLabel: "collection auto-login",
        kioskLogin,
        userId,
        email,
        phone,
      }),
    [
      collectionPagePath,
      qrCodeGeneratorURL,
      currentCollection?.path,
      kioskLogin,
    ],
  );

  useEffect(() => {
    let mounted = true;

    const makeUrls = async () => {
      const urls = await getCollectionAutoLoginUrls();

      if (mounted && urls) {
        setSharePageUrl(urls.shareUrl);
        setQrUrl(urls.qrUrl);
        setShareContext("collection");
      }
    };

    makeUrls();

    return () => {
      mounted = false;
    };
  }, [getCollectionAutoLoginUrls]);

  const openShareOptions = useCallback(async () => {
    if (showShareProductDetails && shareContext === "collection") {
      setShowShareProductDetails(false);
      return;
    }

    const urls = await getCollectionAutoLoginUrls();

    if (urls) {
      setSharePageUrl(urls.shareUrl);
      setQrUrl(urls.qrUrl);
      setShareContext("collection");
    }

    setShowShareProductDetails(true);
  }, [getCollectionAutoLoginUrls, shareContext, showShareProductDetails]);

  const handleShareClick = useCallback(() => {
    if (isUserLogin && !kioskLogin?.user_id) {
      setShowShareProductDetails(false);
      setPendingGuestAction({ type: "share" });
      setIsPopupShow(true);
      dispatch(GuestPopUpShow(true));
      return;
    }

    openShareOptions();
  }, [dispatch, isUserLogin, kioskLogin?.user_id, openShareOptions]);

  const buildVtoProductAutoLoginUrls = useCallback(
    async (productOrMfrCode, { email = null, phone = null } = {}) => {
      const productMfrCode =
        typeof productOrMfrCode === "string"
          ? productOrMfrCode
          : productOrMfrCode?.mfr_code;

      if (productOrMfrCode && typeof productOrMfrCode === "object") {
        setOnMfrCode(productOrMfrCode);
      }

      if (!productMfrCode) return;

      const productDetailsPagePath = getProductDetailsPagePath(productMfrCode);
      const urls = await buildKioskAutoLoginUrls({
        targetPath: productDetailsPagePath,
        pageParam: `?page=product/${productMfrCode}`,
        errorLabel: "product auto-login",
        kioskLogin,
        email,
        phone,
      });

      if (urls) {
        setSharePageUrl(urls.shareUrl);
        setQrUrl(urls.qrUrl);
        setShareContext("product");
        setShowShareProductDetails(true);
      }
    },
    [kioskLogin],
  );

 

  if (!currentCollection) {
    return (
      <div className="min-h-screen flex mt-3 justify-center">
        <Spin size="large" className="pink-spinner" />
      </div>
    );
  }
  return (
    <div className="p-8 pt-6 md:p-12 bg-white min-h-screen">
      <div
        className="sticky w-full top-0 py-2  bg-white
       z-20 "
      >
        <div className="flex items-start mb-2 ">
         <GoBack />
          <AuthInput styles={"mb-0 w-fit"} />
        </div>
      </div>

        {/* Header */}
        <div className="mb-3  flex justify-between items-start">
          {/* <p className="text-gray-400 text-sm lg:text-base font-semibold tracking-widest mb-3">
          JEWEL GENIE
        </p> */}
          <div>
            <h1 className="h1-kiosk font-bold text-black mb-0 lg:mb-2">
              {currentCollection.collection_name}
            </h1>

            <p className="text-gray-500 text-base lg:mb-0 mb-2">
              {currentCollection?.product_lists?.length} pieces
            </p>
          </div>
          <div className="relative flex flex-col gap-3  items-end  ">
            {showShareProductDetails && (
              <ShareOptions
                url={sharePageUrl}
                setShow={(show) => {
                  setShowShareProductDetails(show);
                  if (!show) {
                    setOnMfrCode(null);
                  }
                }}
                onClose={() => {
                  setShowShareProductDetails(false);
                  setOnMfrCode(null);
                }}
                isOpen={showShareProductDetails}
                qrCodeGeneratorURL={qrUrl}
                collection={currentCollection}
                fromCollection={fromCollection}
                kioskHeader={
                  shareContext === "collection"
                    ? " "
                    : shareContext === "cart"
                      ? "Scan to open your cart on mobile"
                      : "Scan to Try On  (Then tap the camera icon on your phone)"
                }
                subHeaderText={
                  shareContext === "collection"
                    ? currentCollection?.collection_name
                    : onMfrCode?.name
                }
                removeheaderColleciton
              />
            )}
            {/* {sharePageUrl && ( */}
            <button
              className="flex h-8 lg:h-10 w-8 lg:w-10  items-center justify-center rounded-full border border-[#e0d9ff] bg-white hover:bg-[#f2eeff]"
              onClick={handleShareClick}
            >
              <img
                className="cursor-pointer lg:h-6 lg:w-6 h-5 w-5"
                src={share_icon}
                alt="Share"
              />
            </button>
            {/* )} */}
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-1.5 md:gap-2 lg:gap-3 mb-5  flex-wrap">
          {tagsToShow.map((tag, i) => (
            <button
              key={i}
              onClick={() => handleTagClick(tag)}
              className={`${
                activeCategory === tag
                  ? "bg-black text-white"
                  : "bg-kiosk-gray text-gray-600 "
              } lg:px-5 px-3 py-2 lg:py-3 rounded-full font-semibold text-[12px] lg:text-sm transition duration-200`}
            >
              {tag}
            </button>
          ))}
        </div>

      {/* Product Grid Placeholder */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-6">
        {productsData?.map((item, index) => (
          <div
            key={getProductKey(item, index)}
            className=" rounded-lg  flex items-center justify-center"
          >
            {productCardKiosk(item,index)}
          </div>
        ))}
      </div>

      <GuestUserPopUp
        isOpen={isPopupShow || isGuestPopUpShow}
        setIsOpen={setIsPopupShow}
        storeName={storeData?.store_name || currentCollection?.store_name}
        persistKioskLogin
        onSuccess={async ({ userId, email, phone }) => {
          if (pendingGuestAction?.type === "cart" && userId) {
            const cartProduct = pendingGuestAction.product;

            if (cartProduct?.mfr_code) {
              dispatch(
                addToCart({
                  is_display_amount: true,
                  products: [
                    {
                      mfr_code: cartProduct.mfr_code,
                      tagged_by: cartProduct.tagged_by || [],
                      qty: Number(pendingGuestAction.qty) || 1,
                    },
                  ],
                  product_lists: [],
                  collection_name: "my cart",
                  type: "system",
                  user_id: userId,
                  path: `my_cart_${userId}`,
                }),
              );
            }
          }

          const vtoMfrCode =
            pendingGuestAction?.type === "vto"
              ? pendingGuestAction.mfrCode
              : !pendingGuestAction && onMfrCode;

          if (vtoMfrCode) {
            await buildVtoProductAutoLoginUrls(vtoMfrCode, { email, phone });
          } else if (
            pendingGuestAction?.type === "share" ||
            (!pendingGuestAction && isPopupShow)
          ) {
            const urls = await getCollectionAutoLoginUrls({
              userId,
              email,
              phone,
            });

            if (urls) {
              setSharePageUrl(urls.shareUrl);
              setQrUrl(urls.qrUrl);
              setShareContext("collection");
            }
            setShowShareProductDetails(true);
          }
          setPendingGuestAction(null);
        }}
        onSkip={() => setPendingGuestAction(null)}
      />
     
    </div>
  );
};

export default CollectionPage;
