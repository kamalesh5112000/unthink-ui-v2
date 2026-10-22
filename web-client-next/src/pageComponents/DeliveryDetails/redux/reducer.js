import {
	ADD_TO_CART,
	ADD_TO_CART_SUCCESS,
	ADD_TO_CART_FAILURE,
	FETCH_CART,
	FETCH_CART_SUCCESS,
	FETCH_CART_FAILURE,
	FETCH_CART_RESET,
	REMOVE_FROM_CART,
	REMOVE_FROM_CART_SUCCESS,
	REMOVE_FROM_CART_FAILURE,
	CREATE_LOYALTY_BADGE,
	CREATE_LOYALTY_BADGE_FAILURE,
	CREATE_LOYALTY_BADGE_SUCCESS,
	FETCH_EARNING_POINTS,
	FETCH_EARNING_POINTS_FAILURE,
	FETCH_EARNING_POINTS_SUCCESS,
	CHECKOUT_UPDATE_POINTS,
	CHECKOUT_UPDATE_POINTS_FAILURE,
	CHECKOUT_UPDATE_POINTS_SUCCESS,
	CHECK_SESSION_HCS20_POINTS_FAILURE,
	CHECK_SESSION_HCS20_POINTS_SUCCESS,
	CLAIM_STORE_POINTS_FAILURE,
	CLAIM_STORE_POINTS_SUCCESS,
	REDEEM_SESSION_HCS20_POINTS,
	REDEEM_SESSION_HCS20_POINTS_FAILURE,
	REDEEM_SESSION_HCS20_POINTS_SUCCESS,
	SEND_SESSION_HCS20_POINTS_FAILURE,
	SEND_SESSION_HCS20_POINTS_SUCCESS,
} from "./constant";

const initialState = {
	loading: false,
	collection: null,
	imageLoyaltyBadge: null,
	imageLoyaltyBadgeLoading: false,
	imageLoyaltyBadgeError: null,
	earningPoints: null,
	earningPointsLoading: false,
	earningPointsError: null,
	checkoutUpdatedPoints: null,
	checkoutUpdatePointsLoading: false,
	checkoutUpdatePointsError: null,
	sessionHCS20PointsPayload: null,
	sessionHCS20PointsResponse: null,
	sessionHCS20PointsError: null,
	sessionHCS20BalancePayload: null,
	sessionHCS20BalanceResponse: null,
	sessionHCS20BalanceError: null,
	redeemSessionHCS20PointsLoading: false,
	redeemSessionHCS20PointsPayload: null,
	redeemSessionHCS20PointsResponse: null,
	redeemSessionHCS20PointsError: null,
	claimStorePointsPayload: null,
	claimStorePointsResponse: null,
	claimStorePointsError: null,
	error: null,
};

const userAddressInitialState = {
	loading: false,
	address: null,
	error: null,
};

