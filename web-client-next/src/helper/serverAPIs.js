import { apiInstance, postApiCall } from "./apiCall";
import {
  // access_key,
  auraYfretUserCollBaseUrl,
  is_store_instance,
  webbotNFTServiceBaseUrl,
  current_store_name,
  adminUserId,
  event_app_api_base_url,
  // realtimeAIBaseUrl,
} from "../constants/config";
import { getSid, getTTid, isDebugCookie } from "./getTrackerInfo";
import {
  CUSTOM_PRODUCTS_FETCH_IPP,
  DEFAULT_INFLUENCER_CODE,
  PUBLISHED,
  // collectionPlistIPP,
  sharedPageRecommendationsIpp,
} from "../constants/codes";

// const auraYfretBaseUrl = "https://aura.yfret.com";

// auth API urls
const signupUrl = "/users/sign_up/";
const createAccountUrl = "/users/store/create/";
const guestRegisterUrl = "/users/register/guest_user/";
const signInUrl = "/users/sign_in/";
const verifyInfluencerCodeUrl = "/influencer/verify/";
const influencerApplyUrl = "/influencer/application/";
const getStartedUrl = "/users/get_started/";
const getUserInfoUrl = "/users/get_user_info/";
const resetPasswordRequestUrl = "/users/reset_request/";
const signInWithLinkRequestUrl = "/users/signin_with_link";
const resendVerificationMailUrl = "/users/resent_verification/";
const resetPasswordUrl = "/users/reset_password/";
const verifyUsernameUrl = "/users/validate_user_name/";
const getAllInfluencerDetailsUrl = "/influencers/get_influencer_details/";
const verifyTokenUrl = "/users/verify_token/";
const getStoreDetailsUrl = "/users/store/get_details/";
const updateStoreDetailsUrl = "/users/store/update/";

// chat API urls
const autoCompleteURL = "/aura/personalized_suggest/";

// collection API urls
const fetchCollectionsURL = "/user/collections/fetch_collections/";
const fetchCreatorCollectionsURL =
  "/user/collections/fetch_creators_collections/";
// const fetchCollectionsURL = "/wishlist/view_collection/"; // ?collection_id=3131504933
// const fetchCollectionProductsURL = "/fetch_details/fetch_by_mfr/";
const createCollectionURL = "/user/collections/create_collection/";
const updateCollectionURL = "/user/collections/update_collection/";
const deleteCollectionURL = "/user/collections/delete_collection/";
const addToCollectionURL = "/user/collections/add_products/";
const removeFromCollectionURL = "/user/collections/remove_products/";
const reorderCollectionURL = "/user/collections/reorder_collections/";
const verifyCollectionPathURL = "/user/collections/validate/";
const applyCollectionProductsFilterURL = "/user/collections/apply_filter/";
const clearCollectionProductsFilterURL = "/user/collections/clear_filter/";
export const collectionProductsExportCsvURL =
  "/user/collections/export_product_csv/";
export const collectionQRCodeGeneratorURL = "/settings/build_qrcode/";
const createCollectionWithProductsURL =
  "/user/collections/search_based_collections/";
const saveProductListsURL = "/user/collections/save_productlists/";
const improveContentURL = "/user/collections/improve_content/";
const addProductToWishlistCollectionURL =
  "/user/collections/handpicked_product_list/";

//profile API urls
const uploadImgUrl = "/cs/img/";
const uploadVideoUrl = "/cs/video/";
const uploadSVGUrl = "/cs/json/";
const fetchBrandsUrl = "/brand_handler/get_brand/";
const updateFeedLinkUrl = "/brand_handler/update_feed_link/";
const updateCatalogFeedUrl = "/catalog/update/catalog_feed_details/";
const saveUserInfoUrl = "/users/save_user_info/";
const starUserUrl = "/users/update/starred_user";
const fetchInfluencersUrl = "/users/get_venly_user_details/";
export const fetchLeaderboardUrl = "/users/generate/leaderboard/";

//categories API url
const fetchCategoriesUrl = "/showcase/show_category/";
const fetchCategoriesProductsUrl = "/showcase/category_products";

//reccomendations API url
const fetchRecommendationsUrl = "/aura/personalized_recommendations/";


//token API urls
const createAndTransferNFTUrl = "/transferNFT";
const validateUserNFTUrl = "/user/rewards/validate_nft/";
const verifyUserRewardEligibilityUrl = "/user/rewards/verify_eligibility";

//blog collection page API url
// const deleteBlogCollection = "/users/delete_blog_collection/"; // REMOVE

// const editBlogCollection = "/users/edit_plist_collection/";
// const removeProductFromBlogCollection = "/productlist/product/";
// const savePlistFilter = "/users/update_collections/";

// aura new APIs
const getAttributesUrl = "/user/collections/get_attributes/";
const getTagsWithAIUrl = "/user/collections/get_tags/";
const fetchProductsUrl = "/user/collections/fetch_products/";
const updateTagsUrl = "/user/collections/update_tags/";
const getDescAndTagsUrl = "/user/collections/get_descandtags/";
const addHandpickedProductsUrl = "/user/collections/handpicked_product_list/";

const getAmazonProductsUrl = "/custom_catalog/getamznproducts/";
const getImageToDescriptionUrl = "/cs/imagetodescription/";

