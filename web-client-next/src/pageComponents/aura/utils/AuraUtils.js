import { CHAT_SEARCH_OPTION_ID } from "../../../constants/codes";
import { isEmpty } from "../../../helper/utils";
import { AuraChatSettingModalModes } from "../../auraChatSettingModal/AuraChatSettingModal";

export const createDebouncedFunction = (callback, wait) => {
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

export const getActiveSearchOption = (selectedSearchOption) =>
  !isEmpty(selectedSearchOption) ? selectedSearchOption : "";

export const getAuraChatSettingMode = (activeSearchOption = {}) => {
  if (activeSearchOption.id === CHAT_SEARCH_OPTION_ID.shop_a_look) {
    return AuraChatSettingModalModes.SHOP_A_LOOK;
  }

  if (activeSearchOption.id === CHAT_SEARCH_OPTION_ID.complete_the_look) {
    return AuraChatSettingModalModes.COMPLETE_THE_LOOK;
  }

  if (activeSearchOption.id === CHAT_SEARCH_OPTION_ID.smart_search) {
    return AuraChatSettingModalModes.SMART_SEARCH;
  }

  return AuraChatSettingModalModes.AURA;
};

export const isShopALookOptionId = (optionId) =>
  optionId === CHAT_SEARCH_OPTION_ID.shop_a_look;

export const isShopByThemeOptionId = (optionId) =>
  optionId === CHAT_SEARCH_OPTION_ID.smart_search;

export const isCompleteTheLookOptionId = (optionId) =>
  optionId === CHAT_SEARCH_OPTION_ID.complete_the_look;

export const isProductSearchOptionId = (optionId) =>
  optionId === CHAT_SEARCH_OPTION_ID.product_search;

export const isAuraSplitLayoutOptionId = (optionId) =>
  [
    CHAT_SEARCH_OPTION_ID.smart_search,
    CHAT_SEARCH_OPTION_ID.product_search,
    CHAT_SEARCH_OPTION_ID.complete_the_look,
    CHAT_SEARCH_OPTION_ID.shop_a_look,
  ].includes(optionId);

export const getAuraChatInputMetadata = ({
  activeSearchOption = {},
  auraChatSetting = {},
  isFollowUpQuery,
  isSendCTLTemplates,
  isSendSSTemplates,
  isSendSTLTemplates,
}) => ({
  searchOptionId: activeSearchOption?.id,
  follow_qn: activeSearchOption.follow_up_search_enable
    ? isFollowUpQuery
    : false,
  aura_text_ss:
    isSendSSTemplates && !isEmpty(auraChatSetting.aura_text_ss)
      ? auraChatSetting.aura_text_ss
      : undefined,
  aura_text_stl:
    isSendSTLTemplates && !isEmpty(auraChatSetting.aura_text_stl)
      ? auraChatSetting.aura_text_stl
      : undefined,
  aura_text_ctl:
    isSendCTLTemplates && !isEmpty(auraChatSetting.aura_text_ctl)
      ? auraChatSetting.aura_text_ctl
      : undefined,
  aura_image_stl:
    isSendSTLTemplates && !isEmpty(auraChatSetting.aura_image_stl)
      ? auraChatSetting.aura_image_stl
      : undefined,
  aura_image_ctl:
    isSendCTLTemplates && !isEmpty(auraChatSetting.aura_image_ctl)
      ? auraChatSetting.aura_image_ctl
      : undefined,
});

export const getTitleParts = (title = "") => {
  const words = title.split(" ");

  return {
    leadingText: words.slice(0, -2).join(" "),
    trailingText: words.slice(-2).join(" "),
    hasGap: words.length > 2,
  };
};

export const getImageSrc = (image) => image?.src || image;
