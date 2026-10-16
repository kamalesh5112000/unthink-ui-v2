import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";
import { handleRecProductClick } from "../recommendations/redux/actions";
import {
  getUserInfo,
  GuestPopUpShow,
} from "../Auth/redux/actions";
import {
  collectionQRCodeGenerator,
  filterAvailableProductList,
  filterProductListBySelectedTags,
  getBlogCollectionPagePath,
  getCurrentPath,
  getEditCollectionPagePath,
  setCookie,
  getTTid,
} from "../../helper/utils";
import {
  COLLECTION_COVER_IMG_SIZE_900_900,
  COOKIE_TT_ID,
  SIGN_IN_EXPIRE_DAYS,
} from "../../constants/codes";
import { addToWishlist } from "../wishlistActions/addToWishlist/redux/actions";
import { current_store_name, super_admin } from "../../constants/config";
import {
  openWishlistModal,
  setProductsToAddInWishlist,
  setSelectedCollectionPayload,
} from "../wishlist/redux/actions";
import { authAPIs, profileAPIs } from "../../helper/serverAPIs";
import Cookies from "js-cookie";
import SingleCollectionProductListView from "./components/SingleCollectionProductListView";
import { updateWishlist } from "../wishlistActions/updateWishlist/redux/actions";
import { notification } from "antd";
import CropAndResizeImageModal from "../cropAndResizeImageModal/CropAndResizeImageModal";
import { dispatchSelectedProductsAction } from "../shared/selectedProductsActions";

const tagsMinSizeForShowMore = 5;

   function sharepageUrls (pageUser,blogCollectionPage){
      return  getBlogCollectionPagePath(
        pageUser?.user_name,
        blogCollectionPage?.path,
        blogCollectionPage?._id,
        pageUser?.user_id,
        blogCollectionPage?.status,
        blogCollectionPage?.hosted_stores,
        blogCollectionPage?.collection_theme,
      )
}
 