// custom_products APIs url
const fetchCustomProductsUrl = "/custom_catalog/showcase/product_details/";
const addCustomProductsUrl = "/custom_catalog/product_details/";
const removeCustomProductsUrl = "/custom_catalog/product_details/";
const updateCustomProductsUrl = "/custom_catalog/product_details/";
export const customProductsDownloadCsvURL = "/custom_catalog/export/Products/";
const getMPCollections = "/attribute_pool/getMPCollections/";
const saveMPCollections = "/attribute_pool/saveMPCollections/";

// collection detect key
const fetchCollectionDetectKeyUrl = "/attribute_pool/detectKey/";
const fetchPoolKey = "/attribute_pool/getStoredAttributes/";
const updatePoolKeyUrl = "/attribute_pool/updateStoredAttributes/";
const addModifiedDataKeyUrl = "/attribute_pool/addModifiedData/";
const DeleteModifiedDataKeyUrl = "/attribute_pool/deleteMPCollectionData/";
const GetModifiedDataKeyUrl = "/attribute_pool/getMPCollectionData/";

// Vto Api
const VtoTryOn = "https://auraprod.unthink.ai/cs/image_tryon/";

const earningPoints = '/user/earnings/by_store/' 
const createBadge = '/user/earnings/generate_loyalty_badge/'
const checkoutUpdatePoints = "/user/earnings/checkout_update_points/";
const claimStorePoints = "/user/earnings/claim_store/";
const sendSessionHCS20Points = `/send-sessionhcs20-points`;
const checkSessionHCS20Points =   `/check-sessionhcs20-points`;
const redeemSessionHCS20Points =   `/redeem-sessionhcs20-points`;
const smartContractTransaction = "/user/earnings/create_or_update/";
//KIOSK
const socialMedia =
  `/user/collections/fetch_collections/?user_id=${adminUserId}&product_limits=12&view=public&store=${current_store_name}&starred=true&generated_by=video_based&summary=true&cache=true`;
const trending =
  `/user/collections/fetch_collections/?user_id=${adminUserId}&product_limits=12&view=public&collection_type=trending&store=${current_store_name}&starred=true&summary=true&cache=true`;
const lookBook =
  `/user/collections/fetch_collections/?user_id=${adminUserId}&product_limits=12&view=public&store=${current_store_name}&starred=true&generated_by=lookbook_based&summary=true&cache=true`;

const updateHandpickedProductsUrl =
  "/user/collections/handpicked_product_list/";
const removeCartUrl ='/user/collections/remove_products/'
const signupAPICall = ({ email, user_name, iCode, password, ...rest }) => {
  const url = `${auraYfretUserCollBaseUrl}${signupUrl}`;
  const payload = {
    emailId: email,
    user_name,
    influencer_code: iCode || DEFAULT_INFLUENCER_CODE,
    password: password,
    featured: isDebugCookie() ? false : true,
    ...rest,
    store: current_store_name,
  };

  return apiInstance({
    url,
    method: "post",
    data: payload,
  });
};

const createAccountAPICall = ({
  email,
  user_name,
  is_shop,
  password,
  insta_user_name,
}) => {
  const url = `${auraYfretUserCollBaseUrl}${createAccountUrl}`;
  const payload = {
    emailId: email,
    store_name: user_name,
    password: password,
    is_shop: is_shop,
    send_mailer: false,
    user_name: insta_user_name,
  };

  return apiInstance({
    url,
    method: "post",
    data: payload,
  });
};

const GuestSignupAPICall = ({ email, user_name }) => {
  const url = `${auraYfretUserCollBaseUrl}${signupUrl}`;
  const payload = {
    emailId: email,
    user_name,
    trial_user: true,
    featured: isDebugCookie() ? false : true,
  };

  return apiInstance({
    url,
    method: "post",
    data: payload,
  });
};

const GuestRegisterAPICall = ({ emailId, user_id, store ,phone}) => {
  const url = `${auraYfretUserCollBaseUrl}${guestRegisterUrl}`;

  const guestData = {
    emailId,
    user_id,
    store,
    phone
  };

  return apiInstance({
    url,
    method: "post",
    data: guestData,
  });
};

const GetStartedSendMailAPICall = ({
  emailId,
  cc,
  user_type = "creator",
  website_url,
}) => {
  const url = `${auraYfretUserCollBaseUrl}${getStartedUrl}`;
  const payload = {
    emailId,
    cc, // ['email1', 'email2']
    user_type,
    website_url, // required if user_type = brand
  };

  return apiInstance({
    url,
    method: "post",
    data: payload,
  });
};

const signInAPICall = ({ email, phone, password }) => {
  const url = `${auraYfretUserCollBaseUrl}${signInUrl}`;
  const payload = {
    password: password,
    store: current_store_name,
  };

  if (email?.trim()) {
    payload.user_name = email.trim();
  }

  if (phone?.trim()) {
    payload.phone = phone.trim();
  }

  return apiInstance({
    url,
    method: "post",
    data: payload,
  });
};

const signInWithVenlyAPICall = (venlyUserId) => {
  const url = `${auraYfretUserCollBaseUrl}${signInUrl}`;
  const payload = {
    venlyUserId,
  };

  return apiInstance({
    url,
    method: "post",
    data: payload,
  });
};

