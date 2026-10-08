import React, {
  useMemo,
  useCallback,
  useState,
  useContext,
} from "react";
import { useDispatch } from "react-redux";
import { Checkbox } from "antd";
import {
  CloseCircleFilled,
  CloseOutlined,
  HistoryOutlined,
  ArrowLeftOutlined,
  ArrowUpOutlined,
  MenuOutlined,
  ShareAltOutlined,
  FolderAddOutlined,
} from "@ant-design/icons";
import { useNavigate } from "../../helper/useNavigate";

import star_ai_icon from "./aura/Images/Illustration.png";
import iconShopByTheme from "./aura/Images/icon_shop_by_theme.png";
import iconShopTheLook from "./aura/Images/icon_shop_the_look.png";
import iconCompleteTheLook from "./aura/Images/icon_complete_the_look.png";
import iconSearch from "./aura/Images/icon_search.png";
import iconTrendingCollections from "./aura/Images/icon_trending_collections.png";
import {
  setActiveSearchOption,
  setShowChatModal,
  resetAuraSearchResponse,
  setSuggestionsSelectedTag,
} from "../../hooks/chat/redux/actions";
import {
  enable_recommendations,
  is_kiosk,
  current_store_name,
} from "../../constants/config";
import {
  CHAT_TYPE_CHAT,
  STORE_USER_NAME_SAMSKARA,
  MAIN_SITE_URL,
} from "../../constants/codes";
import ChatProducts from "./ChatProducts";
import AuraInputBox from "./AuraInputBox";
import AuraLoadingState from "./aura/components/AuraLoadingState";
import AuraImageSearchPanel from "./aura/components/AuraImageSearchPanel";
import AuraModalShell from "./aura/components/AuraModalShell";
import AuraPromptInput from "./aura/components/AuraPromptInput";
import AuraSearchOptionIntro from "./aura/components/AuraSearchOptionIntro";
import AuraSearchPopup from "./aura/components/AuraSearchPopup";
import AuraWelcomePanel from "./aura/components/AuraWelcomePanel";
import Recommendations from "../recommendations/Recommendations";
import { KioskSearchOptions } from "../kioskSearchOptions/KioskSearchOptions";
import { SocketContext } from "../../context/socketV2";
import { useAuraChatState } from "./aura/hooks/useAuraChatState";
import { useAuraImageUpload } from "./aura/hooks/useAuraImageUpload";
import { useAuraPrompt } from "./aura/hooks/useAuraPrompt";
import { useAuraResponsiveLayout } from "./aura/hooks/useAuraResponsiveLayout";
import { useAuraSearchOptions } from "./aura/hooks/useAuraSearchOptions";
import AuraSearchOptions from "./aura/components/AuraSearchOptions";

