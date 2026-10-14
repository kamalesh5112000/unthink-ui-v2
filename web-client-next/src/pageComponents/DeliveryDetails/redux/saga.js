import { call, put, takeLatest } from "redux-saga/effects";
import { message, notification } from "antd";
import {
  CheckSessionHCS20PointsApiCall,
  ClaimStorePointsApiCall,
  collectionAPIs,
  CheckoutUpdatePointsApiCall,
  CreateBadgeApiCall,
  EarningPointsApiCall,
  RedeemSessionHCS20PointsApiCall,
  RemoveCartApiCall,
  SendSessionHCS20PointsApiCall,
  SmartContractApiCall,
} from "../../../helper/serverAPIs";
import { collectionQRCodeGenerator } from "../../../helper/utils";

import {
  ADD_TO_CART,
  CHECKOUT_UPDATE_POINTS,
  CREATE_LOYALTY_BADGE,
  FETCH_EARNING_POINTS,
  FETCH_CART,
  REDEEM_SESSION_HCS20_POINTS,
  REMOVE_FROM_CART,
  
} from "./constant";

import {
  addToCartSuccess,
  addToCartFailure,
  fetchCartSuccess,
  fetchCartFailure,
  fetchCartReset,
  removeFromCartSuccess,
  removeFromCartFailure,
  createLoyaltyBadgeSuccess,
  createLoyaltyBadgeFailure,
  fetchEarningPointsSuccess,
  fetchEarningPointsFailure,
  checkoutUpdatePointsSuccess,
  checkoutUpdatePointsFailure,
  checkoutUpdatePoints,
  checkSessionHCS20PointsSuccess,
  checkSessionHCS20PointsFailure,
  claimStorePointsSuccess,
  claimStorePointsFailure,
  redeemSessionHCS20PointsSuccess,
  redeemSessionHCS20PointsFailure,
  sendSessionHCS20PointsSuccess,
  sendSessionHCS20PointsFailure,
  
} from "./action";



// ✅ ADD TO CART Saga
const getEarnedPoints = (data = {}) =>
  Number(
    data?.current_checkout_earned_points ??
      data?.total_earned ??
      data?.total_points ??
      data?.points ??
      0
  ) || 0;

function* syncSessionHCS20Points({ userDID, pointsAmount, shouldSendPoints }) {
  if (!userDID || pointsAmount <= 0) {
    return;
  }

  const sessionHCS20Payload = {
    recipientId: userDID,
    pointsAmount,
  };

  try {
    // if (shouldSendPoints) {
    //   const hcs20Response = yield call(
    //     SendSessionHCS20PointsApiCall,
    //     sessionHCS20Payload
    //   );
    //   yield put(
    //     sendSessionHCS20PointsSuccess({
    //       requestPayload: sessionHCS20Payload,
    //       response: hcs20Response?.data,
    //     })
    //   );
    // }

    const sessionHCS20BalancePayload = {
      recipientId: userDID,
    };

    try {
      const hcs20BalanceResponse = yield call(
        CheckSessionHCS20PointsApiCall,
        sessionHCS20BalancePayload
      );
      yield put(
        checkSessionHCS20PointsSuccess({
          requestPayload: sessionHCS20BalancePayload,
          response: hcs20BalanceResponse?.data,
        })
      );
    } catch (hcs20BalanceError) {
      console.error("Error checking session HCS20 points:", {
        status: hcs20BalanceError.response?.status,
        data: hcs20BalanceError.response?.data || hcs20BalanceError.message,
        payload: sessionHCS20BalancePayload,
      });
      yield put(
        checkSessionHCS20PointsFailure({
          requestPayload: sessionHCS20BalancePayload,
          error: hcs20BalanceError.response?.data || hcs20BalanceError,
        })
      );
    }
  } catch (hcs20Error) {
    console.error("Error sending session HCS20 points:", {
      status: hcs20Error.response?.status,
      data: hcs20Error.response?.data || hcs20Error.message,
      payload: sessionHCS20Payload,
    });
    yield put(
      sendSessionHCS20PointsFailure({
        requestPayload: sessionHCS20Payload,
        error: hcs20Error.response?.data || hcs20Error,
      })
    );
  }
}
function* addToCartSaga(action) {
  try {
    const payload = {
      ...action.payload,
      // domain_store: "pujaboxes",
      // is_display_amount: true,
    };

    const response = yield call(collectionAPIs.addToCollectionAPICall, payload);
    const data = response?.data?.data || response?.data?.data?.[0] || response?.data?.data?.[1];
    // console.log("response", data)
    // console.log("ssssssssss", response)

    // console.log("addToCartSaga", data);

    if (data?._id) {
      localStorage.setItem("mycartcollectionid", data._id);
      // message.success("Cart updated successfully!");
    }
    yield put(addToCartSuccess(data));
  } catch (error) {
    console.error("❌ addToCartSaga error:", error);
    message.error("Failed to update cart");
    yield put(addToCartFailure(error));
  }
}

