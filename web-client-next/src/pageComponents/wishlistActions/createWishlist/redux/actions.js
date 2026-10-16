import {
	CREATE_WISHLIST,
	CREATE_WISHLIST_SUCCESS,
	CREATE_WISHLIST_FAILURE,
	CREATE_WISHLIST_RESET,
} from "./constants";

export const createWishlist = (payload) => {
	//  console.log("createWishlist action payload", payload);

    return {
        type: CREATE_WISHLIST,
        payload,
    };
}

export const createWishlistSuccess = (payload) => ({
	type: CREATE_WISHLIST_SUCCESS,
	payload,
});

export const createWishlistFailure = (payload) => ({
	type: CREATE_WISHLIST_FAILURE,
	payload,
});

export const createWishlistReset = () => ({
	type: CREATE_WISHLIST_RESET,
});
