import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  checkoutUpdatePoints,
  fetchEarningPoints,
  redeemSessionHCS20Points,
} from "./redux/action";
import { current_store_name } from "../../constants/config";
import { useRouter } from "next/router";
import { IoCartOutline } from "react-icons/io5";
import { getUserInfo } from "../Auth/redux/actions";
import { DEFAULT_NFT_INSTANCE_ID } from "../../constants/kioskCodes";



const getPointValue = (source, keys, fallback = 0) => {
  const rawValue = keys.reduce(
    (value, key) => (value === undefined ? source?.[key] : value),
    undefined
  );
  const nextValue = Number(rawValue);

  return Number.isFinite(nextValue) ? nextValue : fallback;
};

const DEFAULT_CLAIM_IMAGE_URL = "https://example.com/nft/platnium.png";
const getRouteValue = (value) => (Array.isArray(value) ? value[0] : value);
const ClaimPoints = ({
  // checkoutUpdatedPoints,
  // checkoutUpdatePointsLoading,
  // checkoutUpdatePointsError,
  // redeemSessionHCS20PointsLoading,
  // checkoutUserId,
  // checkoutStoreName,
  // userDID,
  // claimImageUrl,
  checkoutPage = false,
}) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const [redeemPoints, setRedeemPoints] = useState(null);
  const [voucherCode, setVoucherCode] = useState(null);
  const [storeName, setStoreName] = useState(null);
  const [storeAssistanceId, setStoreAssistanceId] = useState(null);
  const [confirmedPoints, setConfirmedPoints] = useState(0); 
  const [redeemPointsError, setRedeemPointsError] = useState("");
  const [pendingRedeemPoints, setPendingRedeemPoints] = useState(null);
  const routeUserId = getRouteValue(router.query.user_id);
  // console.log('redeemPoints',redeemPoints);

