import { current_store_name } from "../../constants/config";

const gTagEvent = "event";

const event_collection_page_view = "collection_page_view";
const event_shop_widget_click = "shop_widget_click";
const event_collection_product_click = "collection_product_click";
const event_aura_product_click = "aura_product_click";

const trackGtagEvent = (eventName, params = {}) => {
	if (typeof window === "undefined" || typeof window.gtag !== "function") {
		return;
	}

	window.gtag(gTagEvent, eventName, {
		store_name: current_store_name,
		experience_type: "kiosk",
		...params,
	});
};

const getKioskTabName = (tabName) => {
	if (tabName === "#Trending") return "trending";
	if (tabName === "Look Books") return "look_books";
	if (tabName === "Social Media") return "social_media";
	return tabName || "unknown";
};

const getCollectionId = (collection = {}) =>
	collection.collection_id || collection._id || collection.id || "";

const getCollectionName = (collection = {}) =>
	collection.collection_name || collection.name || "";

export const gTagKioskTabClick = ({ tab_name }) => {
	trackGtagEvent("kiosk_tab_click", {
		tab_name: getKioskTabName(tab_name),
	});
};

export const gTagKioskTabAutoSwitch = ({ tab_name }) => {
	trackGtagEvent("kiosk_tab_auto_switch", {
		tab_name: getKioskTabName(tab_name),
	});
};

export const gTagKioskCollectionClick = ({ collection = {}, tab_name, source }) => {
	trackGtagEvent("kiosk_collection_click", {
		collection_id: getCollectionId(collection),
		collection_name: getCollectionName(collection),
		collection_path: collection.path || "",
		collection_status: collection.status || "",
		tab_name: getKioskTabName(tab_name),
		source: source || "",
	});
};

export const gTagKioskCollectionView = ({ collection = {}, tab_name }) => {
	trackGtagEvent("kiosk_collection_view", {
		collection_id: getCollectionId(collection),
		collection_name: getCollectionName(collection),
		collection_path: collection.path || "",
		collection_status: collection.status || "",
		product_count: Array.isArray(collection.product_lists)
			? collection.product_lists.length
			: 0,
		tab_name: getKioskTabName(tab_name),
	});
};

export const gTagKioskProductClick = ({ product = {}, collection = {}, tab_name, source }) => {
	trackGtagEvent("kiosk_product_click", {
		item_id: product.mfr_code || product.product_id || product._id || product.id || "",
		item_name: product.name || product.product_name || "",
		collection_id: getCollectionId(collection),
		collection_name: getCollectionName(collection),
		collection_path: collection.path || "",
		tab_name: getKioskTabName(tab_name),
		source: source || "",
	});
};

export const gTagKioskProductView = ({ item_id }) => {
	trackGtagEvent("kiosk_product_view", {
		item_id: item_id || "",
	});
};

export const gTagKioskCartView = () => {
	trackGtagEvent("kiosk_cart_view");
};

export const gTagCollectionPageView = (data) => {
	if (typeof window === "undefined" || !window.location?.href) {
		return "";
	}
	// let collection_id = data._id && data._id.toString();

 

	const {
		collection_path,
		collection_status,
		user_id,
		user_name,
		collection_id,
		Clickpage,
	} = data;

	const mainUrl = window.location.href;
	const url = new URL(mainUrl);
	const platform =
		typeof navigator !== "undefined" && navigator.userAgentData?.mobile !== undefined
			? navigator.userAgentData.mobile
				? "mobile"
				: "web"
			: typeof navigator !== "undefined" && /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
				? "mobile"
				: "web";

	// UTM params
	url.searchParams.set("utm_source", "unthink");
	url.searchParams.set("utm_medium", platform || ""); // 'web' or 'mobile'
	url.searchParams.set("utm_campaign", collection_id);
	// url.searchParams.set('utm_term', term);
	url.searchParams.set("utm_content", Clickpage);
	// unthink params
	url.searchParams.set("unthink_source", Clickpage);
	url.searchParams.set("unthink_medium", platform || ""); // 'web' or 'mobile'
	url.searchParams.set("unthink_campaign", collection_id);
	// url.searchParams.set('unthink_shared', shared_id || '');
	// url.searchParams.set('unthink_term', term);

	const og_url = url.href;
 

	let user = user_id;
	if (user && user_name) {
		user = user + "|" + user_name;
	}

 

	window.gtag &&
		window.gtag(gTagEvent, event_collection_page_view, {
			collection_path,
			collection_status,
			user,
			collection_id,
			og_url,
		});

	// window.history?.replaceState?.({}, "", og_url);

	return url.toString();
};

