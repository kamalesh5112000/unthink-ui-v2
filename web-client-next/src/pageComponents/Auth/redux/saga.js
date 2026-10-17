import { takeLatest, call, put, select } from "redux-saga/effects";
import {
  GET_SINGLE_USER_COLLECTION,
  GET_USER_COLLECTION,
  GET_USER_COLLECTIONS,
  GET_USER_INFO,
  GET_WISHLIST_USER_COLLECTION,
  SAVE_USER_INFO,
} from "./constants";
import {
  getSingleUserCollectionFailure,
  getSingleUserCollectionSuccess,
  getUserCollectionFailure,
  getUserCollectionsFailure,
  getUserCollectionsSuccess,
  getUserCollectionSuccess,
  getUserInfoFailure,
  getUserInfoSuccess,
  getwishlsitUserCollectionSuccess,
  setIsSavingUserInfo,
} from "./actions";
import { getInfluencerCollectionSuccess } from "../../Influencer/redux/actions";
import {
  authAPIs,
  collectionAPIs,
  profileAPIs,
  SendSessionHCS20PointsApiCall,
} from "../../../helper/serverAPIs";
import { getTTid } from "../../../helper/getTrackerInfo";
import { getCollectionsView } from "../../../helper/utils";
import { getAuthUserUserName } from "./selector";
import { customProductsWatcher } from "../../customProducts/redux/saga";
import { current_store_name } from "../../../constants/config";
import { generateDID } from "../utils/LoginUtils";
// import { getInfluencerInfoSuccess } from "../../Influencer/redux/actions"; // REMOVE
// import {
// 	authUserState,
// 	sharedUserState,
// } from "../../collectionPage/redux/selectors"; // REMOVE

export function* getUserInfoData(action) {
  try {
    let { data, status } = yield call(authAPIs.getUserInfoAPICall, action?.payload);
    if (status === 200 && data?.status_code === 200 && data?.data?.user_id) {
      let authUser = data.data;

      if (authUser && !authUser?.userDID ) {
        try {
          const storeData = yield select((state) => state.store.data);
          const userDID = generateDID();
          const profileData = {
            userDID, 
            user_id: authUser.user_id,
            _id: authUser._id,
          };
          

          yield call(profileAPIs.saveUserInfoAPICall, { profileData });
          authUser = {
            ...authUser,
            userDID,
          };

          const signupPoints = Number(storeData?.signup_points);
          if (Number.isFinite(signupPoints)) {
            yield call(SendSessionHCS20PointsApiCall, {
              recipientId: userDID,
              pointsAmount: signupPoints,
            });
          }
        } catch (userDIDError) {
          console.log(userDIDError);
        }
      }

      yield put(
        getUserInfoSuccess(authUser, {
          resetCollections: true,
        }),
      );
      
      // const authUser = yield select(authUserState); // REMOVE
      // const sharedUser = yield select(sharedUserState);
      // if (
      // 	authUser?.data?.user_id &&
      // 	sharedUser?.data?.user_id &&
      // 	authUser?.data?.user_id === sharedUser?.data?.user_id
      // ) {
      // 	yield put(getInfluencerInfoSuccess(data));
      // }
    } else
      yield put(
        getUserInfoSuccess(
          {
            user_id: getTTid(),
          },
          {
            resetCollections: true,
          },
        ),
      );
  } catch (err) {
    console.log(err);
    yield put(getUserInfoFailure(err));
  }
}

export function* saveUserInfoData(action) {
  try {
    yield put(setIsSavingUserInfo(true));
    let { data, status } = yield call(profileAPIs.saveUserInfoAPICall, {
      profileData: action.payload.userInfo,
    });
    if (status === 200 && data?.status_code === 200 && data?.data?.user_id) {
      {
        yield put(
          getUserInfoSuccess(data.data, {
            resetCollections: action.payload.resetCollections ?? true,
          }),
        );
        action.payload.onSuccess && action.payload.onSuccess();

        // if (window) window.location.href = "/store/";
      }
    } else {
      yield put(getUserInfoFailure(data));
      action.payload.onFailure && action.payload.onFailure();
    }
  } catch (err) {
    yield put(getUserInfoFailure(err));
    action.payload.onFailure && action.payload.onFailure();
  } finally {
    yield put(setIsSavingUserInfo(false));
  }
}

