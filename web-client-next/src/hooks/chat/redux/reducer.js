import { CHAT_TYPES_KEYS, CHAT_TYPE_CHAT } from "../../../constants/codes";
import { availableChatSearchTypes } from "../../../constants/config";
import { getLocalChatMetadata } from "../../../helper/utils";
import { SET_STORE_DATA } from "../../../pageComponents/store/redux/constants";
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

const getDefaultSuggestions = () => ({
	suggestions: {},
	products: {},
	selectedTag: "",
	allProductList: [],
});

const getDefaultmoreProduct = () => ({
	moreProducts: {},
	products: {},
	selectedTag: "",
	allProductList: [],
});

const getDefaultRecommendation = () => ({
	recommendations: {},
	products: {},
	selectedTag: "",
	allProductList: [],
});

const normalizeTag = (tag) => (Array.isArray(tag) ? tag[0] : tag) || "";

const areSameTags = (currentTags = [], nextTags = []) => {
	if (currentTags.length !== nextTags.length) return false;
	return currentTags.every((tag, index) => tag === nextTags[index]);
};

const doProductKeysMatchTags = (products = {}, tags = []) => {
	const productKeys = Object.keys(products);
	return productKeys.length > 0 && productKeys.every((tag) => tags.includes(tag));
};

const hasArrayItems = (value) => Array.isArray(value) && value.length > 0;

const hasObjectItems = (value) =>
	value && typeof value === "object" && !Array.isArray(value) && Object.keys(value).length > 0;

const getAuraResponseSnapshot = (state) => ({
	auraHelperMessage: state.auraHelperMessage,
	auraServerImage: state.auraServerImage,
	auraOverlayCoordinates: state.auraOverlayCoordinates,
	widgetHeader: state.widgetHeader,
	widgetImage: state.widgetImage,
	widgetHeaderRequest: state.widgetHeaderRequest,
	chatProductsData: state.chatProductsData,
	products: state[CHAT_TYPES_KEYS[CHAT_TYPE_CHAT].products],
	shopALook: state[CHAT_TYPES_KEYS[CHAT_TYPE_CHAT].shopALook],
	suggestions: state.suggestions,
	recommendations: state.recommendations,
	moreProducts: state.moreProducts,
	activeSearchOption: state.activeSearchOption,
	chatHistory: state.chatHistory,
});

const preserveAuraResponse = (state) => {
	state.lastAuraResponse = getAuraResponseSnapshot(state);
};

// export const getDefaultFilters = () => ({
// 	brand: [],
// 	price: null,
// 	priceRange: { min: "", max: "" },
// 	product_brand: [],
// 	discount: [],
// 	age_group: [],
// 	gender: [],
// 	color: [],
// 	occasion: [],
// 	custom_filter: "",
// 	material: [],
// 	pattern: [],
// 	style: [],
// 	optional_filters: [],
// });

