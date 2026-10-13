import { useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";

import { current_store_name } from "../../constants/config";
import {
	gTagKioskCartView,
	gTagKioskProductView,
} from "./gtag";

const sendGtagEvent = (eventName, params, retryCount = 0) => {
	if (typeof window === "undefined") return;

	if (typeof window.gtag === "function") {
		window.gtag("event", eventName, params);
		return;
	}

	if (retryCount < 10) {
		window.setTimeout(() => sendGtagEvent(eventName, params, retryCount + 1), 300);
	}
};

const getExperienceType = ({ asPath, pathname, hasKioskAccess }) => {
	if (pathname === "/store-assistant" || asPath?.startsWith("/store-assistant")) {
		return "store_assistant";
	}

	if (
		pathname === "/kiosk" ||
		pathname?.startsWith("/kiosk/") ||
		asPath?.startsWith("/kiosk") ||
		hasKioskAccess === true
	) {
		return "kiosk";
	}

	return "store";
};

const getPageTitle = () => {
	if (typeof document === "undefined") return undefined;
	return document.title || undefined;
};

const getPageLocation = () => {
	if (typeof window === "undefined") return undefined;
	return window.location.href;
};

const AnalyticsTracker = () => {
	const router = useRouter();
	const lastPageViewKeyRef = useRef("");
	const hasTrackedKioskSessionRef = useRef(false);
	const hasKioskAccess = useSelector((state) => state.kiosk.hasAccess);

	const experienceType = useMemo(
		() =>
			getExperienceType({
				asPath: router.asPath,
				pathname: router.pathname,
				hasKioskAccess,
			}),
		[hasKioskAccess, router.asPath, router.pathname],
	);

	useEffect(() => {
		if (!router.isReady) return;

		const pageViewKey = `${router.asPath}|${experienceType}`;
		if (lastPageViewKeyRef.current === pageViewKey) return;
		lastPageViewKeyRef.current = pageViewKey;

		const commonParams = {
			experience_type: experienceType,
			store_name: current_store_name,
			page_path: router.asPath,
			page_location: getPageLocation(),
			page_title: getPageTitle(),
		};

		sendGtagEvent("page_view", commonParams);

		if (experienceType === "kiosk" && !hasTrackedKioskSessionRef.current) {
			hasTrackedKioskSessionRef.current = true;
			sendGtagEvent("kiosk_session_start", commonParams);
		}

		if (experienceType === "kiosk" && (router.pathname === "/cart" || router.pathname === "/kiosk/cart")) {
			gTagKioskCartView();
		}

		if (
			experienceType === "kiosk" &&
			(router.pathname === "/product/[mfr_code]" || router.pathname === "/kiosk/product/[mfr_code]")
		) {
			gTagKioskProductView({ item_id: router.query?.mfr_code });
		}
	}, [experienceType, router.asPath, router.isReady, router.pathname, router.query?.mfr_code]);

	return null;
};

export default AnalyticsTracker;
