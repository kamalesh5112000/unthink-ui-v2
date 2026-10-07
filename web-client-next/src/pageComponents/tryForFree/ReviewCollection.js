import React, {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
	useContext,
} from "react";
import style from './tryForFree.module.scss'
import { useDispatch, useSelector } from "react-redux";
import Link from 'next/link';
import { useRouter } from "next/router";
import { useNavigate } from "../../helper/useNavigate";
import {
	Spin,
	Select,
	Tooltip,
	Slider,
	Checkbox,
	Modal,
	Alert,
	Divider,
	Popover,
	notification,
	Button,
	Input,
	Dropdown,
	Menu,
} from "antd";
import {
	Loading3QuartersOutlined,
	InfoCircleOutlined,
	ShoppingCartOutlined,
	CloseCircleOutlined,
	ArrowLeftOutlined,
	// DownloadOutlined,
	CheckCircleOutlined,
	LoadingOutlined,
	CloseOutlined,
	PlusOutlined,
	DownOutlined,
} from "@ant-design/icons";
import Cookies from "js-cookie";

// import AuthHeader from "../AuthHeader";
import ReviewCollectionPlist from "./ReviewCollectionPlist";
// import PublishingOptionsDropdown from "./PublishingOptionsDropdown";
import ReviewCollectionStepsUI from "./ReviewCollectionStepsUI";
import { ProductFilters } from "../productFilters/ProductFilters";
import ProductFiltersTags from "../productFilters/ProductFiltersTags";
// productFilters.module.scss removed; theme passed as Tailwind classes
import AskQuestionComponent from "../../components/AskQuestionComponent/AskQuestionComponent";
import {
	getSingleUserCollection,
	getUserCollection,
	getUserCollections,
	getUserInfo,
	replaceAndUpdateUserCollectionData,
} from "../Auth/redux/actions";
import { updateWishlist } from "../wishlistActions/updateWishlist/redux/actions";
import {
	removeFromWishlist,
	removeFromWishlistReset,
} from "../wishlistActions/removeFromWishlist/redux/actions";
import {
	collectionPageAPIs,
	collectionProductsExportCsvURL,
	profileAPIs,
	// realtimeAiAPIs,
} from "../../helper/serverAPIs";
import useWindowSize from "../../helper/useWindowSize";
import {
	addToWishlist,
	addToWishlistReset,
} from "../wishlistActions/addToWishlist/redux/actions";
import {
	applyWishlistProductsFilter,
	applyWishlistProductsFilterReset,
} from "../wishlistActions/applyWishlistProductsFilter/redux/actions";
import { deleteWishlist } from "../wishlistActions/deleteWishlist/redux/actions";
import {
	openWishlistModal,
	setProductsToAddInWishlist,
} from "../wishlist/redux/actions";
import { useChat } from "../../hooks/chat/useChat";
import {
	checkIsFavoriteCollection,
	filterAvailableProductList,
	filterProductList,
	filterProductListBySelectedTags,
	getBlogCollectionPagePath,
	getCollectionDefaultDescription,
	getTagMapTagsBySelectedTags,
	getCollectionNameToShow,
	isEmpty,
	numCeil,
	numFloor,
	isValidNumber,
	removeEmptyItems,
	productCountToShow,
	AdminCheck,
	// getIsSellerLoggedIn,
} from "../../helper/utils";

import {
	COLLECTION_GENERATED_BY_BLOG_BASED,
	COLLECTION_GENERATED_BY_DESC_BASED,
	COLLECTION_GENERATED_BY_VIDEO_BASED,
	COLLECTION_GENERATED_BY_IMAGE_BASED,
	COLLECTION_GENERATED_BY_SEARCH_BASED,
	COLLECTION_GENERATED_BY_MY_PRODUCTS_BASED,
	COLLECTION_PRODUCTS_FETCH_IPP,
	COOKIE_ENABLED_FEATURES,
	COOKIE_FEATURE_CATEGORY_TAGS,
	COOKIE_FEATURE_FETCH_MORE,
	FETCH_COLLECTIONS_PRODUCT_LIMIT,
	IN_PROGRESS,
	PATH_ROOT,
	PATH_STORE,
	PUBLISHED,
	PUBLISHING_OPTION_EXPORT_PRODUCTS_CSV,
	PUBLISHING_OPTION_PAGE,
	STORE_USER_NAME_BUDGETTRAVEL,
	TAGS_TITLE,
	WISHLIST_TITLE,
	STORE_USER_NAME_SAMSKARA,
	PRODUCT_SORT_OPTIONS,
	EDIT_ACTION,
} from "../../constants/codes";
import {
	adminUserId,
	auraYfretUserCollBaseUrl,
	is_store_instance,
	isStagingEnv,
	super_admin,
	current_store_name,
} from "../../constants/config";

// import waiting_avatar from "../../images/videos/waiting_avatar.gif";
// import completed_avatar from "../../images/videos/completed_avatar.gif";
import Image from "next/image";
import filterIcon from "../../images/filter_outline.svg";

import styles from './tryForFree.module.scss';
import UploadMultiProductsModal from "../uploadMultiProductsModal";
import { CustomFilter } from "../customFilter/CustomFilter";
import AdditionalAttributes from "../productFilters/AdditionalAttributes";
import CollectionEditTags from "../collectionEditTags/CollectionEditTags";
import { SocketContext } from "../../context/socketV2";
import { setOverlayCoordinates, setShowChatModal } from "../../hooks/chat/redux/actions";
import ReviewCollectionContainerWrapper from "./ReviewCollectionContainerWrapper";
import FilterIconEdit from "../../images/Filter-icon.svg"

import dynamic from "next/dynamic";

const ReviewCollectionStepHelp = dynamic(() => import("./ReviewCollectionStepHelp"), {
	ssr: false,
	loading: () => (
		<div className={styles.centeredFlex}>
			<Spin />
		</div>
	),
});
const ReviewCollectionStepContent = dynamic(
	() => import("./ReviewCollectionStepContent"),
	{
		ssr: false,
		loading: () => (
			<div className={styles.centeredFlex}>
				<Spin />
			</div>
		),
	}
);
const ReviewCollectionStepPublish = dynamic(
	() => import("./ReviewCollectionStepPublish"),
	{
		ssr: false,
		loading: () => (
			<div className={styles.centeredFlex}>
				<Spin />
			</div>
		),
	}
);

const { Option } = Select;

const defaultFilters = {
	// gender: [],
	// age_group: [],
	// discount: [],
	// brand: [],
	// color: [],
	// occasion: [],
	// custom_filter: "",
	// price: null,
	// material: [],
	// pattern: [],
	// style: [],
	// optional_filters: [],
	// priceRange: [0, 0],
	// product_brand: [],
};

let collectionDetailsSaveRequired = false; // handled flag to call the update API if something updated in form
let multiProductsSelectionMessage = ""; // message to show the suggestion for how to select multiple product using tab and space

export const STEPS = {
	HELP: "HELP",
	CONTENT: "CONTENT",
	PRODUCTS: "PRODUCTS",
	PUBLISH: "PUBLISH",
};

const LoadingIndicator = () => {
	return (
		<div className={styles.centeredFlex}>
			<Spin />
		</div>
	);
};

const defaultIsTagEdited = {
	isEdited: false,
	added: [],
	deleted: [],
	latest: [],
	isAdditionalTagsEdited: false,
	additionalTagsAdded: [],
	additionalTagsDeleted: [],
	additionalTagsLatest: [],
};

const getDefaultSettings = () => ({
	optional_filters: [],
	price: { min: "", max: "" },
});

const prepareSettingsFromAI_filters = (aiFilters) => ({
	...aiFilters,
	age_group:
		typeof aiFilters?.age_group === "string"
			? [aiFilters.age_group]
			: aiFilters.age_group,
	gender:
		typeof aiFilters?.gender === "string"
			? [aiFilters.gender]
			: aiFilters.gender,
});

// export const getPriceRangeMinMax = (show_filters) => {
// 	const price = show_filters?.price;

// 	if (price) {
// 		let min = +(price?.min || 0);
// 		let max = +(price?.max || 0);
// 		if (price && min < max) {
// 			const roundNum = max - min > 100 ? 10 : 5;
// 			return [numFloor(min, roundNum), numCeil(max, roundNum)];
// 		}
// 	}

// 	return [0, 0];
// };

