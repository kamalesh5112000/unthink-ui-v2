import React, { useCallback, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { notification } from "antd";

import {
	getPrevSid,
	getSid,
	getTTid,
	isDebugCookie,
	isEnableAICookie,
	isEnableAICookieFalse,
	updateSocketMessageWithPrefix,
} from "../helper/getTrackerInfo";
import { getParams, stopAuraSearchTimer } from "../helper/utils";
import {
	resetSuggestionsList,
	setAiExtractionData,
	setChatGeneralSuggestions,
	setChatProducts,
	setChatProductsData,
	setChatShopALook,
	setAuraHelperMessage,
	setShowChatLoader,
	setSocketId,
	setSuggestionsList,
	setSuggestionsProducts,
	setUserDataSent,
	setWidgetHeader, // need to handle properly
	setWidgetImage,
	setIsFreshSearch,
	setChatMessage,
	setRecommendationProducts,
	setMoreProducts,
	setAuraSreverImage,
	setOverlayCoordinates,
} from "../hooks/chat/redux/actions";
import {
	access_key,
	isStagingEnv,
	is_store_instance,
	current_store_name,
} from "../constants/config";
import { socket, SocketContext } from "./socketV2";
import useAudio from "../hooks/chat/useAudio";
import { handleRecProductClick } from "../pageComponents/recommendations/redux/actions";
import { updateWishlist } from "../pageComponents/wishlistActions/updateWishlist/redux/actions";
import {
	CHAT_SEARCH_OPTION_ID,
	CHAT_TYPE_CHAT,
	COLLECTION_GENERATED_BY_DESC_BASED,
	EDIT_ACTION,
} from "../constants/codes";
import { collectionPageAPIs } from "../helper/serverAPIs";
import { replaceAndUpdateUserCollectionData } from "../pageComponents/Auth/redux/actions";

const ContextWrapper = ({ children }) => {
	const [
		user,
		socketId,
		isAuraSpeaking,
		chatMessage,
		isMute,
		showChatLoader,
		userDataSent,
		isFreshSearch,
		activeSearchOption,
	] = useSelector((state) => [
		state.auth.user,
		state.chatV2.socketId,
		state.chatV2.isAuraSpeaking,
		state.chatV2.chatMessage,
		state.chatV2.isMute,
		state.chatV2.showChatLoader,
		state.chatV2.userDataSent,
		state.chatV2.isFreshSearch,
		state.chatV2.activeSearchOption || {},
	]);
	// console.log('activeSearchOption',activeSearchOption);
	
	const dispatch = useDispatch();
	const { onTrackStream } = useAudio(isAuraSpeaking);
	const activeSearchOptionRef = useRef(activeSearchOption);

	useEffect(() => {
		activeSearchOptionRef.current = activeSearchOption;
	}, [activeSearchOption]);

	const sendSocketClientMessage = ({
		message,
		image_url,
		metadata = {},
		userMetadata,
		mute = isMute,
		imageGenerate
	}) => {
		if (message !== "Hi" && isFreshSearch) {
			dispatch(setIsFreshSearch(false));
		}
		socket.emit("client", {
			text: message ? updateSocketMessageWithPrefix(message) : undefined,
			image_url: image_url ?? "",
			mute,
			metadata,
			userMetadata,
			imageGenerate
		});
	};

	const sendSocketClientShopALook = ({
		image_url,
		// mute = isMute,
		metadata = { store: current_store_name },
	}) => {
		socket.emit("client", {
			shopALook: { image_url },
			// mute,
			metadata,
		});
	};

	const sendSocketClientDataExtractionRequest = ({
		video_url,
		uploaded_source,
		metadata,
		collection_id,
		user_action,
		userMetadata,
	}) => {
		socket.emit("client", {
			dataExtractionRequest: {
				video_url,
				uploaded_source,
				collection_id,
				user_action,
			},
			metadata,
			userMetadata,
		});
	};


	const sendSocketClientimageGenarate = ({
		imageGenerate,
		metadata,
	}) => {
		socket.emit("client", {
			imageGenerate,
			metadata,
		});
	};

	const resendMessage = () => {
		if (showChatLoader && chatMessage) {
			sendSocketClientMessage({ message: chatMessage });
		}
	};

	useEffect(() => {
 
		if (socketId && user ) {
			const userInfo = {
				access_key,
				userId: getTTid(),
				language: "en-US",
				sessionId: getSid(),
				prevSessionId: getPrevSid(),
			};
			 

			if (getParams("unthink_internal") === "true" || isDebugCookie()) {
				userInfo["debug"] = true;
			}
			// if (!isEnableAICookieFalse() && (isStagingEnv || isEnableAICookie())) {
			userInfo["enableai"] = true;
			// }
			// if (user?.data.filters && user?.data.filters?.[current_store_name]?.strict?.brand?.length) {
				// userInfo["filters"] = user.data.filters?.[current_store_name];
			// }
			// console.log(user?.data.filters);
			// console.log('dfdfddgf',user?.data.filters?.[current_store_name]?.strict?.brand?.length);
			
			
	if (user?.data.filters ) {
				userInfo["filters"] = user.data.filters?.[current_store_name];
			}

			if (window.localStorage.getItem("search_priority")) {
				userInfo.search_priority =
					window.localStorage.getItem("search_priority");
			}
			if (is_store_instance) {
				userInfo.store = current_store_name;
			}

			const search_alg = localStorage.getItem("search_alg");
			if (search_alg) {
				userInfo.search_alg = search_alg; // temporary
			}
			const method = localStorage.getItem("method");
			if (method) {
				userInfo.method = method; // temporary
			}

			socket.emit("userInfo", userInfo);
			dispatch(setUserDataSent(true));
			resendMessage(); //
		}
	}, [socketId,user.data.filters]);

	const handleSocketConnection = useCallback(() => {
		// being called on socket reconnection
		if (socketId && userDataSent) {
			socket.emit("reconnectionAttempt", {});
			dispatch(setSocketId(socket.id));
		}
	}, [socketId, userDataSent]);

	useEffect(() => {
		socket.on("connect", handleSocketConnection);
		if (!socketId) dispatch(setSocketId(socket.id));
		return () => {
			socket.off("connect", handleSocketConnection);
		};
	}, [socketId, userDataSent]);

	const fnResetProducts = () => {
		dispatch(setChatProductsData([]));
		dispatch(setChatProducts({}, CHAT_TYPE_CHAT));
	};

	const fnResetSuggestions = () => {
		dispatch(resetSuggestionsList());
	};

	const fnResetShopALooks = () => {
		dispatch(setChatShopALook({}, CHAT_TYPE_CHAT));
	};

	const onServer = async (data) => {

	//  console.log('setWidgetHeader',data);
	 


		const shouldWaitForSuggestionProducts =
			activeSearchOptionRef.current?.id === CHAT_SEARCH_OPTION_ID.product_search;

		if (!shouldWaitForSuggestionProducts) {
			dispatch(setShowChatLoader(false));
		}

		if (isDebugCookie()) console.timeEnd("##responseTime"); // added for testing purpose only . should be remove later

		if (typeof data === "object") {
			stopAuraSearchTimer();

			if (data.current_data_general_suggestion) {
				dispatch(
					setChatGeneralSuggestions(data.current_data_general_suggestion)
				);
			}
			if (
				data.current_data_text &&
				data.current_data_intent_name !== "Default Welcome Intent"
			) {
				dispatch(setAuraHelperMessage(data.current_data_text));
			}
			if (
				data.image_url
			) {
				dispatch(setAuraSreverImage(data.image_url));
			}
			if (
				data.current_data_data &&
				data.current_data_widgetType !== "non_widget" &&
				data.current_data_widgetType !== "category_widget"
			) {
				dispatch(setChatProductsData(data.current_data_data));
				dispatch(handleRecProductClick());
			}
			if ("current_data_widgetHeader" in data) {
				// store previous value and persist request history in sessionStorage
				dispatch(
					setWidgetHeader(
						data.current_data_widgetHeader || "",
						data.request || {})
				);
				dispatch(setWidgetImage(data.image_url || ""));
				if (data.current_data_widgetHeader) {
					sessionStorage.setItem("widgetHeader", data.current_data_widgetHeader);
				}
			}

			// empty input field after search when follow up search checked
			if (data.request && data.request.metadata.follow_qn) {
				// will need to add check, chatMessage avilable
				dispatch(setChatMessage(""));
			}

			if (data.dataExtractionRequest && data.dataExtractionRequest.type) {
				if (
					data.dataExtractionRequest.request.user_action === EDIT_ACTION &&
					data.dataExtractionRequest.data?.status_code === 200
				) {
					const editPayload = {
						_id: data.dataExtractionRequest.request.collection_id,
						description: data.dataExtractionRequest.data.description,
						keyword_tag_map: data.dataExtractionRequest.data.keyword_tag_map,
						tags: data.dataExtractionRequest.data.tags,
						fetchUserCollection: true,
					};
					const fetchProductsAPIPayload = {
						collection_id: data.dataExtractionRequest.request.collection_id,
						tags: data.dataExtractionRequest.data.tags,
						tag_filters: data.dataExtractionRequest.data.keyword_tag_map,
						store: is_store_instance ? current_store_name : undefined,
						user_query: data.dataExtractionRequest.data.description ? data.dataExtractionRequest.data.description : "",
						try_gpt: "no",
						replace: true,
						complete: true
					};

					await dispatch(updateWishlist(editPayload));


					let productsResponse = await collectionPageAPIs.fetchProductsAPICall(
						fetchProductsAPIPayload
					);

					if (
						productsResponse.data &&
						productsResponse.data.status_code === 200 &&
						productsResponse.data.data &&
						productsResponse.data.data.data &&
						productsResponse.data.data.data._id
					) {
						dispatch(
							replaceAndUpdateUserCollectionData(productsResponse.data.data.data)
						);
					}
				}
				dispatch(setAiExtractionData(data.dataExtractionRequest));
			}
			if (data.fresh_result) {
				fnResetSuggestions();
				fnResetShopALooks();
				fnResetProducts();
			}
		}
	};

	const onProducts = (data) => {
		// new format with combined data
		if (typeof data === "object") {
			if (data.product_list) {
				dispatch(setChatProducts(data, CHAT_TYPE_CHAT));
			}
		}
	};

	const onShopALook = (data) => {
		dispatch(setShowChatLoader(false));

		// new format with collection list
		if (typeof data === "object") {
			if (data.collection_list) {
				dispatch(setChatShopALook(data, CHAT_TYPE_CHAT));
				// dispatch(setWidgetHeader(""));
			}
		}
	};

	const onSuggestions = (data) => {
		// new format with products
		if (typeof data === "object") {
			if (data.suggestions) {
				dispatch(setSuggestionsList(data.suggestions));
			}
			if (data.products) {
				dispatch(setSuggestionsProducts(data.products));
				dispatch(setShowChatLoader(false));
			}
		}
	};

	const onRecommendation = (data) => {
		// new format with products
		if (typeof data === "object") {
			if (data.products) {
				dispatch(setRecommendationProducts(data.products));
			}
		}
	};

	const onMoreSearch = (data) => {
		// new format with products
		if (typeof data === "object") {
			if (data.products) {
				dispatch(setMoreProducts(data.products));
			}
		}
	};


	const onOverlay = (data) => {
		if (data.product_list_coordinates) {
 			dispatch(setOverlayCoordinates(data.product_list_coordinates));
		}
	};

	const onNotifications = (data) => {
		if (typeof data === "object") {
			if (data.notifications && data.notifications.type === "USER_MSG") {
				notification["success"]({
					message: data.notifications.message,
					duration: 0, // for prevent auto close notification, user need to close
				});
			}
		}
	};

	useEffect(() => {
		socket.on("track-stream", onTrackStream);
		socket.on("server", onServer);
		socket.on("overlay", onOverlay);
		socket.on("products", onProducts);
		socket.on("shopALook", onShopALook);
		socket.on("suggestions", onSuggestions);
		socket.on("recommendation", onRecommendation);
		socket.on("moreSearch", onMoreSearch);
		socket.on("notifications", onNotifications);

		return () => {
			socket.off("track-stream", onTrackStream);
			socket.off("server", onServer);
			socket.off("overlay", onOverlay);
			socket.off("products", onProducts);
			socket.off("shopALook", onShopALook);
			socket.off("suggestions", onSuggestions);
			socket.off("recommendation", onRecommendation);
			socket.off("moreSearch", onMoreSearch);
			socket.off("notifications", onNotifications);
		};
	}, []);

	return (
		<SocketContext.Provider
			value={{
				socket,
				sendSocketClientMessage,
				sendSocketClientShopALook,
				sendSocketClientDataExtractionRequest,
				sendSocketClientimageGenarate
			}}>
			{children}
		</SocketContext.Provider>
	);
};

export default ContextWrapper;