export const gTagCollectionProductClick = (data) => {
	if (typeof window === "undefined" || !window.location?.href) {
		return "";
	}
	const Clickpage =
		typeof sessionStorage !== "undefined"
			? sessionStorage.getItem("clickPage")
			: null;

	const {
		mft_code,
		collection_path,
		user_id,
		user_name,
		collection_id,
		collection_name,
	} = data;

 

	const mainUrl = window.location.href;
	const url = new URL(mainUrl);
	const platform =
		typeof navigator !== "undefined" && navigator.userAgentData?.mobile !== undefined
			? navigator.userAgentData.mobile
				? "mobile"
				: "web"
			: typeof navigator !== "undefined" && /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
				? "mobile"
				: "web";

	// UTM params
	url.searchParams.set("utm_source", "unthink");
	url.searchParams.set("utm_medium", platform || ""); // 'web' or 'mobile'
	url.searchParams.set("utm_campaign", collection_id);
	// url.searchParams.set('utm_term', term);
	url.searchParams.set("utm_content", Clickpage);
	// unthink params
	url.searchParams.set("unthink_source", Clickpage);
	url.searchParams.set("unthink_medium", platform || ""); // 'web' or 'mobile'
	url.searchParams.set("unthink_campaign", collection_id);
	// url.searchParams.set('unthink_shared', shared_id || '');
	// url.searchParams.set('unthink_term', term);

	let user = user_id;
	if (user && user_name) {
		user = user + "|" + user_name;
	}

	const og_url = url.href;
	 
	window.gtag &&
		window.gtag(gTagEvent, event_collection_product_click, {
			mft_code,
			collection_path,
			user,
			collection_id,
			collection_name,
			og_url,
		});

	// window.history?.replaceState?.({}, "", og_url);

	return url.toString();
};

export const gTagAuraProductClick = (data) => {
	if (typeof window === "undefined" || !window.location?.href) {
		return "";
	}
	const { mft_code, aura_widget, user_id, user_name, term } = data;

 

	const mainUrl = window.location.href;
	const url = new URL(mainUrl);
	const platform =
		typeof navigator !== "undefined" && navigator.userAgentData?.mobile !== undefined
			? navigator.userAgentData.mobile
				? "mobile"
				: "web"
			: typeof navigator !== "undefined" && /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
				? "mobile"
				: "web";

	// UTM params
	url.searchParams.set("utm_source", "unthink");
	url.searchParams.set("utm_medium", platform || ""); // 'web' or 'mobile'
	url.searchParams.set("utm_campaign", aura_widget);
	url.searchParams.set("utm_term", term);
	url.searchParams.set("utm_content", "unthink_aura_widget");
	// unthink params
	url.searchParams.set("unthink_source", "unthink_aura_widget");
	url.searchParams.set("unthink_medium", platform || ""); // 'web' or 'mobile'
	url.searchParams.set("unthink_campaign", aura_widget);
	// url.searchParams.set("unthink_shared", shared_id || "");
	url.searchParams.set("unthink_term", term);

	let user = user_id;
	if (user && user_name) {
		user = user + "|" + user_name;
	}

	const og_url = url.href;
 

	window.gtag &&
		window.gtag(gTagEvent, event_aura_product_click, {
			mft_code,
			aura_widget,
			user,
			term,
			og_url,
		});

	// window.history?.replaceState?.({}, "", og_url);

	return url.toString();
};

export const gTagShopWidgetClick = (data) => {
	if (typeof window === "undefined" || !window.location?.href) {
		return "";
	}
	const {
		collection_path,
		collection_status,
		shared_id,
		user,
		collection_id,
		term
	} = data;

 

	const mainUrl = window.location.href;
	const url = new URL(mainUrl);
	const platform =
		typeof navigator !== "undefined" && navigator.userAgentData?.mobile !== undefined
			? navigator.userAgentData.mobile
				? "mobile"
				: "web"
			: typeof navigator !== "undefined" && /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
				? "mobile"
				: "web";

	// UTM params
	url.searchParams.set("utm_source", "unthink");
	url.searchParams.set("utm_medium", platform || ""); // 'web' or 'mobile'
	url.searchParams.set("utm_campaign", collection_id);
	// url.searchParams.set("utm_term", term);
	url.searchParams.set("utm_content", "unthink_collection_carousel");
	// unthink params
	url.searchParams.set("unthink_source", "unthink_collection_carousel");
	url.searchParams.set("unthink_medium", platform || ""); // 'web' or 'mobile'
	url.searchParams.set("unthink_campaign", collection_id);
	// url.searchParams.set("unthink_shared", shared_id || "");
	// url.searchParams.set("unthink_term", term);

	const og_url = url.href;

};
