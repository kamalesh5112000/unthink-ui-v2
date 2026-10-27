import {
	SET_AURA_SPEAKING,
	SET_CHAT_GENERAL_SUGGESTIONS,
	SET_CHAT_MESSAGE,
	SET_CHAT_IMAGE_URL,
	SET_CHAT_MUTE,
	SET_CHAT_PRODUCTS_DATA,
	SET_CHAT_USER_ACTION,
	SET_AI_EXTRACTION_DATA,
	SET_SERVER_CHAT_MESSAGE,
	SET_SHOW_AURA_INTRO,
	SET_SHOW_CHAT_LOADER,
	SET_SHOW_CHAT_MODAL,
	SET_SHOW_SOCKET_EXCEPTION,
	SET_SOCKET_EXCEPTION,
	SET_SOCKET_ID,
	SET_USER_DATA_SENT,
	SET_WIDGET_HEADER,
	SET_AURA_CHAT_SETTING,
	SET_CHAT_PRODUCTS,
	SET_CHAT_SEARCH_TYPE,
	SET_SUGGESTIONS_LIST,
	SET_SUGGESTIONS_PRODUCTS,
	SET_SUGGESTIONS_SELECTED_TAG,
	RESET_SUGGESTIONS_LIST,
	SET_SUGGESTIONS_SELECTED_ADDITIONAL_TAG,
	CLEAR_SUGGESTIONS_SELECTED_ADDITIONAL_TAG,
	SET_SUGGESTIONS_PRODUCTS_FILTERS,
	SET_SUGGESTIONS_PRODUCTS_IS_LOADING,
	SET_CHAT_SHOP_A_LOOK,
	SET_ACTIVE_SEARCH_OPTION,
	SET_AURA_HELPER_MESSAGE,
	SET_WIDGET_IMAGE,
	REMOVE_SUGGESTION_DATA_TAG,
	SET_IS_FRESH_SEARCH,
	RESET_AURA_SEARCH_RESPONSE,
	SET_RECOMMENDATION_PRODUCTS,
	SET_MORE_PRODUCTS,
	SET_RECOMMENDATION_SELECTED_TAG,
	SET_MORESEARCH_SELECTED_TAG,
	SET_AURA_SERVER_IMAGE,
	SET_OVERLAY_COORDINATES,
	SET_WIDGET_CHATHISTORY,
	RESTORE_AURA_SEARCH_RESPONSE,
	CLEAR_LAST_AURA_RESPONSE,
} from "./constants";

export const setSocketId = (payload) => ({ type: SET_SOCKET_ID, payload });

export const setChatMessage = (payload, key) => ({
	type: SET_CHAT_MESSAGE,
	payload,
	key,
});

export const setChatImageUrl = (payload, key) => ({
	type: SET_CHAT_IMAGE_URL,
	payload,
	key,
});

export const setChatMute = (payload) => ({ type: SET_CHAT_MUTE, payload });

export const setIsAuraSpeaking = (payload) => ({
	type: SET_AURA_SPEAKING,
	payload,
});

export const setUserDataSent = (payload) => ({
	type: SET_USER_DATA_SENT,
	payload,
});

export const setShowChatModal = (payload) => ({
	type: SET_SHOW_CHAT_MODAL,
	payload,
});

export const setAuraChatSetting = (payload, localPayload) => ({
	type: SET_AURA_CHAT_SETTING,
	payload,
	localPayload,
});

export const setChatSearchType = (payload) => ({
	type: SET_CHAT_SEARCH_TYPE,
	payload,
});

export const setShowChatLoader = (payload, key) => ({
	type: SET_SHOW_CHAT_LOADER,
	payload,
	key,
});

export const setChatGeneralSuggestions = (payload) => ({
	type: SET_CHAT_GENERAL_SUGGESTIONS,
	payload,
});

export const setChatProducts = (payload, key) => ({
	// new format
	type: SET_CHAT_PRODUCTS,
	payload,
	key,
});

export const setActiveSearchOption = (payload) => ({
	// new format
	type: SET_ACTIVE_SEARCH_OPTION,
	payload,
});

export const setAuraHelperMessage = (payload) => ({
	// new format
	type: SET_AURA_HELPER_MESSAGE,
	payload,
});

export const setAuraSreverImage = (payload) => ({
	// new format
	type: SET_AURA_SERVER_IMAGE,
	payload,
});

