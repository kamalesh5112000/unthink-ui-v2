import { takeLatest, call, put, select } from "redux-saga/effects";
import { notification } from "antd";
import Router from "next/router";

import { createWishlistSuccess, createWishlistFailure } from "./actions";
import {
	collectionAPIs,
	collectionPageAPIs,
} from "../../../../helper/serverAPIs";
import { getTTid } from "../../../../helper/getTrackerInfo";
import {
	COLLECTION_GENERATED_BY_BLOG_BASED,
	COLLECTION_GENERATED_BY_DESC_BASED,
	COLLECTION_GENERATED_BY_IMAGE_BASED,
	COLLECTION_TYPE_AUTO_PLIST,
	FETCH_COLLECTIONS_PRODUCT_LIMIT,
	PUBLISHED,
	WISHLIST_TITLE,
} from "../../../../constants/codes";
import { CREATE_WISHLIST } from "./constants";
import { addToWishlist } from "../../addToWishlist/redux/actions";
import { getUserCollections } from "../../../Auth/redux/actions";
import { updateWishlist } from "../../updateWishlist/redux/actions";
import { openCollectionShareModal } from "../../../collectionShareModal/redux/actions";
import {
	getAuthUserInfluencerCode,
	getIsGuestUser,
} from "../../../Auth/redux/selector";
import appTracker from "../../../../helper/webTracker/appTracker";
import { closeWishlistModal } from "../../../wishlist/redux/actions";
import { current_store_name } from "../../../../constants/config";
import { isEmpty } from "../../../../helper/utils";
 
