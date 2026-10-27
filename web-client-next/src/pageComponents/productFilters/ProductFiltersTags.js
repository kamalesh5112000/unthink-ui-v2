import React, {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { useSelector } from "react-redux";
import { isEmpty } from "../../helper/utils";
import { CloseOutlined, PlusOutlined } from "@ant-design/icons";
import { Select, Tooltip } from "antd";

const ProductFiltersTags = ({
	productFilters = {},
	handleFiltersInputClear,
	handleClearFiltersClick,
	displayFilters = [],
	tagThemeClassName = "bg-white text-brand py-0.5 px-2 rounded-full shadow-sm",
	clearFiltersThemeClassName = "text-brand",
	buttonThemeClassName = "bg-indigo-600",
	isShowClearFilters = true,
	isShowPriceRange = true,
	isShowCustomFilter = false,
	handleSaveEditCustomFilter,
	selectedTag = "",
	handleFilterOptionsVisibleChange,
	filterOptionsVisible = false,
	isproductSection,
	isShowHashtagButton = true,
}) => {
	const [catalog_attributes,selectedSearchOption] = useSelector((state) => [
		state.store.data.catalog_attributes,
		state.chatV2.activeSearchOption,
	]);

	const [showCustomFilterInput, setShowCustomFilterInput] = useState(false);
	const [editCustomFilterValue, setEditCustomFilterValue] = useState([]);

	const tagInputRef = useRef(null);

	const savedCustomFilter = useMemo(() => {
		const customFilter = productFilters.custom_filter;
		if (Array.isArray(customFilter)) return customFilter;
		if (typeof customFilter === "string") {
			return customFilter.split(",").map((s) => s.trim());
		}
		return [];
	}, [productFilters.custom_filter]);

	useEffect(() => {
		if (showCustomFilterInput) {
			tagInputRef?.current?.focus();
			setEditCustomFilterValue(savedCustomFilter);
		}
	}, [showCustomFilterInput]);

	// close and clear custom filter input when change tag
	useEffect(() => {
		if (selectedTag) {
			setShowCustomFilterInput(false);
			setEditCustomFilterValue([]);
		}
	}, [selectedTag]);

	const getPriceRangeText = (price) => {
		if (!isEmpty(price?.min) && !isEmpty(price?.max)) {
			return price.min + " - " + price.max;
		} else {
			return "";
		}
	};

	// creating new array of obj from displayFilters which key matched with productFilters
	const selectedFiltersArr = useMemo(() => {
		let selectedFiltersData = [];
		displayFilters.forEach((item) => {
			const filter = productFilters[item.key];
			const finalFilter = {
				title: item?.label,
				name: item?.key,
				showClose: true,
			};

			if (item.key === "price") {
				finalFilter.value = getPriceRangeText(filter);
				finalFilter.visible = !!getPriceRangeText(filter) && isShowPriceRange;
			} else if (Object.keys(productFilters).includes(item.key)) {
				finalFilter.value = filter
					? filter?.length > 4
						? filter?.slice(0, 4)?.join(", ") + ", ..."
						: filter?.join(", ")
					: "";
				finalFilter.visible = !isEmpty(filter);
				finalFilter.tooltipTitle = filter?.length > 4 ? filter : "";
			}

			selectedFiltersData.push(finalFilter);
		});
		return selectedFiltersData;
	}, [displayFilters, productFilters, isShowPriceRange, getPriceRangeText]);

	// show custom_filter(hashtag) based on storeData
	const customFilterStoreData = useMemo(
		() => catalog_attributes?.find((c) => c.key === "custom_filter"),
		[catalog_attributes]
	);

	const showClearAll = useMemo(
		() =>
			isShowClearFilters &&
			(!isEmpty(selectedFiltersArr.filter((f) => f.visible)) ||
				!isEmpty(savedCustomFilter)),
		[isShowClearFilters, selectedFiltersArr, savedCustomFilter]
	);

	const showHashTags = useMemo(
		() =>
			customFilterStoreData?.is_display &&
			isShowCustomFilter &&
			!showCustomFilterInput &&
			isShowHashtagButton,
		[
			customFilterStoreData?.is_display,
			isShowCustomFilter,
			showCustomFilterInput,
			isShowHashtagButton,
		]
	);

	const onCustomFilterChange = (value) => {
		const removedHash = value.map((item) => item.replaceAll("#", "")); // removed hashtags from string
		setEditCustomFilterValue(removedHash);
	};

	const onSaveCustomFilter = useCallback(() => {
		setShowCustomFilterInput(false);
		handleSaveEditCustomFilter({
			custom_filter: editCustomFilterValue,
			isSave: true,
		});
	}, [editCustomFilterValue, handleSaveEditCustomFilter]);

	const onCancelCustomFilter = useCallback(() => {
		setShowCustomFilterInput(false);
		handleSaveEditCustomFilter({ custom_filter: savedCustomFilter });
	}, [savedCustomFilter, handleSaveEditCustomFilter]);

	const onDeleteCustomFilter = useCallback(
		(e, custom_filter) => {
			e.stopPropagation();

			if (custom_filter) {
				const newCustomFilter =
					savedCustomFilter?.filter((c) => !custom_filter.includes(c)) || [];
				setEditCustomFilterValue(newCustomFilter);
				handleSaveEditCustomFilter({
					custom_filter: newCustomFilter,
					isSave: true,
				});
			}
		},
		[savedCustomFilter, handleSaveEditCustomFilter]
	);

	// const selectedFiltersArr = useMemo(
	// 	() => [
	// 		{
	// 			title: "Gender",
	// 			value: productFilters?.gender?.join(", "),
	// 			visible: !isEmpty(productFilters?.gender),
	// 			name: "gender",
	// 			showClose: true,
	// 		},
	// 		{
	// 			title: "Age group",
	// 			value: productFilters?.age_group?.join(", "),
	// 			visible: !isEmpty(productFilters?.age_group),
	// 			name: "age_group",
	// 			showClose: true,
	// 		},
	// 		{
	// 			title: "Discount",
	// 			value: productFilters?.discount?.join(", "),
	// 			visible: !isEmpty(productFilters?.discount),
	// 			name: "discount",
	// 			showClose: true,
	// 		},
	// 		{
	// 			title: "Seller",
	// 			tooltipTitle: productFilters?.brand
	// 				? productFilters.brand.join(", ")
	// 				: "",
	// 			value: productFilters?.brand
	// 				? productFilters.brand.length > 4
	// 					? productFilters.brand.slice(0, 4).join(", ") + ", ..."
	// 					: productFilters.brand.join(", ")
	// 				: "",
	// 			visible: !isEmpty(productFilters?.brand),
	// 			name: "brand",
	// 			showClose: true,
	// 		},
	// 		{
	// 			title:
	// 				shared_profile_on_root === STORE_USER_NAME_HOMECENTRE
	// 					? "Room"
	// 					: "Occasion",
	// 			value: productFilters?.occasion?.join(", "),
	// 			visible: !isEmpty(productFilters?.occasion),
	// 			name: "occasion",
	// 			showClose: true,
	// 		},
	// 		// {
	// 		// 	title: "Custom filter",
	// 		// 	value: productFilters?.custom_filter,
	// 		// 	visible: !isEmpty(productFilters?.custom_filter),
	// 		// 	name: "custom_filter",
	// 		// 	showClose: true,
	// 		// },
	// 		{
	// 			title: "Color",
	// 			value: productFilters?.color?.join(", "),
	// 			visible: !isEmpty(productFilters?.color),
	// 			name: "color",
	// 			showClose: true,
	// 		},
	// 		{
	// 			title: "Price Range",
	// 			value: getPriceRangeText(productFilters?.price),
	// 			visible: !!getPriceRangeText(productFilters?.price) && isShowPriceRange,
	// 			name: "price",
	// 			showClose: true,
	// 		},
	// 		{
	// 			title: "Material",
	// 			value: productFilters?.material?.join(", "),
	// 			visible: !isEmpty(productFilters?.material),
	// 			name: "material",
	// 			showClose: true,
	// 		},
	// 		{
	// 			title: "Pattern",
	// 			value: productFilters?.pattern?.join(", "),
	// 			visible: !isEmpty(productFilters?.pattern),
	// 			name: "pattern",
	// 			showClose: true,
	// 		},
	// 		{
	// 			title: "Style",
	// 			value: productFilters?.style?.join(", "),
	// 			visible: !isEmpty(productFilters?.style),
	// 			name: "style",
	// 			showClose: true,
	// 		},
	// 		{
	// 			title: "Brand",
	// 			value: productFilters?.product_brand?.join(", "),
	// 			visible: !isEmpty(productFilters?.product_brand),
	// 			name: "product_brand",
	// 			showClose: true,
	// 		},
	// 		{
	// 			title: "Neck",
	// 			value: productFilters?.neck?.join(", "),
	// 			visible: !isEmpty(productFilters?.neck),
	// 			name: "neck",
	// 			showClose: true,
	// 		},
	// 		{
	// 			title: "Sleeve",
	// 			value: productFilters?.sleeve?.join(", "),
	// 			visible: !isEmpty(productFilters?.sleeve),
	// 			name: "sleeve",
	// 			showClose: true,
	// 		},
	// 		{
	// 			title: "Character",
	// 			value: productFilters?.character?.join(", "),
	// 			visible: !isEmpty(productFilters?.character),
	// 			name: "character",
	// 			showClose: true,
	// 		},
	// 	],
	// 	[JSON.stringify(productFilters)]
	// );

	// scroll for tags




	return (
		<div>
			<div className={`flex items-start flex-wrap min-w-0 max-w-full overflow-x-hidden gap-2 justify-start hashtag_scroll_div`}>
				<div className="flex flex-wrap gap-2 flex-1 min-w-0">
					{selectedFiltersArr
						.filter((f) => f.visible)
						.map((f) => (
							<div key={f.name} className={`rounded-full flex items-center whitespace-nowrap shadow-sm h-7 px-2 sm:px-4 font-normal text-xs md:text-sm leading-none bg-white py-0.5 ${tagThemeClassName}`}
								title={f.tooltipTitle}
							>
								{f.title}: {f.value}
								{f.showClose && (
									<CloseOutlined
										className="ml-2 cursor-pointer"
										role="button"
										onClick={() => handleFiltersInputClear(f.name)}
									/>
								)}
							</div>
						))}

					{!isEmpty(savedCustomFilter) && isShowCustomFilter &&
						savedCustomFilter.map((hashtag) => (
							<div key={hashtag} className={`rounded-full flex items-center whitespace-nowrap shadow-sm h-7 px-2 sm:px-4 font-normal text-xs md:text-sm leading-none bg-white py-0.5 ${tagThemeClassName}`} role="button">
								#{hashtag}
								<CloseOutlined
									className="ml-2 cursor-pointer"
									role="button"
									onClick={(e) => onDeleteCustomFilter(e, [hashtag])}
								/>
							</div>
						))}

					{(typeof handleFilterOptionsVisibleChange === "function" || selectedSearchOption?.id === 'product_search' ) &&  (
						<div
							className="flex items-center justify-center w-7 h-7 rounded-full bg-slate-100 text-[#334155] cursor-pointer border border-[#e2e8f0] shadow-sm hover:bg-[#e2e8f0]"
							title="More filter"
							onClick={() =>
								handleFilterOptionsVisibleChange(!filterOptionsVisible)
							}>
							<PlusOutlined className="text-sm" />
						</div>
					)}

					<div className="ml-auto flex items-center gap-2">
						{showHashTags ? (
							<div
								className={`flex items-center gap-1 text-sm md:text-base leading-5 cursor-pointer ${clearFiltersThemeClassName}`}
								title='Add or remove hashtags'
								onClick={() => setShowCustomFilterInput(true)}>
								<PlusOutlined className="mr-1" />
								<span>Hashtags</span>
							</div>
						) : null}

						{showHashTags && showClearAll ? (
							<div className="border-l-2 border-[#232524] h-5 mx-1" />
						) : null}

						{showClearAll ? (
							<p
								className={`text-sm md:text-base cursor-pointer ${clearFiltersThemeClassName}`}
								role='button'
								onClick={handleClearFiltersClick}>
								Clear All
							</p>
						) : null}
					</div>
				</div>

			</div>

			{showCustomFilterInput ? (
				<div className="w-full lg:flex lg:justify-between">
					<div className="mt-2 w-full">
						<Select
							mode='tags'
							className={`w-full text-base tag-select-input`}
							placeholder='Enter hashtags'
							value={editCustomFilterValue}
							onChange={onCustomFilterChange}
							size='large'
							ref={tagInputRef}
							dropdownStyle={{ display: "none" }}
						/>
					</div>
					<div className="text-right pt-2 lg:pl-2">
						<div className="grid grid-cols-2 lg:grid-cols-1 gap-2 w-max ml-auto">
							<button
								onClick={onSaveCustomFilter}
								className={`py-0 px-3 text-white rounded-lg h-6 ${buttonThemeClassName}`}>
								Save
							</button>
							<button
								onClick={onCancelCustomFilter}
								className={`py-0 px-3 text-white rounded-lg h-6 ${buttonThemeClassName}`}>
								Cancel
							</button>
						</div>
					</div>
				</div>
			) : null}
		</div>
	);
};

export default ProductFiltersTags;