const verifyInfluencerCodeAPICall = ({ email, iCode }) => {
  const url = `${auraYfretUserCollBaseUrl}${verifyInfluencerCodeUrl}`;
  const params = {
    influencer_code: iCode,
    emailId: email,
  };

  return apiInstance({
    url,
    method: "get",
    params,
  });
};

const verifyUsernameAPICall = ({ user_name }) => {
  const url = `${auraYfretUserCollBaseUrl}${verifyUsernameUrl}`;
  const params = {
    user_name,
  };

  return apiInstance({
    url,
    method: "get",
    params,
  });
};

const getUserInfoAPICall = (payload = {}) => {
  const url = `${auraYfretUserCollBaseUrl}${getUserInfoUrl}`;
  const params = {};

  if (payload.user_id) {
    params.user_id = payload.user_id;
  }
   else if (payload.user_name) {
    params.user_name = payload.user_name;
    params.store = current_store_name;
  } 
  else if (payload.emailId) {
    params.emailId = payload.emailId;
  } else {
    params.user_id = getTTid();
  }

  // params.store = is_store_instance ? current_store_name : undefined;

  if (params.user_id || params.user_name || params.emailId) {
    return apiInstance({
      url,
      method: "get",
      params,
    });
  } else {
    return {};
  }
};

const resetPasswordRequestAPICall = ({ email }) => {
  const url = `${auraYfretUserCollBaseUrl}${resetPasswordRequestUrl}`;
  const params = {
    emailId: email,
  };

  return apiInstance({
    url,
    method: "get",
    params,
  });
};

const signInWithLinkRequestAPICall = ({ email, phone }) => {
  const url = `${auraYfretUserCollBaseUrl}${signInWithLinkRequestUrl}`;
  const params = {};

  if (email?.trim()) {
    params.emailId = email.trim();
  }

  if (phone?.trim()) {
    params.phone = phone.trim();
  }

  return apiInstance({
    url,
    method: "get",
    params,
  });
};

const resendVerificationMail = ({ email }) => {
  const url = `${auraYfretUserCollBaseUrl}${resendVerificationMailUrl}`;
  const params = { emailId: email };

  return apiInstance({
    url,
    method: "get",
    params,
  });
};

const resetPasswordAPICall = ({ token, password }) => {
  const url = `${auraYfretUserCollBaseUrl}${resetPasswordUrl}`;
  const payload = {
    token,
    password,
  };

  return apiInstance({
    url,
    method: "post",
    data: payload,
  });
};

const verifyTokenAPICall = (token) => {
  const url = `${auraYfretUserCollBaseUrl}${verifyTokenUrl}`;
  const params = {
    token,
    store: current_store_name,
  };

  return apiInstance({
    url,
    method: "get",
    params,
  });
};

const getStoreDetailsAPICall = () => {
  const url = `${auraYfretUserCollBaseUrl}${getStoreDetailsUrl}`;
  const params = {
    store_name: current_store_name,
  };

  return apiInstance({
    url,
    method: "get",
    params,
  });
};

const getCreatoreStoreDetailsAPICall = (payload) => {
  const url = `${auraYfretUserCollBaseUrl}${getStoreDetailsUrl}`;
  const params = {
    store_name: payload,
  };

  return apiInstance({
    url,
    method: "get",
    params,
  });
};

const updateStoreDetailsAPICall = (store_id, payload) => {
  const url = `${auraYfretUserCollBaseUrl}${updateStoreDetailsUrl}`;
  const data = {
    store_id,
    ...payload,
  };

  return apiInstance({
    url,
    method: "put",
    data,
  });
};

export const authAPIs = {
  signupAPICall,
  createAccountAPICall,
  GuestSignupAPICall,
  GuestRegisterAPICall,
  GetStartedSendMailAPICall,
  signInAPICall,
  verifyInfluencerCodeAPICall,
  getUserInfoAPICall,
  resetPasswordRequestAPICall,
  signInWithLinkRequestAPICall,
  resendVerificationMail,
  resetPasswordAPICall,
  verifyUsernameAPICall,
  verifyTokenAPICall,
  signInWithVenlyAPICall,
  getStoreDetailsAPICall,
  updateStoreDetailsAPICall,
  getCreatoreStoreDetailsAPICall,
};

const autoCompleteAPICall = ({ query, current_page = 0, ipp = 15 }) => {
  const url = `${auraYfretUserCollBaseUrl}${autoCompleteURL}`;

  const params = {
    query,
    tt_id: getTTid(),
    sid: getSid(),
    current_page,
    ipp,
  };

  return apiInstance({
    url,
    method: "get",
    params,
  });
};

export const chatAPIs = {
  autoCompleteAPICall,
};

const fetchCollectionsAPICall = (params = {}) => {
  const url = `${auraYfretUserCollBaseUrl}${fetchCollectionsURL}`;

  params.store = current_store_name;

  return apiInstance({
    url,
    method: "get",
    params,
  });
};

// creator flow collection
const fetchCreatorCollectionAPICall = (payload = {}) => {
  const url = `${auraYfretUserCollBaseUrl}${fetchCreatorCollectionsURL}`;

  const data = {
    store: current_store_name,
    status: PUBLISHED,
    ...payload,
  };

  return apiInstance({
    url,
    method: "post",
    data,
  });
};

