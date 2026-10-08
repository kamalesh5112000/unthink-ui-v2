import React, {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";

import {
	Spin,
	Upload,
	notification,
	Modal,
	Tooltip,
	Select,
	Input,
	Button,
	Divider,
} from "antd";
import {
	UploadOutlined,
	LoadingOutlined,
	FileDoneOutlined,
	ArrowLeftOutlined,
	CheckCircleOutlined,
	CloseOutlined,
} from "@ant-design/icons";
import UploadProductsModal from "../../components/modal/Modal";
import { isEmpty } from "../../helper/utils";
import {
	profileAPIs,
	customProductsDownloadCsvURL,
	customProductsAPIs,
} from "../../helper/serverAPIs";
import {
	// COLLECTION_COVER_IMG_SIZES,
	UPLOAD_PRODUCT_MODE_CSV,
	UPLOAD_PRODUCT_MODE_IMAGES,
} from "../../constants/codes";
import AddProductCard from "./AddProductCard";
import {
	auraYfretUserCollBaseUrl,
	current_store_name,
} from "../../constants/config";

const { Dragger } = Upload;
const { Option } = Select;

const defaultProductData = [];

const UploadMultiProductsModal = ({
	isModalOpen,
	onModalClose,
	onSubmit,
	sellerDetails,
	authUser,
	defaultMode,
	store_type,
}) => {
	const [productData, setProductData] = useState([...defaultProductData]);
 
	// useEffect(() => {
	// 		if (productData) {
	// 			setProductData((prev) => ({
	// 				...prev,
	// 				collection_type: [...(prev.collection_type || []), "box"],
	// 			}));
	// 			console.log("productDatachanged", productData)
	// 		}
	// 	}, [ isModalOpen])
		const [collectionValue, setCollectionValue] = useState("");
	const [isUploading, setIsUploading] = useState(false);
	const [selectedMode, setSelectedMode] = useState(null);
	const [selectedCsv, setSelectedCsv] = useState(null);
	const [isOpen, setIsOpen] = useState(false);
	const [autoGenerateHelperText, setAutoGenerateHelperText] = useState({});
	const [showUploadImages, setShowUploadImages] = useState(false);
	let additional_images= []

	
 	
	const currentSellerBrandDetails = useMemo(
		() => sellerDetails[authUser.user_name],
		[sellerDetails, authUser.user_name]
	);

	const isProductDataAvailable = useMemo(
		() => !isEmpty(productData),
		[productData]
	);

	useEffect(() => {
		setIsOpen(isModalOpen);

		if (isModalOpen) {
			if (defaultMode) {
				const mode = availableModes.find((m) => m.mode === defaultMode);
				setSelectedMode(mode);
			}

			return () => {
				setProductData([...defaultProductData]);
				setSelectedMode(null);
				setSelectedCsv(null);
			};
		}

		return () => { };
	}, [isModalOpen]);

	useEffect(() => {
		setAutoGenerateHelperText({
			...autoGenerateHelperText,
			guidelines: authUser.productCatalogGuidelines || "",
			brand_description:
				authUser.productCatalogInformation || authUser.description || "",
		});
	}, [isModalOpen]);

	const handleSelectMode = (mode) => {
		setSelectedMode(mode);
	};
	const handleUploadImage = async (info) => {
		try {
			setIsUploading(true);
			if (info?.file) {
				const response = await profileAPIs.uploadImage({
					file: info.file.originFileObj || info.file,
					// custom_size: COLLECTION_COVER_IMG_SIZES,
				});

				if (response?.data?.data && response.data.data[0]) {
					handleUploadImageSuccess(
						response?.data?.data[0].url,
						response?.data?.data[0]["meta-filename"]
					);
				}
			}
		} catch (error) {
			notification["error"]({
				message: "Failed to upload image",
			});
		}
		setIsUploading(false);
		return false;
	};

	const uploadImageDraggerProps = {
		accept: "image/*",
		multiple: true,
		onChange: async (info) => {
			await handleUploadImage(info);
		},
	};

	const uploadImageProps = {
		accept: "image/*",
		multiple: true,
		customRequest: async (info) => {
			await handleUploadImage(info);
		},
	};

	const uploadCsvProps = {
		accept: ".csv",
		multiple: false,
		onChange: async (info) => {
			try {
				setIsUploading(true);
				if (info?.file) {
					const response = await profileAPIs.uploadCSV_APICall({
						file: info.file.originFileObj,
					});

					if (response?.data?.data && response.data.data[0]) {
						setSelectedCsv(response.data.data[0]);
					}
				}
			} catch (error) {
				notification["error"]({
					message: "Unable to upload file",
				});
			}
			setIsUploading(false);
			return false;
		},
	};

	const handleUploadImageSuccess = useCallback((image, fileName = "") => {
		const fileNameArr = fileName.split(".");
		fileNameArr.pop();

		const name = fileNameArr.join("");

		setProductData((data) => {
			const newData = [
				...data,
				{
					mfr_code: (+(data?.at(-1)?.mfr_code || 0) + 1).toString(),
					name,
					image,
					// collection_type:collectionValue 
				},
			];

			return newData;
		});
	}, []);
	// console.log("collectionValue", collectionValue);
	const handleProductInputChange = useCallback(
		(e, mfr_code) => {
			const { name, value } = e.target;

			const ind = productData.findIndex((p) => p.mfr_code === mfr_code);

			if (ind !== -1) {
				setProductData((data) => {
					const updatedProductData = [...data];
					updatedProductData[ind] = {
						...updatedProductData[ind],
						[name]: value,
					};

					return updatedProductData;
				});
			}
		},
		[productData]
	);

	const handlePriceInputBlur = useCallback(
		(mfr_code) => {
			const ind = productData.findIndex((p) => p.mfr_code === mfr_code);

			if (ind !== -1) {
				setProductData((data) => {
					const updatedProductData = [...data];
					if (
						updatedProductData[ind].price === "0" ||
						!updatedProductData[ind].price
					) {
						updatedProductData[ind] = {
							...updatedProductData[ind],
							price: updatedProductData[ind].listprice,
						};
					}
					return updatedProductData;
				});
			}
		},
		[productData]
	);

	const handleProductDataChange = useCallback(
		(mfr_code, values = {}) => {
			const ind = productData.findIndex((p) => p.mfr_code === mfr_code);

			if (ind !== -1) {
				setProductData((data) => {
					const updatedProductData = [...data];
					updatedProductData[ind] = {
						...updatedProductData[ind],
						...values,
					};

					return updatedProductData;
				});
			}
		},
		[productData]
	);

	const handleRemoveProduct = useCallback((mfr_code) => {
		setProductData((data) => data.filter((p) => p.mfr_code !== mfr_code));
	}, []);

	const handleProductDataSubmit = (e) => {
		e.preventDefault();
		onModalClose();
		onSubmit({ productData, selectedCsv, currency, additional_images })
	}

	const handleDownloadSampleCSV = useCallback(
		(e) => {
			if (e?.detail === 1) {
				const url = `${auraYfretUserCollBaseUrl}${customProductsDownloadCsvURL}?brand=${currentSellerBrandDetails?.brandName}`;

				setTimeout(() => {
					window.open(url, "_blank");
					Modal.success({
						title: "Downloaded sample CSV",
						content:
							"Downloaded sample CSV. Please check your downloads. You may add or update product details in csv and upload it to update your catalog",
						icon: <CheckCircleOutlined />,
						okButtonProps: { disabled: false },
					});
				}, 1000);
			}
		},
		[currentSellerBrandDetails]
	);

	const handleBackButtonClick = useCallback(() => {
		if (isProductDataAvailable) {
			Modal.confirm({
				title: "Confirm",
				content: (
					<h1>
						Are you sure you want to go back? You may lose the selected
						products.
					</h1>
				),
				okText: "Ok",
				cancelText: "Cancel",
				onOk: () => {
					setProductData([]);
					setSelectedMode(null);
				},
			});
		} else {
			setSelectedMode(null);
		}
	}, [productData, selectedMode, isProductDataAvailable]);

	const handleCloseModalClick = useCallback(() => {
		if (isProductDataAvailable) {
			Modal.confirm({
				title: "Confirm",
				content: <h1>Are you sure? You may lose the selected products.</h1>,
				okText: "Ok",
				cancelText: "Cancel",
				onOk: () => {
					onModalClose();
				},
			});
		} else {
			onModalClose();
		}
	}, [productData, selectedMode, isProductDataAvailable]);

	const handleAutoGenerateHelperText = useCallback((e) => {
		const { name, value } = e.target;
		setAutoGenerateHelperText((data) => ({
			...data,
			[name]: value,
		}));
	}, []);

	const availableModes = useMemo(() => {
		const list = [];

		// if (
		// 	currentSellerBrandDetails?.platform === current_store_name ||
		// 	isEmpty(currentSellerBrandDetails?.platform)
		// ) {
		list.push({
			title: "Upload Images",
			mode: UPLOAD_PRODUCT_MODE_IMAGES,
		});
		// }

		list.push(
			...[
				{
					title: "Upload CSV or product feed",
					mode: UPLOAD_PRODUCT_MODE_CSV,
				},
			]
		);

		return list;
	}, [currentSellerBrandDetails?.platform]);

	const isSubmitDisabled = useMemo(() => {
		if (!selectedMode) {
			return false;
		}

		switch (selectedMode.mode) {
			case UPLOAD_PRODUCT_MODE_IMAGES:
				return isUploading || !isProductDataAvailable;

			case UPLOAD_PRODUCT_MODE_CSV:
				return isUploading || !selectedCsv;

			default:
				return true;
		}
	}, [selectedMode, selectedCsv, isUploading, productData]);

	const selectRef = useRef();


	
	const [storeStyle, setStoreStyle] = useState("");
	const [getMPCollections, setGetMPCollections] = useState([]);
	const [newCollection, setNewCollection] = useState("");
 
	
	const [collectionApi, setCollectionApi] = useState([]);
	const [currency, setCurrency] = useState("USD");

	const handleCurrencyChange = (value) => {
		setCurrency(value);
		 
	};

	const handleChange = async (value) => {
		setCollectionValue(value);
		if (collectionApi.includes(value)) {
			const payload = {
				store_type: storeStyle,
				mp_collection_name: value,
			};

			try {
				const res = await customProductsAPIs.FetchGetModifiedDataApi(payload);
				if (res.data?.status_code === 200) {
					setAutoGenerateHelperText({
						guidelines:
							res.data.data.instruction || autoGenerateHelperText.guidelines,
						brand_description:
							res.data.data.suffix || autoGenerateHelperText.brand_description,
					});
				 
				} else {
		 
				}
			} catch (err) {
				console.error("Error while removing collection:", err);
			}
		} else {
			console.log("No need to call API, item not in backend data.");
		}
	};

	const handleStoreStyleChange = (value) => {
		setStoreStyle(value);
	};

	const handleAddCollection = () => {
		const trimmed = newCollection.trim();
		if (trimmed && !getMPCollections.includes(trimmed)) {
			const updated = [...getMPCollections, trimmed];
			setGetMPCollections(updated);
			setCollectionValue(trimmed);
			setNewCollection("");
		}
	};

 

	const handleRemoveCollection = async (e, item) => {
		e.stopPropagation(); // Prevent selecting item
	 

		const updated = getMPCollections.filter((i) => i !== item);

		// Just update UI
		setGetMPCollections(updated);
		if (collectionValue === item) {
			setCollectionValue(updated[0] || "");
		}

		// If the item is part of the original backend data, then call API
		if (collectionApi.includes(item)) {
			const payload = {
				store_type: storeStyle,
				mp_collection_name: item,
			};

			try {
				const res = await customProductsAPIs.FetchDeleteModifiedDataApi(
					payload
				);
				if (res.data?.status_code === 200) {
 				} else {
 				}
			} catch (err) {
				console.error("Error while removing collection:", err);
			}
		} else {
			console.log("No need to call API, item not in backend data.");
		}
	};

	// Default store_type
	useEffect(() => {
		if (store_type) {
			setStoreStyle(store_type[0]);
		}
	}, [store_type]);

	// Example: Fetch from API (replace with real API if needed)
	useEffect(() => {
		const fetchCollections = async () => {
			try {
				const typeToUse = storeStyle || store_type?.[0];
				if (!typeToUse) return;
				const res = await customProductsAPIs.getMPCollectionsAPICall(typeToUse);
				if (res.data?.status_code === 200) {
					const unique = [...new Set(res.data.data)];
					setGetMPCollections(unique);
					setCollectionApi(unique);
					if (unique.length > 0) setCollectionValue(unique[0]);
				}
			} catch (err) {
				console.error("Error fetching collections:", {
					message: err?.message,
					status: err?.response?.status,
					data: err?.response?.data,
				});
			}
		};

		if (isModalOpen) {
			fetchCollections();
		}
	}, [isModalOpen, storeStyle, store_type]);

	const handleSaveCall = async () => {
		const payload = {
			store_type: storeStyle,
			mp_collection_name: collectionValue,
			instruction: autoGenerateHelperText.guidelines,
			suffix: autoGenerateHelperText.brand_description,
		};
		try {
			const res = await customProductsAPIs.saveMPCollectionsAPICall(payload);
			if (res.data?.status_code) {
				if (res.data.status_code === 200) {
					console.log(res.data);
				} else {
					// console.log("GetMPCollections failed:", res.data.message);
				}
			}
		} catch (error) {
			console.log("Error:", error);
		}
		setShowUploadImages(true);
	};

	return (
		<UploadProductsModal
			isOpen={isOpen}
			headerText='Add new products'
			onClose={handleCloseModalClick}
			maskClosable={false}
			size='sm'
			contentWrapperSpacingClassName='p-4'>
			<div>
				{selectedMode ? (
					<form>
						<div className='flex justify-between mb-4'>
							<div
								className='flex items-center cursor-pointer text-left'
								onClick={handleBackButtonClick}>
								<span className='text-lg leading-none flex mr-2'>
									<ArrowLeftOutlined />
								</span>
								<span className='text-lg font-medium capitalize'>Back</span>
							</div>

							{selectedMode.mode === UPLOAD_PRODUCT_MODE_IMAGES ? (
								<div className='flex items-center gap-2'>
									<Tooltip title='Add new products of your choice by upload images'>
										<Upload
											{...uploadImageProps}
											showUploadList={false}
											name='upload_image'
											className='cursor-pointer flex'>
											<span className='cursor-pointer font-normal text-4xl leading-none'>
												+
											</span>
										</Upload>
									</Tooltip>

									{!isSubmitDisabled ? (
										<button
											type='button'
											onClick={handleProductDataSubmit}
											className={`rounded-xl text-indigo-100 font-bold text-xs md:text-sm py-2 px-4.5 bg-indigo-600`}>
											Submit
										</button>
									) : null}
								</div>
							) : null}
						</div>
						<hr />

						{selectedMode.mode === UPLOAD_PRODUCT_MODE_IMAGES ? (
							<div>
								<div className='flex gap-4 items-center mt-4'>
									{/* Store Type dropdown */}
									<div className='flex flex-col'>
										<label
											htmlFor='storeStyleSelect'
											className='mb-1 text-sm font-medium text-gray-700'>
											Store Type
										</label>
										<Select
											id='storeStyleSelect'
											value={storeStyle}
											style={{ width: 200 }}
											onChange={handleStoreStyleChange}
											placeholder='Select store type'>
											{store_type.map((type) => (
												<Option key={type} value={type}>
													{type.charAt(0).toUpperCase() + type.slice(1)}
												</Option>
											))}
										</Select>
									</div>

									{/* Collection dropdown with remove button */}
									<div className='flex flex-col'>
										<label
											htmlFor='collectionSelect'
											className='mb-1 text-sm font-medium text-gray-700'>
											Collection
										</label>
										<Select
											id='collectionSelect'
											value={collectionValue}
											ref={selectRef}
											style={{ width: 250 }}
											onChange={handleChange}
											placeholder='Select collection'
											dropdownRender={(menu) => (
												<>
													{/* Custom rendered options with X icon */}
													<div className='max-h-48 overflow-y-auto'>
														{getMPCollections.map((item) => (
															<div
																key={item}
																className='flex justify-between items-center px-3 py-1 hover:bg-gray-100 cursor-pointer'
																onClick={() => {
																	handleChange(item);
																	selectRef.current?.blur(); // 👈 Close dropdown manually
																}}>
																<span>
																	{item.charAt(0).toUpperCase() + item.slice(1)}
																</span>
																<CloseOutlined
																	className='text-gray-400 hover:text-red-500'
																	onClick={(e) =>
																		handleRemoveCollection(e, item)
																	}
																/>
															</div>
														))}
													</div>
													<Divider style={{ margin: "8px 0" }} />
													<div className='px-2 flex items-center gap-2'>
														<Input
															placeholder='Add collection'
															value={newCollection}
															onChange={(e) => setNewCollection(e.target.value)}
															onPressEnter={handleAddCollection}
														/>
														<Button
															type='primary'
															onClick={handleAddCollection}>
															Add
														</Button>
													</div>
												</>
											)}
										/>
									</div>
								</div>

								<div className='my-4 flex flex-col gap-2'>
									<div className='flex flex-col text-left text-sm md:text-base'>
										<span>
											Hello! Let's start creating your product catalog.
										</span>
										<span>Enter some guidelines for your descriptions.</span>
									</div>
									<textarea
										className='text-left placeholder-gray-101 outline-none rounded-xl w-full px-3 py-2 bg-white resize-none'
										placeholder='For example: Describe the print and material in detail.'
										name='guidelines'
										type='text'
										value={autoGenerateHelperText.guidelines}
										onChange={handleAutoGenerateHelperText}
										rows={3}
									/>
									<div className='flex flex-col text-left text-sm md:text-base mt-2'>
										<span>
											Do you want to include any information in all
											descriptions,
										</span>
										<span>
											"For example, Our products are animal cruelty free."
										</span>
										<span>We picked up some text from your brand profile.</span>
										<span>Edit as needed.</span>
									</div>
									<textarea
										className='text-left placeholder-gray-101 outline-none rounded-xl w-full px-3 py-2 resize-none'
										placeholder='For example: Our products are animal cruelty free.'
										name='brand_description'
										type='text'
										value={autoGenerateHelperText.brand_description}
										onChange={handleAutoGenerateHelperText}
										rows={3}
									/>
									<div className='flex flex-col'>
										<label
											htmlFor='currencySelect'
											className='mb-1 text-sm font-medium text-gray-700'>
											Currency
										</label>
										<Select
											id='currencySelect'
											value={currency}
											onChange={handleCurrencyChange}
											placeholder='Select currency'>
											<Option value='INR'>INR</Option>
											<Option value='USD'>USD</Option>
										</Select>
									</div>

								</div>
								<div className='flex w-full justify-end'>
									<button
										type='button'
										onClick={handleSaveCall}
										className={`rounded-xl text-indigo-100 font-bold text-xs md:text-sm py-2 px-4.5 bg-secondary mb-2`}>
										{showUploadImages ? "Save" : "Continue"}
									</button>
								</div>
								<hr />
								{isProductDataAvailable ? (
									<>
										<div className='mb-4'>
											<div className='grid grid-cols-1 gap-4 mt-4 w-full'>
												{productData?.map((product) => (
																									
													<div key={product.mfr_code}>
														<AddProductCard
															currency={currency}
															storeStyle={storeStyle}
															collectionValue={collectionValue}
															product={product}
															productData={productData}
															setProductData={setProductData}
															onRemoveIconClick={handleRemoveProduct}
															handleProductInputChange={
																handleProductInputChange
															}
															additional_images={additional_images}									
															handleProductDataChange={handleProductDataChange}
															handlePriceInputBlur={handlePriceInputBlur}
															authUser={authUser}
															autoGenerateHelperText={autoGenerateHelperText}
														/>
													</div>
												))}
											</div>
										</div>
									</>
								) : showUploadImages ? (
									<div className='my-4'>
										<h2 className='text-xl font-semibold'>Upload images</h2>
									</div>
								) : null}
								{showUploadImages && (
									<div>
										<div>
											<div className='flex flex-col gap-4'>
												<div>
													{isUploading ? (
														<div className='h-36 flex items-center justify-center'>
															<Spin
																className='w-full mx-auto'
																indicator={
																	<LoadingOutlined
																		style={{ fontSize: 30 }}
																		className='text-blue-700'
																		spin
																	/>
																}
																spinning={isUploading}
															/>
														</div>
													) : productData.upload_image ? (
														<>
															{/* <div className='flex flex-col items-center justify-center'>
													<div className='max-w-s-1 w-120 lg:w-200 h-120 lg:h-56'>
														<img
															src={productData.upload_image}
															height='100%'
															width='100%'
															className='object-cover rounded-xl max-w-s-1 w-120 lg:w-56 h-120 lg:h-56'
														/>
													</div>
													<div className='text-center text-primary underline lg:text-lg text-base cursor-pointer'>
														<span onClick={() => handleUploadImageSuccess("")}>
															remove or change Image
														</span>
													</div>
												</div> */}
														</>
													) : (
														<div className='flex flex-col items-center justify-center'>
															<Dragger
																className='bg-transparent h-56 w-56'
																{...uploadImageDraggerProps}
																name='upload_image'
																showUploadList={false}>
																<p className='ant-upload-drag-icon'>
																	<UploadOutlined />
																</p>
																<p className='w-4/6 mx-auto'>
																	Click or drag file(s) to this area
																</p>
															</Dragger>
														</div>
													)}
												</div>
											</div>
										</div>

										{/* {productFormError ? (
								<div className='tablet:col-span-2 text-center'>
									<p className='text-red-600 text-lg'>{productFormError}</p>
								</div>
							) : null} */}
									</div>
								)}
							</div>
						) : null}
						{selectedMode.mode === UPLOAD_PRODUCT_MODE_CSV ? (
							<div>
								{/* <div className='mt-4'>
									Download a{" "}
									<span
										className='text-blue-103 whitespace-nowrap underline cursor-pointer'
										onClick={handleDownloadSampleCSV}>
										sample CSV template{" "}
									</span>
									to see an example of the format required
								</div> */}
								<div className='my-4'>
									<h2 className='text-xl font-semibold'>Upload CSV</h2>
								</div>
								<div>
									<div>
										<div className='flex flex-col gap-4'>
											<div className=''>
												{isUploading ? (
													<div className='h-36 flex items-center justify-center'>
														<Spin
															className='w-full mx-auto'
															indicator={
																<LoadingOutlined
																	style={{ fontSize: 30 }}
																	className='text-blue-700'
																	spin
																/>
															}
															spinning={isUploading}
														/>
													</div>
												) : (
													<div className='flex flex-col items-center justify-center'>
														<Dragger
															className='bg-transparent h-56 w-56'
															{...uploadCsvProps}
															name='upload_csv'
															showUploadList={false}>
															{selectedCsv ? (
																<>
																	<p className='ant-upload-drag-icon'>
																		<FileDoneOutlined />
																	</p>
																	<p className='w-4/6 mx-auto'>File selected</p>
																</>
															) : (
																<>
																	<p className='ant-upload-drag-icon'>
																		<UploadOutlined />
																	</p>
																	<p className='w-4/6 mx-auto'>
																		Click or drag file to this area
																	</p>
																</>
															)}
														</Dragger>
													</div>
												)}
											</div>
										</div>
									</div>

									{/* {productFormError ? (
								<div className='tablet:col-span-2 text-center'>
									<p className='text-red-600 text-lg'>{productFormError}</p>
								</div>
							) : null} */}
								</div>
							</div>
						) : null}
						{showUploadImages && (
							<div className='text-right mt-4'>
								<button
									type='button'
									onClick={handleProductDataSubmit}
									className={`rounded-xl text-indigo-100 font-bold text-xs md:text-sm py-2 px-4.5 ${isSubmitDisabled
										? "cursor-not-allowed bg-indigo-400"
										: "bg-indigo-600"
										}`}
									disabled={isSubmitDisabled}>
									Submit
								</button>
							</div>
						)}

						{(selectedMode.mode === UPLOAD_PRODUCT_MODE_CSV) && !showUploadImages && (
							<div className='text-right mt-4'>
								<button
									type='button'
									onClick={handleProductDataSubmit}
									className={`rounded-xl text-indigo-100 font-bold text-xs md:text-sm py-2 px-4.5 ${isSubmitDisabled
										? "cursor-not-allowed bg-indigo-400"
										: "bg-indigo-600"
										}`}
									disabled={isSubmitDisabled}>
									Submit
								</button>
							</div>
						)}
					</form>
				) : (
					<div className='py-14 flex flex-col gap-6 text-lg text-center'>
						<div
							className='underline cursor-pointer'
							role='button'
							onClick={() => handleSelectMode(availableModes[0])}>
							{availableModes[0].title}
						</div>

						{availableModes[1] ? (
							<>
								<div>OR</div>
								<div
									className='underline cursor-pointer'
									role='button'
									onClick={() => handleSelectMode(availableModes[1])}>
									{availableModes[1].title}
								</div>
							</>
						) : null}
					</div>
				)}
			</div>
		</UploadProductsModal>
	);
};

export default React.memo(UploadMultiProductsModal);
