import { useSelector } from "react-redux";
import { CHAT_SEARCH_TYPES } from "./codes";


export const NODE_ENV = process.env.NODE_ENV;
export const isStagingEnv = process.env.NEXT_PUBLIC_STAGING_ENV === "true";
export const SOCKET_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
export const access_key =
	process.env.NEXT_PUBLIC_ACCESS_KEY || "e191921352124a06a09bb811a86a5c3a";
// export const base_url = process.env.NEXT_PUBLIC_BASE_URL || "https://api.yfret.com"; // REMOVE it from ymls as well
// export const admin_base_url =
// 	process.env.NEXT_PUBLIC_ADMIN_BASE_URL || "https://dev.yfret.com";  // REMOVE it from ymls as well
export const auraYfretUserCollBaseUrl =
	process.env.NEXT_PUBLIC_AURA_YFRET_USER_COLL_BASE_URL;
export const webbotNFTServiceBaseUrl =
	process.env.NEXT_PUBLIC_WEBBOT_NFT_SERVICE__BASE_URL;
// export const realtimeAIBaseUrl =
// 	process.env.NEXT_PUBLIC_REALTIME_AI_BASE_URL ||
// "https://realtimeapplication-dlwl6keu2q-uc.a.run.app";
// export const saleAssistSourceKey =
// 	process.env.SALE_ASSIST_SOURCE_KEY || "ea8c6282-f86d-41fa-8686-fb4c1df8d919";

// show shared profile on root page for shop.budgettravel home
// hide people & rewards and disable menu click on header
// abled click of menu if logged in user is super admin
export const shared_profile_on_root = process.env.NEXT_PUBLIC_SHARED_PROFILE_ON_ROOT;

// super admin of collection pages
export const super_admin = process.env.NEXT_PUBLIC_SUPER_ADMIN_USER_NAME;

export const instance_logo = process.env.NEXT_PUBLIC_INSTANCE_LOGO;
export const home_page_url = process.env.NEXT_PUBLIC_HOME_PAGE_URL;
export const aura_header_theme = process.env.NEXT_PUBLIC_AURA_HEADER_THEME;

// show recommendations if true
export const enable_recommendations =
	process.env.NEXT_PUBLIC_ENABLE_RECOMMENDATIONS === "true";

// to check whether need to pass is_store in create blog collection or not
export const is_store_instance =
	process.env.NEXT_PUBLIC_IS_STORE_INSTANCE === "true";
//enable venly flow
export const enable_venly = process.env.NEXT_PUBLIC_ENABLE_VENLY === "true";
export const enable_transfer_NFT =
	process.env.NEXT_PUBLIC_ENABLE_TRANSFER_NFT === "true";
export const venly_environment = process.env.NEXT_PUBLIC_VENLY_ENVIRONMENT;
export const adminUserId = process.env.NEXT_PUBLIC_ADMIN_USER_ID;
export const venly_client_id = process.env.NEXT_PUBLIC_VENLY_CLIENT_ID;
export const adminHederaWalletId = process.env.NEXT_PUBLIC_ADMIN_HEDERA_WALLET_ID;
export const adminUnthinkTokenAddress =
	process.env.NEXT_PUBLIC_ADMIN_HEDERA_UNTHINK_TOKEN_ADDRESS;
export const venlyChainSecretType = "HEDERA";
export const availableChatSearchTypes = [
	CHAT_SEARCH_TYPES.AURA,
	CHAT_SEARCH_TYPES.SEARCH,
];
export const availableChatSearchTypesTakeWalks = [CHAT_SEARCH_TYPES.SEARCH];
export const is_kiosk = process.env.NEXT_PUBLIC_IS_KIOSK_ENABLED === "true";
export const current_store_name = process.env.NEXT_PUBLIC_CURRENT_STORE_NAME;
export const current_store_id = process.env.NEXT_PUBLIC_CURRENT_STORE_ID;
export const payment_url = process.env.NEXT_PUBLIC_PAYMENT_URL;
export const event_app_api_base_url =
	process.env.NEXT_PUBLIC_EVENT_APP_API_BASE_URL;
export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_TRACKING_ID;

export const secretToken = process.env.NEXT_PUBLIC_FERNET_SECRET_KEY

export const isGivaStore =
  current_store_name === "giva_indiranagar2_hs" ||
  current_store_name === "giva_neeladri_hs";