// get MY PRODUCT Data
const fetchSortProductsAPICall = (params = {}) => {
  const url = `${auraYfretUserCollBaseUrl}${fetchCustomProductsUrl}`;

  if (params?.filters && typeof params.filters === "object") {
    params.filters = JSON.stringify(params.filters);
  }

  params.store = current_store_name;

  return apiInstance({
    url,
    method: "get",
    params,
  });
};

// const fetchCollectionProductsAPICall = ({ mfrcode_list }) => {
// 	// REMOVE
// 	const url = `${baseUrl}${fetchCollectionProductsURL}`;
// 	const params = {
// 		access_key,
// 		mfrcode_list: JSON.stringify(mfrcode_list),
// 	};

// 	return apiInstance({
// 		url,
// 		method: "get",
// 		params,
// 	});
// };

const createCollectionAPICall = (payload) => {
  const url = `${auraYfretUserCollBaseUrl}${createCollectionURL}`;
  const data = {
    ...payload,
    domain_store: current_store_name,
  };

  return apiInstance({
    url,
    method: "post",
    data,
  });
};

const updateCollectionAPICall = (payload) => {
  const url = `${auraYfretUserCollBaseUrl}${updateCollectionURL}`;
  const data = {
    ...payload,
    store: current_store_name,
  };

  return apiInstance({
    url,
    method: "put",
    data,
  });
};

const deleteCollectionAPICall = (params, data) => {
  const url = `${auraYfretUserCollBaseUrl}${deleteCollectionURL}`;

  return apiInstance({
    url,
    method: "delete",
    params,
    data,
  });
};

const addToCollectionAPICall = (payload) => {
  const url = `${auraYfretUserCollBaseUrl}${addToCollectionURL}`;
  const data = {
    ...payload,
    domain_store: current_store_name,
  };

  return apiInstance({
    url,
    method: "put",
    data,
  });
};

const removeFromCollectionAPICall = (payload) => {
  const url = `${auraYfretUserCollBaseUrl}${removeFromCollectionURL}`;

  return apiInstance({
    url,
    method: "delete",
    data: payload,
  });
};

const reorderCollectionAPICall = (payload) => {
  const url = `${auraYfretUserCollBaseUrl}${reorderCollectionURL}`;

  return apiInstance({
    url,
    method: "post",
    data: payload,
  });
};

const verifyCollectionPathAPICall = (path) => {
  const url = `${auraYfretUserCollBaseUrl}${verifyCollectionPathURL}`;

  const params = {
    path,
  };

  return apiInstance({
    url,
    method: "get",
    params,
  });
};

const applyCollectionProductsFilterAPICall = (payload) => {
  const url = `${auraYfretUserCollBaseUrl}${applyCollectionProductsFilterURL}`;

  return apiInstance({
    url,
    method: "post",
    data: payload,
  });
};

const clearCollectionProductsFilterAPICall = (collection_id) => {
  const url = `${auraYfretUserCollBaseUrl}${clearCollectionProductsFilterURL}`;

  const params = {
    collection_id,
  };

  return apiInstance({
    url,
    method: "get",
    params,
  });
};

const createCollectionWithProductsAPICall = (payload) => {
  const url = `${auraYfretUserCollBaseUrl}${createCollectionWithProductsURL}`;
  const data = {
    ...payload,
    domain_store: is_store_instance ? current_store_name : undefined,
  };

  return apiInstance({
    url,
    method: "post",
    data,
  });
};

const saveProductListsAPICall = (payload) => {
  const url = `${auraYfretUserCollBaseUrl}${saveProductListsURL}`;

  return apiInstance({
    url,
    method: "post",
    data: payload,
  });
};

const improveContentAPICall = (payload) => {
  const url = `${auraYfretUserCollBaseUrl}${improveContentURL}`;
  const data = {
    ...payload,
    tt_id: getTTid(),
    sid: getSid(),
    store: current_store_name,
  };

  return apiInstance({
    url,
    method: "post",
    data,
  });
};

const addProductToWishlistCollectionAPICall = (payload) => {
  const url = `${auraYfretUserCollBaseUrl}${addProductToWishlistCollectionURL}`;
  const data = {
    ...payload,
  };

  return apiInstance({
    url,
    method: "post",
    data,
  });
};

const collectionDetectKeyApi = (payload) => {
  const url = `${auraYfretUserCollBaseUrl}${fetchCollectionDetectKeyUrl}`;
  const data = {
    ...payload,
    tt_id: getTTid(),
    sid: getSid(),
    store: current_store_name,
  };

  return apiInstance({
    url,
    method: "post",
    data,
  });
};

const FetchPoolKeyApi = (payload) => {
  const url = `${auraYfretUserCollBaseUrl}${fetchPoolKey}`;
  const data = {
    ...payload,
    store: current_store_name,
  };

  return apiInstance({
    url,
    method: "post",
    data,
  });
};

const FetchAddModifiedDataKeyUrl = (payload) => {
  const url = `${auraYfretUserCollBaseUrl}${addModifiedDataKeyUrl}`;
  const data = {
    ...payload,
    store: current_store_name,
  };

  return apiInstance({
    url,
    method: "post",
    data,
  });
};
const FetchDeleteModifiedDataApi = (payload) => {
  const url = `${auraYfretUserCollBaseUrl}${DeleteModifiedDataKeyUrl}`;
  const data = {
    ...payload,
    store: current_store_name,
  };

  return apiInstance({
    url,
    method: "post",
    data,
  });
};

