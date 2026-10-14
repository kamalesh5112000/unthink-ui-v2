import { notification } from "antd";

import {
	COLLECTION,
	COOKIE_EMAIL,
	COOKIE_TT_ID,
	defaultFavoriteColl,
	favorites_collection_name,
	INFLUENCER,
	INFLUENCER_SHARED,
	myProductsColl,
	ONLINE_SELLING_PLATFORM_SHOPIFY,
	PARAM_SEARCH_TEXT,
	PATH_STORE,
	PUBLISHED,
} from "../constants/codes";
import {
	auraYfretUserCollBaseUrl,
	is_store_instance,
	super_admin,
	current_store_name,
	shared_profile_on_root,
} from "../constants/config";
import {
	getSid,
	getTTid,
	removePrevSid,
	removeSid,
	removeTTid,
	removeUserEmail,
	removeUserId,
	setIsRegistered,
	setPrevSid,
	setSid,
	setTTid,
} from "./getTrackerInfo";
import { authAPIs, collectionQRCodeGeneratorURL } from "./serverAPIs";
 
// Simple navigate function for utility usage
const navigate = (path) => {
	if (typeof window !== 'undefined') {
		window.location.href = path;
	}
};

export const checkAndGenerateUserId = () => {
	const ttId = getTTid();

	if (!ttId) {
		const guestUserId = generateRandomNumber();
		if (guestUserId) {
			setTTid(guestUserId);
		}
	}
};

export const generateSessionId = () => {
	const sId = getSid();

	setPrevSid(sId || "null"); // set current id to prev

	const newSId = Math.random().toString();
	if (newSId) {
		setSid(newSId); // create new id
	}
};

export const getCurrentPath = () =>
	(typeof window !== "undefined" && window.location?.pathname) || "";

// for root shared page integration
export const getIsRootPage = () => getCurrentPath() === "/";

export const getIsSharedPage = () =>
	getCurrentPath().startsWith(INFLUENCER) ||
	(is_store_instance && getIsRootPage());

export const getIsStorePage = () => getCurrentPath().startsWith(PATH_STORE);

export const getIsCollectionPage = () => getCurrentPath().includes(COLLECTION);

export const getCurrentUrl = () =>
	(typeof window !== "undefined" && window.location?.href) || "";

export const getCurrentHostname = () =>
	(typeof window !== "undefined" && window.location?.hostname) || "";

export const isBrowser = () => typeof window !== "undefined";

export const getParams = (param) => {
	if (typeof window === "undefined") return null;
	const urlparams = new URL(window.location.href);
	return urlparams?.searchParams?.get(param);
};

export const searchTextOnStore = (searchText) => {
	if (searchText) {
		navigate(`/store/?${PARAM_SEARCH_TEXT}=${searchText}`);
	}
};

export const searchTextOnStoreV2 = (searchText) => {
	if (typeof window !== "undefined" && searchText && window.location?.href) {
		let url = new URL(window.location.href);
		let params = new URLSearchParams(url.search);
		if (params.has(PARAM_SEARCH_TEXT)) {
			params.delete(PARAM_SEARCH_TEXT);
		}
		params.append(PARAM_SEARCH_TEXT, searchText);
		const newUrl = `${url.pathname}?${params.toString()}`;
		navigate(newUrl);
	}
};

export const getNewUrlWithoutSearchText = () => {
	if (typeof window !== "undefined" && window.location?.href) {
		let url = new URL(window.location.href);
		let params = new URLSearchParams(url.search);
		if (params.has(PARAM_SEARCH_TEXT)) {
			params.delete(PARAM_SEARCH_TEXT);
		}
		const newUrl = params.toString()
			? `${url.pathname}?${params.toString()}`
			: url.pathname;
		return newUrl;
	}
};