// ✅ FETCH CART Saga
function* fetchCartSaga(action) {
  try {
    const response = yield call(collectionAPIs.fetchCollectionsAPICall, {
      is_display_amount: true,
      path: action.payload.collection_path,
    })
    // console.log("fetchCartSagaresponse", response.data.data);
    

    const data =
      response?.data?.data && response?.data?.data?.length
        ?   response?.data?.data[0] ||  response?.data?.data[1] 
        : null; 
        // console.log('dsdsdsdsdsdsd', data);

    yield put(fetchCartSuccess(data));
  } catch (error) {
    console.error("❌ fetchCartSaga error:", error);
    yield put(fetchCartFailure(error));
  }
}

// ✅ REMOVE PRODUCTS Saga
function* removeProductsSaga(action) {
  try {
    const payload = {
      ...action.payload,
      is_display_amount: true,
    };

    const response = yield call(collectionAPIs.removeFromCollectionAPICall, payload);
    const data = response?.data?.data;

    // console.log("🔔 removeProductsSaga response data:", data);

    if (data?.collection_id) {
      localStorage.setItem("mycartcollectionid", data.collection_id);
      message.success("Products removed successfully!");
    }

    yield put(removeFromCartSuccess(data));
  } catch (error) {
    console.error("❌ removeProductsSaga error:", error);
    message.error("Failed to remove products");
    yield put(removeFromCartFailure(error));
  }
}

function* createLoyaltyBadgeSaga(action) {
  // console.log("createLoyaltyBadgeSaga action.payload", action.payload);
  try {
    const response = yield call(CreateBadgeApiCall, {
     data: action.payload
      });

    const blob = new Blob([response.data], {
      type: response.headers["content-type"],
    });
    const imageUrl = URL.createObjectURL(blob);

    yield put(createLoyaltyBadgeSuccess(imageUrl));
  } catch (error) {
    console.error("Error fetching loyalty badge:", error.response?.data || error);
    yield put(createLoyaltyBadgeFailure(error.response?.data || error));
  }
}

function* fetchEarningPointsSaga(action) {
  try {
    const { userDID, claimpoints, ...earningPayload } = action.payload || {};
    const response = yield call(EarningPointsApiCall, {
      user_id: earningPayload?.user_id,
      store_name: earningPayload?.store_name,
    });
    const data = response?.data?.data ?? response?.data;

    yield put(fetchEarningPointsSuccess(data));
    yield call(syncSessionHCS20Points, {
      userDID,
      pointsAmount: getEarnedPoints(data),
      shouldSendPoints: Boolean(claimpoints),
    });
  } catch (error) {
    console.error("Error fetching earning points:", error.response?.data || error);
    yield put(fetchEarningPointsFailure(error.response?.data || error));
  }
}

function* checkoutUpdatePointsSaga(action) {
  try {
    const { userDID, claimpoints,...checkoutPayload } = action.payload || {};
    let currentCheckoutEarnedPoints;
    let current_checkout_earned_points
    // console.log('currentCheckoutEarnedPoints',currentCheckoutEarnedPoints);
    
    if(claimpoints){

      const response = yield call(CheckoutUpdatePointsApiCall, checkoutPayload); 
      const data = response?.data?.data ?? response?.data;
      current_checkout_earned_points =  data?.current_checkout_earned_points
       currentCheckoutEarnedPoints = Number(data?.total_earned) || 0;
      yield put(checkoutUpdatePointsSuccess(data));
    }

    if (userDID && currentCheckoutEarnedPoints > 0) {
      const sessionHCS20Payload = {
        recipientId: userDID,
        pointsAmount: currentCheckoutEarnedPoints,
      };
// if(!claimpoints) return;
try {
        if(current_checkout_earned_points){
        const hcs20Response = yield call(
          SendSessionHCS20PointsApiCall,
          sessionHCS20Payload
        );
        yield put(
          sendSessionHCS20PointsSuccess({
            requestPayload: sessionHCS20Payload,
            response: hcs20Response?.data,
          })
        );
      }

        const sessionHCS20BalancePayload = {
          recipientId: userDID,
        };
        try {
          const hcs20BalanceResponse = yield call(
            CheckSessionHCS20PointsApiCall,
            sessionHCS20BalancePayload
          );
          yield put(
            checkSessionHCS20PointsSuccess({
              requestPayload: sessionHCS20BalancePayload,
              response: hcs20BalanceResponse?.data,
            })
          );
        } catch (hcs20BalanceError) {
          console.error("Error checking session HCS20 points:", {
            status: hcs20BalanceError.response?.status,
            data: hcs20BalanceError.response?.data || hcs20BalanceError.message,
            payload: sessionHCS20BalancePayload,
          });
          yield put(
            checkSessionHCS20PointsFailure({
              requestPayload: sessionHCS20BalancePayload,
              error: hcs20BalanceError.response?.data || hcs20BalanceError,
            })
          );
        }
      } catch (hcs20Error) {
        console.error("Error sending session HCS20 points:", {
          status: hcs20Error.response?.status,
          data: hcs20Error.response?.data || hcs20Error.message,
          payload: sessionHCS20Payload,
        });
        yield put(sendSessionHCS20PointsFailure({
          requestPayload: sessionHCS20Payload,
          error: hcs20Error.response?.data || hcs20Error,
        }));
      }
    }
  } catch (error) {
    console.error("Error updating checkout points:", {
      status: error.response?.status,
      data: error.response?.data || error.message,
      payload: action.payload,
    });
    yield put(checkoutUpdatePointsFailure(error.response?.data || error));
  }
}

