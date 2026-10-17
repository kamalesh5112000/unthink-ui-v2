import React, { useEffect, useMemo, useState } from "react";
import {
	Typography,
	Input,
	notification,
	Spin,
	Upload,
	Select,
	Tooltip,
	Checkbox,
	Alert,
} from "antd";
import {
	ArrowLeftOutlined,
	PictureOutlined,
	InfoCircleOutlined,
	UploadOutlined,
} from "@ant-design/icons";
import { LazyLoadImage } from "react-lazy-load-image-component";

import {
	setIsCreateWishlist,
	setIsEditWishlist,
	closeWishlistModal,
	setProductsToAddInWishlist,
} from "./redux/actions";
import { useDispatch, useSelector } from "react-redux";
import { collectionPageAPIs, profileAPIs } from "../../helper/serverAPIs";
import {
	// COLLECTION_COVER_IMG_SIZES,
	COLLECTION_GENERATED_BY_BLOG_BASED,
	COLLECTION_GENERATED_BY_DESC_BASED,
	COLLECTION_GENERATED_BY_VIDEO_BASED,
	COLLECTION_GENERATED_BY_PLIST_BASED,
	COLLECTION_PRIVATE,
	COLLECTION_TYPE_AUTO_PLIST,
	COLLECTION_TYPE_CUSTOM_PLIST,
	PUBLISHED,
	TAGS_TITLE,
	WISHLIST_TITLE,
	favorites_collection_name,
} from "../../constants/codes";
import { getCurrentUserStore } from "../Auth/redux/selector";
import {
	checkIsFavoriteCollection,
	getFinalImageUrl,
	isEmpty,
} from "../../helper/utils";
import { useRouter } from 'next/router';
import { useNavigate } from "../../helper/useNavigate";

import {
	createWishlist,
	createWishlistReset,
} from "../wishlistActions/createWishlist/redux/actions";
import {
	updateWishlist,
	updateWishlistReset,
} from "../wishlistActions/updateWishlist/redux/actions";

const { Text } = Typography;
const { TextArea } = Input;
const { Dragger } = Upload;
const { Option } = Select;

const initialWishlistData = {
	collection_name: "",
	description: "",
	cover_image: "",
	video_url: "",
	blog_url: "",
	tags: [],
};

// keep the blog url for which the tags are already fetched
let fetchedTagsByTheBlogUrl = "";