const ChatModal = ({
  submitChatInput,
  showSettings,
  openSettingModal,
  chatInputMetadata,
  chatTypeKey,
  trackCollectionData,
  inputRef,
  isFollowUpQuery,
  setIsFollowUpQuery,
  widgetHeaderRequest,
  showSubmitImageTooltip,
  setShowSubmitImageTooltip,
  isBTNormalUserLoggedIn,
  isAuraChatPage,
}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isSearchOptionManuallySelected, setIsSearchOptionManuallySelected] =
    useState(false);
  const [submittedPromptPreview, setSubmittedPromptPreview] = useState({
    message: "",
    imageUrl: "",
  });
  const [isSearchOptionsVisible, setIsSearchOptionsVisible] = useState(true);
  const [selectActions, setSelectActions] = useState(null);

  const {
    openMobileSidebarRef,
    layoutMode,
    setLayoutMode,
    isSearchPopupOpen,
    setIsSearchPopupOpen,
    isMobile,
    isMobileOnly,
    mobileTab,
  } = useAuraResponsiveLayout();

  const {
    isUploadingImage,
    chatImagePreviewUrl,
    setChatImagePreviewUrl,
    isFigmaUploadPanelOpen,
    setIsFigmaUploadPanelOpen,
    firstSubmittedImageUrl,
    setFirstSubmittedImageUrl,
    clearLocalChatImagePreview,
    handleClearChatImage,
    resetChatImageState,
    handleUploadChatImage,
    uploadImageProps,
    handleFigmaUploadButtonClick,
    handleFigmaImageUrlChange,
  } = useAuraImageUpload({ chatTypeKey });

  const {
    chatImageUrl,
    showChatLoader,
    activeSearchOption,
    widgetHeader,
    widgetImage,
    suggestionsWithProducts,
    tags,
    searchOptions,
    authUser,
    auraServerImage,
    auraOverlayCoordinates,
    chatHistory,
    selectedSearchOptionExamples,
    isSidExpired,
    isActiveSearchOptionAvailable,
    isShowAuraResponse,
    shouldHighlightActiveSearchOption,
    isShowKioskSearchOptions,
    shouldCenterModalContent,
    isShopALookOptionActive,
    isProductSearchOptionActive,
    isAllowedSplitLayout,
    shouldUseLegacyImageSearchLayout,
    isShowSubmittedChatPreview,
    shouldMoveInputBelowResults,
    isShowShopLookSplitLayout,
  } = useAuraChatState({
    chatTypeKey,
    isBTNormalUserLoggedIn,
    isFigmaUploadPanelOpen,
    submittedPromptPreview,
    isFollowUpQuery,
    isSearchOptionManuallySelected,
    isMobile,
  });
  const handleRegisterSelectActions = useCallback((actions) => {
    setSelectActions((prev) => {
      if (!actions) return null;
      if (!prev) return actions;

      const isSame =
        prev.enableSelectProduct === actions.enableSelectProduct &&
        prev.selectedProducts?.length === actions.selectedProducts?.length &&
        prev.chatProductsDataToShow?.length ===
          actions.chatProductsDataToShow?.length &&
        prev.isTagProductSelected === actions.isTagProductSelected &&
        prev.isTagProductsAllSelected === actions.isTagProductsAllSelected;

      if (isSame) {
        Object.assign(prev, actions);
        return prev;
      }
      return actions;
    });
  }, []);

  const {
    text: followUpQuery,
    metadata: requestedMetaData,
    image_url: requestedImageUrl,
  } = widgetHeaderRequest;
  const handleTryAgainClick = () => {
    const metadata = { ...chatInputMetadata };
    const userMetadata = {
      brand: authUser?.filters?.[current_store_name]?.strict?.brand || [],
    };
    submitChatInput(
      followUpQuery || undefined,
      requestedImageUrl || undefined,
      metadata,
      userMetadata,
    );
  };

  const isShowFollowUpQuery = useMemo(
    () => isFollowUpQuery && followUpQuery,
    [isFollowUpQuery, followUpQuery],
  );

  const isShowFollowUpSearch = useMemo(
    () =>
      activeSearchOption?.follow_up_search_enable &&
      requestedMetaData?.searchOptionId === activeSearchOption?.id,
    [
      activeSearchOption?.follow_up_search_enable,
      requestedMetaData?.searchOptionId,
      activeSearchOption?.id,
    ],
  );

  const isShowTryAgain = useMemo(
    () => followUpQuery || requestedImageUrl,
    [followUpQuery, requestedImageUrl],
  );

  const { sendSocketClientMessage } = useContext(SocketContext);
  const {
    localChatMessage,
    setLocalChatMessage,
    regenarateImage,
    isImageLoading,
    handleInputChange,
    handleTryThisClick,
    handleTryExampleClick,
    handleFollowUpSearch,
    handleSubmitChatInput,
    handlePromptKeyDown,
    handleLoadMore,
    handleRegenrateImage,
    handleChangeImageConfirm: handlePromptChangeImageConfirm,
  } = useAuraPrompt({
    activeSearchOption,
    authUser,
    auraServerImage,
    chatImageUrl,
    chatInputMetadata,
    chatTypeKey,
    clearLocalChatImagePreview,
    firstSubmittedImageUrl,
    handleClearChatImage,
    inputRef,
    isFollowUpQuery,
    isShowFollowUpSearch,
    isUploadingImage,
    openSettingModal,
    requestedImageUrl,
    setChatImagePreviewUrl,
    setFirstSubmittedImageUrl,
    setIsFigmaUploadPanelOpen,
    setIsFollowUpQuery,
    setIsSearchOptionManuallySelected,
    setIsSearchPopupOpen,
    setSubmittedPromptPreview,
    showChatLoader,
    showSettings,
    submitChatInput,
    submittedPromptPreview,
    suggestionsWithProducts,
    widgetHeader,
    widgetImage,
    chatHistory,
    sendSocketClientMessage,
  });

  const {
    handleSetSearchOption,
    displaySearchOptions,
    searchOptionPreviewImages,
    cardCollageVariants,
  } = useAuraSearchOptions({
    activeSearchOption,
    searchOptions,
    navigate,
    iconShopByTheme,
    iconShopTheLook,
    iconCompleteTheLook,
    iconSearch,
    iconTrendingCollections,
    setLocalChatMessage,
    setSubmittedPromptPreview,
    resetChatImageState,
    setIsSearchOptionManuallySelected,
    setIsSearchOptionsVisible,
  });

  const getImageSrc = (image) => image?.src || image;

  const handleSuggestionClick = (tag) => {
    if (tags.includes(tag)) {
      dispatch(setSuggestionsSelectedTag(tag));
    }
    const tagElement = document.getElementById(`tag-${tag}`);
    if (tagElement) {
      tagElement.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const handleChangeImageConfirm = () => {
    handlePromptChangeImageConfirm({ resetChatImageState });
  };

  const resetPromptState = () => {
    setLocalChatMessage("");
    setSubmittedPromptPreview({ message: "", imageUrl: "" });
    resetChatImageState();
  };

  const resetResponseState = () => {
    resetPromptState();
    dispatch(resetAuraSearchResponse());
    setIsFollowUpQuery(false);
    sessionStorage.removeItem("widgetHeaderRequestHistory");
  };

  const resetSearchSelectionState = () => {
    resetPromptState();
    setIsSearchOptionManuallySelected(false);
    setIsSearchOptionsVisible(true);
    dispatch(setActiveSearchOption({}));
  };

  const closeChatModal = () => {
    sessionStorage.removeItem("widgetHeader");
    resetSearchSelectionState();
    dispatch(setShowChatModal(false));
    showSubmitImageTooltip && setShowSubmitImageTooltip(false);
    window.history.back();
  };

  const handleGoBack = () => {
    resetSearchSelectionState();
    dispatch(resetAuraSearchResponse());
    setIsFollowUpQuery(false);
    sessionStorage.removeItem("widgetHeaderRequestHistory");
  };

  const handleHomeClick = () => {
    closeChatModal();
    navigate("/");
  };

  const handleBackToSelectedOption = () => {
    resetResponseState();
    setIsSearchOptionManuallySelected(true);
    setIsSearchOptionsVisible(false);
  };

  return (
    <AuraModalShell
      isFixed={isShowShopLookSplitLayout}
      shouldCenter={shouldCenterModalContent}
    >
      {!isAuraChatPage ? (
        <>
          {isShowAuraResponse && isProductSearchOptionActive && !isMobile ? (
            <div className="sticky top-0 left-0 right-0 z-[1000] bg-white border-b border-tertiary px-3 md:px-6 py-2.5 md:py-3 flex items-center justify-between gap-2 md:gap-4 shadow-xs w-full">
              <div className="flex items-center gap-2 md:gap-3 shrink-0">
                <ArrowLeftOutlined
                  className="text-lg md:text-xl text-gray-900 cursor-pointer hover:opacity-80 transition-opacity pr-1 md:pr-2"
                  onClick={handleGoBack}
                />
                <span
                  className={
                    "m-0 inline-block text-lg md:text-[1.4rem] leading-tight font-semibold tracking-[0.02em] uppercase text-neutral-900"
                  }
                >
                  {activeSearchOption?.title?.toUpperCase() || "SEARCH"}
                </span>
              </div>

              <div className="relative mx-1 flex-1 md:mx-6 md:max-w-2xl">
                <div className="flex w-full items-center rounded-full border border-secondary/50 bg-white px-3 py-1.5 shadow-2xs md:px-4 md:py-2">
                  <input
                    id={`chat_navbar_search_input_${chatTypeKey}`}
                    type="text"
                    ref={inputRef}
                    placeholder={
                      typeof activeSearchOption?.text_placeholder === "string"
                        ? activeSearchOption.text_placeholder
                        : activeSearchOption?.text_placeholder?.[0] ||
                          "Describe your product idea"
                    }
                    name="chat_message"
                    value={localChatMessage}
                    onChange={handleInputChange}
                    onKeyDown={handlePromptKeyDown}
                    className="min-w-0 flex-1 border-none bg-transparent text-sm font-medium text-slate-700 outline-none placeholder:text-slate-400 md:text-base"
                  />
                  {localChatMessage && (
                    <CloseCircleFilled
                      className="mx-1.5 cursor-pointer text-xs text-slate-400 transition-colors hover:text-secondary md:text-sm"
                      onClick={() => setLocalChatMessage("")}
                    />
                  )}
                  <button
                    type="button"
                    className="ml-1.5 flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-full border-none bg-secondary text-white transition-colors hover:bg-brand disabled:cursor-not-allowed disabled:bg-tertiary md:h-8 md:w-8"
                    onClick={handleSubmitChatInput}
                    disabled={
                      showChatLoader ||
                      (isShopALookOptionActive
                        ? !chatImageUrl
                        : !localChatMessage && !chatImageUrl)
                    }
                  >
                    <ArrowUpOutlined className="text-xs md:text-sm" />
                  </button>
                </div>
              </div>

              <div className="shrink-0 flex items-center">
                <CloseOutlined
                  id="chat_modal_close_icon"
                  onClick={closeChatModal}
                  className="text-lg md:text-xl text-gray-900 cursor-pointer hover:opacity-80 transition-opacity p-1"
                />
              </div>
            </div>
          ) : (
            <>
              {!(
                isShowShopLookSplitLayout &&
                layoutMode !== "left" &&
                !isMobile
              ) && (
                <div
                  className={`${"w-full flex flex-col gap-2 mx-auto px-4 md:px-6 lg:max-w-[992px] lg:py-4 xl:max-w-[1192px] 2xl:max-w-[1328px] 2xl:px-0 max-lg:max-w-[550px] max-lg:p-2.5"} ${isMobile ? "flex max-lg:hidden" : ""}`}
                >
                  <button
                    className="group text-gray-500 flex w-fit items-center gap-2 rounded-full   py-2 button-kiosk font-medium   transition "
                    onClick={closeChatModal}
                  >
                    <span className=" leading-none flex transition group-hover:-translate-x-0.5">
                      <ArrowLeftOutlined />
                    </span>
                    <span className="capitalize">Go back</span>
                  </button>
                </div>
              )}

              {isMobile &&
                isActiveSearchOptionAvailable &&
                isShowAuraResponse && (
                  <div
                    className={
                      "sticky top-0 left-0 right-0 z-[1000] flex w-full max-w-[100vw] flex-col overflow-x-hidden bg-tertiary/40 shadow-[0_2px_10px_rgba(114,104,236,0.08)]"
                    }
                  >
                    <div
                      className={
                        "flex items-center justify-between border-b border-tertiary px-2.5 py-3"
                      }
                    >
                      {selectActions && selectActions.enableSelectProduct ? (
                        <div className="flex items-center justify-between w-full bg-tertiary/60 px-3 py-1.5 rounded-lg transition-all duration-300">
                          <div className="flex items-center gap-2">
                            <Checkbox
                              indeterminate={
                                selectActions.isTagProductSelected &&
                                !selectActions.isTagProductsAllSelected
                              }
                              onChange={(e) => {
                                selectActions.onSelectAllChange();
                              }}
                              checked={selectActions.isTagProductsAllSelected}
                            />
                            <span className="text-xs font-semibold text-slate-700">
                              {selectActions.selectedProducts.length} selected
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {selectActions.is_store_instance && (
                              <button
                                type="button"
                                className="rounded-full px-2.5 py-1 text-white font-bold bg-secondary text-xs flex items-center gap-1 shadow-sm border-none cursor-pointer hover:opacity-90 transition-all disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
                                onClick={(e) =>
                                  selectActions.onAddSelectedProductsToCollection(
                                    e,
                                    { isSave: true },
                                  )
                                }
                                disabled={
                                  selectActions.selectedProducts.length === 0
                                }
                                title="Save to collection"
                              >
                                <FolderAddOutlined
                                  className="text-xs"
                                  style={{
                                    stroke: "currentColor",
                                    strokeWidth: 1.5,
                                  }}
                                />
                                <span>Save</span>
                              </button>
                            )}
                            <button
                              type="button"
                              className="rounded-full px-2.5 py-1 text-white font-bold bg-secondary text-xs flex items-center gap-1 shadow-sm border-none cursor-pointer hover:opacity-90 transition-all disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
                              onClick={(e) =>
                                selectActions.onAddSelectedProductsToCollection(
                                  e,
                                  { isShare: true },
                                )
                              }
                              disabled={
                                selectActions.selectedProducts.length === 0
                              }
                              title="Share collection"
                            >
                              <ShareAltOutlined
                                className="text-xs"
                                style={{
                                  stroke: "currentColor",
                                  strokeWidth: 1.5,
                                }}
                              />
                              <span>Share</span>
                            </button>
                            <button
                              type="button"
                              className="bg-transparent border-none p-0 flex items-center justify-center cursor-pointer text-slate-700 hover:opacity-80 transition-opacity ml-1"
                              onClick={() =>
                                selectActions.handleResetSelectProduct()
                              }
                              title="Cancel selection"
                            >
                              <CloseOutlined className="text-[16px]" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className={"flex items-center gap-3"}>
                            <button
                              type="button"
                              className="flex items-center justify-center w-8 h-8 cursor-pointer bg-transparent border-none p-0 shrink-0"
                              onClick={() =>
                                openMobileSidebarRef.current &&
                                openMobileSidebarRef.current()
                              }
                              title="Menu"
                              aria-label="Open sidebar menu"
                            >
                              <MenuOutlined className="text-gray-900 text-[18px]" />
                            </button>
                            {isMobileOnly ? (
                              <span className="text-base  font-semibold text-gray-900 select-none ml-3 truncate max-w-[180px] md:max-w-none">
                                {activeSearchOption?.title}
                              </span>
                            ) : (
                              <div className="flex items-center    gap-1.5 ml-2 text-sm font-medium text-slate-600 select-none">
                                <span
                                  onClick={handleHomeClick}
                                  className="hover:underline hover:text-secondary cursor-pointer transition-colors"
                                >
                                  Home
                                </span>
                                <span className="text-gray-300">/</span>
                                <span
                                  onClick={handleBackToSelectedOption}
                                  className="hover:underline hover:text-secondary cursor-pointer transition-colors"
                                >
                                  Aura Search
                                </span>
                                <span className="text-gray-300">/</span>
                                <span className="text-neutral-900 font-semibold truncate max-w-[110px] md:max-w-none">
                                  {activeSearchOption?.title}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <CloseOutlined
                              onClick={closeChatModal}
                              className={
                                "text-lg text-slate-700 cursor-pointer"
                              }
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

              {isMobile &&
                (!isActiveSearchOptionAvailable || !isShowAuraResponse) && (
                  <div className="px-3">
                    <button
                      className="group text-gray-500 flex w-fit items-center gap-2 rounded-full   py-2 button-kiosk font-medium   transition "
                      onClick={handleGoBack}
                    >
                      <span className=" leading-none flex transition group-hover:-translate-x-0.5">
                        <ArrowLeftOutlined />
                      </span>
                      <span className="capitalize">Go back</span>
                    </button>
                  </div>
                )}
            </>
          )}
        </>
      ) : null}

      {!is_kiosk || isActiveSearchOptionAvailable ? (
        <>
          {(isProductSearchOptionActive
            ? isSearchPopupOpen || !isShowAuraResponse
            : !isShowShopLookSplitLayout) && (
            <AuraSearchPopup
              isOpen={isSearchPopupOpen}
              onClose={() => setIsSearchPopupOpen(false)}
            >
              <div
                className={`${
                  isSearchOptionManuallySelected ? "pt-0" : "border-b-0"
                } `}
              >
                <div className={"flex min-h-0 w-full flex-col items-center overflow-y-visible pb-10"}>
                  {!isSearchOptionManuallySelected && (
                    <div
                      className={
                        "w-full  px-4 md:px-6 lg:max-w-[992px] lg:py-4 xl:max-w-[1192px] 2xl:max-w-[1328px] 2xl:px-0 max-lg:max-w-[550px] max-lg:p-2.5"
                      }
                    >
                      <div
                        className={
                          "flex w-full items-center gap-6 max-lg:gap-4"
                        }
                      >
                        <div
                          className={"aura-image shrink-0"}
                          role="img"
                          aria-label="AURA"
                          style={{
                            "--aura-mask-image": `url(${getImageSrc(star_ai_icon)})`,
                          }}
                        />
                        <div className={"flex flex-col gap-1"}>
                          <h1
                            className={
                              "m-0 text-[38px] max-lg:text-2xl max-[480px]:text-[32px] font-bold leading-[1.1] tracking-normal"
                            }
                          >
                            <span className={"text-gradient"}>
                              I&apos;m AURA,
                            </span>
                            <br />
                            <span className={"text-highlight font-medium"}>
                              How can I help you?
                            </span>
                          </h1>
                        </div>
                      </div>

                      <p
                        className={
                          "  text-left text-xl md:text-2xl font-normal leading-tight text-highlight "
                        }
                      >
                        Choose one to get started
                      </p>
                    </div>
                  )}

                  <div
                    className={
                      "w-full flex flex-col gap-2 mx-auto px-4 md:px-6 lg:max-w-[992px] lg:py-4 xl:max-w-[1192px] 2xl:max-w-[1328px] 2xl:px-0 max-lg:max-w-[550px] max-lg:p-2.5"
                    }
                  >
                    <AuraSearchOptions
                      activeSearchOption={activeSearchOption}
                      cardCollageVariants={cardCollageVariants}
                      displaySearchOptions={displaySearchOptions}
                      
                      handleSetSearchOption={handleSetSearchOption}
                      
                      isBTNormalUserLoggedIn={isBTNormalUserLoggedIn}
                      isSearchOptionManuallySelected={
                        isSearchOptionManuallySelected
                      }
                      isSearchOptionsVisible={isSearchOptionsVisible}
                      searchOptionPreviewImages={searchOptionPreviewImages}
                      setIsSearchOptionsVisible={setIsSearchOptionsVisible}
                      shouldHighlightActiveSearchOption={
                        shouldHighlightActiveSearchOption
                      }
                    />
                      {/* //move this ocde  */}
                    {isShowFollowUpQuery ? (
                      <div
                        className={
                          "flex w-full items-center justify-center rounded-2xl py-2 pr-[1.375rem] md:rounded-full lg:pr-[1.625rem]"
                        }
                      >
                        <HistoryOutlined
                          className={
                            "flex items-center justify-center text-sm lg:text-base text-black"
                          }
                        />
                        <div
                          className={
                            "flex w-full items-center pl-2 text-sm lg:text-base leading-none text-black"
                          }
                        >
                          {followUpQuery}
                        </div>
                      </div>
                    ) : null}

                    {isBTNormalUserLoggedIn ||
                    isActiveSearchOptionAvailable ||
                    !isShowAuraResponse ? (
                      <div>
                        <div className={"relative w-full"}>
                          {activeSearchOption && (
                            <>
                            

                              <div
                                className={`${"flex w-full lg:mt-3 flex-col items-center  justify-start"} `}
                              >
                                {isSearchOptionManuallySelected && (
                                  <div
                                    className={
                                      isAllowedSplitLayout
                                        ? "flex flex-col items-center"
                                        : ""
                                    }
                                  >
                                    <AuraSearchOptionIntro
                                      activeSearchOption={activeSearchOption}
                                      showTryExample={Boolean(
                                        activeSearchOption?.text_example,
                                      )}
                                      onTryExampleClick={handleTryExampleClick}
                                      allowImageSearch={
                                        activeSearchOption.allow_image_search
                                      }
                                    />
                                  </div>
                                )}
                                <AuraImageSearchPanel
                                  activeSearchOption={activeSearchOption}
                                  allowImageSearch={
                                    activeSearchOption.allow_image_search
                                  }
                                  auraOverlayCoordinates={
                                    auraOverlayCoordinates
                                  }
                                  chatImageUrl={chatImageUrl}
                                  handleChangeImageConfirm={
                                    handleChangeImageConfirm
                                  }
                                  handleFigmaImageUrlChange={
                                    handleFigmaImageUrlChange
                                  }
                                  handleSuggestionClick={handleSuggestionClick}
                                  handleUploadChatImage={handleUploadChatImage}
                                  isUploadingImage={isUploadingImage}
                                  uploadImageProps={uploadImageProps}
                                />
                                <AuraLoadingState
                                  show={
                                    showChatLoader &&
                                    (localChatMessage ||
                                      chatImageUrl ||
                                      submittedPromptPreview.message ||
                                      submittedPromptPreview.imageUrl)
                                  }
                                />
                              {isSearchOptionManuallySelected && 
                                <AuraPromptInput
                                  activeSearchOption={activeSearchOption}
                                  chatImageUrl={chatImageUrl}
                                  chatTypeKey={chatTypeKey}
                                  inputRef={inputRef}
                                  isFollowUpQuery={isFollowUpQuery}
                                  isShopALookOptionActive={
                                    isShopALookOptionActive
                                  }
                                  localChatMessage={localChatMessage}
                                  onChange={handleInputChange}
                                  onKeyDown={handlePromptKeyDown}
                                  onSubmit={handleSubmitChatInput}
                                  showChatLoader={showChatLoader}                                
                                />
                              }
                              </div>
                            </>
                          )}
                        </div>

                        {/* //check and move somewhere */}
                        {isShowFollowUpSearch ? (
                          <div
                            className={`${
                              shouldUseLegacyImageSearchLayout ? "mt-4" : "mt-5"
                            } ${"flex h-5 gap-2"}`}
                          >
                            {isShowFollowUpSearch && isSidExpired ? (
                              <div className={"ml-5 flex items-center"}>
                                <input
                                  type="checkbox"
                                  id="followUpQuery"
                                  className={"mr-1 h-3.5 w-3.5 cursor-pointer"}
                                  checked={isFollowUpQuery}
                                  disabled={showChatLoader}
                                  onChange={handleFollowUpSearch}
                                />
                                <label
                                  htmlFor="followUpQuery"
                                  className={`${
                                    showChatLoader
                                      ? "cursor-not-allowed text-neutral-400"
                                      : "cursor-pointer text-neutral-800"
                                  }`}
                                >
                                  Follow-Up search
                                </label>
                              </div>
                            ) : null}
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                </div>
              
              </div>
            </AuraSearchPopup>
          )}
        </>
      ) : null}

      <div
        id="chat_products_container"
        className={`${"flex h-auto min-h-0 w-full flex-col overflow-y-auto bg-white"} `}
      >
        {showChatLoader && (
          <div style={{ position: "absolute", width: "100%" }}>
            <div className="chat_aura_products_search_skeleton"></div>
          </div>
        )}
        {current_store_name === STORE_USER_NAME_SAMSKARA ? (
          <div
            className={
              "mx-auto flex w-full max-w-[var(--max-w-s-3)] flex-col gap-2 pt-3 sm:max-w-[var(--max-w-lg-1)] lg:max-w-[var(--max-w-3xl-2)] lg:gap-5 lg:pt-4 2xl:max-w-[var(--max-w-6xl-2)]"
            }
          >
            <a
              href={MAIN_SITE_URL[STORE_USER_NAME_SAMSKARA]}
              className={"mr-auto text-black"}
            >
              <span className={"mr-auto text-black-content"}>
                <span className={"mr-2 flex text-lg leading-none"}>
                  <ArrowLeftOutlined />
                </span>
                <span className={"text-lg font-medium leading-7"}>
                  Back to Samskara Home
                </span>
              </span>
            </a>
          </div>
        ) : null}
        {isShowAuraResponse ? (
          <>
            <ChatProducts
              enableClickTracking
              trackCollectionData={trackCollectionData}
              chatTypeKey={CHAT_TYPE_CHAT}
              isBTNormalUserLoggedIn={isBTNormalUserLoggedIn}
              isAuraChatPage={isAuraChatPage}
              handleLoadMore={handleLoadMore}
              localChatMessage={localChatMessage}
              shouldMoveInputBelowResults={shouldMoveInputBelowResults}
              inputRef={inputRef}
              handleInputChange={handleInputChange}
              handlePromptKeyDown={handlePromptKeyDown}
              chatImageUrl={chatImageUrl}
              isFigmaUploadPanelOpen={isFigmaUploadPanelOpen}
              handleFigmaUploadButtonClick={handleFigmaUploadButtonClick}
              isShowSubmittedChatPreview={isShowSubmittedChatPreview}
              isShopALookOptionActive={isShopALookOptionActive}
              handleSubmitChatInput={handleSubmitChatInput}
              isShowFollowUpSearch={isShowFollowUpSearch}
              isSidExpired={isSidExpired}
              isFollowUpQuery={isFollowUpQuery}
              handleFollowUpSearch={handleFollowUpSearch}
              isShowTryAgain={isShowTryAgain}
              showChatLoader={showChatLoader}
              handleTryAgainClick={handleTryAgainClick}
              activeSearchOption={activeSearchOption}
              uploadImageProps={uploadImageProps}
              chatImagePreviewUrl={chatImagePreviewUrl}
              isUploadingImage={isUploadingImage}
              handleClearChatImage={handleClearChatImage}
              handleGoBack={handleGoBack}
              layoutMode={layoutMode}
              setLayoutMode={setLayoutMode}
              closeChatModal={closeChatModal}
              onOpenSearchPopup={() => setIsSearchPopupOpen(true)}
              isMobile={isMobile}
              mobileTab={mobileTab}
              followUpQuery={followUpQuery}
              isImageLoading={isImageLoading}
              handleRegenrateImage={handleRegenrateImage}
              regenarateImage={regenarateImage}
              handleChangeImageConfirm={handleChangeImageConfirm}
              auraServerImage={auraServerImage}
              onOpenMobileSidebar={openMobileSidebarRef}
              registerSelectActions={handleRegisterSelectActions}
            />
          </>
        ) : isShowKioskSearchOptions ? (
          <KioskSearchOptions
            displaySearchOptions={displaySearchOptions}
            handleSetSearchOption={handleSetSearchOption}
          />
        ) : isBTNormalUserLoggedIn ? (
          <>
            <AuraWelcomePanel
              isMobile={isMobile}
              isProductSearchOptionActive={isProductSearchOptionActive}
              selectedSearchOptionExamples={selectedSearchOptionExamples}
              onTryExample={handleTryThisClick}
            />
            {isMobile && isProductSearchOptionActive && (
              <div
                className={
                  "flex w-full justify-center border-t-0 bg-white px-4 pt-4 pb-[env(safe-area-inset-bottom,1.25rem)] md:px-6"
                }
              >
                <AuraInputBox
                  showChatLoader={showChatLoader}
                  activeSearchOption={activeSearchOption}
                  chatTypeKey={chatTypeKey}
                  inputRef={inputRef}
                  localChatMessage={localChatMessage}
                  handleInputChange={handleInputChange}
                  handlePromptKeyDown={handlePromptKeyDown}
                  handleSubmitChatInput={handleSubmitChatInput}
                  uploadImageProps={uploadImageProps}
                  chatImageUrl={chatImageUrl}
                  chatImagePreviewUrl={chatImagePreviewUrl}
                  isUploadingImage={isUploadingImage}
                  handleClearChatImage={handleClearChatImage}
                />
              </div>
            )}
          </>
        ) : null}

        {enable_recommendations && (
          <Recommendations trackCollectionData={trackCollectionData} />
        )}
      </div>
    </AuraModalShell>
  );
};

export default ChatModal;