const ReviewCollection = (props) => {
	const navigate = useNavigate();
	const [collectionsFetched, setCollectionsFetched] = useState(false); // to make sure that collections are fetched
	const [isFetchAttributesInProgress, setFetchAttributesInProgress] =
		useState(false);
	const [isFetchProductsInProgress, setFetchProductsInProgress] =
		useState(false);
	const [updateTagsCurrentPage, setUpdateTagsCurrentPage] = useState(1);
	const [isAddAmazonProductsInProgress, setIsAddAmazonProductsInProgress] =
		useState(false);
	const [isVideoDataExtractionStarted, setIsVideoDataExtractionStarted] =
		useState(false);

	const [isLoading, setIsLoading] = useState(false);
	const [currentView, setCurrentView] = useState(STEPS.CONTENT);
	const [updatedData, setUpdatedData] = useState({
		collection_name: "",
		description: "",
		description_old: "",
		blog_filter: [],
		cover_image: null,
		category_tags: {},
		settings: getDefaultSettings(),
		image_url: "",
		blog_url: "",
		video_url: "",
		collection_theme: "",
	});

	const [errors, setErrors] = useState({
		description: "",
		// description_old: "",
	});

	const [attributesData, setAttributesData] = useState({});
	const [savedFilters, setSavedFilters] = useState(defaultFilters);
	const [filters, setFilters] = useState(defaultFilters);
	const [filterOptionsVisible, setFilterOptionsVisible] = useState(false);
	const [appliedFilters, setAppliedFilters] = useState(null);

	// states to handle multiselect for delete and other actions
	const [enableSelectProduct, setEnableSelectProduct] = useState(false);
	const [actionType, setActionType] = useState('Next Action')
	const [selectedProducts, setSelectedProducts] = useState([]);

	const [selectedTags, setSelectedTags] = useState([]);
	const [selectedAdditionalTags, setSelectedAdditionalTags] = useState([]);

	// second step edit tags
	const [showEditTagsInput, setShowEditTagsInput] = useState(false);
	// const [addProductModalOpen, setAddProductModalOpen] = useState(false);
	// const [uploadProductDefaultMode, setUploadProductDefaultMode] =
	// 	useState(null);
	const [editTagsValue, setEditTagsValue] = useState([]);
	const [editTagsError, setEditTagsError] = useState("");
	const [tagEdited, setTagEdited] = useState({ ...defaultIsTagEdited });

	const [isProductsFetchedForNewColl, setIsProductsFetchedForNewColl] =
		useState(null);
	const [publishingOption, setPublishingOption] = useState(
		PUBLISHING_OPTION_PAGE
	);
	const [selectedSortOption, setSelectedSortOption] = useState(
		PRODUCT_SORT_OPTIONS[0]
	);
	const [customFilter, setCustomFilter] = useState([]);
	const [showCustomFilterInput, setShowCustomFilterInput] = useState(false);

	const router = useRouter();
	const plistId =
		props?.plistId ??
		router?.query?.plistId ??
		router?.query?.plist_id ??
		router?.query?.id;
const isNewCollection = router.query.isNewCollection === "true";
 

	const {
		data: authUser,
		userNotFound,
		isFetching: fetchingUser,
	} = useSelector((state) => state.auth.user);

	const [
		authUserCollections,
		singleCollections,
		authUserCollectionsIsFetching,
		updateWishlistReducer,
		deleteWishlistReducer,
		removeFromWishlistReducer,
		addToWishlistReducer,
		applyWishlistProductsFilterReducer,
		auraChatSetting,
		storeData,
		// storeSellerList,
		sellerDetails,
		extractionData,
		showWishlistModal,
		publishOverlay
	] = useSelector((state) => [
		state.auth.user.collections.data,
		state.auth.user.singleCollections.data,
		state.auth.user.collections.isFetching,
		state.wishlistActions.updateWishlist,
		state.wishlistActions.deleteWishlist,
		state.wishlistActions.removeFromWishlist,
		state.wishlistActions.addToWishlist,
		state.wishlistActions.applyWishlistProductsFilter,
		state.chatV2.auraChatSetting,
		state.store.data,
		// state.store.data.seller_list || [],
		state.store.data.sellerDetails || {},
		state.chatV2.aiExtractionData,
		state.appState.wishlist.showWishlistModal,
		state.chatV2.auraOverlayCoordinates,
	]);
 
	
// const check = authUserCollections.find((userId)=> )
	const { isFetching: updateWishlistInProgress } = updateWishlistReducer;
	const { isFetching: deleteWishlistInProgress } = deleteWishlistReducer;

	const {
		isFetching: removeFromWishlistInProgress,
		data: removeFromWishlistData,
		success: removeFromWishlistSuccess,
	} = removeFromWishlistReducer;

	const {
		isFetching: addTomWishlistInProgress,
		data: addToWishlistData,
		success: addTomWishlistSuccess,
	} = addToWishlistReducer;

	const { filteredData: applyWishlistProductsFilterFilteredData } =
		applyWishlistProductsFilterReducer;

	const { filter_settings, catalog_attributes, collection_properties, admin_list: admin_list } =
		storeData;

	const availableFilters = filter_settings?.available_filters || {};
	const displayFilters = filter_settings?.display_filters || [];

	const displayableFilter = displayFilters?.map((v) => v.key);

	// const currentStore = useSelector(getCurrentUserStore);
	const dispatch = useDispatch();

	const { sendAddProductsFromAmazonMessage } = useChat();

	const { sendSocketClientDataExtractionRequest } = useContext(SocketContext);

	// flag to show UI specific to BT store
	const isBTInstance = useMemo(
		() =>
			is_store_instance && current_store_name === STORE_USER_NAME_BUDGETTRAVEL,
		[]
	);

	const isSamskaraInstance = useMemo(
		() => is_store_instance && current_store_name === STORE_USER_NAME_SAMSKARA,
		[]
	);

	// cookie based temporary flag to enable the fetch more products button
	const isFetchMoreEnabled = useMemo(
		() =>
			Cookies.get(COOKIE_ENABLED_FEATURES)
				?.split(",")
				.includes(COOKIE_FEATURE_FETCH_MORE) || false,
		[]
	);

	// cookie based temporary flag to enable the category tags integration
	const isCategoryTagsEnabled = useMemo(
		() =>
			Cookies.get(COOKIE_ENABLED_FEATURES)
				?.split(",")
				.includes(COOKIE_FEATURE_CATEGORY_TAGS) || false,
		[]
	);
	const [currentCollection, setCurrentCollection] = useState({});

	// console.log('currentCollection',currentCollection );
	// console.log('singleCollections',singleCollections );
	useEffect(() => {
 
		// Modal open aagumbothu Redux data varudhaa check
		if (showWishlistModal && singleCollections && Object.keys(singleCollections).length > 0) {
			return setCurrentCollection(singleCollections);

		}

		// Normal flow
		else if (authUserCollections.length && plistId && !showWishlistModal) {
			const found = authUserCollections.find((cl) => cl._id === plistId) || {};
			setCurrentCollection(found);
		}
	}, [
		showWishlistModal,
		singleCollections,
		authUserCollections,
		plistId,
		currentCollection
	]);

	// Fetch collection data directly on page load/refresh when plistId is available
	useEffect(() => {
		if (plistId && authUser.user_id && !currentCollection._id) {
			dispatch(getUserCollection({ _id: plistId }));
			dispatch(getSingleUserCollection({ _id: plistId }));
		}
	}, [plistId, authUser.user_id]);

	// 	useEffect(() => {
	//   let nextCollection = null;

	//   // Modal flow (priority)
	//   if (
	//     showWishlistModal &&
	//     singleCollections &&
	//     Object.keys(singleCollections).length > 0
	//   ) {
	//     nextCollection = singleCollections;
	//   }
	//   // Normal flow
	//   else if (
	//     !showWishlistModal &&
	//     plistId &&
	//     authUserCollections?.length
	//   ) {
	//     nextCollection =
	//       authUserCollections.find(cl => cl._id === plistId) || null;
	//   }

	//   // Update state ONLY if changed
	//   if (nextCollection?._id !== currentCollection?._id) {
	//     setCurrentCollection(nextCollection);
	//   }

	// }, [
	//   showWishlistModal,
	//   singleCollections,
	//   authUserCollections,
	//   plistId,
	//   currentCollection
	// ]);



	// 	const currentCollection = useMemo(() => {
	// 		if (showWishlistModal) {
	// 			return singleCollections || {};
	// 		}

	// 		console.log(authUserCollections );
	// 		return authUserCollections.find((cl) => cl._id === plistId) || {};

	// 	}, [
	// 		showWishlistModal,
	//   singleCollections, // ⭐ IMPORTANT
	//   authUserCollections,
	//   plistId
	// 	]);
	// const [storeCollectionData, setStoreCollectionData] = useState(currentCollection)

	// 	console.log('currentCollection', currentCollection );
	// 	console.log('storeCollectionData', storeCollectionData );
	// 	console.log('singleCollections', singleCollections );

	// 	useEffect(() => {
	// 		if (showWishlistModal) {
	// 			setStoreCollectionData(currentCollection)
	// 		}
	// 	}, [showWishlistModal,singleCollections])

	const isGeneratedByDesc = useMemo(
		() =>
			(!isEmpty(currentCollection) && !currentCollection.generated_by) ||
			currentCollection.generated_by === COLLECTION_GENERATED_BY_DESC_BASED ||
			currentCollection.generated_by === COLLECTION_GENERATED_BY_SEARCH_BASED ||
			currentCollection.generated_by ===
			COLLECTION_GENERATED_BY_MY_PRODUCTS_BASED,
		[currentCollection, currentCollection.generated_by]
	);

	const isGeneratedByMyProducts = useMemo(
		() =>
			currentCollection.generated_by ===
			COLLECTION_GENERATED_BY_MY_PRODUCTS_BASED,
		[currentCollection.generated_by]
	);

	const isGeneratedByBlog = useMemo(
		() => currentCollection.generated_by === COLLECTION_GENERATED_BY_BLOG_BASED,
		[currentCollection.generated_by]
	);

	const isGeneratedByImage = useMemo(
		() =>
			currentCollection.generated_by === COLLECTION_GENERATED_BY_IMAGE_BASED,
		[currentCollection.generated_by]
	);

	const isGeneratedByVideo = useMemo(
		() =>
			currentCollection.generated_by === COLLECTION_GENERATED_BY_VIDEO_BASED,
		[currentCollection.generated_by]
	);

	const customFilterStoreData = useMemo(
		() => catalog_attributes?.find((c) => c.key === "custom_filter"),
		[catalog_attributes]
	);

	const productLists = useMemo(() => {
		const list = currentCollection.product_lists || [];
		const filtered1 = filterAvailableProductList(list);
		// const filtered2 = filterProductList(filtered1, appliedFilters);

		// return filtered2;
		return filtered1;
	}, [
		JSON.stringify(currentCollection.product_lists),
		// JSON.stringify(appliedFilters),
	]);

	const additionalTagsToShow = useMemo(() => {
		if (
			selectedTags.length &&
			currentCollection.tags?.some((tag) => selectedTags.includes(tag))
		) {
			const list = getTagMapTagsBySelectedTags(
				selectedTags.map((tag) => tag.toLowerCase()),
				currentCollection.tag_map
			);

			return list.filter((t) => !selectedTags.includes(t)); // removing tag if the parent tag text is same
		} else {
			return currentCollection.additional_tags;
		}
	}, [
		JSON.stringify(currentCollection.tags),
		JSON.stringify(currentCollection.additional_tags),
		JSON.stringify(selectedTags),
		JSON.stringify(currentCollection.tag_map),
	]);

	const tagsToFilter = useMemo(
		() =>
			selectedAdditionalTags.length ? selectedAdditionalTags : selectedTags,
		[selectedAdditionalTags, selectedTags]
	);

	const productsToShow = useMemo(() => {
		if (tagsToFilter.length) {
			return filterProductListBySelectedTags(
				productLists,
				tagsToFilter,
				currentCollection.tag_map
			);
		} else {
			return productLists;
		}
	}, [
		JSON.stringify(productLists),
		JSON.stringify(tagsToFilter),
		JSON.stringify(currentCollection.tag_map),
	]);

	// updated displayFilters obj, removed custom_filter and added display_value
	const filtersToShow = useMemo(() => {
		return displayFilters
			.filter((filter) => filter.key !== "custom_filter") // removed custom_filter
			.map((filter) => {
				if (
					filter.key in availableFilters &&
					(filter.input_type === "multi_select" ||
						filter.input_type === "single_select")
				) {
					filter.display_value = availableFilters[filter.key]; // adding display_value for multi_select and single_select input
				}
				return filter;
			});
	}, [displayFilters, availableFilters]);

	// const priceFilter = useMemo(() => { // used for old price range filters with drop down
	// 	const price = currentCollection?.show_filters?.price;

	// 	const options = [];

	// 	let min = +price?.min || 0;
	// 	let max = +price?.max || 0;
	// 	if (price && min < max) {
	// 		const roundNum = max - min > 100 ? 10 : 5;
	// 		min = numFloor(min, roundNum);
	// 		max = numCeil(max, roundNum);

	// 		let diff = (max - min) / priceRangeOptionsCount;
	// 		diff = numCeil(diff, roundNum);

	// 		let updatedMin = 0;

	// 		if (diff + min > 40) {
	// 			// to add first option as below 40 every time the min is more than 40
	// 			options.push({
	// 				id: "Below 40",
	// 				title: "Below 40",
	// 				value: "below 40",
	// 				query: [{ price: { $lte: 40 } }],
	// 				saveQuery: {
	// 					max: 40,
	// 				},
	// 			});
	// 			updatedMin = 40;
	// 		}

	// 		if (diff + min > 100) {
	// 			// to add 2nd option as below 40 - 100 every time when the min is more than 100
	// 			options.push({
	// 				id: "40 - 100",
	// 				title: 40 + " - " + 100,
	// 				value: 40 + " - " + 100,
	// 				query: [{ price: { $gte: 40 } }, { price: { $lte: 100 } }],
	// 				saveQuery: {
	// 					min: 40,
	// 					max: 100,
	// 				},
	// 			});
	// 			updatedMin = 100;
	// 		}

	// 		for (let i = 0; i < priceRangeOptionsCount; i++) {
	// 			const mi = min + diff * i;
	// 			const ma = min + diff * (i + 1);
	// 			if (i === 0) {
	// 				if (options.length) {
	// 					options.push({
	// 						id: i,
	// 						title: updatedMin + " - " + ma,
	// 						value: updatedMin + " - " + ma,
	// 						query: [{ price: { $gte: updatedMin } }, { price: { $lte: ma } }],
	// 						saveQuery: {
	// 							min: updatedMin,
	// 							max: ma,
	// 						},
	// 					});
	// 				} else {
	// 					options.push({
	// 						id: i,
	// 						title: "Below " + ma,
	// 						value: "below " + ma,
	// 						query: [{ price: { $lte: ma } }],
	// 						saveQuery: {
	// 							max: ma,
	// 						},
	// 					});
	// 				}
	// 			} else if (i === priceRangeOptionsCount - 1) {
	// 				options.push({
	// 					id: i,
	// 					title: "Above " + mi,
	// 					value: "Above " + mi,
	// 					query: [{ price: { $gte: mi } }],
	// 					saveQuery: {
	// 						min: mi,
	// 					},
	// 				});
	// 			} else {
	// 				options.push({
	// 					id: i,
	// 					title: mi + " - " + ma,
	// 					value: mi + " - " + ma,
	// 					query: [{ price: { $gte: mi } }, { price: { $lte: ma } }],
	// 					saveQuery: {
	// 						min: mi,
	// 						max: ma,
	// 					},
	// 				});
	// 			}
	// 		}
	// 	}

	// 	return options;
	// }, [currentCollection?.show_filters]);

	const beforeUnloadListener = (event) => {
		event.preventDefault();
		var confirmationMessage =
			"It looks like you have been editing something. " +
			"If you leave before saving, your changes will be lost.";
		return (event.returnValue = confirmationMessage);
	};

	// START
	const handleResetStates = () => {
		dispatch(addToWishlistReset());
		dispatch(removeFromWishlistReset());
		dispatch(applyWishlistProductsFilterReset());
		multiProductsSelectionMessage = "";
	};

	useEffect(() => {
		handleResetStates();

		return () => {
			handleResetStates();
		};
	}, []);

	useEffect(() => {
		if (
			extractionData &&
			(extractionData.successVideoUrlExtraction ||
				extractionData?.data?.status_code !== 200) &&
			isVideoDataExtractionStarted
		) {
			setIsVideoDataExtractionStarted(false);
		}
	}, [extractionData]);

	// reset add to wishlist reducer to clear the showcase success message in few seconds
	useEffect(() => {
		if (
			addTomWishlistSuccess &&
			addToWishlistData &&
			addToWishlistData.showcase
		) {
			const timer = setTimeout(() => {
				dispatch(addToWishlistReset());
			}, 5000);

			return () => {
				clearTimeout(timer);
			};
		}

		return () => { };
	}, [addToWishlistData, addTomWishlistSuccess]);

	// reset remove from wishlist reducer to clear the removed products success message in few seconds
	useEffect(() => {
		if (
			removeFromWishlistSuccess &&
			removeFromWishlistData &&
			removeFromWishlistData.products
		) {
			const timer = setTimeout(() => {
				dispatch(removeFromWishlistReset());
			}, 5000);

			return () => {
				clearTimeout(timer);
			};
		}

		return () => { };
	}, [removeFromWishlistData, removeFromWishlistSuccess]);
	// END

	// useEffect(() => {
	// 	if (filterSaveRequired) {
	// 		window.addEventListener("beforeunload", beforeUnloadListener, {
	// 			capture: true,
	// 		});
	// 	}

	// 	return () => {
	// 		window.removeEventListener("beforeunload", beforeUnloadListener, {
	// 			capture: true,
	// 		});
	// 	};
	// }, [filterSaveRequired]);

	const show_filters = useMemo(
		() =>
			(!isEmpty(currentCollection.tagged_show_filters) &&
				!isEmpty(tagsToFilter) &&
				currentCollection.tagged_show_filters[tagsToFilter[0]]) ||
			{},

		[currentCollection.tagged_show_filters, tagsToFilter]
	);

	// const priceRangeMinMax = useMemo(
	// 	() => getPriceRangeMinMax(show_filters),
	// 	[show_filters]
	// );

	// useEffect(() => {
	// 	if (
	// 		priceRangeMinMax[0] !== priceRangeMinMax[1] &&
	// 		filters.priceRange[0] === filters.priceRange[1]
	// 	) {
	// 		setFilters((value) => ({ ...value, priceRange: [...priceRangeMinMax] }));
	// 	}
	// }, [priceRangeMinMax]);

	const textAreaRef = useRef(null);



	useEffect(() => {
		if (authUser.user_id) {
			// if (!authUserCollections.length && !authUserCollectionsIsFetching) {
			// 	dispatch(
			// 		getUserCollections({
			// 			product_limits: FETCH_COLLECTIONS_PRODUCT_LIMIT,
			// 		})
			// 	);
			// }

			setCollectionsFetched(true);
		}
	}, [authUser.user_id]);


	useEffect(() => {
		if (
			authUser.user_id &&
			authUserCollections.length &&
			currentCollection._id &&
			!currentCollection.detailed
		) {
			dispatch(getUserCollection({ _id: currentCollection._id }));
			dispatch(getSingleUserCollection({ _id: currentCollection._id, }));

		}

		// reset select product feature, edit tags input and errors when collection change
		if (currentCollection._id) {
			checkAndShowContainer({}); // reset select product and edit tag input
			setErrors("");
		}

		if (currentCollection._id) {
			if (
				currentCollection?.product_sort_by &&
				currentCollection?.product_sort_order
			) {
				const selectedOption = PRODUCT_SORT_OPTIONS.find(
					(item) =>
						item.product_sort_by === currentCollection.product_sort_by &&
						item.product_sort_order === currentCollection?.product_sort_order
				);
				setSelectedSortOption(selectedOption);
			} else {
				setSelectedSortOption(PRODUCT_SORT_OPTIONS[0]);
			}
		}
	}, [currentCollection._id]);
 
	// decide show at a time only filterOptions, hashtagsInput enableSelectProduct or edit tags input
	const checkAndShowContainer = useCallback(
		({
			isShowCustomFilterInput = false,
			isFilterOptionsVisible = false,
			isEnableSelectProduct = false,
			isShowEditTagsInput = false,
		}) => {
			setFilterOptionsVisible(isFilterOptionsVisible);
			setShowCustomFilterInput(isShowCustomFilterInput);
			setEnableSelectProduct(isEnableSelectProduct);
			setShowEditTagsInput(isShowEditTagsInput);
		},
		[]
	);

	// reset selected product on click of select or cancel
	useEffect(() => {
		if (!enableSelectProduct) {
			setSelectedProducts([]);
		}
	}, [enableSelectProduct]);

	const handleResetEditTagsInput = useCallback(
		// reset edit tags input
		() => setShowEditTagsInput(false),
		[]
	);

	// send empty array in added or delete to clear the edit tag value
	const clearTagEdited = useCallback(
		({
			added,
			deleted,
			isEdited,
			additionalTagsAdded,
			additionalTagsDeleted,
			isAdditionalTagsEdited,
		} = {}) =>
			setTagEdited((val) => {
				const newVal = { ...val };

				if (isEdited === false) {
					newVal.added = defaultIsTagEdited.added;
					newVal.deleted = defaultIsTagEdited.deleted;
					newVal.isEdited = defaultIsTagEdited.isEdited;
				} else if (added || deleted) {
					newVal.added = added || val.added;
					newVal.deleted = deleted || val.deleted;
					newVal.isEdited = !!(newVal.added.length || newVal.deleted.length);
				}

				if (isAdditionalTagsEdited === false) {
					newVal.additionalTagsAdded = defaultIsTagEdited.additionalTagsAdded;
					newVal.additionalTagsDeleted =
						defaultIsTagEdited.additionalTagsDeleted;
					newVal.isAdditionalTagsEdited =
						defaultIsTagEdited.isAdditionalTagsEdited;
				} else if (additionalTagsAdded || additionalTagsDeleted) {
					newVal.additionalTagsAdded =
						additionalTagsAdded || val.additionalTagsAdded;
					newVal.additionalTagsDeleted =
						additionalTagsDeleted || val.additionalTagsDeleted;
					newVal.isAdditionalTagsEdited = !!(
						newVal.additionalTagsAdded.length ||
						newVal.additionalTagsDeleted.length
					);
				}

				return newVal;
			}),
		[]
	); // clears the tags has have been edited message

	const handleClearSelectedTags = useCallback(
		() => setSelectedTags(() => []),
		[]
	);

	const handleClearSelectedAdditionalTags = useCallback(
		() => setSelectedAdditionalTags(() => []),
		[]
	);

	// remove empty filters from every keyword_tag_map
	// for price checking min and max both avlble and return
	const updatedKeywordTagMap = useMemo(() => {
		let finalKeyWordTagMap = {};
		for (const tag in updatedData.keyword_tag_map) {
			finalKeyWordTagMap[tag] = removeEmptyItems(
				updatedData.keyword_tag_map[tag]
			);
		}
		return finalKeyWordTagMap;
	}, [updatedData.keyword_tag_map]);


	const handleFetchProductsOnTagsEdited = async ({
		added, // ['tag1', 'tag2']
		deleted, // ['tag1', 'tag2']
		latest = [], // ['tag1', 'tag2']
		additionalTagsAdded, // ['tag1', 'tag2']
		additionalTagsDeleted, // ['tag1', 'tag2']
		additionalTagsLatest = [], // ['tag1', 'tag2']
		settings = updatedData.settings,
		filters,
		refetchFlag,
		useUpdateTag = !isGeneratedByMyProducts,
		ipp,
		current_page,
	} = {}) => {
		// fetch products based on the tags and dave it with add to collection API
		try {
			setFetchProductsInProgress(true);
			clearTagEdited({
				added: added && [],
				deleted: deleted && [],
				additionalTagsAdded: additionalTagsAdded && [],
				additionalTagsDeleted: additionalTagsDeleted && [],
			});

			if (
				currentCollection._id &&
				(added || deleted || additionalTagsAdded || additionalTagsDeleted) &&
				useUpdateTag
			) {
				const updateTagsAPIPayload = {
					collection_id: currentCollection._id,
					added_tags: added,
					deleted_main_tags: deleted,
					latest_main_tags: latest,
					added_addon_tags: additionalTagsAdded,
					delete_addon_tags: additionalTagsDeleted,
					tag_filters: filters,
					latest_addon_tags: additionalTagsLatest,
					user_query:
						currentCollection.generated_by ===
							COLLECTION_GENERATED_BY_DESC_BASED
							? updatedData.description_old
							: "",
					store: is_store_instance ? current_store_name : undefined,
					refetch: refetchFlag || undefined,
					ipp,
					current_page
				};

				updateTagsAPIPayload.tag_filters = isEmpty(selectedTags)
					? updatedKeywordTagMap
					: {
						...updatedKeywordTagMap,
						[selectedTags[0]]: removeEmptyItems(filters), // remove empty filters from selected tag
					};

				// updateTagsAPIPayload.filters = {
				// 	store:
				// 		is_store_instance && shared_profile_on_root
				// 			? shared_profile_on_root
				// 			: undefined,
				// };

				// if (settings) {
				// 	updateTagsAPIPayload.filters = {
				// 		...updateTagsAPIPayload.filters,
				// 		...settings,
				// 		gender: settings.gender ? settings.gender : undefined,
				// 		age_group: settings.age_group ? settings.age_group : undefined,
				// 		color:
				// 			settings.color && settings.color.length
				// 				? settings.color
				// 				: undefined,
				// 		brand:
				// 			settings.brand && settings.brand.length
				// 				? settings.brand
				// 				: undefined,
				// 		custom_filter: settings.custom_filter
				// 			? settings.custom_filter
				// 			: undefined,
				// 		discount: settings.discount ? settings.discount : undefined,
				// 		price:
				// 			!isEmpty(settings.price?.min) && !isEmpty(settings.price?.max)
				// 				? {
				// 						min: +settings.price.min,
				// 						max: +settings.price.max,
				// 				  }
				// 				: undefined,
				// 		material: settings?.material ? settings.material : undefined,
				// 		pattern: settings?.pattern ? settings.pattern : undefined,
				// 		style: settings?.style ? settings.style : undefined,

				// 		priceRange: undefined,
				// 		strict_filters: undefined, // will be need to remove later
				// 		colors: undefined, // will be need to remove later
				// 	};
				// }
				// }

				let updateTagsResponse = await collectionPageAPIs.updateTagsAPICall(
					updateTagsAPIPayload
				);

				if (
					updateTagsResponse.data &&
					updateTagsResponse.data.status_code === 200 &&
					updateTagsResponse.data.data &&
					updateTagsResponse.data.data._id
				) {
					dispatch(
						replaceAndUpdateUserCollectionData(updateTagsResponse.data.data)
					);
				}
			}
		} catch (error) {
		} finally {
			setFetchProductsInProgress(false);
		}
	};

	const handleConfirmRefetchProducts = async ({
		newTags = currentCollection.tags,
		settings = updatedData.settings,
		category_tags = currentCollection.category_tags || {},
		isFetchMore = false,
		refetchFlag = false,
	} = {}) => {
		// fetch products based on the tags and dave it with add to collection API
		try {
			setFetchProductsInProgress(true);
			clearTagEdited({ isEdited: false });

			const nextPageNo = isFetchMore
				? (currentCollection.products_current_page || 0) + 1
				: 0;

			const fetchProductsAPIPayload = {
				tags: newTags,
				store: is_store_instance ? current_store_name : undefined,

				try_gpt: "no",
				replace: true,
				complete: true,
				collection_id: currentCollection._id,
				user_query:
					currentCollection.generated_by === COLLECTION_GENERATED_BY_DESC_BASED
						? updatedData.description_old
						: "",
				tag_filters: updatedKeywordTagMap,
			};

			if (refetchFlag) {
				fetchProductsAPIPayload.refetch = true;
			}

			if (isFetchMoreEnabled) {
				fetchProductsAPIPayload.current_page = nextPageNo;
				fetchProductsAPIPayload.ipp = COLLECTION_PRODUCTS_FETCH_IPP;
			}

			// if (isCategoryTagsEnabled) {
			// 	fetchProductsAPIPayload.filters = {
			// 		...fetchProductsAPIPayload.filters,
			// 		...category_tags,
			// 	};
			// }

			// if (settings) {
			// 	fetchProductsAPIPayload.filters = {
			// 		...fetchProductsAPIPayload.filters,
			// 		...settings,
			// 		gender: settings.gender ? settings.gender : undefined,
			// 		age_group: settings.age_group ? settings.age_group : undefined,
			// 		color:
			// 			settings.color && settings.color.length
			// 				? settings.color
			// 				: undefined,
			// 		brand:
			// 			settings.brand && settings.brand.length
			// 				? settings.brand
			// 				: undefined,
			// 		custom_filter: settings.custom_filter
			// 			? settings.custom_filter
			// 			: undefined,
			// 		discount: settings.discount ? settings.discount : undefined,
			// 		price:
			// 			!isEmpty(settings.price?.min) && !isEmpty(settings.price?.max)
			// 				? {
			// 						min: +settings.price.min,
			// 						max: +settings.price.max,
			// 				  }
			// 				: undefined,
			// 		material: settings?.material ? settings.material : undefined,
			// 		pattern: settings?.pattern ? settings.pattern : undefined,
			// 		style: settings?.style ? settings.style : undefined,

			// 		priceRange: undefined,
			// 		strict_filters: undefined, // will be need to remove later
			// 		colors: undefined, // will be need to remove later
			// 	};
			// }

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

				// REMOVE
				// const hasProducts = !!productsResponse.data.data.data?.length;
				// const hasShowFilters = !!productsResponse.data.data.show_filters;

				// if (hasProducts) {
				// 	const productsToAdd = productsResponse.data.data.data.map((pr) => ({
				// 		mfr_code: pr.mfr_code,
				// 		tagged_by: pr.tagged_by,
				// 	}));

				// 	const addToWishlistPayload = {
				// 		_id: currentCollection._id,
				// 		products: productsToAdd,
				// 		replace: isFetchMore ? false : true,
				// 		fetchUserCollection: true, // fetch collection after success add to collection
				// 	};

				// 	dispatch(addToWishlist(addToWishlistPayload));
				// }

				// const editPayload = {
				// 	_id: currentCollection._id,
				// 	attributesData: {
				// 		filters: {},
				// 		products_current_page: nextPageNo,
				// 		hasMoreProducts: hasProducts, // flag to not show show more button
				// 	},
				// 	fetchUserCollection: true, // fetch collection after success add to collection
				// };

				// if (hasShowFilters) {
				// 	editPayload.attributesData.show_filters =
				// 		productsResponse.data.data.show_filters;
				// }
				// dispatch(updateWishlist(editPayload));

				if (applyWishlistProductsFilterFilteredData._id)
					dispatch(applyWishlistProductsFilterReset()); // because we are resetting filter with update collection API // resetting the filtered data as well if available

				// handleClearFiltersClick(false); // clearing the filters // fixed from BE now
			}
		} catch (error) {
		} finally {
			setFetchProductsInProgress(false);
		}
	};

	const handleFetchMoreUpdateTags = async () => {
		try {
			setFetchProductsInProgress(true);

			const updateTagsAPIPayload = {
				collection_id: currentCollection._id,
				added_tags: selectedTags || [],
				latest_main_tags: currentCollection.tags || [],
				latest_addon_tags: [],
				tag_filters: updatedKeywordTagMap,
				user_query:
					currentCollection.generated_by === COLLECTION_GENERATED_BY_DESC_BASED
						? updatedData.description_old
						: "",
				store: is_store_instance ? current_store_name : undefined,
				ipp: 15,
				current_page: updateTagsCurrentPage,
				refetch: false,
			};

			let updateTagsResponse = await collectionPageAPIs.updateTagsAPICall(
				updateTagsAPIPayload
			);

			if (
				updateTagsResponse.data &&
				updateTagsResponse.data.status_code === 200 &&
				updateTagsResponse.data.data &&
				updateTagsResponse.data.data._id
			) {
				dispatch(
					replaceAndUpdateUserCollectionData(updateTagsResponse.data.data)
				);
				setUpdateTagsCurrentPage((currentPage) => currentPage + 1);
			}
		} catch (error) {
		} finally {
			setFetchProductsInProgress(false);
		}
	};

	// reset select product and tag feature when user is on first screen
	useEffect(() => {
		if (currentView === STEPS.CONTENT) {
			checkAndShowContainer({}); // reset select product feature
			handleClearSelectedTags();
			handleClearSelectedAdditionalTags();
			handleEditTagsCancel();
		}

		if (currentView === STEPS.PRODUCTS) {
			// reset tag feature  when user is on products step
			handleClearSelectedTags();
			checkAndShowContainer({}); // reset edit tags input
			return () => {
				clearTagEdited({ isEdited: false }); // clears the tags has have been edited message
			};
		}

		return () => { };
	}, [currentView]);
	// console.log('isProductsFetchedForNewColl',isProductsFetchedForNewColl === false);
	// console.log('updateWishlistInProgress',!updateWishlistInProgress);
	// console.log('authUserCollectionsIsFetching',!authUserCollectionsIsFetching);
	// console.log(currentView === STEPS.PRODUCTS);
	// console.log(currentCollection._id);
 

	useEffect(() => {

		if (
			currentView === STEPS.PRODUCTS &&
			isProductsFetchedForNewColl === false &&
			!updateWishlistInProgress &&
			!authUserCollectionsIsFetching
		) {
			// call refetch products on products page view if the collection is new collection
			handleConfirmRefetchProducts();
			setIsProductsFetchedForNewColl(true);
		}
	}, [currentView, updateWishlistInProgress, authUserCollectionsIsFetching,isProductsFetchedForNewColl]);
	let fetchingTimer;

	useEffect(() => {
		if (currentCollection.status === IN_PROGRESS) {
			fetchingTimer = setInterval(() => {
				dispatch(getUserInfo());
			}, 5000);
		} else {
			clearInterval(fetchingTimer);
		}

		return () => {
			clearInterval(fetchingTimer);
		};
	}, [currentCollection]);

	useEffect(() => {
		if (currentCollection._id && isNewCollection) {
			if (isProductsFetchedForNewColl === null) {
				setIsProductsFetchedForNewColl(false);
			}
		}
	}, [currentCollection._id]);

	useEffect(() => {
		if (!showWishlistModal && currentView === STEPS.PRODUCTS) {
			dispatch(
				getUserCollection({
					_id: currentCollection._id,
				})
			);
			// dispatch(getSingleUserCollection({ _id: currentCollection._id, }));

		}
	}, [showWishlistModal]);

	// useEffect(() => {
	// 	// if filtered data available - show filtered list to user else user collection product list from reducer
	// 	const product_lists = currentCollection.product_lists;

	// 	setProductLists(
	// 		product_lists ? filterAvailableProductList(product_lists) : []
	// 	);

	// 	// handleClearFiltersClick();
	// 	// handleResetSelectProduct(); // reset select product feature
	// 	// handleClearSelectedTags(); // clears selected tags
	// }, [
	// 	currentCollection.product_lists,
	// 	applyWishlistProductsFilterFilteredData.product_lists,
	// ]);

	// const hasSavedFilters = useMemo(
	// 	() =>
	// 		savedFilters.brand.length ||
	// 		savedFilters.product_brand.length ||
	// 		(!(
	// 			savedFilters.priceRange[0] === 0 && savedFilters.priceRange[1] === 0
	// 		) &&
	// 			savedFilters.priceRange[0] <= savedFilters.priceRange[1]),
	// 	[savedFilters]
	// );

	// const productLists = useMemo(
	// 	() => productLists,
	// 	// hasSavedFilters
	// 	// 	? productLists.filter((p) => {
	// 	// 			if (
	// 	// 				savedFilters.brand.length &&
	// 	// 				!savedFilters.brand.includes(p.brand)
	// 	// 			) {
	// 	// 				return false;
	// 	// 			}

	// 	// 			if (
	// 	// 				savedFilters.product_brand.length &&
	// 	// 				!savedFilters.product_brand.includes(p.product_brand)
	// 	// 			) {
	// 	// 				return false;
	// 	// 			}

	// 	// 			if (
	// 	// 				!(
	// 	// 					savedFilters.priceRange[0] === 0 &&
	// 	// 					savedFilters.priceRange[1] === 0
	// 	// 				) &&
	// 	// 				savedFilters.priceRange[0] <= savedFilters.priceRange[1] &&
	// 	// 				!(
	// 	// 					p.price >= savedFilters.priceRange[0] &&
	// 	// 					p.price <= savedFilters.priceRange[1]
	// 	// 				)
	// 	// 			) {
	// 	// 				return false;
	// 	// 			}

	// 	// 			return true;
	// 	// 	  })
	// 	// 	: productLists,
	// 	[productLists, savedFilters]
	// );

	const pageRedirectPath = useMemo(
		() =>
			currentCollection._id &&
			getBlogCollectionPagePath(
				authUser.user_name,
				currentCollection.path,
				currentCollection._id,
				authUser.user_id,
				currentCollection.status,
				currentCollection.hosted_stores,
				currentCollection?.collection_theme
			),
		[
			authUser.user_name,
			currentCollection.path,
			currentCollection._id,
			authUser.user_id,
			currentCollection.status,
			currentCollection.hosted_stores,
			currentCollection?.collection_theme,
		]
	);

	const showBackdropLoader = useMemo(
		() =>
			updateWishlistInProgress ||
			deleteWishlistInProgress ||
			removeFromWishlistInProgress ||
			addTomWishlistInProgress ||
			fetchingUser ||
			authUserCollectionsIsFetching ||
			isFetchAttributesInProgress ||
			isFetchProductsInProgress ||
			isLoading ||
			!currentCollection._id,
		[
			updateWishlistInProgress,
			deleteWishlistInProgress,
			removeFromWishlistInProgress,
			addTomWishlistInProgress,
			fetchingUser,
			authUserCollectionsIsFetching,
			isFetchAttributesInProgress,
			isFetchProductsInProgress,
			isLoading,
			currentCollection._id,
		]
	);

	const enableFilters = useMemo(
		() =>
			!isEmpty(tagsToFilter) &&
			currentCollection.status !== IN_PROGRESS &&
			(productsToShow.length > 0 || !isEmpty(appliedFilters)) &&
			availableFilters &&
			isEmpty(selectedAdditionalTags),
		// priceRangeMinMax[0] !== priceRangeMinMax[1]),
		[
			tagsToFilter,
			currentCollection.status,
			productsToShow.length,
			appliedFilters,
			availableFilters,
			selectedAdditionalTags,
			// priceRangeMinMax,
		]
	);

	const enableCustomFilter = useMemo(
		() => customFilterStoreData?.is_display && enableFilters,
		[customFilterStoreData?.is_display, enableFilters]
	);

	const showProductSelection = useMemo(
		() => productsToShow.length > 0 && currentCollection.status !== IN_PROGRESS,
		[productsToShow.length, currentCollection.status]
	);


	const pathToStore = useMemo(
		() => (is_store_instance ? PATH_ROOT : PATH_STORE),
		[]
	);

	useEffect(() => {
		if (
			userNotFound ||
			(collectionsFetched &&
				!authUserCollectionsIsFetching &&
				!currentCollection._id) && !singleCollections
		) {
			// guest user // or collection is not present
			navigate(pathToStore);
		}
	}, [
		userNotFound,
		collectionsFetched,
		authUserCollectionsIsFetching,
		currentCollection,
		singleCollections
	]);

	useEffect(() => {
		if (plistId && currentCollection._id) {
			const settings = currentCollection.AI_filters
				? prepareSettingsFromAI_filters(currentCollection.AI_filters)
				: getDefaultSettings();

			if (isEmpty(settings?.brand) && isNewCollection) {
				settings.brand = authUser.filters?.[current_store_name]?.strict?.brand || [];
			}

			setUpdatedData({
				collection_name: currentCollection.collection_name,
				settings,
				description:
					currentCollection.description ||
					getCollectionDefaultDescription(currentCollection.collection_name),
				description_old:
					currentCollection.description_old ||
					currentCollection.description ||
					getCollectionDefaultDescription(currentCollection.collection_name),
				blog_filter: currentCollection.tags,
				cover_image: currentCollection.cover_image,
				category_tags: { ...(currentCollection.category_tags || {}) },
				blog_url: currentCollection.blog_url,
				video_url: currentCollection.video_url,
				image_url: currentCollection.image_url,
				keyword_tag_map: currentCollection.keyword_tag_map,
				collection_theme: currentCollection?.collection_theme || undefined,
			});
			// setCoverImage(currentCollection.cover_image);
		}
	}, [plistId, currentCollection]);

	const clearSelectedTagIfNotAvailable = useCallback(() => {
		if (
			currentCollection.tags &&
			selectedTags &&
			!selectedTags.every((t) => currentCollection.tags.includes(t))
		) {
			handleClearSelectedTags(); // clears selected tags if tag is not available
		}
		if (
			additionalTagsToShow &&
			selectedAdditionalTags &&
			!selectedAdditionalTags.every((t) => additionalTagsToShow.includes(t))
		) {
			handleClearSelectedAdditionalTags(); // clears selected tags if tag is not available
		}
	}, [
		JSON.stringify(currentCollection.tags),
		JSON.stringify(selectedTags),
		JSON.stringify(selectedAdditionalTags),
		JSON.stringify(additionalTagsToShow),
		handleClearSelectedTags,
		handleClearSelectedAdditionalTags,
	]);


	// save filters on tag change
	useEffect(() => {
		if (!isEmpty(tagsToFilter) && !isEmpty(updatedData.keyword_tag_map)) {
			const collFilters = updatedData.keyword_tag_map[tagsToFilter[0]];

			if (collFilters) {
				setFilters(() => ({
					...defaultFilters,
					...collFilters,
					// priceRange: collFilters.priceRange || [...priceRangeMinMax],
				}));
				setAppliedFilters(collFilters);

				return;
			}
		}

		setFilters({
			...defaultFilters,
			//  priceRange: [...priceRangeMinMax]
		});
		clearSelectedTagIfNotAvailable();
	}, [JSON.stringify(tagsToFilter), updatedData.keyword_tag_map]);

	// useEffect(() => {
	// 	// reset plist data on view change issue: show more button hide when go back to previous step
	// 	// setPlistData([]); // REMOVE
	// 	if (currentView === STEPS.PRODUCTS) {
	// 		if (isNewCollection) {
	// 			// mark flag to not fetch the products again when user come back and save
	// 			navigate("", {
	// 				replace: true, // replace the current page in history // avoid adding new visit in history
	// 				state: {
	// 					isNewCollection: false, // reset // to avoid considering it as new on refresh
	// 				},
	// 			});
	// 		}
	// 	}
	// }, [currentView]);

	useEffect(() => {
		if (textAreaRef.current && currentCollection.description) {
			// We need to reset the height momentarily to get the correct scrollHeight for the textarea
			textAreaRef.current.style.height = "auto";
			const scrollHeight = textAreaRef.current.scrollHeight;

			// We then set the height directly, outside of the render loop
			// Trying to set this with state or a ref will product an incorrect value.
			textAreaRef.current.style.height = scrollHeight + "px";
		}
	}, [textAreaRef.current, currentCollection.description]);

	const handleInputChange = useCallback((e) => {
		const { name, value } = e.target;
		// if(value.length < 50){
		// 	notification["error"]({ message: "You Have To Type Atleatst 50 Charactors" });
		// }
		collectionDetailsSaveRequired = true;
		setUpdatedData((data) => ({ ...data, [name]: value }));
	}, []);

	// const handleSettingsInputChange = useCallback((name, value) => {
	// 	collectionDetailsSaveRequired = true;

	// 	if (name === "min" || name === "max") {
	// 		if (isValidNumber(value) || value === "") {
	// 			setUpdatedData((data) => ({
	// 				...data,
	// 				settings: {
	// 					...data.settings,
	// 					price: {
	// 						...data.settings.price,
	// 						[name]: value,
	// 					},
	// 				},
	// 			}));
	// 		}
	// 	} else {
	// 		setUpdatedData((data) => ({
	// 			...data,
	// 			settings: {
	// 				...data.settings,
	// 				[name]: value,
	// 			},
	// 		}));
	// 	}
	// }, []);

	// const handleSettingsTagsInputChange = useCallback((name, values) => {
	// 	collectionDetailsSaveRequired = true;
	// 	setUpdatedData((data) => ({
	// 		...data,
	// 		settings: {
	// 			...data.settings,
	// 			[name]: values,
	// 		},
	// 	}));
	// }, []);

	// {"search":true,"metadata:{"strict_filters":["brand","gender"],
	// "search_alg":1,"tags:[],"AI_filters":{}}

	// update keyword tag map onchange of filters
	const updateKeywordTagMap = useCallback(
		(filters) => {
			collectionDetailsSaveRequired = true;
			setUpdatedData((data) => {
				const keyword_tag_map = data.keyword_tag_map || {};

				return {
					...data,
					keyword_tag_map: {
						...keyword_tag_map,
						[tagsToFilter]: filters,
					},
				};
			});
		},
		[updatedData, filters]
	);

	const handleFiltersOptionalChange = useCallback(
		(name, isChecked) => {
			collectionDetailsSaveRequired = true;

			const selectedOptionalFilters = filters.optional_filters || [];
			const filtersWithValues = removeEmptyItems(filters);
			const hasFilterValue = Object.keys(filtersWithValues).includes(name);

			// check and remove optional filters if already exist or add if not exist
			const optionalFilters = isChecked || !hasFilterValue
				? selectedOptionalFilters.filter((s) => s !== name)
				: selectedOptionalFilters.includes(name)
					? selectedOptionalFilters
					: [...selectedOptionalFilters, name];

			const finalFilters = {
				...filters,
				optional_filters: !isEmpty(optionalFilters)
					? optionalFilters
					: undefined,
			};

			setFilters(finalFilters);

			updateKeywordTagMap(finalFilters);
		},
		[updatedData, filters]
	);

	const handleTagsChange = useCallback((values) => {
		setUpdatedData((data) => ({ ...data, blog_filter: values }));
	}, []);

	const handleCategoryTagsChange = useCallback((tagsKey, values) => {
		collectionDetailsSaveRequired = true;
		if (tagsKey) {
			setUpdatedData((data) => {
				const category_tags = data.category_tags || {};
				category_tags[tagsKey] = values;
				return { ...data, category_tags };
			});
		}
	}, []);

	// update image_url,video_url,cover_image,collection_theme
	const handleUploadedDataChange = useCallback(
		(name, value) => {
			const editPayload = {
				_id: currentCollection._id,
				[name]: value,
				fetchUserCollection: true,
				 get_other_dimensions:false
			};
 
	 


			dispatch(updateWishlist(editPayload));
			setUpdatedData({ ...updatedData, [name]: value });
		},
		[currentCollection._id]
	);

	const isDataValid = useCallback(() => {
		var isValid = true;
		const errorList = {
			description: "",
			// description_old: "", // REMOVE
		};

		if (!currentCollection.blog_url) {
			// if (
			// 	currentCollection.description_old !== updatedData.description_old && // REMOVE
			// 	!updatedData.description_old
			// ) {
			// 	isValid = false;
			// 	errorList.description_old = "Please enter description";
			// }
			if (
				// currentCollection.description !== updatedData.description && // REMOVE
				// currentCollection.description_old === updatedData.description_old && // REMOVE
				!updatedData.description
			) {
				isValid = false;
				errorList.description = "Please enter description";
			}
		}

		setErrors(() => ({ ...errorList }));
		return isValid;
	}, [currentCollection.blog_url, updatedData.description]);

	const checkIsTagsChanged = useCallback(
		(arr1 = [], arr2 = []) =>
			arr1.length !== arr2.length ||
			arr2.some((t) => !arr1.includes(t)) ||
			arr1.some((t) => !arr2.includes(t)),
		[]
	);

	const getAddedTags = useCallback(
		(arr = [], newArr = []) => newArr.filter((i) => !arr.includes(i)),
		[]
	);

	const getDeletedTags = useCallback(
		(arr = [], newArr = []) => arr.filter((i) => !newArr.includes(i)),
		[]
	);

	const onTagChangeSave = useCallback(
		(newTags, additional_tags) => {
			const tagEditedData = {
				...defaultIsTagEdited,
				latest: newTags,
				isEdited:
					currentCollection.tags &&
					newTags &&
					checkIsTagsChanged(newTags, currentCollection.tags),
			};

			if (tagEditedData.isEdited) {
				let tagsAdded = tagEdited.added || [],
					tagsDeleted = tagEdited.deleted || [];

				tagEditedData.added = tagsAdded.concat(
					getAddedTags(currentCollection.tags, newTags)
				);
				tagEditedData.deleted = tagsDeleted.concat(
					getDeletedTags(currentCollection.tags, newTags)
				);
			}

			if (additional_tags) {
				tagEditedData.additionalTagsLatest = additional_tags;
				tagEditedData.isAdditionalTagsEdited =
					currentCollection.additional_tags &&
					additional_tags &&
					checkIsTagsChanged(
						additional_tags,
						currentCollection.additional_tags
					);
			}

			if (tagEditedData.isAdditionalTagsEdited) {
				let additionalTagsAdded =
					(tagEdited.isAdditionalTagsEdited &&
						tagEdited.additionalTagsAdded) ||
					[],
					additionalTagsDeleted =
						(tagEdited.isAdditionalTagsEdited &&
							tagEdited.additionalTagsDeleted) ||
						[];

				tagEditedData.additionalTagsAdded = additionalTagsAdded.concat(
					getAddedTags(currentCollection.additional_tags, additional_tags)
				);
				tagEditedData.additionalTagsDeleted = additionalTagsDeleted.concat(
					getDeletedTags(currentCollection.additional_tags, additional_tags)
				);
			}

			if (tagEditedData.isEdited || tagEditedData.isAdditionalTagsEdited) {
				setTagEdited(tagEditedData);
			}
		},
		[currentCollection.tags, currentCollection.additional_tags, tagEdited]
	);

	const isSavingRef = useRef(false);

	const handleSaveContentChanges = useCallback(
		async (metadata = {}, data = updatedData) => {
			if (isFetchProductsInProgress) {
			 
				return; // Prevent duplicate execution
			}

			// Prevent Double Execution using useRef
			if (isSavingRef.current) {
			 
				return;
			}
			isSavingRef.current = true; // Mark as processing

			if (isDataValid()) {
				setErrors({ description: "" });
	 

				let saveRequired = false;
				const editPayload = {
					_id: currentCollection._id,
					fetchUserCollection: true,
					errorMessage: "Unable to update collection details",
					attributesData: {},
				};

				const Keys = Object.keys(data.keyword_tag_map);
				const getUpdatedTags = [];

				Keys?.forEach((key) => {
					const currentTags = currentCollection.keyword_tag_map[key] || {};
					const updatedTags = data.keyword_tag_map[key] || {};

					if (JSON.stringify(currentTags) !== JSON.stringify(updatedTags)) {
						getUpdatedTags.push(key);
					}
				});

				const updateTagsAPIPayload = {
					collection_id: currentCollection._id,
					added_tags: getUpdatedTags || [],
					latest_main_tags: updatedData.blog_filter || [],
					tag_filters: updatedKeywordTagMap,
					store: is_store_instance ? current_store_name : undefined,
					user_query: currentCollection.generated_by === COLLECTION_GENERATED_BY_DESC_BASED
						? updatedData.description_old
						: "",
					refetch: true
				};

				if (isCategoryTagsEnabled) {
					editPayload.attributesData.category_tags = data.category_tags || {};
				}

				if (!checkIsFavoriteCollection(currentCollection) &&
					data.collection_name &&
					currentCollection.collection_name !== data.collection_name
				) {
					editPayload.collection_name = data.collection_name;
					saveRequired = true;
				}

				if (data.settings &&
					JSON.stringify(currentCollection.AI_filters) !== JSON.stringify(data.settings)
				) {
					editPayload.attributesData.AI_filters = data.settings;
					saveRequired = true;
				}

				if (currentCollection.description_old !== data.description_old) {
					editPayload.description_old = data.description_old;
					saveRequired = true;
				}

				if (currentCollection.blog_url !== data.blog_url) {
					editPayload.blog_url = data.blog_url;
					saveRequired = true;
				}

				if (currentCollection.video_url !== data.video_url) {
					editPayload.video_url = data.video_url;
					saveRequired = true;
				}

				if (currentCollection.description !== data.description) {
					editPayload.description = data.description;
					saveRequired = true;
				}

				if (!isEmpty(attributesData)) {
					editPayload.attributesData = {
						...editPayload.attributesData,
						...attributesData,
					};
					saveRequired = true;
				}

				if (checkIsTagsChanged(data.blog_filter, currentCollection.tags)) {
					editPayload.tags = data.blog_filter;
					saveRequired = true;
				}

				if (metadata.AI_filters) {
					editPayload.AI_filters = metadata.AI_filters;
					saveRequired = true;
				}

				if (currentCollection.keyword_tag_map !== data.keyword_tag_map) {
					editPayload.keyword_tag_map = updatedKeywordTagMap;
					saveRequired = true;
				}

				if (saveRequired) {
					setFetchProductsInProgress(true);

					await dispatch(updateWishlist(editPayload));

			 


					if (!isGeneratedByMyProducts && !(isProductsFetchedForNewColl === false) && !metadata.reFetchProductsCalled &&
						(currentCollection.keyword_tag_map !== data.keyword_tag_map ||
							data.blog_filter !== currentCollection.tags)
					) {

						let updateTagsResponse = await collectionPageAPIs.updateTagsAPICall(updateTagsAPIPayload);

						if (
							updateTagsResponse.data &&
							updateTagsResponse.data.status_code === 200 &&
							updateTagsResponse.data.data &&
							updateTagsResponse.data.data._id
						) {
							dispatch(replaceAndUpdateUserCollectionData(updateTagsResponse.data.data));
						} else {
							setFetchProductsInProgress(false);
						}
					}
				}

				setFetchProductsInProgress(false);
				isSavingRef.current = false; // Reset the saving state

				if (!metadata.reFetchProductsCalled) {
					onTagChangeSave(editPayload.tags);
				}
			}
		},
		[
			isDataValid,
			currentCollection._id,
			currentCollection.generated_by,
			currentCollection.collection_name,
			currentCollection.description_old,
			currentCollection.description,
			currentCollection.AI_filters,
			currentCollection.tags,
			updatedData,
			attributesData,
			onTagChangeSave,
			isCategoryTagsEnabled,
			updatedKeywordTagMap,
		]
	);

	const handleSaveContentView = useCallback(
		async (metadata = {}) => {
			if (isDataValid() && collectionDetailsSaveRequired) {
				if (
					metadata.checkReFetchProductsCalled &&
					isProductsFetchedForNewColl === false
				) {
					metadata.reFetchProductsCalled = true; // making this true because products will be fetched when isProductsFetchedForNewColl is false and go to the products step, so it will avoid fetching products for new added tags if any
				}

				await handleSaveContentChanges(metadata);
				collectionDetailsSaveRequired = false;
			}
		},
		[isDataValid, collectionDetailsSaveRequired, handleSaveContentChanges]
	);

	const handleSaveCurrentView = useCallback(
		async (metadata) => {
			switch (currentView) {
				case STEPS.CONTENT:
					await handleSaveContentView(metadata);
					break;

				default:
					break;
			}
		},
		[currentView, handleSaveContentView]
	);

	const handleChangeView = useCallback(
		async (view, metadata) => {
			if (view === currentView) {
				// not doing anything when the current view is same as requested view
				return;
			}

			// const descriptionLength = (updatedData?.description || "").trim().length;
			// if (view === STEPS.PRODUCTS && descriptionLength < 50) {
			// 	notification["error"]({
			// 		message: "Please type at least 50 characters in description",
			// 	});
			// 	return;
			// }
			// console.log('hello');
			

			await handleSaveCurrentView(metadata);

			switch (view) {
				case STEPS.HELP:
					setCurrentView(STEPS.HELP);
					break;

				case STEPS.CONTENT:
					setCurrentView(STEPS.CONTENT);
					break;

				case STEPS.PRODUCTS:
					setCurrentView(STEPS.PRODUCTS);
					break;

				case STEPS.PUBLISH:
					setCurrentView(STEPS.PUBLISH);
					break;

				default:
					break;
			}
		},
		[currentView, handleSaveCurrentView, STEPS.PRODUCTS, updatedData?.description]
	);

	const isAdminLoggedIn = AdminCheck(authUser, current_store_name, adminUserId, admin_list);

	const isStoreAdminLoggedIn = useMemo(
		() =>
			is_store_instance &&
			authUser.user_name &&
			authUser.user_name === super_admin,
		[authUser.user_name]
	);

	// const isSellerLoggedIn = useMemo(
	// 	() => getIsSellerLoggedIn(storeSellerList, authUser.emailId),
	// 	[storeSellerList, authUser.emailId]
	// );

	const showSettings = useMemo(
		() =>
			((is_store_instance && isStoreAdminLoggedIn) || isAdminLoggedIn) &&
			currentCollection.generated_by,
		[isStoreAdminLoggedIn, isAdminLoggedIn, currentCollection.generated_by]
	);

	const currentSellerBrandDetails = useMemo(
		() => sellerDetails[authUser.user_name],
		[sellerDetails, authUser.user_name]
	);

	const handleSellerDownloadCsv = useCallback(
		(e) => {
			if (e?.detail === 1) {
				const url = `${auraYfretUserCollBaseUrl}${collectionProductsExportCsvURL}?collection_id=${currentCollection._id}`;

				const modal = Modal.info({
					title: "Downloading CSV",
					content:
						"Downloading the products as a CSV. You may edit and upload it again.",
					icon: <LoadingOutlined />,
					okButtonProps: { disabled: true },
				});

				setTimeout(() => {
					window.open(url, "_blank");
					modal.update({
						type: "success",
						title: "Downloaded CSV",
						content:
							"Downloaded the products as a CSV. Please check your downloads. You may update product details in csv and upload it to update your catalog",
						icon: <CheckCircleOutlined />,
						okButtonProps: { disabled: false },
					});
				}, 3000);
			}
		},
		[currentCollection._id]
	);

	// checking on regenerate content & keyword click short description, image_url, blog_url is valid or not
	const checkIsCollectionDataValid = useCallback(() => {
		let isValid = true;
		const errorList = {};

		if (isGeneratedByDesc) {
			if (!updatedData.description_old) {
				errorList.description_old = `Please enter short description`;
				isValid = false;
			}
		} else if (isGeneratedByBlog) {
			if (!updatedData.blog_url) {
				errorList.blog_url = `Please enter blog/article URL`;
				isValid = false;
			}
		} else if (isGeneratedByImage) {
			if (!updatedData.image_url) {
				errorList.image_url = "Please upload image";
				isValid = false;
			}
		}

		setErrors(errorList);
		return isValid;
	}, [updatedData, isGeneratedByDesc, isGeneratedByBlog, isGeneratedByImage]);

	const onTryAgainClick = useCallback(async () => {
		try {
			setFetchAttributesInProgress(true);

			if (checkIsCollectionDataValid()) {
				let attrResponse;

				if (isGeneratedByImage) {
					const getImageToDescriptionPayload = {
						image_url: updatedData.image_url,
						cc_image: showSettings ? auraChatSetting.cc_image : undefined,
						img_cc_flow: true,
						userMetadata: {
							brand: authUser?.filters?.[current_store_name]?.strict?.brand || [],
						},
					};

					attrResponse = await collectionPageAPIs.getImageToDescriptionAPICall(
						getImageToDescriptionPayload
					);
				} else if (isGeneratedByDesc || isGeneratedByBlog) {
					const getAttributesPayload = {};

					if (isGeneratedByDesc) {
						getAttributesPayload.short_desc =
							updatedData.description_old || undefined;
						getAttributesPayload.cc_text =
							showSettings && auraChatSetting.cc_text
								? auraChatSetting.cc_text
								: undefined;
						getAttributesPayload.userMetadata = {
							brand: authUser?.filters?.[current_store_name]?.strict?.brand || [],
						}
					}
					else if (isGeneratedByBlog) {
						getAttributesPayload.blog_url = updatedData.blog_url || undefined;
						getAttributesPayload.cc_blog =
							showSettings && auraChatSetting.cc_blog
								? auraChatSetting.cc_blog
								: undefined;
						getAttributesPayload.userMetadata = {
							brand: authUser?.filters?.[current_store_name]?.strict?.brand || [],
						};
					}

					if (isGeneratedByDesc) {
						attrResponse = await collectionPageAPIs.getDescAndTagsAPICall(
							getAttributesPayload
						);
					}
					else if (isGeneratedByBlog) {
						attrResponse = await collectionPageAPIs.getAttributesAPICall(
							getAttributesPayload
						);
					}
				}

				if (attrResponse.data && attrResponse.data.status_code === 200) {
					const preparedData = {
						...updatedData,
						blog_filter: updatedData.blog_filter || [],
					};
					// if (attrResponse.data.data.tags) {
					// 	preparedData.blog_filter = updatedData.blog_filter.concat(
					// 		attrResponse.data.data.tags.filter(
					// 			(t) => !updatedData.blog_filter.includes(t)
					// 		)
					// 	);
					// }

					// if (isCategoryTagsEnabled && attrResponse.data.data.category_tags) {
					// 	preparedData.category_tags = attrResponse.data.data.category_tags;
					// }

					if (attrResponse.data.data.description) {
						// preparedData.description_old = getAttributesPayload.description;
						preparedData.description = attrResponse.data.data.description;
					}

					if (attrResponse.data.data.summary) {
						preparedData.description = attrResponse.data.data.summary;
					}

					if (attrResponse.data.data.tags) {
						preparedData.blog_filter = attrResponse.data.data.tags;
					}

					if (attrResponse.data.data.keyword_tag_map) {
						preparedData.keyword_tag_map =
							attrResponse.data.data.keyword_tag_map;
					}

					if (attrResponse.data.data.raw) {
						setAttributesData({ raw: attrResponse.data.data.raw });
					}

					collectionDetailsSaveRequired = true;
					setUpdatedData(preparedData);
				}
			}
		} catch (error) {
		} finally {
			setFetchAttributesInProgress(false);
		}
	}, [
		isDataValid,
		updatedData,
		currentCollection._id,
		isGeneratedByDesc,
		isGeneratedByBlog,
		isGeneratedByImage,
		isCategoryTagsEnabled,
		showSettings,
		JSON.stringify(auraChatSetting),
		authUser?.filters?.[current_store_name]?.strict?.brand,
	]);

	const handleDataExtractionRequest = () => {
		setIsVideoDataExtractionStarted(true);
		// sending data extraction request to socket for updated content and keywords for video_based collection

		sendSocketClientDataExtractionRequest({
			video_url: updatedData.video_url,
			uploaded_source: currentCollection.uploaded_source,
			metadata: {
				cc_video: showSettings ? auraChatSetting.cc_video : undefined,
				cc_shortvideo: showSettings ? auraChatSetting.cc_shortvideo : undefined,
			},
			collection_id: currentCollection._id,
			user_action: EDIT_ACTION,
			userMetadata: {
				brand: authUser?.filters?.[current_store_name]?.strict?.brand || [],
			},
		});
	};

	const onFetchTagsWithAI = useCallback(async () => {
		try {
			setFetchAttributesInProgress(true);

			if (isDataValid()) {
				const getTagsWithAIPayload = {
					// text: updatedData.description,
					short_desc: updatedData.description_old, // before we were not sending in update tags API if created from video based
					long_desc: updatedData.description,
					userMetadata: {
						brand: authUser?.filters?.[current_store_name]?.strict?.brand || [],
					},
				};

				if (showSettings) {
					if (isGeneratedByDesc) {
						getTagsWithAIPayload.cc_text = auraChatSetting.cc_text || undefined;
					} else if (
						currentCollection.generated_by ===
						COLLECTION_GENERATED_BY_VIDEO_BASED
					) {
						getTagsWithAIPayload.cc_video =
							auraChatSetting.cc_video || undefined;
						getTagsWithAIPayload.cc_shortvideo =
							auraChatSetting.cc_shortvideo || undefined;
						getTagsWithAIPayload.userMetadata = {
							brand: authUser?.filters?.[current_store_name]?.strict?.brand || [],
						};
					}
				}

				const attrResponse = await collectionPageAPIs.getTagsWithAiAPICall(
					getTagsWithAIPayload
				);

				if (attrResponse.data && attrResponse.data.status_code === 200) {
					const preparedData = {
						...updatedData,
						blog_filter: attrResponse.data.data.tags || [],
						keyword_tag_map: attrResponse.data.data.keyword_tag_map,
					};

					const saveMetadata = {};

					if (attrResponse.data.data.AI_filters) {
						saveMetadata.AI_filters = attrResponse.data.data.AI_filters;

						if (attrResponse.data.data.AI_filters.age_group)
							preparedData.settings.age_group =
								attrResponse.data.data.AI_filters.age_group;

						if (attrResponse.data.data.AI_filters.gender)
							preparedData.settings.gender =
								attrResponse.data.data.AI_filters.gender;

						if (attrResponse.data.data.AI_filters.brand)
							preparedData.settings.brand =
								attrResponse.data.data.AI_filters.brand;

						if (attrResponse.data.data.AI_filters.color)
							preparedData.settings.color =
								attrResponse.data.data.AI_filters.color;

						if (attrResponse.data.data.AI_filters.discount)
							preparedData.settings.discount =
								attrResponse.data.data.AI_filters.discount;

						if (attrResponse.data.data.AI_filters.price)
							preparedData.settings.price =
								attrResponse.data.data.AI_filters.price;

						if (attrResponse.data.data.AI_filters.material)
							preparedData.settings.material =
								attrResponse.data.data.AI_filters.material;

						if (attrResponse.data.data.AI_filters.pattern)
							preparedData.settings.pattern =
								attrResponse.data.data.AI_filters.pattern;

						if (attrResponse.data.data.AI_filters.style)
							preparedData.settings.style =
								attrResponse.data.data.AI_filters.style;
					}

					// handleSaveContentChanges(saveMetadata, preparedData);
					collectionDetailsSaveRequired = true;
					setUpdatedData(preparedData);
				}
			}
		} catch (error) {
		} finally {
			setFetchAttributesInProgress(false);
		}
	}, [
		isDataValid,
		updatedData,
		isGeneratedByDesc,
		showSettings,
		auraChatSetting.cc_text,
		auraChatSetting.cc_video,
		auraChatSetting.cc_shortvideo,
		handleSaveContentChanges,
		authUser?.filters?.[current_store_name]?.strict?.brand,
	]);

	const { width } = useWindowSize();

	const plistIpp = () => {
		// deciding page ipp based on the page width
		if (width) {
			let ipp = 25;
			if (width < 1024 && width >= 768) {
				ipp = 21;
			} else if (width < 768) {
				ipp = 20;
			}
			return ipp;
		}
		return;
	};

	// const fetchPlist = async () => {
	// 	try {
	// 		const plist_name = currentCollection?.path.split("::")[0];
	// 		setIsPlistFetching(true);
	// 		const payload = {
	// 			plist_name,
	// 			plistIpp: plistIpp(),
	// 			// query: preparePlistFilterQuery(filters, priceFilter), // disable sending query for now
	// 		};

	// 		const response =
	// 			await collectionPageAPIs.fetchCollectionProductListAPICall(payload);

	// 		if (response.data.data) {
	// 			setPlistData([...response.data.data]);
	// 			setPlistNextUrl(response.data.next);
	// 			setPlistTotalCount(response.data.total_count);
	// 		}
	// 		setIsPlistFetching(false);
	// 	} catch {}
	// };

	// const saveAppliedFilters = (tag, values) => {
	// 	const keyword_tag_map = currentCollection.keyword_tag_map || {};
	// 	keyword_tag_map[tag] = values;

	// 	const editPayload = {
	// 		_id: currentCollection._id,
	// 		attributesData: {
	// 			keyword_tag_map,
	// 		},
	// 		fetchUserCollection: true,
	// 	};

	// 	dispatch(updateWishlist(editPayload));
	// };

	const handleFilterGoClick = async (
		newFilters = filters,
		isFilterOptionsVisible = false
	) => {
		if (!isEmpty(tagsToFilter)) {
			handleFilterOptionsVisibleChange(isFilterOptionsVisible);
			setAppliedFilters(newFilters);
			// saveAppliedFilters(tagsToFilter[0], newFilters);
		}

		handleFetchProductsOnTagsEdited({
			added: tagsToFilter,
			latest: currentCollection.tags,
			filters: newFilters, // selected tag filter
			refetchFlag: true,
			useUpdateTag: true,
		});

		// REMOVE
		// await applyFilters({
		// 	filtersData: filters,
		// });
	};

	const handleClearFiltersClick = async () => {
		handleFilterGoClick({});
		setFilters({ ...defaultFilters });
		// REMOVE
		// await applyFilters({
		// 	clearFilters: true,
		// });
	};

	const handleFiltersInputClear = useCallback(
		(name, value) => {
			collectionDetailsSaveRequired = true;
			setFilters((data) => ({
				...data,
				[name]: value,
			}));

			handleFilterGoClick({ ...filters, [name]: value }, filterOptionsVisible);
		},
		[filters, filterOptionsVisible]
	);

	// save updated custom filter value
	const handleSaveEditCustomFilter = ({ custom_filter, isSave }) => {
		const customFilterArrayToString = custom_filter.toString();

		const finalFilters = {
			...filters,
			custom_filter: customFilterArrayToString || undefined,
		};

		setFilters(finalFilters);
		if (isSave) {
			handleFilterGoClick(finalFilters, filterOptionsVisible);
		}
	};

	const handleRefetchProductsClick = ({
		tags, // if present, fetch and append products based on tags using update tags API
	}) => {
		if (tags && tags.length) {
			handleFetchProductsOnTagsEdited({
				added: tags,
				latest: currentCollection.tags,
				filters, // selected tag filter
				refetchFlag: true,
				useUpdateTag: true,
				ipp:15,
				current_page:0


			});
			setUpdateTagsCurrentPage(1);
		} else {
			Modal.confirm({
				title: "Confirm",
				content: (
					<h1>
						Are you sure you want to get the products? You may lose the current
						products.
					</h1>
				),
				okText: "Get Products",
				cancelText: "Cancel",
				onOk: () => {
					handleConfirmRefetchProducts({
						refetchFlag: true,
					});
				},
			});
		}
	};

	const handleAddAmazonProductsClick = async ({ tags }) => {
		// const metadata = {
		// 	CatalogOptionId: "amazon_fetch",
		// 	keywords_list: tags,
		// 	collection_id: currentCollection._id,
		// 	user_id: authUser.user_id,
		// 	store: is_store_instance ? shared_profile_on_root : undefined,
		// 	seller: authUser.user_name,
		// };

		// if (!isEmpty(selectedTags)) {
		// 	metadata.keyword_tag_map = {
		// 		...updatedData.keyword_tag_map,
		// 		[selectedTags[0]]: filters,
		// 	};
		// } else {
		// 	metadata.keyword_tag_map = updatedData.keyword_tag_map;
		// }
		// sendAddProductsFromAmazonMessage(metadata);

		setIsAddAmazonProductsInProgress(true);
		try {
			const getAmazonProductsAPIPayload = {
				keywords_list: tags,
			};
			let res = await collectionPageAPIs.getAmazonProductsAPICall(
				getAmazonProductsAPIPayload
			);
			if (res.data?.status_code === 200) {
				notification["success"]({
					message: "Added products from amazon to catalog",
				});
			} else {
				notification["error"]({
					message: "Unable to add products from Amazon, Please try again",
				});
			}
		} catch (error) {
		} finally {
			setIsAddAmazonProductsInProgress(false);
		}
	};

	const getAuraMessage = () => {
		if (currentView === STEPS.PRODUCTS) {
			if (currentCollection.status === IN_PROGRESS) {
				return "Fetching products based on the updated keywords.";
			} else if (!productLists.length && !authUserCollectionsIsFetching) {
				return `Unfortunately, I could not find any products for you. You might want to edit the ${TAGS_TITLE} and try again.`;
			} else if (productLists.length)
				return "I found some products matching your content";
		} else {
			if (currentCollection.status === IN_PROGRESS) {
				return currentCollection.blog_url
					? "Please hold on while I complete the process."
					: "Please hold on while I try to write something for you.";
			} else
				return currentCollection.blog_url ? (
					<p>
						A collection created from blog{" "}
						<a
							className={style.blogLink}
							href={currentCollection.blog_url}>
							{currentCollection.blog_url}
						</a>
						. Feel free to edit it as you wish.
					</p>
				) : (
					"I have written something for you. I hope you like it! Feel free to edit it as you wish."
				);
		}
	};

	const onFiltersChange = (name, value) => {
		setFilters({ ...filters, [name]: value });
		updateKeywordTagMap({ ...filters, [name]: value });
	};

	const handleCustomFilterChange = (customFilter) => {
		const removedHash = customFilter.map((item) => item.replaceAll("#", "")); // removed hashtags from string
		setCustomFilter(removedHash);
		const finalFilters = {
			...filters,
			custom_filter: removedHash.toString() || undefined,
		};
		setFilters(finalFilters);
		updateKeywordTagMap(finalFilters);
	};

	const onClearSelectedTagsClick = useCallback(() => {
		handleClearSelectedTags();
		handleClearSelectedAdditionalTags();
		checkAndShowContainer({}); // reset select product
	}, [
		handleClearSelectedTags,
		handleClearSelectedAdditionalTags,
		checkAndShowContainer,
	]);

	useEffect(() => {
		if (currentCollection.tags) {
			setEditTagsValue(currentCollection.tags);
			clearSelectedTagIfNotAvailable();
		}
	}, [currentCollection.tags]);


	// useEffect(() => {
	// 	if (currentView === "PRODUCTS") {
	// 		setSelectedTags([currentCollection.tags[0]]);
	// 	}
	// }, [currentView])


	const enableTagSelection = useMemo(() => true, []);

	const handleTagClick = useCallback(
		({ tag, isAdditional }) => {
			if (enableTagSelection) {
				checkAndShowContainer({ isFilterOptionsVisible: filterOptionsVisible }); // If the filter container is already shown then keep shown while changing the tag
				if (isAdditional) {
					setSelectedAdditionalTags(() => [tag]);
				} else {
					setSelectedTags(() => [tag]);
					setSelectedAdditionalTags(() => []);
				}
				// removed multiple tag selected and allowing only single tag selection
				// setSelectedTags((list) =>
				// 	list.includes(value)
				// 		? list.filter((tag) => tag !== value)
				// 		: [...list, value]
				// );
			}
		},
		[enableTagSelection, checkAndShowContainer, filterOptionsVisible]
	);

	// useEffect(() => {
	// 	// select first tag by default
	// 	if (
	// 		!selectedTags.length &&
	// 		currentCollection.tags &&
	// 		currentCollection.tags.length
	// 	) {
	// 		handleTagClick(currentCollection.tags[0]);
	// 	}
	// }, [currentCollection._id]);

	const isConfirmationRequiredOnTagDelete = useMemo(
		() => currentCollection.status === PUBLISHED,
		[currentCollection.status]
	);
	const isConfirmationRequiredOnTagAdd = useMemo(() => false, []);

	useEffect(() => {
		// fetch new products automatically when new tags are added
		// delete products automatically when tags are delete and collection is not published
		const mainTagsAdded = !!(
			!isConfirmationRequiredOnTagAdd &&
			tagEdited.added &&
			tagEdited.added.length
		);
		const mainTagsDeleted = !!(
			!isConfirmationRequiredOnTagDelete &&
			tagEdited.deleted &&
			tagEdited.deleted.length
		);
		const additionalTagsDeleted = !!(
			!isConfirmationRequiredOnTagDelete &&
			tagEdited.additionalTagsDeleted &&
			tagEdited.additionalTagsDeleted.length
		);
		if (mainTagsAdded || mainTagsDeleted || additionalTagsDeleted) {
			const payload = {};
			if (mainTagsAdded) {
				payload.added = tagEdited.added;
				payload.latest = tagEdited.latest;
			}
			if (mainTagsDeleted) {
				payload.deleted = tagEdited.deleted;
				payload.latest = tagEdited.latest;
			}
			if (additionalTagsDeleted) {
				payload.additionalTagsDeleted = tagEdited.additionalTagsDeleted;
				payload.additionalTagsLatest = tagEdited.additionalTagsLatest;
			}

			if (!isEmpty(payload)) {
				handleFetchProductsOnTagsEdited(payload);
			}
		}
	}, [tagEdited.added, tagEdited.deleted, tagEdited.additionalTagsDeleted]);

	const applyFilters = async ({ filtersData = {}, clearFilters = false }) => {
		handleClearSelectedTags();
		setSavedFilters({ ...filtersData });
		checkAndShowContainer({}); // reset select product feature

		if (clearFilters) {
			// clear filter new API
			const clearFilterPayload = {
				_id: currentCollection._id,
				clear: true,
				// replaceAndUpdateUserCollectionData: true,
			};

			dispatch(applyWishlistProductsFilter(clearFilterPayload));
		} else {
			// apply filter new API
			const applyFilterPayload = {
				_id: currentCollection._id,
				filters: {
					brand: filtersData.brand,
					product_brand: filtersData.product_brand,
					discount: filtersData.discount,
					price:
						!(
							filtersData.priceRange[0] === 0 && filtersData.priceRange[1] === 0
						) && filtersData.priceRange[0] <= filtersData.priceRange[1]
							? {
								min: filtersData.priceRange[0],
								max: filtersData.priceRange[1],
							}
							: undefined,
				},
				// replaceAndUpdateUserCollectionData: true,
			};

			dispatch(applyWishlistProductsFilter(applyFilterPayload));
		}
	};

	const handlePreviewCollectionPage = useCallback(async () => {
		await handleSaveCurrentView();

		// if (isNewCollection) {
		// 	await navigate("", {
		// 		replace: true, // replace the current page in history // avoid adding new visit in history
		// 		state: {
		// 			isNewCollection: false, // reset // to avoid considering it as new on refresh or coming back
		// 		},
		// 	});
		// }

		// await navigate(pageRedirectPath);
		window.open(pageRedirectPath, "_blank"); // opening in new tab for now // can be changed
	}, [
		isNewCollection,
		handleSaveCurrentView,
		pageRedirectPath,
		authUser.user_id,
		authUser.venlyUser,
		authUserCollections.length,
	]);

	// next action value 

	const handleSelectChange = (value) => {
		setEnableSelectProduct(true);
		setActionType(value);
	};


	const onSelectAllChange = () => {
		setSelectedProducts(
			selectedProducts.length < productsToShow.length
				? productsToShow.map((i) => i.mfr_code)
				: []
		);
	};

	const onSelectTagProductsClick = (tag) => {
		// Filter products by the selected tag
		const productsWithTag = productsToShow.filter((product) =>
			product.tagged_by.includes(tag)
		);

		const productsMfrCodes = productsWithTag.map((product) => product.mfr_code);

		// Check if all products with this tag are already selected
		const areAllSelected = productsMfrCodes.every((code) =>
			selectedProducts.includes(code)
		);

		// Update the selected products
		if (areAllSelected) {
			// Remove products with this tag from selectedProducts
			setSelectedProducts(
				selectedProducts.filter((code) => !productsMfrCodes.includes(code))
			);
		} else {
			// Add missing products with this tag to selectedProducts
			setSelectedProducts([
				...selectedProducts,
				...productsMfrCodes.filter((code) => !selectedProducts.includes(code)),
			]);
		}
	};


	const onSelectProductClick = (mfr_code) => {
	 

		multiProductsSelectionMessage =
			"*Select multiple products in a sequence easily with by hitting tab and then the space key";

		if (selectedProducts.includes(mfr_code)) {
			setSelectedProducts(selectedProducts.filter((p) => p !== mfr_code));
		} else {
			setSelectedProducts([...selectedProducts, mfr_code]);
		}
	};

	// delete multiple products at a time with single API call
	const removeProductsFromCollection = (
		products // products format ['mft_code']
	) => {
		const payload = {
			products,
			_id: currentCollection._id,
			errorMessage: "Unable to remove product",
			removeFromUserCollections: true,
			removeFromAppliedFiltersUserCollection: true,
			deleted_tag: !isEmpty(selectedTags) ? selectedTags.toString() : undefined,
		};
		dispatch(removeFromWishlist(payload));
	};

	// from sponsor details delete multiple products at a time with single API call of update collection
	const removeSponsorProductsFromCollection = useCallback(
		(
			products // products format [productData]
		) => {
			if (currentCollection.sponsor_details?.product_list) {
				const editPayload = {
					_id: currentCollection._id,
					attributesData: {
						sponsor_details: {
							...currentCollection.sponsor_details,
							product_list:
								currentCollection.sponsor_details.product_list.filter(
									(p) => !products.includes(p)
								),
						},
					},
					fetchUserCollection: true,
				};

				dispatch(updateWishlist(editPayload));
			}
		},
		[currentCollection._id, currentCollection.sponsor_details]
	);

	const onDeleteSelectedProducts = () => {

		checkAndShowContainer({ isEnableSelectProduct: true })

		if (selectedProducts.length) {
			removeProductsFromCollection(selectedProducts);
			setSelectedProducts([]);
		}
	};

	// showcase multiple products at a time with single API call // take all selected products on top
	const showcaseCollectionProducts = (
		products, // products format ['mft_code']
		starred // sent true to star the products
	) => {
		const productsWithDetails =
			currentCollection.product_lists?.filter((p) =>
				products.includes(p.mfr_code)
			) || [];

		const productsToShowcase = productsWithDetails.map((pr) => ({
			mfr_code: pr.mfr_code,
			tagged_by: pr.tagged_by,
			starred, // to show case products
		}));

		const addToWishlistPayload = {
			_id: currentCollection._id,
			products: productsToShowcase,
			fetchUserCollection: true, // fetch collection after success add to collection
			showcase: true, // flag to know it is showcase action
			rerunApplyWishlistProductsFilter: true, // flag to re run the apply filter api again to update the latest filtered API if available
		};

		dispatch(addToWishlist(addToWishlistPayload));
	};

	const onShowcaseSelectedProducts = (starred = true) => {
		if (selectedProducts.length) {
			showcaseCollectionProducts(selectedProducts, starred);
			setSelectedProducts([]);
		}
	};

	const onAddSelectedProductsToCollection = () => {
		const selectedProductsData = productsToShow.filter((p) =>
			selectedProducts.includes(p.mfr_code)
		);
		if (selectedProducts.length) {
			dispatch(setProductsToAddInWishlist(selectedProductsData));
			dispatch(openWishlistModal());
			checkAndShowContainer({});
		}
	};

	// const onPublishButtonClick = useCallback(() => {
	// 	const payload = {
	// 		_id: currentCollection._id,
	// 		status: PUBLISHED,
	// 		fetchUserCollection: true, // add this if latest collection detains form API is required after success update status
	// 		checkForNFTReward: true, // flag to check for NFT, if user has published the first collection
	// 		checkForNFTRewardShowNotification: true, // flag to show notification only for NFT
	// 	};
	// 	dispatch(updateWishlist(payload));
	// }, [currentCollection._id]);


	const handleEditTagsChange = (value) => {
		setEditTagsValue(value);
	};

	const handleEditTags = (tagsValue, tags, newTaggedFilters) => {
		if (
			!(
				tagsValue.length === currentCollection.tags?.length &&
				tagsValue.every((filter) => currentCollection.tags?.includes(filter))
			)
		) {
			const editBlogPayload = {
				_id: currentCollection._id,
				tags: tagsValue,
				keyword_tag_map: newTaggedFilters,
				fetchUserCollection: true, // fetch current auth user's single collection from API
			};

			const isTagsAdded = !isEmpty(
				getAddedTags(currentCollection.tags, editBlogPayload.tags)
			);
			const isTagsDeleted = !isEmpty(
				getDeletedTags(currentCollection.tags, editBlogPayload.tags)
			);

			if (
				(isConfirmationRequiredOnTagAdd && isTagsAdded) ||
				(isConfirmationRequiredOnTagDelete && isTagsDeleted) ||
				isGeneratedByMyProducts
			) {
				// isGeneratedByMyProducts : flag for call update collection API if tag add or remove for my products collection because we are not calling update_tags API we don't need product auto fetch
				// if not it will delete the related products and update tags as well with useeffect and update_tags API
				dispatch(updateWishlist(editBlogPayload));

				if (currentCollection.type === "custom_plist") {
					handleFetchProductsOnTagsEdited({
						deleted: tags,
						latest: tagsValue,
						filters: newTaggedFilters, // selected tag filter
						refetchFlag: true,
						useUpdateTag: true,
					})
				}
			}

			onTagChangeSave(editBlogPayload.tags);
		}
	};

	const handleEditTagsCancel = useCallback(() => {
		checkAndShowContainer({}); // reset edit tag input
		setEditTagsError("");
		setEditTagsValue(currentCollection.tags);
	}, [currentCollection.tags]);

	const handleEditTagsSaveClick = () => {
		if (editTagsValue?.length) {
			handleEditTags(editTagsValue);
			handleEditTagsCancel();
		} else {
			setEditTagsError(
				`Please enter some ${TAGS_TITLE} that indicate the type of products`
			);
		}
	};

	const handleDeleteTagClick = (e, tags) => {
		e.stopPropagation();
		if (tags) {
			const newTags =
				currentCollection.tags?.filter((t) => !tags.includes(t)) || [];

			const newTaggedFilters = Object.fromEntries(
				Object.entries(currentCollection?.keyword_tag_map || {})
					.filter(([key]) => !tags.includes(key))
			);

			handleEditTags(newTags, tags, newTaggedFilters);
		}
	};

	const handleEditTagsBtnClick = useCallback(() => {
		checkAndShowContainer({ isShowEditTagsInput: true });
		handleClearSelectedTags();
		handleClearSelectedAdditionalTags();
	}, [
		checkAndShowContainer,
		handleClearSelectedTags,
		handleClearSelectedAdditionalTags,
	]);

	const handleDeleteAdditionTags = (e, values) => {
		e.stopPropagation();

		if (values.length) {
			const newTagsList =
				currentCollection.additional_tags?.filter((t) => !values.includes(t)) ||
				[];

			if (
				!(
					newTagsList.length === currentCollection.additional_tags?.length &&
					newTagsList.every((filter) =>
						currentCollection.additional_tags?.includes(filter)
					)
				)
			) {
				const editBlogPayload = {
					_id: currentCollection._id,
					attributesData: {
						additional_tags: newTagsList,
						tag_map: currentCollection.tag_map,
					},
					fetchUserCollection: true, // fetch current auth user's single collection from API
				};

				if (
					selectedTags.length &&
					editBlogPayload.attributesData.tag_map &&
					editBlogPayload.attributesData.tag_map[selectedTags[0]]
				) {
					editBlogPayload.attributesData.tag_map[selectedTags[0]] =
						editBlogPayload.attributesData.tag_map[selectedTags[0]].filter(
							(t) => !values.includes(t)
						);
				}

				const isTagsDeleted = !isEmpty(
					getDeletedTags(
						currentCollection.additional_tags,
						editBlogPayload.attributesData.additional_tags
					)
				);

				if (isConfirmationRequiredOnTagDelete && isTagsDeleted) {
					// if not it will delete the related products and update tags as well with useeffect and update_tags API
					dispatch(updateWishlist(editBlogPayload));
				}

				onTagChangeSave(
					currentCollection.tags,
					editBlogPayload.attributesData.additional_tags
				);
			}
			handleEditTagsCancel();
		}
	};

	const handleSelectPublishingOption = useCallback(
		(option) => {
			switch (option) {
				case PUBLISHING_OPTION_PAGE:
				case PUBLISHING_OPTION_EXPORT_PRODUCTS_CSV:
					handleChangeView(STEPS.PUBLISH);
					break;

				default:
					break;
			}

			setPublishingOption(option);
		},
		[handleChangeView]
	);

	const handleFilterOptionsVisibleChange = useCallback(
		(isFilterOptionsVisible = false) => {
			checkAndShowContainer({
				isFilterOptionsVisible,
			});
		},
		[]
	);

	// check filters is avlble, Except custom_filter
	const isFiltersAvailable = useMemo(() => {
		const finalFilters = removeEmptyItems(filters);

		for (const key in finalFilters) {
			if (key !== "custom_filter") {
				return true;
			}
		}
		return false;
	}, [filters]);

	const getPriceRangeText = (priceRange) => {
		if (!isEmpty(priceRange?.min) && !isEmpty(priceRange?.max)) {
			return priceRange.min + " - " + priceRange.max;
		} else {
			return "";
		}
	};

	const hiddenPublishingOptions = useMemo(() => {
		const options = [];

		return options;
	}, [currentCollection.product_lists]);

	// const handleUploadProductsSubmit = useCallback(
	// 	async ({ productData: products, selectedCsv }) => {
	// 		setIsLoading(true);

	// 		if (selectedCsv?.url) {
	// 			try {
	// 				const res = await profileAPIs.updateCatalogFeedAPICall({
	// 					brand: authUser.user_name,
	// 					user_id: authUser.user_id,
	// 					feed_url: selectedCsv.url,
	// 				});

	// 				if (res.data?.status_code === 200) {
	// 					notification["success"]({
	// 						message:
	// 							"Processing your request! The products will be searchable once it is ingested.",
	// 					});

	// 					if (res.data?.data?._id)
	// 						dispatch(replaceAndUpdateUserCollectionData(res.data.data, true)); // updating data from API response directly to reducer without calling single collection get data API
	// 				}
	// 			} catch (error) {
	// 				console.error(error);
	// 			}
	// 		} else if (products) {
	// 			try {
	// 				let res = await collectionPageAPIs.addHandpickedProductsAPICall(
	// 					currentCollection._id,
	// 					products.map((p) => ({
	// 						name: p.name,
	// 						image: p.image,
	// 						handpicked: true,
	// 						brand: authUser.user_name,
	// 					}))
	// 				);

	// 				if (res.data?.status_code === 200) {
	// 					notification["success"]({
	// 						message: "Added product(s)",
	// 					});

	// 					if (res.data?.data?._id)
	// 						dispatch(replaceAndUpdateUserCollectionData(res.data.data, true)); // updating data from API response directly to reducer without calling single collection get data API
	// 				}
	// 			} catch (error) {
	// 				console.error(error);
	// 			}
	// 		}
	// 		setIsLoading(false);
	// 	},
	// 	[currentCollection._id]
	// );

	// const handleUploadMyCollectionsProducts = useCallback((defaultMode) => {
	// 	setAddProductModalOpen(true);
	// 	setUploadProductDefaultMode(defaultMode);
	// }, []);

	// const filterContent = (
	// 	<>
	// 		<div className='flex flex-col justify-between'>
	// 			<div className='flex justify-between'>
	// 				<h4 className='text-slate-200 text-xl'>Filter Products</h4>
	// 				<div className='flex items-center'>
	// 					<button
	// 						className='bg-indigo-600 rounded text-white py-1 font-normal text-base px-3'
	// 						onClick={() => handleFilterGoClick()} // save the go state as well to save it on show plist page
	// 						role='button'>
	// 						Go
	// 					</button>
	// 				</div>
	// 			</div>
	// 			<div className='grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3 mt-4 gap-4'>
	// 				{displayableFilter.includes("gender") &&
	// 				availableFilters?.gender?.length ? (
	// 					<div>
	// 						<h5 className='text-slate-200 text-base'>Gender</h5>
	// 						<Select
	// 							mode='multiple'
	// 							allowClear
	// 							className='w-full rounded-xl'
	// 							placeholder='Select gender'
	// 							onChange={(v) => onFiltersChange("gender", v)}
	// 							value={filters.gender}>
	// 							{availableFilters?.gender?.map((filter) => (
	// 								<Option key={filter}>{filter}</Option>
	// 							))}
	// 						</Select>
	// 					</div>
	// 				) : null}

	// 				{displayableFilter.includes("age_group") &&
	// 				availableFilters?.age_group?.length ? (
	// 					<div>
	// 						<h5 className='text-slate-200 text-base'>Age group</h5>
	// 						<Select
	// 							mode='multiple'
	// 							allowClear
	// 							className='w-full rounded-xl'
	// 							placeholder='Select age group'
	// 							onChange={(v) => onFiltersChange("age_group", v)}
	// 							value={filters.age_group}>
	// 							{availableFilters?.age_group?.map((filter) => (
	// 								<Option key={filter}>{filter}</Option>
	// 							))}
	// 						</Select>
	// 					</div>
	// 				) : null}

	// 				{displayableFilter.includes("discount") &&
	// 				availableFilters?.discount?.length ? (
	// 					<div>
	// 						<h5 className='text-slate-200 text-base'>Discount</h5>
	// 						<Select
	// 							mode='multiple'
	// 							allowClear
	// 							className='w-full'
	// 							placeholder='Select discount'
	// 							onChange={(v) => onFiltersChange("discount", v)}
	// 							value={filters.discount}>
	// 							{availableFilters?.discount?.map((filter) => (
	// 								<Option value={filter} key={filter}>
	// 									{filter}
	// 								</Option>
	// 							))}
	// 						</Select>
	// 					</div>
	// 				) : null}

	// 				{displayableFilter.includes("brand") &&
	// 				availableFilters?.brand?.length ? (
	// 					<div>
	// 						<h5 className='text-slate-200 text-base'>Brand</h5>
	// 						<Select
	// 							mode='multiple'
	// 							allowClear
	// 							className='w-full rounded-xl'
	// 							placeholder='Select brand'
	// 							onChange={(v) => onFiltersChange("brand", v)}
	// 							value={filters.brand}>
	// 							{availableFilters?.brand?.map((filter) => (
	// 								<Option key={filter}>{filter}</Option>
	// 							))}
	// 						</Select>
	// 					</div>
	// 				) : null}

	// 				{displayableFilter.includes("color") ? (
	// 					<div>
	// 						<h5 className='text-slate-200 text-base'>Color</h5>
	// 						<Select
	// 							mode='tags'
	// 							allowClear
	// 							className='w-full rounded-xl'
	// 							placeholder='Select color'
	// 							onChange={(v) => onFiltersChange("color", v)}
	// 							value={filters.color}>
	// 							{availableFilters?.color?.map((filter) => (
	// 								<Option key={filter}>{filter}</Option>
	// 							))}
	// 						</Select>
	// 					</div>
	// 				) : null}

	// 				{displayableFilter.includes("occasion") &&
	// 				availableFilters?.occasion?.length ? (
	// 					<div>
	// 						<h5 className='text-slate-200 text-base'>Room</h5>
	// 						<Select
	// 							mode='multiple'
	// 							allowClear
	// 							className='w-full rounded-xl'
	// 							placeholder='Select room'
	// 							onChange={(v) => onFiltersChange("occasion", v)}
	// 							value={filters.occasion}>
	// 							{availableFilters?.occasion?.map((filter) => (
	// 								<Option key={filter}>{filter}</Option>
	// 							))}
	// 						</Select>
	// 					</div>
	// 				) : null}

	// 				{displayableFilter.includes("custom_filter") ? (
	// 					<div>
	// 						<label className='text-base text-slate-200 block'>
	// 							Custom filter
	// 						</label>
	// 						<Input
	// 							className='w-full'
	// 							placeholder='Enter custom filter'
	// 							value={filters?.custom_filter}
	// 							onChange={(e) =>
	// 								onFiltersChange("custom_filter", e.target.value)
	// 							}
	// 							maxLength={25}
	// 						/>
	// 					</div>
	// 				) : null}

	// 				{displayableFilter.includes("price") ? (
	// 					<div>
	// 						<label className='text-base text-slate-200 block'>
	// 							Price range
	// 						</label>

	// 						<div className='flex flex-row'>
	// 							<Input
	// 								type='text'
	// 								className='w-full'
	// 								placeholder='Minimum'
	// 								value={filters?.price?.min || ""}
	// 								onChange={(e) => onFiltersChange("min", e.target.value)}
	// 								name='priceRange-min'
	// 							/>
	// 							<span className='flex justify-center items-center text-slate-200 text-base mx-2'>
	// 								to
	// 							</span>
	// 							<Input
	// 								type='text'
	// 								className='w-full'
	// 								placeholder='Maximum'
	// 								value={filters?.price?.max || ""}
	// 								onChange={(e) => onFiltersChange("max", e.target.value)}
	// 								name='priceRange-max'
	// 							/>
	// 						</div>
	// 					</div>
	// 				) : null}

	{
		/*  {priceRangeMinMax[0] !== priceRangeMinMax[1] ? (
						<div className=''>
							<h5 className={style.textGray103}>Price Range</h5> *?}
					{/* creating multiple dynamic price ranges and allow user to select one of them using dropdown */
	}
	{
		/* <Select
													allowClear
													className='w-full'
													placeholder='Select price range'
													onChange={(v) => onFiltersChange("price", v)}
													value={filters.price}>
													{priceFilter.map((filter) => (
														<Option value={filter.value} key={filter.id}>
															{filter.title}
														</Option>
													))}
												</Select> */
	}
	{
		/* added slider selector for price range to select any custom price rang dynamic */
	}
	{
		/* <div className='flex items-center'>
								<h5 className={style.textGray103}>{priceRangeMinMax[0]}</h5>
								<div className='w-full'>
									<Slider
										range
										// defaultValue={[20, 50]}
										onChange={(v) => {
											onFiltersChange("priceRange", v);
										}}
										value={filters.priceRange}
										min={priceRangeMinMax[0]}
										max={priceRangeMinMax[1]}
										className='mx-3'
										trackStyle={[
											{
												backgroundColor: "#4F46E5",
											},
										]}
										handleStyle={[
											{
												backgroundColor: "#4F46E5",
												borderColor: "#4F46E5",
											},
											{
												backgroundColor: "#4F46E5",
												borderColor: "#4F46E5",
											},
										]}
									/>
								</div>
								<h5 className={style.textGray103}>{priceRangeMinMax[1]}</h5>
							</div> */
	}
	{
		/* </div>
					) : null} */
	}

	// {displayableFilter.includes("material") ? (
	// 	<div>
	// 		<h5 className={style.textGray103}>Material</h5>
	// 		<Select
	// 			mode='tags'
	// 			allowClear
	// 			className='w-full rounded-xl'
	// 			placeholder='Enter material'
	// 			onChange={(v) => onFiltersChange("material", v)}
	// 			value={filters.material}>
	// 			{availableFilters?.material?.map((filter) => (
	// 				<Option key={filter}>{filter}</Option>
	// 			))}
	// 		</Select>
	// 	</div>
	// ) : null}

	// {displayableFilter.includes("pattern") &&
	// availableFilters?.pattern?.length ? (
	// 	<div>
	// 		<h5 className={style.textGray103}>Pattern</h5>
	// 		<Select
	// 			mode='multiple'
	// 			allowClear
	// 			className='w-full rounded-full'
	// 			placeholder='Select pattern'
	// 			onChange={(v) => onFiltersChange("pattern", v)}
	// 			value={filters.pattern}>
	// 			{availableFilters?.pattern?.map((filter) => (
	// 				<Option value={filter} key={filter}>
	// 					{filter}
	// 				</Option>
	// 			))}
	// 		</Select>
	// 	</div>
	// ) : null}

	// {displayableFilter.includes("style") &&
	// availableFilters?.style?.length ? (
	// 	<div>
	// 		<h5 className={style.textGray103}>Style</h5>
	// 		<Select
	// 			mode='multiple'
	// 			allowClear
	// 			className='w-full rounded-full'
	// 			placeholder='Select style'
	// 			onChange={(v) => onFiltersChange("style", v)}
	// 			value={filters.style}>
	// 			{availableFilters?.style?.map((filter) => (
	// 				<Option value={filter} key={filter}>
	// 					{filter}
	// 				</Option>
	// 			))}
	// 		</Select>
	// 	</div>
	// ) : null}

	{
		/* {show_filters?.product_brand?.length ? (
					<div className={style.mt4}>
						<h5 className={style.textGray103}>Brand</h5>
						<Select
							allowClear
							mode='multiple'
							className={style.wFull}
							placeholder='Select product brands'
							onChange={(v) => onFiltersChange("product_brand", v)}
							value={filters.product_brand}>
							{show_filters?.product_brand.map((filter) => (
								<Option value={filter} key={filter}>
									{filter}
								</Option>
							))}
						</Select>
					</div>
				) : null} */
	}
	// 			</div>
	// 		</div>
	// 	</>
	// );

	const askQuestionComponentMemo = useMemo(
		() => (
			<AskQuestionComponent
				id='edit_collection_ask_question'
				email={authUser.emailId}
			/>
		),
		[authUser.emailId]
	);

	const isShowAddProductsForAmazon = useMemo(
		() =>
			(!is_store_instance || isBTInstance || isStagingEnv) &&
			!showEditTagsInput &&
			isEmpty(selectedAdditionalTags) &&
			!isEmpty(currentCollection?.tags),
		[
			isBTInstance,
			showEditTagsInput,
			selectedAdditionalTags,
			currentCollection?.tags,
		]
	);

	const handleDeletePlistClick = () => {
		dispatch(
			deleteWishlist({
				_id: currentCollection._id,
				successMessage: `${WISHLIST_TITLE} has been deleted.`,
				errorMessage: `Failed to delete ${WISHLIST_TITLE}, try after sometime.`,
				removeCollectionFromUserCollections: true,
				// redirectToPathOnSuccess: pathToStore, // redirect to given path on success // already handled with useEffect so kept in comment
			})
		);
	};

	const handleDiscard = (e) => {
		e.preventDefault();

		if (isNewCollection) {
			Modal.confirm({
				title: "Confirm",
				content: (
					<h1>
						Are you sure you want to delete the collection{" "}
						<span className={style.fontBold}>
							{getCollectionNameToShow(currentCollection)}
						</span>
						?
					</h1>
				),
				okText: "Delete",
				cancelText: "Cancel",
				onOk: () => {
					handleDeletePlistClick();
					navigate(`${window.location.origin}/create-collection/`);
				},
			});
		} else {
			is_store_instance ? navigate(PATH_ROOT) : navigate(PATH_STORE);
		}
	};

	const handleSortOptionChange = (value) => {
		const selectedOption = PRODUCT_SORT_OPTIONS?.find(
			(item) => item.id === value
		);

		const payload = {
			_id: currentCollection._id,
			product_sort_by: selectedOption?.product_sort_by,
			product_sort_order: selectedOption?.product_sort_order,
			fetchUserCollection: true,
		};

		setSelectedSortOption(selectedOption);
		dispatch(updateWishlist(payload));
	};


	// next action click yes button call the function
	const handleYesClick = () => {
		switch (actionType) {
			case 'delete':
				onDeleteSelectedProducts()
				break;
			case 'showcase':
				onShowcaseSelectedProducts()
				break;
			case 'removeshowcase':
				onShowcaseSelectedProducts(false)
				break;
			case 'addtoanother':
				onAddSelectedProductsToCollection()
				break;
			case 'cancel':
				checkAndShowContainer({})
				break;
			default:
				console.warn('Unhandled action type:', actionType);
				break;
		}

		// Reset states after performing the action
		setEnableSelectProduct(false);
		setActionType('Next Action');
		setSelectedProducts([]);
	};

	// next action click cancel button call the function
	const handleCancelClick = () => {
		setActionType("Next Action");
		setEnableSelectProduct(false);
	 

	};

	const starredProducts = currentCollection?.product_lists?.filter(product => product.starred) || [];

	const DefaultCoverImage = starredProducts?.[0]?.image || currentCollection?.product_lists?.[0]?.image || null;

	// useEffect(() => {
	// 	if (currentView === STEPS.PRODUCTS && !updatedData.cover_image) {
	// 		setUpdatedData((prevData) => ({
	// 			...prevData,
	// 			cover_image: DefaultCoverImage,
	// 		}));
	// 	}
	// }, [currentView, DefaultCoverImage]);

	useEffect(() => {
		if (currentView !== STEPS.PUBLISH) {
			dispatch(setOverlayCoordinates([]))
		}
	}, [STEPS, currentView]);


	const RefetchButton = () => {
		return !isFetchProductsInProgress ? (
			<div className={style.refetchButtonContainer}>
					{selectedTags?.length > 0  && 
									<button
										className={style.refetchButton}
										onClick={handleFetchMoreUpdateTags}
									>
										Fetch More
									</button>
									}
									
				<Tooltip title='Get a new set of products again'>
					<button
						onClick={() => handleRefetchProductsClick({ tags: selectedTags })}
						className={style.refetchButton}>
						Get Products Again
					</button>
				</Tooltip>
			
			</div>
		) : null;
	};
	
	

	return (
		<div className={style.pageContainer}>
			{/* removed header because, now we are showing the review collection page with aura header with store page component */}
			{/* <AuthHeader hideProfile /> */}

			<div className={style.contentWrapper}>
				<div className={style.mainColumn}>
					{/* // HIDDEN for review page all section */}
					{/* {isNewCollection && currentView === STEPS.CONTENT ? (
					<div className={style.headerSection}>
						<div className={`bubble bubble-bottom-left ${style.bubbleContainer}`}>
							{getAuraMessage()}
							<Spin
								className={style.pl4}
								spinning={
									currentCollection.status === IN_PROGRESS ||
									authUserCollectionsIsFetching
								}></Spin>
						</div>
						<img
							src={
								currentCollection.status === IN_PROGRESS
									? waiting_avatar
									: completed_avatar
							}
							className={style.w24MdAuto}
						/>
					</div>
				) : null} */}

					{/* steps UI */}
					<ReviewCollectionStepsUI
						STEPS={STEPS}
						currentView={currentView}
						handleChangeView={handleChangeView}
						enableHelpStep
						isSamskaraInstance={isSamskaraInstance}
					/>

					{currentView === STEPS.HELP && ( // help step
						<ReviewCollectionContainerWrapper>
							<ReviewCollectionStepHelp
								onGetStarted={() => handleChangeView(STEPS.CONTENT)}
							/>
						</ReviewCollectionContainerWrapper>
					)}
					{currentView === STEPS.CONTENT && ( // first step
						<ReviewCollectionStepContent
							onTryAgainClick={
								isGeneratedByVideo
									? handleDataExtractionRequest
									: onTryAgainClick
							}
							onFetchTagsWithAI={onFetchTagsWithAI}
							updatedData={updatedData}
							handleInputChange={handleInputChange}
							currentCollection={currentCollection}
							errors={errors}
							handleTagsChange={handleTagsChange}
							handleCategoryTagsChange={handleCategoryTagsChange}
							handleChangeView={handleChangeView}
							handlePreviewCollectionPage={handlePreviewCollectionPage}
							handleUploadedDataChange={handleUploadedDataChange}
							handleDiscard={handleDiscard}
							STEPS={STEPS}
							handleConfirmRefetchProducts={handleConfirmRefetchProducts}
							isProductsFetchedForNewColl={isProductsFetchedForNewColl}
							isCategoryTagsEnabled={isCategoryTagsEnabled}
							isNewCollection={isNewCollection}
							// handleSettingsInputChange={handleSettingsInputChange}
							// handleSettingsInputClear={handleFiltersInputClear}
							// handleSettingsTagsInputChange={handleSettingsTagsInputChange}
							// handleSettingsStrictSelectChange={
							// 	handleFiltersOptionalChange
							// }
							showSettings={showSettings}
							availableFilters={availableFilters}
							displayableFilter={displayableFilter}
							setUpdatedData={setUpdatedData}
							checkIsTagsChanged={checkIsTagsChanged}
							filtersToShow={filtersToShow}
							filters={filters}
							setFilters={setFilters}
							onFiltersChange={onFiltersChange}
							handleFiltersOptionalChange={handleFiltersOptionalChange}
							selectedTags={selectedTags}
							setSelectedTags={setSelectedTags}
							showEditTagsInput={showEditTagsInput}
							setShowEditTagsInput={setShowEditTagsInput}
							editTagsError={editTagsError}
							setEditTagsError={setEditTagsError}
							isFiltersAvailable={isFiltersAvailable}
							customFilterStoreData={customFilterStoreData}
							customFilter={customFilter}
							setCustomFilter={setCustomFilter}
							handleCustomFilterChange={handleCustomFilterChange}
							updateKeywordTagMap={updateKeywordTagMap}
							isGeneratedByBlog={isGeneratedByBlog}
							isGeneratedByImage={isGeneratedByImage}
							isGeneratedByDesc={isGeneratedByDesc}
							isGeneratedByVideo={isGeneratedByVideo}
							showCustomFilterInput={showCustomFilterInput}
							setShowCustomFilterInput={setShowCustomFilterInput}
							checkAndShowContainer={checkAndShowContainer}
							setIsLoading={setIsLoading}
							isLoading={isLoading}
							updatedKeywordTagMap={updatedKeywordTagMap}
							// isSamskaraInstance={isSamskaraInstance}
							isGeneratedByMyProducts={isGeneratedByMyProducts}
						/>
					)}
					{currentView === STEPS.PUBLISH && ( // third step
						<ReviewCollectionStepPublish
							storeData={storeData}
							publishOverlay={publishOverlay}
							setUpdatedData={setUpdatedData}
							handlePreviewCollectionPage={handlePreviewCollectionPage}
							handleDiscard={handleDiscard}
							updatedData={updatedData}
							DefaultCoverImage={DefaultCoverImage}
							starredProducts={starredProducts}
							handleUploadedDataChange={handleUploadedDataChange}
							currentCollection={currentCollection}
							authUser={authUser}
							currentView={currentView}
							// onPublishButtonClick={onPublishButtonClick}
							STEPS={STEPS}
							handleSelectPublishingOption={handleSelectPublishingOption}
							publishingOption={publishingOption}
							hiddenPublishingOptions={hiddenPublishingOptions}
							handleChangeView={handleChangeView}
							collection_properties={collection_properties}
							authUserCollections={authUserCollections}
							authUserCollectionsIsFetching={authUserCollectionsIsFetching}
						/>
					)}

					{currentView === STEPS.PRODUCTS ? ( // second step
						<ReviewCollectionContainerWrapper>
							<div>
								<div className={style.headerTextContainer}>
									{/* Title section START */}
									<div className={style.headerFlex}>
										<div>
											<p className={style.collectionName}>
												<span className={style.collectionNameText}>
													Products
												</span>
												{/* <ShoppingCartOutlined className='text-xl-1 md:text-2xl flex my-auto' /> */}
												{/* {currentCollection._id &&
												!isFetchProductsInProgress &&
												
												(isSellerLoggedIn || isStoreAdminLoggedIn) ? (
													<>
														<Tooltip title='Add new products of your choice by uploading images or CSV'>
															<button
																onClick={() => setAddProductModalOpen(true)}
																className={style.countText}>
																+
															</button>
														</Tooltip>
														{productsToShow.length ? (
															<Tooltip title='Download products in the CSV and you may edit and upload it again with updated data'>
																<DownloadOutlined
																	onClick={handleSellerDownloadCsv}
																	role='button'
																	className={style.countTextSmall}
																/>
															</Tooltip>
														) : null}
													</>
												) : null} */}
											</p>
										</div>
										<div className={style.mlAutoFlexGap2}>
											<>
												<button
													type='button'
													onClick={handleDiscard}
													className={style.cancelButton}>
													Cancel
												</button>

												{!isNewCollection && (
													<button
														onClick={handlePreviewCollectionPage}
														className={style.primaryButton}
													// isNewCollection ? "bg-indigo-400" : "bg-indigo-600"
													// disabled={isNewCollection}
													>
														{currentCollection.status === PUBLISHED
															? "View"
															: "Preview"}
													</button>
												)}

												<div className={style.hiddenLgInlineBlock}>
													<button
														onClick={() => handleChangeView(STEPS.CONTENT)}
														className={style.navButton}>
														Previous
													</button>
												</div>
												<div className={style.hiddenLgInlineBlock}>
													<button
														onClick={() => handleChangeView(STEPS.PUBLISH)}
														className={style.navButton}>
														Next
													</button>
												</div>
												{/* <div className='mt-4 sm:mt-0'>
													<PublishingOptionsDropdown
														handleSelectPublishingOption={
															handleSelectPublishingOption
														}
														selectedOption={publishingOption}
														hiddenPublishingOptions={hiddenPublishingOptions}
														isDisabled={isNewCollection}
													/>
												</div> */}
											</>
										</div>
									</div>
									{/* Title section END */}


									{/* hashtags section */}
									{/* {enableCustomFilter ? (
										<CustomFilter
											customFilterStringData={filters.custom_filter}
											handleSaveEditCustomFilter={handleSaveEditCustomFilter}
											customFilter={customFilter}
											setCustomFilter={setCustomFilter}
											handleCustomFilterChange={handleCustomFilterChange}
											showCustomFilterInput={showCustomFilterInput}
											setShowCustomFilterInput={setShowCustomFilterInput}
											checkAndShowContainer={checkAndShowContainer}
										/>
									) : null} */}

									{/* // DELETE // Should be REMOVED */}
									{/* {enableFilters ? (
								<>
									<div className='flex flex-col lg:flex-row mt-5 justify-between'>
										<div className='flex flex-col lg:flex-row w-full lg:gap-4'>
											{show_filters?.discount?.length ? (
												<div className='flex flex-col lg:w-1/3 mt-4 lg:mt-0'>
													<h5 className='text-slate-200'>Filter by Discount</h5>
													<Select
														allowClear
														className='w-full'
														placeholder='Select discount'
														onChange={(v) =>
															onFiltersChange("discount", v ? [v] : [])
														}
														value={filters.discount[0]}>
														{show_filters?.discount.map(
															(filter) => (
																<Option value={filter} key={filter}>
																	{filter}
																</Option>
															)
														)}
													</Select>
												</div>
											) : null}
											{priceRangeMinMax[0] !== priceRangeMinMax[1] ? (
												<div className='flex flex-col lg:w-2/3 mt-4 lg:mt-0'>
													<h5 className='text-slate-200'>
														Filter by Price Range
													</h5>
													<div
														//  added slider selector for price range to select any custom price rang dynamic
														className='flex items-center'>
														<h5 className='text-slate-200 mb-0'>
															{priceRangeMinMax[0]}
														</h5>
														<div className='w-full'>
															<Slider
																range
																// defaultValue={[20, 50]}
																onChange={(v) => {
																	onFiltersChange("priceRange", v);
																}}
																value={filters.priceRange}
																min={priceRangeMinMax[0]}
																max={priceRangeMinMax[1]}
																className='mx-3'
																trackStyle={[
																	{
																		backgroundColor: "#4F46E5",
																	},
																]}
																handleStyle={[
																	{
																		backgroundColor: "#4F46E5",
																		borderColor: "#4F46E5",
																	},
																	{
																		backgroundColor: "#4F46E5",
																		borderColor: "#4F46E5",
																	},
																]}
															/>
														</div>
														<h5 className={style.textGray103Mb0}>
															{priceRangeMinMax[1]}
														</h5>
													</div>
												</div>
											) : null}
										</div>
									</div>
									<div className={style.filterRow}>
										<div className={style.filterCol}>
											{show_filters?.brand?.length ? (
												<div className={style.filterInnerCol}>
													<h5 className={style.textGray103}>Filter by Seller</h5>
													<Select
														mode='multiple'
														allowClear
														className={style.wFullRoundedXl}
														placeholder='Select sellers'
														onChange={(v) => onFiltersChange("brand", v)}
														value={filters.brand}>
														{show_filters?.brand.map(
															(filter) => (
																<Option key={filter}>{filter}</Option>
															)
														)}
													</Select>
												</div>
											) : null}
											{show_filters?.product_brand?.length ? (
												<div className={style.filterInnerColMt}>
													<h5 className={style.textGray103}>Filter by Brand</h5>
													<Select
														allowClear
														mode='multiple'
														className={style.wFull}
														placeholder='Select product brands'
														onChange={(v) =>
															onFiltersChange("product_brand", v)
														}
														value={filters.product_brand}>
														{show_filters?.product_brand.map(
															(filter) => (
																<Option value={filter} key={filter}>
																	{filter}
																</Option>
															)
														)}
													</Select>
												</div>
											) : null}
											<div className={style.filterInnerColMtItemsEnd}>
												<div className={style.flexItemsCenter}>
													<button
														className={style.applyButton}>
														onClick={handleFilterGoClick} // save the go state as well to save it on show plist page
														role='button'>
														Go
													</button>
													<p
														className={style.clearButton}>
														onClick={handleClearFiltersClick}
														role='button'>
														Clear Filters
													</p>
												</div>
											</div>
										</div>
									</div>
								</>
							) : null} */}


									{/* sort products and filter products section end */}

									{/* Add more kewords button */}
									<div className={styles.flexJustifyBetween}>
										<div>
										</div>
										<div
											className={`${style.addKeywordButton} Add_to_keyword`}
											title={`Click to edit ${TAGS_TITLE}, You can update the ${TAGS_TITLE} and get the products`}
											onClick={handleEditTagsBtnClick}>
											{/* <PlusOutlined className='stroke-current stroke-13' /> */}
											<span> <PlusOutlined /> Add more Keywords</span>
										</div>
									</div>

									{/* all tags */}

									<div>
										<div className={style.grayJustifyBetween}>
											<div>
												{/* <p className='m-0 text-base capitalize'>{TAGS_TITLE}</p> */}
												{isConfirmationRequiredOnTagDelete &&
													tagEdited.isEdited ? (
													<>
														{tagEdited.deleted.length ? (
															<Alert
																message={`Would you like to remove products related to:${tagEdited.deleted.join(
																	", "
																)}? `}
																// description='Info Description Info Description Info Description Info Description'
																type='info'
																className={`${style.my2RoundedMd} tag-select-input`}
																onClose={() => clearTagEdited({ deleted: [] })}
																action={
																	<div>
																		<button
																			onClick={() =>
																				handleFetchProductsOnTagsEdited({
																					deleted: tagEdited.deleted,
																					latest: tagEdited.latest,
																					useUpdateTag: true,
																				})
																			}
																			className={style.indigoBadge}>
																			Yes
																		</button>
																	</div>
																}
																closable
															/>
														) : null}
													</>
												) : null}
												{isConfirmationRequiredOnTagDelete &&
													tagEdited.isAdditionalTagsEdited ? (
													<>
														{tagEdited.additionalTagsDeleted.length ? (
															<Alert
																message={`Would you like to remove products related to: ${tagEdited.additionalTagsDeleted.join(
																	", "
																)}?`}
																// description='Info Description Info Description Info Description Info Description'
																type='info'
																className={`${style.my2RoundedMd} tag-select-input`}
																onClose={() =>
																	clearTagEdited({
																		additionalTagsDeleted: [],
																	})
																}
																action={
																	<div>
																		<button
																			onClick={() =>
																				handleFetchProductsOnTagsEdited({
																					additionalTagsDeleted:
																						tagEdited.additionalTagsDeleted,
																					additionalTagsLatest:
																						tagEdited.additionalTagsLatest,
																					useUpdateTag: true,
																				})
																			}
																			className={style.indigoBadge}>
																			Yes
																		</button>
																	</div>
																}
																closable
															/>
														) : null}
													</>
												) : null}
											</div>
											{/* <div className='flex items-center'>
												{!showEditTagsInput && (
													<>
														<p
															onClick={() => setShowEditTagsInput(true)}
															className='underline font-medium cursor-pointer m-0'
															role='button'>
															Edit
														</p>
														<Tooltip title='Click to edit tags, You can update the tags and refetch the products'>
															<InfoCircleOutlined className='pl-1 text-base flex' />
														</Tooltip>
													</>
												)}
											</div> */}
										</div>

										{/* not using,
										    created component Keywords*/}
										{/* <div className='flex flex-wrap'>
											<div className='w-full lg:flex lg:justify-between'>
												{showEditTagsInput ? (
													<>
														<div className='mt-2 w-full'>
															<Select
																mode='tags'
																className='w-full text-base tag-select-input'
																placeholder={`Enter ${TAGS_TITLE}`}
																value={editTagsValue}
																onChange={handleEditTagsChange}
																size='large'
																dropdownStyle={{ display: "none" }}
															/>
															{editTagsError && (
																<p className='text-red-500 font-normal'>
																	{editTagsError}
																</p>
															)}
														</div>
													</>
												) : (
													<div className='flex flex-wrap overflow-auto'>
														{currentCollection.tags?.length ? (
															<>
																{currentCollection.tags.map((tag) => (
																	<div
																		key={tag}
																		className={`flex items-center rounded-md shadow my-2 mr-2 px-2 py-0.75 sm:px-4 w-max ${
																			selectedTags.includes(tag)
																				? "bg-slate-400"
																				: "bg-gray-100"
																		}`}
																		onClick={() => handleTagClick({ tag })}
																		role='button'>
																		<span
																			level={5}
																			className={`m-0 font-normal text-xs md:text-sm ${
																				selectedTags.includes(tag)
																					? "text-white"
																					: "text-black-103"
																			} ${
																				enableTagSelection
																					? "cursor-pointer"
																					: ""
																			}`}>
																			{tag}
																		</span>
																		<button
																			type='button'
																			onClick={(e) =>
																				handleDeleteTagClick(e, [tag])
																			}>
																			<CloseCircleOutlined className='flex ml-1' />
																		</button>
																	</div>
																))}
																{enableTagSelection ? (
																	// <div className='mx-2 my-auto w-max'>
																	// 	<h3
																	// 		className='m-0 font-normal text-xs md:text-sm cursor-pointer text-white underline'
																	// 		onClick={onClearSelectedTagsClick}>
																	// 		Clear
																	// 	</h3>
																	// </div>
																	<div
																		key='All'
																		className={`rounded-md shadow my-2 mr-2 px-2 py-0.75 sm:px-4 w-max ${
																			selectedTags.length
																				? "bg-gray-100"
																				: "bg-slate-400"
																		}`}
																		onClick={() =>
																			selectedTags.length &&
																			onClearSelectedTagsClick()
																		}
																		role='button'>
																		<span
																			level={5}
																			className={`m-0 font-normal text-xs md:text-sm cursor-pointer ${
																				selectedTags.length
																					? "text-black-103"
																					: "text-white"
																			}`}>
																			All
																		</span>
																	</div>
																) : null}
															</>
														) : (
															<p className='text-slate-200 mr-2'>
																No {TAGS_TITLE} found. Click on plus to add{" "}
																{TAGS_TITLE}
															</p>
														)}
														<div
															className='flex justify-center items-center cursor-pointer'
															title={`Click to edit ${TAGS_TITLE}, You can update the ${TAGS_TITLE} and fetch the products`}>
															<PlusOutlined
																className='text-base text-gray-100 flex justify-center items-center stroke-current stroke-13'
																onClick={handleEditTagsBtnClick}
															/>
														</div>
													</div>
												)}
												<div className='text-right pt-2 lg:pl-2'>
													{showEditTagsInput ? (
														<div className='grid grid-cols-2 lg:grid-cols-1 gap-2 w-max ml-auto'>
															<button
																onClick={() => handleEditTagsSaveClick()}
																className='py-0 px-3 text-white rounded-lg h-6 bg-indigo-600'>
																Save
															</button>
															<button
																onClick={handleEditTagsCancel}
																className='py-0 px-3 text-white rounded-lg h-6 bg-indigo-600'>
																Cancel
															</button>
														</div>
													) : // <Tooltip
													// 	title={`Click to edit ${TAGS_TITLE}, You can update the ${TAGS_TITLE} and fetch the products`}>
													// 	<button
													// 		onClick={handleEditTagsBtnClick}
													// 		className='bg-indigo-600 rounded-md shadow px-2 py-0.75 sm:px-4 w-max text-white whitespace-nowrap'>
													// 		Edit
													// 	</button>
													// </Tooltip>
													null}
												</div>
											</div>
										</div> */}

										<CollectionEditTags
											currentCollectionTags={currentCollection.tags}
											selectedTags={selectedTags}
											editTagsValue={editTagsValue}
											editTagsError={editTagsError}
											enableTagSelection={enableTagSelection}
											showEditTagsInput={showEditTagsInput}
											onClearSelectedTagsClick={onClearSelectedTagsClick}
											handleTagClick={handleTagClick}
											handleDeleteTagClick={handleDeleteTagClick}
											handleEditTagsBtnClick={handleEditTagsBtnClick}
											handleEditTagsSaveClick={handleEditTagsSaveClick}
											handleEditTagsCancel={handleEditTagsCancel}
											handleEditTagsChange={handleEditTagsChange}
										/>

										{/* Additional tags Display */}
										{additionalTagsToShow && additionalTagsToShow.length ? (
											<div className='mt-2.5'>
												<div className='flex justify-between'>
													<div>
														<p className='mb-2 text-sm'>
															We have found some additional {TAGS_TITLE}
														</p>
													</div>
												</div>
												<div className='flex flex-wrap'>
													<div className='w-full lg:flex lg:justify-between'>
														<div className='flex flex-wrap gap-2 overflow-auto pb-1'>
															<>
																{additionalTagsToShow.map((tag) => (
																	<div
																		key={tag}
																		className={`${style.additionalTagBadge} ${selectedAdditionalTags.includes(tag) ? style.bgNewColor200 : style.bgWhite}`}
																		onClick={() =>
																			handleTagClick({
																				tag,
																				isAdditional: true,
																			})
																		}
																		role='button'>
																		<span
																			level={5}
																			className={`${style.additionalTagText} ${enableTagSelection ? style.cursorPointer : ""}`}>
																			{tag}
																		</span>
																		<button
																			type='button'
																			onClick={(e) =>
																				handleDeleteAdditionTags(e, [tag])
																			}>
																			<CloseCircleOutlined className={style.flexMl1} />
																		</button>
																	</div>
																))}
															</>
														</div>
													</div>
												</div>
											</div>
										) : null}
									</div>

									{/* hastag component */}
									{enableFilters ? (
										<div className={styles.filtersContainer}>
											<div className={styles.wFull}>
												<ProductFiltersTags
													isproductSection={true}
													productFilters={filters}
													handleFiltersInputClear={handleFiltersInputClear}
													handleClearFiltersClick={handleClearFiltersClick}
													displayFilters={filtersToShow}
													isShowCustomFilter={true}
													handleSaveEditCustomFilter={handleSaveEditCustomFilter}
													selectedTag={selectedTags}
													handleFilterOptionsVisibleChange={handleFilterOptionsVisibleChange}
													filterOptionsVisible={filterOptionsVisible}
													clearFiltersThemeClassName="text-[#232524]"
													buttonThemeClassName="bg-brand"
												/>
											</div>
										</div>
									) : null}

									{enableFilters && filterOptionsVisible ? (
										<div className={style.filterContainerSlate}>
											<div className={style.flexItemsCenterGap4MlAuto}>
												{isFiltersAvailable ? (
													<p
														className={style.clearAllText}
														role='button'
														onClick={handleClearFiltersClick}>
														Clear All
													</p>
												) : null}
												<button
													className={style.indigoBadgeSm}
													onClick={() => handleFilterGoClick(filters)} // save the go state as well to save it on show plist page
													role='button'>
													Go
												</button>
												<CloseOutlined
													className={style.flexText2xlBlack100}
													role='button'
													title='close filters'
													onClick={() =>
														handleFilterOptionsVisibleChange(false)
													}
												/>
											</div>

											{/* <ProductFilters
												productFilters={filters}
												handleFiltersInputChange={onFiltersChange}
												handleFiltersOptionalChange={
													handleFiltersOptionalChange
												}
											/> */}

											<AdditionalAttributes
												additionalAttributesToShow={filtersToShow}
												attributesData={filters}
												handleAdditionalAttributesChange={onFiltersChange}
												handleFiltersOptionalChange={
													handleFiltersOptionalChange
												}
												fontColorTheme='text-black-100'
											/>
										</div>
									) : null}


									{/* sort by products and edit products */}

									{showProductSelection ||
										isShowAddProductsForAmazon ||
										(productsToShow.length && !filterOptionsVisible) ||
										multiProductsSelectionMessage ? (
										<div>
											<div className={`${style.sortRowWrapper} edit_page_sort_div`}>
												<div className={`md:flex gap-2 items-end justify-between w-full ${enableSelectProduct ? "selectedActive_button_mobile" : ""}`} >
													{/* edit products */}
													{showProductSelection ? (
														<div className={style.flexRowGap2Wrap}>
															<div className={style.flexWrapItemsCenterGap3}>
																{enableSelectProduct ? (
																	<>
																		<div
																			className={`flex bg-violet-100  items-center px-2 ${styles.edit_collection_sort_product_list} h-8 md:h-9 rounded-lg`}
																			style={{ width: "200px" }}
																		>
																			<Select
																				className={`${style['custom-select-editcollection']}  w-full text-white placeholder-white `}
																				placeholder="Next Action"
																				onChange={handleSelectChange}
																				value={actionType}
																			>
																				<Option value="delete">Delete</Option>
																				<Option value="showcase">Showcase</Option>
																				<Option value="removeshowcase">Remove from showcase</Option>
																				<Option value="addtoanother">Add to another {WISHLIST_TITLE}</Option>
																				{/* <Option value="cancel">Cancel</Option> */}
																			</Select>
																		</div>
																		<div className={styles.flexItemsCenterGap2}>
																			<div className={style.flexPy1Pl2Nowrap}>
																				<Checkbox
																					className={`${styles.checkboxLabel} editcollection_checkbox`}
																					indeterminate={
																						selectedProducts.length > 0 &&
																						selectedProducts.length <
																						productLists.length
																					}
																					onChange={onSelectAllChange}
																					checked={
																						selectedProducts.length ===
																						productLists.length
																					}>
																					{selectedProducts.length} Selected
																				</Checkbox>
																			</div>
																			<div className={styles.flexItemsCenterGap2}>
																				<button className={styles.buttonDoneCancel} onClick={handleYesClick}>Done</button>
																				<button className={styles.buttonDoneCancel} onClick={handleCancelClick}>Cancel</button>
																			</div>
																		</div>
																	</>
																) :
																	(
																		<div
																			className={`${styles.actionSelectWrapper} ${styles.edit_collection_sort_product_list}`}
																			style={{ width: "200px" }}
																		>
																			<Select
																				className={`${style['custom-select-editcollection']} ${styles.actionSelect}`}
																				placeholder="Next Action"
																				onClick={() => setEnableSelectProduct(true)}
																				onChange={handleSelectChange}
																				value={actionType}
																			>
																				<Option value="delete">Delete</Option>
																				<Option value="showcase">Showcase</Option>
																				<Option value="removeshowcase">Remove from showcase</Option>
																				<Option value="addtoanother">Add to another {WISHLIST_TITLE}</Option>
																				{/* <Option value="cancel">Cancel</Option> */}
																			</Select>
																		</div>
																	)
																}
															</div>
															<div className={styles.statusMessageContainer}>
																{addTomWishlistSuccess &&
																	addToWishlistData &&
																	addToWishlistData.showcase &&
																	addToWishlistData.products &&
																	addToWishlistData.products.length &&
																	addToWishlistData.products[0].starred && (
																		<p className={styles.statusMessageText}>
																			Showcased{" "}
																			{addToWishlistData.products.length}{" "}
																			product(s) on the top
																		</p>
																	)}
																{removeFromWishlistSuccess &&
																	removeFromWishlistData &&
																	removeFromWishlistData.products &&
																	removeFromWishlistData.products.length && (
																		<>
																			<p className={styles.statusMessageText}>
																				{removeFromWishlistData.products.length}{" "}
																				product(s) have been deleted
																			</p>
																		</>
																	)}
															</div>
														</div>
													) : null}
													{/* sort by products */}
													{productsToShow.length ? (
														<div className={`${styles.sortByWrapper} sort_dropdown`}>
															{/* <div className="colloction_details_tag_div"></div> */}
															<div className={`${styles.sortBySelectContainer} ${styles.edit_collection_sort_product_list}`}>
																<label className={styles.sortByLabel}>
																	Sort by :
																</label>
																<Select
																	name='sortBy'
																	className={`${styles.sortBySelect} ant_icon`}
																	size='small'
																	value={selectedSortOption.id}
																	onChange={handleSortOptionChange}>
																	{PRODUCT_SORT_OPTIONS?.map((item) => (
																		<Option key={item.id} value={item.id}>
																			{item.id}
																		</Option>
																	))}
																</Select>
															</div>
														</div>
													) : null}
												</div>
												{
													enableFilters ? (
														<div className={`${styles.filterOptionsWrapper} filter-options-popover-wrapper`}>
															<Tooltip title='Click to see filter options'>
																<div
																	className={styles.filterIcon}
																	onClick={() => {
																		handleFilterOptionsVisibleChange(
																			!filterOptionsVisible
																		);
																	}}>
																	<img src={FilterIconEdit} alt="" />
																</div>
															</Tooltip>
														</div>
													) : null
												}
											</div>
											{multiProductsSelectionMessage ? (
												<div className={styles.multiProductMessage}>
													<p>{multiProductsSelectionMessage}</p>
												</div>
											) : null}
										</div>
									) : null}

									{enableFilters || productsToShow.length ? (
										<div className={styles.filterFooter}>
											{!enableSelectProduct ? (
												<div className={styles.filterFooterActions}>
													{/* {isShowAddProductsForAmazon ? (
														<div className={style['amazon-button-loader']}>
															<Tooltip title='Add Products from Amazon'>
																<Button
																	onClick={() =>
																		handleAddAmazonProductsClick({
																			tags: isEmpty(selectedTags)
																				? currentCollection.tags
																				: selectedTags,
																		})
																	}
																	size='small'
																	loading={isAddAmazonProductsInProgress}
																	className={style.violetBadgeAlt}>
																	Add Products from Amazon
																</Button>
															</Tooltip>
														</div>
													) : null} */}

													{/* {productsToShow.length && !filterOptionsVisible ? (
														<RefetchButton />
													) : null} */}
												</div>
											) : null}
										</div>
									) : null}

								</div>


								{currentCollection.status !== IN_PROGRESS ? (
									<div className="Product_Cards_Div">
										<ReviewCollectionPlist
											productCountToShow={productCountToShow(
												width,
												!!currentCollection.cover_image
											)}
											status={currentCollection.status}
											productLists={productsToShow}
											isFetching={authUserCollectionsIsFetching}
											enableSelectProduct={enableSelectProduct}
											selectedProducts={selectedProducts}
											onSelectTagProductsClick={onSelectTagProductsClick}
											onSelectProductClick={onSelectProductClick}
											removeProductsFromCollection={removeProductsFromCollection}
											removeSponsorProductsFromCollection={
												removeSponsorProductsFromCollection
											}
											starProductsFromCollection={showcaseCollectionProducts} // sending list of mfr codes to un-star the product with the same API
											authUser={authUser}
											isFetchProductsInProgress={isFetchProductsInProgress}
											updateWishlistInProgress={updateWishlistInProgress}
											addTomWishlistInProgress={addTomWishlistInProgress}
											handleConfirmRefetchProducts={handleConfirmRefetchProducts}
											showFetchMoreButton={
												isFetchMoreEnabled &&
												currentCollection.hasMoreProducts !== false
											}
											fetchMoreLoading={isFetchProductsInProgress}
											sponsor_details={currentCollection.sponsor_details}
											isTagsSelected={!isEmpty(tagsToFilter)}
											handleEditTagsBtnClick={handleEditTagsBtnClick}
											isEditTagsOpen={showEditTagsInput}
											currentCollection={currentCollection}
											sellerDetails={sellerDetails}
											// handleUploadMyCollectionsProducts={
											// 	handleUploadMyCollectionsProducts
											// }
											currentSellerBrandDetails={currentSellerBrandDetails}
											selectedTags={selectedTags}
										/>
									</div>
								) : (
									<p className={style.textXlGray103My8Center}>
										Fetching products...
									</p>
								)}
								<div className={style.mt25TabletMt4}>
									<RefetchButton />
									

								</div>
							</div>
						</ReviewCollectionContainerWrapper>
					) : null
					}

					{/* // AskQuestion Component memorized  */}
					{askQuestionComponentMemo}
					{/* show backdrop loader */}
					{
						showBackdropLoader && (
							<div className={style.fixedOverlayGray102}>
								<Spin
									// indicator={<LoadingOutlined className='text-3xl-1' spin />}
									indicator={
										<Loading3QuartersOutlined
											className='flex text-6xl-1 text-indigo-100'
											spin
										/>
									}
								/>
							</div>
						)
					}
					{/* add custom product modal UI */}
					{/* {currentCollection._id && (
						// 	<CustomProductModal
						// 	isModalOpen={addProductModalOpen}
						// 	onModalClose={() => setAddProductModalOpen(false)}
						// 	collectionData={currentCollection}
						// />
						<UploadMultiProductsModal
							isModalOpen={addProductModalOpen}
							onModalClose={() => {
								setAddProductModalOpen(false);
								setUploadProductDefaultMode(null);
							}}
							collectionData={currentCollection}
							onSubmit={handleUploadProductsSubmit}
							sellerDetails={sellerDetails}
							authUser={authUser}
							defaultMode={uploadProductDefaultMode}
						/>
					)} */}

					{/* show backdrop loader when regenerate content and keywords for video_based collection */}
					{
						isVideoDataExtractionStarted ? (
							<div className={style.fixedOverlayGray112}>
								<Spin
									indicator={
										<Loading3QuartersOutlined
											className={style.flexText6xlIndigo100}
											spin
										/>
									}
								/>
								<p className={style.textLgIndigo100Mt4Center}>
									<b>Preparing the content from the video.</b>
									<br />
									<b>
										We will notify you once it is ready.
										<br />
										Meanwhile feel free to{" "}
										<span
											onClick={() => dispatch(setShowChatModal(true))}
											role='button'
											className={style.underlineCursorPointer}>
											search for products
										</span>{" "}
										or{" "}
										<span
											onClick={() => navigate(pathToStore)}
											role='button'
											className={style.underlineCursorPointer}>
											visit the store
										</span>
									</b>
								</p>
							</div>
						) : null
					}
				</div >
			</div >
		</div >
	);
};

export default ReviewCollection;