// reload page if aura response take time more than 15 seconds
export const startAuraSearchTimer = (handleTimeout) => {
	if (typeof window !== "undefined") {
		window.socketTimerId = setTimeout(() => {
			// code to show error on aura timeout
			// we can add this on socket Connect_failed later
			// const count = Number(sessionStorage.getItem("socketCount"));
			// if (count) {
			// 	sessionStorage.setItem("socketCount", count + 1);
			// } else {
			// 	sessionStorage.setItem("socketCount", 1);
			// }
			//

			// REMOVED page reload and added Stop aura search on timeout
			// window.location = getNewUrlWithoutSearchText();
			handleTimeout && handleTimeout();
		}, 60000);
	}
};

export const stopAuraSearchTimer = () => {
	if (typeof window !== "undefined" && window.socketTimerId) {
		clearTimeout(window.socketTimerId);
	}
};

export const setCookie = (c_name, value, exdays) => {
	if (typeof document !== "undefined") {
		var exdate = new Date();
		exdate.setDate(exdate.getDate() + exdays);
		var c_value =
			escape(value) +
			(exdays === null ? "" : "; expires=" + exdate.toUTCString());
		c_value += ";SameSite=Strict; path=/";
		document.cookie = c_name + "=" + c_value;
	}
};

export const removeCookie = (c_name) => {
	if (typeof document !== "undefined") {
		document.cookie = `${c_name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
	}
};

export const generateRandomNumber = (count = 13) => {
	if (count > 13) count = 13;
	return Math.floor(Math.random() * +(1 + "0".repeat(count)));
};

export const generateDebounce = (timeout = 3000) => {
	let timer;
	return (func) => {
		return (...args) => {
			clearTimeout(timer);
			timer = setTimeout(() => {
				func.apply(this, args);
			}, timeout);
		};
	};
};

export const getCategoryData = (categories) => {
	const newCategoryData = categories.map((category) => {
		const sub_category = category.filtered_list.map((filteredData) => ({
			action_string: filteredData.action_string,
			sub_category: filteredData.name,
			image: filteredData.image,
		}));
		return {
			category: category.title,
			subcategories: sub_category,
		};
	});
	return newCategoryData;
};

export const getFinalImageUrl = (
  imgUrl,
  dimensionWidth,
  dimensionHeight
) => {
 
	
  if (!imgUrl) return imgUrl;

  // ✅ DO NOT TOUCH Next.js static images
  if (imgUrl.startsWith("/_next/static/")) {
    return imgUrl;
  }

  try {
    let url = imgUrl;

    // Only parse ABSOLUTE urls
    const URLData = url.startsWith("http")
      ? new URL(url)
      : null;

    // Webflow → main CDN
    if (
      url.includes("unthink_webflow") &&
      !url.includes("unthink_main_2023")
    ) {
      url =
        URLData.origin +
        URLData.pathname.replace(
          "unthink_webflow",
          "unthink_main_2023"
        ) +
        ".webp";
    }

    // Old main → new main CDN
    if (
      url.includes("unthink_main") &&
      !url.includes("unthink_main_2023")
    ) {
      url =
        URLData.origin +
        URLData.pathname.replace(
          "unthink_main",
          "unthink_main_2023"
        ) +
        ".webp";
    }

    // Resize logic (CDN only)
    if (
      url.includes("unthink_main_2023") &&
      url.endsWith(".webp") &&
      dimensionWidth &&
      dimensionHeight
    ) {
      url = url.replace(
        ".webp",
        `_${dimensionWidth}_${dimensionHeight}.webp`
      );
    }

    // S3 → CDN
    if (
      url.startsWith(
        "https://s3-us-west-1.amazonaws.com/cem.3816.img"
      )
    ) {
      url = url.replace(
        "https://s3-us-west-1.amazonaws.com/cem.3816.img",
        "https://cdn.unthink.ai/img"
      );
    }

    return url;
  } catch {
    return imgUrl;
  }
};


// REMOVE
// ADDED optimized code below
// export const URLAddParam = (string, key, value, andSym = "&") => {
// 	let url = string;
// 	url += `${string.includes("?") ? andSym : "?"}${key}=${value}`;
// 	return url;
// };

export const URLAddParam = (string, key, value) => {
	try {
		const url = new URL(string);
		const searchParams = url.searchParams;

		searchParams.set(key, value);
		return url.toString();
	} catch (error) {
		return string;
	}
};

export const URLGetParam = (string, key) => {
	try {
		const url = new URL(string);
		const searchParams = url.searchParams;

		return searchParams.get(key);
	} catch (error) {
		return null;
	}
};

// get query param with name = url from the provided string and add the sid in that value param value
export const addSidInProductUrl = (string, sid, collection_id) => {
	if (!string) return "";

	const platform =
		navigator.userAgentData?.mobile !== undefined
			? navigator.userAgentData.mobile
				? "mobile"
				: "web"
			: /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
				? "mobile"
				: "web";

	const Clickpage = sessionStorage.getItem("clickPage");

	try {
		const url = new URL(string);

		if (url.hostname.includes("amazon.com")) {
			url.search = "";
			url.searchParams.set("utm_source", "unthink");
			url.searchParams.set("utm_medium", platform);
			url.searchParams.set("utm_campaign", collection_id);
			url.searchParams.set("utm_content", Clickpage);
			url.searchParams.set("unthink_source", Clickpage);
			url.searchParams.set("unthink_medium", platform);
			url.searchParams.set("unthink_campaign", collection_id);
 

			return url.toString();
		}

		url.searchParams.set("utm_source", "unthink");
		url.searchParams.set("utm_medium", platform);
		url.searchParams.set("utm_campaign", collection_id);
		url.searchParams.set("utm_content", Clickpage);
		url.searchParams.set("unthink_source", Clickpage);
		url.searchParams.set("unthink_medium", platform);
		url.searchParams.set("unthink_campaign", collection_id);

	 

		return url.toString();
	} catch (error) {
		return string;
	}
};

export const generateRoute = (userId, user_name) => {
	let shareUrl = "";
	if (user_name) {
		shareUrl = `${INFLUENCER}/${user_name}`;
	} else if (userId) {
		shareUrl = `${INFLUENCER_SHARED}/${userId}`;
	}
	return shareUrl;
};

export const generateShareV2Url = (userId, user_name) => {
	const shareUrl = generateRoute(userId, user_name);
	return isBrowser() ? `${window.location?.origin}${shareUrl}` : "";
};

export const getPercentage = (listPrice, price) => {
	const diff = listPrice - price;
	const percent = (diff / listPrice) * 100;
	return Math.round(percent);
};

export const isValidNumber = (value) => {
	return /^[0-9]$/.test(value) || /^[1-9][0-9]*$/.test(value);
};
export const getDateValues = (timeStamp) => {
	try {
		var dateFormat = new Date(timeStamp);

		return {
			date: dateFormat.getDate(),
			month: dateFormat.getMonth() + 1,
			year: dateFormat.getFullYear(),
			hours: dateFormat.getHours(),
			minutes: dateFormat.getMinutes(),
			seconds: dateFormat.getSeconds(),
		};
	} catch (error) {
		return {};
	}
};

export const getDateString = (timeStamp) => {
	const dateValues = getDateValues(timeStamp);
	return dateValues.month + "/" + dateValues.date + "/" + dateValues.year;
};

const contactFormGetStartedCCMails = ["tinamani@unthink.ai"];

export function generateOnContactFormSubmit(
	id,
	showSuccessMessage = true,
	onSuccess
) {
	return function (event) {
		event.preventDefault();
		const email = this.email.value;
		const page_section = this.page_section?.value;
		const website = this.website?.value || "";

		// generate a five digit number for the contact_number variable
		this.contact_number.value = (Math.random() * 100000) | 0;
		// these IDs from the previous steps
		if (typeof window !== "undefined" && window.emailjs) {
			window.emailjs.sendForm("service_grrt6ds", "template_1hm264c", this).then(
				function () {
			 

					// sending get started mail to the entered email
					// START
					try {
						const payload = {
							emailId: email,
							cc: contactFormGetStartedCCMails,
						};

						if (
							page_section === "brands_contact_field_top" ||
							page_section === "travel_shopping_festival_request_media_kit"
						) {
							payload.user_type = "brand";
							payload.website_url = website;
						}

						// removed sending mail for brands for now.
						if (
							page_section !== "brands_contact_field_top" &&
							page_section !== "travel_shopping_festival_request_media_kit"
						) {
							authAPIs.GetStartedSendMailAPICall(payload);
						}
					} catch (error) { }
					// END

					if (typeof document !== "undefined") {
						document.getElementById(id)?.reset();
					}

					showSuccessMessage &&
						notification.success({
							message:
								"Thank you for reaching out. We will get back to you soon.",
						});

					onSuccess && onSuccess();
				},
				function (error) {
					console.log("FAILED...", error);
				}
			);
		}
	};
}

export function generateOnScheduleDemoSubmit(
	id,
	showSuccessMessage = true,
	onSuccess
) {
	return function (event) {
		event.preventDefault();

		// generate a five digit number for the contact_number variable
		// this.contact_number.value = (Math.random() * 100000) | 0;
		// these IDs from the previous steps
		const serviceID = "service_grrt6ds";
		const templateID = "template_dp738lp";

		if (typeof window !== "undefined" && window.emailjs) {
			window.emailjs.sendForm(serviceID, templateID, this).then(
				function () {
			 

					if (typeof document !== "undefined") {
						document.getElementById(id)?.reset();
					}

					showSuccessMessage &&
						notification.success({
							message:
								"Thank you for reaching out. We will get back to you soon.",
						});

					onSuccess && onSuccess();
				},
				function (error) {
					console.log("FAILED...", error);
				}
			);
		}
	};
}

export const getCurrentTheme = () => {
	if (typeof window === "undefined" || !window.location?.origin) {
		return "theme-unthink";
	}
	switch (window.location.origin) {
		case "https://shop.budgettravel.com":
		case "https://unthink-ui-gatsby-unthink-stage-qvde2butpa-uc.a.run.app":
			return "theme-budgettravel";

		default:
			return "theme-unthink";
	}
};

export const clearStorages = () => {
	removeTTid();
	removeUserEmail();
	setIsRegistered(false);
	removeSid();
	removePrevSid();
	removeUserId();
	sessionStorage.removeItem("Kiosk-login");
	sessionStorage.removeItem('selectedTag')
	// window.location.href = shared_profile_on_root ? "/" : "/store"; // removed reload page on logout
};
export const clearStoragesKiosk = () => {
	sessionStorage.removeItem("Kiosk-login");
	sessionStorage.removeItem("selectedTag");
};

export const getIsStoreInstance = () =>
	is_store_instance ||
	(typeof window !== "undefined" &&
		window.localStorage &&
		window.localStorage.getItem("UN_IS_STORE") === "true");

export const setIdpSignInMethod = (method) =>
	typeof window !== "undefined" &&
	window.localStorage &&
	window.localStorage.setItem("UN_SIGN_IN_IDP_METHOD", method);

export const getIdpLoginMethod = () =>
	(typeof window !== "undefined" &&
		window.localStorage &&
		window.localStorage.getItem("UN_SIGN_IN_IDP_METHOD")) ||
	"";

export const getBlogCollectionPagePath = (
	user_name,
	collectionPath,
	collectionId,
	user_id,
	collectionStatus,
	hosted_stores = [],
	collection_theme
) => {
 
	
	const isStoreInstance = getIsStoreInstance();

	if (
		isStoreInstance &&
		(shared_profile_on_root === user_name ||
			(hosted_stores.includes(current_store_name) &&
				collectionStatus === PUBLISHED)) &&
		collectionPath
	) {
		if (collection_theme)
			return `/categories/${collection_theme}/${collectionPath}`;
		return `/collections/${collectionPath}`;
	}  else if (user_name && collectionId) {
		return `/influencer/${user_name}/${collectionId}`;
	}
	 else if (user_name && collectionPath) {
		if (collection_theme)
			return `/${user_name}/categories/${collection_theme}/${collectionPath}`;
		return `/${user_name}/collections/${collectionPath}`;
	}  else if (user_id) {
		return `/influencer/shared/${user_id}/${collectionId}`;
	} else if (collectionPath) {
		return `/collections/${collectionPath}`;
	}
};

export const getBlogCollectionPageSlugPath = (user_name) => {
	// user_name is compulsory
	const isStoreInstance = getIsStoreInstance();

	if (isStoreInstance && shared_profile_on_root === user_name) {
		return `/collections/{collectionPath}`;
	} else if (user_name) {
		return `/${user_name}/collections/{collectionPath}`;
	}
};

export const getEditCollectionPagePath = (collectionId) => {
	return `/collection/${collectionId}/review`;
};

export const getThemeCollectionsPagePath = (collectionTheme) => {
	return `/categories/${collectionTheme}`;
};

export const getCollectionsView = (
	user_name // auth user name
) => {
	const isStoreInstance = getIsStoreInstance();

	if (isStoreInstance && super_admin === user_name && user_name) return "admin";

	// if (user_name) return "influencer";
if (user_name  &&  window.location.pathname?.startsWith('/my-profile/')) return "influencer";
	// console.log('isStoreHomePage',user_name != super_admin &&  window.location.pathname?.startsWith('/my-profile/') );
if (user_name) return "influencer";
	return "public";
};

export const getCollectionPageView = (
	isAuthUser, // match auth user id and influencerUser user_id, for check collection is auth user's or not
	isStoreHomePage
) => {
	// if (isAuthUser &&  window.location.pathname === '/my-profile/' && !super_admin ) return "influencer";
	
	return "public";
};

export const getProductDetailsPagePath = (productMfrCode) => {
	return `/product/${productMfrCode}`;
};

// collectionQRCodeGenerator now accepts either a collectionPagePath or a full targetUrl
export const collectionQRCodeGenerator = (collectionPagePathOrUrl) => {
	const origin = typeof window !== 'undefined' ? window.location?.origin : '';
	const target = collectionPagePathOrUrl?.startsWith('http')
		? collectionPagePathOrUrl
		: `${origin}${collectionPagePathOrUrl}`;
	return `${auraYfretUserCollBaseUrl}${collectionQRCodeGeneratorURL}?page_url=${encodeURIComponent(target)}`;
};

// Helper to build the page query value used for auto-login verify URLs
export const buildAutoLoginPagePath = (page, extra = '') => {
	if (!page) return '';
	// examples: 'my-products', 'create-collection', 'cart', 'product/<mfr_code>'
	return extra ? `${page}/${extra}` : page;
};

export const checkIsFavoriteCollection = (collection) =>
	collection.collection_name?.toLowerCase() ===
	defaultFavoriteColl.collection_name.toLowerCase() &&
	collection.type === defaultFavoriteColl.type;

export const checkIsMyProductsCollection = (collection) =>
	collection?.collection_name?.toLowerCase() ===
	myProductsColl.collection_name.toLowerCase();

export const checkIsShopifyStore = (sellerDetails) =>
	sellerDetails.platform === ONLINE_SELLING_PLATFORM_SHOPIFY;

export const getCollectionNameToShow = (collection) =>
	checkIsFavoriteCollection(collection)
		? favorites_collection_name
		: collection.name || collection.collection_name;

export const filterAvailableProductList = (pList) => pList;

export const getIsSellerLoggedIn = (storeSellerList = [], emailId ) =>
	storeSellerList.includes(emailId);

export const filterProductList = (pList, filters) => {
	return isEmpty(filters)
		? pList
		: pList.filter((p) => {
			if (!isEmpty(filters.priceRange)) {
				if (
					filters.priceRange[1] !== 0 &&
					!(
						p.price >= filters.priceRange[0] &&
						p.price <= filters.priceRange[1]
					)
				) {
					return false;
				}
			}

			if (!isEmpty(filters.discount)) {
				if (!filters.discount.includes(p.discount)) {
					return false;
				}
			}

			if (!isEmpty(filters.product_brand)) {
				if (!filters.product_brand.includes(p.product_brand)) {
					return false;
				}
			}

			if (!isEmpty(filters.brand)) {
				if (!filters.brand.includes(p.brand)) {
					return false;
				}
			}

			return true;
		});
};

export const checkIsPublishedCollection = (cl) => cl.status === PUBLISHED;

export const numCeil = (n = 0, m = 1) => {
	// Smaller multiple
	let a = parseInt(n / m, 10) * m;

	// Larger multiple
	let b = a + m;

	return b;
};

export const numFloor = (n = 0, m = 1) => {
	// Smaller multiple
	let a = parseInt(n / m, 10) * m;

	return a;
};

// NOT USING // used to create mongo query // REMOVE
// export const preparePlistFilterQuery = (filters = {}, priceFilter = []) => {
// 	const query = { $and: [] };
// 	if (filters.brands?.length || filters.price || filters.prod_brands?.length) {
// 		if (filters.brands?.length) {
// 			query.$and.push({ brands: { $in: filters.brands } });
// 		}
// 		if (filters.prod_brands?.length) {
// 			query.$and.push({
// 				prod_brands: { $in: filters.prod_brands },
// 			});
// 		}

// 		// filter query for price range selected form dropdown
// 		if (filters.price) {
// 			const price = priceFilter.find(
// 				(filter) => filter.value === filters.price
// 			);
// 			query.$and = [...query.$and, ...price.query];
// 		}

// 		// filter query for price range selected form slider
// 		if (
// 			filters.priceRange &&
// 			(filters.priceRange[0] || filters.priceRange[1])
// 		) {
// 			query.$and = [
// 				...query.$and,
// 				{ price: { $gte: filters.priceRange[0] } },
// 				{ price: { $lte: filters.priceRange[2] } },
// 			];
// 		}
// 	}

// 	return query;
// };

/**
 * returns the array of random n elements from the given array
 * @param {array} array input array
 * @param {number} n number of elements to retrieve from input array
 * @returns {array} output array of n random elements
 */
export function getRandomArrayElements(array = [], n = 1) {
	// Shuffle array
	const shuffled = array.sort(() => 0.5 - Math.random());

	// Get sub-array of first n elements after shuffled
	return shuffled.slice(0, n);
}

/**
 * Checks if a JavaScript value is empty
 * @example
 *    isEmpty(null); // true
 *    isEmpty(undefined); // true
 *    isEmpty(''); // true
 *    isEmpty([]); // true
 *    isEmpty({}); // true
 * @param {any} value - item to test
 * @returns {boolean} true if empty, otherwise false
 */
export function isEmpty(value) {
	return (
		value === null || // check for null
		value === undefined || // check for undefined
		value === "" || // check for empty string
		(Array.isArray(value) && value.length === 0) || // check for empty array
		(typeof value === "object" && Object.keys(value).length === 0) // check for empty object
	);
}
 
/**
 * return the collection default description based on the collection name
 * @example
 *    isEmpty(undefined); // "Take a look at my collection"
 *    isEmpty('NAME'); // "Shop for products related to NAME"
 * @param {string} collectionName - collection name to use
 * @returns {string} collection default description
 */
export function getCollectionDefaultDescription(collectionName) {
	return collectionName
		? `Shop for products related to ${collectionName}`
		: "Take a look at my collection";
}

export const makeBodyOverflowHidden = () => {
	if (typeof window !== "undefined" && window.document?.body)
		window.document.body.style.overflow = "";
};

export const makeBodyOverflowUnset = () => {
	if (typeof window !== "undefined" && window.document?.body)
		window.document.body.style.overflow = "unset";
};

export const filterProductListBySelectedTags = (list, tags, tag_map) => {
	const tagsToUse = tag_map // taking mapped tags from tag_map new property to filter products based on selected tags and mapped tags as well
		? tags.concat(...tags.map((t) => tag_map[t] || []))
		: tags;

	return list.filter((p) => {
		// If `tagged_by` is missing or empty, show only if "All" is selected
		if (!p.tagged_by || p.tagged_by.length === 0) {
			return tagsToUse.includes("All");
		}

		// Otherwise, apply normal filtering
		return p.tagged_by.some(
			(tag) =>
				typeof tag === "string" &&
				(tagsToUse.includes(tag) || tagsToUse.includes(tag.toLowerCase()))
		);
	});
};

export const productCountToShow = (width, isCoverImageAvailable) => {
	let count;
	if(width >= 1536){
		if (isCoverImageAvailable) {
			count = 6;
		} else {
			count = 9;
		}
	}
	 else if (width <1024  ) {
		count = 4;
	} else if (width >= 640 && width < 1536) {
		if (isCoverImageAvailable) {
			count = 6;
		} else {
			count = 6;
		}
	}

	return count;
};

export const getTagMapTagsBySelectedTags = (
	tags,
	tag_map = {},
	initialTags = []
) =>
	tag_map // taking mapped tags from tag_map property
		? initialTags.concat(...tags.map((t) => tag_map[t] || []))
		: initialTags;

export const setLocalChatMetadata = ({
	gender,
	age_group,
	color,
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
	activeChatSearchType,
}) =>
	typeof window !== "undefined" &&
	sessionStorage?.setItem(
		"chatMetadata",
		JSON.stringify({
			...getLocalChatMetadata(),
			gender,
			age_group,
			color,
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
			activeChatSearchType,
		})
	);

export const getLocalChatMetadata = () =>
	JSON.parse(
		(typeof window !== "undefined" &&
			sessionStorage?.getItem("chatMetadata")) ||
		"{}"
	);

// Capitalizes the first character of a string
// use capitalFirstLetter function or also can use capital-first-letter class from index.scss
export const capitalFirstLetter = (collection_name = "") => {
	const str = String(collection_name || "");
	return str.charAt(0).toUpperCase() + str.slice(1);
};

// purify object, remove data from obj which have empty string,array,obj
// for price min and max both value have to available
export const removeEmptyItems = (filters) => {
	let updatedFilters = {};
	for (const key in filters) {
		if (key === "price") {
			if (filters[key]?.min && filters[key]?.max) {
				updatedFilters[key] = filters[key];
			}
		} else if (!isEmpty(filters[key])) {
			updatedFilters[key] = filters[key];
		}
	}
	return updatedFilters;
};

export const getSubDomain = (hostname) => {
	const array = hostname.split(".");
	if (array.length === 3) {
		return array[0];
	} else {
		return undefined;
	}
};

export const AdminCheck = (authUser, currentStoreName, adminUserId, admin_list) => {
	const email = authUser?.emailId;
	const isEmailAdmin = admin_list?.includes(email);
	const isUserIdMatch = authUser?.user_id === adminUserId;
	return !!(isUserIdMatch || isEmailAdmin);
};

export const cleanImage = (img)=> typeof img === "string" ? img.replace(/"/g, "").trim() : "";
export const KIOSK_LOGIN_STORAGE_KEY = "Kiosk-login";

export const getStoredKioskLogin = () => {
	if (typeof window === "undefined") return null;

	const login = sessionStorage.getItem(KIOSK_LOGIN_STORAGE_KEY);
	if (!login) return null;

	try {
		return JSON.parse(login);
	} catch (error) {
		return login;
	}
};

export const getStoredKioskLoginUserId = () => {
	const kioskLogin = getStoredKioskLogin();

	if (!kioskLogin) return "";
	if (typeof kioskLogin === "string") return kioskLogin;

	return kioskLogin?.user_id || "";
};
