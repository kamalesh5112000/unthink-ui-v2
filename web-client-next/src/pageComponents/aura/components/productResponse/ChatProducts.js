import React, { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Spin } from "antd";
import { ArrowUpOutlined, HistoryOutlined, FormOutlined, CloseOutlined, Loading3QuartersOutlined, FolderOutlined } from "@ant-design/icons";

import { openWishlistModal } from "../../../wishlist/redux/actions";
import { isEmpty } from "../../../../helper/utils";
import {
  CHAT_TYPES_KEYS,
  CHAT_TYPE_CHAT,
} from "../../../../constants/codes";
import { setSuggestionsSelectedTag } from "../../../../hooks/chat/redux/actions";
import styles from "./ChatProducts.module.css";
import ChatInput from "./ChatInput";
import GoBack from "../../../../components/common/GoBack";
import ProductDisplay from "./ProductDisplay";
import Sidebar from "./Sidebar";
import SearchWorkspace from "./SearchWorkspace";
import {
  isCompleteTheLookOptionId,
  isProductSearchOptionId,
  isShopALookOptionId,
  isShopByThemeOptionId,
} from "../../utils/AuraUtils";

const ChatProducts = ({
  enableClickFetchRec,
  enableClickTracking,
  trackCollectionData = {},
  chatTypeKey = CHAT_TYPE_CHAT,
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
    state.chatV2.suggestions,
    state.chatV2[CHAT_TYPES_KEYS[chatTypeKey].products],
    state.chatV2.shopALook,
    state.chatV2.activeSearchOption || {},
    state.chatV2.auraOverlayCoordinates,
    state.store.data,
    state.chatV2.chatHistory,
  ]);

  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const containerRef = useRef(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);

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

  const NEW_AURA_PRODUCTS_UI_ENABLED = useMemo(() => true, []);

  const isShopByThemeOptionActive = useMemo(
    () => isShopByThemeOptionId(activeSearchOption?.id),
    [activeSearchOption?.id],
  );

  const isCompleteTheLookOptionActive = useMemo(
    () => isCompleteTheLookOptionId(activeSearchOption?.id),
    [activeSearchOption?.id],
  );

  const isProductSearchOptionActive = useMemo(
    () => isProductSearchOptionId(activeSearchOption?.id),
    [activeSearchOption?.id],
  );

  const isSmartSearchActive = useMemo(
    () => activeSearchOption?.title === "Smart Search",
    [activeSearchOption?.title],
  );

  const isShopALookOptionActiveCustom = useMemo(
    () => isShopALookOptionId(activeSearchOption?.id),
    [activeSearchOption?.id],
  );

  const isSuggestionsWithProductsAvailable = useMemo(
    () =>
      Object.values(suggestionsWithProducts || {}).some(
        (value) => !isEmpty(value),
      ),
    [suggestionsWithProducts],
  );

  const shouldShowShopLookSplitLayout = useMemo(
    () =>
      (isShopByThemeOptionActive ||
        isShopALookOptionActiveCustom ||
        isCompleteTheLookOptionActive ||
        isProductSearchOptionActive) &&
      (widgetHeader ||
        !isEmpty(shopALookData) ||
        !isEmpty(chatProductsData) ||
        isSuggestionsWithProductsAvailable),
    [
      isShopByThemeOptionActive,
      isShopALookOptionActiveCustom,
      isCompleteTheLookOptionActive,
      isProductSearchOptionActive,
      widgetHeader,
      shopALookData,
      chatProductsData,
      isSuggestionsWithProductsAvailable,
    ],
  );

  const shouldShowProductPanelChrome =
    shouldShowShopLookSplitLayout && !isSmartSearchActive;

  const shopLookPreviewImage = useMemo(
    () => widgetImage || chatImageUrl || products?.image_url || "",
    [widgetImage, chatImageUrl, products?.image_url],
  );

  const shopLookKeywords = useMemo(
    () => (suggestionsWithProducts?.suggestions?.tags || []).slice(0, 6),
    [suggestionsWithProducts?.suggestions?.tags],
  );

  const onWishlistClick = () => {
    dispatch(openWishlistModal());
  };

  const productDisplay = (
    <ProductDisplay
      chatTypeKey={chatTypeKey}
      enableClickFetchRec={enableClickFetchRec}
      enableClickTracking={enableClickTracking}
      handleGoBack={handleGoBack}
      handleLoadMore={handleLoadMore}
      isMobile={isMobile}
      isAuraChatPage={isAuraChatPage}
      isProductSearchOptionActive={isProductSearchOptionActive}
      layoutMode={layoutMode}
      localChatMessage={localChatMessage}
      newAuraProductsUiEnabled={NEW_AURA_PRODUCTS_UI_ENABLED}
      registerSelectActions={registerSelectActions}
      shouldShowPanelChrome={shouldShowProductPanelChrome}
      shouldShowShopLookSplitLayout={shouldShowProductPanelChrome}
      showChatLoader={showChatLoader}
      suggestionsWithProducts={suggestionsWithProducts}
      trackCollectionCampCode={trackCollectionCampCode}
      trackCollectionICode={trackCollectionICode}
      trackCollectionId={trackCollectionId}
      trackCollectionName={trackCollectionName}
      widgetHeader={widgetHeader}
      widgetImage={widgetImage}
    />
  );

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
        {isMobile ?  <GoBack  handleGoBack={handleGoBack} Home /> : null }
        {!shouldShowShopLookSplitLayout ? productDisplay : null}

        {shouldShowShopLookSplitLayout && (
          <div className="relative flex h-full min-h-0 w-full flex-col lg:flex-row">
            {!isSmartSearchActive ? (
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
            ) : null}
            <div
              className={`flex w-full flex-col lg:grid lg:items-stretch lg:flex-1 lg:min-h-0 lg:pb-0 ${!isSmartSearchActive ? "gap-4 lg:gap-6 lg:overflow-hidden" : "gap-0"} ${!isSmartSearchActive && layoutMode === "both" ? "lg:grid-cols-[minmax(340px,35%)_minmax(0,1fr)] xl:grid-cols-[minmax(400px,39%)_minmax(0,1fr)]" : "lg:grid-cols-1"} ${!isSmartSearchActive && layoutMode === "left" ? "lg:px-48" : ""}`}
            >
              {!isSmartSearchActive ? (
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
              ) : null}

              {layoutMode === "left" ? "" : productDisplay}
            </div>
          </div>
        ) }
      </div>

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
