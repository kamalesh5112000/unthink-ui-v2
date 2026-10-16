import {
	IS_CREATE_WISHLIST,
	IS_EDIT_WISHLIST,
	REMOVE_FROM_FAVORITES,
	SET_SELECTED_COLLECTION_DATA,
	SET_SELECTED_WISHLIST_ID,
	OPEN_WISHLIST_MODAL,
	CLOSE_WISHLIST_MODAL,
	SET_PRODUCTS_TO_SAVE_IN_WISHLIST,
	SET_SELECTED_COLLECTION_PAYLOAD,
} from "./constants";

const initialState = {
	selectedCollectionId: "",
	showWishlistModal: false,
	showCollectionDetails: false,
	productsToAddInWishlist: [],
	productsToAddInWishlistData: {},
	collectionPayload: {},
	removeFromFavorites: true,
	isCreateWishlist: false,
	isEditWishlist: false,
	// isSaveProductLists: false,

	selectedCollection: {
		//
		showBlogPlist: false,
		selectedBlogCollection: "",
		plist_name: "",
		productList: [],
		isFetchingProduct: false,
		isFetchingNext: false,
		plistNextUrl: "",
		plist_total_count: 0,
	},
};

const wishlistReducer = (state = initialState, action) => {
	const payload = action.payload;
	const newState = { ...state };
	switch (action.type) {
		case OPEN_WISHLIST_MODAL:
			newState.showWishlistModal = true;
			// newState.isSaveProductLists = payload?.isSaveProductLists ?? false;
			return newState;
		case CLOSE_WISHLIST_MODAL:
			// newState.showWishlistModal = false;
			return {
				...initialState,
				selectedCollection: { ...initialState.selectedCollection },
			};
		case SET_SELECTED_WISHLIST_ID:
			newState.selectedCollectionId = payload;
			newState.showCollectionDetails = !!payload;
			newState.selectedCollection = {};
			return newState;
		case SET_PRODUCTS_TO_SAVE_IN_WISHLIST:
			newState.productsToAddInWishlist = payload ?? [];
			newState.productsToAddInWishlistData = action.createWishlistData ?? {};
			return newState;
		case SET_SELECTED_COLLECTION_PAYLOAD:
			newState.collectionPayload = payload ?? [];
			 
			return newState;
		case REMOVE_FROM_FAVORITES:
			newState.removeFromFavorites = payload ?? false;
			return newState;
		case IS_CREATE_WISHLIST:
			newState.isCreateWishlist = payload ?? false;
			return newState;
		case IS_EDIT_WISHLIST:
			newState.isEditWishlist = payload ?? false;
			return newState;

		case SET_SELECTED_COLLECTION_DATA:
			newState.showCollectionDetails = !!payload;
			newState.selectedCollectionId = payload ? payload._id : "";
			// newState.selectedCollection.data = payload ? payload : {};
			// newState.selectedCollection.plist_name =
			// 	payload?.path?.split("::")[0] ?? "";
			return newState;

		default:
			return newState;
	}
};

export default wishlistReducer;
