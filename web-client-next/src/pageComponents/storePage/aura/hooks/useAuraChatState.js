import { useMemo } from "react";
import { useSelector } from "react-redux";

import {
  CHAT_SEARCH_OPTION_ID,
  CHAT_TYPES_KEYS,
} from "../../../../constants/codes";
import { is_kiosk } from "../../../../constants/config";
import {
  getRandomArrayElements,
  isEmpty,
} from "../../../../helper/utils";
import { socket } from "../../../../context/socketV2";

export const useAuraChatState = ({
  chatTypeKey,
  isBTNormalUserLoggedIn,
  isFigmaUploadPanelOpen,
  submittedPromptPreview,
  isFollowUpQuery,
  isSearchOptionManuallySelected,
  isMobile,
}) => {
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

  const {
    suggestions: { tags = [], title = "" },
  } = suggestionsWithProducts;

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

  const selectedSearchOptionExamples = useMemo(
    () => getRandomArrayElements(activeSearchOption.examples, 4),
    [activeSearchOption.examples],
  );

  const isSidExpired = useMemo(
    () => socket.id === socketId,
    [socketId],
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
    [isActiveSearchOptionAvailable],
  );

  const shouldCenterModalContent = useMemo(
    () =>
      !isShowAuraResponse &&
      !isSearchOptionManuallySelected &&
      !isActiveSearchOptionAvailable,
    [
      isActiveSearchOptionAvailable,
      isShowAuraResponse,
      isSearchOptionManuallySelected,
    ],
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
        (isMobile &&
          activeSearchOption?.id === CHAT_SEARCH_OPTION_ID.product_search)) &&
      isShowAuraResponse &&
      (!shouldUseLegacyImageSearchLayout ||
        activeSearchOption?.id === CHAT_SEARCH_OPTION_ID.complete_the_look),
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
      (widgetHeader ||
        !isEmpty(shopALookData) ||
        !isEmpty(products) ||
        !isEmpty(chatProductsData)),
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

  return {
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
    tags,
    title,
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
    isSuggestionsWithProductsAvailable,
    showChatResponse,
    selectedSearchOptionExamples,
    isSidExpired,
    isActiveSearchOptionAvailable,
    isShowAuraResponse,
    shouldHighlightActiveSearchOption,
    isShowKioskSearchOptions,
    shouldCenterModalContent,
    isShopALookOptionActive,
    isShopByThemeOptionActive,
    isCompleteTheLookOptionActive,
    isProductSearchOptionActive,
    isAllowedSplitLayout,
    shouldUseLegacyImageSearchLayout,
    isShowSubmittedChatPreview,
    shouldMoveInputBelowResults,
    isShowShopLookSplitLayout,
  };
};
