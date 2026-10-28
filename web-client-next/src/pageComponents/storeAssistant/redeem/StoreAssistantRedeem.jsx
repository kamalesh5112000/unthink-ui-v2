import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";
import { FiRefreshCw } from "react-icons/fi";

import { authAPIs } from "../../../helper/serverAPIs";
import ClaimPoints from "../../DeliveryDetails/ClaimPoints";
import CheckoutClaimPoints from "../../DeliveryDetails/CheckoutClaimPoints";
import { getRedeemCustomerName, parseRedeemQr } from "./redeemQr";
import RedeemQrScanner from "./RedeemQrScanner";
import styles from "../StoreAssistantDashboard.module.scss";

const getRouteValue = (value) => (Array.isArray(value) ? value[0] : value);

const StoreAssistantRedeem = () => {
  const router = useRouter();
  const scanHandled = useRef(false);
  const [customerResult, setCustomerResult] = useState(null);

  const userId = getRouteValue(router.query.user_id);
  const storeName = getRouteValue(router.query.store_name) || "";
  const mode = router.query.mode === "checkout" ? "checkout" : "points";
  const scannedPayload = useMemo(() => {
    if (!userId) return null;
    const params = new URLSearchParams({ tab: "redeem", user_id: userId, store_name: storeName, mode });
    return parseRedeemQr(`/store-assistant?${params}`, "https://redeem.local");
  }, [mode, storeName, userId]);

  useEffect(() => {
    if (!scannedPayload) return;
    let cancelled = false;
    const requestedUserId = scannedPayload.userId;
    setCustomerResult(null);
    authAPIs.getUserInfoAPICall({ user_id: requestedUserId }).then((response) => {
      if (cancelled) return;
      const customer = response?.data?.data;
      setCustomerResult({
        userId: requestedUserId,
        customer: String(customer?.user_id) === requestedUserId ? customer : null,
      });
    }).catch(() => {
      if (!cancelled) setCustomerResult({ userId: requestedUserId, customer: null });
    });
    return () => { cancelled = true; };
  }, [scannedPayload]);

  const applyScan = useCallback((decodedText) => {
    if (scanHandled.current) return true;
    const payload = parseRedeemQr(decodedText, window.location.origin);
    if (!payload) {
      return false;
    }
    scanHandled.current = true;
    router.replace({
      pathname: router.pathname,
      query: { tab: "redeem", mode: payload.mode, user_id: payload.userId, store_name: payload.storeName },
    }, undefined, { shallow: true });
    return true;
  }, [router]);
  const clearCustomer = () => {
    scanHandled.current = false;
    setCustomerResult(null);
    router.replace({ pathname: router.pathname, query: { tab: "redeem" } }, undefined, { shallow: true });
  };
  const lookupComplete = customerResult?.userId === scannedPayload?.userId && Boolean(customerResult);
  const customer = lookupComplete ? customerResult.customer : null;

  return (
    <section className={styles.redeemPanel}>
      <div className={styles.redeemHeader}>
        <div>
          <p className={styles.eyebrow}>Points Redemption</p>
          <h1>{scannedPayload ? (mode === "checkout" ? "Checkout redemption" : "Redeem customer points") : "Scan customer badge"}</h1>
          <p>{scannedPayload ? "Review the customer details before redeeming." : "Scan a My Points badge or checkout QR to begin."}</p>
        </div>
        {userId ? <button type="button" onClick={clearCustomer}><FiRefreshCw /> Scan another</button> : null}
      </div>
      {!scannedPayload ? (
        <RedeemQrScanner onScan={applyScan} />
      ) : (
        <div className={styles.redeemFormWrap}>
          <div className={styles.redeemCustomerBar}>
            <span>Customer</span>
            <strong>{!lookupComplete ? "Loading customer…" : customer ? getRedeemCustomerName(customer) : "Customer unavailable"}</strong>
          </div>
          {customer ? (mode === "checkout" ? (
            <CheckoutClaimPoints key={`checkout:${userId}:${storeName}`} customerUserId={userId} customerStoreName={storeName} customerData={customer} />
          ) : (
            <ClaimPoints key={`points:${userId}:${storeName}`} customerUserId={userId} customerStoreName={storeName} customerData={customer} />
          )) : lookupComplete ? <p role="alert" className="p-5">Unable to load this customer. Please scan their badge or checkout QR again.</p> : null}
        </div>
      )}
    </section>
  );
};

export default StoreAssistantRedeem;
