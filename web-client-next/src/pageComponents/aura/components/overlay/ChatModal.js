import React, {
  useEffect,
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
  ArrowLeftOutlined,
  ArrowUpOutlined,
  MenuOutlined,
  ShareAltOutlined,
  FolderAddOutlined,
} from "@ant-design/icons";
import { useNavigate } from "../../../../helper/useNavigate";

import {
  setActiveSearchOption,
  setShowChatModal,
  resetAuraSearchResponse,
  clearLastAuraResponse,
  setSuggestionsSelectedTag,
  restoreAuraSearchResponse,
} from "../../../../hooks/chat/redux/actions";
import {
  enable_recommendations,
  is_kiosk,
  current_store_name,
} from "../../../../constants/config";
import {
  CHAT_TYPE_CHAT,
  STORE_USER_NAME_SAMSKARA,
  MAIN_SITE_URL,
} from "../../../../constants/codes";
import ChatProducts from "../productResponse/ChatProducts";
import Recommendations from "../../../recommendations/Recommendations";
import { SocketContext } from "../../../../context/socketV2";
import { useAuraChatState } from "../../hooks/useAuraChatState";
import { useAuraImageUpload } from "../../hooks/useAuraImageUpload";
import { useAuraPrompt } from "../../hooks/useAuraPrompt";
import { useAuraResponsiveLayout } from "../../hooks/useAuraResponsiveLayout";
import ImageSearchPanel from "./ImageSearchPanel";
import LoadingState from "./LoadingState";
import ExampleButton from "./ExampleButton";
import AuraModalShell from "./AuraModalShell";
import SearchOptionsTab from "./SearchOptionsTab";
import SearchPopup from "./SearchPopup";
import ThemeSearch from "./ThemeSearch";
import WelcomePanel from "./WelcomePanel";

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
    dispatch(clearLastAuraResponse());
    setIsFollowUpQuery(false);
    sessionStorage.removeItem("widgetHeaderRequestHistory");
  };

  const resetSearchSelectionState = () => {
    resetPromptState();
    setIsSearchOptionManuallySelected(false);
    setIsSearchOptionsVisible(true);
    dispatch(setActiveSearchOption({}));
    dispatch(clearLastAuraResponse());
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
    dispatch(clearLastAuraResponse());
    setIsFollowUpQuery(false);
    sessionStorage.removeItem("widgetHeaderRequestHistory");
    dispatch(restoreAuraSearchResponse())
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
        <SearchPopup
          isOpen={isSearchPopupOpen}
          onClose={() => setIsSearchPopupOpen(false)}
        >
          <div className="flex min-h-0 w-full flex-col items-center overflow-y-visible pb-10">
            {!isSearchOptionManuallySelected ? (
              <WelcomePanel />
            ) : null}

            <div className={auraContentContainerClass}>
              <SearchOptionsTab
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
                      <ExampleButton
                        activeSearchOption={activeSearchOption}
                        showTryExample={Boolean(
                          activeSearchOption?.text_example,
                        )}
                        onTryExampleClick={handleTryExampleClick}
                        allowImageSearch={activeSearchOption.allow_image_search}
                      />
                    </div>
                    <ImageSearchPanel
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
                    <LoadingState
                      show={
                        showChatLoader &&
                        (localChatMessage ||
                          chatImageUrl ||
                          submittedPromptPreview.message ||
                          submittedPromptPreview.imageUrl)
                      }
                    />
                    <ThemeSearch
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
        </SearchPopup>
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
         :   null}

        {enable_recommendations && (
          <Recommendations trackCollectionData={trackCollectionData} />
        )}
      </div>
    </AuraModalShell>
  );
};

export default ChatModal;
