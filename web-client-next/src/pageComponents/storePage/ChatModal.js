import React, {
  useMemo,
  useRef,
  useCallback,
  useEffect,
  useState,
  useContext,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import { Tooltip, Image, Upload, Spin, Checkbox, notification } from "antd";
import {
  CloseCircleFilled,
  CloseOutlined,
  ReloadOutlined,
  CaretRightOutlined,
  HistoryOutlined,
  ArrowLeftOutlined,
  UploadOutlined,
  LoadingOutlined,
  ArrowUpOutlined,
  SlidersOutlined,
  PictureOutlined,
  CaretDownFilled,
  SearchOutlined,
  MenuOutlined,
  SaveOutlined,
  ShareAltOutlined,
  CheckSquareOutlined,
  FolderAddOutlined,
} from "@ant-design/icons";
import { useNavigate } from "../../helper/useNavigate";

import star_ai_icon from "./Images/Illustration.png";
import searchIcon from "../../images/swiftly-styled/Aura - Search.svg";

import auraCardOne from "./Images/aura.png";
import auraCardTwo from "./Images/aura2.png";
import auraCardThree from "./Images/aura3.png";
import iconShopByTheme from "./Images/icon_shop_by_theme.png";
import iconShopTheLook from "./Images/icon_shop_the_look.png";
import iconCompleteTheLook from "./Images/icon_complete_the_look.png";
import iconSearch from "./Images/icon_search.png";
import iconTrendingCollections from "./Images/icon_trending_collections.png";
import styles from "./ChatModal.module.css";
import {
  setActiveSearchOption,
  setAuraHelperMessage,
  setChatMessage,
  setShowChatModal,
  setChatProducts,
  setChatProductsData,
  setChatShopALook,
  setWidgetHeader,
  setWidgetImage,
  resetSuggestionsList,
  setChatImageUrl,
  resetAuraSearchResponse,
  setShowChatLoader,
  setSuggestionsSelectedTag,
  setOverlayCoordinates,
  setAuraSreverImage,
  chatHistoryAction,
} from "../../hooks/chat/redux/actions";
import { isEmpty, getRandomArrayElements, getCurrentTheme } from "../../helper/utils";
import { profileAPIs } from "../../helper/serverAPIs";
import { setIsSendSocketMessageWithPrefix } from "../../helper/getTrackerInfo";
import useOnClickOutside from "../../helper/useClickOutside";
import ChatSuggestionsV2 from "./ChatSuggestionsV2";
import {
  enable_recommendations,
  is_kiosk,
  current_store_name,
  // isStagingEnv,
  // is_store_instance,
} from "../../constants/config";
import {
  CHAT_SEARCH_OPTION_ID,
  CHAT_TYPES_KEYS,
  CHAT_TYPE_CHAT,
  COLLECTIONS_ID,
  STORE_USER_NAME_SAMSKARA,
  MAIN_SITE_URL,
} from "../../constants/codes";
import { useChat } from "../../hooks/chat/useChat";
import ChatProducts from "./ChatProducts";
import AuraInputBox from "./AuraInputBox";
import Recommendations from "../recommendations/Recommendations";
import { KioskSearchOptions } from "../kioskSearchOptions/KioskSearchOptions";
import { socket, SocketContext } from "../../context/socketV2";
import CameraCapture from "../../components/shared/CameraCapture";
import upload_icon from "./Images/upload_icon.png";
import page_info from "./Images/page_info.png";

const { Dragger } = Upload;

const createDebouncedFunction = (callback, wait) => {
  let timeoutId;

  const debounced = (...args) => {
    window.clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => callback(...args), wait);
  };

  debounced.cancel = () => {
    window.clearTimeout(timeoutId);
  };

  return debounced;
};