const FetchGetModifiedDataApi = (payload) => {
  const url = `${auraYfretUserCollBaseUrl}${GetModifiedDataKeyUrl}`;
  const data = {
    ...payload,
    store: current_store_name,
  };

  return apiInstance({
    url,
    method: "post",
    data,
  });
};

export const collectionAPIs = {
  fetchCollectionsAPICall,
  fetchCreatorCollectionAPICall,
  // fetchCollectionProductsAPICall,
  createCollectionAPICall,
  updateCollectionAPICall,
  deleteCollectionAPICall,
  addToCollectionAPICall,
  removeFromCollectionAPICall,
  reorderCollectionAPICall,
  verifyCollectionPathAPICall,
  applyCollectionProductsFilterAPICall,
  clearCollectionProductsFilterAPICall,
  createCollectionWithProductsAPICall,
  saveProductListsAPICall,
  improveContentAPICall,
  fetchSortProductsAPICall,
  collectionDetectKeyApi,
  FetchPoolKeyApi,
  FetchAddModifiedDataKeyUrl,
};

export const wishlistCollectionAPIs = {
  addProductToWishlistCollectionAPICall,
};

const uploadImage = ({
  file,
  type,
  convert_format = "webp",
  custom_size, // comma separated string like = 600X600,300X300
}) => {
  const url = `${auraYfretUserCollBaseUrl}${uploadImgUrl}`;
  const formData = new FormData();
  formData.append("file[]", file);
  // formData.append("access_key", access_key);
  // formData.append("meta_data", file.name); //sending file name
  type && formData.append("type", type); //sending file name
  formData.append("convert_format", convert_format);
  formData.append("custom_size", custom_size);

  return apiInstance({
    url,
    method: "post",
    data: formData,
  });
};

const uploadVideo = ({ file, store }) => {
  console.log("wstore", store);

  const url = `${auraYfretUserCollBaseUrl}${uploadVideoUrl}`;

  const formData = new FormData();

  formData.append("file[]", file);
  formData.append("store", store);
  // formData.append("meta_data", file.name); //sending file name

  return apiInstance({
    url,
    method: "post",
    data: formData,
  });
};
export const TryOnVto = (payload) => {
  console.log(payload);

  const url = VtoTryOn;
  return apiInstance({
    url,
    method: "post",
    data: payload,
  });
};

const uploadCSV_APICall = ({ file }) => {
  const url = `${auraYfretUserCollBaseUrl}${uploadSVGUrl}`;
  const formData = new FormData();

  formData.append("file[]", file);

  return apiInstance({
    url,
    method: "post",
    data: formData,
  });
};

const fetchBrandsAPICall = (catalog_feed_settings = {}) => {
  const url = `${auraYfretUserCollBaseUrl}${fetchBrandsUrl}`;

  const catalogFeedSettings = JSON.stringify(catalog_feed_settings);

  const params = {
    // access_key,
    // store: store || (is_store_instance ? current_store_name : undefined),
    filters: catalogFeedSettings,
  };

  return apiInstance({
    url,
    method: "get",
    params,
  });
};

const updateFeedLinkAPICall = ({
  brand,
  feed_url,
  store = is_store_instance ? current_store_name : undefined,
}) => {
  const url = `${auraYfretUserCollBaseUrl}${updateFeedLinkUrl}`;

  const data = {
    brand,
    feed_url,
    store,
  };

  return apiInstance({
    url,
    method: "post",
    data,
  });
};

const updateCatalogFeedAPICall = ({
  brand,
  feed_url,
  user_id,
  store = is_store_instance ? current_store_name : undefined,
  platform = is_store_instance ? [current_store_name] : undefined,
}) => {
  const url = `${auraYfretUserCollBaseUrl}${updateCatalogFeedUrl}`;

  const data = {
    brand,
    feed_url,
    store,
    user_id,
    platform,
  };

  return apiInstance({
    url,
    method: "post",
    data,
  });
};

const saveUserInfoAPICall = ({ profileData }) => {
  const url = `${auraYfretUserCollBaseUrl}${saveUserInfoUrl}`;
  const payload = {
    ...profileData,
  };

  return apiInstance({
    url,
    method: "post",
    data: payload,
  });
};

const starUserAPICall = ({ payload }) => {
  const url = `${auraYfretUserCollBaseUrl}${starUserUrl}`;

  //sample
  // const payload = {
  // 	"query":{
  // 	  "user_id":["168124389771179","1671719779026","167952416159468"]
  // 	},
  // 	"starred":false
  //   };

  return apiInstance({
    url,
    method: "post",
    data: payload,
  });
};

const fetchInfluencersAPICall = (params = {}) => {
  const url = `${auraYfretUserCollBaseUrl}${fetchInfluencersUrl}`;

  return apiInstance({
    url,
    method: "get",
    params,
  });
};

const fetchLeaderboardAPICall = (leaderboardParams) => {
  const url = `${auraYfretUserCollBaseUrl}${fetchLeaderboardUrl}`;
  const params = {
    store: current_store_name,
    ...leaderboardParams,
  };

  return apiInstance({
    url,
    method: "get",
    params,
  });
};

