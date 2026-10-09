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
import { useNavigate } from "../../../../../helper/useNavigate";

import star_ai_icon from "../../Images/Illustration.png";
import {
  setActiveSearchOption,
  setShowChatModal,
  resetAuraSearchResponse,
  setSuggestionsSelectedTag,
} from "../../../../../hooks/chat/redux/actions";
import {
  enable_recommendations,
  is_kiosk,
  current_store_name,
} from "../../../../../constants/config";
import {
  CHAT_TYPE_CHAT,
  STORE_USER_NAME_SAMSKARA,
  MAIN_SITE_URL,
} from "../../../../../constants/codes";
import ChatProducts from "../../../ChatProducts";
import AuraInputBox from "../../../AuraInputBox";
import AuraLoadingState from "../AuraLoadingState";
import AuraImageSearchPanel from "../AuraImageSearchPanel";
import AuraModalShell from "../AuraModalShell";
import AuraPromptInput from "../AuraPromptInput";
import AuraSearchOptionIntro from "../AuraSearchOptionIntro";
import AuraSearchPopup from "../AuraSearchPopup";
import AuraWelcomePanel from "../AuraWelcomePanel";
import Recommendations from "../../../../recommendations/Recommendations";
import { SocketContext } from "../../../../../context/socketV2";
import { useAuraChatState } from "../../hooks/useAuraChatState";
import { useAuraImageUpload } from "../../hooks/useAuraImageUpload";
import { useAuraPrompt } from "../../hooks/useAuraPrompt";
import { useAuraResponsiveLayout } from "../../hooks/useAuraResponsiveLayout";
import AuraSearchOptions from "../AuraSearchOptions";

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
    authUser,
    auraServerImage,
    auraOverlayCoordinates,
    chatHistory,
    selectedSearchOptionExamples,
    isSidExpired,
    isActiveSearchOptionAvailable,
    isShowAuraResponse,
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

  const auraContentContainerClass =
    "w-full flex flex-col gap-2 mx-auto px-4 md:px-6 lg:max-w-[992px] lg:py-4 xl:max-w-[1192px] 2xl:max-w-[1328px] 2xl:px-0 max-lg:max-w-[550px] max-lg:p-2.5";
  const shouldRenderSearchPopup =
    (!is_kiosk || isActiveSearchOptionAvailable) &&
    (isProductSearchOptionActive
      ? isSearchPopupOpen || !isShowAuraResponse
      : !isShowShopLookSplitLayout);
  const shouldShowSearchOptionDetails =
    isSearchOptionManuallySelected &&
    (isBTNormalUserLoggedIn ||
      isActiveSearchOptionAvailable ||
      !isShowAuraResponse);

  return (
    <AuraModalShell
      isFixed={isShowShopLookSplitLayout}
      shouldCenter={shouldCenterModalContent}
    >
     

      {shouldRenderSearchPopup ? (
        <AuraSearchPopup
          isOpen={isSearchPopupOpen}
          onClose={() => setIsSearchPopupOpen(false)}
        >
          <div className="flex min-h-0 w-full flex-col items-center overflow-y-visible pb-10">
            {isShowFollowUpQuery ? (
              <div className="flex w-full items-center justify-center rounded-2xl py-2 pr-[1.375rem] md:rounded-full lg:pr-[1.625rem]">
                <HistoryOutlined className="flex items-center justify-center text-sm text-black lg:text-base" />
                <div className="flex w-full items-center pl-2 text-sm leading-none text-black lg:text-base">
                  {followUpQuery}
                </div>
              </div>
            ) : null}

            {!isSearchOptionManuallySelected ? (
              <div className={auraContentContainerClass}>
                <div className="flex w-full items-center gap-6 max-lg:gap-4">
                  <div
                    className="aura-image shrink-0"
                    role="img"
                    aria-label="AURA"
                    style={{
                      "--aura-mask-image": `url(${getImageSrc(star_ai_icon)})`,
                    }}
                  />
                  <div className="flex flex-col gap-1">
                    <h1 className="m-0 text-[38px] font-bold leading-[1.1] tracking-normal max-lg:text-2xl max-[480px]:text-[32px]">
                      <span className="text-gradient">I&apos;m AURA,</span>
                      <br />
                      <span className="text-highlight font-medium">
                        How can I help you?
                      </span>
                    </h1>
                  </div>
                </div>

                <p className="text-highlight text-left text-xl font-normal leading-tight md:text-2xl">
                  Choose one to get started
                </p>
              </div>
            ) : null}

            <div className={auraContentContainerClass}>
              <AuraSearchOptions
                activeSearchOption={activeSearchOption}
                isBTNormalUserLoggedIn={isBTNormalUserLoggedIn}
                isSearchOptionManuallySelected={isSearchOptionManuallySelected}
                isSearchOptionsVisible={isSearchOptionsVisible}
                resetChatImageState={resetChatImageState}
                setIsSearchOptionManuallySelected={
                  setIsSearchOptionManuallySelected
                }
                setIsSearchOptionsVisible={setIsSearchOptionsVisible}
                setLocalChatMessage={setLocalChatMessage}
                setSubmittedPromptPreview={setSubmittedPromptPreview}
              />

              {shouldShowSearchOptionDetails ? (
                <div className="relative w-full">
                  <div className="flex w-full flex-col items-center justify-start lg:mt-3">
                    <div
                      className={
                        isAllowedSplitLayout
                          ? "flex flex-col items-center"
                          : undefined
                      }
                    >
                      <AuraSearchOptionIntro
                        activeSearchOption={activeSearchOption}
                        showTryExample={Boolean(
                          activeSearchOption?.text_example,
                        )}
                        onTryExampleClick={handleTryExampleClick}
                        allowImageSearch={activeSearchOption.allow_image_search}
                      />
                    </div>
                    <AuraImageSearchPanel
                      activeSearchOption={activeSearchOption}
                      allowImageSearch={activeSearchOption.allow_image_search}
                      auraOverlayCoordinates={auraOverlayCoordinates}
                      chatImageUrl={chatImageUrl}
                      handleChangeImageConfirm={handleChangeImageConfirm}
                      handleFigmaImageUrlChange={handleFigmaImageUrlChange}
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
                    <AuraPromptInput
                      activeSearchOption={activeSearchOption}
                      chatImageUrl={chatImageUrl}
                      chatTypeKey={chatTypeKey}
                      inputRef={inputRef}
                      isFollowUpQuery={isFollowUpQuery}
                      isShopALookOptionActive={isShopALookOptionActive}
                      localChatMessage={localChatMessage}
                      onChange={handleInputChange}
                      onKeyDown={handlePromptKeyDown}
                      onSubmit={handleSubmitChatInput}
                      showChatLoader={showChatLoader}
                    />
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </AuraSearchPopup>
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
        )
         : isBTNormalUserLoggedIn ? (
          <>
            {/* <AuraWelcomePanel
              isMobile={isMobile}
              isProductSearchOptionActive={isProductSearchOptionActive}
              selectedSearchOptionExamples={selectedSearchOptionExamples}
              onTryExample={handleTryThisClick}
            /> */}
            
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
