import React, {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import { Select, Spin, Input, Button, Modal, message, Tooltip } from "antd";
import {
	Loading3QuartersOutlined,
	CloseOutlined,
	CloseCircleOutlined,
	PlusOutlined,
} from "@ant-design/icons";
import {
	clearSuggestionsSelectedAdditionalTag,
	removeSuggestionDataTag,
	setSuggestionsProductsFilters,
	setSuggestionsProductsIsLoading,
	setSuggestionsSelectedAdditionalTag,
} from "../../hooks/chat/redux/actions";
import {
	openWishlistModal,
	setIsCreateWishlist,
	setProductsToAddInWishlist,
} from "../wishlist/redux/actions";
import { handleRecProductClick } from "../recommendations/redux/actions";
import { openAutoCreateCollectionModal } from "../autoCreateCollectionModal/redux/actions";
import { useChat } from "../../hooks/chat/useChat";
import ProductCard from "../../components/ProductCard";
import ProductFiltersTags from "../productFilters/ProductFiltersTags";
import AdditionalAttributes from "../productFilters/AdditionalAttributes";
import { current_store_name, is_store_instance } from "../../constants/config";
import {
	filterAvailableProductList,
	isEmpty,
	removeEmptyItems,
	getTTid,
} from "../../helper/utils";
import {
	CHAT_TYPES_KEYS,
	COLLECTION_GENERATED_BY_IMAGE_BASED,
	COLLECTION_GENERATED_BY_SEARCH_BASED,
	COLLECTION_TYPE_CUSTOM_PLIST,
	FETCH_COLLECTIONS_PRODUCT_LIMIT,
} from "../../constants/codes";
import filterIcon from "../../images/filter_outline.svg";
import Cookies from "js-cookie";
import {
	getUserCollections,
	getwishlistUserCollection,
} from "../Auth/redux/actions";
import { addProductToWishlistCollection } from "../wishlistActions/addProductToWishlistCollection/redux/actions";
import {
	FaRegArrowAltCircleRight,
	FaRegArrowAltCircleLeft,
} from "react-icons/fa";
import { Swiper, SwiperSlide } from "swiper/react";
import SwiperCore, { FreeMode, Navigation } from "swiper";
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/navigation";
import WishListModal from "../wishlist/WishListModal";
import { useUserData } from "../../context/UserDataContext";
import { dispatchSelectedProductsAction } from "../shared/selectedProductsActions";
import SelectedProductsActionBar, {
	SELECTED_PRODUCTS_ACTIONS,
} from "../shared/SelectedProductsActionBar";
import singleCollectionStyles from "../../components/singleCollection/collectionDetails.module.scss";
import { useGuestPopup } from "../../context/GuestPopupContext";

SwiperCore.use([FreeMode, Navigation]);

const getPriceRangeText = (price) => {
	if (!isEmpty(price?.min) && !isEmpty(price?.max)) {
		return price.min + " - " + price.max;
	} else {
		return "";
	}
};


const AuraResponseProducts = ({
	products = {},
	recommendationsProducts = {},
	moreProducts = {},
	RecomTag,
	tag,
	suggestionsProducts,
	isTagEnabled = false,
	enableClickFetchRec,
	enableClickTracking,
	trackCollectionCampCode,
	trackCollectionId,
	trackCollectionName,
	trackCollectionICode,
	elementId,
	chatTypeKey,
	widgetHeader,
	widgetImage,
	allProductList,
	isAuraChatPage,
	localChatMessage,
	layoutMode,
	isMobile,
	registerSelectActions
}) => {
	const [
		authUser,
		isUserLogin,
		chatMessage,
		chatImageUrl,
		storeData,
		widgetHeaderRequest,
		chatHistory,
		selectedSearchOption,
		showWishlistModal,
		suggestionsTags,
		showChatLoader,
	] = useSelector((state) => [
		state.auth.user.data,
		state.auth.user.isUserLogin,
		state.chatV2.chatMessage,
		state.chatV2[CHAT_TYPES_KEYS[chatTypeKey].chatImageUrl],
		state.store.data,
		state.chatV2.widgetHeaderRequest,
		state.chatV2.chatHistory,
		state.chatV2.activeSearchOption || {},
		state.appState.wishlist.showWishlistModal,
		state.chatV2.suggestions?.selectedTag,
		state.chatV2[CHAT_TYPES_KEYS[chatTypeKey].showChatLoader],
	]);
  const {setUserData ,userData } = useUserData()
	const { openGuestPopup } = useGuestPopup();
const [notData,setNotData] = useState(null)

	const [filterOptionsVisible, setFilterOptionsVisible] = useState(false);
	const [enableSelectProduct, setEnableSelectProduct] = useState(false);
	const [selectedProducts, setSelectedProducts] = useState([]);
	const [customFilter, setCustomFilter] = useState([]);
	const [loadingStates, setLoadingStates] = useState({
		loading: false,
		loadingMore: false,
	});
	const [productsCache, setProductsCache] = useState({});
	const [pagination, setPagination] = useState({
		currentPages: {}, // Track page numbers per tag
		hasMore: {}, // Track hasMore per tag
	});
	const dispatch = useDispatch();
	const { sendMessage } = useChat();
	const guestActionRef = useRef(null);
	const addSelectedProductsToCollectionRef = useRef(null);
	const skipWishlistStateAfterGuestRef = useRef(false);
	const pendingWishlistProductAfterGuestRef = useRef(null);
	const checked = useRef([]);
// console.log('thisishtechecked',checked);

	const currentTag = tag === "" ? "all" : tag;
	const currentPage = pagination.currentPages[currentTag] || 0;
	const hasMore = pagination.hasMore[currentTag] !== false; // Default to true if not set

	const {
		show_filters = {},
		filters: productsFilters = {},
		isLoading = false,
	} = products;

	const { text: requestedText, image_url: requestedImageUrl } =
		widgetHeaderRequest;
	const { filter_settings = {}, catalog_attributes = [] } = storeData;
	const availableFilters = filter_settings.available_filters;
	const displayFilters = filter_settings.display_filters;
	const displayableFilter = useMemo(
		() => displayFilters.map((v) => v.key),
		[displayFilters]
	);

	const filters = useMemo(() => {
		const obj = { optional_filters: productsFilters.optional_filters || [] };
		displayableFilter.forEach((v) => {
			obj[v] = productsFilters[v];
		});
		return obj;
	}, [productsFilters, displayableFilter]);

	useEffect(() => {
		const optionalFilters = productsFilters.optional_filters || [];
		const keys = Object.keys(filters).filter(
			(key) => key !== "optional_filters" && filters[key] !== undefined
		);

		const result = keys?.filter((key) => optionalFilters?.includes(key)  && !notData?.includes(key) );
		// console.log('notData',notData);
		// console.log('resultssssss',result);
		
		checked.current = result;
	}, [productsFilters.optional_filters, filters]);

	useEffect(() => {
		if (Object.keys(productsFilters).length === 0) return;
		let hasChanges = false;
		let newOptionalFilters = [...(productsFilters.optional_filters || [])];

		displayableFilter.forEach((key) => {
			const value = productsFilters[key];
			const isNowEmpty = key === "price"
				? (!value || (!value.min && !value.max))
				: (!value || value.length === 0 || value === "");

			if (isNowEmpty) {
				if (!newOptionalFilters.includes(key)) {
					newOptionalFilters.push(key);
					hasChanges = true;
				}
			}
		});

		if (hasChanges) {
			dispatch(setSuggestionsProductsFilters(tag, {
				...productsFilters,
				optional_filters: newOptionalFilters,
			}));
		}
	}, [productsFilters, displayableFilter, dispatch, tag]);

	const isFiltersAvailable = useMemo(() => {
		const finalFilters = removeEmptyItems(filters);
		for (const key in finalFilters) {
			if (key !== "custom_filter") {
				return true;
			}
		}
		return false;
	}, [filters]);

	const hasVisibleFilters = useMemo(() => {
		const hasCustomFilter = !!filters.custom_filter;
		return currentTag !== 'all' || isFiltersAvailable || hasCustomFilter;
	}, [currentTag, isFiltersAvailable, filters.custom_filter]);

	const customFilterStoreData = useMemo(
		() => catalog_attributes.find((c) => c.key === "custom_filter"),
		[catalog_attributes]
	);

	const sendSocketMessage = (newFilters = {}, page = currentPage) => {
		const filtersToSubmit = { ...newFilters };

		filtersToSubmit.optional_filters = checked.current;

		if (Array.isArray(filtersToSubmit.custom_filter)) {
			filtersToSubmit.custom_filter = filtersToSubmit.custom_filter.join(",");
		}
		const finalFilters = removeEmptyItems(filtersToSubmit);
		sendMessage(requestedText || undefined, requestedImageUrl || undefined, {
			tags: currentTag === "all" ? [] : [tag],
			filters: !isEmpty(finalFilters) ? finalFilters : undefined,
			tag_map: show_filters.tag_map,
			show_filters,
			search_template: "",
			searchOptionId: "product_search",
			next_page: true,
			ipp: 15,
			current_page: page - 1,
			moreSearch_next_page: false,
			recommendationSearch_next_page: false,
		});
		dispatch(removeSuggestionDataTag({ tag, isRemoveTag: false }));
		handleResetSelectProduct();
	};

	const handleLoadMoreSubmit = (newFilters = {}) => {
		if (!currentTag || !hasMore || loadingStates.loadingMore) return;

		setLoadingStates((prev) => ({ ...prev, loadingMore: true }));

		const nextPage = currentPage + 1;
		setPagination((prev) => ({
			...prev,
			currentPages: {
				...prev.currentPages,
				[currentTag]: nextPage,
			},
		}));

		sendSocketMessage(newFilters, nextPage);
	};

	const handleSaveEditCustomFilter = (hashTags) => {
		const actualHashTags = hashTags && hashTags.custom_filter !== undefined ? hashTags.custom_filter : hashTags;
		const customFilterArrayToString = actualHashTags ? actualHashTags.toString() : "";
		dispatch(setSuggestionsProductsIsLoading(tag, true));
		handleChangeFilters({
			...filters,
			custom_filter: customFilterArrayToString || undefined,
		});

		setPagination(prev => ({
			...prev,
			currentPages: {
				...prev.currentPages,
				[currentTag]: 1,
			},
			hasMore: {
				...prev.hasMore,
				[currentTag]: true,
			},
		}));
		sendSocketMessage({
			...filters,
			custom_filter: customFilterArrayToString || undefined,
		}, 1);
	};

	const handleChangeFilters = (newFilters) => {
		dispatch(setSuggestionsProductsFilters(tag, newFilters));
	};


	const filtersToShow = useMemo(() => {
		const filters = displayFilters.map((filter) => {
			if (
				filter.key in availableFilters &&
				(filter.input_type === "multi_select" ||
					filter.input_type === "single_select")
			) {
				filter.display_value = availableFilters[filter.key];
			}
			return filter;
		});

		const hasCustomFilter = filters.some((f) => f.key === "custom_filter");
		if (!hasCustomFilter && customFilterStoreData?.is_display) {
			filters.push({
				key: "custom_filter",
				label: customFilterStoreData.label || "Hashtags",
				input_type: "multi_custom_input",
			});
		}

		return filters;
	}, [displayFilters, availableFilters, customFilterStoreData]);

	const onProductClick = () => {
		if (enableClickFetchRec && !enableSelectProduct) dispatch(handleRecProductClick());
	};

	const handleSuggestionAdditionalTagClick = (tag, additionalTag) => {
		dispatch(setSuggestionsSelectedAdditionalTag(tag, additionalTag));
	};

	const handleClearSuggestionAdditionalTagClick = (tag) => {
		dispatch(clearSuggestionsSelectedAdditionalTag(tag));
	};

	const chatProductsDataToShow = useMemo(() => {
		const product_lists = filterAvailableProductList(
			products.product_lists || []
		);
		return products.selectedAdditionalTag
			? product_lists.filter((p) =>
				p.tagged_by.includes(products.selectedAdditionalTag)
			)
			: product_lists;
	}, [
		products.product_lists,
		products.selectedAdditionalTag,
		authUser.user_name,
	]);

	const RecomChatProductsDataToShow = useMemo(() => {
		const product_lists = filterAvailableProductList(
			recommendationsProducts.product_lists || []
		);
		return recommendationsProducts.selectedAdditionalTag
			? product_lists.filter((p) =>
				p.tagged_by.includes(recommendationsProducts.selectedAdditionalTag)
			)
			: product_lists;
	}, [
		recommendationsProducts.product_lists,
		recommendationsProducts.selectedAdditionalTag,
		authUser.user_name,
	]);

	const moreProductsDataToShow = useMemo(() => {
		const product_lists = filterAvailableProductList(
			moreProducts.product_lists || []
		);
		return moreProducts.selectedAdditionalTag
			? product_lists.filter((p) =>
				p.tagged_by.includes(moreProducts.selectedAdditionalTag)
			)
			: product_lists;
	}, [
		moreProducts.product_lists,
		moreProducts.selectedAdditionalTag,
		authUser.user_name,
	]);

	const cachedProductsToRender = productsCache[currentTag] || [];
	const productsToRender = cachedProductsToRender.length
		? cachedProductsToRender
		: chatProductsDataToShow;
		console.log('productsToRender',productsToRender)
	const productsToRenderCodes = useMemo(
		() => productsToRender.map((product) => product.mfr_code).filter(Boolean),
		[productsToRender],
	);
	const hasProductsToRender = productsToRender.length > 0;
	const selectedProductsDataSource = useMemo(() => {
		const productMap = new Map();
		[
			...(allProductList || []),
			...productsToRender,
			...RecomChatProductsDataToShow,
			...moreProductsDataToShow,
		].forEach((product) => {
			if (product?.mfr_code) {
				productMap.set(product.mfr_code, product);
			}
		});
		return Array.from(productMap.values());
	}, [
		allProductList,
		productsToRender,
		RecomChatProductsDataToShow,
		moreProductsDataToShow,
	]);

	const enableFilters = useMemo(
		() =>
			(chatProductsDataToShow.length > 0 || !isEmpty(filters)) &&
			availableFilters &&
			!products.selectedAdditionalTag &&
			isTagEnabled,
		[
			chatProductsDataToShow.length,
			filters,
			availableFilters,
			products.selectedAdditionalTag,
			isTagEnabled,
		]
	);

	const enableCustomFilter = useMemo(
		() => customFilterStoreData?.is_display && enableFilters,
		[customFilterStoreData?.is_display, enableFilters]
	);

	const isTagProductsAllSelected = useMemo(() => {
		return (
			productsToRenderCodes.length > 0 &&
			productsToRenderCodes.every((mfrCode) =>
				selectedProducts.includes(mfrCode)
			)
		);
	}, [productsToRenderCodes, selectedProducts]);

	const isTagProductSelected = useMemo(() => {
		return productsToRenderCodes.some((mfrCode) =>
			selectedProducts.includes(mfrCode)
		);
	}, [productsToRenderCodes, selectedProducts]);

	const handleResetSelectProduct = useCallback(() => {
		setEnableSelectProduct(false);
		setSelectedProducts([]);
	}, []);

	const handleSetSelectedProducts = useCallback(
		({ add = [], remove = [] }) => {
			const allProducts = selectedProductsDataSource.map((p) => p.mfr_code);
			setSelectedProducts((currentSelectedProducts) => {
				const filteredRemoveProducts = [...currentSelectedProducts, ...add].filter(
					(p) => !remove.includes(p)
				);
				const uniqueSelectedProducts = filteredRemoveProducts.filter(
					(p, index) => filteredRemoveProducts.indexOf(p) === index
				);
				const nextSelectedProducts = uniqueSelectedProducts.filter((p) =>
					allProducts.includes(p)
				);

				if (
					nextSelectedProducts.length === currentSelectedProducts.length &&
					nextSelectedProducts.every((p, index) => p === currentSelectedProducts[index])
				) {
					return currentSelectedProducts;
				}

				return nextSelectedProducts;
			});
		},
		[selectedProductsDataSource]
	);

	useEffect(() => {
		if (selectedProducts) {
			handleSetSelectedProducts({});
		}
	}, [handleSetSelectedProducts, selectedProducts]);

	// Update the useEffect that handles cache updates:
	useEffect(() => {
		if (currentTag && chatProductsDataToShow.length > 0) {
			setProductsCache((prev) => {
				const existingProducts = prev[currentTag] || [];
				let mergedProducts = [];

				// For first page or tag change, replace existing products
				if (currentPage === 1 || !prev[currentTag]) {
					mergedProducts = [...chatProductsDataToShow];
				} else {
					// For subsequent pages, merge and avoid duplicates
					const productMap = new Map(
						existingProducts.map((p) => [p.mfr_code, p])
					);
					chatProductsDataToShow.forEach((p) => productMap.set(p.mfr_code, p));
					mergedProducts = Array.from(productMap.values());
				}

				return {
					...prev,
					[currentTag]: mergedProducts,
					hasMore: {
						...prev.hasMore,
						[currentTag]: chatProductsDataToShow.length >= 15,
					},
				};
			});

			// Preserve selected products when new products are loaded
			setSelectedProducts((prevSelected) => {
				const newSelected = [...prevSelected];
				// Add any new products that were previously selected
				chatProductsDataToShow.forEach((product) => {
					if (
						prevSelected.includes(product.mfr_code) &&
						!newSelected.includes(product.mfr_code)
					) {
						newSelected.push(product.mfr_code);
					}
				});
				return newSelected;
			});

			setLoadingStates((prev) => ({ loading: false, loadingMore: false }));
		}
	}, [chatProductsDataToShow, currentTag, currentPage]);

	useEffect(() => {
		if (currentTag && !pagination.currentPages[currentTag]) {
			setPagination((prev) => ({
				...prev,
				currentPages: {
					...prev.currentPages,
					[currentTag]: 1,
				},
				hasMore: {
					...prev.hasMore,
					[currentTag]: true,
				},
			}));
		}
	}, [currentTag]);

	const onSelectProductClick = (mfr_code) => {
		setEnableSelectProduct(true);
		setSelectedProducts((prev) => {
			if (prev.includes(mfr_code)) {
				return prev.filter((code) => code !== mfr_code);
			} else {
				return [...prev, mfr_code];
			}
		});
	};

	const onSelectAllChange = useCallback(() => {
		if (!isTagProductsAllSelected) {
			setSelectedProducts((prevSelected) => [
				...new Set([...prevSelected, ...productsToRenderCodes]),
			]);
			setEnableSelectProduct(true);
		} else {
			const productsToRenderCodeSet = new Set(productsToRenderCodes);
			setSelectedProducts((prevSelected) =>
				prevSelected.filter((mfrCode) => !productsToRenderCodeSet.has(mfrCode))
			);
		}
	}, [isTagProductsAllSelected, productsToRenderCodes]);

	const handleSaveOrShareClick = () => {
		onSelectAllChange();
		setEnableSelectProduct(true);
	};

	const selectedProductsActions = useMemo(
		() => [
			...(is_store_instance ? [SELECTED_PRODUCTS_ACTIONS.SAVE] : []),
			{
				key: SELECTED_PRODUCTS_ACTIONS.WISHLIST,
				title: "Add selected products to wishlist",
			},
			{
				key: SELECTED_PRODUCTS_ACTIONS.CART,
				title: "Add selected products to cart",
			},
			{
				key: SELECTED_PRODUCTS_ACTIONS.SHARE,
				title: "Select products and share published collection",
			},
		],
		[],
	);

	const handleGuestSkip = useCallback(() => {
		if (guestActionRef.current === "share") {
			addSelectedProductsToCollectionRef.current?.(null, {
				isShare: true,
				isSkip: true,
			});
		}
	}, []);

	const handleGuestSuccess = useCallback(
		({ userId, response }) => {
			if (guestActionRef.current === "share") {
				const registeredUser = response?.data?.data;
				if (registeredUser?.user_id) {
					setUserData(registeredUser);
				}
				addSelectedProductsToCollectionRef.current?.(null, {
					isShare: true,
					isGuestSubmit: true,
					userId,
					autoLoginUser: registeredUser,
				});
			} else if (guestActionRef.current === "save") {
				addSelectedProductsToCollectionRef.current?.(null, {
					isSave: true,
					isGuestSubmit: true,
					userId,
				});
			} else if (["cart", "wishlist"].includes(guestActionRef.current)) {
				addSelectedProductsToCollectionRef.current?.(null, {
					action: guestActionRef.current,
					isGuestSubmit: true,
					userId,
				});
			}
		},
		[setUserData],
	);

	const onAddSelectedProductsToCollection = useCallback(
		(e =null,options ={}) => {
			const { action = "", isSave = false, isShare = false, isSkip = false, isGuestSubmit = false,userId = null, autoLoginUser = null, product: productToAdd = null, skipWishlistStateAfterGuest = false } = options;

			if (e?.preventDefault) {
				e?.preventDefault();
				e?.stopPropagation();
			}

			const isUserLoginCokkies = Cookies.get("isGuestLoggedIn") === "true";
			const isReusableSelectedProductsAction = ["cart", "wishlist"].includes(action);
			guestActionRef.current = isSave ? "save" : isShare ? "share" : action;
			if (!isGuestSubmit) {
				skipWishlistStateAfterGuestRef.current = !!skipWishlistStateAfterGuest;
				pendingWishlistProductAfterGuestRef.current = skipWishlistStateAfterGuest
					? productToAdd
					: null;
			}

			const isSkipPopUp = isSkip && guestActionRef.current === "share";

			if ( isShare && !isSkipPopUp && !isGuestSubmit) {
				const pendingGuestAction = guestActionRef.current;
				openGuestPopup({
					action: pendingGuestAction,
					storeName: current_store_name,
					refreshUserInfo: false,
					waitForAuth: false,
					onSuccess: handleGuestSuccess,
					onSkip: handleGuestSkip,
				});
				return;
			}
			else if ((isSave || isReusableSelectedProductsAction) && !isUserLogin && !isUserLoginCokkies && !isGuestSubmit) {
				const pendingGuestAction = guestActionRef.current;
				openGuestPopup({
					action: pendingGuestAction,
					storeName: current_store_name,
					refreshUserInfo: true,
					onSuccess: handleGuestSuccess,
				});
				return;
			}

			const productForWishlist = productToAdd || pendingWishlistProductAfterGuestRef.current;
			const SelectedProductsData = productForWishlist?.mfr_code
				? [productForWishlist]
				: selectedProductsDataSource.filter((p) =>
					selectedProducts.includes(p.mfr_code)
				);

			let data = { tags: [], tagged_show_filters: {}, keyword_tag_map: {} };

			SelectedProductsData?.forEach((prod) => {
				const tag = prod?.tagged_by[0];
				if (!data.tags.includes(tag)) {
					data.tags.push(tag);
				}
			});

			data.tags.map((t) => {
				data.keyword_tag_map[t] = suggestionsProducts[t]?.filters;
				data.tagged_show_filters[t] = suggestionsProducts[t]?.show_filters;
			});

			const createWishlistData = {
				collection_name: chatMessage || "",
				description: widgetHeader || "",
				cover_image: widgetImage || chatImageUrl || "",
				image_url: widgetImage || chatImageUrl || "",
				product_lists: SelectedProductsData || [],
				shareAutoLoginUser: isShare ? autoLoginUser : null,
				generated_by: widgetImage
					? COLLECTION_GENERATED_BY_IMAGE_BASED
					: COLLECTION_GENERATED_BY_SEARCH_BASED,
				...data,
				user_id:userId || userData?.user_id || authUser?.user_id
			};

			if (isReusableSelectedProductsAction) {
				const actionUserId = userId || userData?.user_id || authUser?.user_id || getTTid();
				const isHandledSelectedProductsAction = dispatchSelectedProductsAction({
					action,
					dispatch,
					products: SelectedProductsData,
					selectedProducts,
					userId: actionUserId,
					source: "SEARCH",
					onComplete: handleResetSelectProduct,
					store_name: storeData?.store_name ,
				});

				if (isHandledSelectedProductsAction) {
					return;
				}
			}

			if (isSave) {
				if (isGuestSubmit && skipWishlistStateAfterGuestRef.current) {
					skipWishlistStateAfterGuestRef.current = false;
					pendingWishlistProductAfterGuestRef.current = null;
					const selectedProduct = SelectedProductsData[0];
					const loginUserId = userId || userData?.user_id || authUser?.user_id;

					if (selectedProduct?.mfr_code && loginUserId) {
						dispatch(
							addProductToWishlistCollection({
								mfr_code: selectedProduct.mfr_code,
								product_name: selectedProduct.name,
								product_image: selectedProduct.image,
								store:  storeData?.store_name || "dothelook",
								user_id: loginUserId,
								eventId: storeData?.event_id,
								successMessage: "Product added to wishlist successfully!",
								errorMessage:
									"Failed to add product to wishlist. Please try again.",
								callback: () => {
									dispatch(
										getwishlistUserCollection({
											path: `my_wishlist_${loginUserId}`,
										}),
									);
								},
							}),
						);
					}

					handleResetSelectProduct();
					return;
				}

				dispatch(
					setProductsToAddInWishlist(SelectedProductsData, {
						...createWishlistData,
					})
				);
				dispatch(openWishlistModal());
				// if (isUserLoginCokkies) {
				// 	dispatch(setIsCreateWishlist(true));
				// }
			} else if (isShare) {

				dispatch(
					openAutoCreateCollectionModal({
						...createWishlistData,
						isShareCollectionEnable: true,
					})
				);
			}

			handleResetSelectProduct();
		},
		[
			isUserLogin,
			selectedProducts,
			selectedProductsDataSource,
			suggestionsProducts,
			chatMessage,
			widgetHeader,
			widgetImage,
			authUser?.user_id,
			chatImageUrl,
			dispatch,
			handleResetSelectProduct,
			handleGuestSkip,
			handleGuestSuccess,
			openGuestPopup,
			storeData?.event_id,
			storeData?.store_name,
			userData?.user_id,
		]
	);
	addSelectedProductsToCollectionRef.current = onAddSelectedProductsToCollection;

	const handleSelectedProductsAction = useCallback(
		(item, e) => {
			if (!selectedProducts.length) return;

			if (item.key === SELECTED_PRODUCTS_ACTIONS.SAVE) {
				onAddSelectedProductsToCollection(e, { isSave: true });
				return;
			}

			if (item.key === SELECTED_PRODUCTS_ACTIONS.SHARE) {
				onAddSelectedProductsToCollection(e, { isShare: true });
				return;
			}

			onAddSelectedProductsToCollection(e, { action: item.key });
		},
		[selectedProducts.length, onAddSelectedProductsToCollection],
	);

	const onFiltersChange = (name, value) => {
		const newFilters = { ...filters, [name]: value };
		// console.log('newOptionalFilters',newFilters);

		let newOptionalFilters = newFilters.optional_filters || [];

		const isNowEmpty = name === "price"
			? (!value || (!value.min && !value.max))
			: (!value || value.length === 0 || value === "");

		if (isNowEmpty) {
			if (!newOptionalFilters.includes(name)) {
				newOptionalFilters = [...newOptionalFilters, name];
			}
		} else {
			if (newOptionalFilters.includes(name)) {
				newOptionalFilters = newOptionalFilters.filter((n) => n !== name);
			}
		}
				// console.log('newOptional ',newOptionalFilters);

setNotData(newOptionalFilters)
		newFilters.optional_filters = newOptionalFilters;
		handleChangeFilters(newFilters);
	};

	const handleFiltersSubmit = (
		newFilters = {},
		filterOptionsVisible = false
	) => {


		handleChangeFilters(newFilters);
		dispatch(setSuggestionsProductsIsLoading(tag, true));
		setFilterOptionsVisible(filterOptionsVisible);
		setPagination(prev => ({
			...prev,
			currentPages: {
				...prev.currentPages,
				[currentTag]: 1,
			},
			hasMore: {
				...prev.hasMore,
				[currentTag]: true,
			},
		}));
		sendSocketMessage(newFilters, 1); // Always reset to page 1 when applying new filters
	};

	const handleFiltersInputClear = (name, value) => {
		handleFiltersSubmit({ ...filters, [name]: value }, filterOptionsVisible);
	};

	const handleFiltersOptionalChange = (name, isChecked) => {
		const filtersWithValues = removeEmptyItems(filters);
		const keys = Object.keys(filtersWithValues).filter(
			(key) => key !== "optional_filters" && filters[key] !== undefined
		);
		// console.log('keys',name);
		
		const optionalFilters = filters.optional_filters || [];
		const checkedFilters = keys.filter((key) => !optionalFilters.includes(key));
		const nextCheckedFilters = isChecked
			? [...checkedFilters.filter((key) => key !== name), name]
			: checkedFilters.filter((key) => key !== name);
		const result = keys?.filter((key) => !nextCheckedFilters?.includes(key));
		// console.log('result', result);

		checked.current = result;
		
		handleChangeFilters({
			...filters,
			optional_filters: result,
		});
	};

	const handleClearFiltersClick = async () => {
		handleFiltersSubmit({}, false);
	};

	const handleCustomFilterChange = (customFilter) => {
		const removedHash = customFilter.map((item) => item.replaceAll("#", ""));
		setCustomFilter(removedHash);
	};

	const checkAndShowContainer = useCallback(
		() => {
			// setShowCustomFilterInput(isShowCustomFilterInput);
		},
		[]
	);

	useEffect(() => {
		if (isAuraChatPage) {
			if (showWishlistModal) {
				// Always call API when wishlist popup opens
				dispatch(
					getUserCollections({
						product_limits: FETCH_COLLECTIONS_PRODUCT_LIMIT,
						summary: true,
					})
				);
			}
		}
	}, [showWishlistModal, isAuraChatPage]);

	useEffect(() => {
		if (registerSelectActions) {
			registerSelectActions({
				enableSelectProduct,
				selectedProducts,
				chatProductsDataToShow: productsToRender,
				isTagProductSelected,
				isTagProductsAllSelected,
				is_store_instance,
				handleResetSelectProduct,
				setEnableSelectProduct,
				onSelectAllChange,
				onAddSelectedProductsToCollection,
			});
		}
		return () => {
			if (registerSelectActions) {
				registerSelectActions(null);
			}
		};
	}, [
		enableSelectProduct,
		selectedProducts,
		productsToRender,
		isTagProductSelected,
		isTagProductsAllSelected,
		is_store_instance,
		handleResetSelectProduct,
		onSelectAllChange,
		onAddSelectedProductsToCollection,
		registerSelectActions,
	]);

	const isCurrentTagLoading = (tag && !suggestionsProducts?.[tag]) || ((isLoading || showChatLoader) && !hasProductsToRender);

	return (
		<>
			<div id={elementId} style={{ minHeight: "85vh" }}>
				<div className="flex-1 min-w-0 px-1 ">
					{!isCurrentTagLoading ? (
						<>
							{enableFilters ? (
								<div className={hasVisibleFilters ? "mb-4 md:mb-5" : ""}>
									<ProductFiltersTags
										//to hide the optional filters from meta filtersTags
										productFilters={(() => {
											const active = { ...filters };
											if (Array.isArray(active.optional_filters)) {
												active.optional_filters.forEach((key) => {
													delete active[key];
												});
											}
											return active;
										})()}
										handleFiltersInputClear={handleFiltersInputClear}
										handleClearFiltersClick={handleClearFiltersClick}
										displayFilters={filtersToShow.filter(f => f.key !== 'custom_filter')}
										isShowCustomFilter={true}
										isShowHashtagButton={false}
										handleSaveEditCustomFilter={handleSaveEditCustomFilter}
										tagThemeClassName={"border border-[#334155] text-[#334155] text-base py-0.5 px-3 rounded-full shadow-sm"}
										clearFiltersThemeClassName={"text-[#334155]"}
										handleFilterOptionsVisibleChange={currentTag === 'all' ? undefined : setFilterOptionsVisible}
										filterOptionsVisible={filterOptionsVisible}
									/>
								</div>
							) : null}


							{chatProductsDataToShow.length  ? (
								<div
									className={`${singleCollectionStyles.selectBarRow} ${
										enableSelectProduct
											? singleCollectionStyles.selectBarRowWithCol
											: singleCollectionStyles.selectBarRowDefault
									} mb-5`}
								>
									<div className={singleCollectionStyles.selectBarLeft}>
									{enableSelectProduct ? (
										<SelectedProductsActionBar
											actions={selectedProductsActions}
											selectedCount={selectedProducts.length}
											isSelectMode={enableSelectProduct}
											isIndeterminate={
												isTagProductSelected &&
												!isTagProductsAllSelected
											}
											isAllSelected={isTagProductsAllSelected}
											onSelectAllChange={onSelectAllChange}
											onCancel={handleResetSelectProduct}
											onAction={handleSelectedProductsAction}
											classNames={{
												wrapper: singleCollectionStyles.selectCheckRow,
												checkboxWrapper: singleCollectionStyles.selectCheckBorder,
												checkbox: `${singleCollectionStyles.checkboxText} checkbox_singleCollection`,
												dropdownActive: singleCollectionStyles.addToTextActive,
												dropdownDisabled: singleCollectionStyles.addToTextDisabled,
												dropdownButton: `${singleCollectionStyles.addToText} ${singleCollectionStyles.addToMenuButton}`,
												dropdownIcon: singleCollectionStyles.addToMenuIcon,
												cancelText: singleCollectionStyles.cancelText,
											}}
										/>
									) : (
										<SelectedProductsActionBar
											isSelectMode={enableSelectProduct}
											onStartSelect={() => setEnableSelectProduct(true)}
											labels={{
												selectTitle: "Click and select multiple products",
											}}
											classNames={{
												selectButton: singleCollectionStyles.addToCollectionBtn,
												selectButtonRole: "link",
											}}
										/>
									)}
									</div>
								</div>
							) : null}
						</>
					) : null}
					{(isLoading || showChatLoader) && !hasProductsToRender ? (
						<div className="flex flex-col items-center justify-center w-full py-20 gap-4 animate-pulse">
							<Spin
								indicator={
									<Loading3QuartersOutlined
										style={{ fontSize: 36, color: 'var(--color-secondary)' }}
										spin
									/>
								}
							/>
							<span className="text-secondary font-semibold text-sm tracking-wide">
								Searching products...
							</span>
						</div>
					) : (
						<> 
							<div
								id='chat_products_inner_content'
								className={`grid grid-cols-2 gap-2 sm:gap-3 p-1 ${selectedSearchOption?.id === "product_search"
										? "md:grid-cols-3 lg:grid-cols-4"
										: layoutMode === "both"
											? 'md:grid-cols-3'
											: 'md:grid-cols-3 lg:grid-cols-4'
									}`}>
								{productsToRender.map((product) => (
									<ProductCard
										key={product.mfr_code}
										product={product}
										onProductClick={onProductClick}
										selectedSearchOption={selectedSearchOption}
										enableClickTracking={enableClickTracking}
										productClickParam={{
											iCode: authUser.influencer_code,
											campCode: trackCollectionCampCode,
											collectionId: trackCollectionId,
											collectionName: trackCollectionName,
											collectionICode: trackCollectionICode,
										}}
										// hideAddToWishlist={
										// 	(is_store_instance && !isUserLogin) || isAuraChatPage
										// }
										hideAddToWishlist={is_store_instance && !isUserLogin}
										enableSelect={enableSelectProduct}
										isSelected={selectedProducts.includes(product.mfr_code)}
										setSelectValue={() => onSelectProductClick(product.mfr_code)}
										wishlistGeneratedBy={
											widgetImage
												? COLLECTION_GENERATED_BY_IMAGE_BASED
												: COLLECTION_GENERATED_BY_SEARCH_BASED
										}
										localChatMessage={localChatMessage}
										onAddSelectedProductsToCollection={onAddSelectedProductsToCollection}
										source="SEARCH"

									/>
								))}
							</div>

							{RecomChatProductsDataToShow.length ? (
								<>
									<div className="flex justify-between items-center mt-8 mb-8">
										<div className="font-bold text-xl md:text-2xl leading-8">
											Recommendations
										</div>
										<div className="flex gap-2">
											<button id='custom-prev' className="text-2xl p-1 rounded-md cursor-pointer bg-transparent hover:opacity-70 md:text-3xl">
												<FaRegArrowAltCircleLeft />
											</button>
											<button id='custom-next' className="text-2xl p-1 rounded-md cursor-pointer bg-transparent hover:opacity-70 md:text-3xl">
												<FaRegArrowAltCircleRight />
											</button>
										</div>
									</div>

									<Swiper
										slidesPerView={"auto"}
										spaceBetween={window.innerWidth <= 1024 ? 10 : 16}
										freeMode={true}
										modules={[FreeMode, Navigation]}
										navigation={{
											nextEl: "#custom-next",
											prevEl: "#custom-prev",
										}}
										className='mySwiper' style={{ padding: 0 }}>
										{RecomChatProductsDataToShow.map((product) => (
											<SwiperSlide
												key={product.mfr_code}
												style={{ width: "auto" }}>
												<ProductCard
													key={product.mfr_code}
													product={product}
													onProductClick={onProductClick}
													selectedSearchOption={selectedSearchOption}
													enableClickTracking={enableClickTracking}
													productClickParam={{
														iCode: authUser.influencer_code,
														campCode: trackCollectionCampCode,
														collectionId: trackCollectionId,
														collectionName: trackCollectionName,
														collectionICode: trackCollectionICode,
													}}
													// hideAddToWishlist={
													// 	(is_store_instance && !isUserLogin) || isAuraChatPage
													// }
													hideAddToWishlist={is_store_instance && !isUserLogin}
													enableSelect={enableSelectProduct}
													isSelected={selectedProducts.includes(product.mfr_code)}
													setSelectValue={() =>
														onSelectProductClick(product.mfr_code)
													}
													wishlistGeneratedBy={
														widgetImage
															? COLLECTION_GENERATED_BY_IMAGE_BASED
															: COLLECTION_GENERATED_BY_SEARCH_BASED
													}
													localChatMessage={localChatMessage}
													onAddSelectedProductsToCollection={onAddSelectedProductsToCollection}
										source="SEARCH"

												/>
											</SwiperSlide>
										))}
									</Swiper>
								</>
							) : (
								""
							)}

							{moreProductsDataToShow.length ? (
								<>
									<div className="flex justify-between items-center mt-8 mb-8">
										<div className="font-bold text-xl md:text-2xl leading-8">More Results</div>
										<div className="flex gap-2">
											<button id='more-prev' className="text-2xl p-1 rounded-md cursor-pointer bg-transparent hover:opacity-70 md:text-3xl">
												<FaRegArrowAltCircleLeft />
											</button>
											<button id='more-next' className="text-2xl p-1 rounded-md cursor-pointer bg-transparent hover:opacity-70 md:text-3xl">
												<FaRegArrowAltCircleRight />
											</button>
										</div>
									</div>

									<Swiper
										slidesPerView={"auto"}
										spaceBetween={window.innerWidth <= 1024 ? 10 : 16}
										freeMode={true}
										modules={[FreeMode, Navigation]}
										navigation={{
											nextEl: "#more-next",
											prevEl: "#more-prev",
										}}
										className='mySwiper' style={{ padding: 0 }}>
										{moreProductsDataToShow.map((product) => (
											<SwiperSlide
												key={product.mfr_code}
												style={{ width: "auto" }}>
												<ProductCard
													key={product.mfr_code}
													product={product}
													onProductClick={onProductClick}
													selectedSearchOption={selectedSearchOption}
													enableClickTracking={enableClickTracking}
													productClickParam={{
														iCode: authUser.influencer_code,
														campCode: trackCollectionCampCode,
														collectionId: trackCollectionId,
														collectionName: trackCollectionName,
														collectionICode: trackCollectionICode,
													}}
													// hideAddToWishlist={
													// 	(is_store_instance && !isUserLogin) || isAuraChatPage
													// }
													hideAddToWishlist={is_store_instance && !isUserLogin}
													enableSelect={enableSelectProduct}
													isSelected={selectedProducts.includes(product.mfr_code)}
													setSelectValue={() =>
														onSelectProductClick(product.mfr_code)
													}
													wishlistGeneratedBy={
														widgetImage
															? COLLECTION_GENERATED_BY_IMAGE_BASED
															: COLLECTION_GENERATED_BY_SEARCH_BASED
													}
													localChatMessage={localChatMessage}
													onAddSelectedProductsToCollection={onAddSelectedProductsToCollection}
										source="SEARCH"

												/>
											</SwiperSlide>
										))}
									</Swiper>
								</>
							) : (
								""
							)}

							{chatProductsDataToShow.length >= 15 && (
								<div className="flex justify-center mt-8">
									<button
										className="bg-gradient-to-r from-brand to-secondary text-white px-5 py-2 rounded-md shadow-md font-medium hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
										onClick={() => {
											setLoadingStates((prev) => ({
												...prev,
												loadingMore: true,
											}));

											setTimeout(() => {
												handleLoadMoreSubmit(filters); // Actual data fetch
											}, 1000);
										}}
										disabled={loadingStates.loadingMore}>
										{loadingStates.loadingMore ? "Loading..." : "Load More"}
									</button>
								</div>
							)}
						</>
					)}
				</div>

				{enableFilters && (
					<Modal
						className="[&_.ant-modal-content]:!bg-[#f1f5f9] [&_.ant-modal-header]:!bg-transparent [&_.ant-modal-footer]:!bg-transparent"
						title={
							<div className="flex justify-between items-center w-full pr-8">
								<h4 className="text-gray-800 text-lg font-bold">Filter Products</h4>
								{isFiltersAvailable ? (
									<p
										className="text-brand text-sm font-medium cursor-pointer opacity-90 hover:opacity-100 hover:underline"
										role='button'
										onClick={handleClearFiltersClick}>
										Clear All
									</p>
								) : null}
							</div>
						}
						open={filterOptionsVisible}
						onCancel={() => setFilterOptionsVisible(false)}
						footer={[
							<button
								key="submit"
								className="bg-gradient-to-r from-brand to-secondary text-white rounded-md px-4 py-1 shadow-sm font-medium"
								onClick={() => handleFiltersSubmit(filters, false)}>
								Apply Filters
							</button>
						]}
						width={550}
						centered
						destroyOnClose
					>
						<div className="max-h-[60vh] overflow-y-auto pr-2">
							<AdditionalAttributes
								additionalAttributesToShow={filtersToShow}
								attributesData={filters}
								handleAdditionalAttributesChange={onFiltersChange}
								handleFiltersOptionalChange={handleFiltersOptionalChange}
								gridClassName="grid-cols-1 md:grid-cols-2 gap-4 pb-2"
								fontSizeTheme="text-sm"
								fontColorTheme="text-[#4c5672] font-medium"
								selectBoxSize="default"
							/>
						</div>
					</Modal>
				)}
			</div>
			{isAuraChatPage && <WishListModal />}
		</>
	);
};

export default AuraResponseProducts;
