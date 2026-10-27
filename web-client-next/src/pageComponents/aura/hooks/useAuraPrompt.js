import { useCallback, useEffect, useMemo, useState } from "react";
import { notification } from "antd";
import { useDispatch } from "react-redux";

import {
  chatHistoryAction,
  clearLastAuraResponse,
  resetAuraSearchResponse,
  setAuraHelperMessage,
  setAuraSreverImage,
  setChatImageUrl,
  setChatMessage,
  setChatProducts,
  setChatProductsData,
  setChatShopALook,
  setOverlayCoordinates,
  setWidgetHeader,
  setWidgetImage,
} from "../../../hooks/chat/redux/actions";
import { setIsSendSocketMessageWithPrefix } from "../../../helper/getTrackerInfo";
import { current_store_name } from "../../../constants/config";
import { CHAT_SEARCH_OPTION_ID } from "../../../constants/codes";
import { createDebouncedFunction } from "../utils/AuraUtils";

export const useAuraPrompt = ({
  activeSearchOption,
  authUser,
  auraServerImage,
  chatImageUrl,
  chatInputMetadata,
  chatTypeKey,
  clearLocalChatImagePreview,
  firstSubmittedImageUrl,
  handleClearChatImage = () => {},
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
}) => {
  const dispatch = useDispatch();
  const [localChatMessage, setLocalChatMessage] = useState("");
  const [prevShowChatLoader, setPrevShowChatLoader] = useState(showChatLoader);
  const [nextPage, setNextPage] = useState(true);
  const [ipp, setIpp] = useState(15);
  const [currentPage, setCurrentPage] = useState(0);
  const [regenarateImage, setRegenarateImage] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);

  if (showChatLoader !== prevShowChatLoader) {
    setPrevShowChatLoader(showChatLoader);
    if (!showChatLoader && prevShowChatLoader) {
      setLocalChatMessage("");
      handleClearChatImage();
    }
  }

  const debounceDispatch = useMemo(
    () =>
      createDebouncedFunction((value) => {
        dispatch(setChatMessage(value, chatTypeKey));
        setIsSendSocketMessageWithPrefix(true);
      }, 300),
    [chatTypeKey, dispatch],
  );

  useEffect(() => () => debounceDispatch.cancel(), [debounceDispatch]);

  const handleInputChange = (e) => {
    const { value } = e.target;
    setLocalChatMessage(value);
    debounceDispatch(value);
  };

  const handleTryThisClick = (
    e,
    chatMessage = activeSearchOption.text_example,
    chatImage = "",
  ) => {
    e.stopPropagation();
    e.preventDefault();
    inputRef?.current?.focus();
    setLocalChatMessage(chatMessage);
    chatMessage && dispatch(setChatMessage(chatMessage, chatTypeKey));
    clearLocalChatImagePreview();
    setChatImagePreviewUrl(chatImage || "");
    setFirstSubmittedImageUrl("");
    dispatch(setChatImageUrl(chatImage, chatTypeKey));
  };

  const handleTryExampleClick = () => {
    const exampleText = activeSearchOption?.text_example;
    if (exampleText) {
      setLocalChatMessage(exampleText);
      dispatch(setChatMessage(exampleText, chatTypeKey));
      setIsSendSocketMessageWithPrefix(true);
      inputRef.current?.focus();
    }
  };

  const handleFollowUpSearch = useCallback(() => {
    setIsFollowUpQuery((value) => !value);
    dispatch(setChatMessage(""));
    inputRef?.current?.focus();
  }, [dispatch, inputRef, setIsFollowUpQuery]);

  const handleSubmitChatInput = () => {
    if (isUploadingImage) {
      notification.info({
        message: "Image Uploading",
        description: "Please wait until the image is ready.",
      });
      return;
    }

    setIsImageLoading(true);
    const metadata = { ...chatInputMetadata };
    const previousImageUrl = submittedPromptPreview.imageUrl || "";
    const isImageFollowUp =
      isFollowUpQuery && activeSearchOption?.allow_image_search;
    const primaryImageUrl =
      firstSubmittedImageUrl ||
      previousImageUrl ||
      (!isImageFollowUp ? chatImageUrl : "");
    const followUpImageUrl =
      isImageFollowUp &&
      primaryImageUrl &&
      chatImageUrl &&
      chatImageUrl !== primaryImageUrl
        ? chatImageUrl
        : "";

    if (followUpImageUrl) {
      metadata.followup_image_url = followUpImageUrl;
    } else {
      delete metadata.followup_image_url;
    }

    setIsFollowUpQuery(true);
    const userMetadata = {
      brand: authUser?.filters?.[current_store_name]?.strict?.brand || [],
    };

    const HISTORY_KEY = "widgetHeaderRequestHistory";
    if (localChatMessage) {
      const raw = sessionStorage.getItem(HISTORY_KEY);
      let history = [];
      if (raw) {
        try {
          history = JSON.parse(raw) || [];
        } catch (err) {
          history = [];
        }
      }

      const entry = localChatMessage;
      const last = history[history.length - 1];
      const isSameAsLast =
        last && JSON.stringify(last) === JSON.stringify(entry);
      if (!isSameAsLast) {
        history.push(entry);
        if (history.length > 20) history.shift();
        sessionStorage.setItem(HISTORY_KEY, JSON.stringify(history));
      }
    }

    dispatch(
      chatHistoryAction(
        JSON.parse(sessionStorage.getItem("widgetHeaderRequestHistory")),
      ),
    );

    if (localChatMessage || chatImageUrl) {
      const sendImageSmartSearch =
        chatImageUrl &&
        isFollowUpQuery &&
        activeSearchOption?.id === "smart_search";

      const sendImageShopLook =
        chatImageUrl && activeSearchOption?.id === "shop_a_look";

      const sendImageCompleteLook =
        chatImageUrl && activeSearchOption?.id === "complete_the_look";

      const sendAllowedImageSearch =
        chatImageUrl && activeSearchOption?.allow_image_search;
      const shouldSendCurrentImage =
        sendAllowedImageSearch ||
        sendImageSmartSearch ||
        sendImageShopLook ||
        sendImageCompleteLook;

      const finalImageToSend =
        isImageFollowUp && primaryImageUrl
          ? primaryImageUrl
          : shouldSendCurrentImage
            ? chatImageUrl
            : undefined;

      const nextFirstSubmittedImageUrl =
        firstSubmittedImageUrl || finalImageToSend || "";

      if (!firstSubmittedImageUrl && finalImageToSend) {
        setFirstSubmittedImageUrl(finalImageToSend);
      }

      setSubmittedPromptPreview({
        message: localChatMessage || "",
        imageUrl: nextFirstSubmittedImageUrl,
      });

      submitChatInput(
        localChatMessage,
        finalImageToSend || "",
        metadata,
        userMetadata,
      );

      dispatch(setAuraHelperMessage(activeSearchOption?.search_message));
      dispatch(setAuraSreverImage(""));
      dispatch(setOverlayCoordinates([]));
      setIsFigmaUploadPanelOpen(false);
      setIsSearchPopupOpen(false);
    }

    if (isFollowUpQuery && isShowFollowUpSearch) {
      setRegenarateImage(true);
    }
  };

  const handlePromptKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmitChatInput();
    }
  };

  const handlePromptUtilityClick = (e) => {
    if (
      showSettings &&
      activeSearchOption?.id !== CHAT_SEARCH_OPTION_ID.product_search
    ) {
      openSettingModal(e);
      return;
    }

    e.preventDefault();
    e.stopPropagation();
    inputRef?.current?.focus();
  };

  const handleLoadMore = () => {
    const moreSearch_next_page = false;
    const recommendationSearch_next_page = false;

    const metadata = {
      ...chatInputMetadata,
      next_page: nextPage,
      ipp,
      current_page: currentPage,
      moreSearch_next_page,
      recommendationSearch_next_page,
    };

    const userMetadata = {
      brand: authUser?.filters?.[current_store_name]?.strict?.brand || [],
    };

    if (localChatMessage || chatImageUrl) {
      submitChatInput(
        localChatMessage,
        chatImageUrl && (isFollowUpQuery || chatImageUrl) ? chatImageUrl : "",
        metadata,
        userMetadata,
      );
      dispatch(setAuraHelperMessage(activeSearchOption?.search_message));
    }
  };

  const handleRegenrateImage = () => {
    setRegenarateImage(false);
    dispatch(setAuraSreverImage(""));
    setIsImageLoading(true);

    const keyWord_tagMap = suggestionsWithProducts?.suggestions?.tag_map;

    const imageGenerate = {
      text: localChatMessage,
    };

    const metadata = {
      keyword_tag_map: keyWord_tagMap || [],
      store: current_store_name,
      search_type: activeSearchOption?.id || "",
      description: widgetHeader || "",
      generate_overlay_enable: true,
    };
    sendSocketClientMessage({
      message: localChatMessage || chatHistory[chatHistory.length - 1],
      image_url: chatImageUrl || "",
      metadata,
      userMetadata: null,
      mute: true,
      imageGenerate,
    });

    if (localChatMessage || chatImageUrl) {
      submitChatInput(localChatMessage, null, metadata, null, imageGenerate);
      dispatch(setAuraHelperMessage(activeSearchOption?.search_message));
    }
  };

  useEffect(() => {
    if (auraServerImage || widgetImage) {
      setIsImageLoading(false);
      setRegenarateImage(true);
    } else {
      dispatch(setChatImageUrl(auraServerImage));
    }
  }, [auraServerImage, widgetImage, dispatch]);

  const handleChangeImageConfirm = ({ resetChatImageState }) => {
    resetChatImageState();
    setLocalChatMessage("");
    setSubmittedPromptPreview({ message: "", imageUrl: "" });
    setRegenarateImage(false);
    dispatch(resetAuraSearchResponse());
    dispatch(setWidgetHeader(""));
    dispatch(setWidgetImage(""));
    dispatch(setChatProducts([]));
    dispatch(setChatProductsData([]));
    dispatch(setChatShopALook([]));
    dispatch(clearLastAuraResponse());
    setIsSearchOptionManuallySelected(true);
    sessionStorage.removeItem("widgetHeaderRequestHistory");
    sessionStorage.removeItem("widgetHeader");
  };

  return {
    localChatMessage,
    setLocalChatMessage,
    nextPage,
    setNextPage,
    ipp,
    setIpp,
    currentPage,
    setCurrentPage,
    regenarateImage,
    setRegenarateImage,
    isImageLoading,
    setIsImageLoading,
    handleInputChange,
    handleTryThisClick,
    handleTryExampleClick,
    handleFollowUpSearch,
    handleSubmitChatInput,
    handlePromptKeyDown,
    handlePromptUtilityClick,
    handleLoadMore,
    handleRegenrateImage,
    handleChangeImageConfirm,
  };
};
