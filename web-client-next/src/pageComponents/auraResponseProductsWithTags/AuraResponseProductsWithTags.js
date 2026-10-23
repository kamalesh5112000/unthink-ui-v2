// changes made
import React, { useCallback, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Skeleton } from "antd";
import { ArrowLeftOutlined, CloseOutlined } from "@ant-design/icons";

import AuraResponseProducts from "./AuraResponseProducts";
import {
	setSuggestionsSelectedTag,
	removeSuggestionDataTag,
	setRecommendationSelectedTag,
	setMoreSearchSelectedTag,
} from "../../hooks/chat/redux/actions";
import { isEmpty } from "../../helper/utils";

const AuraResponseProductsWithTags = ({
	enableClickFetchRec,
	enableClickTracking,
	trackCollectionCampCode,
	trackCollectionId,
	trackCollectionName,
	trackCollectionICode,
	chatTypeKey,
	widgetHeader,
	widgetImage,
	isAuraChatPage,
	handleLoadMore,
	localChatMessage,
	layoutMode,
	showChatLoader,
	isMobile,
	registerSelectActions,
	handleGoBack,
	isProductSearchOptionActive,
}) => {
	const [suggestionsWithProducts,suggestionsTags, recommendationsWithProducts, moreProducts] = useSelector((state) => [
		state.chatV2.suggestions,
		state.chatV2.suggestions?.selectedTag,
		state.chatV2.recommendations,
		state.chatV2.moreProducts,
	]);
 

	const dispatch = useDispatch();

	const {
		suggestions: { tags = [], title: originalTitle = "" },
		products: suggestionsProducts,
		selectedTag,
		allProductList,
	} = suggestionsWithProducts;

	const title = originalTitle
		.replace(/<[^>]*>Click on the keywords to browse products\.?<\/[^>]*>/gi, '')
		.replace(/Click on the keywords to browse products\.?/gi, '')
		.trim();

	const {
		recommendations: { tags: RecTags = [], title: RecTitle = "" },
		products: recommendationsProducts,
		selectedTag: recommendationsSelectedTag,
		allProductList: recommendationsallProductList,
	} = recommendationsWithProducts;

	const {
		moreProducts: { tags: moreProductsTags = [], title: moreProductsTitle = "" },
		products: moreAuraProducts,
		selectedTag: moreProductsSelectedTag,
		allProductList: moreProductsallProductList,
	} = moreProducts;

	// // Select the first tag as default if no tag is selected and "All" is not selected
	useEffect(() => {
		if (tags.length === 1) {
			if (selectedTag === "" && !isEmpty(allProductList)) return; // Do nothing if "All" is selected
			if (!selectedTag && tags.length) {
				dispatch(setSuggestionsSelectedTag(tags[0])); // Set first tag as default
			}
		}
	}, [selectedTag, tags, dispatch, allProductList]);

	const tagToShow = useMemo(() => selectedTag, [selectedTag]);
	const recommendationsTagToShow = useMemo(() => recommendationsSelectedTag, [recommendationsSelectedTag]);
	const moreProductsTagToShow = useMemo(() => moreProductsSelectedTag, [moreProductsSelectedTag]);

	const productsToShow = useMemo(() => {
		// If "All" is selected, show all products
		return selectedTag
			? suggestionsProducts[tagToShow]
			: {
				product_lists: allProductList,
			};
	}, [suggestionsProducts[tagToShow], selectedTag, allProductList]);


	// for more products product show

	const moreProductToShow = useMemo(() => {
		// If "All" is selected, show all products
		return moreProductsSelectedTag
			? moreAuraProducts[moreProductsTagToShow]
			: {
				product_lists: moreProductsallProductList,
			};
	}, [moreAuraProducts[moreProductsTagToShow], moreProductsSelectedTag, moreProductsallProductList]);

	// for recommendations product show

	const recommendationsproductsToShow = useMemo(() => {
		// If "All" is selected, show all products
		return recommendationsSelectedTag
			? recommendationsProducts[recommendationsTagToShow]
			: {
				product_lists: recommendationsallProductList,
			};
	}, [recommendationsProducts[recommendationsTagToShow], recommendationsSelectedTag, recommendationsallProductList]);


	const tagsProductsFetched = useMemo(
		() => tags.filter((tag) => !!suggestionsProducts[tag]),
		[tags, JSON.stringify(suggestionsProducts)]
	);

	const RecomtagsProductsFetched = useMemo(
		() => tags.filter((tag) => !!recommendationsProducts[tag]),
		[tags, JSON.stringify(recommendationsProducts)]
	);

	const moreProductsTagsProductsFetched = useMemo(
		() => tags.filter((tag) => !!moreAuraProducts[tag]),
		[tags, JSON.stringify(moreAuraProducts)]
	);

	const hasSuggestionsProducts = useMemo(
		() =>
			!isEmpty(allProductList) ||
			Object.values(suggestionsProducts || {}).some(
				(value) => !isEmpty(value?.product_lists)
			),
		[allProductList, suggestionsProducts]
	);

	const isAllEnabled = useMemo(
		() => !isEmpty(allProductList), // "All" is enabled only if there are products in `allProductList`
		[allProductList]
	);

	const checkIsTagEnabled = useCallback(
		(tag) => tagsProductsFetched.includes(tag),
		[tagsProductsFetched]
	);

	const RecomCheckIsTagEnabled = useCallback(
		(tag) => RecomtagsProductsFetched.includes(tag),
		[RecomtagsProductsFetched]
	);

	const moreProductsCheckIsTagEnabled = useCallback(
		(tag) => moreProductsTagsProductsFetched.includes(tag),
		[moreProductsTagsProductsFetched]
	);

	const handleSuggestionClick = (tag) => {
		dispatch(setSuggestionsSelectedTag(tag));
		// dispatch(setRecommendationSelectedTag(tag));
		// dispatch(setMoreSearchSelectedTag(tag));
	};

	const handleRemoveTagData = (tag = "") => {
		if (tag) {
			if (tag === selectedTag) {
				handleSuggestionClick("");
			}
			dispatch(removeSuggestionDataTag({ tag })); // remove tag data
		}
	};

	const isTagEnabled = checkIsTagEnabled(tagToShow) || tagToShow === "";
	const RecomIsTagEnabled = RecomCheckIsTagEnabled(recommendationsTagToShow) || recommendationsTagToShow === "";
	const moreProductsIsTagEnabled = moreProductsCheckIsTagEnabled(moreProductsTagToShow) || moreProductsTagToShow === "";

	if (!showChatLoader && !hasSuggestionsProducts && !tags?.length) {
		return null;
	}

	return (
		<div className="grid grid-cols-1 gap-4 max-[768px]:box-border max-[768px]:w-full max-[768px]:max-w-full max-[768px]:overflow-x-hidden max-[768px]:px-2.5" id='aura-response-products-with-tags-container'>
			{title ? (
				<h1
					id='_data_widget_text'
					className="m-0 text-lg font-bold leading-7 text-highlight lg:text-xl"
					dangerouslySetInnerHTML={{
						__html: title,
					}}
				/>
			) : null}

			<div className="mb-4 flex flex-wrap gap-3 max-[768px]:mb-3 max-[768px]:w-full max-[768px]:gap-2">
				{isProductSearchOptionActive ? (
					<div className="flex h-[60px] w-full shrink-0 text-highlight hover:text-secondary">
						<ArrowLeftOutlined
							className="cursor-pointer text-2xl"
							onClick={handleGoBack}
						/>
					</div>
				) : null}
					{!isEmpty(allProductList) && tags.length > 1 ? (
						<div
							key='All'
							className={`relative flex h-[34px] w-max min-w-12 items-center justify-center rounded-full px-1 transition-all duration-200 ease-in-out max-[768px]:min-w-0 max-[768px]:py-0.5 ${!selectedTag && isAllEnabled
								? 'bg-secondary text-white '
								: isAllEnabled
									? 'cursor-pointer border border-common [&_h5]:cursor-pointer [&_h5]:font-medium [&_h5]:text-highlight [&_.aura-tag-close-icon]:cursor-pointer [&_.aura-tag-close-icon]:border-highlight'
									: 'cursor-pointer border border-secondary/30 [&_h5]:cursor-pointer [&_h5]:font-medium [&_h5]:text-highlight [&_.aura-tag-close-icon]:cursor-pointer [&_.aura-tag-close-icon]:bg-secondary/10 [&_.aura-tag-close-icon]:text-secondary'
								}`}
							onClick={() => isAllEnabled && handleSuggestionClick("")}>
							<h5
								className="m-0 cursor-inherit px-2.5 text-xs font-normal leading-4 sm:px-3 md:text-sm max-[768px]:px-1.5 max-[768px]:py-0.5">
								All
							</h5>
							{!isAllEnabled ? (
								<Skeleton.Button
									className="absolute top-0 h-full [&_.ant-skeleton-button]:h-full"
									active
									shape='round'
									block
								/>
							) : null}
						</div>
					) : null}
				{tags?.map((suggestion, index) => (
					<div
						id={`tag-${suggestion}`}
						key={index}
						className={`relative flex h-[34px] border-common w-max min-w-12 items-center justify-center rounded-full px-1 transition-all duration-200 ease-in-out max-[768px]:min-w-0 max-[768px]:py-0.5 ${suggestion === selectedTag
							? 'bg-secondary text-white font-medium'
							: checkIsTagEnabled(suggestion)
								? 'cursor-pointer border border-common [&_h5]:cursor-pointer [&_h5]:font-medium [&_h5]:text-highlight [&_.aura-tag-close-icon]:cursor-pointer [&_.aura-tag-close-icon]:border-highlight'
								: 'cursor-pointer border border-common [&_h5]:cursor-pointer [&_h5]:font-medium [&_h5]:text-highlight [&_.aura-tag-close-icon]:cursor-pointer [&_.aura-tag-close-icon]:bg-secondary/10 [&_.aura-tag-close-icon]:text-secondary'
							} ${tags.length > 1 ? 'gap-1 pl-2' : ''}`}>
						<h5
							className="m-0 cursor-inherit px-2.5 text-xs font-normal leading-4 sm:px-3 md:text-sm max-[768px]:px-1.5 max-[768px]:py-0.5"
							onClick={() =>
								checkIsTagEnabled(suggestion) &&
								handleSuggestionClick(suggestion)
							}>
							{suggestion}
						</h5>
						{tags.length > 1 ? (
							<CloseOutlined
								className="aura-tag-close-icon mr-1.5 ml-0.5 flex h-[18px] w-[18px] items-center justify-center rounded-full border border-white text-xs"
								role='button'
								onClick={() =>
									checkIsTagEnabled(suggestion) &&
									handleRemoveTagData(suggestion)
								}
							/>
						) : null}
						{!checkIsTagEnabled(suggestion) ? (
							<Skeleton.Button
								className="absolute top-0 h-full [&_.ant-skeleton-button]:h-full"
								active
								shape='round'
								block
							/>
						) : null}
					</div>
				))}
			</div>

			<AuraResponseProducts
				handleLoadMore={handleLoadMore}
				products={productsToShow}
				selectedTag={selectedTag}
				recommendationsProducts={recommendationsproductsToShow}
				moreProducts={moreProductToShow}
				RecomTag={recommendationsTagToShow}
				tag={tagToShow}
				suggestionsProducts={suggestionsProducts}
				isTagEnabled={isTagEnabled}
				enableClickFetchRec={enableClickFetchRec}
				enableClickTracking={enableClickTracking}
				trackCollectionCampCode={trackCollectionCampCode}
				trackCollectionId={trackCollectionId}
				trackCollectionName={trackCollectionName}
				trackCollectionICode={trackCollectionICode}
				elementId={`${tagToShow}`}
				chatTypeKey={chatTypeKey}
				widgetHeader={widgetHeader}
				widgetImage={widgetImage}
				allProductList={allProductList}
				isAuraChatPage={isAuraChatPage}
				localChatMessage={localChatMessage}
				layoutMode={layoutMode}
				showChatLoader={showChatLoader}
				isMobile={isMobile}
				registerSelectActions={registerSelectActions}
			/>
		</div>
	);
};

export default AuraResponseProductsWithTags;