const initialState = {
	socketId: "",
	[CHAT_TYPES_KEYS[CHAT_TYPE_CHAT].chatMessage]: "",
	[CHAT_TYPES_KEYS[CHAT_TYPE_CHAT].chatImageUrl]: "",
	isMute: true,
	isAuraSpeaking: false,
	userDataSent: false,
	showChatModal: false,
	auraChatSetting: {
		gender: getLocalChatMetadata().gender,
		age_group: getLocalChatMetadata().age_group,
		color: getLocalChatMetadata().color,
		// aura_template_tags: getLocalChatMetadata().aura_template_tags,
		// aura_template_desc: getLocalChatMetadata().aura_template_desc,
		// cc_template_tags: getLocalChatMetadata().cc_template_tags,
		// cc_template_desc: getLocalChatMetadata().cc_template_desc,
		// blog_tag_template: getLocalChatMetadata().blog_tag_template,
		// video_tags_template: getLocalChatMetadata().video_tags_template,
		// image_cc_template: getLocalChatMetadata().image_cc_template,
		// aura_ctl_desc: getLocalChatMetadata().aura_ctl_desc,
		// aura_ctl_tags: getLocalChatMetadata().aura_ctl_tags,
		// image_ctl_aura: getLocalChatMetadata().image_ctl_aura,
		// aura_stl_desc: getLocalChatMetadata().aura_stl_desc,
		// aura_stl_tags: getLocalChatMetadata().aura_stl_tags,
		// image_stl_aura: getLocalChatMetadata().image_stl_aura,
		// aura_ss_desc: getLocalChatMetadata().aura_ss_desc,
		// aura_ss_tags: getLocalChatMetadata().aura_ss_tags,
		// cc_video_desctags: getLocalChatMetadata().cc_video_desctags,
		cc_text: getLocalChatMetadata().cc_text,
		cc_image: getLocalChatMetadata().cc_image,
		cc_blog: getLocalChatMetadata().cc_blog,
		cc_video: getLocalChatMetadata().cc_video,
		cc_shortvideo: getLocalChatMetadata().cc_shortvideo,
		aura_text_ss: getLocalChatMetadata().aura_text_ss,
		aura_text_stl: getLocalChatMetadata().aura_text_stl,
		aura_text_ctl: getLocalChatMetadata().aura_text_ctl,
		aura_image_stl: getLocalChatMetadata().aura_image_stl,
		aura_image_ctl: getLocalChatMetadata().aura_image_ctl,
	},
	activeChatSearchType:
		getLocalChatMetadata().activeChatSearchType || availableChatSearchTypes[0],
	[CHAT_TYPES_KEYS[CHAT_TYPE_CHAT].showChatLoader]: false,
	chatGeneralSuggestions: [],
	[CHAT_TYPES_KEYS[CHAT_TYPE_CHAT].products]: {},
	[CHAT_TYPES_KEYS[CHAT_TYPE_CHAT].shopALook]: {},
	suggestions: getDefaultSuggestions(),
	recommendations: getDefaultRecommendation(),
	moreProducts: getDefaultmoreProduct(),
	serverChatMessage: "",
	chatProductsData: [],
	widgetHeader: "",
	widgetHeaderRequest: {},
	chatHistory:[],
	widgetImage: "",
	userAction: "",
	showException: false,
	exception: null,
	showAuraIntro: "",
	activeSearchOption: {},
	auraHelperMessage: "",
	auraServerImage: "",
	auraOverlayCoordinates: [],
	isFreshSearch: true,
	lastAuraResponse: null,
};