export const cartReducer = (state = initialState, action) => {
	switch (action.type) {
		case ADD_TO_CART:
		case FETCH_CART:
			return {
				...state,
				loading: true,
				error: null,
			};
		case ADD_TO_CART_SUCCESS:
		case FETCH_CART_SUCCESS:
			return {
				...state,
				loading: false,
				collection: action.payload,
			};

		case ADD_TO_CART_FAILURE:
		case FETCH_CART_FAILURE:
			return {
				...state,
				loading: false,
				error: action.payload,
			};
		case FETCH_CART_RESET:
			return {
				...state,
				loading: false,
				collection: null,
				error: null,
			};
		case REMOVE_FROM_CART:
			return {
				...state,
				loading: true,
				error: null,
			};

		case REMOVE_FROM_CART_SUCCESS:
			return {
				...state,
				loading: false,
				collection: action.payload,
			};

		case REMOVE_FROM_CART_FAILURE:
			return {
				...state,
				loading: false,
				error: action.payload,
			};

		case CREATE_LOYALTY_BADGE:
			return {
				...state,
				imageLoyaltyBadgeLoading: true,
				imageLoyaltyBadgeError: null,
			};

		case CREATE_LOYALTY_BADGE_SUCCESS:
			return {
				...state,
				imageLoyaltyBadgeLoading: false,
				imageLoyaltyBadge: action.payload,
			};

		case CREATE_LOYALTY_BADGE_FAILURE:
			return {
				...state,
				imageLoyaltyBadgeLoading: false,
				imageLoyaltyBadgeError: action.payload,
			};

		case FETCH_EARNING_POINTS:
			return {
				...state,
				earningPoints: null,
				earningPointsLoading: true,
				earningPointsError: null,
			};

		case FETCH_EARNING_POINTS_SUCCESS:
			return {
				...state,
				earningPointsLoading: false,
				earningPoints: action.payload,
			};

		case FETCH_EARNING_POINTS_FAILURE:
			return {
				...state,
				earningPointsLoading: false,
				earningPointsError: action.payload,
			};

		case CHECKOUT_UPDATE_POINTS:
			return {
				...state,
				checkoutUpdatedPoints: null,
				checkoutUpdatePointsLoading: true,
				checkoutUpdatePointsError: null,
				sessionHCS20PointsError: null,
				sessionHCS20BalanceError: null,
			};

		case CHECKOUT_UPDATE_POINTS_SUCCESS:
			return {
				...state,
				checkoutUpdatePointsLoading: false,
				checkoutUpdatedPoints: action.payload,
			};

		case CHECKOUT_UPDATE_POINTS_FAILURE:
			return {
				...state,
				checkoutUpdatePointsLoading: false,
				checkoutUpdatePointsError: action.payload,
			};

		case SEND_SESSION_HCS20_POINTS_SUCCESS:
			return {
				...state,
				sessionHCS20PointsPayload: action.payload?.requestPayload,
				sessionHCS20PointsResponse: action.payload?.response,
				sessionHCS20PointsError: null,
			};

		case SEND_SESSION_HCS20_POINTS_FAILURE:
			return {
				...state,
				sessionHCS20PointsPayload: action.payload?.requestPayload,
				sessionHCS20PointsError: action.payload?.error,
			};

		case CHECK_SESSION_HCS20_POINTS_SUCCESS:
			return {
				...state,
				sessionHCS20BalancePayload: action.payload?.requestPayload,
				sessionHCS20BalanceResponse: action.payload?.response,
				sessionHCS20BalanceError: null,
			};

		case CHECK_SESSION_HCS20_POINTS_FAILURE:
			return {
				...state,
				sessionHCS20BalancePayload: action.payload?.requestPayload,
				sessionHCS20BalanceError: action.payload?.error,
			};

		case REDEEM_SESSION_HCS20_POINTS:
			return {
				...state,
				redeemSessionHCS20PointsLoading: true,
				redeemSessionHCS20PointsPayload: action.payload?.redeemPayload,
				redeemSessionHCS20PointsError: null,
				claimStorePointsError: null,
			};

		case REDEEM_SESSION_HCS20_POINTS_SUCCESS:
			return {
				...state,
				redeemSessionHCS20PointsPayload: action.payload?.requestPayload,
				redeemSessionHCS20PointsResponse: action.payload?.response,
				redeemSessionHCS20PointsError: null,
			};

		case REDEEM_SESSION_HCS20_POINTS_FAILURE:
			return {
				...state,
				redeemSessionHCS20PointsLoading: false,
				redeemSessionHCS20PointsPayload: action.payload?.requestPayload,
				redeemSessionHCS20PointsError: action.payload?.error,
			};

		case CLAIM_STORE_POINTS_SUCCESS:
			return {
				...state,
				redeemSessionHCS20PointsLoading: false,
				claimStorePointsPayload: action.payload?.requestPayload,
				claimStorePointsResponse: action.payload?.response,
				claimStorePointsError: null,
			};

		case CLAIM_STORE_POINTS_FAILURE:
			return {
				...state,
				redeemSessionHCS20PointsLoading: false,
				claimStorePointsPayload: action.payload?.requestPayload,
				claimStorePointsError: action.payload?.error,
			};

		default:
			return state;
	}
};