const CreateWishlist = ({
	allWishlist,
	selectedWishlist = {},
	title,
	addProductToWishlist,
	createCollectionPreDefinedPayload = {},
	trackCollectionId,
	trackCollectionName,
	trackCollectionCampCode,
	trackCollectionICode,
}) => {
	const navigate = useNavigate();
	const [
		authUser,
		isGuestUser,
		isSavingUserInfo,
		enablePlist,
		isCreateWishlist,
		isEditWishlist,
		productsToAddInWishlist,
		productsToAddInWishlistData,
		collectionPayload,
		showProcessingLoader,
		// isSaveProductLists,
		updateWishlistReducer,
		createWishlistReducer,
		collectionProperties,
	] = useSelector((state) => [
		state.auth.user.data,
		state.auth.user.userNotFound,
		state.auth.user.isSavingUserInfo,
		state.auth.user.enablePlist,
		state.appState.wishlist.isCreateWishlist,
		state.appState.wishlist.isEditWishlist,
		state.appState.wishlist.productsToAddInWishlist,
		state.appState.wishlist.productsToAddInWishlistData,
		state.appState.wishlist.collectionPayload,
		state.appState.wishlist.selectedCollection.showProcessingLoader,
		// state.appState.wishlist.isSaveProductLists,
		state.wishlistActions.updateWishlist,
		state.wishlistActions.createWishlist,
		state.store.data.collection_properties,
	]);
	// console.log('collectionPayload',collectionPayload)
	const currentStore = useSelector(getCurrentUserStore);

	const {
		isFetching: updateWishlistInProgress,
		success: updateWishlistSuccess,
		error: updateWishlistError,
		data: updateWishlistData,
	} = updateWishlistReducer;

	const {
		isFetching: createWishlistInProgress,
		success: createWishlistSuccess,
		error: createWishlistError,
		data: createWishlistData,
	} = createWishlistReducer;

	const isSavingWishlist = updateWishlistInProgress || createWishlistInProgress;

	const closeEditScreen = () => {
		dispatch(setIsEditWishlist(false));
	};

	const closeCreateScreen = () => {
		dispatch(setIsCreateWishlist(false));
	};

	useEffect(
		() => () => {
			fetchedTagsByTheBlogUrl = "";
		},
		[]
	);

	useEffect(() => {
		if (updateWishlistSuccess) {
			// on edit collection success
			notification["success"]({
				message: `${WISHLIST_TITLE} Updated Successfully!`,
			});
			dispatch(updateWishlistReset());
			closeEditScreen();
		}
	}, [updateWishlistSuccess]);

	useEffect(() => {
		if (updateWishlistError) {
			// on edit collection failure

			notification["error"]({
				message:
					updateWishlistData?.status_desc ||
					`Unable to update ${WISHLIST_TITLE}`,
			});
			dispatch(updateWishlistReset());
		}
	}, [updateWishlistError]);

	useEffect(() => {
		if (createWishlistSuccess) {
			// on create collection success
			// notification["success"]({
			// 	message: `${WISHLIST_TITLE} Created Successfully!`,
			// });

			dispatch(createWishlistReset());
			closeCreateScreen();
		}
	}, [createWishlistSuccess]);

	useEffect(() => {
		if (createWishlistError) {
			// on create collection failure
			if (createWishlistData?.status_desc) {
				setError({
					...error,
					api: createWishlistData.status_desc,
				});
			}
			dispatch(createWishlistReset());
		}
	}, [createWishlistError]);

	const [wishlistData, setWishlistData] = useState(initialWishlistData);
	const [error, setError] = useState({
		api: "",
		collection_name: "",
		blogUrl: "",
		blog_filter: "",
		description: "",
	});
	const [isUploading, setIsUploading] = useState(false);
	const [isVideoUploading, setIsVideoUploading] = useState(false);
	const [savedImage, setSavedImage] = useState("");
	const [enableReRun, setEnableReRun] = useState(false);
	const [isFetchProductsChecked, setIsFetchProductsChecked] = useState(false);
	const [fetchingTags, setFetchingTags] = useState(false); // fetching tags by user entered blog url on blur of blog url input

	const isGeneratedByDesc = useMemo(
		() =>
			selectedWishlist.type === COLLECTION_TYPE_AUTO_PLIST &&
			selectedWishlist.generated_by === COLLECTION_GENERATED_BY_DESC_BASED,
		[selectedWishlist.type, selectedWishlist.generated_by]
	);

	const uploadProps = {
		accept: "image/*",
		multiple: false,
		customRequest: async (info) => {
			try {
				setIsUploading(true);
				if (info?.file) {
					const response = await profileAPIs.uploadImage({
						file: info.file,
						// custom_size: COLLECTION_COVER_IMG_SIZES,
					});
					if (response?.data?.data) {
						if (response.data.data[0]) {
							setWishlistData((currentData) => ({
								...currentData,
								cover_image: response?.data?.data[0].url,
							}));
							setSavedImage(response?.data?.data[0].url);
						}
					}
				}
			} catch (error) {
				notification["error"]({
					message: "Failed to upload cover image",
				});
			}
			setIsUploading(false);
		},
	};

	const uploadVideoProps = {
		accept: ".mp4",
		multiple: false,
		customRequest: async (info) => {
			try {
				setIsVideoUploading(true);
				if (info?.file) {
					const response = await profileAPIs.uploadVideo({
						file: info.file,
						store: currentStore,
					});

					if (response?.data?.data?.[0]) {
						setWishlistData((currentData) => ({
							...currentData,
							video_url: response.data.data[0].url,
						}));
					}
				}
			} catch (error) {
				notification["error"]({
					message: "Failed to upload video",
				});
			}
			setIsVideoUploading(false);
		},
	};

	useEffect(() => {
		if (selectedWishlist._id) {
			setWishlistData({
				...(isEditWishlist ? wishlistData : {}),
				...selectedWishlist,
				tags: selectedWishlist.tags || [],
			});

			setSavedImage(selectedWishlist.cover_image);
		}
	}, [selectedWishlist]);

	// auto populate wishlistData. collection created on save click of AURA  response
	useEffect(() => {
		if (!isEmpty(productsToAddInWishlistData)) {
			setWishlistData(productsToAddInWishlistData);
		}
	}, []);

	const dispatch = useDispatch();

	const onBackClick = () => {
		if (isCreateWishlist) {
			closeCreateScreen();
		} else if (isEditWishlist) {
			closeEditScreen();
		}
		setWishlistData(initialWishlistData);
	};

	const handleInputChange = (e) => {
		const { name, value, checked, type } = e.target;

		setWishlistData({
			...wishlistData,
			[name]: type === "checkbox" ? checked : value,
		});
	};

	const handleAutoCollectionCheckboxChange = () => {
		setIsFetchProductsChecked((v) => !v);
	};

	// fetch tags and attributes by blog url and apply to the tags automatically
	const fetchAndApplyTagsByBlogUrl = async (blog_url) => {
		if (blog_url && blog_url !== fetchedTagsByTheBlogUrl) {
			setFetchingTags(true);
			try {
				const result = await collectionPageAPIs.getAttributesAPICall({
					blog_url,
				});

				fetchedTagsByTheBlogUrl = blog_url;

				if (result.data?.data?.tags) {
					handleTagChange(result.data.data.tags, "tags");
				}
			} catch (error) {}
			setFetchingTags(false);
		}
	};

	const handleBlogUrlInputBlur = (e) => {
		isCreateWishlist &&
			wishlistData.blog_url &&
			// !existingBlog &&
			fetchAndApplyTagsByBlogUrl(wishlistData.blog_url);
	};

	const handleTagChange = (value = [], name) => {
		setWishlistData((data) => ({
			...data,
			[name]: value.map((t) => t.trim()).filter((t) => t),
		}));
	};

	const onCoverImageCancel = (e) => {
		e.stopPropagation();
		setWishlistData({ ...wishlistData, cover_image: savedImage });
	};

	// To check collection with same name exists or not
	const isCollectionAlreadyExist = (collection_name) => {
		return (
			allWishlist.filter(
				(collection) =>
					collection.collection_name.toLowerCase() ===
					collection_name.toLowerCase()
			).length > 0
		);
	};

	// // To check collection blog page with same name exists or not
	// const isCollectionPageAlreadyExist = () => {
	// 	const pages = wishlistOwner?.store?.[currentStore]?.pages || [];
	// 	return (
	// 		pages.filter(
	// 			(page) =>
	// 				page.collection_name.toLowerCase() ===
	// 				wishlistData.collection_name.toLowerCase()
	// 		).length > 0
	// 	);
	// };

	// const existingBlog = useMemo(
	// 	() =>
	// 		wishlistData.blog_url &&
	// 		allWishlist.find((cl) => cl.blog_url === wishlistData.blog_url.trim()),
	// 	[allWishlist, wishlistData.blog_url]
	// );

	useEffect(() => {
		if (error.blogUrl && wishlistData.blog_url) {
			setError({ ...error, blogUrl: "" });
		}
	}, [wishlistData.blog_url]);

	const enableAutoFetchProducts = useMemo(
		() => !isGuestUser && !productsToAddInWishlist.length,
		[]
	);
	const isFormValid = () => {
		let isValid = true;
		const errorList = {
			api: "",
			collection_name: "",
			blogUrl: "",
			description: "",
		};
		if (!wishlistData.collection_name) {
			// collection name is required
			errorList.collection_name = `Please enter ${WISHLIST_TITLE} name`;
			isValid = false;
		} else if (
			// collection name is already exist
			selectedWishlist.collection_name !== wishlistData.collection_name &&
			(isCollectionAlreadyExist(wishlistData.collection_name) ||
				checkIsFavoriteCollection(wishlistData))
			// selectedBlogToedit?.collection_name !== wishlistData.collection_name // REMOVE
		) {
			errorList.collection_name = `${WISHLIST_TITLE} name already exists`;
			isValid = false;
		}

		if (wishlistData.blog_url) {
			// if blog url is entered
			try {
				const isValidBlogUrl = new URL(wishlistData.blog_url);

				if (
					!(
						isValidBlogUrl &&
						(isValidBlogUrl.protocol === "http:" ||
							isValidBlogUrl.protocol === "https:")
					)
				) {
					// check url should be valid
					// check protocols must be http or https
					errorList.blogUrl = "Please enter valid blog url";
					isValid = false;
				}
				// else if (
				// 	!existingBlog &&
				// 	(isEditWishlist || productToAddInWishlist.mfr_code)
				// ) {
				// 	// entered blog url is not exist with any collection
				// 	// and if editing collection or creating collection while add to collection
				// 	errorList.blogUrl =
				// 		"No blog page found associated with provided blog url.";
				// 	isValid = false;
				// }
			} catch {
				errorList.blogUrl = "Please enter valid blog url";
				isValid = false;
			}
		}

		// if the fetch products checkbox is checked
		// at-least one tag should be present to fetch the products
		if (enableAutoFetchProducts && isFetchProductsChecked) {
			if (!wishlistData.tags?.length) {
				errorList.blog_filter = `Please enter some ${TAGS_TITLE} that indicate the type of products to fetch`;
				isValid = false;
			}
		}

		// if re-run is enabled then description must be edited at the time of save otherwise show message and not allow to save
		if (
			isGeneratedByDesc &&
			enableReRun &&
			wishlistData.description === selectedWishlist.description
		) {
			errorList.description =
				"Please modify the description to re-fetch the products";
			isValid = false;
		} else if (isGeneratedByDesc && enableReRun && !wishlistData.description) {
			// description is required when re-run is enabled
			errorList.description = "Please enter the description";
			isValid = false;
		}

		setError(errorList);
		return isValid;
	};

	const onSaveClick = () => {
		// create normal collection base on blog url. if a collection is exits with entered blog url
		// then collection will be created for that blog otherwise new blog page will be created
		// if blog url is not entered then normal collection will be created
		if (isFormValid()) {
			setError({
				api: "",
				collection_name: "",
				blogUrl: "",
				blog_filter: "",
				description: "",
			});

			if (isEditWishlist) {
				// edit collection

				const dataFromSelectedWishlist = {
					_id: selectedWishlist._id,
					collection_name: selectedWishlist.collection_name,
					description: selectedWishlist.description,
					cover_image: selectedWishlist.cover_image,
					video_url: selectedWishlist.video_url,
					tags: selectedWishlist.tags,
					blog_url: selectedWishlist.blog_url,
				};

				const dataFromWishlistData = {
					collection_name: wishlistData.collection_name,
					description: wishlistData.description,
					cover_image: wishlistData.cover_image,
					video_url: wishlistData.video_url,
					tags: wishlistData.tags,
					blog_url: wishlistData.blog_url,
				};

				const editPayload = {
					...dataFromSelectedWishlist,
					...dataFromWishlistData,
					enableReRun,
					enableReFetchProducts:
						enableAutoFetchProducts && isFetchProductsChecked,
					fetchUserCollections: true,
				};

				dispatch(updateWishlist(editPayload));
			} else {
				// create collection
				const createPayload = {
					...wishlistData,
					...createCollectionPreDefinedPayload,
					fetchUserCollections: true,
					product_lists: productsToAddInWishlist,
					type: COLLECTION_TYPE_CUSTOM_PLIST,
				};

				if (collectionPayload?.tags?.length) {
					createPayload.tags = collectionPayload.tags;
				}
				if (!isEmpty(collectionPayload?.keyword_tag_map)) {
					createPayload.keyword_tag_map = collectionPayload.keyword_tag_map;
				}

				createPayload.tag_map = !isEmpty(collectionPayload?.tag_map)
					? collectionPayload.tag_map
					: createPayload.tag_map || {};

				if (wishlistData.generated_by) {
					createPayload.generated_by = wishlistData.generated_by;
				} else if (wishlistData.video_url) {
					createPayload.generated_by = COLLECTION_GENERATED_BY_VIDEO_BASED;
				} else if (wishlistData.blog_url) {
					createPayload.generated_by = COLLECTION_GENERATED_BY_BLOG_BASED;
				} else {
					createPayload.generated_by = COLLECTION_GENERATED_BY_DESC_BASED;
				}

				// if (existingBlog) {
				// 	// create normal collection as a child of the blog url collection
				// 	createPayload.type = COLLECTION_TYPE_CUSTOM_PLIST;
				// 	createPayload.generated_by = COLLECTION_GENERATED_BY_PLIST_BASED;
				// 	createPayload.parent_collection_id = existingBlog._id;
				// } else

				// if (!isSaveProductLists) {
				// 	if (
				// 		enableAutoFetchProducts &&
				// 		isFetchProductsChecked &&
				// 		// !existingBlog &&
				// 		enablePlist
				// 	) {
				// 		// create auto plist collection based on blog or description
				// 		createPayload.type = COLLECTION_TYPE_AUTO_PLIST;
				// 		createPayload.fetch_products = true;
				// 	} else {
				// 		// normal collection
				// 		createPayload.type = COLLECTION_TYPE_CUSTOM_PLIST;
				// 	}

				// 	if (wishlistData.blog_url) {
				// 		// collection based on blog url
				// 		createPayload.generated_by = COLLECTION_GENERATED_BY_BLOG_BASED;
				// 	} else {
				// 		createPayload.generated_by = COLLECTION_GENERATED_BY_DESC_BASED;
				// 	}

				// 	if (productsToAddInWishlist.length) {
				// 		createPayload.products = !isSaveProductLists
				// 			? productsToAddInWishlist
				// 					.filter((p) => !p.handpicked)
				// 					.map((p) => ({
				// 						tagged_by: p.tagged_by || [],
				// 						mfr_code: p.mfr_code,
				// 					}))
				// 			: undefined;
				// 		createPayload.product_lists = isSaveProductLists
				// 			? productsToAddInWishlist
				// 			: productsToAddInWishlist
				// 					.filter((p) => p.handpicked)
				// 					.map((p) => ({ ...p, starred: true }));

				// 		createPayload.closeModalOnSuccess = true; // close the modal on success of add to collection after create collection
				// 		if (productsToAddInWishlist.length === 1) {
				// 			createPayload.addToCollectionEventForTracking = {
				// 				mfrCode: productsToAddInWishlist[0].mfr_code,
				// 				product_brand: productsToAddInWishlist[0].product_brand,
				// 				brand: productsToAddInWishlist[0].brand,
				// 				collectionId: trackCollectionId,
				// 				iCode: authUser.influencer_code,
				// 				campCode: trackCollectionCampCode,
				// 				collectionName: trackCollectionName,
				// 				collectionICode: trackCollectionICode,
				// 			}; // event data to send after add to collection after success create collection
				// 		}
				// 	}
				// }
				dispatch(setProductsToAddInWishlist([]));

				dispatch(createWishlist(createPayload));
			}
		}
	};

	return (
		<div className='px-7 h-full'>
			<div
				className='flex items-center cursor-pointer max-w-max'
				onClick={onBackClick}>
				<ArrowLeftOutlined className='text-base flex' />
				<Text className='pl-3 text-base font-medium'>Back</Text>
			</div>
			{/* {enablePlist && isCreateWishlist && (
				<Alert
					className='mt-4'
					description={
						<>
							<p className='text-sm font-medium m-0'>
								Try our new{" "}
								<span
									className='font-bold text-blue-103 cursor-pointer'
									onClick={() => {
										dispatch(closeWishlistModal());
										closeCreateScreen();
										navigate("/create-collection");
									}}>
									Create collection
								</span>{" "}
								experience.{" "}
							</p>
							<p className='text-sm font-medium m-0'>
								AI assisted content writing to help you write!
							</p>
						</>
					}
					type='info'
				/>
			)} */}
			<div className='pt-4 flex justify-between items-center'>
				<Text className='text-xl font-medium'>{title}</Text>
				{isSavingWishlist || isSavingUserInfo || showProcessingLoader ? (
					<Spin />
				) : (
					<Text
						className='pl-3 text-sm text-blue-103 font-bold cursor-pointer'
						onClick={onSaveClick}>
						SAVE
					</Text>
				)}
			</div>
			<div className='pt-8'>
				<div>
					<div>
						{error.api && <Text className='text-red-500'>{error.api}</Text>}
					</div>
					<span className='text-sm'>Name</span>
					{isEditWishlist && checkIsFavoriteCollection(selectedWishlist) ? (
						<Input
							value={favorites_collection_name}
							name='collection_name'
							className='bg-transparent mt-1'
							disabled
						/>
					) : (
						<Input
							value={wishlistData.collection_name}
							placeholder={`Enter ${WISHLIST_TITLE} name`}
							onChange={handleInputChange}
							name='collection_name'
							className='bg-transparent mt-1'
						/>
					)}
				</div>
				{error.collection_name && (
					<Text className='text-red-500'>{error.collection_name}</Text>
				)}
				<div className='mt-5'>
					<div className='flex items-center justify-between'>
						<span className='text-sm'>Description</span>
						{/* show re-run button if collection is user_collection (blog created with descriotion) in response and blog collection is in edit mode */}
						{isGeneratedByDesc && (
							<Checkbox
								onChange={(e) => setEnableReRun(e.target.checked)}
								className='font-medium'
								checked={enableReRun}>
								<div className='flex items-center'>
									<span>Re-run</span>
									<Tooltip title='if you select re-run The description will be edited again by Aura and new set of products will be fetched'>
										<InfoCircleOutlined className='pl-1' />
									</Tooltip>
								</div>
							</Checkbox>
						)}
					</div>
					<TextArea
						rows={4}
						value={wishlistData.description}
						placeholder={`Enter ${WISHLIST_TITLE} description`}
						name='description'
						onChange={handleInputChange}
						className='bg-transparent mt-1'
					/>
				</div>
				{error.description && (
					<Text className='text-red-500'>{error.description}</Text>
				)}
				{/* create a plist from a blog, on quick edit. we hide the blog URL piece for generated by description collections */}
				{enablePlist && !isGeneratedByDesc && (
					<div className='mt-5'>
						<span className='text-sm'>Blog URL (Optional)</span>
						<Input
							value={wishlistData.blog_url}
							placeholder='Enter blog url'
							onChange={handleInputChange}
							name='blog_url'
							className='bg-transparent mt-1'
							disabled={
								selectedWishlist.generated_by ===
								COLLECTION_GENERATED_BY_BLOG_BASED
							}
							onBlur={handleBlogUrlInputBlur}
						/>
					</div>
				)}

				{error.blogUrl && <Text className='text-red-500'>{error.blogUrl}</Text>}
				{/* {existingBlog?.blog_url && isCreateWishlist && (
					<Text className='text-gray-500'>
						This collection will be added to the page corresponding to the{" "}
						{existingBlog?.collection_name} here:{" "}
						<a
							className='p-0 text-sm'
							href={getBlogCollectionPagePath(
								wishlistOwner.user_name,
								existingBlog.path,
								existingBlog._id
							)}
							target='_blank'>
							{window.location.origin}
							{getBlogCollectionPagePath(
								wishlistOwner.user_name,
								existingBlog.path,
								existingBlog._id
							)}
						</a>
					</Text>
				)} */}
				<div className='wishlist-tags mt-5'>
					<span className='text-sm capitalize'>{TAGS_TITLE}</span>
					{fetchingTags && (
						<span className='text-sm ml-2'>
							(fetching {TAGS_TITLE} from blog)
						</span>
					)}
					<Select
						mode='tags'
						className='w-full mt-2 text-base'
						placeholder={`Enter ${TAGS_TITLE}`}
						value={wishlistData.tags || []}
						onChange={(value) => handleTagChange(value, "tags")}
						size='large'
						disabled={fetchingTags}
						dropdownStyle={{ display: "none" }}>
						{wishlistData.tags?.map((filter) => (
							<Option key={filter}>{filter}</Option>
						))}
					</Select>
				</div>
				{error.blog_filter && (
					<Text className='text-red-500'>{error.blog_filter}</Text>
				)}
				{enableAutoFetchProducts && ( // added checkbox to create auto collection to fetch products // on update collection fetch products based on tags before update
					<div className='flex mt-5'>
						<input
							type='checkbox'
							name='fetchProducts'
							id='fetchProducts'
							checked={isFetchProductsChecked}
							className='text-left placeholder-gray-101 outline-none p-3 rounded-md w-5 mr-2 accent-secondary'
							onChange={handleAutoCollectionCheckboxChange}
						/>
						<label htmlFor='fetchProducts'>
							Check if you want to fetch products automatically
						</label>
						<Tooltip
							title={`Products will be fetched automatically based on the ${TAGS_TITLE} added above.`}
							className='flex'>
							<InfoCircleOutlined className='pl-1 my-auto' />
						</Tooltip>
					</div>
				)}
				<div className='mt-5'>
					{wishlistData.cover_image ? (
						<>
							<LazyLoadImage
								src={getFinalImageUrl(wishlistData.cover_image)}
								height='100%'
								width='100%'
								// effect='blur'
								className='object-cover mx-auto rounded-xl max-w-s-1 w-120 lg:w-200 h-120 lg:h-200'
							/>

							<div className='text-center text-purple-101 underline text-lg cursor-pointer'>
								<span
									onClick={() => {
										setWishlistData({
											...wishlistData,
											cover_image: "",
										});
									}}>
									remove or change Cover
								</span>
							</div>
						</>
					) : (
						<div className='h-40'>
							{isUploading ? (
								<Spin className='flex items-center justify-center h-full' />
							) : (
								<Dragger
									className='bg-transparent w-full'
									{...uploadProps}
									name='cover_image'
									showUploadList={false}>
									<p className='ant-upload-drag-icon'>
										<PictureOutlined />
									</p>
									<p className='ant-upload-text'>
										Click or drag a file to this area to add a cover image
										(Optional)
									</p>
									{savedImage && (
										<p
											className='text-blue-103 underline max-w-max mx-auto'
											onClick={onCoverImageCancel}>
											Cancel
										</p>
									)}
								</Dragger>
							)}
						</div>
					)}
				</div>
				<div className='mt-5'>
					{wishlistData.video_url ? (
						<>
							<video
								src={getFinalImageUrl(wishlistData.video_url)}
								controls
								className='object-cover mx-auto rounded-xl max-w-s-1 w-120 lg:w-200 h-120 lg:h-100'
							/>

							<div className='text-center text-purple-101 underline text-lg cursor-pointer'>
								<span
									onClick={() => {
										setWishlistData({
											...wishlistData,
											video_url: "",
										});
									}}>
									remove or change Video
								</span>
							</div>
						</>
					) : (
						<div className='h-40'>
							{isVideoUploading ? (
								<Spin className='flex items-center justify-center h-full' />
							) : (
								<Dragger
									className='bg-transparent w-full'
									{...uploadVideoProps}
									name='video_url'
									showUploadList={false}>
									<p className='ant-upload-drag-icon'>
										<UploadOutlined />
									</p>
									<p className='ant-upload-text'>
										Click or drag file to this area to upload Videos
									</p>
								</Dragger>
							)}
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default CreateWishlist;
