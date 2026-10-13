import React, { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Tooltip, Spin } from "antd";
import { ArrowUpOutlined, HistoryOutlined, FormOutlined, CloseOutlined, Loading3QuartersOutlined, FolderOutlined } from "@ant-design/icons";

import {
  openWishlistModal,
  setProductsToAddInWishlist,
} from "../../../../wishlist/redux/actions";
import { handleRecProductClick } from "../../../../recommendations/redux/actions";
import { filterAvailableProductList, isEmpty } from "../../../../../helper/utils";
import { is_store_instance } from "../../../../../constants/config";
import {
  CHAT_TYPES_KEYS,
  CHAT_TYPE_CHAT,
  CHAT_SEARCH_OPTION_ID,
} from "../../../../../constants/codes";
import { setSuggestionsSelectedTag } from "../../../../../hooks/chat/redux/actions";
import styles from "./ChatProducts.module.css";
import ChatInput from "./ChatInput";
import ProductDisplay from "./ProductDisplay";
import Sidebar from "./Sidebar";
import SearchWorkspace from "./SearchWorkspace";

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
  handleSubmitChatInput,
  isShowFollowUpSearch,
  isFollowUpQuery,
  isShowTryAgain,
  showChatLoader,
  handleTryAgainClick,
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

  const [enableSelectProduct, setEnableSelectProduct] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const containerRef = useRef(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  const [isSwipeDrawerOpen, setIsSwipeDrawerOpen] = useState(false);

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

  // const handleScrollToDescription = () => {
  //   const descElement = document.getElementById("aura-description-section");
  //   if (descElement) {
  //     let scrollContainer = null;
  //     let parent = descElement.parentElement;
  //     while (parent) {
  //       const overflowY = window.getComputedStyle(parent).overflowY;
  //       if (overflowY === "auto" || overflowY === "scroll") {
  //         scrollContainer = parent;
  //         break;
  //       }
  //       parent = parent.parentElement;
  //     }

  //     if (scrollContainer) {
  //       scrollContainer.scrollTo({ top: 0, behavior: "smooth" });
  //     } else {
  //       descElement.scrollIntoView({ behavior: "smooth", block: "start" });
  //     }
  //   }
  // };

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

  const handleSelectPastChat = (chatText) => {
    if (handleInputChange) {
      handleInputChange({ target: { name: "chat_message", value: chatText } });
    }
    setIsHistoryOpen(false);
  };

  const dispatch = useDispatch();

  const handleSuggestionClick = (tag) => {
    if (suggestionsWithProducts?.suggestions?.tags?.includes(tag)) {
      dispatch(setSuggestionsSelectedTag(tag));
    }

    const tagElement = document.getElementById(`tag-${tag}`);
    if (tagElement) {
      tagElement.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const originalWidth = 1024;
  const originalHeight = 1027;

  const onProductClick = () => {
    if (enableClickFetchRec) dispatch(handleRecProductClick());
  };

  const NEW_AURA_PRODUCTS_UI_ENABLED = useMemo(() => true, []);

  const chatProductsDataToShow = useMemo(
    () =>
      filterAvailableProductList(
        isEmpty(suggestionsWithProducts.suggestions) ? chatProductsData : [],
      ),
    [suggestionsWithProducts.suggestions, chatProductsData],
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

  const shopLookPreviewImage = useMemo(
    () => widgetImage || chatImageUrl || products?.image_url || "",
    [widgetImage, chatImageUrl, products?.image_url],
  );

  const shopLookKeywords = useMemo(
    () => (suggestionsWithProducts?.suggestions?.tags || []).slice(0, 6),
    [suggestionsWithProducts?.suggestions?.tags],
  );

  const handleResetSelectProduct = useCallback(
    () => {
      setEnableSelectProduct(false);
      setSelectedProducts([]);
    },
    [],
  );

  useEffect(() => {
    handleResetSelectProduct();
    setIsSwipeDrawerOpen(false);
  }, [chatProductsDataToShow, activeSearchOption, handleResetSelectProduct]);

  const onSelectProductClick = (mfr_code) => {
    if (selectedProducts.includes(mfr_code)) {
      setSelectedProducts(selectedProducts.filter((p) => p !== mfr_code));
    } else {
      setSelectedProducts([...selectedProducts, mfr_code]);
    }
  };

  const onSelectAllChange = useCallback(() => {
    setSelectedProducts(
      selectedProducts.length < chatProductsDataToShow.length
        ? chatProductsDataToShow.map((i) => i.mfr_code)
        : [],
    );
  }, [chatProductsDataToShow, selectedProducts.length]);

  const onAddSelectedProductsToCollection = useCallback(() => {
    const SelectedProductsData = chatProductsDataToShow.filter((p) =>
      selectedProducts.includes(p.mfr_code),
    );

    dispatch(setProductsToAddInWishlist(SelectedProductsData));
    dispatch(openWishlistModal());
    handleResetSelectProduct();
  }, [chatProductsDataToShow, dispatch, handleResetSelectProduct, selectedProducts]);

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
        onAddSelectedProductsToCollection,
      });
    }
  }, [
    NEW_AURA_PRODUCTS_UI_ENABLED,
    enableSelectProduct,
    selectedProducts,
    chatProductsDataToShow,
    handleResetSelectProduct,
    onSelectAllChange,
    onAddSelectedProductsToCollection,
    registerSelectActions,
  ]);

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

  const MobileSideDrawer = () => (
    <>
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[1000]"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}
      <div
        className={`fixed top-0 left-0 h-full z-[1001] bg-white flex flex-col transition-transform duration-300 ease-in-out ${isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        style={{ width: "260px", boxShadow: "4px 0 24px rgba(114,104,236,0.12)" }}
      >
        <div className="flex items-center justify-between px-5 py-5 border-b border-[#f0eeff]">
          <span className="text-secondary font-bold text-lg tracking-wide">Menu</span>
          <CloseOutlined
            className="text-gray-400 cursor-pointer text-lg"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
        </div>
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

  return (
    <div
      ref={containerRef}
      id="chat_products_inner_container"
      className={`${styles["chat-products-container"]} ${!shouldShowShopLookSplitLayout ? styles["chat-products-container-single"] : ""}`}
    >
      {isMobile && <MobileSideDrawer />}
      <div
        id="chat_products_content"
        className={styles["chat-products-content"]}
      >
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
                    alt={products.text || "Product"}
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
              <div className={styles["chat-products-content-wrapper"]}>
                {widgetHeader ? (
                  <div id="current_data_widgetHeader">
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

        {shouldShowShopLookSplitLayout && (
          <div className={`${styles["chat-products-shop-look-wrapper"]} flex flex-col lg:flex-row`}>
            <Sidebar
              chatHistory={chatHistory}
              handleChangeImageConfirm={handleChangeImageConfirm}
              handleSelectPastChat={handleSelectPastChat}
              isHistoryOpen={isHistoryOpen}
              layoutMode={layoutMode}
              onWishlistClick={onWishlistClick}
              setIsHistoryOpen={setIsHistoryOpen}
              setLayoutMode={setLayoutMode}
            />
            <div
              className={`flex w-full flex-col gap-4 lg:grid lg:items-stretch lg:gap-6 lg:flex-1 lg:min-h-0 lg:overflow-hidden lg:pb-0 ${layoutMode === "both" ? "lg:grid-cols-[minmax(340px,35%)_minmax(0,1fr)] xl:grid-cols-[minmax(400px,39%)_minmax(0,1fr)]" : "lg:grid-cols-1"} ${layoutMode === "left" ? "lg:px-48" : ""}`}
            >
              <div className={layoutMode === "right" ? "hidden" : ""}>
                <SearchWorkspace
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
                  isDescriptionExpanded={isDescriptionExpanded}
                  isFollowUpQuery={isFollowUpQuery}
                  isImageLoading={isImageLoading}
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
                  showChatLoader={showChatLoader}
                  storeData={storeData}
                  uploadImageProps={uploadImageProps}
                  widgetHeader={widgetHeader}
                />
              </div>

              <ProductDisplay
                authUser={authUser}
                chatProductsDataToShow={chatProductsDataToShow}
                chatTypeKey={chatTypeKey}
                closeChatModal={closeChatModal}
                enableClickFetchRec={enableClickFetchRec}
                enableClickTracking={enableClickTracking}
                enableSelectProduct={enableSelectProduct}
                handleGoBack={handleGoBack}
                handleLoadMore={handleLoadMore}
                handleResetSelectProduct={handleResetSelectProduct}
                isMobile={isMobile}
                isBTNormalUserLoggedIn={isBTNormalUserLoggedIn}
                isAuraChatPage={isAuraChatPage}
                isTagAvailable={isTagAvailable}
                isProductSearchOptionActive={isProductSearchOptionActive}
                isUserLogin={isUserLogin}
                layoutMode={layoutMode}
                localChatMessage={localChatMessage}
                newAuraProductsUiEnabled={NEW_AURA_PRODUCTS_UI_ENABLED}
                onAddSelectedProductsToCollection={onAddSelectedProductsToCollection}
                onOpenSearchPopup={onOpenSearchPopup}
                onProductClick={onProductClick}
                onSelectAllChange={onSelectAllChange}
                onSelectProductClick={onSelectProductClick}
                onWishlistClick={onWishlistClick}
                registerSelectActions={registerSelectActions}
                scrollToProductsContainer={scrollToProductsContainer}
                selectedProducts={selectedProducts}
                setEnableSelectProduct={setEnableSelectProduct}
                shouldShowPanelChrome={shouldShowShopLookSplitLayout}
                shouldShowShopLookSplitLayout={shouldShowShopLookSplitLayout}
                shopALookData={shopALookData}
                showChatLoader={showChatLoader}
                suggestionsWithProducts={suggestionsWithProducts}
                trackCollectionCampCode={trackCollectionCampCode}
                trackCollectionICode={trackCollectionICode}
                trackCollectionId={trackCollectionId}
                trackCollectionName={trackCollectionName}
                widgetHeader={widgetHeader}
                widgetImage={widgetImage}
              />
            </div>
          </div>
        ) }
      </div>

      {isMobile && (
        isAuraSwipeSectionActive ? (
          <>
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
                    {/* <h3 className="text-base font-bold text-[#1a2035] m-0 uppercase tracking-wider">
                      {activeSearchOption?.title || "Aura Info"}
                    </h3> */}
                    <button
                      type="button"
                      className="bg-transparent border-none cursor-pointer text-[#384467] text-lg flex items-center justify-center p-1 rounded-full transition-colors duration-200 hover:bg-secondary/10 hover:text-secondary"
                      onClick={() => setIsSwipeDrawerOpen(false)}
                    >
                      <CloseOutlined />
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-1 flex flex-col gap-3 min-h-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
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

                    {widgetHeader && (
                      <div className={styles["chat-products-shop-look-description-block"]} style={{ margin: "0.25rem 0" }}>
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

                    <div className="mt-2">
                      <ChatInput
                        showChatLoader={showChatLoader}
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
          ''
          // <button
          //   className={`${styles["chat-products-scroll-top-btn"]} ${showScrollBtn ? styles["chat-products-scroll-top-btn-visible"] : ""}`}
          //   onClick={handleScrollToDescription}
          //   title="Go to Description"
          //   type="button"
          // >
          //   <ArrowUpOutlined style={{ marginRight: '6px' }} />
          //   <span>Go to Description</span>
          // </button>
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