export const profileAPIs = {
  uploadImage,
  uploadVideo,
  uploadCSV_APICall,
  fetchBrandsAPICall,
  updateFeedLinkAPICall,
  updateCatalogFeedAPICall,
  saveUserInfoAPICall,
  starUserAPICall,
  fetchInfluencersAPICall,
  fetchLeaderboardAPICall,
};

const influencerApplyCall = ({
  first_name,
  last_name,
  emailId,
  company_name,
  social_links,
}) => {
  const url = `${auraYfretUserCollBaseUrl}${influencerApplyUrl}`;
  const payload = {
    first_name,
    last_name,
    emailId,
    company_name: company_name || "unthink",
    status: "applied",
    social_links,
  };

  return apiInstance({
    url,
    method: "post",
    data: payload,
  });
};

const fetchAllInfluencerDetailsAPICall = () => {
  const url = `${auraYfretUserCollBaseUrl}${getAllInfluencerDetailsUrl}`;
  const params = { featured: "true" };

  return apiInstance({
    url,
    method: "get",
    params,
  });
};

export const influencerAPIs = {
  influencerApplyCall,
  fetchAllInfluencerDetailsAPICall,
};

const fetchCategoriesAPICall = (params = {}) => {
  const url = `${auraYfretUserCollBaseUrl}${fetchCategoriesUrl}`;

  return apiInstance({
    url,
    method: "get",
    params,
  });
};

const fetchCategoriesProductsAPICall = (query = {}, query_text = "") => {
  const url = `${auraYfretUserCollBaseUrl}${fetchCategoriesProductsUrl}`;
  const params = { query };

  if (query_text) {
    params.query_text = query_text;
  }

  return apiInstance({
    url,
    method: "get",
    params,
  });
};

export const categoriesAPIs = {
  fetchCategoriesAPICall,
  fetchCategoriesProductsAPICall,
};

// const fetchCollectionProductListAPICall = ({
// 	// REMOVE
// 	plist_name,
// 	current_page,
// 	plistIpp,
// 	...rest
// }) => {
// 	const url = `${adminYfretBaseUrl}/productlist/${plist_name}/`;
// 	const params = {
// 		ipp: plistIpp || collectionPlistIPP,
// 		access_key,
// 		current_page,
// 		...rest,
// 	};

// 	return apiInstance({
// 		url,
// 		method: "get",
// 		params,
// 	});
// };

// const editBlogCollectionAPICall = (blogData) => {
// 	// REMOVE
// 	const url = `${baseUrl}${editBlogCollection}`;
// 	const payload = {
// 		access_key,
// 		user_id: getTTid(),
// 		...blogData,
// 	};

// 	return apiInstance({
// 		url,
// 		method: "post",
// 		data: payload,
// 	});
// };

// const removeProductFromBlogCollectionAPICall = (data) => {
// 	// REMOVE
// 	const url = `${baseUrl}${removeProductFromBlogCollection}`;
// 	const params = { ...data, access_key };

// 	return apiInstance({
// 		url,
// 		method: "delete",
// 		params,
// 	});
// };

// const savePlistFilterAPICall = (payload) => {
// 	// REMOVE
// 	const url = `${baseUrl}${savePlistFilter}`;
// 	const data = {
// 		access_key,
// 		user_id: getTTid(),
// 		...payload,
// 	};

// 	return apiInstance({
// 		url,
// 		method: "post",
// 		data,
// 	});
// };

const getAttributesAPICall = (payload) => {
  const url = `${auraYfretUserCollBaseUrl}${getAttributesUrl}`;
  const data = {
    ...payload,
    tt_id: getTTid(),
    sid: getSid(),
    store: is_store_instance ? current_store_name : undefined,
  };

  return apiInstance({
    url,
    method: "post",
    data,
  });
};

const getDescAndTagsAPICall = (payload) => {
  const url = `${auraYfretUserCollBaseUrl}${getDescAndTagsUrl}`;
  const data = {
    ...payload,
    tt_id: getTTid(),
    sid: getSid(),
    store: is_store_instance ? current_store_name : undefined,
  };

  return apiInstance({
    url,
    method: "post",
    data,
  });
};

const getImageToDescriptionAPICall = (payload) => {
  const url = `${auraYfretUserCollBaseUrl}${getImageToDescriptionUrl}`;
  const data = {
    ...payload,
    tt_id: getTTid(),
    sid: getSid(),
    store: is_store_instance ? current_store_name : undefined,
  };

  return apiInstance({
    url,
    method: "post",
    data,
  });
};

const addHandpickedProductsAPICall = (collection_id, product_lists) => {
  const url = `${auraYfretUserCollBaseUrl}${addHandpickedProductsUrl}`;
  const data = {
    collection_id,
    product_lists,
    store: is_store_instance ? current_store_name : undefined,
  };

  return apiInstance({
    url,
    method: "post",
    data,
  });
};

const updateHandpickedProductsAPICall = (collection_id, product_lists) => {
  const url = `${auraYfretUserCollBaseUrl}${updateHandpickedProductsUrl}`;
  const data = {
    collection_id,
    product_lists,
    store: is_store_instance ? current_store_name : undefined,
  };

  return apiInstance({
    url,
    method: "put",
    data,
  });
};

