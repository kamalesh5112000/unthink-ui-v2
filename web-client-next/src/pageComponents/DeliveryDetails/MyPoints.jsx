import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createLoyaltyBadge, fetchEarningPoints } from "./redux/action";

const buildClaimPointsUrl = (baseUrl, userId, storeName) => {
  if (!baseUrl || !userId || !storeName) {
    return baseUrl;
  }

  const claimPointsBasePattern = /\/claim-points\/?$/;

  if (!claimPointsBasePattern.test(baseUrl)) {
    return baseUrl;
  }

  const normalizedBaseUrl = baseUrl.replace(/\/+$/, "");

  return `${normalizedBaseUrl}/${encodeURIComponent(userId)}/${encodeURIComponent(storeName)}`;
};

const MyPoints = () => {
  const [
    authUser,
    authUserId,
    storeData,
    imageLoyaltyBadge,
    imageLoyaltyBadgeLoading,
    earningPoints,
    earningPointsLoading,
    earningPointsError,
  ] = useSelector((state) => [
    state.auth.user.data,
    state.auth.user.data.user_id,
    state.store.data,
    state.cart.imageLoyaltyBadge,
    state.cart.imageLoyaltyBadgeLoading,
    state.cart.earningPoints,
    state.cart.earningPointsLoading,
    state.cart.earningPointsError,
  ]);
  // console.log("earningPoints", earningPoints);

  const dispatch = useDispatch();

  useEffect(() => {
    if (!authUserId || !storeData?.store_name || earningPoints) {
      return;
    }

    dispatch(
      fetchEarningPoints({
        user_id: authUserId,
        store_name: storeData.store_name,
      }),
    );
  }, [authUserId, dispatch, earningPoints, storeData?.store_name]);
  useEffect(() => {
    if ( !storeData?.badge_settings && earningPoints?.available_balance === 0) {
      return;
    }

    const qrPageUrl = buildClaimPointsUrl(
      storeData?.badge_settings?.qr_page_url,
      authUserId,
      storeData?.store_name,
    );

// api logic
    dispatch(
      createLoyaltyBadge({
        name: authUser?.first_name || authUser?.last_name || authUser?.user_name,
        points: earningPoints?.available_balance,
        qr_page_url: qrPageUrl,
        badge_image_url: storeData?.badge_settings?.badge_image_url,
        badge_bg_color: storeData?.badge_settings?.badge_bg_color ||  null,
        badge_card_bg_color: storeData?.badge_settings?.badge_card_bg_color || null,
        badge_congrats_color: storeData?.badge_settings?.badge_congrats_color || null,
        badge_primary_color: storeData?.badge_settings?.badge_primary_color || null,
        badge_qr_bg_color: storeData?.badge_settings?.badge_qr_bg_color || null,
        badge_redemption_instructions: storeData?.badge_settings?.badge_redemption_instructions || null,
        badge_text_color: storeData?.badge_settings?.badge_text_color || null
      }),
    );
  }, [authUserId, dispatch, earningPoints?.available_balance, storeData?.badge_settings, storeData?.store_name]);

  return (
    <div>
      {/* <div className="text-center mt-5">
        {earningPointsLoading ? (
          <p className="text-lg font-semibold">Loading your points...</p>
        ) : earningPointsError ? (
          <p className="text-lg font-semibold text-red-600">
            Unable to load points.
          </p>
        ) : points !== undefined && points !== null ? (
          <p className="text-lg font-semibold">
            Your points: {Number(points).toLocaleString()}
          </p>
        ) : null}
      </div> */}

      {imageLoyaltyBadge ? (
        <img
          src={imageLoyaltyBadge}
          alt="image loyalty badge"
          className="m-auto mt-5"
        />
      ) : !imageLoyaltyBadgeLoading && !imageLoyaltyBadge && (
        <div className="text-center mt-5">
          <p className="text-lg font-semibold">No loyalty badge found.</p>
        </div>
      )}
    </div>
  );
};

export default MyPoints;