const chatReducerV2 = (state = initialState, action) => {
	const newState = { ...state };
	const payload = action.payload ?? {};
	switch (action.type) {
		case SET_SOCKET_ID:
			newState.socketId = payload;
			return newState;
		case SET_CHAT_MESSAGE:
			newState[
				action.key
					? CHAT_TYPES_KEYS[action.key].chatMessage
					: CHAT_TYPES_KEYS[CHAT_TYPE_CHAT].chatMessage
			] = payload;
			return newState;
		case SET_CHAT_IMAGE_URL:
			newState[
				action.key
					? CHAT_TYPES_KEYS[action.key].chatImageUrl
					: CHAT_TYPES_KEYS[CHAT_TYPE_CHAT].chatImageUrl
			] = payload;
			return newState;
		case SET_CHAT_MUTE:
			newState.isMute = payload;
			return newState;
		case SET_AURA_SPEAKING:
			newState.isAuraSpeaking = payload;
			return newState;
		case SET_USER_DATA_SENT:
			newState.userDataSent = payload;
			return newState;
		case SET_SHOW_CHAT_MODAL:
			newState.showChatModal = payload;
			return newState;
		case SET_AURA_CHAT_SETTING:
			newState.auraChatSetting = payload;
			return newState;
		case SET_STORE_DATA: // setting templates from store details API
			if (payload?.templates) {
				const {
					// aura_template_tags,
					// aura_template_desc,
					// cc_template_tags,
					// cc_template_desc,
					// blog_tag_template,
					// video_tags_template,
					// image_cc_template,
					// aura_ctl_desc,
					// aura_ctl_tags,
					// image_ctl_aura,
					// aura_stl_desc,
					// aura_stl_tags,
					// image_stl_aura,
					// aura_ss_desc,
					// aura_ss_tags,
					// cc_video_desctags,
					cc_text,
					cc_image,
					cc_blog,
					cc_video,
					cc_shortvideo,
					aura_text_ss,
					aura_text_stl,
					aura_text_ctl,
					aura_image_stl,
					aura_image_ctl,
				} = payload.templates;

				newState.auraChatSetting = {
					...newState.auraChatSetting,
					// aura_template_tags:
					// 	newState.auraChatSetting.aura_template_tags ?? aura_template_tags,
					// aura_template_desc:
					// 	newState.auraChatSetting.aura_template_desc ?? aura_template_desc,
					// cc_template_tags:
					// 	newState.auraChatSetting.cc_template_tags ?? cc_template_tags,
					// cc_template_desc:
					// 	newState.auraChatSetting.cc_template_desc ?? cc_template_desc,
					// blog_tag_template:
					// 	newState.auraChatSetting.blog_tag_template ?? blog_tag_template,
					// video_tags_template:
					// 	newState.auraChatSetting.video_tags_template ?? video_tags_template,
					// image_cc_template:
					// 	newState.auraChatSetting.image_cc_template ?? image_cc_template,
					// aura_ctl_desc:
					// 	newState.auraChatSetting.aura_ctl_desc ?? aura_ctl_desc,
					// aura_ctl_tags:
					// 	newState.auraChatSetting.aura_ctl_tags ?? aura_ctl_tags,
					// image_ctl_aura:
					// 	newState.auraChatSetting.image_ctl_aura ?? image_ctl_aura,
					// aura_stl_desc:
					// 	newState.auraChatSetting.aura_stl_desc ?? aura_stl_desc,
					// aura_stl_tags:
					// 	newState.auraChatSetting.aura_stl_tags ?? aura_stl_tags,
					// image_stl_aura:
					// 	newState.auraChatSetting.image_stl_aura ?? image_stl_aura,
					// aura_ss_desc: newState.auraChatSetting.aura_ss_desc ?? aura_ss_desc,
					// aura_ss_tags: newState.auraChatSetting.aura_ss_tags ?? aura_ss_tags,
					// // cc_video_desctags:
					// 	newState.auraChatSetting.cc_video_desctags ?? cc_video_desctags,

					cc_text: newState.auraChatSetting.cc_text ?? cc_text,
					cc_image: newState.auraChatSetting.cc_image ?? cc_image,
					cc_blog: newState.auraChatSetting.cc_blog ?? cc_blog,
					cc_video: newState.auraChatSetting.cc_video ?? cc_video,
					cc_shortvideo:
						newState.auraChatSetting.cc_shortvideo ?? cc_shortvideo,
					aura_text_ss: newState.auraChatSetting.aura_text_ss ?? aura_text_ss,
					aura_text_stl:
						newState.auraChatSetting.aura_text_stl ?? aura_text_stl,
					aura_text_ctl:
						newState.auraChatSetting.aura_text_ctl ?? aura_text_ctl,
					aura_image_stl:
						newState.auraChatSetting.aura_image_stl ?? aura_image_stl,
					aura_image_ctl:
						newState.auraChatSetting.aura_image_ctl ?? aura_image_ctl,
				};
			}
			return newState;
		// case SET_CHAT_SEARCH_TYPE:
		// 	newState.activeChatSearchType = payload;
		// 	return newState;        // need to remove in future
		case SET_ACTIVE_SEARCH_OPTION:
			newState.activeSearchOption = payload;
			// newState.auraHelperMessage = payload?.description;
			return newState;
		case SET_AURA_HELPER_MESSAGE:
			newState.auraHelperMessage = payload ?? "";
			return newState;
		case SET_AURA_SERVER_IMAGE:
			newState.auraServerImage = payload ?? "";
			return newState;
		case SET_OVERLAY_COORDINATES:
			newState.auraOverlayCoordinates = payload ?? [];
			return newState;
		case SET_SHOW_CHAT_LOADER:
			newState[
				action.key
					? CHAT_TYPES_KEYS[action.key].showChatLoader
					: CHAT_TYPES_KEYS[CHAT_TYPE_CHAT].showChatLoader
			] = payload;
			return newState;
		case SET_CHAT_GENERAL_SUGGESTIONS:
			newState.chatGeneralSuggestions = payload ?? [];
			return newState;
		case SET_CHAT_PRODUCTS:
			newState[
				action.key
					? CHAT_TYPES_KEYS[action.key].products
					: CHAT_TYPES_KEYS[CHAT_TYPE_CHAT].products
			] = payload ?? {};
			if (hasObjectItems(payload)) preserveAuraResponse(newState);
			return newState;
		case SET_CHAT_SHOP_A_LOOK:
			newState[
				action.key
					? CHAT_TYPES_KEYS[action.key].shopALook
					: CHAT_TYPES_KEYS[CHAT_TYPE_CHAT].shopALook
			] = payload ?? {};
			if (hasObjectItems(payload)) preserveAuraResponse(newState);
			return newState;
		case RESET_SUGGESTIONS_LIST: {
			newState.suggestions = getDefaultSuggestions();
			return newState;
		}
		case SET_SUGGESTIONS_LIST: {
			const {
				tags = [],
				tag_map = {},
				// AI_filters = {},
				title = "",
			} = payload ?? {};
			const currentTags = newState.suggestions.suggestions.tags || [];
			const isSameSuggestionSet = areSameTags(currentTags, tags);
			const hasProductsForNextTags = doProductKeysMatchTags(
				newState.suggestions.products,
				tags,
			);

			if (!isSameSuggestionSet && !hasProductsForNextTags) {
				newState.suggestions.products = {};
				newState.suggestions.allProductList = [];
				newState.suggestions.selectedTag = "";
			}
			newState.suggestions.suggestions.tags = tags;
			newState.suggestions.suggestions.tag_map = tag_map;
			// newState.suggestions.suggestions.AI_filters = AI_filters;
			newState.suggestions.suggestions.title = title;
			if (hasArrayItems(tags)) preserveAuraResponse(newState);

			return newState;
		}
		case SET_MORE_PRODUCTS: {
			const { data = {} } = payload ?? {};
			const tag = normalizeTag(payload?.tag);

			if (tag) {
				newState.moreProducts.allProductList.push(
					...(data.product_lists || [])
				);

				const allUniqueProducts = [
					...new Map(
						newState.moreProducts.allProductList.map((item) => [
							item.mfr_code,
							item,
						])
					).values(),
				];

				newState.moreProducts.allProductList = allUniqueProducts;

				newState.moreProducts.products[tag] = {
					...(newState.moreProducts.products[tag] || {}),
					...data,
					isLoading: false,
				};
				preserveAuraResponse(newState);

				if (
					!newState.moreProducts.products[tag].filters
					// && newState.suggestions.suggestions.AI_filters
				) {
					const { tag_map } = newState.moreProducts.moreProducts;

					const defaultFilters = {
						...(tag_map?.[tag] || {}),
					};

					newState.moreProducts.products[tag].filters = defaultFilters;
					newState.moreProducts.products[tag].filters.priceRange =
						defaultFilters.price &&
							(defaultFilters.price.min || defaultFilters.price.max)
							? [+defaultFilters.price.min, +defaultFilters.price.max]
							: defaultFilters.priceRange;

					// newState.suggestions.products[tag].filters = {
					// brand: defaultFilters.brand,
					// price: defaultFilters.price,
					// product_brand: defaultFilters.product_brand,
					// age_group: defaultFilters.age_group,
					// gender: defaultFilters.gender,
					// discount: defaultFilters.discount,
					// custom_filter: defaultFilters.custom_filter,
					// color: defaultFilters.color,
					// occasion: defaultFilters.occasion,
					// material: defaultFilters.material,
					// pattern: defaultFilters.pattern,
					// style: defaultFilters.style,
					// priceRange:
					// 	defaultFilters.price &&
					// 	(defaultFilters.price.min || defaultFilters.price.max)
					// 		? [+defaultFilters.price.min, +defaultFilters.price.max]
					// 		: defaultFilters.priceRange,
					// optional_filters: defaultFilters.optional_filters,
					// };
				}
			}

			return newState;
		}

		case SET_RECOMMENDATION_PRODUCTS: {
			const { data = {} } = payload ?? {};
			const tag = normalizeTag(payload?.tag);

			if (tag) {
				newState.recommendations.allProductList.push(
					...(data.product_lists || [])
				);

				const allUniqueProducts = [
					...new Map(
						newState.recommendations.allProductList.map((item) => [
							item.mfr_code,
							item,
						])
					).values(),
				];

				newState.recommendations.allProductList = allUniqueProducts;

				newState.recommendations.products[tag] = {
					...(newState.recommendations.products[tag] || {}),
					...data,
					isLoading: false,
				};
				preserveAuraResponse(newState);

				if (
					!newState.recommendations.products[tag].filters
					// && newState.suggestions.suggestions.AI_filters
				) {
					const { tag_map } = newState.recommendations.recommendations;

					const defaultFilters = {
						...(tag_map?.[tag] || {}),
					};

					newState.recommendations.products[tag].filters = defaultFilters;
					newState.recommendations.products[tag].filters.priceRange =
						defaultFilters.price &&
							(defaultFilters.price.min || defaultFilters.price.max)
							? [+defaultFilters.price.min, +defaultFilters.price.max]
							: defaultFilters.priceRange;

					// newState.suggestions.products[tag].filters = {
					// brand: defaultFilters.brand,
					// price: defaultFilters.price,
					// product_brand: defaultFilters.product_brand,
					// age_group: defaultFilters.age_group,
					// gender: defaultFilters.gender,
					// discount: defaultFilters.discount,
					// custom_filter: defaultFilters.custom_filter,
					// color: defaultFilters.color,
					// occasion: defaultFilters.occasion,
					// material: defaultFilters.material,
					// pattern: defaultFilters.pattern,
					// style: defaultFilters.style,
					// priceRange:
					// 	defaultFilters.price &&
					// 	(defaultFilters.price.min || defaultFilters.price.max)
					// 		? [+defaultFilters.price.min, +defaultFilters.price.max]
					// 		: defaultFilters.priceRange,
					// optional_filters: defaultFilters.optional_filters,
					// };
				}
			}

			return newState;
		}

		case SET_SUGGESTIONS_PRODUCTS: {
			const { data = {} } = payload ?? {};
			const tag = normalizeTag(payload?.tag);

			if (tag) {
				newState.suggestions.allProductList.push(
					...(data.product_lists || [])
				);

				const allUniqueProducts = [
					...new Map(
						newState.suggestions.allProductList.map((item) => [
							item.mfr_code,
							item,
						])
					).values(),
				];

				newState.suggestions.allProductList = allUniqueProducts;

				newState.suggestions.products[tag] = {
					...(newState.suggestions.products[tag] || {}),
					...data,
					isLoading: false,
				};
				preserveAuraResponse(newState);

				if (
					!newState.suggestions.products[tag].filters
					// && newState.suggestions.suggestions.AI_filters
				) {
					const { tag_map } = newState.suggestions.suggestions;

					const defaultFilters = {
						...(tag_map?.[tag] || {}),
					};

					newState.suggestions.products[tag].filters = defaultFilters;
					newState.suggestions.products[tag].filters.priceRange =
						defaultFilters.price &&
							(defaultFilters.price.min || defaultFilters.price.max)
							? [+defaultFilters.price.min, +defaultFilters.price.max]
							: defaultFilters.priceRange;

					// newState.suggestions.products[tag].filters = {
					// brand: defaultFilters.brand,
					// price: defaultFilters.price,
					// product_brand: defaultFilters.product_brand,
					// age_group: defaultFilters.age_group,
					// gender: defaultFilters.gender,
					// discount: defaultFilters.discount,
					// custom_filter: defaultFilters.custom_filter,
					// color: defaultFilters.color,
					// occasion: defaultFilters.occasion,
					// material: defaultFilters.material,
					// pattern: defaultFilters.pattern,
					// style: defaultFilters.style,
					// priceRange:
					// 	defaultFilters.price &&
					// 	(defaultFilters.price.min || defaultFilters.price.max)
					// 		? [+defaultFilters.price.min, +defaultFilters.price.max]
					// 		: defaultFilters.priceRange,
					// optional_filters: defaultFilters.optional_filters,
					// };
				}
			}

			return newState;
		}
		case SET_SUGGESTIONS_PRODUCTS_FILTERS: {
			const { tag = "", filters = {} } = payload ?? {};
			if (tag && newState.suggestions.products[tag]) {
				newState.suggestions.products[tag].filters = filters;
			}

			return newState;
		}
		case SET_SUGGESTIONS_PRODUCTS_IS_LOADING: {
			const { tag = "", isLoading = false } = payload ?? {};
			if (tag && newState.suggestions.products[tag]) {
				newState.suggestions.products[tag].isLoading = isLoading;
			}

			return newState;
		}

		case SET_SUGGESTIONS_SELECTED_TAG: {

			newState.suggestions.selectedTag = payload ?? "";
			return newState;

		}

		case SET_RECOMMENDATION_SELECTED_TAG: {

			newState.recommendations.selectedTag = payload ?? "";
			return newState;

		}

		case SET_MORESEARCH_SELECTED_TAG: {

			newState.moreProducts.selectedTag = payload ?? "";
			return newState;

		}


		case SET_SUGGESTIONS_SELECTED_ADDITIONAL_TAG: {
			if (newState.suggestions.products[action.tag]) {
				newState.suggestions.products[action.tag].selectedAdditionalTag =
					action.additional_tag;
			}

			return newState;
		}

		case CLEAR_SUGGESTIONS_SELECTED_ADDITIONAL_TAG: {
			if (newState.suggestions.products[action.tag]) {
				newState.suggestions.products[action.tag].selectedAdditionalTag = "";
			}

			return newState;
		}

		case REMOVE_SUGGESTION_DATA_TAG: {
			const { tag = "", isRemoveTag = true } = payload ?? {};
			const { tags = [] } = newState.suggestions.suggestions;
			const { products = {} } = newState.suggestions;

			if (tag) {
				let allProducts = [];

				if (isRemoveTag) {
					const updatedTags = tags?.filter((t) => t !== tag);

					delete products[tag]; // remove tag data
					newState.suggestions.suggestions.tags = updatedTags; // remove tag from tags list
				}

				Object?.keys(products)?.forEach((item) => {
					if (item !== tag) {
						allProducts.push(...products[item]?.product_lists);
					}
				});

				const productList = [
					...new Map(allProducts.map((item) => [item.mfr_code, item])).values(), // reset allProductList
				];

				newState.suggestions.allProductList = productList;
			}

			return newState;
		}

		case SET_SERVER_CHAT_MESSAGE:
			newState.serverChatMessage = payload ?? "";
			return newState;
		case SET_CHAT_PRODUCTS_DATA:
			newState.chatProductsData = payload ?? [];
			if (hasArrayItems(payload)) preserveAuraResponse(newState);
			return newState;
		case SET_WIDGET_HEADER:
			newState.widgetHeader = payload ?? "";
			newState.widgetHeaderRequest = action.widgetHeaderRequest ?? {};
			return newState;
		case SET_WIDGET_CHATHISTORY:
			newState.chatHistory =  payload ?? "";
			return newState;
		case SET_WIDGET_IMAGE:
			newState.widgetImage = payload ?? "";
			return newState;
		case SET_AI_EXTRACTION_DATA:
			newState.aiExtractionData = payload || {};
			newState.aiExtractionData.successVideoUrlExtraction = !!(
				payload &&
				payload.type === "video_url" &&
				payload.request?.video_url &&
				payload.data?.title &&
				payload.data?.status_code === 200
			);

			return newState;
		case SET_CHAT_USER_ACTION:
			newState.userAction = payload ?? "";
			return newState;
		case SET_SOCKET_EXCEPTION:
			newState.exception = payload ?? "";
			newState.showException = true;
			newState.showAuraIntro = false;
			return newState;
		case SET_SHOW_SOCKET_EXCEPTION:
			newState.showAuraIntro = false;
			newState.showException = payload ?? false;
			return newState;
		case SET_SHOW_AURA_INTRO:
			newState.showAuraIntro = payload;
			return newState;
		case SET_IS_FRESH_SEARCH:
			newState.isFreshSearch = payload;
			return newState;
		case RESET_AURA_SEARCH_RESPONSE:
			newState.auraHelperMessage = initialState.auraHelperMessage;
			newState.auraServerImage = initialState.auraServerImage;
			newState.auraOverlayCoordinates = initialState.auraOverlayCoordinates;
			newState.widgetHeader = initialState.widgetHeader;
			newState.widgetImage = initialState.widgetImage;
			newState.widgetHeaderRequest = initialState.widgetHeaderRequest;
			newState.chatProductsData = [...initialState.chatProductsData];
			newState[CHAT_TYPES_KEYS[CHAT_TYPE_CHAT].chatMessage] =
				initialState[CHAT_TYPES_KEYS[CHAT_TYPE_CHAT].chatMessage];
			newState[CHAT_TYPES_KEYS[CHAT_TYPE_CHAT].chatImageUrl] =
				initialState[CHAT_TYPES_KEYS[CHAT_TYPE_CHAT].chatImageUrl];
			newState[CHAT_TYPES_KEYS[CHAT_TYPE_CHAT].products] = {
				...initialState[CHAT_TYPES_KEYS[CHAT_TYPE_CHAT].products],
			};
			newState[CHAT_TYPES_KEYS[CHAT_TYPE_CHAT].shopALook] = {
				...initialState[CHAT_TYPES_KEYS[CHAT_TYPE_CHAT].shopALook],
			};
			newState.suggestions = getDefaultSuggestions();
			newState.recommendations = getDefaultRecommendation();
			newState.moreProducts = getDefaultmoreProduct();
			newState.chatHistory = [...initialState.chatHistory];
			return newState;
		case RESTORE_AURA_SEARCH_RESPONSE: {
			const snapshot = action.payload || newState.lastAuraResponse;
			if (!snapshot) return newState;
			newState.auraHelperMessage =
				snapshot.auraHelperMessage ?? newState.auraHelperMessage;
			newState.auraServerImage =
				snapshot.auraServerImage ?? newState.auraServerImage;
			newState.auraOverlayCoordinates =
				snapshot.auraOverlayCoordinates ?? newState.auraOverlayCoordinates;
			newState.widgetHeader = snapshot.widgetHeader ?? newState.widgetHeader;
			newState.widgetImage = snapshot.widgetImage ?? newState.widgetImage;
			newState.widgetHeaderRequest =
				snapshot.widgetHeaderRequest ?? newState.widgetHeaderRequest;
			newState.chatProductsData =
				snapshot.chatProductsData ?? newState.chatProductsData;
			newState[CHAT_TYPES_KEYS[CHAT_TYPE_CHAT].products] =
				snapshot.products ?? newState[CHAT_TYPES_KEYS[CHAT_TYPE_CHAT].products];
			newState[CHAT_TYPES_KEYS[CHAT_TYPE_CHAT].shopALook] =
				snapshot.shopALook ?? newState[CHAT_TYPES_KEYS[CHAT_TYPE_CHAT].shopALook];
			newState.suggestions = snapshot.suggestions ?? newState.suggestions;
			newState.recommendations =
				snapshot.recommendations ?? newState.recommendations;
			newState.moreProducts = snapshot.moreProducts ?? newState.moreProducts;
			newState.activeSearchOption =
				snapshot.activeSearchOption ?? newState.activeSearchOption;
			newState.chatHistory = snapshot.chatHistory ?? newState.chatHistory;
			return newState;
		}
		case CLEAR_LAST_AURA_RESPONSE:
			newState.lastAuraResponse = null;
			return newState;
		default:
			return newState;
	}
};

export default chatReducerV2;