const createWishlistHandpickedAPICall = (payload) => {
  const url = `${auraYfretUserCollBaseUrl}${addHandpickedProductsUrl}`;
  return apiInstance({
    url,
    method: "post",
    data: payload,
  });
};

const getAmazonProductsAPICall = (payload) => {
  const url = `${auraYfretUserCollBaseUrl}${getAmazonProductsUrl}`;
  const data = { ...payload };

  return apiInstance({
    url,
    method: "post",
    data,
  });
};

const getTagsWithAiAPICall = (payload) => {
  const url = `${auraYfretUserCollBaseUrl}${getTagsWithAIUrl}`;
  const data = {
    ...payload,
    tt_id: getTTid(),
    sid: getSid(),
    store: is_store_instance ? current_store_name : undefined,
  };

  return apiInstance({
    url,
    method: "post",
    data,
  });
};

// API to fetch or delete products based on added and deleted tags
const updateTagsAPICall = (payload) => {
  const url = `${auraYfretUserCollBaseUrl}${updateTagsUrl}`;
  const data = { ...payload };

  return apiInstance({
    url,
    method: "post",
    data,
  });
};

const fetchProductsAPICall = (payload) => {
  const url = `${auraYfretUserCollBaseUrl}${fetchProductsUrl}`;
  const data = { ...payload };

  return apiInstance({
    url,
    method: "post",
    data,
  });
};

export const collectionPageAPIs = {
  // fetchCollectionProductListAPICall,
  // editBlogCollectionAPICall,
  // removeProductFromBlogCollectionAPICall,
  // savePlistFilterAPICall,
  getAttributesAPICall,
  getDescAndTagsAPICall,
  getTagsWithAiAPICall,
  updateTagsAPICall,
  fetchProductsAPICall,
  addHandpickedProductsAPICall,
  updateHandpickedProductsAPICall,
  createWishlistHandpickedAPICall,
  getAmazonProductsAPICall,
  getImageToDescriptionAPICall,
};

const fetchReccomendationsAPICall = () => {
  const url = `${auraYfretUserCollBaseUrl}${fetchRecommendationsUrl}`;
  const params = {
    tt_id: getTTid(),
    sid: getSid(),
    ipp: sharedPageRecommendationsIpp,
    current_page: 1,
  };

  return apiInstance({
    url,
    method: "get",
    params,
  });
};

export const recommendationsAPIs = {
  fetchReccomendationsAPICall,
};

const createAndTransferNFT = (payload) => {
  const url = `${webbotNFTServiceBaseUrl}${createAndTransferNFTUrl}`;
  const data = { ...payload };

  return apiInstance({
    url,
    method: "post",
    data,
  });
};

const validateUserNFTAPICall = (payload) => {
  const url = `${auraYfretUserCollBaseUrl}${validateUserNFTUrl}`;
  const data = { ...payload };

  return apiInstance({
    url,
    method: "post",
    data,
  });
};

const verifyUserRewardEligibilityAPICall = ({
  user_id,
  type, //level 1
  store_name,
}) => {
  const url = `${auraYfretUserCollBaseUrl}${verifyUserRewardEligibilityUrl}`;
  const params = {
    user_id,
    type,
    store_name,
  };

  return apiInstance({
    url,
    method: "get",
    params,
  });
};

export const tokenAPIs = {
  createAndTransferNFT,
  validateUserNFTAPICall,
  verifyUserRewardEligibilityAPICall,
};

const fetchCustomProductsAPICall = (filters = {}) => {
  const url = `${auraYfretUserCollBaseUrl}${fetchCustomProductsUrl}`;
  const params = {
    store: is_store_instance ? current_store_name : undefined,
    // ipp: CUSTOM_PRODUCTS_FETCH_IPP,
    // skip: 0,
    filters:
      filters && typeof filters === "object"
        ? JSON.stringify(filters)
        : filters,
  };
  return apiInstance({
    url,
    method: "get",
    params,
  });
};

const fetchProductDetailsAPICall = (mfr_code, image, cache = false) => {
  // console.log('fdsfdsffds',image);
  
  const url = `${auraYfretUserCollBaseUrl}${fetchCustomProductsUrl}`;
  const params = {
    mfr_code,
    image: decodeURIComponent(image),
  };

  if (cache) {
    params.cache = true;
  }

  return apiInstance({
    url,
    method: "get",
    params,
  });
};

const addCustomProductsAPICall = (product_lists, user_id) => {
  const url = `${auraYfretUserCollBaseUrl}${addCustomProductsUrl}`;
  const data = {
    product_lists,
    user_id,
    store: is_store_instance ? current_store_name : undefined,
  };

  return apiInstance({
    url,
    method: "post",
    data,
  });
};

const removeCustomProductsAPICall = (payload) => {
  const url = `${auraYfretUserCollBaseUrl}${removeCustomProductsUrl}`;

  return apiInstance({
    url,
    method: "delete",
    data: payload,
  });
};

const updateCustomProductsAPICall = (product_lists, user_id) => {
  const url = `${auraYfretUserCollBaseUrl}${updateCustomProductsUrl}`;

  const data = {
    product_lists,
    user_id,
    store: is_store_instance ? current_store_name : undefined,
  };

  return apiInstance({
    url,
    method: "put",
    data,
  });
};

