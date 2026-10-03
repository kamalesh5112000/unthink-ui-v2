import React, { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Checkbox, Tooltip, Upload, Spin } from "antd";
import { ReloadOutlined, ArrowUpOutlined, ArrowLeftOutlined, SearchOutlined, CloudUploadOutlined, HistoryOutlined, PlusOutlined, MessageOutlined, FormOutlined, CloseOutlined, Loading3QuartersOutlined, MenuOutlined, FolderOutlined, CheckSquareOutlined } from "@ant-design/icons";

import {
  openWishlistModal,
  setProductsToAddInWishlist,
} from "../wishlist/redux/actions";
import { handleRecProductClick } from "../recommendations/redux/actions";
import ProductCard from "../../components/ProductCard";
import AuraResponseProductsWithTags from "../auraResponseProductsWithTags/AuraResponseProductsWithTags";
import { filterAvailableProductList, isEmpty } from "../../helper/utils";
import { is_store_instance } from "../../constants/config";
import {
  CHAT_TYPES_KEYS,
  CHAT_TYPE_CHAT,
  CHAT_SEARCH_OPTION_ID,
  WISHLIST_TITLE,
} from "../../constants/codes";
import AuraResponseShopALook from "../auraResponseShopALook/AuraResponseShopALook";
import { setSuggestionsSelectedTag } from "../../hooks/chat/redux/actions";
import styles from "./ChatProducts.module.css";
import AuraInputBox from "./AuraInputBox";
import AuraSideNav from "./aura/components/AuraSideNav";
import AuraMainContent from "./aura/components/AuraMainContent";

