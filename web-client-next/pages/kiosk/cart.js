import React, { useEffect, useState } from "react";
import { Spin } from "antd";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";

import CartPage from "../cart";

const KioskCartPage = (props) => {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [hasKioskAccess, isUserLogin, authUserIsFetching, storeData] = useSelector((state) => [
    state.kiosk.hasAccess,
    state.auth.user.isUserLogin,
    state.auth.user.isFetching,
    state.store.data,
  ]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const storeLoadedWithoutKioskList = storeData && !Array.isArray(storeData.kiosk_list);
    const shouldRedirect =
      hasKioskAccess === false ||
      storeLoadedWithoutKioskList ||
      (!isUserLogin && !authUserIsFetching);

    if (shouldRedirect) {
      router.replace("/");
    }
  }, [authUserIsFetching, hasKioskAccess, isUserLogin, mounted, router, storeData]);

  if (!mounted || hasKioskAccess !== true) {
    return (
      <div className="min-h-screen flex items-start justify-center pt-5">
        <Spin />
      </div>
    );
  }

  return <CartPage {...props} />;
};

export default KioskCartPage;