const SingleCollectionProductList = ({
  blogCollectionPage = {},
  enableClickTracking = false,
  pageUser,
  authUser,
  isUserLogin,
  showCollectionDetails = false,
  productCountToShow,
  isPageLoading,
  showTagsSelection = false, // show tags above products and alow select and filter
  enableSelectTags = false, // allow to select tags to view the related products
  showCoverImage = true, // flag to show the cover image as first tile if available
  showAuraTile = false, // flag to show an extra last tile at the end with ask aura
  isSingleCollectionSharedPage = false,
  showUserImage = false,
  user_name,
  profile_image,
  selectedSortOption,
  handleSortOptionChange,
  sharePageUrl = `${window.location.host}${ sharepageUrls(pageUser,blogCollectionPage)} `,
  isRootPage = true,
  isMyProfilePage,
  storeData
}) => {
   const [cropAndResizeImageData, setCropAndResizeImageData] = useState({
     isOpen: false,
     selectedImage: "",
   });
   console.log('showCollectionDetails',showCollectionDetails);
   console.log('blogCollectionPage',blogCollectionPage);
   


const url = window.location.pathname === '/my-profile/'
 

  const router = useRouter();
  const [statedata, setStatedata] = useState(null);
 

  const dispatch = useDispatch();
  const navigate = useCallback((path) => router.push(path), [router]);


  const [isGuestPopUpShow, singleCollection, influencerCollections,influencer] =
    useSelector((state) => [
      state.GuestPopUpReducer.isGuestPopUpShow,
      state.auth.user.singleCollections.data,
      state.auth.user.data,
       state.influencer.collections.data,
    ]);
    console.log('singleCollection',singleCollection);
    
  const [showShareCollection, setShowShareCollection] = useState(false);


 

  useEffect(() => {
    if (singleCollection) {
      setStatedata(singleCollection);
    }
  }, []);
  const collectionId = singleCollection?._id ?? null;

  // Dispatch getSingleUserCollection when collectionId is available

  const [selectedTags, setSelectedTags] = useState([]);
  const initializedFor = useRef(null);
  const shouldRedirectWhenProductsEmpty = useRef(false);

  const tagsShowMoreEnabled = useMemo(
    () =>
      !!(
        blogCollectionPage.tags &&
        blogCollectionPage.tags.length > tagsMinSizeForShowMore
      ),
    [blogCollectionPage.tags],
  );
  const [isTagsShowMoreActive, setIsTagsShowMoreActive] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [enableSelectProduct, setEnableSelectProduct] = useState(false);

  const tagsToShow = useMemo(() => {
    const allTag = ["All"];
    const allTags = singleCollection.tags
      ? allTag.concat(singleCollection.tags)
      : allTag;
    return isTagsShowMoreActive ? allTags : allTags;
  }, [singleCollection.tags, isTagsShowMoreActive]);

  const sponsorProductList = useMemo(
    () =>
      (singleCollection.sponsor_details?.product_list || []).map((p) => {
        p.sponsored = true;
        return p;
      }),
    [blogCollectionPage.sponsor_details],
  );

  const [expanded, setExpanded] = useState(false);
  const [showMoreEnabled, setShowMoreEnabled] = useState(false);

  const textRef = useRef(null);
  const detailsRowRef = useRef(null);
  const [mobileStickyTop, setMobileStickyTop] = useState(0);
  const [mobileDetailsHeight, setMobileDetailsHeight] = useState(0);
  const [mobileCoverHeight, setMobileCoverHeight] = useState(0);
  const productsData = useMemo(() => {
    const baseList = isSingleCollectionSharedPage
      ? singleCollection?.product_lists ||
      blogCollectionPage?.product_lists ||
      []
      : blogCollectionPage?.product_lists ||
      singleCollection?.product_lists ||
      [];

    let list = filterAvailableProductList(baseList);

    if (selectedTags.length) {
      list = filterProductListBySelectedTags(
        list,
        selectedTags,
        singleCollection.tag_map,
      );
    }
    list = sponsorProductList.concat(list);

    return productCountToShow ? list.slice(0, productCountToShow) : list;
  }, [
    singleCollection.product_lists,
    singleCollection.tag_map,
    selectedTags,
    sponsorProductList,
  ]);
  useEffect(() => {
    const checkTextOverflow = () => {
      if (!expanded) {
        const el = textRef.current;
        if (el) {
          setShowMoreEnabled(el.scrollHeight > el.clientHeight);
        }
      }
    };

    const timeoutId = setTimeout(checkTextOverflow, 100);
    window.addEventListener("resize", checkTextOverflow);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", checkTextOverflow);
    };
  }, [blogCollectionPage?.description, expanded, productsData]);

  useEffect(() => {
    const updateMobileStickyMetrics = () => {
      if (typeof window === "undefined") return;

      if (window.innerWidth > 760) {
        setMobileStickyTop(0);
        setMobileDetailsHeight(0);
        setMobileCoverHeight(0);
        return;
      }

      const mobileHeader = document.querySelector(
        '[data-store-mobile-sticky-header="true"]',
      );

      setMobileStickyTop(
        mobileHeader
          ? Math.ceil(mobileHeader.getBoundingClientRect().height)
          : 0,
      );

      setMobileDetailsHeight(
        detailsRowRef.current
          ? Math.ceil(detailsRowRef.current.getBoundingClientRect().height)
          : 0,
      );

      setMobileCoverHeight(
        videoContainerRef.current
          ? Math.ceil(videoContainerRef.current.getBoundingClientRect().height) - 2
          : 0,
      );
    };

    updateMobileStickyMetrics();
    const timeoutId = setTimeout(updateMobileStickyMetrics, 300);
    const rafId = window.requestAnimationFrame(updateMobileStickyMetrics);

    window.addEventListener("resize", updateMobileStickyMetrics);
    window.addEventListener("orientationchange", updateMobileStickyMetrics);

    return () => {
      clearTimeout(timeoutId);
      window.cancelAnimationFrame(rafId);
      window.removeEventListener("resize", updateMobileStickyMetrics);
      window.removeEventListener("orientationchange", updateMobileStickyMetrics);
    };
  }, [
    blogCollectionPage?.description,
    blogCollectionPage?.collection_name,
    showCollectionDetails,
    expanded,
    productsData.length,
    showCoverImage,
  ]);
  // console.log('popopop',el.scrollHeight);
  // console.log('dfdfdfd',el.clientHeight);







  const showcasedProductsData = useMemo(
    () =>
      isSingleCollectionSharedPage ? productsData.filter((p) => p.starred) : [],
    [isSingleCollectionSharedPage, productsData],
  );

  const autoProductsData = useMemo(() => {
    return isSingleCollectionSharedPage
      ? productsData.filter((p) => !p.starred)
      : [];
  }, [isSingleCollectionSharedPage, productsData]);

  // console.log("isSingleCollectionSharedPage", isSingleCollectionSharedPage);
  const [activeTab, setActiveTab] = useState("products"); // default = Products tab

  useEffect(() => {
    if (autoProductsData.length === 0) {
      setActiveTab("faq");
    } else {
      setActiveTab("products");
    }
  }, [autoProductsData]);

  // checking selected tag's products is all selected or not
  const isTagProductsAllSelected = useMemo(() => {
    if (productsData) {
      return productsData.every((item) =>
        selectedProducts?.includes(item.mfr_code),
      );
    }
  }, [productsData, selectedProducts]);

  // checking selected tag products is minimum one selected or not
  const isTagProductSelected = useMemo(() => {
    if (productsData) {
      return productsData.some((item) =>
        selectedProducts.includes(item.mfr_code),
      );
    }

    return false;
  }, [productsData, selectedProducts]);

  const handleResetSelectProduct = useCallback(
    // reset select product feature // unselect every products
    ({ redirectIfEmpty = false } = {}) => {
      console.log('Hello world');
      
      setEnableSelectProduct(false);
      setSelectedProducts([]);
      shouldRedirectWhenProductsEmpty.current = redirectIfEmpty;
     
    },
    [],
  );

  useEffect(() => {
    if (!shouldRedirectWhenProductsEmpty.current) return;

    const productLists = isSingleCollectionSharedPage
      ? singleCollection?.product_lists || blogCollectionPage?.product_lists
      : blogCollectionPage?.product_lists || singleCollection?.product_lists;

    if (!Array.isArray(productLists)) return;
    if (productLists.length > 0) return;

    shouldRedirectWhenProductsEmpty.current = false;
    router.replace("/");
  }, [
    blogCollectionPage?.product_lists,
    isSingleCollectionSharedPage,
    router,
    singleCollection?.product_lists,
  ]);

  const handleSetSelectedProducts = useCallback(
    ({ add = [], remove = [] }) => {
      const products = selectedProducts;
      const allProducts = singleCollection?.product_lists?.map(
        (p) => p.mfr_code,
      ) || []; // all Products

      products.push(...add); //add products

      const filteredRemoveProducts = products.filter(
        (p) => !remove.includes(p),
      ); // remove products

      const uniqueSelectedProducts = filteredRemoveProducts.filter(
        (p, index) => filteredRemoveProducts.indexOf(p) === index,
      ); // removing duplicate products

      setSelectedProducts(
        uniqueSelectedProducts.filter((p) => allProducts.includes(p)), // remove products which is not available in allProductsList and set selectedProducts
      );
    },
    [selectedProducts, singleCollection],
  );

  // removing products from selectedProducts if remove suggestion tag data
  useEffect(() => {
    if (selectedProducts) {
      handleSetSelectedProducts({});
    }
  }, [singleCollection]);

  const onSelectProductClick = (mfr_code) => {
    if (isSingleCollectionSharedPage || !showCollectionDetails) {
      setEnableSelectProduct(true);
    }
    if (selectedProducts.includes(mfr_code)) {
      handleSetSelectedProducts({ remove: [mfr_code] });
    } else {
      handleSetSelectedProducts({ add: [mfr_code] });
    }
  };

  const onSelectAllChange = () => {
    let productsToShow = productsData.map((p) => p.mfr_code);

    if (isTagProductsAllSelected) {
      handleSetSelectedProducts({ remove: productsToShow });
    } else {
      handleSetSelectedProducts({ add: productsToShow });
    }
    // setSelectedProducts(
    // 	selectedProducts.length < chatProductsDataToShow.length
    // 		? chatProductsDataToShow.map((i) => i.mfr_code)
    // 		: []
    // );
  };

  const [isPopupShow, setIsPopupShow] = useState(false);
  const [pendingProductsToAdd, setPendingProductsToAdd] = useState([]);
  const [pendingAddOptions, setPendingAddOptions] = useState({});

  // console.log("isPopupShow", isPopupShow);

  const resolveProductsToAdd = useCallback(
    (product) => {
      const sourceProducts =
        singleCollection?.product_lists || blogCollectionPage?.product_lists || [];
      const selectedMfrCodes = selectedProducts?.length
        ? selectedProducts
        : product?.mfr_code
          ? [product.mfr_code]
          : [];
      const selectedFromSource = sourceProducts.filter((p) =>
        selectedMfrCodes.includes(p.mfr_code),
      );

      if (selectedFromSource.length) return selectedFromSource;
      if (product?.mfr_code) return [product];
      return [];
    },
    [
      blogCollectionPage?.product_lists,
      selectedProducts,
      singleCollection?.product_lists,
    ],
  );

  const onAddSelectedProductsToCollection =useCallback( async (e, product, options = {}) => {
    e?.stopPropagation();
    const productsToAdd = resolveProductsToAdd(product);
    const isUserLoginCokkies = Cookies.get("isGuestLoggedIn") === "true";
    // const isGuestUserSkip = Cookies.get('isGuestSkip') === 'true';
    if (!isUserLogin && !isUserLoginCokkies) {
      setPendingProductsToAdd(productsToAdd);
      setPendingAddOptions(options);
      setIsPopupShow(true);
      dispatch(GuestPopUpShow(true));
      return;
    }

    const finalProductsToAdd = productsToAdd.length
      ? productsToAdd
      : pendingProductsToAdd;

    if (!finalProductsToAdd.length) return;

    const finalOptions = {
      ...pendingAddOptions,
      ...options,
    };

    const actionUserId = finalOptions.context?.userId || authUser?.user_id || getTTid();

    const isHandledSelectedProductsAction = dispatchSelectedProductsAction({
      action: finalOptions.action,
      dispatch,
      products: finalProductsToAdd,
      selectedProducts,
      userId: actionUserId,
      source: "COLLECTION",
      collection: {
        id: blogCollectionPage?._id,
        name: blogCollectionPage?.collection_name,
        path: blogCollectionPage?.path,
      },
      store_name: storeData?.store_name || current_store_name,
      collectionId: singleCollection?._id || blogCollectionPage?._id,
      onComplete: () =>
        handleResetSelectProduct({
          redirectIfEmpty: finalOptions.action === "Delete",
        }),
    });

    if (isHandledSelectedProductsAction) {
      return;
    }

    if (finalOptions.addToHandpickedWishlist) {
      await finalOptions.addToHandpickedWishlist(finalOptions.context);
    } else {
      dispatch(openWishlistModal());
    }
    dispatch(setProductsToAddInWishlist(finalProductsToAdd));
    const payload = {
      tags: blogCollectionPage?.tags || [],
      tag_map: blogCollectionPage?.tag_map || {},
      keyword_tag_map: blogCollectionPage?.keyword_tag_map || {},
    }
    dispatch(setSelectedCollectionPayload(payload));
    setPendingProductsToAdd([]);
    setPendingAddOptions({});
    if (isUserLoginCokkies) {
      // dispatch(setIsCreateWishlist(true));
    }
    handleResetSelectProduct();
  },[
 resolveProductsToAdd,
  isUserLogin,
  pendingProductsToAdd,
  dispatch,
  authUser?.user_id,
  selectedProducts,
  blogCollectionPage?._id,
  blogCollectionPage?.collection_name,
  blogCollectionPage?.path,
  blogCollectionPage?.tags,
  blogCollectionPage?.tag_map,
  blogCollectionPage?.keyword_tag_map,
  storeData?.store_name,
  current_store_name,
  singleCollection?._id,
  dispatchSelectedProductsAction,
  handleResetSelectProduct,
  getTTid,
  ])

  // guest email functions

  const [guestData, setGuestData] = useState({
    email: "",
    phone: "",
  });
  const [errors, setErrors] = useState({ email: "", phone: "" });

  const guestChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      setGuestData((data) => ({ ...data, [name]: value }));
      if (name === "email" || name === "phone") {
        setErrors((currentErrors) => ({
          ...currentErrors,
          email: "",
          phone: "",
        }));
      }
    },
    [],
  );

  const validateEmail = (email) => {
    // Basic email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleGuestSkip = () => {
    // Cookies.set('isGuestSkip', true, { expires: GUESTSKIP_EXPIRE_HOURS / 24 });
    dispatch(GuestPopUpShow(false));
    setIsPopupShow(false);
    setPendingProductsToAdd([]);
    setPendingAddOptions({});
  };

  const handleGuestSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      const email = guestData.email?.trim();
      const phone = guestData.phone?.trim();

      if (!email && !phone) {
        setErrors({ email: "Email or phone number is required", phone: "" });
        return;
      }

      if (email && !validateEmail(email)) {
        setErrors({ email: "Please enter a valid email address", phone: "" });
        return;
      }

      const tid = Cookies.get("tid");
      const store = current_store_name;

      // Set default value of isGuestLoggedIn to false if not already set
      if (!Cookies.get("isGuestLoggedIn")) {
        Cookies.set("isGuestLoggedIn", false, { expires: SIGN_IN_EXPIRE_DAYS });
      }

      if (email || phone) {
        try {
          const res = await authAPIs.GuestRegisterAPICall({
            emailId: email,
            // user_id: tid,
            store,
            phone,
          });

          const { data } = res;
          const user_id = data.data.user_id;

          if (res.data.status_code === 200) {
            dispatch(GuestPopUpShow(false));
            setCookie(COOKIE_TT_ID, user_id, SIGN_IN_EXPIRE_DAYS);
            dispatch(getUserInfo());
            Cookies.set("isGuestLoggedIn", true, {
              expires: SIGN_IN_EXPIRE_DAYS,
            });
            // Cookies.set('isGuestSkip', false, { expires: GUESTSKIP_EXPIRE_HOURS / 24 });
            setIsPopupShow(false);
            onAddSelectedProductsToCollection(null, null, {
              context: { userId: user_id },
            });
          }
        } catch (error) {
          console.log(error);
        }
      }
    },
    [guestData.email, guestData.phone, onAddSelectedProductsToCollection],
  );

  const onProductClick = (product) => {
    if (enableClickTracking) dispatch(handleRecProductClick());

    // GTAG CONFIGURATION
    // START
    // this is now added in product card
    // gTagCollectionProductClick({
    // 	_id: blogCollectionPage._id,
    // 	name: blogCollectionPage.name,
    // 	path: blogCollectionPage.path,
    // 	status: blogCollectionPage.status,
    // 	user_name: authUser.user_name,
    // 	user_id: authUser.user_id,
    // 	mft_code: product.mfr_code,
    // 	url: product.url,
    // });
    // END
  };

  const collectionPagePath = useMemo(
    () =>
      getBlogCollectionPagePath(
        pageUser?.user_name,
        blogCollectionPage?.path,
        blogCollectionPage?._id,
        pageUser?.user_id,
        blogCollectionPage?.status,
        blogCollectionPage?.hosted_stores,
        blogCollectionPage?.collection_theme,
      ),
    [
      pageUser?.user_name,
      blogCollectionPage?.path,
      blogCollectionPage?._id,
      pageUser?.user_id,
      blogCollectionPage?.status,
      blogCollectionPage?.hosted_stores,
      blogCollectionPage?.collection_theme,
    ],
  );

  const qrCodeGeneratorURL = useMemo(
    () => collectionQRCodeGenerator(collectionPagePath),
    [collectionPagePath],
  );

  const onSeeAllClick = useCallback(() => {
    if (collectionPagePath) {
      navigate(collectionPagePath);
    }
  }, [navigate, collectionPagePath]);

  const onClearSelectedTagsClick = useCallback(() => {
    handleResetSelectProduct();
    setSelectedTags([]);
  }, [handleResetSelectProduct]);

  // const handleTagsShowMoreToggle = useCallback(
  // 	() => setIsTagsShowMoreActive((value) => !value),
  // 	[]
  // );

  const handleTagClick = useCallback((value) => {
    // handleResetSelectProduct();
    // If "All" is selected, reset selectedTags to an empty array; otherwise, select only the clicked tag
    setSelectedTags(value === "All" ? [] : [value]);
  }, []);
 

  useEffect(() => {
    if (isRootPage) {
      setSelectedTags([]); // clears selected tags
    }
  }, [blogCollectionPage.tags]);

  const allowSelectTags = useMemo(
    () => enableSelectTags && singleCollection.restict_tag_click !== true, // restict_tag_click to avoid tag click
    [enableSelectTags, singleCollection.restict_tag_click],
  );

  const handleShowcaseCollectionProducts = useCallback(
    (
      products, // products format ['mft_code']
      starred, // not need to send this for un starring the products // sent true to star the products
    ) => {
      const productsWithDetails =
        singleCollection.product_lists?.filter((p) =>
          products.includes(p.mfr_code),
        ) || [];

      const productsToShowcase = productsWithDetails.map((pr) => ({
        mfr_code: pr.mfr_code,
        tagged_by: pr.tagged_by,
        starred, // to show case products
      }));

      const addToWishlistPayload = {
        _id: collectionIdToUpdate,
        products: productsToShowcase,
        fetchUserCollection: true, // fetch collection after success add to collection
        showcase: true, // flag to know it is showcase action
        // rerunApplyWishlistProductsFilter: true, // flag to re run the apply filter api again to update the latest filtered API if available
      };

      dispatch(addToWishlist(addToWishlistPayload));
    },
    [singleCollection.product_lists, singleCollection._id],
  );

  // desktop is hover videos run funtions

  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);

  const isSocialMediaVideo = (url) => {
    return (
      typeof url === "string" &&
      (url.includes("facebook.com") || url.includes("instagram.com"))
    );
  };

  // scroll for tags

  const swiperRef = useRef(null); // To store Swiper instance
  const [isOverflowing, setIsOverflowing] = useState(false);

  const checkOverflow = () => {
    if (swiperRef.current && swiperRef.current.wrapperEl) {
      const { scrollWidth, clientWidth } = swiperRef.current.wrapperEl;
      setIsOverflowing(scrollWidth > clientWidth);
    }
  };

  useEffect(() => {
    // Initial check
    checkOverflow();

    // Recheck on resize
    window.addEventListener("resize", checkOverflow);
    return () => {
      window.removeEventListener("resize", checkOverflow);
    };
  }, [tagsToShow]);

  // mobile videos auto play funtions

  const [isMobile, setIsMobile] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const videoContainerRef = useRef(null);

  // find if the user is on a mobile device
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 640);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Check if the video container is visible in the viewport
  useEffect(() => {
    const handleScroll = () => {
      if (videoContainerRef.current) {
        const rect = videoContainerRef.current.getBoundingClientRect();
        setIsVisible(rect.top >= 0 && rect.bottom <= window.innerHeight);
      }
    };

    handleScroll(); // Check on mount
    window.addEventListener("scroll", handleScroll); // Check on scroll

    return () => window.removeEventListener("scroll", handleScroll); // Cleanup
  }, []);

  // Step 1: Tag-wise product count create
  const productCountMap = tagsToShow.reduce((acc, tag) => {
    if (tag === "All") {
      acc[tag] = singleCollection?.product_lists?.length;
    } else {
      acc[tag] = singleCollection?.product_lists?.filter(
        (product) =>
          product.tagged_by?.some((t) => t.toLowerCase() === tag.toLowerCase()), // Case-insensitive check
      ).length;
    }
    return acc;
  }, {});

  // keywoard tagmap value filter function

  const keywordTagmap = useMemo(() => {
    if (!singleCollection?.keyword_tag_map) return {};

    if (selectedTags.length === 0) {
      return {};
    }

    const keywordMapKeys = Object.keys(singleCollection.keyword_tag_map);

    return selectedTags.reduce((acc, tag) => {
      // tag ku equivalent case-insensitive key find pannurathu
      const matchingKey = keywordMapKeys.find(
        (key) => key.toLowerCase() === tag.toLowerCase(),
      );

      if (matchingKey) {
        acc[matchingKey] = singleCollection.keyword_tag_map[matchingKey];
      }
      return acc;
    }, {});
  }, [selectedTags, singleCollection]);

  const firstKey = Object.keys(keywordTagmap)[0];
  const firstValue = firstKey ? keywordTagmap[firstKey] : {};

  const filteredFirstValue = { ...firstValue };
  if (filteredFirstValue.price) {
    delete filteredFirstValue.price;
  }

  // for scroll

  const swiperRef2 = useRef(null); // To store Swiper instance
  const [isOverflowing2, setIsOverflowing2] = useState(false);

  const checkOverflow2 = () => {
    if (swiperRef2.current && swiperRef2.current.wrapperEl) {
      const { scrollWidth, clientWidth } = swiperRef2.current.wrapperEl;
      setIsOverflowing2(scrollWidth > clientWidth);
    }
  };

  useEffect(() => {
    // Initial check
    checkOverflow2();

    // Recheck on resize
    window.addEventListener("resize", checkOverflow2);
    return () => {
      window.removeEventListener("resize", checkOverflow2);
    };
  }, [keywordTagmap]);

  // convert custom filter string to array
  const savedCustomFilter = useMemo(
    () =>
      filteredFirstValue.custom_filter
        ? filteredFirstValue.custom_filter?.split(",")
        : [],
    [filteredFirstValue.custom_filter],
  );

  const publish = singleCollection.status === "published";
  const userId = influencerCollections.user_id === singleCollection.user_id;

 

  useEffect(() => {
    if (singleCollection) return;
    if (singleCollection) return;
  }, [singleCollection]);

  // useEffect(() => {
  //   if (!singleCollection) return;
  //   const hasFaq = singleCollection?.faqs?.length > 0;
  //   const hasProducts = autoProductsData.length > 0;
  //   setActiveTab(hasFaq && hasProducts ? "products" : "faq");
  // }, []);
  // useEffect(() => {
  //   // wait until we have the collection and the products array (could be [] but defined)
  //   if (!singleCollection || autoProductsData === undefined) return;

  //   // if we've already initialized for this collection, do nothing
  //   if (collectionId && initializedFor.current === collectionId) return;

  //   const hasFaq = (singleCollection?.faqs?.length ?? 0) > 0;
  //   const hasProducts = (autoProductsData?.length ?? 0) > 0;

  //   // set default tab only once when collection changes
  //   setActiveTab(hasFaq && hasProducts ? "products" : "faq");

  //   // mark as initialized for this collection id
  //   if (collectionId) initializedFor.current = collectionId;
  // }, [singleCollection, autoProductsData, collectionId]);


  const [admin_list ] = useSelector((state) => [ state.store.data.admin_list ]);
        const Owner = authUser?.user_name === singleCollection?.user_name  
        const Adminlist =  authUser?.user_name === super_admin

  const isSystemEditableCollection = ["my wishlist", "my tryons"].includes(
    (blogCollectionPage?.collection_name || singleCollection?.collection_name || "").toLowerCase(),
  );
  const canEditSystemCollection =
    !!isUserLogin && isSystemEditableCollection && (Owner || Adminlist);

  const handleEditSystemCollection = useCallback(() => {
    const collectionId = blogCollectionPage?._id || singleCollection?._id;
    if (collectionId) {
      navigate(getEditCollectionPagePath(collectionId));
    }
  }, [blogCollectionPage?._id, navigate, singleCollection?._id]);
        // console.log('singleCollectionusername', authUser?.role);
        
  const handleUploadedDataChange = useCallback(
    (name, value) => {
      const editPayload = {
        _id: blogCollectionPage._id,
        [name]: value,
        fetchUserCollection: true,
      };




      dispatch(updateWishlist(editPayload));
      // setUpdatedData({ ...updatedData, [name]: value });
    },
    [blogCollectionPage._id]
  );
  // Handle file upload for cover image
  const handleCoverImageUpload = (info) => {
    if (info.file.status === "done") {
      const file = info.file.originFileObj;


      handleUploadedDataChange("cover_image", URL.createObjectURL(file));
    }
  };
  const uploadProps = useMemo(
    () => ({
      accept: "image/*",
      multiple: false,
      customRequest: async (info) => {
        if (info?.file) {
          const file = info.file;

          const reader = new FileReader();

          reader.onload = (e) => {
            const img = new window.Image();
            img.src = e.target.result;

            img.onload = () => {
              const width = img.width;
              const height = img.height;

              if (width < 600 || height < 600) {
                notification.error({
                  message: "Image must be at least 600 x 600 pixels",
                  //  description:
                  //    error?.response?.data?.message || "Unexpected error occurred",
                });
                return;
              }
              setCropAndResizeImageData({
                isOpen: true,
                selectedImage: e.target.result?.toString() || "",
                ImageFileName: file?.name,
              });
            };
          };

          reader.readAsDataURL(file);
        }
      },
    }),
    [handleUploadedDataChange],
  );
  // close crop and resize modal
  const onCropAndResizeImageModalClose = useCallback((setCompletedCrop) => {
    setCropAndResizeImageData({});
    setCompletedCrop(false);
  }, []);

  const onCropAndResizeImageModalSubmit = useCallback(
    async ({ blobData }) => {
      try {
        setCropAndResizeImageData({});
        // setIsUploading(true);
        if (blobData) {
          const response = await profileAPIs.uploadImage({
            file: blobData,
            custom_size: COLLECTION_COVER_IMG_SIZE_900_900,
          });
          if (response?.data?.data && response.data.data[0]) {
            handleUploadedDataChange("cover_image", response.data.data[0]?.url); // API call and updating local state with updated value
          }
        }
      } catch (error) {
        notification["error"]({
          message: "Failed to upload cover image",
        });
      } finally {
        // setIsUploading(false);
        setIsDragAndDropVisible(false);
      }
    },
    [handleUploadedDataChange],
  );
    const [isDragAndDropVisible, setIsDragAndDropVisible] = useState(
      !blogCollectionPage.cover_image && !blogCollectionPage.video_url,
    );

  return (
    <>
       <CropAndResizeImageModal
                      headerText="Crop and upload"
                      isOpen={cropAndResizeImageData?.isOpen}
                      onClose={onCropAndResizeImageModalClose}
                      onSubmit={onCropAndResizeImageModalSubmit}
                      aspect={1 / 1}
                      selectedImg={cropAndResizeImageData?.selectedImage}
                      ImageFileName={cropAndResizeImageData?.ImageFileName}
                    />

    <SingleCollectionProductListView
      singleCollection={singleCollection}
      autoProductsData={autoProductsData}
      isSingleCollectionSharedPage={isSingleCollectionSharedPage}
      userId={userId}
      publish={publish}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      blogCollectionPage={blogCollectionPage}
      showTagsSelection={showTagsSelection}
      tagsToShow={tagsToShow}
      swiperRef={swiperRef}
      isOverflowing={isOverflowing}
      productCountMap={productCountMap}
      selectedTags={selectedTags}
      allowSelectTags={allowSelectTags}
      handleTagClick={handleTagClick}
      filteredFirstValue={filteredFirstValue}
      savedCustomFilter={savedCustomFilter}
      swiperRef2={swiperRef2}
      isOverflowing2={isOverflowing2}
      productsData={productsData}
      enableSelectProduct={enableSelectProduct}
      isTagProductSelected={isTagProductSelected}
      isTagProductsAllSelected={isTagProductsAllSelected}
      onSelectAllChange={onSelectAllChange}
      selectedProducts={selectedProducts}
      onAddSelectedProductsToCollection={onAddSelectedProductsToCollection}
      handleResetSelectProduct={handleResetSelectProduct}
      setEnableSelectProduct={setEnableSelectProduct}
      selectedSortOption={selectedSortOption}
      handleSortOptionChange={handleSortOptionChange}
      showCollectionDetails={showCollectionDetails}
      mobileStickyTop={mobileStickyTop}
      mobileDetailsHeight={mobileDetailsHeight}
      mobileCoverHeight={mobileCoverHeight}
      detailsRowRef={detailsRowRef}
      showUserImage={showUserImage}
      profile_image={profile_image}
      user_name={user_name}
      onSeeAllClick={onSeeAllClick}
      showShareCollection={showShareCollection}
      setShowShareCollection={setShowShareCollection}
      sharePageUrl={sharePageUrl}
      qrCodeGeneratorURL={qrCodeGeneratorURL}
      collectionPagePath={collectionPagePath}
      textRef={textRef}
      expanded={expanded}
      setExpanded={setExpanded}
      showMoreEnabled={showMoreEnabled}
      showcasedProductsData={showcasedProductsData}
      showAuraTile={showAuraTile}
      isPopupShow={isPopupShow}
      isGuestPopUpShow={isGuestPopUpShow}
      handleGuestSubmit={handleGuestSubmit}
      errors={errors}
      handleGuestSkip={handleGuestSkip}
      guestChange={guestChange}
      guestData={guestData}
      setIsPopupShow={setIsPopupShow}
      showCoverImage={showCoverImage}
      videoContainerRef={videoContainerRef}
      isSocialMediaVideo={isSocialMediaVideo}
      handleMouseEnter={handleMouseEnter}
      handleMouseLeave={handleMouseLeave}
      isHovered={isHovered}
      isMobile={isMobile}
      isVisible={isVisible}
      url={url}
      onProductClick={onProductClick}
      enableClickTracking={enableClickTracking}
      authUser={authUser}
      pageUser={pageUser}
      handleShowcaseCollectionProducts={handleShowcaseCollectionProducts}
      isUserLogin={isUserLogin}
      onSelectProductClick={onSelectProductClick}
      uploadProps={uploadProps}
      Adminlist={Adminlist}
      Owner={Owner}
      handleCoverImageUpload={handleCoverImageUpload}
      canEditSystemCollection={canEditSystemCollection}
      onEditSystemCollection={handleEditSystemCollection}
    />
    </>

  );
};

export default SingleCollectionProductList;