const ChatModal = ({
  handleMicrophoneClick,
  streaming,
  submitChatInput,
  // submitImageUrl,
  onStopRecording,
  disabledOutSideClick = false,
  showSettings,
  openSettingModal,
  chatInputMetadata,
  chatTypeKey,
  config,
  trackCollectionData,
  isBTInstance,
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
  const [
    chatMessage,
    chatImageUrl,
    products,
    showChatLoader,
    activeSearchOption,
    auraHelperMessage,
    shopALookData,
    widgetHeader,
    widgetImage,
    suggestionsWithProducts,
    isFreshSearch,
    searchOptions,
    authUser,
    isGuestPopUpShow,
    auraServerImage,
    auraOverlayCoordinates,
    socketId,
    ButtonClick,
    chatProductsData,
    chatHistory,

  ] = useSelector((state) => [
    state.chatV2[CHAT_TYPES_KEYS[chatTypeKey].chatMessage],
    state.chatV2[CHAT_TYPES_KEYS[chatTypeKey].chatImageUrl],
    state.chatV2[CHAT_TYPES_KEYS[chatTypeKey].products],
    state.chatV2[CHAT_TYPES_KEYS[chatTypeKey].showChatLoader],
    state.chatV2.activeSearchOption || {},
    state.chatV2.auraHelperMessage,
    state.chatV2.shopALook,
    state.chatV2.widgetHeader,
    state.chatV2.widgetImage,
    state.chatV2.suggestions,
    state.chatV2.isFreshSearch,
    state.store.data.searchOptions || [],
    state.auth.user.data,
    state.GuestPopUpReducer.isGuestPopUpShow,
    state.chatV2.auraServerImage,
    state.chatV2.auraOverlayCoordinates,
    state.chatV2.socketId,
    state.VtoIconReducer.ButtonClick,
    state.chatV2.chatProductsData || [],
    state.chatV2.chatHistory,
  ]);
  //   console.log("auraServerImage", activeSearchOption);

  const {
    suggestions: { tags = [], title = "" },
  } = suggestionsWithProducts;

  const [showUploadImage, setShowUploadImage] = useState(true);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [chatImagePreviewUrl, setChatImagePreviewUrl] = useState("");
  const [isFigmaUploadPanelOpen, setIsFigmaUploadPanelOpen] = useState(false);
  const [isSearchOptionManuallySelected, setIsSearchOptionManuallySelected] =
    useState(false);
  const [submittedPromptPreview, setSubmittedPromptPreview] = useState({
    message: "",
    imageUrl: "",
  });
  const [firstSubmittedImageUrl, setFirstSubmittedImageUrl] = useState("");
  const [isSearchOptionsVisible, setIsSearchOptionsVisible] = useState(true);
  const [layoutMode, setLayoutMode] = useState("both"); // "left", "both", "right"
  const [isSearchPopupOpen, setIsSearchPopupOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isMobileOnly, setIsMobileOnly] = useState(false);
  const [mobileTab, setMobileTab] = useState("description"); // "description" or "products"
  const [selectActions, setSelectActions] = useState(null);

  // as parent component is ChatModal.js so to prevent re-render of parent component, useCallback is added
  const handleRegisterSelectActions = useCallback((actions) => {
    setSelectActions((prev) => {
      if (!actions) return null;
      if (!prev) return actions;
      
      const isSame = 
        prev.enableSelectProduct === actions.enableSelectProduct &&
        prev.selectedProducts?.length === actions.selectedProducts?.length &&
        prev.chatProductsDataToShow?.length === actions.chatProductsDataToShow?.length &&
        prev.isTagProductSelected === actions.isTagProductSelected &&
        prev.isTagProductsAllSelected === actions.isTagProductsAllSelected;
        
      if (isSame) {
        // Prevent infinite loop by returning the same reference if UI state hasn't changed.
        // We mutate prev with the new functions to avoid stale closures.
        Object.assign(prev, actions);
        return prev;
      }
      return actions;
    });
  }, []);

  const dispatch = useDispatch();
  const figmaUploadPanelRef = useRef(null);
  const openMobileSidebarRef = useRef(null);
  const chatImagePreviewObjectUrlRef = useRef("");

  const { sendMessage } = useChat();

  const clearLocalChatImagePreview = useCallback(() => {
    if (chatImagePreviewObjectUrlRef.current) {
      URL.revokeObjectURL(chatImagePreviewObjectUrlRef.current);
      chatImagePreviewObjectUrlRef.current = "";
    }
    setChatImagePreviewUrl("");
  }, []);

  const handleClearChatImage = useCallback(() => {
    clearLocalChatImagePreview();
    dispatch(setChatImageUrl("", chatTypeKey));
  }, [chatTypeKey, clearLocalChatImagePreview, dispatch]);

  const resetChatImageState = useCallback(() => {
    handleClearChatImage();
    setFirstSubmittedImageUrl("");
  }, [handleClearChatImage]);

  useEffect(() => {
    return () => {
      if (chatImagePreviewObjectUrlRef.current) {
        URL.revokeObjectURL(chatImagePreviewObjectUrlRef.current);
      }
    };
  }, []);

  const closeChatModal = () => {
    if (streaming) {
      onStopRecording();
    }
    sessionStorage.removeItem("widgetHeader");
    setLocalChatMessage("");
    setSubmittedPromptPreview({ message: "", imageUrl: "" });
    resetChatImageState();
    setIsSearchOptionManuallySelected(false);
    setIsSearchOptionsVisible(true);
    dispatch(setActiveSearchOption({})); // Reset active search option
    dispatch(setShowChatModal(false));
    showSubmitImageTooltip && setShowSubmitImageTooltip(false);
    window.history.back()

  };

  const handleGoBack = () => {
    setIsSearchOptionManuallySelected(false);
    setIsSearchOptionsVisible(true);
    dispatch(setActiveSearchOption({})); // Reset active search option
    dispatch(resetAuraSearchResponse());
    resetChatImageState();
    setLocalChatMessage("");
    setSubmittedPromptPreview({ message: "", imageUrl: "" });
    setIsFollowUpQuery(false)
    sessionStorage.removeItem('widgetHeaderRequestHistory')
    // window.history.back()
  };

  const handleHomeClick = () => {
    closeChatModal();
    navigate("/");
  };

  const handleBackToSelectedOption = () => {
    setIsSearchOptionManuallySelected(true);
    setIsSearchOptionsVisible(false);
    dispatch(resetAuraSearchResponse());
    resetChatImageState();
    setLocalChatMessage("");
    setSubmittedPromptPreview({ message: "", imageUrl: "" });
    setIsFollowUpQuery(false);
    sessionStorage.removeItem('widgetHeaderRequestHistory');
  };

  const {
    text: followUpQuery, //requestedText
    metadata: requestedMetaData,
    image_url: requestedImageUrl,
  } = widgetHeaderRequest;
  console.log('followUpQuery', followUpQuery);

  // Set default option on first load to Shop by Theme (smart_search).
  useEffect(() => {
    if (is_kiosk || !isEmpty(activeSearchOption) || isEmpty(searchOptions)) {
      return;
    }

    const shopByThemeDefault = searchOptions.find(
      (option) =>
        option?.id === CHAT_SEARCH_OPTION_ID.smart_search && option?.is_display,
    );
    const configuredDefault = searchOptions.find(
      (option) => option?.default && option?.is_display,
    );
    const firstVisibleOption = searchOptions.find(
      (option) => option?.is_display,
    );

    const defaultSelectedOption =
      shopByThemeDefault || configuredDefault || firstVisibleOption;

    if (defaultSelectedOption) {
      dispatch(setActiveSearchOption(defaultSelectedOption));
    }
  }, [searchOptions, is_kiosk, activeSearchOption, dispatch]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 1024);
      // setIsMobileOnly(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // useEffect(() => {
  // 	if (activeSearchOption?.description) {
  // 		dispatch(setAuraHelperMessage(activeSearchOption.description || ""));
  // 	}
  // }, [activeSearchOption?.description]);

  // useOnClickOutside(modalRef, () => {
  // 	!disabledOutSideClick && closeChatModal();
  // });

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

  const handleSetSearchOption = useCallback(
    (option) => {
      setIsSearchOptionManuallySelected(true);
      setLocalChatMessage("");
      sessionStorage.removeItem('widgetHeaderRequestHistory')
      setSubmittedPromptPreview({ message: "", imageUrl: "" });
      resetChatImageState();
      sessionStorage.removeItem("widgetHeader");
      if (option.id === CHAT_SEARCH_OPTION_ID.trending_collections) {
        dispatch(setShowChatModal(false));
        navigate(`/#${COLLECTIONS_ID}`); // navigate on root page for trending_collections search option, scroll to first collection of root page
      } else {
        dispatch(setActiveSearchOption(option));
        dispatch(resetAuraSearchResponse()); // reset AURA response when change search option
        setIsSearchOptionsVisible(false); // Collapse options when one is selected
      }
    },
    [searchOptions],
  );

  const handleFollowUpSearch = useCallback(() => {
    setIsFollowUpQuery((value) => !value);
    dispatch(setChatMessage(""));
    inputRef?.current?.focus();
  }, [inputRef.current]);

  const displaySearchOptions = useMemo(
    () => searchOptions.filter((v) => v?.is_display),
    [searchOptions],
  );

  const isSuggestionsWithProductsAvailable = useMemo(
    () =>
      Object.values(suggestionsWithProducts).some((value) => !isEmpty(value)),
    [suggestionsWithProducts],
  );

  const showChatResponse = useMemo(
    () =>
      widgetHeader ||
      widgetImage ||
      !isEmpty(shopALookData) ||
      !isEmpty(chatProductsData) ||
      isSuggestionsWithProductsAvailable,
    [
      widgetHeader,
      widgetImage,
      shopALookData,
      chatProductsData,
      isSuggestionsWithProductsAvailable,
    ],
  );

  const isShowFollowUpQuery = useMemo(
    () => isFollowUpQuery && followUpQuery,
    [isFollowUpQuery, followUpQuery],
  );

  // showing random examples from selected search option
  const selectedSearchOptionExamples = useMemo(
    () => getRandomArrayElements(activeSearchOption.examples, 4),
    [activeSearchOption.examples],
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

  const isSidExpired = useMemo(
    () => socket.id === socketId,
    [socket.id, socketId],
  );

  const isShowTryAgain = useMemo(
    () => followUpQuery || requestedImageUrl,
    [followUpQuery, requestedImageUrl],
  );

  const isActiveSearchOptionAvailable = useMemo(
    () => !isEmpty(activeSearchOption),
    [activeSearchOption],
  );

  const isShowAuraResponse = useMemo(
    () => showChatResponse && isActiveSearchOptionAvailable,
    [showChatResponse, isActiveSearchOptionAvailable],
  );


  const shouldHighlightActiveSearchOption = useMemo(
    () => isSearchOptionManuallySelected || isShowAuraResponse,
    [isSearchOptionManuallySelected, isShowAuraResponse],
  );

  const isShowKioskSearchOptions = useMemo(
    () => is_kiosk && !isActiveSearchOptionAvailable,
    [is_kiosk, isActiveSearchOptionAvailable],
  );

  const shouldCenterModalContent = useMemo(
    () => !isShowAuraResponse && !isSearchOptionManuallySelected,
    [isShowAuraResponse, isSearchOptionManuallySelected],
  );

  const isShopALookOptionActive = useMemo(
    () => activeSearchOption?.id === CHAT_SEARCH_OPTION_ID.shop_a_look,
    [activeSearchOption?.id],
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

  const isAllowedSplitLayout = useMemo(
    () =>
      [
        CHAT_SEARCH_OPTION_ID.smart_search,
        CHAT_SEARCH_OPTION_ID.product_search,
        CHAT_SEARCH_OPTION_ID.complete_the_look,
        CHAT_SEARCH_OPTION_ID.shop_a_look,
      ].includes(activeSearchOption?.id),
    [activeSearchOption?.id],
  );

  const shouldUseLegacyImageSearchLayout = useMemo(
    () => activeSearchOption.allow_image_search && !isShopALookOptionActive,
    [activeSearchOption.allow_image_search, isShopALookOptionActive],
  );

  const isShowSubmittedChatPreview = useMemo(
    () =>
      !isFigmaUploadPanelOpen &&
      !shouldUseLegacyImageSearchLayout &&
      !!submittedPromptPreview.imageUrl &&
      showChatLoader,
    [
      isFigmaUploadPanelOpen,
      shouldUseLegacyImageSearchLayout,
      submittedPromptPreview.imageUrl,
      showChatLoader,
    ],
  );

  const shouldMoveInputBelowResults = useMemo(
    () =>
      !isBTNormalUserLoggedIn &&
      ([
        CHAT_SEARCH_OPTION_ID.shop_a_look,
        CHAT_SEARCH_OPTION_ID.smart_search,
        CHAT_SEARCH_OPTION_ID.complete_the_look,
      ].includes(activeSearchOption?.id) ||
        (isMobile && activeSearchOption?.id === CHAT_SEARCH_OPTION_ID.product_search)) &&
      isShowAuraResponse &&
      (!shouldUseLegacyImageSearchLayout || activeSearchOption?.id === CHAT_SEARCH_OPTION_ID.complete_the_look),
    [
      isBTNormalUserLoggedIn,
      activeSearchOption?.id,
      isShowAuraResponse,
      shouldUseLegacyImageSearchLayout,
      isMobile,
    ],
  );

  const isShowShopLookSplitLayout = useMemo(
    () =>
      (isShopALookOptionActive ||
        isShopByThemeOptionActive ||
        isCompleteTheLookOptionActive ||
        isProductSearchOptionActive) &&
      (widgetHeader || !isEmpty(shopALookData) || !isEmpty(products) || !isEmpty(chatProductsData)),
    [
      isShopALookOptionActive,
      isShopByThemeOptionActive,
      isCompleteTheLookOptionActive,
      isProductSearchOptionActive,
      widgetHeader,
      shopALookData,
      products,
      chatProductsData,
    ],
  );
  console.log('isShowShopLookSplitLayout',isShowShopLookSplitLayout);
  console.log('layoutMode', layoutMode);
  
  

  const searchOptionPreviewImages = useMemo(
    () => ({
      [CHAT_SEARCH_OPTION_ID.smart_search]: iconShopByTheme,
      [CHAT_SEARCH_OPTION_ID.shop_a_look]: iconShopTheLook,
      [CHAT_SEARCH_OPTION_ID.complete_the_look]: iconCompleteTheLook,
      [CHAT_SEARCH_OPTION_ID.product_search]: iconSearch,
      [CHAT_SEARCH_OPTION_ID.trending_collections]: iconTrendingCollections,
    }),
    [],
  );

  const cardCollageVariants = useMemo(
    () => ({
      [CHAT_SEARCH_OPTION_ID.shop_a_look]:
        styles["chatmodal-search-option-image-collage-shop_a_look"],
      [CHAT_SEARCH_OPTION_ID.complete_the_look]:
        styles["chatmodal-search-option-image-collage-complete_the_look"],
      [CHAT_SEARCH_OPTION_ID.smart_search]:
        styles["chatmodal-search-option-image-collage-smart_search"],
      [CHAT_SEARCH_OPTION_ID.product_search]:
        styles["chatmodal-search-option-image-collage-product_search"],
    }),
    [],
  );

  const getImageSrc = (image) => image?.src || image;

  const handleUploadChatImage = useCallback(
    async (file) => {
      if (!file) return;

      if (typeof URL !== "undefined" && typeof Blob !== "undefined" && file instanceof Blob) {
        if (chatImagePreviewObjectUrlRef.current) {
          URL.revokeObjectURL(chatImagePreviewObjectUrlRef.current);
        }
        const objectUrl = URL.createObjectURL(file);
        chatImagePreviewObjectUrlRef.current = objectUrl;
        setChatImagePreviewUrl(objectUrl);
      }

      try {
        setIsUploadingImage(true);
        dispatch(setChatImageUrl("", chatTypeKey));
        const response = await profileAPIs.uploadImage({ file });
        const imageUrl = response?.data?.data?.[0]?.url;

        if (imageUrl) {
          clearLocalChatImagePreview();
          setChatImagePreviewUrl(imageUrl);
          dispatch(setChatImageUrl(imageUrl, chatTypeKey));
          // Close panel after upload - the pill will show in the main input
          setIsFigmaUploadPanelOpen(false);
          return;
        }

        clearLocalChatImagePreview();
        dispatch(setChatImageUrl("", chatTypeKey));
        notification.error({
          message: "Image Upload Failed",
          description: "Something went wrong. Please try again.",
        });
      } catch (error) {
        clearLocalChatImagePreview();
        dispatch(setChatImageUrl("", chatTypeKey));
        dispatch(setShowChatLoader(false, chatTypeKey)); // stop loader on aura search is any error
        notification.error({
          message: "Image Upload Failed",
          description:
            error?.response?.data?.message || "Unexpected error occurred",
        });
      } finally {
        setIsUploadingImage(false);
      }
    },
    [chatTypeKey, clearLocalChatImagePreview, dispatch],
  );

  const uploadImageProps = {
    accept: "image/*",
    multiple: false,
    customRequest: async ({ file, onSuccess, onError }) => {
      try {
        await handleUploadChatImage(file);
        onSuccess?.("ok");
      } catch (error) {
        onError?.(error);
      }
    },
  };

  const [localChatMessage, setLocalChatMessage] = useState("");
  const [prevShowChatLoader, setPrevShowChatLoader] = useState(showChatLoader);

  if (showChatLoader !== prevShowChatLoader) {
    setPrevShowChatLoader(showChatLoader);
    if (!showChatLoader && prevShowChatLoader) {
      setLocalChatMessage("");
    }
  }

  const debounceDispatch = useMemo(() => createDebouncedFunction((value) => {
    dispatch(setChatMessage(value, chatTypeKey));
    setIsSendSocketMessageWithPrefix(true);
  }, 300), [chatTypeKey, dispatch]);

  useEffect(() => () => debounceDispatch.cancel(), [debounceDispatch]);

  const handleInputChange = (e) => {
    const { value } = e.target;
    setLocalChatMessage(value);

    debounceDispatch(value);
  };

  const handleUploadImageModeChange = () => {
    handleClearChatImage();
    setShowUploadImage((value) => !value);
  };

  const handleFigmaUploadButtonClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFigmaUploadPanelOpen((value) => !value);
  };

  const handleFigmaImageUrlChange = (e) => {
    clearLocalChatImagePreview();
    setChatImagePreviewUrl(e.target.value);
    dispatch(setChatImageUrl(e.target.value, chatTypeKey));
  };

  const handleTryExampleClick = () => {
    const exampleText = activeSearchOption?.text_example;
    if (exampleText) {
      setLocalChatMessage(exampleText);
      dispatch(setChatMessage(exampleText, chatTypeKey));
      setIsSendSocketMessageWithPrefix(true);
      // Focus input field
      inputRef.current?.focus();
    }
  };

  const [nextPage, setNextPage] = useState(true);
  const [ipp, setIpp] = useState(15);
  const [currentPage, setCurrentPage] = useState(0);
  const [regenarateImage, setRegenarateImage] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);

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
      isImageFollowUp && primaryImageUrl && chatImageUrl && chatImageUrl !== primaryImageUrl
        ? chatImageUrl
        : "";

    if (followUpImageUrl) {
      metadata.followup_image_url = followUpImageUrl;
    } else {
      delete metadata.followup_image_url;
    }

    setIsFollowUpQuery(true)
    const userMetadata = {
      brand: authUser?.filters?.[current_store_name]?.strict?.brand || [],
    };

    const HISTORY_KEY = "widgetHeaderRequestHistory";
    if (localChatMessage) {
      const raw = sessionStorage.getItem(HISTORY_KEY);
      // console.log('raw',raw);

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
        // keep history bounded to 20 entries
        if (history.length > 20) history.shift();
        sessionStorage.setItem(HISTORY_KEY, JSON.stringify(history));
      }
    }

    dispatch(chatHistoryAction(JSON.parse(sessionStorage.getItem('widgetHeaderRequestHistory'))));

    if (localChatMessage || chatImageUrl) {
      // Condition 1 → smart_search follow-up image send
      const sendImageSmartSearch =
        chatImageUrl &&
        isFollowUpQuery &&
        activeSearchOption?.id === "smart_search";

      // Condition 2 → shop_a_look image send
      const sendImageShopLook =
        chatImageUrl && activeSearchOption?.id === "shop_a_look";

      // Condition 3 → complete_the_look image send
      const sendImageCompleteLook =
        chatImageUrl && activeSearchOption?.id === "complete_the_look";

      const sendAllowedImageSearch =
        chatImageUrl && activeSearchOption?.allow_image_search;
      const shouldSendCurrentImage =
        sendAllowedImageSearch ||
        sendImageSmartSearch ||
        sendImageShopLook ||
        sendImageCompleteLook;

      // Final image value to send
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
      // setLocalChatMessage('')
      //  setIsImageLoading(false);
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

  useEffect(() => {
    if (!isFigmaUploadPanelOpen) return undefined;

    const handleClickOutside = (event) => {
      if (
        figmaUploadPanelRef.current &&
        !figmaUploadPanelRef.current.contains(event.target)
      ) {
        // setIsFigmaUploadPanelOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isFigmaUploadPanelOpen]);

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
        chatImageUrl && (isFollowUpQuery || chatImageUrl)
          ? chatImageUrl
          : "",
        metadata,
        userMetadata,
      );
      dispatch(setAuraHelperMessage(activeSearchOption?.search_message));
    }
  };
  const { sendSocketClientMessage } = useContext(SocketContext);
  const handleRegenrateImage = () => {
    // flip regenerate flag off and enable image loading UI
    setRegenarateImage(false);
    dispatch(setAuraSreverImage(''));
    setIsImageLoading(true);
    // const chatTypeKey = CHAT_TYPE_CHAT;
    // dispatch(setShowChatLoader(true,chatTypeKey));
    // console.log('hii');

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
      imageGenerate
    });

    if (localChatMessage || chatImageUrl) {
      submitChatInput(localChatMessage, null, metadata, null, imageGenerate);
      dispatch(setAuraHelperMessage(activeSearchOption?.search_message));
    }
    // keep isImageLoading true until auraServerImage/widgetImage arrives
    //  dispatch(setShowChatLoader(false,chatTypeKey));
  };

  useEffect(() => {
    // When server or widget image arrives, stop image loading and reset regenerate flag
    if (auraServerImage || widgetImage) {
      const imageToUse = auraServerImage || widgetImage;
      // dispatch(setChatImageUrl(imageToUse));
      handleClearChatImage();
      setIsImageLoading(false);
      setRegenarateImage(true);
    }
  }, [auraServerImage, handleClearChatImage, widgetImage]);

  // Original image size (1024x1024)
  const originalWidth = 1024;
  const originalHeight = 1027;

  // New image size
  const newWidth = 404;
  const newHeight = 400;

  const imgRef = useRef(null);
  const [renderedSize, setRenderedSize] = useState({ width: 0, height: 0 });

  const handleImageLoad = () => {
    if (imgRef.current) {
      setRenderedSize({
        width: imgRef.current.clientWidth,
        height: imgRef.current.clientHeight,
      });
    }
  };

  const handleSuggestionClick = (tag) => {
    if (tags.includes(tag)) {
      dispatch(setSuggestionsSelectedTag(tag));
    }
    // Scroll to the tag div
    const tagElement = document.getElementById(`tag-${tag}`);
    if (tagElement) {
      tagElement.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  // when image changed clear all fields
  const handleChangeImageConfirm = () => {
    resetChatImageState();
    setLocalChatMessage("");
    setSubmittedPromptPreview({ message: "", imageUrl: "" });
    setRegenarateImage(false);
    // Clear any other related state if needed
    dispatch(resetAuraSearchResponse());
    dispatch(setWidgetHeader(""));
    dispatch(setWidgetImage(""));
    dispatch(setChatProducts([]));
    dispatch(setChatProductsData([]));
    dispatch(setChatShopALook([]));
    setIsSearchOptionManuallySelected(true)
    sessionStorage.removeItem('widgetHeaderRequestHistory')
    sessionStorage.removeItem("widgetHeader");
  };

  return (
    <div
      className={`${styles["chatmodal-modal-container"]} ${getCurrentTheme()} ${isShowShopLookSplitLayout ? styles["chatmodal-modal-container-fixed"] : ""} ${shouldCenterModalContent ? "justify-center" : ""} `}
      id="chatmodal_modal_container"
      // ref={modalRef}
    >
      {/* hide close icon for AuraChatPage */}
      {!isAuraChatPage ? (
        <>
          {isShowAuraResponse && isProductSearchOptionActive && !isMobile ? (
            <div className="sticky top-0 left-0 right-0 z-[1000] bg-white border-b border-[#e9e4ff] px-3 md:px-6 py-2.5 md:py-3 flex items-center justify-between gap-2 md:gap-4 shadow-xs w-full">
              {/* Left side: Arrow mark and Search written */}
              <div className="flex items-center gap-2 md:gap-3 shrink-0">
                <ArrowLeftOutlined
                  className="text-lg md:text-xl text-[#111827] cursor-pointer hover:opacity-80 transition-opacity pr-1 md:pr-2"
                  onClick={handleGoBack}
                />
                <span className={styles["chatmodal-navbar-title"]}>
                  {activeSearchOption?.title?.toUpperCase() || "SEARCH"}
                </span>
              </div>

              {/* Center side: Embedded Search Bar */}
              <div className="flex-1 max-w-2xl mx-1 md:mx-6 relative">
                <div
                  className="w-full border-[1.5px] border-[#cfc7ff] bg-white rounded-full flex items-center px-3 md:px-4 py-1.5 md:py-2 shadow-2xs"
                >
                  {!isShopByThemeOptionActive && (
                    <button
                      type="button"
                      className="bg-transparent border-none p-0 flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity mr-2 md:mr-3 shrink-0"
                      title="Open assistant settings"
                      onClick={handlePromptUtilityClick}
                    >
                      <img src={page_info?.src} alt="Assistant settings" className="w-4 h-4 md:w-5 md:h-5 object-contain" />
                    </button>
                  )}

                  <input
                    id={`chat_navbar_search_input_${chatTypeKey}`}
                    type="text"
                    ref={inputRef}
                    placeholder={
                      typeof activeSearchOption?.text_placeholder === "string"
                        ? activeSearchOption?.text_placeholder
                        : activeSearchOption?.text_placeholder?.[0] ||
                        "Describe your product idea"
                    }
                    name="chat_message"
                    value={localChatMessage}
                    onChange={handleInputChange}
                    onKeyDown={handlePromptKeyDown}
                    className="flex-1 bg-transparent border-none outline-none text-[#384467] placeholder-[#8f96a8] text-sm md:text-base font-medium min-w-0"
                  />
                  {localChatMessage && (
                    <CloseCircleFilled
                      className="text-[#8f96a8] hover:text-secondary cursor-pointer text-xs md:text-sm mx-1.5 transition-colors"
                      onClick={() => setLocalChatMessage("")}
                    />
                  )}

                  <button
                    type="button"
                    className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-secondary text-white flex items-center justify-center border-none cursor-pointer hover:bg-[#6660de] transition-colors ml-1.5 shrink-0 disabled:bg-[#dcd9f8] disabled:cursor-not-allowed"
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

              {/* Right side: Close Icon */}
              <div className="shrink-0 flex items-center">
                <CloseOutlined
                  id="chat_modal_close_icon"
                  onClick={closeChatModal}
                  className="text-lg md:text-xl text-[#111827] cursor-pointer hover:opacity-80 transition-opacity p-1"
                />
              </div>
            </div>
          ) : (
            <>
              {/* Desktop Close/Layout Header */}
              {!(isShowShopLookSplitLayout && layoutMode !== "left" && !isMobile) && (
                <div className={`${styles["chatmodal-content-max-width"]} ${isMobile ? styles["chatmodal-hidden-mobile"] : ""}`}>
                   <button
                          className="group text-gray-500 flex w-fit items-center gap-2 rounded-full   py-2 button-kiosk font-medium   transition "
                          onClick={closeChatModal}
                        >
                          <span className=" leading-none flex transition group-hover:-translate-x-0.5">
                            <ArrowLeftOutlined />
                          </span>
                          <span className="capitalize">Go back</span>
                        </button>
                  {/* <CloseOutlined
                    id="chat_modal_close_icon"
                    onClick={closeChatModal}
                    className={styles["chatmodal-close-icon"]}
                  /> */}
                </div>
              )}

              {/* Mobile Sticky Navbar */}
              {isMobile && isActiveSearchOptionAvailable && isShowAuraResponse && (
                <div className={styles["chatmodal-mobile-navbar-sticky"]}>
                  <div className={styles["chatmodal-mobile-navbar-top"]}>
                    {selectActions && selectActions.enableSelectProduct ? (
                      // Selection mode active on mobile navbar
                      <div className="flex items-center justify-between w-full bg-[#f3f0ff] px-3 py-1.5 rounded-lg transition-all duration-300">
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
                          <span className="text-xs font-semibold text-[#384467]">
                            {selectActions.selectedProducts.length} selected
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {selectActions.is_store_instance && (
                            <button
                              type="button"
                              className="rounded-full px-2.5 py-1 text-white font-bold bg-secondary text-xs flex items-center gap-1 shadow-sm border-none cursor-pointer hover:opacity-90 transition-all disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
                              onClick={(e) => selectActions.onAddSelectedProductsToCollection(e, { isSave: true })}
                              disabled={selectActions.selectedProducts.length === 0}
                              title="Save to collection"
                            >
                              <FolderAddOutlined className="text-xs" style={{ stroke: "currentColor", strokeWidth: 1.5 }} />
                              <span>Save</span>
                            </button>
                          )}
                          <button
                            type="button"
                            className="rounded-full px-2.5 py-1 text-white font-bold bg-secondary text-xs flex items-center gap-1 shadow-sm border-none cursor-pointer hover:opacity-90 transition-all disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
                            onClick={(e) => selectActions.onAddSelectedProductsToCollection(e, { isShare: true })}
                            disabled={selectActions.selectedProducts.length === 0}
                            title="Share collection"
                          >
                            <ShareAltOutlined className="text-xs" style={{ stroke: "currentColor", strokeWidth: 1.5 }} />
                            <span>Share</span>
                          </button>
                          <button
                            type="button"
                            className="bg-transparent border-none p-0 flex items-center justify-center cursor-pointer text-[#384467] hover:opacity-80 transition-opacity ml-1"
                            onClick={() => selectActions.handleResetSelectProduct()}
                            title="Cancel selection"
                          >
                            <CloseOutlined className="text-[16px]" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      // Normal mode on mobile navbar
                      <>
                        <div className={styles["chatmodal-mobile-navbar-left"]}>
                          {/* Hamburger button - opens mobile side drawer */}
                          <button
                            type="button"
                            className="flex items-center justify-center w-8 h-8 cursor-pointer bg-transparent border-none p-0 shrink-0"
                            onClick={() => openMobileSidebarRef.current && openMobileSidebarRef.current()}
                            title="Menu"
                            aria-label="Open sidebar menu"
                          >
                            <MenuOutlined className="text-[#111827] text-[18px]" />
                          </button>
                          { isMobileOnly ? ( 
                            <span className="text-base  font-semibold text-[#111827] select-none ml-3 truncate max-w-[180px] md:max-w-none">
                              {activeSearchOption?.title}
                            </span>
                           ) : ( 
                            <div className="flex items-center    gap-1.5 ml-2 text-sm font-medium text-[#4c5672] select-none">
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
                              <span className="text-[#1a1a1a] font-semibold truncate max-w-[110px] md:max-w-none">
                                {activeSearchOption?.title}
                              </span>
                            </div>
                           )} 
                        </div>
                        <div className="flex items-center gap-2">

                          <CloseOutlined
                            onClick={closeChatModal}
                            className={styles["chatmodal-mobile-close-icon"]}
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Standalone Mobile Close Icon when navbar is hidden */}
              {isMobile && (!isActiveSearchOptionAvailable || !isShowAuraResponse) && (
                <div className='px-3'>
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
          {(isProductSearchOptionActive ? (isSearchPopupOpen || !isShowAuraResponse) : !isShowShopLookSplitLayout) && (
            <div
              className={isSearchPopupOpen ? styles["chatmodal-search-popup-overlay"] : ""}
              onClick={() => isSearchPopupOpen && setIsSearchPopupOpen(false)}
            >
              <div
                className={isSearchPopupOpen ? styles["chatmodal-search-popup-content"] : ""}
                onClick={(e) => isSearchPopupOpen && e.stopPropagation()}
              >
                {/* {isSearchPopupOpen && ( */}
                  {/* <CloseOutlined
                    className={styles["chatmodal-search-popup-close"]}
                    onClick={() => setIsSearchPopupOpen(false)}
                  /> */}
                {/* )} */}
                  {/* <button
                          className="group px-3 mt-7 text-gray-500 flex w-fit items-center gap-2 rounded-full   py-2 button-kiosk font-medium   transition "
                          onClick={closeChatModal}
                        >
                          <span className=" leading-none flex transition group-hover:-translate-x-0.5">
                            <ArrowLeftOutlined />
                          </span>
                          <span className="capitalize">Go back</span>
                        </button> */}
                <div
                  className={`${styles["chatmodal-content-wrapper"]} ${isSearchOptionManuallySelected ? styles["chatmodal-content-wrapper-collapsed"] : styles["chatmodal-content-wrapper-border"]
                    } `}
                >
                  <div className={styles["chatmodal-content-inner"]}>
                    {!isSearchOptionManuallySelected &&
                      <div className={styles["chatmodal-header-section"]}>
                        <div className={styles["chatmodal-header-row"]}>
                          <img
                            src={getImageSrc(star_ai_icon)}
                            width={200}
                            height={200}
                            className={styles["chatmodal-header-icon"]}
                            alt="AURA"
                          />
                          <div className={styles["chatmodal-header-text-block"]}>
                            <h1 className={styles["chatmodal-header-title"]}>
                              <span
                                className={styles["chatmodal-header-title-primary"]}
                              >
                                I'm AURA,
                              </span>
                              <br />
                              <span
                                className={styles["chatmodal-header-title-secondary"]}
                              >
                                How can I help you?
                              </span>
                            </h1>
                          </div>
                        </div>
                      </div>
                    }

                    <div
                      className={
                        styles["chatmodal-content-max-width"]
                      }
                    >
                      <div className={styles["chatmodal-options-collapsible"]}>
                        {isSearchOptionManuallySelected && !isSearchOptionsVisible && (
                          <>
                            <div className={`${styles["chatmodal-options-toggle-btn-container"]} ${styles["chatmodal-toggle-desktop-only"]}`}>
                              <div
                                className={styles["chatmodal-options-toggle-btn"]}
                                onClick={() => setIsSearchOptionsVisible(!isSearchOptionsVisible)}
                                title={isSearchOptionsVisible ? "Collapse search options" : "Expand search options"}
                              >
                                <CaretDownFilled
                                  className={`${styles["chatmodal-toggle-icon"]} ${!isSearchOptionsVisible ? "" : styles["chatmodal-toggle-icon-up"]
                                    }`}
                                />
                              </div>
                            </div>
                            <div className={`${styles["chatmodal-mini-tabs"]} ${styles["chatmodal-toggle-mobile-only"]} w-full gap-1 overflow-x-auto justify-center py-2 px-1 mb-2`}>
                              {displaySearchOptions?.map((searchOptions, index) => {
                                const isOptionActive = searchOptions?.id === activeSearchOption?.id;
                                const previewImage = searchOptionPreviewImages[searchOptions.id] || [auraCardOne, auraCardThree, auraCardThree][index % 3];
                                return (
                                  <div
                                    key={`mini-${searchOptions.id}`}
                                    className={`flex-1 min-w-[58px] max-w-[130px] flex flex-col items-center justify-center p-1 rounded-xl cursor-pointer transition-all border ${isOptionActive ? 'border-[#857cf0] bg-secondary-50' : 'border-[#e2e8f0] bg-white hover:bg-gray-50'}`}
                                    style={{ height: '70px' }}
                                    onClick={() => handleSetSearchOption(searchOptions)}
                                  >
                                    <div className="w-6 h-6 rounded bg-[#e8e4ff] flex items-center justify-center mb-1">
                                      <img
                                        src={getImageSrc(previewImage)}
                                        className="w-4 h-4 object-contain"
                                        alt={searchOptions.title}
                                      />
                                    </div>
                                    <span className={`text-[9px] sm:text-[10px] text-center leading-tight font-medium ${isOptionActive ? 'text-secondary' : 'text-[#4c5672]'}`}>
                                      {searchOptions.title}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </>
                        )}
                        <div
                          className={`${styles["chatmodal-options-grid-container"]} ${!isSearchOptionsVisible ? styles["chatmodal-options-grid-hidden"] : ""
                            }`}
                        >
                          {!isSearchOptionManuallySelected &&
                            <p className={styles["chatmodal-header-subtext"]}>
                              Choose one to get started
                            </p>
                          }
                          {!isBTNormalUserLoggedIn ? (
                            <>
                              <div
                                className={`grid ${displaySearchOptions?.length === 1
                                  ? "grid-cols-1"
                                  : displaySearchOptions?.length === 2
                                    ? "lg:grid-cols-2 grid-cols-1"
                                    : displaySearchOptions?.length === 3
                                      ? "lg:grid-cols-3 grid-cols-1"
                                      : displaySearchOptions?.length === 4
                                        ? "lg:grid-cols-4 grid-cols-1"
                                        : "lg:grid-cols-5 grid-cols-1"
                                  }  w-full gap-4 lg:gap-5 overflow-x-auto scroll-snap-type-x-proximity `}
                              >
                                {displaySearchOptions?.map((searchOptions, index) => {
                                  const isOptionActive =
                                    searchOptions?.id === activeSearchOption?.id &&
                                    shouldHighlightActiveSearchOption;
                                  const previewImage =
                                    searchOptionPreviewImages[searchOptions.id] ||
                                    [auraCardOne, auraCardThree, auraCardThree][index % 3];
                                  const previewImageSrc = getImageSrc(previewImage);
                                  const collageVariantClass =
                                    cardCollageVariants[searchOptions.id] ||
                                    styles[
                                    "chatmodal-search-option-image-collage-default"
                                    ];

                                  return (
                                    <div
                                      key={searchOptions.id}
                                      className={`${styles["chatmodal-search-option-card"]} ${isOptionActive
                                        ? styles["chatmodal-search-option-card-active"]
                                        : ""
                                        } relative flex items-center gap-2 p-3`}
                                      onClick={() => handleSetSearchOption(searchOptions)}
                                      role="button"
                                      tabIndex={0}
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter" || e.key === " ") {
                                          handleSetSearchOption(searchOptions);
                                        }
                                      }}
                                    >
                                      <div
                                        className={`${styles["chatmodal-search-option-image-wrapper"]} flex-shrink-0`}
                                      >
                                        <img
                                          src={previewImageSrc}
                                          className={styles["chatmodal-search-option-image"]}
                                          alt={searchOptions.title}
                                        />
                                      </div>
                                      <div
                                        className={
                                          styles["chatmodal-search-option-content"]
                                        }
                                      >
                                        <div
                                          className={`${styles["chatmodal-search-option-text-content"]} ${isOptionActive
                                            ? styles[
                                            "chatmodal-search-option-text-content-active"
                                            ]
                                            : ""
                                            }`}
                                        >
                                          <div
                                            className={`${styles["chatmodal-search-option-title"]} ${isOptionActive
                                              ? styles[
                                              "chatmodal-search-option-title-active"
                                              ]
                                              : ""
                                              }`}
                                          >
                                            {searchOptions.title}
                                          </div>
                                          <div
                                            className={`${styles["chatmodal-search-option-subtitle"]} ${isOptionActive
                                              ? styles[
                                              "chatmodal-search-option-subtitle-active"
                                              ]
                                              : ""
                                              } `}
                                          >
                                            {searchOptions.subTitle}
                                          </div>
                                          {isOptionActive &&
                                            searchOptions?.text_example &&
                                            searchOptions?.id !==
                                            CHAT_SEARCH_OPTION_ID.complete_the_look && (
                                              <div className="flex w-full pb-2 justify-start">
                                                <button
                                                  type="button"
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleTryExampleClick();
                                                  }}
                                                  className="text-xs z-30 bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-800 px-2 py-1 rounded transition-all hover:scale-105 font-medium"
                                                  title="Fill input with example text"
                                                >
                                                  Try an Example
                                                </button>
                                              </div>
                                            )}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </>
                          ) : null}
                        </div>
                      </div>

                      {isShowFollowUpQuery ? (
                        <div className={styles["chatmodal-followup-query-container"]}>
                          <HistoryOutlined
                            className={styles["chatmodal-followup-query-icon"]}
                          />
                          <div className={styles["chatmodal-followup-query-text"]}>
                            {followUpQuery}
                          </div>
                        </div>
                      ) : null}

                      {(isBTNormalUserLoggedIn ||
                        isActiveSearchOptionAvailable ||
                        !isShowAuraResponse)
                        ? (
                          <div>
                            <div className={styles["chatmodal-figma-input-section"]}>
                              {activeSearchOption && (
                                <>
                                  {auraServerImage &&
                                    activeSearchOption.id === "smart_search" && (
                                      <>
                                        {!showChatLoader ? (
                                          <div
                                            style={{ width: "fit-content", position: 'relative' }}
                                            className={
                                              styles["chatmodal-figma-upload-popover "]
                                            }
                                          >
                                            <img
                                              className={styles["chatmodal-server-image"]}
                                              src={auraServerImage}
                                              alt="Aura Image"
                                            />
                                            {Array.isArray(auraOverlayCoordinates) &&
                                              auraOverlayCoordinates.map((item, index) => {
                                                const adjustedX =
                                                  (item.point[0] / originalWidth) * newWidth;
                                                const adjustedY =
                                                  (item.point[1] / originalHeight) *
                                                  newHeight;

                                                return (
                                                  <Tooltip
                                                    key={index}
                                                    title={item.attributes.label}
                                                    color="blue"
                                                  >
                                                    <div
                                                      onClick={() =>
                                                        handleSuggestionClick(
                                                          item.attributes.label,
                                                        )
                                                      }
                                                      className={
                                                        styles["chatmodal-overlay-point"]
                                                      }
                                                      style={{
                                                        left: `${adjustedX}px`,
                                                        top: `${adjustedY}px`,
                                                        boxShadow:
                                                          "0 0 10px rgba(0, 123, 255, 0.8)",
                                                      }}
                                                    />
                                                  </Tooltip>
                                                );
                                              })}
                                          </div>
                                        ) : (
                                          <div
                                            className={
                                              styles[
                                              "chatmodal-server-image-spinner-container"
                                              ]
                                            }
                                          >
                                            <Spin size="large" />
                                          </div>
                                        )}
                                      </>
                                    )}

                                  <div className={`${styles["chatmodal-initial-layout-wrapper"]} ${(!isShowAuraResponse && isAllowedSplitLayout && !isSearchOptionsVisible) ? styles["chatmodal-initial-layout-wrapper-active"] : ""}`}>
                                    {isSearchOptionManuallySelected && (
                                      <div className={isAllowedSplitLayout ? styles["chatmodal-title-group"] : ""}>
                                        <h2 className={styles["chatmodal-category-title"]}>
                                          {activeSearchOption?.title?.toUpperCase()}
                                        </h2>
                                        <p className={styles["chatmodal-initial-layout-wrapperp"]}> {activeSearchOption?.description} </p>
                                        {isAllowedSplitLayout &&
                                          activeSearchOption?.text_example &&
                                          activeSearchOption?.id !== CHAT_SEARCH_OPTION_ID.complete_the_look &&
                                          activeSearchOption?.id !== CHAT_SEARCH_OPTION_ID.shop_a_look && (
                                            <button
                                              type="button"
                                              className={styles["chatmodal-try-example-centered"]}
                                              onClick={handleTryExampleClick}
                                            >
                                              Try an Example
                                            </button>
                                          )}
                                      </div>
                                    )}

                                    {activeSearchOption.allow_image_search && (
                                      <div
                                        className={
                                          styles[
                                          chatImageUrl
                                            ? ""
                                            : "chatmodal-figma-upload-popover"
                                          ]
                                        }
                                      >

                                        {chatImageUrl ? (
                                          <div
                                            className={
                                              styles[
                                              "chatmodal-figma-image-preview-container"
                                              ]
                                            }
                                            style={{ position: "relative" }}
                                          >
                                            <img
                                              src={chatImageUrl}
                                              alt="Uploaded Image"
                                              className={
                                                styles["chatmodal-figma-image-preview"]
                                              }
                                            />
                                            {Array.isArray(auraOverlayCoordinates) &&
                                              auraOverlayCoordinates.map(
                                                (item, index) => {
                                                  const adjustedX =
                                                    (item.point[0] / originalWidth) *
                                                    newWidth;
                                                  const adjustedY =
                                                    (item.point[1] / originalHeight) *
                                                    newHeight;

                                                  return (
                                                    <Tooltip
                                                      key={index}
                                                      title={item.attributes.label}
                                                      color="blue"
                                                    >
                                                      <div
                                                        onClick={() =>
                                                          handleSuggestionClick(
                                                            item.attributes.label,
                                                          )
                                                        }
                                                        className={
                                                          styles[
                                                          "chatmodal-overlay-point"
                                                          ]
                                                        }
                                                        style={{
                                                          left: `${adjustedX}px`,
                                                          top: `${adjustedY}px`,
                                                          boxShadow:
                                                            "0 0 10px rgba(0, 123, 255, 0.8)",
                                                        }}
                                                      />
                                                    </Tooltip>
                                                  );
                                                },
                                              )}
                                            <div
                                              className={
                                                styles["chatmodal-figma-change-image-btn"]
                                              }
                                            >
                                              <button
                                                type="button"
                                                onClick={handleChangeImageConfirm}
                                                className={
                                                  styles["chatmodal-figma-change-btn"]
                                                }
                                              >
                                                Change Image
                                              </button>
                                            </div>
                                          </div>
                                        ) : isUploadingImage ? (
                                          <div
                                            className={
                                              styles["chatmodal-upload-spinner-container"]
                                            }
                                          >
                                            <Spin
                                              className={
                                                styles["chatmodal-upload-spinner"]
                                              }
                                              indicator={
                                                <LoadingOutlined
                                                  style={{ fontSize: 26 }}
                                                  className={
                                                    styles[
                                                    "chatmodal-upload-spinner-icon"
                                                    ]
                                                  }
                                                  spin
                                                />
                                              }
                                              spinning={isUploadingImage}
                                            />
                                          </div>
                                        ) : (
                                          <CameraCapture
                                            onCapture={handleUploadChatImage}
                                            switchButtonLabel="Switch"
                                            switchingButtonLabel="Switching"
                                            panelClassName={
                                              styles[
                                              "chatmodal-camera-capture-panel"
                                              ]
                                            }
                                            videoClassName={
                                              styles["chatmodal-camera-preview"]
                                            }
                                            actionsClassName={
                                              styles["chatmodal-camera-actions"]
                                            }
                                            secondaryButtonClassName={
                                              styles[
                                              "chatmodal-camera-secondary-button"
                                              ]
                                            }
                                            primaryButtonClassName={
                                              styles[
                                              "chatmodal-camera-primary-button"
                                              ]
                                            }
                                            renderIdle={({
                                              openCamera,
                                              isCameraStarting,
                                              CameraIcon,
                                              LoadingIcon,
                                            }) => (
                                              <>
                                                <Dragger
                                                  className={
                                                    styles["chatmodal-figma-upload-dragger"]
                                                  }
                                                  {...uploadImageProps}
                                                  name="image_url"
                                                  showUploadList={false}
                                                >
                                                  <p
                                                    className={
                                                      styles[
                                                      "chatmodal-figma-upload-dragger-icon"
                                                      ]
                                                    }
                                                  >
                                                    <PictureOutlined />
                                                  </p>
                                                  <p
                                                    className={
                                                      styles[
                                                      "chatmodal-figma-upload-dragger-text"
                                                      ]
                                                    }
                                                  >
                                                    <span>Click to upload</span> or drag and
                                                    drop
                                                  </p>
                                                  <p
                                                    className={
                                                      styles[
                                                      "chatmodal-figma-upload-dragger-hint"
                                                      ]
                                                    }
                                                  >
                                                    JPG, JPEG, PNG less than 1MB
                                                  </p>
                                                </Dragger>
                                                <div
                                                  className={
                                                    styles["chatmodal-figma-upload-or"]
                                                  }
                                                >
                                                  or
                                                </div>
                                                <button
                                                  type="button"
                                                  onClick={openCamera}
                                                  disabled={isCameraStarting}
                                                  className={
                                                    styles[
                                                    "chatmodal-camera-open-button"
                                                    ]
                                                  }
                                                >
                                                  {isCameraStarting ? (
                                                    <LoadingIcon />
                                                  ) : (
                                                    <CameraIcon />
                                                  )}
                                                  Take Photo
                                                </button>
                                                <div
                                                  className={
                                                    styles["chatmodal-figma-upload-or"]
                                                  }
                                                >
                                                  or
                                                </div>
                                                <div
                                                  className={
                                                    styles[
                                                    "chatmodal-figma-upload-url-section"
                                                    ]
                                                  }
                                                >
                                                  <label
                                                    className={
                                                      styles[
                                                      "chatmodal-figma-upload-url-label"
                                                      ]
                                                    }
                                                  >
                                                    Image URL
                                                  </label>
                                                  <input
                                                    className={
                                                      styles[
                                                      "chatmodal-figma-upload-url-input"
                                                      ]
                                                    }
                                                    placeholder="Or Enter Image URL"
                                                    type="text"
                                                    value={chatImageUrl}
                                                    onChange={handleFigmaImageUrlChange}
                                                  />
                                                </div>
                                              </>
                                            )}
                                          />
                                        )}
                                      </div>
                                    )}

                                    {showChatLoader && (localChatMessage || chatImageUrl || submittedPromptPreview.message || submittedPromptPreview.imageUrl) && (
                                      <>
                                        <p className="mt-4 text-center">Sure! Give me a few moments. Now crafting related products.</p>
                                        <p className={`${styles["chatmodal-thinking-text"]} text-center`}>
                                          Thinking
                                          <span
                                            className={styles["chatmodal-thinking-dots"]}
                                            aria-hidden="true"
                                          >
                                            <span className={styles["chatmodal-thinking-dot"]}>.</span>
                                            <span className={styles["chatmodal-thinking-dot"]}>.</span>
                                            <span className={styles["chatmodal-thinking-dot"]}>.</span>
                                          </span>
                                        </p>
                                      </>
                                    )}

                                    <div className="w-full chatmodal-input-container">
                                      <div
                                        className={`${styles["chatmodal-figma-input-card"]} ${chatImageUrl
                                          ? styles[
                                          "chatmodal-figma-input-card-with-preview"
                                          ]
                                          : ""
                                          } ${isShopByThemeOptionActive
                                            ? styles[
                                            "chatmodal-figma-input-card-shop-theme"
                                            ]
                                            : ""
                                          }`}
                                      >
                                        <div
                                          className={`${styles["chatmodal-figma-input-actions"]} ${!activeSearchOption.allow_image_search
                                            ? styles[
                                            "chatmodal-figma-input-actions-shop-theme"
                                            ]
                                            : ""
                                            }`}
                                        >
                                          {!isShopByThemeOptionActive && (
                                            <div
                                              className={
                                                styles["chatmodal-figma-input-actions-left"]
                                              }
                                            >
                                              <button
                                                type="button"
                                                className={
                                                  styles["chatmodal-figma-action-button"]
                                                }
                                                title="Open assistant settings"
                                                onClick={handlePromptUtilityClick}
                                              >
                                                <img
                                                  src={page_info?.src}
                                                  alt="Assistant settings"
                                                />
                                              </button>
                                            </div>
                                          )}

                                          <div className="relative flex-1">
                                            <input
                                              id={`chat_search_input_${chatTypeKey}`}
                                              type="text"
                                              ref={inputRef}
                                              placeholder={
                                                typeof activeSearchOption?.text_placeholder === "string" && !isFollowUpQuery
                                                  ? activeSearchOption?.text_placeholder
                                                  : ''

                                              }
                                              name="chat_message"
                                              value={localChatMessage}
                                              onChange={handleInputChange}
                                              onKeyDown={handlePromptKeyDown}
                                              className={`${styles["chatmodal-figma-input"]} ${!isShopByThemeOptionActive
                                                ? ""
                                                : styles["chatmodal-figma-input-shop-theme"]
                                                } ${!localChatMessage
                                                  ? styles["chatmodal-figma-input-shop-theme"]
                                                  : "text-black-200 font-medium"
                                                }`}
                                            />
                                            {/* {localChatMessage && (
                                          <CloseCircleFilled
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-secondary cursor-pointer text-base transition-colors z-10"
                                            onClick={() => setLocalChatMessage("")}
                                          />
                                        )} */}
                                          </div>


                                          <button
                                            type="button"
                                            className={`${styles["chatmodal-figma-submit"]} ${isShopByThemeOptionActive
                                              ? styles[
                                              "chatmodal-figma-submit-shop-theme"
                                              ]
                                              : ""
                                              } ${(
                                                isShopALookOptionActive
                                                  ? !chatImageUrl
                                                  : !localChatMessage && !chatImageUrl
                                              )
                                                ? styles["chatmodal-figma-submit-disabled"]
                                                : ""
                                              }`}
                                            onClick={handleSubmitChatInput}
                                            disabled={
                                              showChatLoader ||
                                              (isShopALookOptionActive
                                                ? !chatImageUrl
                                                : !localChatMessage && !chatImageUrl)
                                            }
                                          >
                                            <ArrowUpOutlined />
                                          </button>
                                        </div>
                                      </div>
                                    </div>

                                  </div>
                                </>
                              )}
                            </div>
                            {isShowFollowUpSearch ? (
                              <div
                                className={`${shouldUseLegacyImageSearchLayout
                                  ? styles["chatmodal-followup-controls-mt4"]
                                  : styles["chatmodal-followup-controls-mt1"]
                                  } ${styles["chatmodal-followup-controls-container"]}`}
                              >
                                {isShowFollowUpSearch && isSidExpired ? (
                                  <div
                                    className={
                                      styles["chatmodal-followup-checkbox-container"]
                                    }
                                  >
                                    <input
                                      type="checkbox"
                                      id="followUpQuery"
                                      className={styles["chatmodal-followup-checkbox"]}
                                      checked={isFollowUpQuery}
                                      disabled={showChatLoader}
                                      onChange={handleFollowUpSearch}
                                    />
                                    <label
                                      htmlFor="followUpQuery"
                                      className={`${showChatLoader
                                        ? styles["chatmodal-followup-label-disabled"]
                                        : styles["chatmodal-followup-label"]
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
                  {showChatLoader && (localChatMessage || chatImageUrl || submittedPromptPreview.message || submittedPromptPreview.imageUrl) && (
                    <div className={styles["chatmodal-loading-bar-container"]}>
                      <div className={styles["chatmodal-loading-bar"]}></div>
                    </div>
                  )}
                  {!showChatLoader && (
                    <div className={styles["chatmodal-content-wrapper-border"]}></div>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      ) : null}

      <div
        id="chat_products_container"
        className={`${styles["chatmodal-products-container"]} ${isGuestPopUpShow
          ? styles["chatmodal-products-container-overflow"]
          : ""
          }`}
      >
        {showChatLoader && (
          <div style={{ position: "absolute", width: "100%" }}>
            <div className="chat_aura_products_search_skeleton"></div>
          </div>
        )}
        {current_store_name === STORE_USER_NAME_SAMSKARA ? (
          <div className={styles["chatmodal-samskara-container"]}>
            <a
              href={MAIN_SITE_URL[STORE_USER_NAME_SAMSKARA]}
              className={styles["chatmodal-samskara-link"]}
            >
              <span className={styles["chatmodal-samskara-link-content"]}>
                <span className={styles["chatmodal-samskara-icon-wrapper"]}>
                  <ArrowLeftOutlined />
                </span>
                <span className={styles["chatmodal-samskara-text"]}>
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
              handlePromptUtilityClick={handlePromptUtilityClick}
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
              upload_icon={upload_icon}
              page_info={page_info}
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
            <div
              className={styles["chatmodal-bt-user-container"]}
              style={
                isMobile && isProductSearchOptionActive
                  ? { flex: 1, maxHeight: "none", overflowY: "auto" }
                  : {}
              }
            >
              <div className={styles["chatmodal-bt-user-content"]}>
                <div className={styles["chatmodal-header-row"]}>
                  <img
                    src={star_ai_icon}
                    width={56}
                    height={56}
                    className={styles["chatmodal-header-icon"]}
                  />

                  <h1 className={styles["chatmodal-header-title"]}>
                    <span className={styles["chatmodal-header-title-primary"]}>
                      I'm AURA
                    </span>
                    <br />
                    <span className={styles["chatmodal-header-title-secondary"]}>
                      How can I inspire you today?
                    </span>
                  </h1>
                </div>
                {!isEmpty(selectedSearchOptionExamples) ? (
                  <div className={styles["chatmodal-bt-user-examples-container"]}>
                    {selectedSearchOptionExamples?.map((exa) => (
                      <div
                        className={styles["chatmodal-bt-user-example-card"]}
                        onClick={(event) => {
                          handleTryThisClick(event, exa?.text, exa?.image_url);
                        }}
                      >
                        <div
                          key={exa}
                          className={styles["chatmodal-example-text"]}
                        >
                          {exa?.text}
                        </div>

                        <div
                          className={styles["chatmodal-example-image-container"]}
                        >
                          {exa?.image_url ? (
                            <img
                              src={exa.image_url}
                              className={styles["chatmodal-example-image"]}
                            />
                          ) : null}
                        </div>
                        <div
                          className={styles["chatmodal-example-icon-container"]}
                        >
                          <img
                            src={searchIcon}
                            alt="searchIcon"
                            width={18}
                            height={18}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
            {isMobile && isProductSearchOptionActive && (
              <div className={styles["chatmodal-bottom-input-wrapper"]}>
                <AuraInputBox
                  isShowTryAgain={false}
                  showChatLoader={showChatLoader}
                  activeSearchOption={activeSearchOption}
                  chatTypeKey={chatTypeKey}
                  inputRef={inputRef}
                  localChatMessage={localChatMessage}
                  handleInputChange={handleInputChange}
                  handlePromptKeyDown={handlePromptKeyDown}
                  handlePromptUtilityClick={handlePromptUtilityClick}
                  page_info={page_info}
                  handleSubmitChatInput={handleSubmitChatInput}
                  uploadImageProps={uploadImageProps}
                  chatImageUrl={chatImageUrl}
                  chatImagePreviewUrl={chatImagePreviewUrl}
                  isUploadingImage={isUploadingImage}
                  handleClearChatImage={handleClearChatImage}
                  chatHistory={chatHistory}
                  hideActions={true}
                  isMobile={true}
                />
              </div>
            )}
          </>
        ) : null}

        {enable_recommendations && (
          <Recommendations trackCollectionData={trackCollectionData} />
        )}

        {/* {shouldMoveInputBelowResults ? (
						<div className={styles['chatmodal-bottom-input-wrapper']}>
							<div className={styles['chatmodal-figma-input-section']}>
								<div
									className={`${styles['chatmodal-figma-input-card']} ${styles['chatmodal-figma-input-card-bottom']} ${chatImageUrl
										? styles['chatmodal-figma-input-card-with-preview']
										: ""
										}`}>
									<input
										id={`chat_search_input_bottom_${chatTypeKey}`}
										type='text'
										ref={inputRef}
										placeholder={
											typeof activeSearchOption?.text_placeholder === "string"
												? activeSearchOption?.text_placeholder
												: activeSearchOption?.text_placeholder?.[0] ||
													"Describe your product idea"
										}
										name='chat_message'
										value={localChatMessage}
										onChange={handleInputChange}
										onKeyDown={handlePromptKeyDown}
										className={styles['chatmodal-figma-input']}
									/>
									<div className={styles['chatmodal-figma-input-divider']} />
									<div className={styles['chatmodal-figma-input-actions']}>
										<div className={styles['chatmodal-figma-input-actions-left']}>
											<div
												className={styles['chatmodal-upload-action-wrapper']}>
												<button
													type='button'
													className={`${styles['chatmodal-figma-action-button']} ${styles['chatmodal-figma-image-action-button']} ${isFigmaUploadPanelOpen || chatImageUrl
														? styles['chatmodal-figma-image-action-button-active']
														: ""
														}`}
													title='Upload image'
													onClick={handleFigmaUploadButtonClick}>
													<img src={upload_icon?.src} alt='Upload image' />
													{(isFigmaUploadPanelOpen || chatImageUrl) && <span>Image</span>}
												</button>
											</div>
											<button
												type='button'
												className={styles['chatmodal-figma-action-button']}
												title='Open assistant settings'
												onClick={handlePromptUtilityClick}>
												<img src={page_info?.src} alt='Assistant settings' />
											</button>
											{chatImageUrl && !isShowSubmittedChatPreview ? (
												<div className={styles['chatmodal-figma-upload-pill']}>
													Image attached
												</div>
											) : null}
										</div>
										<button
											type='button'
											className={`${styles['chatmodal-figma-submit']} ${(isShopALookOptionActive ? !chatImageUrl : !localChatMessage && !chatImageUrl)
												? styles['chatmodal-figma-submit-disabled']
												: ""
												}`}
											onClick={handleSubmitChatInput}
											disabled={isShopALookOptionActive ? !chatImageUrl : !localChatMessage && !chatImageUrl}>
											<ArrowUpOutlined />
										</button>
									</div>
								</div>

								{isShowFollowUpSearch || isShowTryAgain ? (
									<div
										className={`${styles['chatmodal-followup-controls-mt1']} ${styles['chatmodal-followup-controls-container']}`}>
										{isShowFollowUpSearch && isSidExpired ? (
											<div className={styles['chatmodal-followup-checkbox-container']}>
												<input
													type='checkbox'
													id='followUpQuery_bottom'
													className={styles['chatmodal-followup-checkbox']}
													checked={isFollowUpQuery}
													disabled={showChatLoader}
													onChange={handleFollowUpSearch}
												/>
												<label
													htmlFor='followUpQuery_bottom'
													className={`${showChatLoader
														? styles['chatmodal-followup-label-disabled']
														: styles['chatmodal-followup-label']
														}`}>
													Follow-Up search
												</label>
											</div>
										) : null}
										{isShowFollowUpSearch &&
											isShowTryAgain &&
											isSidExpired ? (
											<div className={styles['chatmodal-divider-vertical']}></div>
										) : null}
										{isShowTryAgain ? (
											<button
												className={`${styles['chatmodal-try-again-button']} ${showChatLoader
													? styles['chatmodal-try-again-button-disabled']
													: ""
													}`}
												title='Regenerate the products with AI.'
												onClick={handleTryAgainClick}
												disabled={showChatLoader}>
												<ReloadOutlined className={styles['chatmodal-reload-icon']} />
												Try again
											</button>
										) : null}
									</div>
								) : null}
							</div>
						</div>
					) : null} */}
      </div>
    </div>
  );
};

export default ChatModal;
