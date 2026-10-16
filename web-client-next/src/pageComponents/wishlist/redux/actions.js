import {
	IS_CREATE_WISHLIST,
	IS_EDIT_WISHLIST,
	REMOVE_FROM_FAVORITES,
	SET_SELECTED_COLLECTION_DATA,
	SET_SELECTED_WISHLIST_ID,
	OPEN_WISHLIST_MODAL,
	SET_SHOW_WISHLIST_PRODUCTS,
	CLOSE_WISHLIST_MODAL,
	SET_PRODUCTS_TO_SAVE_IN_WISHLIST,
	SET_SELECTED_COLLECTION_PAYLOAD,
} from "./constants";

export const openWishlistModal = (payload) => ({
	type: OPEN_WISHLIST_MODAL,
	payload,
});

export const closeWishlistModal = () => ({
	type: CLOSE_WISHLIST_MODAL,
});

export const setSelectedWishlistId = (payload) => ({
	type: SET_SELECTED_WISHLIST_ID,
	payload,
});

export const setShowWishlistProducts = (payload) => ({
	type: SET_SHOW_WISHLIST_PRODUCTS,
	payload,
});

export const setProductsToAddInWishlist = (payload, createWishlistData) => ({
	type: SET_PRODUCTS_TO_SAVE_IN_WISHLIST,
	payload,
	createWishlistData,
});
export const setSelectedCollectionPayload = (payload ) => ({
	type: SET_SELECTED_COLLECTION_PAYLOAD,
	payload,
});

export const setRemoveFromFavorites = (payload) => ({
	type: REMOVE_FROM_FAVORITES,
	payload,
});

export const setIsCreateWishlist = (payload) => ({
	type: IS_CREATE_WISHLIST,
	payload,
});

export const setIsEditWishlist = (payload) => ({
	type: IS_EDIT_WISHLIST,
	payload,
});

export const setSelectedCollectionData = (payload) => ({
	// to show collection details on sidebar
	type: SET_SELECTED_COLLECTION_DATA,
	payload,
});