export function* userInfoWatcher() {
  yield takeLatest(GET_USER_INFO, getUserInfoData);
  yield takeLatest(SAVE_USER_INFO, saveUserInfoData);
}

// collections saga
function* fetchUserCollectionsSaga(action) {
  try {
    const authUserUserName = yield select(getAuthUserUserName);

    const {
      product_limits,
      kisokuser_id,
      summary,
      view = getCollectionsView(authUserUserName),
      Mystatus,
      ipp,
      current_page,
      generated_by,
      collection_type,
      path,
      callback,
      type,collection_name
    } = action.payload;

    const params = {
      user_id: kisokuser_id || getTTid(),
      product_limits,
      view,
      summary,
      status: Mystatus,
      ipp,
      current_page, 
      generated_by,
      collection_type,
      path,
      callback,
      type,
      collection_name
    };
    const { data = {}, status } = yield call(
      collectionAPIs.fetchCollectionsAPICall,
      params,
    );

    if (status === 200) {
      // console.log("data.data", data.data);

      yield put(getUserCollectionsSuccess(data.data || [], data.count, params));
      if (callback) {
        callback(data.data || []);
      }
    }
  } catch (err) {
    console.error(err);
    yield put(getUserCollectionsFailure());
  }
}

// single collection saga
function* fetchUserCollectionSaga(action) {
  try {
    const {
      _id: collection_id,
      product_sort_by,
      product_sort_order,
      product_limits,
    } = action.payload;

    const params = {
      // user_id: getTTid(),
      collection_id,
      product_sort_by,
      product_sort_order,
      product_limits,
    };

    const { data = {}, status } = yield call(
      collectionAPIs.fetchCollectionsAPICall,
      params,
    );

    if (status === 200 && data.data) {
      const collData = data.data[0]
        ? {
            ...data.data[0],
            detailed: true,
          }
        : {};
      yield put(getUserCollectionSuccess(collData));
      yield put(getInfluencerCollectionSuccess(collData));
    }
  } catch (err) {
    console.error(err);
    yield put(getUserCollectionFailure());
  }
}

function* fetchUserSingleCollectionSaga(action) {
  try {
    const {
      _id: collection_id,
      product_sort_by,
      product_sort_order,
      product_limits,
    } = action.payload;

    const params = {
      // user_id: getTTid(),
      collection_id,
      product_sort_by,
      product_sort_order,
      product_limits,
    };

    const { data = {}, status } = yield call(
      collectionAPIs.fetchCollectionsAPICall,
      params,
    );

    if (status === 200 && data.data) {
      const collData = data.data[0]
        ? {
            ...data.data[0],
            detailed: true,
          }
        : {};
      yield put(getSingleUserCollectionSuccess(collData));
    }
  } catch (err) {
    console.error(err);
    yield put(getSingleUserCollectionFailure());
  }
}
function* fetchUserWishlistCollectionSaga(action) {
  try {
    const {
      path,
      store=current_store_name
    } = action.payload;

    const params = {
     path,
     current_store_name
    };

    const { data = {}, status } = yield call(
      collectionAPIs.fetchCollectionsAPICall,
      params,
    );    
    if (status === 200 && data.data) {      
      yield put(getwishlsitUserCollectionSuccess(data.data[0]));
    }
  } catch (err) {
    console.error(err);
    yield put(getwishlsitUserCollectionFailure());
  }
}

export function* userCollectionsWatcher() {
  yield takeLatest(GET_USER_COLLECTIONS, fetchUserCollectionsSaga);
  yield takeLatest(GET_USER_COLLECTION, fetchUserCollectionSaga);
  yield takeLatest(GET_SINGLE_USER_COLLECTION, fetchUserSingleCollectionSaga);
  yield takeLatest(GET_WISHLIST_USER_COLLECTION, fetchUserWishlistCollectionSaga);
}

export default {
  userInfoWatcher,
  userCollectionsWatcher,
  customProductsWatcher,
  // getUserInfoData,
};

