import { useCallback, useEffect, useMemo } from "react";
import { useDispatch } from "react-redux";

import {
  resetAuraSearchResponse,
  setActiveSearchOption,
  setShowChatModal,
} from "../../../../hooks/chat/redux/actions";
import {
  CHAT_SEARCH_OPTION_ID,
  COLLECTIONS_ID,
} from "../../../../constants/codes";
import { is_kiosk } from "../../../../constants/config";
import { isEmpty } from "../../../../helper/utils";

export const useAuraSearchOptions = ({
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
}) => {
  const dispatch = useDispatch();

  // useEffect(() => {
  //   if (is_kiosk || !isEmpty(activeSearchOption) || isEmpty(searchOptions)) {
  //     return;
  //   }

  //   const shopByThemeDefault = searchOptions.find(
  //     (option) =>
  //       option?.id === CHAT_SEARCH_OPTION_ID.smart_search && option?.is_display,
  //   );
  //   // const configuredDefault = searchOptions.find(
  //   //   (option) => option?.default && option?.is_display,
  //   // );
  //   // const firstVisibleOption = searchOptions.find(
  //   //   (option) => option?.is_display,
  //   // );

  //   // const defaultSelectedOption =
  //   //   shopByThemeDefault || configuredDefault || firstVisibleOption;

  //   // if (defaultSelectedOption) {
  //   //   dispatch(setActiveSearchOption(defaultSelectedOption));
  //   // }
  // }, [activeSearchOption, dispatch, searchOptions]);

  const handleSetSearchOption = useCallback(
    (option) => {
      setIsSearchOptionManuallySelected(true);
      setLocalChatMessage("");
      sessionStorage.removeItem("widgetHeaderRequestHistory");
      setSubmittedPromptPreview({ message: "", imageUrl: "" });
      resetChatImageState();
      sessionStorage.removeItem("widgetHeader");
      if (option.id === CHAT_SEARCH_OPTION_ID.trending_collections) {
        dispatch(setShowChatModal(false));
        navigate(`/#${COLLECTIONS_ID}`);
      } else {
        dispatch(setActiveSearchOption(option));
        dispatch(resetAuraSearchResponse());
        setIsSearchOptionsVisible(false);
      }
    },
    [
      dispatch,
      navigate,
      resetChatImageState,
      setIsSearchOptionManuallySelected,
      setIsSearchOptionsVisible,
      setLocalChatMessage,
      setSubmittedPromptPreview,
    ],
  );

  const displaySearchOptions = useMemo(
    () => searchOptions.filter((value) => value?.is_display),
    [searchOptions],
  );

  const searchOptionPreviewImages = useMemo(
    () => ({
      [CHAT_SEARCH_OPTION_ID.smart_search]: iconShopByTheme,
      [CHAT_SEARCH_OPTION_ID.shop_a_look]: iconShopTheLook,
      [CHAT_SEARCH_OPTION_ID.complete_the_look]: iconCompleteTheLook,
      [CHAT_SEARCH_OPTION_ID.product_search]: iconSearch,
      [CHAT_SEARCH_OPTION_ID.trending_collections]: iconTrendingCollections,
    }),
    [
      iconCompleteTheLook,
      iconSearch,
      iconShopByTheme,
      iconShopTheLook,
      iconTrendingCollections,
    ],
  );

  const cardCollageVariants = useMemo(
    () => ({
      [CHAT_SEARCH_OPTION_ID.shop_a_look]:
        "-translate-x-0.5",
      [CHAT_SEARCH_OPTION_ID.complete_the_look]:
        "translate-y-0.5",
      [CHAT_SEARCH_OPTION_ID.smart_search]:
        "absolute right-1 bottom-1",
      [CHAT_SEARCH_OPTION_ID.product_search]:
        "translate-x-0.5",
    }) ,
    [],
  );

  return {
    handleSetSearchOption,
    displaySearchOptions,
    searchOptionPreviewImages,
    cardCollageVariants,
  };
};