function* createWishlistSaga(action) {
	try {
		const {
			_id,
			display_url,
			faqs,
			collection_name,
			description,
			cover_image,
			tags,
			tag_map,
			status,
			type,
			generated_by,
			parent_collection_id,
			blog_url,
			image_url,
			video_url,
			user_id,
			products,
			product_lists,
			campaign_code,
			referrerInfluencerCode,
			attributesData = {}, // to send any extra value or flag directly from where we are using it
			long_blog,
			fetch_products,
			custom_prompt,
			// desc_template,
			// tag_template,
			// image_template,
			short_desc,
			keyword_tag_map,
			uploaded_source,
			tagged_show_filters,
			isShareCollectionEnable,
			cc_text,
			cc_image,
			image_text,
			more_instruction,
			cc_blog,
			collection_theme,
			faq_enabled,
			faq_count,
			shareAutoLoginUser,
		} = action.payload;

		const payload = {
			user_id: user_id || getTTid(),
			collection_id: _id,
			collection_name,
			description,
			description_old: description,
			cover_image,
			more_instruction,
			tags,
			tag_map,
			status,
			type,
			generated_by,
			parent_collection_id,
			blog_url,
			image_url,
			video_url,
			fetch_products,
			keyword_tag_map,
			uploaded_source,
			collection_theme,
			display_url,
			faqs,
			faq_enabled,
			faq_count,
			...attributesData,
		};
		payload.tags = payload.tags || tags || [];
		payload.tag_map = payload.tag_map || tag_map || {};
		payload.keyword_tag_map = !isEmpty(payload.keyword_tag_map)
			? payload.keyword_tag_map
			: keyword_tag_map || {};
		const authUser = yield select((state) => state.auth.user.data);
		const isGuestUser = yield select(getIsGuestUser);
		if (isGuestUser) {
			payload.user_type = "guest";
		}

		if (
			action.payload.fetchAttributesForAutoPlist &&
			type === COLLECTION_TYPE_AUTO_PLIST
		) {
			// fetch attributes based on the description and the blog entered and send the same in the create collection API
			const getAttributesPayload = {
				tags,
				custom_prompt,
				// desc_template,
				short_desc,
				// tag_template,
				cc_text,
				cc_blog,
				faq_enabled,
				faq_count,
				faqs,
				userMetadata: {
					brand: authUser?.filters?.[current_store_name]?.strict?.brand || [],
				},
			};

			let attrResponse;

			if (generated_by === COLLECTION_GENERATED_BY_BLOG_BASED) {
				// fetching the tags based on the blog
				getAttributesPayload.blog_url = blog_url;
			} else if (generated_by === COLLECTION_GENERATED_BY_DESC_BASED) {
				// fetching the tags based on the description
				getAttributesPayload.description = description;
			}

			if (long_blog) {
				getAttributesPayload.long_blog = true;
				getAttributesPayload.collection_name = collection_name;
			}
			if (generated_by === COLLECTION_GENERATED_BY_DESC_BASED) {
				attrResponse = yield call(
					collectionPageAPIs.getDescAndTagsAPICall,
					getAttributesPayload
				);
			} else if (generated_by === COLLECTION_GENERATED_BY_IMAGE_BASED) {
				const getImageToDescriptionPayload = {
					image_url,
					// image_template,
					cc_image,
					image_text,
					img_cc_flow: true,
					userMetadata: {
						brand: authUser?.filters?.[current_store_name]?.strict?.brand || [],
					},
				};

				attrResponse = yield call(
					collectionPageAPIs.getImageToDescriptionAPICall,
					getImageToDescriptionPayload
				);
 
				

				// collection name for image collection getting from imageToDesc API response (backend)
				// user doesn't need to add manually
				payload.collection_name = attrResponse.data.data?.title;
			} else {
				attrResponse = yield call(
					collectionPageAPIs.getAttributesAPICall,
					getAttributesPayload
				);
			}

			if (attrResponse.data && attrResponse.data.status_code === 200) {
				const filter_settings = yield select(
					(state) => state.store.data.filter_settings
				);

				if (attrResponse.data.data.tags) {
					payload.tags = attrResponse.data.data.tags;
				}


				if (attrResponse.data.data.faqs) {
					payload.faqs = attrResponse.data.data.faqs;
				}

				if (attrResponse.data.data.category_tags) {
					payload.category_tags = attrResponse.data.data.category_tags;
				}

				if (
					attrResponse.data.data.description ||
					attrResponse.data.data.summary
				) {
					payload.description_old =
						getAttributesPayload.short_desc || undefined;
					payload.description =
						attrResponse.data.data.description ||
						attrResponse.data.data.summary;
				}

				if (attrResponse.data.data.show_filters) {
					payload.show_filters = attrResponse.data.data.show_filters;
				}

				if (attrResponse.data.data.AI_filters) {
					payload.AI_filters = attrResponse.data.data.AI_filters;
				}

				if (attrResponse.data.data.tag_map) {
					payload.tag_map = attrResponse.data.data.tag_map;
				}
				if (attrResponse.data.data.keyword_tag_map) {
					const keyword_tag_map = attrResponse.data.data.keyword_tag_map;

					// set brands from authUser.filters in keyword_tag_map which is available in available_filters
					const brandsToShow = authUser?.filters?.[
						current_store_name
					]?.strict?.brand?.filter((item) =>
						filter_settings?.available_filters?.brand?.includes(item)
					);

					if (authUser.filters?.[current_store_name]?.strict?.brand) {
						for (const key in keyword_tag_map) {
							if (!keyword_tag_map[key].brand) {
								keyword_tag_map[key].brand = brandsToShow.length
									? brandsToShow
									: undefined;
							}
						}
					}

					payload.keyword_tag_map = keyword_tag_map;
				}
			} else {
				yield put(createWishlistFailure(attrResponse.data));
				notification["error"]({
					message: attrResponse.data?.status_desc || "Unable to create",
				});
				return;
			}
		}

		let res;

		if (product_lists?.length) {
			// for share products and auto create collection
			const createCollectionWithProductsPayload = {
				...payload,
				product_lists,
				tagged_show_filters,
			};
			res = yield call(
				collectionAPIs.createCollectionWithProductsAPICall,
				createCollectionWithProductsPayload
			);
		} else {
			res = yield call(collectionAPIs.createCollectionAPICall, payload);
		}
		const { data: resData } = res;

		if (resData.status_code === 200) {
			// START
			// Tracking API
			const authUserInfluencerCode = yield select(getAuthUserInfluencerCode);
			appTracker.onCreateNewWishlist({
				collectionId: resData.data._id,
				iCode: authUserInfluencerCode,
				campCode: campaign_code,
				referrerICode: referrerInfluencerCode,
			});
			// END

			// calling new createCollectionWithProducts API for add to collection, getting response with added products so no need to call add to collection API

			// if (
			// 	(products?.length || product_lists?.length) &&
			// 	resData.data?._id &&
			// 	!isShareCollectionEnable &&
			// 	!isSaveProductLists
			// ) {
			// 	// call add to collection saga form here to add product just after creating the collection
			// 	const addToWishlistPayload = {
			// 		products,
			// 		product_lists,
			// 		_id: resData.data._id,
			// 		fetchUserCollections: true, // fetch collections after success add to collection
			// 		closeModalOnSuccess: action.payload.closeModalOnSuccess,
			// 	};

			// 	yield put(addToWishlist(addToWishlistPayload));

			// 	if (action.payload.addToCollectionEventForTracking) {
			// 		appTracker.onAddItemToWishlist(
			// 			action.payload.addToCollectionEventForTracking
			// 		);
			// 	}
			// }

			yield put(createWishlistSuccess(resData));

			// redirect to edit collection page after successfully create new collection
			if (action.payload?.redirectToEditCollectionPage) {				
				Router.push({
    pathname: `/collection/${resData.data._id}/review`,
    query: { isNewCollection: true },
  });
			}
			// open collection share modal and publish created collection

			if (isShareCollectionEnable) {
				// not need to call update collection API , in create collection API response we getting status=published
				// const payload = {
				// 	_id: resData.data._id,
				// 	status: PUBLISHED,
				// 	updateStatusInUserCollections: true, // set current auth user's collection status in redux state // not fetching collection details from API
				// 	checkForNFTReward: true, // flag to check for NFT, if user has published the first collection
				// };

				// yield put(updateWishlist(payload));
				yield put(
					openCollectionShareModal(resData.data, authUser, true, {
						autoLoginUser: shareAutoLoginUser,
					})
				);
			}

			// if (action.payload.closeModalOnSuccess) yield put(closeWishlistModal());

			if (action.payload.fetchUserCollections)
				yield put(
					getUserCollections({
						product_limits: FETCH_COLLECTIONS_PRODUCT_LIMIT,
						summary: true,
					})
				); // fetch current auth user's collection from API

			notification["success"]({
				message: `${WISHLIST_TITLE} Created Successfully!`,
			});

			return;
		}

		throw res;
	} catch (err) {
		const errData = err?.response?.data || err?.data;
		yield put(createWishlistFailure(errData));
		notification["error"]({
			message: errData?.status_desc || err?.message || "Unable to create",
		});
	}
}

function* createWishlistWatcher() {
	yield takeLatest(CREATE_WISHLIST, createWishlistSaga);
}

export { createWishlistWatcher };
