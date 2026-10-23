import {
	CLOSE_COLLECTION_SHARE_MODAL,
	OPEN_COLLECTION_SHARE_MODAL,
} from "./constants";

const initialState = {
	isModalOpen: false,
	collectionDetails: {},
	collectionOwner: {},
	isAutoCreateCollection: false,
	shareOptions: {},
};

const productDetailsCopyModalReducer = (state = initialState, action = {}) => {
	const newState = { ...state };
	switch (action.type) {
		case OPEN_COLLECTION_SHARE_MODAL:
			newState.isModalOpen = true;
			newState.collectionDetails = action.collection;
			newState.collectionOwner = action.collectionOwner;
			newState.isAutoCreateCollection = action.isAutoCreateCollection; //  collection created on share click of AURA response
			newState.shareOptions = action.shareOptions || {};
			return newState;
		case CLOSE_COLLECTION_SHARE_MODAL:
			newState.isModalOpen = false;
			newState.collectionDetails = {};
			newState.collectionOwner = {};
			newState.isAutoCreateCollection = false;
			newState.shareOptions = {};
			return newState;

		default:
			return state;
	}
};

export default productDetailsCopyModalReducer;