const ChatProducts = ({
  enableClickFetchRec,
  enableClickTracking,
  trackCollectionData = {},
  chatTypeKey = CHAT_TYPE_CHAT,
  isBTNormalUserLoggedIn,
  isAuraChatPage,
  handleLoadMore,
  localChatMessage,
  shouldMoveInputBelowResults,
  inputRef,
  handleInputChange,
  handlePromptKeyDown,
  isFigmaUploadPanelOpen,
  handleFigmaUploadButtonClick,
  isShowSubmittedChatPreview,
  isShopALookOptionActive,
  handleSubmitChatInput,
  isShowFollowUpSearch,
  isSidExpired,
  isFollowUpQuery,
  handleFollowUpSearch,
  isShowTryAgain,
  showChatLoader,
  handleTryAgainClick,
  upload_icon,
  uploadImageProps,
  chatImagePreviewUrl,
  isUploadingImage,
  handleClearChatImage,
  handleGoBack,
  layoutMode,
  setLayoutMode,
  closeChatModal,
  onOpenSearchPopup,
  isMobile,
  mobileTab,
  followUpQuery,
  regenarateImage,
  handleRegenrateImage,
  handleChangeImageConfirm,
  isImageLoading,
  auraServerImage,
  onOpenMobileSidebar,
  registerSelectActions,
}) => {
  const {
    trackCollectionCampCode,
    trackCollectionId,
    trackCollectionName,
    trackCollectionICode,
  } = trackCollectionData;

  const [
    chatProductsData,
    widgetHeader,
    widgetImage,
    chatImageUrl,
    authUser,
    isUserLogin,
    suggestionsWithProducts,
    products,
    shopALookData,
    activeSearchOption,
    auraOverlayCoordinates,
    storeData,
    chatHistory,
  ] = useSelector((state) => [
    state.chatV2.chatProductsData || [],
    state.chatV2.widgetHeader,
    state.chatV2.widgetImage,
    state.chatV2[CHAT_TYPES_KEYS[chatTypeKey].chatImageUrl],
    state.auth.user.data,
    state.auth.user.isUserLogin,
    state.chatV2.suggestions,
    state.chatV2[CHAT_TYPES_KEYS[chatTypeKey].products],
    state.chatV2.shopALook,
    state.chatV2.activeSearchOption || {},
    state.chatV2.auraOverlayCoordinates,
    state.store.data,
    state.chatV2.chatHistory,
  ]);
  // console.log('chatHistory',chatHistory);

  const [enableSelectProduct, setEnableSelectProduct] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const containerRef = useRef(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  const [hasScrolledToProducts, setHasScrolledToProducts] = useState(false);
  const [isSwipeDrawerOpen, setIsSwipeDrawerOpen] = useState(false);

  // Touch gesture state variables for opening drawer
  const [touchStartX, setTouchStartX] = useState(null);
  const [touchEndX, setTouchEndX] = useState(null);

  const handleTouchStart = (e) => {
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStartX || !touchEndX) return;
    const diff = touchStartX - touchEndX;
    if (diff > 50) {
      setIsSwipeDrawerOpen(true);
    }
    setTouchStartX(null);
    setTouchEndX(null);
  };

  // Touch gesture state variables for closing drawer
  const [drawerTouchStartX, setDrawerTouchStartX] = useState(null);
  const [drawerTouchEndX, setDrawerTouchEndX] = useState(null);

  const handleDrawerTouchStart = (e) => {
    setDrawerTouchStartX(e.targetTouches[0].clientX);
  };

  const handleDrawerTouchMove = (e) => {
    setDrawerTouchEndX(e.targetTouches[0].clientX);
  };

  const handleDrawerTouchEnd = () => {
    if (!drawerTouchStartX || !drawerTouchEndX) return;
    const diff = drawerTouchEndX - drawerTouchStartX;
    if (diff > 50) {
      setIsSwipeDrawerOpen(false);
    }
    setDrawerTouchStartX(null);
    setDrawerTouchEndX(null);
  };

  // Expose setIsMobileSidebarOpen via the onOpenMobileSidebar prop reference
  useEffect(() => {
    if (onOpenMobileSidebar) {
      onOpenMobileSidebar.current = () => setIsMobileSidebarOpen(true);
    }
  }, [onOpenMobileSidebar]);

  useEffect(() => {
    const handleScroll = () => {
      let scrollYPos = 0;
      let parent = containerRef.current;
      while (parent) {
        const overflowY = window.getComputedStyle(parent).overflowY;
        if (overflowY === "auto" || overflowY === "scroll") {
          scrollYPos = parent.scrollTop;
          break;
        }
        parent = parent.parentElement;
      }
      
      if (scrollYPos === 0) {
        scrollYPos = window.scrollY || document.documentElement.scrollTop;
      }

      const descElement = document.getElementById("aura-description-section");
      
      let shouldShow = false;
      if (descElement && isMobile) {
        const descRect = descElement.getBoundingClientRect();
        if (descRect.bottom < 100) {
          shouldShow = true;
        }
      } else {
        if (scrollYPos > 150) {
          shouldShow = true;
        }
      }

      setShowScrollBtn(shouldShow);
      if (shouldShow && scrollYPos > 100) {
        setHasScrolledToProducts(true);
      }
    };

    const scrollContainers = [];
    let parent = containerRef.current;
    while (parent) {
      const overflowY = window.getComputedStyle(parent).overflowY;
      if (overflowY === "auto" || overflowY === "scroll") {
        scrollContainers.push(parent);
      }
      parent = parent.parentElement;
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    scrollContainers.forEach((container) => {
      container.addEventListener("scroll", handleScroll, { passive: true });
    });

    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      scrollContainers.forEach((container) => {
        container.removeEventListener("scroll", handleScroll);
      });
    };
  }, [isMobile]);

  const handleScrollToDescription = () => {
    const descElement = document.getElementById("aura-description-section");
    if (descElement) {
      let scrollContainer = null;
      let parent = descElement.parentElement;
      while (parent) {
        const overflowY = window.getComputedStyle(parent).overflowY;
        if (overflowY === "auto" || overflowY === "scroll") {
          scrollContainer = parent;
          break;
        }
        parent = parent.parentElement;
      }

      if (scrollContainer) {
        scrollContainer.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        descElement.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  const handleScrollToTop = () => {
    const tagsContainer = document.getElementById("aura-response-products-with-tags-container");
    if (tagsContainer) {
      tagsContainer.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      let scrollContainer = null;
      let parent = containerRef.current;
      while (parent) {
        const overflowY = window.getComputedStyle(parent).overflowY;
        if (overflowY === "auto" || overflowY === "scroll") {
          scrollContainer = parent;
          break;
        }
        parent = parent.parentElement;
      }
      if (scrollContainer) {
        scrollContainer.scrollTo({ top: 0, behavior: "smooth" });
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };
  // const [pastChats, setPastChats] = useState(() => {
  //   if (typeof window !== "undefined") {
  //     try {
  //       const stored = localStorage.getItem("unthink_aura_past_chats");
  //       if (stored) {
  //         const parsed = JSON.parse(stored);
  //         if (Array.isArray(parsed) && parsed.length > 0) return parsed;
  //       }
  //     } catch (e) {}
  //   }
  //   return [
  //     { id: "1", text: "Minimalist modular velvet sofa", timestamp: "10 mins ago" },
  //     { id: "2", text: "Scandinavian oak dining table with chairs", timestamp: "2 hours ago" },
  //     { id: "3", text: "Abstract ceramic accent vases", timestamp: "1 day ago" },
  //     { id: "4", text: "Boho woven hanging light fixtures", timestamp: "3 days ago" },
  //   ];
  // });

  const handleSelectPastChat = (chatText) => {
    if (handleInputChange) {
      handleInputChange({ target: { name: "chat_message", value: chatText } });
    }
    setIsHistoryOpen(false);
  };

  // useEffect(() => {
  //   if (showChatLoader && localChatMessage && typeof localChatMessage === "string") {
  //     const trimmed = localChatMessage.trim();
  //     if (trimmed) {
  //       setPastChats((prev) => {
  //         if (prev.some((c) => c.text.toLowerCase() === trimmed.toLowerCase())) {
  //           return prev;
  //         }
  //         const updated = [
  //           { id: Date.now().toString(), text: trimmed, timestamp: "Just now" },
  //           ...prev,
  //         ].slice(0, 15);
  //         if (typeof window !== "undefined") {
  //           try {
  //             localStorage.setItem("unthink_aura_past_chats", JSON.stringify(updated));
  //           } catch (e) {}
  //         }
  //         return updated;
  //       });
  //     }
  //   }
  // }, [showChatLoader, localChatMessage]);

  const dispatch = useDispatch();

  const handleSuggestionClick = (tag) => {
    if (suggestionsWithProducts?.suggestions?.tags?.includes(tag)) {
      dispatch(setSuggestionsSelectedTag(tag));
    }
    // Scroll to the tag div
    const tagElement = document.getElementById(`tag-${tag}`);
    if (tagElement) {
      tagElement.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const originalWidth = 1024;
  const originalHeight = 1027;
  const newWidth = 404;
  const newHeight = 400;

  // const { sendMessage } = useChat();

  const onProductClick = () => {
    if (enableClickFetchRec) dispatch(handleRecProductClick());
  };

  //scroll on top when new data searched
  // useEffect(() => {
  // 	if (!showChatLoader) {
  // 		const parentContainer = document.querySelector(
  // 			".chat-product-data-container"
  // 		);
  // 		parentContainer?.scrollTo({ top: 0, behavior: "smooth" });
  // 	}
  // }, [showChatLoader]);

  // const onAuraSuggestionChipClick = (message, metadata) => {
  // 	// dispatch(setChatMessage(message));
  // 	sendMessage(message, metadata);
  // };

  const NEW_AURA_PRODUCTS_UI_ENABLED = useMemo(() => true, []);

  const chatProductsDataToShow = useMemo(
    () =>
      filterAvailableProductList(
        isEmpty(suggestionsWithProducts.suggestions) ? chatProductsData : [],
      ),
    [suggestionsWithProducts.suggestions, chatProductsData, authUser.user_name],
  );

  const isTagAvailable = useMemo(
    () => !isEmpty(suggestionsWithProducts?.suggestions.tags),
    [suggestionsWithProducts?.suggestions.tags],
  );

  const isShopByThemeOptionActive = useMemo(
    () => activeSearchOption?.id === CHAT_SEARCH_OPTION_ID.smart_search,
    [activeSearchOption?.id],
  );

  const isCompleteTheLookOptionActive = useMemo(
    () => activeSearchOption?.id === CHAT_SEARCH_OPTION_ID.complete_the_look,
    [activeSearchOption?.id],
  );

  const isProductSearchOptionActive = useMemo(
    () => activeSearchOption?.id === CHAT_SEARCH_OPTION_ID.product_search,
    [activeSearchOption?.id],
  );

  const isShopALookOptionActiveCustom = useMemo(
    () => activeSearchOption?.id === CHAT_SEARCH_OPTION_ID.shop_a_look,
    [activeSearchOption?.id],
  );

  const isAuraSwipeSectionActive = useMemo(
    () =>
      isShopByThemeOptionActive ||
      isShopALookOptionActiveCustom ||
      isCompleteTheLookOptionActive ||
      isProductSearchOptionActive,
    [
      isShopByThemeOptionActive,
      isShopALookOptionActiveCustom,
      isCompleteTheLookOptionActive,
      isProductSearchOptionActive,
    ],
  );

  const shouldShowShopLookSplitLayout = useMemo(
    () =>
      (isShopALookOptionActiveCustom ||
        isShopByThemeOptionActive ||
        isCompleteTheLookOptionActive ||
        isProductSearchOptionActive) &&
      (widgetHeader || !isEmpty(shopALookData) || !isEmpty(chatProductsData)),
    [
      isShopALookOptionActiveCustom,
      isShopByThemeOptionActive,
      isCompleteTheLookOptionActive,
      isProductSearchOptionActive,
      widgetHeader,
      shopALookData,
      chatProductsData,
    ],
  );
  // console.log('shouldShowShopLookSplitLayout',shouldShowShopLookSplitLayout);


  const shopLookPreviewImage = useMemo(
    () => widgetImage || chatImageUrl || products?.image_url || "",
    [widgetImage, chatImageUrl, products?.image_url],
  );
  // console.log(shopLookPreviewImage);


  const shopLookKeywords = useMemo(
    () => (suggestionsWithProducts?.suggestions?.tags || []).slice(0, 6),
    [suggestionsWithProducts?.suggestions?.tags],
  );

  const handleResetSelectProduct = useCallback(
    // reset select product feature // unselect every products
    () => {
      setEnableSelectProduct(false);
      setSelectedProducts([]);
    },
    [],
  );

  useEffect(() => {
    handleResetSelectProduct();
    setHasScrolledToProducts(false);
    setIsSwipeDrawerOpen(false);
  }, [chatProductsDataToShow, activeSearchOption]);

  const onSelectProductClick = (mfr_code) => {
    if (selectedProducts.includes(mfr_code)) {
      setSelectedProducts(selectedProducts.filter((p) => p !== mfr_code));
    } else {
      setSelectedProducts([...selectedProducts, mfr_code]);
    }
  };

  const onSelectAllChange = () => {
    setSelectedProducts(
      selectedProducts.length < chatProductsDataToShow.length
        ? chatProductsDataToShow.map((i) => i.mfr_code)
        : [],
    );
  };

  const onAddSelectedProductsToCollection = () => {
    const SelectedProductsData = chatProductsDataToShow.filter((p) =>
      selectedProducts.includes(p.mfr_code),
    );

    dispatch(setProductsToAddInWishlist(SelectedProductsData));
    dispatch(openWishlistModal());
    handleResetSelectProduct();
  };

  useEffect(() => {
    if (!NEW_AURA_PRODUCTS_UI_ENABLED && registerSelectActions) {
      registerSelectActions({
        enableSelectProduct,
        selectedProducts,
        chatProductsDataToShow,
        is_store_instance,
        handleResetSelectProduct,
        setEnableSelectProduct,
        onSelectAllChange,
        onAddSelectedProductsToCollection: (e, options) => {
          onAddSelectedProductsToCollection();
        },
      });
    }
  }, [
    NEW_AURA_PRODUCTS_UI_ENABLED,
    enableSelectProduct,
    selectedProducts,
    chatProductsDataToShow,
    is_store_instance,
    handleResetSelectProduct,
    onSelectAllChange,
    onAddSelectedProductsToCollection,
    registerSelectActions,
  ]);

  const scrollToCollectionsContainer = () => {
    const collection = document.getElementById("chat_shop_a_look_container");
    if (collection) {
      collection.scrollIntoView({ behavior: "smooth" });
    }
  };
  const onWishlistClick = () => {
    dispatch(openWishlistModal());
  };
  const scrollToProductsContainer = () => {
    const products = document.getElementById(
      "aura-response-products-with-tags-container",
    );
    if (products) {
      products.scrollIntoView({ behavior: "smooth" });
    }
  };
  // console.log('showChatLoader',showChatLoader);
 
  
  // Mobile sidebar drawer - shown on mobile/tablet when hamburger is tapped
  const MobileSideDrawer = () => (
    <>
      {/* Backdrop */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[1000]"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}
      {/* Drawer */}
      <div
        className={`fixed top-0 left-0 h-full z-[1001] bg-white flex flex-col transition-transform duration-300 ease-in-out ${isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        style={{ width: "260px", boxShadow: "4px 0 24px rgba(114,104,236,0.12)" }}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-[#f0eeff]">
          <span className="text-secondary font-bold text-lg tracking-wide">Menu</span>
          <CloseOutlined
            className="text-gray-400 cursor-pointer text-lg"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
        </div>
        {/* Drawer Items */}
        <div className="flex flex-col gap-2 py-4 flex-1">
          <div
            className="flex items-center gap-4 px-5 py-4 cursor-pointer text-[#1a1a1a] hover:bg-[#f8f7ff] hover:text-secondary transition-all"
            onClick={() => { handleChangeImageConfirm(); setIsMobileSidebarOpen(false); }}
          >
            <FormOutlined style={{ fontSize: "20px" }} />
            <span className="text-base font-semibold">New Chat</span>
          </div>
          <div
            className="flex items-center gap-4 px-5 py-4 cursor-pointer text-[#1a1a1a] hover:bg-[#f8f7ff] hover:text-secondary transition-all"
            onClick={() => { onWishlistClick(); setIsMobileSidebarOpen(false); }}
          >
            <FolderOutlined style={{ fontSize: "20px" }} />
            <span className="text-base font-semibold">Collections</span>
          </div>
          <div
            className="flex items-center gap-4 px-5 py-4 cursor-pointer text-[#1a1a1a] hover:bg-[#f8f7ff] hover:text-secondary transition-all"
            onClick={() => { setIsHistoryOpen(true); setIsMobileSidebarOpen(false); }}
          >
            <HistoryOutlined style={{ fontSize: "20px" }} />
            <span className="text-base font-semibold">History</span>
          </div>
        </div>
      </div>
    </>
  );

  const productsResultsContent = (
    <>
      {showChatLoader && chatProductsDataToShow.length === 0 && isEmpty(suggestionsWithProducts.suggestions) && !NEW_AURA_PRODUCTS_UI_ENABLED && (
        <div className="flex flex-col items-center justify-center w-full py-20 gap-4 animate-pulse">
          <Spin
            indicator={
              <Loading3QuartersOutlined
                style={{ fontSize: 36, color: "var(--color-secondary)" }}
                spin
              />
            }
          />
          <span className="text-secondary font-semibold text-sm tracking-wide">
            Searching products...
          </span>
        </div>
      )}

      {!isEmpty(shopALookData) &&
        isTagAvailable &&
        !isBTNormalUserLoggedIn &&
        !shouldShowShopLookSplitLayout ? (
        <div className={styles["chat-products-nav-container"]}>
          <div
            className={`${styles["chat-products-nav-item"]} ${styles["chat-products-nav-item-active"]}`}
            onClick={scrollToProductsContainer}
          >
            Products
          </div>
          <div
            className={styles["chat-products-nav-item"]}
            onClick={onWishlistClick}
          >
            Collections
          </div>
        </div>
      ) : null}

      {NEW_AURA_PRODUCTS_UI_ENABLED ? (
        <>
          <AuraResponseProductsWithTags
            handleLoadMore={handleLoadMore}
            enableClickFetchRec={enableClickFetchRec}
            enableClickTracking={enableClickTracking}
            trackCollectionCampCode={trackCollectionCampCode}
            trackCollectionId={trackCollectionId}
            trackCollectionName={trackCollectionName}
            trackCollectionICode={trackCollectionICode}
            chatTypeKey={chatTypeKey}
            widgetHeader={widgetHeader}
            widgetImage={widgetImage}
            isAuraChatPage={isAuraChatPage}
            localChatMessage={localChatMessage}
            showTitle={!shouldShowShopLookSplitLayout}
            layoutMode={shouldShowShopLookSplitLayout ? layoutMode : "full"}
            showChatLoader={showChatLoader}
            isMobile={isMobile}
            registerSelectActions={registerSelectActions}
            handleGoBack={handleGoBack}
            isProductSearchOptionActive={isProductSearchOptionActive}
          />
        </>
      ) : null}

      {!isBTNormalUserLoggedIn && !shouldShowShopLookSplitLayout ? (
        <>
          <AuraResponseShopALook
            enableClickFetchRec={enableClickFetchRec}
            enableClickTracking={enableClickTracking}
            trackCollectionCampCode={trackCollectionCampCode}
            trackCollectionId={trackCollectionId}
            trackCollectionName={trackCollectionName}
            trackCollectionICode={trackCollectionICode}
          />
        </>
      ) : null}

      {chatProductsDataToShow.length ? (
        <div>
          {isUserLogin && !isMobile ? (
            <div className={styles["chat-products-selection-controls"]}>
              {enableSelectProduct ? (
                <div className={styles["chat-products-selected-items"]}>
                  <button
                    type="button"
                    className={styles["chat-products-select-all-button"]}
                    onClick={onSelectAllChange}
                    title="Select all products"
                  >
                    <Checkbox
                      indeterminate={
                        selectedProducts.length > 0 &&
                        selectedProducts.length < chatProductsDataToShow.length
                      }
                      onChange={onSelectAllChange}
                      checked={
                        selectedProducts.length ===
                        chatProductsDataToShow.length
                      }
                      onClick={(event) => event.stopPropagation()}
                    />
                    <span>{selectedProducts.length} Selected</span>
                  </button>
                  <button
                    type="button"
                    onClick={
                      selectedProducts.length
                        ? onAddSelectedProductsToCollection
                        : undefined
                    }
                    className={`${styles["chat-products-action-text"]} ${selectedProducts.length
                      ? styles["chat-products-action-button"]
                      : styles["chat-products-action-button-disabled"]
                      }`}
                    title="Click to add selected products in collection"
                    disabled={!selectedProducts.length}
                  >
                    Add to {WISHLIST_TITLE}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleResetSelectProduct()}
                    className={`${styles["chat-products-action-text"]} ${styles["chat-products-action-button"]}`}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className={styles["chat-products-select-prompt"]}
                  onClick={() => setEnableSelectProduct(true)}
                  title="Click and select multiple products to add to collection"
                >
                  <CheckSquareOutlined />
                  <span>Select Products</span>
                </button>
              )}
            </div>
          ) : null}

          <div
            id="chat_products_inner_content"
            className={`${styles["chat-products-grid"]} ${shouldShowShopLookSplitLayout ? styles["chat-products-grid-split"] : ""}`}
          >
            {chatProductsDataToShow.map((product) => (
              <React.Fragment key={product.mfr_code}>
                <ProductCard
                  product={product}
                  onProductClick={onProductClick}
                  enableClickTracking={enableClickTracking}
                  productClickParam={{
                    iCode: authUser.influencer_code,
                    campCode: trackCollectionCampCode,
                    collectionId: trackCollectionId,
                    collectionName: trackCollectionName,
                    collectionICode: trackCollectionICode,
                  }}
                  hideAddToWishlist={is_store_instance && !isUserLogin}
                  enableSelect={enableSelectProduct}
                  isSelected={selectedProducts.includes(product.mfr_code)}
                  setSelectValue={() => onSelectProductClick(product.mfr_code)}
                  localChatMessage={localChatMessage}
                  auramodel={true}
                />
              </React.Fragment>
            ))}
          </div>
        </div>
      ) : null}
    </>
  );
  // useEffect(()=>{

  // },[auraServerImage])
  // console.log(storeData?.plan_settings?.image_generate?.is_enable && (auraServerImage === '' || auraServerImage === null)  && isImageLoading && !regenarateImage   );
  // debugger  

  return (
    <div
      ref={containerRef}
      id="chat_products_inner_container"
      className={`${styles["chat-products-container"]} ${!shouldShowShopLookSplitLayout ? styles["chat-products-container-single"] : ""}`}
    >
      {/* Mobile slide-in sidebar drawer */}
      {isMobile && <MobileSideDrawer />}
      <div
        id="chat_products_content"
        className={styles["chat-products-content"]}
      >
        {/* <div
					id='chat_product_back_icon'
					className='mb-6 max-w-max flex items-center cursor-pointer z-10'
					onClick={() => dispatch(setShowChatModal(false))}>
					<ArrowLeftOutlined className='text-base text-purple-101 pr-3 flex' />
					<span className='text-base text-purple-101'>
						Back
						// {` ${backToText}`}
					</span>
				</div> */}

        {!shouldShowShopLookSplitLayout &&
          (products.widgetHeader ? (
            <div className={styles["chat-products-header"]}>
              {products.text ? (
                <h1
                  id="current_data_text"
                  className={styles["chat-products-title"]}
                >
                  {products.text}
                </h1>
              ) : null}
              <div>
                {products.image_url ? (
                  <img
                    src={products.image_url}
                    className={styles["chat-products-image"]}
                  />
                ) : null}
                <p>
                  <span
                    id="current_data_widgetHeader"
                    className={styles["chat-products-description"]}
                    dangerouslySetInnerHTML={{
                      __html: products.widgetHeader,
                    }}
                  />
                  {products.page_url ? (
                    <a
                      href={products.page_url}
                      target="_blank"
                      className={styles["chat-products-link"]}
                    >
                      View Article
                    </a>
                  ) : null}
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* {widgetHeader ? (
							<h1
								id='current_data_widgetHeader'
								className='text-black-102 text-base lg:text-lg'
								dangerouslySetInnerHTML={{ __html: widgetHeader }}
							/>
						) : null} */}

              <div className={styles["chat-products-content-wrapper"]}>
                {/* {widgetImage ? (
								<img
									id='current_data_widgetHeader_image_url'
									src={widgetImage}
									width={208}
									className='rounded-2xl h-content m-auto'
								/>
							) : null} */}
                {widgetHeader ? (
                  <div id="current_data_widgetHeader">
                    {/* Description Loading - SINGLE LAYOUT VIEW */}
                    {showChatLoader ? (
                      <div className="flex flex-col items-center justify-center py-4 gap-2 animate-pulse w-full">
                        <Spin
                          indicator={
                            <Loading3QuartersOutlined
                              style={{ fontSize: 20, color: "var(--color-secondary)" }}
                              spin
                            />
                          }
                        />
                        <span className="text-secondary font-medium text-xs tracking-wide">
                          Loading new description...
                        </span>
                      </div>
                    ) : (
                      <span
                        className={styles["chat-products-widget-header"]}
                        dangerouslySetInnerHTML={{
                          __html: widgetHeader,
                        }}
                      />
                    )}
                  </div>
                ) : null}
              </div>
            </>
          ))}

        {shouldShowShopLookSplitLayout ? (
          <div className={`${styles["chat-products-shop-look-wrapper"]} flex flex-col lg:flex-row`}>
            <AuraSideNav
              chatHistory={chatHistory}
              handleChangeImageConfirm={handleChangeImageConfirm}
              layoutMode={layoutMode}
              onWishlistClick={onWishlistClick}
              setIsHistoryOpen={setIsHistoryOpen}
              setLayoutMode={setLayoutMode}
            />
            <div className={`${styles["chat-products-shop-look-layout"]} ${styles[`layout-${layoutMode}`]} ${isMobile ? styles["chat-products-mobile-layout"] : ""}`}>
              <AuraMainContent
                activeSearchOption={activeSearchOption}
                auraOverlayCoordinates={auraOverlayCoordinates}
                auraServerImage={auraServerImage}
                chatHistory={chatHistory}
                chatImagePreviewUrl={chatImagePreviewUrl}
                chatImageUrl={chatImageUrl}
                chatTypeKey={chatTypeKey}
                handleClearChatImage={handleClearChatImage}
                handleInputChange={handleInputChange}
                handlePromptKeyDown={handlePromptKeyDown}
                handleRegenrateImage={handleRegenrateImage}
                handleSubmitChatInput={handleSubmitChatInput}
                handleSuggestionClick={handleSuggestionClick}
                handleTryAgainClick={handleTryAgainClick}
                inputRef={inputRef}
                isCompleteTheLookOptionActive={isCompleteTheLookOptionActive}
                isDescriptionExpanded={isDescriptionExpanded}
                isFollowUpQuery={isFollowUpQuery}
                isImageLoading={isImageLoading}
                isMobile={isMobile}
                isShopALookOptionActive={isShopALookOptionActive}
                isShopByThemeOptionActive={isShopByThemeOptionActive}
                isShowFollowUpSearch={isShowFollowUpSearch}
                isShowTryAgain={isShowTryAgain}
                isUploadingImage={isUploadingImage}
                layoutMode={layoutMode}
                localChatMessage={localChatMessage}
                originalHeight={originalHeight}
                originalWidth={originalWidth}
                regenarateImage={regenarateImage}
                setIsDescriptionExpanded={setIsDescriptionExpanded}
                shopLookKeywords={shopLookKeywords}
                shopLookPreviewImage={shopLookPreviewImage}
                shouldMoveInputBelowResults={shouldMoveInputBelowResults}
                shouldShowShopLookSplitLayout={shouldShowShopLookSplitLayout}
                showChatLoader={showChatLoader}
                storeData={storeData}
                uploadImageProps={uploadImageProps}
                widgetHeader={widgetHeader}
              />

              <div className={styles["chat-products-shop-look-main"]}>
                <div className={`${styles["chat-products-main-navbar"]} ${isMobile ? styles["chatmodal-hidden-mobile"] : ""}`}>
                  <h2 className={styles["chat-products-navbar-title"]}>
                    Products
                  </h2>
                  <div className={styles["chat-products-navbar-controls"]}>
                    {isProductSearchOptionActive && onOpenSearchPopup && (
                      <SearchOutlined
                        className={styles["chat-products-search-icon"]}
                        onClick={onOpenSearchPopup}
                        title="Open Search"
                      />
                    )}
                    {closeChatModal && (
                      <CloseOutlined
                        onClick={closeChatModal}
                        className={styles["chat-products-close-icon"]}
                        title="Close"
                      />
                    )}
                  </div>
                </div>
                {productsResultsContent}
              </div>
            </div>
          </div>
        ) : (
          productsResultsContent
        )}
      </div>

      {isHistoryOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200] flex items-center justify-center p-4 transition-all"
          onClick={() => setIsHistoryOpen(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-solid border-[#e8e4fb] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 bg-[#fbfafe] border-b border-solid border-[#e8e4fb] flex items-center justify-between">
              <h3 className="text-secondary font-bold text-base m-0 flex items-center gap-2">
                <HistoryOutlined /> Past Chats
              </h3>
              <CloseOutlined
                className="text-gray-400 hover:text-gray-600 cursor-pointer text-sm p-1 transition-all"
                onClick={() => setIsHistoryOpen(false)}
                title="Close"
              />
            </div>
            <div className="p-4 flex flex-col gap-2.5 max-h-[60vh] overflow-y-auto">
              {chatHistory.length > 0 ? (
                [...chatHistory].reverse().map((item) => (
                  <div
                    key={item}
                    onClick={() => handleSelectPastChat(item)}
                    className="flex items-start justify-between p-3 rounded-xl bg-[#fbfafe]/60 border border-solid border-[#e8e4fb] hover:bg-secondary/5 hover:border-secondary/30 cursor-pointer transition-all text-left text-sm font-medium text-gray-700 group"
                  >
                    <span className="line-clamp-2 pr-2 group-hover:text-secondary transition-colors">
                      {item}
                    </span>

                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-400 text-sm font-medium">
                  No past chats found
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {isMobile && (
        isAuraSwipeSectionActive ? (
          <>
            {/* Floating glowing button below the close cross */}
            {showScrollBtn && !isSwipeDrawerOpen && (
              <div
                className="fixed top-[75px] right-4 z-[1050] cursor-pointer rounded-full bg-brand border border-white/35 py-2 px-4 text-white font-bold flex items-center justify-center shadow-[0_4px_15px_rgba(114,104,236,0.35),inset_0_1px_0_rgba(255,255,255,0.2)] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 hover:scale-[1.03] hover:shadow-[0_8px_25px_rgba(114,104,236,0.5),inset_0_1px_0_rgba(255,255,255,0.4)] hover:border-white/60 active:scale-[0.97] animate-[auraGlowPulse_2.5s_infinite_ease-in-out,auraGradientShift_4s_infinite_linear]"
                onClick={() => setIsSwipeDrawerOpen(true)}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                role="button"
                tabIndex={0}
              >
                <div className="flex items-center gap-1.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '4px' }} className="inline-block text-[#ffd84d] animate-[auraSparkleRotate_3s_infinite_ease-in-out]">
                    <path d="M12 2c0 5.523 4.477 10 10 10-5.523 0-10 4.477-10 10 0-5.523-4.477-10-10-10 5.523 0 10-4.477 10-10z" />
                  </svg>
                  <span className="text-[11px] tracking-wider uppercase font-bold drop-shadow-[0_1px_2px_color-secondary]">Info & Search</span>
                </div>
              </div>
            )}

            {/* Swipeable Drawer */}
            {isSwipeDrawerOpen && (
              <>
                <div
                  className="fixed inset-0 bg-[#0b0d17]/40 backdrop-blur-[4px] z-[1060] transition-opacity duration-300"
                  style={{ opacity: isSwipeDrawerOpen ? 1 : 0 }}
                  onClick={() => setIsSwipeDrawerOpen(false)}
                />
                <div
                  className="fixed top-0 right-0 bottom-0 w-[85%] max-w-[420px] bg-white/85 backdrop-blur-[20px] backdrop-saturate-[180%] border-l border-white/40 shadow-[-10px_0_30px_rgba(0,0,0,0.1)] z-[1070] flex flex-col p-4 pb-[calc(16px+env(safe-area-inset-bottom))] transition-transform duration-400 ease-[cubic-bezier(0.16,1,0.3,1)]"
                  style={{ transform: isSwipeDrawerOpen ? "translateX(0)" : "translateX(100%)" }}
                  onTouchStart={handleDrawerTouchStart}
                  onTouchMove={handleDrawerTouchMove}
                  onTouchEnd={handleDrawerTouchEnd}
                >
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-[60px] bg-secondary/20 rounded-r" />
                  <div className="flex items-center justify-between mb-4 border-b border-secondary/10 pb-3">
                    <h3 className="text-base font-bold text-[#1a2035] m-0 uppercase tracking-wider">
                      {activeSearchOption?.title || "Aura Info"}
                    </h3>
                    <button
                      type="button"
                      className="bg-transparent border-none cursor-pointer text-[#384467] text-lg flex items-center justify-center p-1 rounded-full transition-colors duration-200 hover:bg-secondary/10 hover:text-secondary"
                      onClick={() => setIsSwipeDrawerOpen(false)}
                    >
                      <CloseOutlined />
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-1 flex flex-col gap-3 min-h-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                    {/* Preview Image with overlays */}
                    {(shopLookPreviewImage || auraServerImage) && (
                      <div className={styles["chat-products-shop-look-image-wrapper"]} style={{ margin: "0 auto" }}>
                        <img
                          src={shopLookPreviewImage || auraServerImage}
                          alt="PreviewImage"
                          className={styles["chat-products-shop-look-image"]}
                        />
                        {Array.isArray(auraOverlayCoordinates) &&
                          auraOverlayCoordinates.map((item, index) => {
                            const leftPercent = (item.point[0] / originalWidth) * 100;
                            const topPercent = (item.point[1] / originalHeight) * 100;
                            return (
                              <Tooltip
                                key={index}
                                title={item.attributes.label}
                                color="blue"
                              >
                                <div
                                  onClick={() => {
                                    handleSuggestionClick(item.attributes.label);
                                    setIsSwipeDrawerOpen(false);
                                  }}
                                  className={styles["chat-products-overlay-point"]}
                                  style={{
                                    left: `${leftPercent}%`,
                                    top: `${topPercent}%`,
                                  }}
                                />
                              </Tooltip>
                            );
                          })}
                      </div>
                    )}

                    {/* Description text */}
                    {widgetHeader && (
                      <div className={styles["chat-products-shop-look-description-block"]} style={{ margin: "0.25rem 0" }}>
                        {/* Description Loading - MOBILE SWIPE DRAWER VIEW */}
                        {showChatLoader ? (
                          <div className="flex flex-col items-center justify-center py-4 gap-2 animate-pulse w-full">
                            <Spin
                              indicator={
                                <Loading3QuartersOutlined
                                  style={{ fontSize: 20, color: "var(--color-secondary)" }}
                                  spin
                                />
                              }
                            />
                            <span className="text-secondary font-medium text-xs tracking-wide">
                              Loading new description...
                            </span>
                          </div>
                        ) : (
                          <div
                            className={styles["chat-products-shop-look-description-text"]}
                            dangerouslySetInnerHTML={{ __html: widgetHeader }}
                          />
                        )}
                      </div>
                    )}

                    {/* Aura Input Box (Search Bar) */}
                    <div className="mt-2">
                      <AuraInputBox
                        showChatLoader={showChatLoader}
                        isShopByThemeOptionActive={isShopByThemeOptionActive}
                        isCompleteTheLookOptionActive={isCompleteTheLookOptionActive}
                        uploadImageProps={uploadImageProps}
                        chatImageUrl={chatImageUrl}
                        chatImagePreviewUrl={chatImagePreviewUrl}
                        isUploadingImage={isUploadingImage}
                        handleClearChatImage={handleClearChatImage}
                        activeSearchOption={activeSearchOption}
                        chatTypeKey={chatTypeKey}
                        inputRef={inputRef}
                        localChatMessage={localChatMessage}
                        handleInputChange={handleInputChange}
                        handlePromptKeyDown={handlePromptKeyDown}
                        isShopALookOptionActive={isShopALookOptionActive}
                        handleSubmitChatInput={() => {
                          handleSubmitChatInput();
                          setIsSwipeDrawerOpen(false);
                        }}
                        isFollowUpQuery={isFollowUpQuery}
                        isDrawer={true}
                      />
                    </div>
                  </div>
                </div>
              </>
            )}
          </>
        ) : (
          <button
            className={`${styles["chat-products-scroll-top-btn"]} ${showScrollBtn ? styles["chat-products-scroll-top-btn-visible"] : ""}`}
            onClick={handleScrollToDescription}
            title="Go to Description"
            type="button"
          >
            <ArrowUpOutlined style={{ marginRight: '6px' }} />
            <span>Go to Description</span>
          </button>
        )
      )}

      <button
        className={`fixed bottom-[145px] right-5 w-[42px] h-[42px] rounded-full bg-brand text-white border border-white/15 shadow-[0_8px_24px_rgba(114,104,236,0.4)] flex items-center justify-center text-[18px] cursor-pointer z-[1000] transition-all duration-300 hover:bg-brand hover:scale-110 active:scale-95 ${
          showScrollBtn ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-4 pointer-events-none"
        }`}
        onClick={handleScrollToTop}
        title="Scroll to Top"
        type="button"
      >
        <ArrowUpOutlined />
      </button>
    </div>
  );
};

export default ChatProducts;
