import React, { useMemo } from "react";
import { CaretDownFilled, CaretUpFilled } from "@ant-design/icons";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import {
  CHAT_SEARCH_OPTION_ID,
  COLLECTIONS_ID,
} from "../../../../constants/codes";
import {
  clearLastAuraResponse,
  resetAuraSearchResponse,
  setActiveSearchOption,
  setShowChatModal,
} from "../../../../hooks/chat/redux/actions";
import iconShopByTheme from "../../Images/icon_shop_by_theme.png";
import iconShopTheLook from "../../Images/icon_shop_the_look.png";
import iconCompleteTheLook from "../../Images/icon_complete_the_look.png";
import iconSearch from "../../Images/icon_search.png";
import iconTrendingCollections from "../../Images/icon_trending_collections.png";

const SearchOptionsTab = ({
  activeSearchOption,
  isBTNormalUserLoggedIn = false,
  isSearchOptionManuallySelected = false,
  isSearchOptionsVisible = true,
  resetChatImageState,
  setIsSearchOptionManuallySelected,
  setIsSearchOptionsVisible,
  setLocalChatMessage,
  setSubmittedPromptPreview,
}) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const storeSearchOptions = useSelector(
    (state) => state.store.data.searchOptions || [],
  );
  const optionsToDisplay = useMemo(
    () =>
      (storeSearchOptions.length ? storeSearchOptions : []).filter(
        (value) => value?.is_display,
      ),
    [storeSearchOptions],
  );
  const cardCollageVariants = useMemo(
    () => ({
      [CHAT_SEARCH_OPTION_ID.shop_a_look]: "-translate-x-0.5",
      [CHAT_SEARCH_OPTION_ID.complete_the_look]: "translate-y-0.5",
      [CHAT_SEARCH_OPTION_ID.smart_search]: "absolute right-1 bottom-1",
      [CHAT_SEARCH_OPTION_ID.product_search]: "translate-x-0.5",
    }),
    [],
  );
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
  const shouldHighlightActiveSearchOption = useMemo(
    () => isSearchOptionManuallySelected || !isSearchOptionsVisible,
    [isSearchOptionManuallySelected, isSearchOptionsVisible],
  );
  const handleSetSearchOption = (option) => {
    setIsSearchOptionManuallySelected(true);
    setLocalChatMessage("");
    sessionStorage.removeItem("widgetHeaderRequestHistory");
    setSubmittedPromptPreview({ message: "", imageUrl: "" });
    resetChatImageState();
    sessionStorage.removeItem("widgetHeader");

    if (option.id === CHAT_SEARCH_OPTION_ID.trending_collections) {
      dispatch(setShowChatModal(false));
      router.push(`/#${COLLECTIONS_ID}`);
      return;
    }

    dispatch(setActiveSearchOption(option));
    dispatch(resetAuraSearchResponse());
    dispatch(clearLastAuraResponse());
    setIsSearchOptionsVisible(false);
  };

  return (
    <div className={"relative mb-0 w-full"}>
      {isSearchOptionManuallySelected && !isSearchOptionsVisible ? (
        <>
          <div
            className={`${"sticky top-0 z-20 mb-2 flex w-full justify-center  "} `}
          >
            <div
              className={
                "pointer-events-auto flex  h-6 w-12 lg:h-8 lg:w-[70px] cursor-pointer items-center justify-center rounded-b-full border-2 border-t-0  text-accent shadow-[0_6px_15px_rgba(203,198,244,0.8)] transition-all duration-200 hover:translate-y-0.5 "
              }
              onClick={() => setIsSearchOptionsVisible(!isSearchOptionsVisible)}
              title={
                isSearchOptionsVisible
                  ? "Collapse search options"
                  : "Expand search options"
              }
            >
              <CaretUpFilled
                className={`${"text-xl lg:text-2xl transition-transform duration-300 "} ${
                  !isSearchOptionsVisible ? "" : ""
                }`}
              />
            </div>
          </div>
        </>
      ) : null}

      <div
        className={`${"overflow-hidden max-h-[1000px] opacity-100 transition-[max-height,opacity,margin] duration-300 ease-in-out"} ${
          !isSearchOptionsVisible ? "hidden " : ""
        }`}
      >
        {!isBTNormalUserLoggedIn ? (
          <div
            className={`grid ${
              optionsToDisplay?.length === 1
                ? "grid-cols-1"
                : optionsToDisplay?.length === 2
                  ? "lg:grid-cols-2 grid-cols-2"
                  : optionsToDisplay?.length === 3
                    ? "lg:grid-cols-3 grid-cols-1"
                    : optionsToDisplay?.length === 4
                      ? "lg:grid-cols-4 grid-cols-2"
                      : "lg:grid-cols-5 grid-cols-1"
            }  w-full gap-4 lg:gap-5 py-2 px-1`}
          >
            {optionsToDisplay?.map((option) => {
              const isOptionActive =
                shouldHighlightActiveSearchOption &&
                option?.id === activeSearchOption?.id;
              const previewImage = searchOptionPreviewImages[option.id];
              const collageVariantClass =
                cardCollageVariants[option.id] || "translate-y-0";

              return (
                <div
                  key={option.id}
                  className={`group relative flex cursor-pointer items-center gap-2.5 xl:gap-4
                      overflow-hidden rounded-2xl  bg-white   px-3 py-2.5 text-left   max-lg:max-w-[550px]
                       ${isOptionActive ? "gradient" : "hover:border-black shadow-md hover:border-2 transition-all duration-300 hover:-translate-y-1 hover:shadow-md"}`}
                  onClick={() => handleSetSearchOption(option)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      handleSetSearchOption(option);
                    }
                  }}
                >
                  <div
                    className={`${"relative mb-0 mr-0 transition-transform duration-300 max-lg:h-8 max-lg:w-8"} ${collageVariantClass} flex-shrink-0`}
                  >
                    <img
                      src={previewImage.src}
                      className={
                        "block h-14 w-14 bg-secondary rounded-xl object-cover transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 max-lg:h-8 max-lg:w-8"
                      }
                      alt={option.title}
                    />
                  </div>
                  <div className={"contents"}>
                    <div
                      className={`${"flex flex-col gap-1.5 p-0"} ${
                        isOptionActive ? "text-white" : ""
                      }`}
                    >
                      <h2
                        className={`${"m-0 text-base max-lg:text-sm leading-tight font-semibold uppercase text-highlight"} ${
                          isOptionActive ? "text-white" : ""
                        }`}
                      >
                        {option.title}
                      </h2>
                      <p
                        className={`${"m-0 line-clamp-2 overflow-hidden text-sm max-lg:text-xs leading-snug font-medium text-slate-500"} ${
                          isOptionActive ? "text-white/95" : ""
                        } `}
                      >
                        {option.subTitle}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default SearchOptionsTab;