const getMPCollectionsAPICall = (store_type) => {
  const url = `${auraYfretUserCollBaseUrl}${getMPCollections}`;

  const normalizedStoreType = Array.isArray(store_type)
    ? store_type
    : store_type
      ? [store_type]
      : [];

  const data = {
    store_type: normalizedStoreType,
    store: current_store_name || undefined,
  };

  return apiInstance({
    url,
    method: "post",
    data,
  });
};

const saveMPCollectionsAPICall = (payload) => {
  const url = `${auraYfretUserCollBaseUrl}${saveMPCollections}`;

  const data = {
    ...payload,
    store: current_store_name,
  };

  return apiInstance({
    url,
    method: "post",
    data,
  });
};

const updatePoolAPICall = (payload) => {
  const url = `${auraYfretUserCollBaseUrl}${updatePoolKeyUrl}`;

  const data = {
    ...payload,
    store: current_store_name,
  };

  return apiInstance({
    url,
    method: "post",
    data,
  });
};

export const customProductsAPIs = {
  fetchCustomProductsAPICall,
  addCustomProductsAPICall,
  removeCustomProductsAPICall,
  updateCustomProductsAPICall,
  fetchProductDetailsAPICall,
  getMPCollectionsAPICall,
  saveMPCollectionsAPICall,
  FetchDeleteModifiedDataApi,
  FetchGetModifiedDataApi,
  updatePoolAPICall,
};

// const vectorizationProcessUrl = "vectorizationProcessUrl";

// const vectorizationProcessAPICall = ({ mapper_data, url }) => {
// 	const APIUrl = `${realtimeAIBaseUrl}${vectorizationProcessUrl}`;
// 	const data = {
// 		mapper_data,
// 		url,
// 	};

// 	return apiInstance({
// 		url: APIUrl,
// 		method: "post",
// 		data,
// 	});
// };

// export const realtimeAiAPIs = {
// 	vectorizationProcessAPICall,
// };

// KIOSK APIS
export const SocialMediaApiCall = (params = {}) => {
  const url = `${auraYfretUserCollBaseUrl}${socialMedia}`;

  return apiInstance({
    url,
    method: "get",
    params,
  });
};
export const TrendingApiCall = (params = {}) => {
  const url = `${auraYfretUserCollBaseUrl}${trending}`;

  return apiInstance({
    url,
    method: "get",
    params,
  });
};
export const LookBookApiCall = (params = {}) => {
  const url = `${auraYfretUserCollBaseUrl}${lookBook}`;

  return apiInstance({
    url,
    method: "get",
    params,
  });
};
export const TryonSaveApiCall = (data = {}) => {
  const url = `${auraYfretUserCollBaseUrl}${updateHandpickedProductsUrl}`;
// console.log("URL:", updateHandpickedProductsUrl);
  return apiInstance({
    url,
    method: "post",
      data,
  });
};
export const EarningPointsApiCall = ({user_id ,store_name}) => {
  const url = `${auraYfretUserCollBaseUrl}${earningPoints}`;
console.log("URL:", user_id, store_name);
// user_id:178453318805888,
//       store_name :'  ',
  return apiInstance({
    url,
    method: "get",
    params: {
      user_id,
      store_name ,
    },
  });
};
export const CheckoutUpdatePointsApiCall = (data = {}) => {
   const url = `${auraYfretUserCollBaseUrl}${checkoutUpdatePoints}`;
  return apiInstance({
    url,
    method: "post",
    data,
  });
};
export const SendSessionHCS20PointsApiCall = (data = {}) => {
  const url = `${event_app_api_base_url}${sendSessionHCS20Points}`;
  return apiInstance({
    url,
    method: "post",
    data,
  });
};
export const CheckSessionHCS20PointsApiCall = (data = {}) => {
  const url = `${event_app_api_base_url}${checkSessionHCS20Points}`;
  return apiInstance({
    url,
    method: "post",
    data,
  });
};
export const RedeemSessionHCS20PointsApiCall = (data = {}) => {
  const url = `${event_app_api_base_url}${redeemSessionHCS20Points}`;
  return apiInstance({
    url,
    method: "post",
    data,
  });
};
export const ClaimStorePointsApiCall = (data = {}) => {
  const url = `${auraYfretUserCollBaseUrl}${claimStorePoints}`;
  return apiInstance({
    url,
    method: "post",
    data,
  });
};
export const CreateBadgeApiCall = ({data}) => {
  const url = `${auraYfretUserCollBaseUrl}${createBadge}`;
// console.log("URL:", name, points, badge_image_url);
  return apiInstance({
    url,
    method: "post",
    data,
    responseType: "blob",
  }); 
};
export const SmartContractApiCall = (data = {}) => {
  const url = `${auraYfretUserCollBaseUrl}${smartContractTransaction}`;
// console.log("URL:", name, points, badge_image_url);
  return apiInstance({
    url,
    method: "post",
    data,
    // responseType: "blob",
  }); 
};
export const RemoveCartApiCall = ( data={} ) => {
  const url = `${auraYfretUserCollBaseUrl}${removeCartUrl}`;
// console.log("URL:", name, points, badge_image_url);
  return apiInstance({
    url,
    method: "delete",
    data
     
  }); 
};