export const setChatShopALook = (payload, key) => ({
	// new format
	type: SET_CHAT_SHOP_A_LOOK,
	payload,
	key,
});

export const resetSuggestionsList = () => ({
	// new format
	type: RESET_SUGGESTIONS_LIST,
});

export const setSuggestionsList = (payload) => ({
	// new format
	type: SET_SUGGESTIONS_LIST,
	payload,
});

export const setSuggestionsProducts = (payload) => ({
	// new format
	type: SET_SUGGESTIONS_PRODUCTS,
	payload,
});

export const setRecommendationProducts = (payload) => ({
	// new format
	type: SET_RECOMMENDATION_PRODUCTS,
	payload,
});

export const setMoreProducts = (payload) => ({
	// new format
	type: SET_MORE_PRODUCTS,
	payload,
});

export const setOverlayCoordinates = (payload) => ({
	// new format
	type: SET_OVERLAY_COORDINATES,
	payload,
});

export const setSuggestionsProductsFilters = (tag, filters) => ({
	// new format
	type: SET_SUGGESTIONS_PRODUCTS_FILTERS,

	payload: {
		tag,
		filters,
	},
});

export const setSuggestionsProductsIsLoading = (tag, isLoading) => ({
	// new format
	type: SET_SUGGESTIONS_PRODUCTS_IS_LOADING,

	payload: {
		tag,
		isLoading,
	},
});

export const setSuggestionsSelectedTag = (payload) => ({
	// new format
	type: SET_SUGGESTIONS_SELECTED_TAG,
	payload,
});

// recommendation
export const setRecommendationSelectedTag = (payload) => ({
	type: SET_RECOMMENDATION_SELECTED_TAG,
	payload,
});

// more search tag
export const setMoreSearchSelectedTag = (payload) => ({
	type: SET_MORESEARCH_SELECTED_TAG,
	payload,
});


export const setSuggestionsSelectedAdditionalTag = (tag, additional_tag) => ({
	// new format
	type: SET_SUGGESTIONS_SELECTED_ADDITIONAL_TAG,
	tag,
	additional_tag,
});

export const clearSuggestionsSelectedAdditionalTag = (tag) => ({
	// new format
	type: CLEAR_SUGGESTIONS_SELECTED_ADDITIONAL_TAG,
	tag,
});

export const removeSuggestionDataTag = (payload) => ({
	// new format
	type: REMOVE_SUGGESTION_DATA_TAG,
	payload,
});

export const setServerChatMessage = (payload) => ({
	type: SET_SERVER_CHAT_MESSAGE,
	payload,
});

export const setChatProductsData = (payload) => ({
	type: SET_CHAT_PRODUCTS_DATA,
	payload,
});

export const setWidgetHeader = (payload, widgetHeaderRequest,chatHistory) => ({
	type: SET_WIDGET_HEADER,
	payload,
	widgetHeaderRequest,
	chatHistory
});
export const chatHistoryAction =(payload)=>({
    type:SET_WIDGET_CHATHISTORY,
	payload,
})
export const setWidgetImage = (payload) => ({
	type: SET_WIDGET_IMAGE,
	payload,
});

export const setAiExtractionData = (payload) => ({
	type: SET_AI_EXTRACTION_DATA,
	payload,
});

export const setChatUserAction = (payload) => ({
	type: SET_CHAT_USER_ACTION,
	payload,
});

export const setSocketException = (payload) => ({
	type: SET_SOCKET_EXCEPTION,
	payload,
});

export const setShowSocketException = (payload) => ({
	type: SET_SHOW_SOCKET_EXCEPTION,
	payload,
});

export const setShowAuraIntro = (payload) => ({
	type: SET_SHOW_AURA_INTRO,
	payload,
});

export const setIsFreshSearch = (payload) => ({
	type: SET_IS_FRESH_SEARCH,
	payload,
});

export const resetAuraSearchResponse = (payload) => ({
	type: RESET_AURA_SEARCH_RESPONSE,
	payload,
});

export const restoreAuraSearchResponse = (payload) => ({
	type: RESTORE_AURA_SEARCH_RESPONSE,
	payload,
});

export const clearLastAuraResponse = () => ({
	type: CLEAR_LAST_AURA_RESPONSE,
});