const [
 
    authUser,
    checkoutUpdatedPoints,
    checkoutUpdatePointsLoading,
    checkoutUpdatePointsError,
    redeemSessionHCS20PointsLoading,
    claimStorePointsResponse,
    earningPoints,
    earningPointsLoading,
    storeData,
  ] = useSelector((state) => [
    state.auth?.user?.data,
    state.cart?.checkoutUpdatedPoints,
    state.cart?.checkoutUpdatePointsLoading,
    state.cart?.checkoutUpdatePointsError,
    state.cart?.redeemSessionHCS20PointsLoading,
    state.cart?.claimStorePointsResponse,
    state.cart?.earningPoints,
    state.cart?.earningPointsLoading,
    state.store.data,
  ]);
  useEffect(() => {
    if (!routeUserId) {
      return;
    }

    dispatch(getUserInfo({ user_id: routeUserId }));
  }, [dispatch, routeUserId]);


  const pointsLoading = checkoutPage
    ? checkoutUpdatePointsLoading
    : earningPointsLoading;
  const userDID = authUser?.userDID;
  const checkoutStoreName = storeData?.store_name || current_store_name;
   const checkoutUserId = routeUserId || authUser?.user_id  
  const pointsData = checkoutPage
    ? checkoutUpdatedPoints?.events?.[0] ||
      checkoutUpdatedPoints?.event ||
      checkoutUpdatedPoints
    : earningPoints;
  const hasCalculatedPoints = Boolean(pointsData);
  const totalClaimPoints = getPointValue(
    pointsData,
    ["total_earned", "total_points", "totalPoints", "points", "earned_points"],
    pointsData?.available_balance
  );
  const maxAvailableToRedeem = getPointValue(
    pointsData,
    [
      "max_available_to_redeem",
      "maxAvailableToRedeem",
      "available_to_redeem",
      "available_balance",
      "available_points",
    ],
    pointsData?.available_balance
  );
  const redeemablePoints = Math.min(
    Math.max(Number(redeemPoints) || 0, 0),
    maxAvailableToRedeem
  );
  const appliedPoints = confirmedPoints || redeemablePoints;
  const remainingPoints = getPointValue(
    pointsData,
    ["available_balance", "remaining_balance", "remainingBalance", "remaining_points"],
    Math.max(totalClaimPoints - appliedPoints, 0)
  );
  const claimedPointsData = claimStorePointsResponse?.data ?? claimStorePointsResponse;
  const claimedAvailableBalance = claimStorePointsResponse
    ? getPointValue(
        claimedPointsData,
        ["available_balance", "remaining_balance", "remainingBalance", "remaining_points"],
        remainingPoints
      )
    : null;
  const displayedAvailableBalance =
    hasCalculatedPoints || claimedAvailableBalance !== null
      ? claimedAvailableBalance ?? maxAvailableToRedeem
      : "";
  const displayedRemainingBalance =
    claimedAvailableBalance ?? remainingPoints;
 const claimImageUrl =
    storeData?.pdp_settings?.badge_url ||
    storeData?.badge_image_url ||
    DEFAULT_CLAIM_IMAGE_URL;

  const handlePointsChange = (event) => {
    const nextValue = Number(event.target.value);
    const normalizedValue = nextValue === 0 ? '' : nextValue;
    setRedeemPoints(normalizedValue);

    if (hasCalculatedPoints && normalizedValue > maxAvailableToRedeem) {
      setRedeemPointsError(
        `Enter ${maxAvailableToRedeem} points or less to redeem.`
      );
      return;
    }

    setRedeemPointsError("");
  };
  const handleVoucherCodeChange = (event) => {
    setVoucherCode(event.target.value);
  };
  const handleStoreNameChange = (event) => {
    setStoreName(event.target.value);
  }
  const handleStoreAssistanceIdChange = (event) => {
    setStoreAssistanceId(event.target.value);
  }

  const handleCalculatePoints = () => {
    if (!checkoutUserId || !checkoutStoreName) {
      console.error("Missing checkout points payload:", {
        user_id: checkoutUserId,
        store_name: checkoutStoreName,
      });
      return;
    }

    if (!checkoutPage) {
      dispatch(
        fetchEarningPoints({
          user_id: checkoutUserId.toString(),
          store_name: checkoutStoreName,
          userDID,
          claimpoints: true,
        })
      );
      return;
    }

    dispatch(
      checkoutUpdatePoints({
        user_id: checkoutUserId.toString(),
        store_name: checkoutStoreName,
        userDID,
        claimpoints: true,
      })
    );
  };

  const handleConfirmRedemption = () => {
    const validPoints = Math.max(Number(redeemPoints) || 0, 0);


    if (validPoints > maxAvailableToRedeem) {
      setRedeemPointsError(
        `Enter ${maxAvailableToRedeem} points or less to redeem.`
      );
      return;
    }

    setPendingRedeemPoints(validPoints);
  };

  const handleCloseRedeemModal = () => {
    if (redeemSessionHCS20PointsLoading) {
      return;
    }

    setPendingRedeemPoints(null);
  };

  const handleConfirmRedeemPoints = () => {
    if (pendingRedeemPoints === null) {
      return;
    }

    const validPoints = pendingRedeemPoints;

    setRedeemPointsError("");
    setRedeemPoints('');
    setConfirmedPoints(validPoints);
    setPendingRedeemPoints(null);

    

    dispatch(
      redeemSessionHCS20Points({
        // ...(userDID && {
          redeemPayload: {
            recipientId: userDID,
            pointsAmount: validPoints,
          },
        // }),
        claimPayload: {
          user_id: checkoutUserId?.toString(),
          store_name: checkoutStoreName,
          nft_instance_id: DEFAULT_NFT_INSTANCE_ID,
          points_exchanged: validPoints,
          image_url: claimImageUrl,
          voucher_code:voucherCode,
          storename:storeName,
          store_assistance_id:storeAssistanceId,
        },
        eventId:storeData?.event_id,
        ischeckoutPage: checkoutPage,

      })
    );
  };

  return (
    <div className="p-5 ">

    <div className={`flex w-full flex-col items-center gap-4 md:grid ${!checkoutPage ? "md:grid-cols-2" : "md:grid-cols-1"}`}>
      { !checkoutPage &&

      <div className="flex w-full flex-col items-center">
      <div className="mb-7 flex items-center gap-2">
    <IoCartOutline className="text-xl text-kiosk-primary font-semibold md:text-2xl" />
    <p className="text-xl font-semibold md:text-2xl " >Get Voucher At the Counter</p>
      </div>

      <div className="">
        <img className="max-w-[300px] lg:max-w-[400px]" src="https://cdn.unthink.ai/img/unthink_ai/Screenshot%202026-07-27%20at%2012.40.53PM_zfiviby.webp" />
      </div>
      </div>

}
      <div className="mx-auto w-full max-w-[500px] text-[15px] text-black md:justify-self-center">
        <button
          type="button"
          onClick={handleCalculatePoints}
          disabled={pointsLoading}
          className="w-full bg-kiosk-secondary py-1 text-center text-[16px] uppercase hover:bg-kiosk-primary disabled:cursor-not-allowed disabled:opacity-70"
        >
          {pointsLoading
            ? checkoutPage ? "CALCULATING POINTS" : "FETCHING POINTS"
            : checkoutPage ? "CALCULATE POINTS" : "FETCH POINTS"}
        </button>
        {pointsLoading && (
          <div className="px-3 py-2 leading-6">
            <p>{checkoutPage ? "Calculating points at checkout...." : "Fetching points...."}</p>
            <p>Reading rules..</p>
            <p>Checking for points per product........</p>
          </div>
        )}

        <div className="mt-3 border-t-2 border-black pt-3 text-center">
          <p className="mt-5 text-[16px]">
            Max Available to redeem:{" "}
            <span className="ml-2">{displayedAvailableBalance}</span>
          </p>
        </div>

        <div className="mt-5 bg-[#fbfbfb] px-2 py-3">
          <label
            htmlFor="redeem-points"
            className="mb-1 block text-center text-base font-semibold"
          >
            [Enter points to redeem]
          </label>
          <input
            id="redeem-points"
            type="number"
            // min="0"
            placeholder="Enter Points to Redeem"
            max={maxAvailableToRedeem}
            value={redeemPoints}
            onChange={handlePointsChange}
            disabled={!hasCalculatedPoints}
            className="h-9 w-full border border-kiosk-secondary focus:border focus:border-black bg-white px-2 text-[11px] outline-none disabled:cursor-not-allowed  "
          />
          <div className="mt-3 flex   gap-2">
          <div className="flex-1">

          <label
            htmlFor="store-name"
            className="mb-1 block text-center text-base font-semibold"
          >
            [Store Name ]
          </label>
          <input
            id="store-name"
            type="text"
            placeholder="Enter Store Name"
            value={storeName}
            onChange={handleStoreNameChange}
            disabled={!hasCalculatedPoints}
            className="h-9 w-full border disabled:cursor-not-allowed border-kiosk-secondary focus:border focus:border-black bg-white px-2 text-[11px] outline-none"
          />
          </div>
          <div className="flex-1">


            <label
            htmlFor="store-assistance-id"
            className="mb-1 block text-center text-base font-semibold"
          >
            [Store Assistance Id ]
          </label>
          <input
            id="store-assistance-id"
            type="text"
            placeholder="Enter Store Assistance Id"
            value={storeAssistanceId}
            onChange={handleStoreAssistanceIdChange}
            disabled={!hasCalculatedPoints}
            className="h-9 w-full border disabled:cursor-not-allowed border-kiosk-secondary focus:border focus:border-black bg-white px-2 text-[11px] outline-none"
          /> 
          </div>

          </div>
        
          <label
            htmlFor="Voucer COde"
            className="mb-1 block text-center text-base font-semibold"
          >
            [Enter voucher code]
          </label>
          <input
            id="voucher-code"
            type="text"
            placeholder="Enter Voucher Code"
            value={voucherCode}
            onChange={handleVoucherCodeChange}
            disabled={!hasCalculatedPoints}
            className="h-9 w-full border disabled:cursor-not-allowed border-kiosk-secondary focus:border focus:border-black bg-white px-2 text-[11px] outline-none"
          />
            
       
          {/* {redeemPointsError && (
            <p className="mt-1 text-[10px] leading-4 text-red-600">
              {redeemPointsError}
            </p>
          )} */}
          <button
            type="button"
            onClick={handleConfirmRedemption}
            disabled={
              !hasCalculatedPoints ||
              Boolean(redeemPointsError) ||
              redeemSessionHCS20PointsLoading || !redeemPoints
            }
            className="mt-2 w-full bg-kiosk-secondary py-1 text-center text-[16px] uppercase hover:bg-kiosk-primary disabled:cursor-not-allowed disabled:opacity-60"
          >
            {redeemSessionHCS20PointsLoading
              ? "REDEEMING POINTS"
              : "REDEEM POINTS"}
          </button>
        </div>

        {hasCalculatedPoints && (
          <div className="mt-6 border-t-2 border-black px-3 pt-5 leading-6">
            {redeemSessionHCS20PointsLoading && (
              <p>Updating final balance....</p>
            )}
            <p>Remaining balance: {displayedRemainingBalance} points</p>
          </div>
        )}

        {checkoutUpdatePointsError && (
          <p className="mt-6 border-t-2 border-black px-3 pt-5 text-xs text-red-600">
            Failed to calculate checkout points.
          </p>
        )}
      </div>

      {pendingRedeemPoints !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="redeem-points-confirmation-title"
            className="w-full max-w-[420px] rounded-lg bg-white p-5 text-black shadow-2xl"
          >
            <div className="border-b border-[#dedede] pb-3">
              <p
                id="redeem-points-confirmation-title"
                className="text-lg font-semibold"
              >
                Confirm points redemption
              </p>
              <p className="mt-1 text-sm leading-5 text-[#555]">
                Please review this action before applying points to checkout.
              </p>
            </div>

            <div className="py-5 text-center">
              <p className="text-sm uppercase tracking-wide text-[#777]">
                Points to redeem
              </p>
              <p className="mt-2 text-3xl font-semibold">
                {pendingRedeemPoints}
              </p>
              <p className="mt-3 text-sm leading-5 text-[#555]">
                This will update the final checkout balance for this customer.
              </p>
            </div>

            <div className="flex gap-3 border-t border-[#dedede] pt-4">
              <button
                type="button"
                onClick={handleCloseRedeemModal}
                disabled={redeemSessionHCS20PointsLoading}
                className="h-9 flex-1 border border-[#222] bg-white text-[13px] font-semibold uppercase text-[#222] hover:bg-[#f4f4f4] disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRedeemPoints}
                disabled={redeemSessionHCS20PointsLoading}
                className="h-9 flex-1 bg-kiosk-secondary text-[13px] font-semibold uppercase text-black hover:bg-kiosk-primary disabled:cursor-not-allowed disabled:opacity-60"
              >
                {redeemSessionHCS20PointsLoading
                  ? "Confirming"
                  : "Confirm redemption"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </div>

  );
};

export default ClaimPoints;
