import {
	OPEN_COLLECTION_SHARE_MODAL,
	CLOSE_COLLECTION_SHARE_MODAL,
} from "./constants";

export const openCollectionShareModal = (
	collection,
	collectionOwner = {},
	isAutoCreateCollection = false,
	shareOptions = {}
) => ({
	type: OPEN_COLLECTION_SHARE_MODAL,
	collection,
	collectionOwner,
	isAutoCreateCollection,
	shareOptions,
});

export const closeCollectionShareModal = () => ({
	type: CLOSE_COLLECTION_SHARE_MODAL,
});