const getTransactionId = (responseData) =>{

  console.log('responseData',responseData);

  return responseData?.transactionId || "";
}

function* redeemSessionHCS20PointsSaga(action) {
  const { redeemPayload, claimPayload, eventId,ischeckoutPage } = action.payload || {};
  let pointsSmartContractTransactionId = "";
    const finalClaimPayload = {
    ...claimPayload,
    points_smart_contract_transactionId:  '',
    metadata: {
    type: "GIVA-loyalty-points",
    trait_type: "points",
    store_specific: true
  }
  };

  if (redeemPayload) {
    try {
       const claimResponse = yield call(ClaimStorePointsApiCall, finalClaimPayload);

    yield put(
      claimStorePointsSuccess({
        requestPayload: finalClaimPayload,
        response: claimResponse?.data,
      })
    );
    // console.log('claimResponse',claimResponse);
    
    const rawClaimResponseData = claimResponse?.data?.data ?? claimResponse?.data ?? {};
    const claimResponseData = Array.isArray(rawClaimResponseData)
      ? rawClaimResponseData[0] ?? {}
      : rawClaimResponseData;


    // if (
    //   checkoutRefreshPayload?.user_id &&
    //   checkoutRefreshPayload?.store_name
    // ) {
    //   yield put(checkoutUpdatePoints(checkoutRefreshPayload));
    notification.success({message:`You have successfully redeemed ${claimPayload?.points_exchanged} points.`})
    if(redeemPayload?.recipientId){ 
      const redeemResponse = yield call(
        RedeemSessionHCS20PointsApiCall,
        redeemPayload
      );
      const redeemResponseData = redeemResponse?.data;
      pointsSmartContractTransactionId =
        getTransactionId(redeemResponseData) || "";

      yield put(
        redeemSessionHCS20PointsSuccess({
          requestPayload: redeemPayload,
          response: redeemResponseData,
        })
      );
    }
    } catch (error) {
      console.error("Error redeeming checkout points:", {
        status: error.response?.status,
        data: error.response?.data || error.message,
        payload: action.payload,
      });
      yield put(
        redeemSessionHCS20PointsFailure({
          requestPayload: redeemPayload,
          error: error.response?.data || error,
        })
      );
    }
  }

  

  try {
     const contractPayload = {
        user_id:claimPayload?.user_id ,
         store_name: claimPayload?.store_name,
        event_id: eventId || '',
       points_smart_contract_transactionId:pointsSmartContractTransactionId || '', //optional if to be be passed with points summary

    };
    yield call(SmartContractApiCall, contractPayload);
   
    const removeCartPayload = {
      collection_name: "my cart",
      type: "system",
      user_id: claimPayload?.user_id  ,
      store:claimPayload?.store_name,
    };
    if(ischeckoutPage){
    try {
      yield call(RemoveCartApiCall, removeCartPayload);
      yield put(fetchCartReset());
    } catch (removeCartError) {
      console.error("Error removing redeemed cart:", {
        status: removeCartError.response?.status,
        data: removeCartError.response?.data || removeCartError.message,
        payload: removeCartPayload,
      });
    }
    } 
  } catch (claimError) {
    console.error("Error claiming store points:", {
      status: claimError.response?.status,
      data: claimError.response?.data || claimError.message,
      payload: finalClaimPayload,
    });
    yield put(
      claimStorePointsFailure({
        requestPayload: finalClaimPayload,
        error: claimError.response?.data || claimError,
      })
    );
  }
}
// ✅ Export all sagas (important for Object.values in rootSaga)
export function* cartSaga() {
  yield takeLatest(ADD_TO_CART, addToCartSaga);
  yield takeLatest(FETCH_CART, fetchCartSaga);
  yield takeLatest(REMOVE_FROM_CART, removeProductsSaga);
  yield takeLatest(CREATE_LOYALTY_BADGE, createLoyaltyBadgeSaga);
  yield takeLatest(FETCH_EARNING_POINTS, fetchEarningPointsSaga);
  yield takeLatest(CHECKOUT_UPDATE_POINTS, checkoutUpdatePointsSaga);
  yield takeLatest(REDEEM_SESSION_HCS20_POINTS, redeemSessionHCS20PointsSaga);
}
export default {
  cartSaga
};
