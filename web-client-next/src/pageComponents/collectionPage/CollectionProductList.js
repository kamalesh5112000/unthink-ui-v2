// NOT USING
import React from "react";
import { Skeleton } from "antd";
import { useDispatch, useSelector } from "react-redux";

import ProductCard from "../../components/ProductCard";
import { handleRecProductClick } from "../recommendations/redux/actions";
import styles from "../../components/singleCollection/collectionDetails.module.scss";

const CollectionProductList = ({ collection, enableClickTracking = false }) => {
	const dispatch = useDispatch();
	const [sharedUser, pListData, isPListFetching, pList_name] = useSelector(
		(state) => [
			state?.influencer?.user?.data || {},
			state?.collectionPage?.pListData || [],
			state?.collectionPage?.isFetching,
			state?.collectionPage?.pList_name,
		]
	);

	const onProductClick = () => {
		if (enableClickTracking) dispatch(handleRecProductClick());
	};

	if (isPListFetching && !pListData.length) {
		return (
			<div className={styles.collectionWrapper} style={{ paddingTop: '20px' }}>
				<Skeleton.Input active={true} className='w-1/2 h-10 mb-9' />
				<div className='flex flex-col lg:flex-row'>
					<div className='h-180 md:h-200 lg:h-700 w-full'>
						<Skeleton.Input
							active={true}
							className='w-full h-180 md:h-200 lg:h-700'
						/>
					</div>
					<div className='w-full grid grid-cols-2 gap-2.5 lg:gap-4 lg:pl-5 pt-3'>
						<Skeleton.Input
							active={true}
							className='lg:max-w-480 h-180 lg:h-full'
						/>
						<Skeleton.Input
							active={true}
							className='lg:max-w-480 h-180 lg:h-full'
						/>
						<Skeleton.Input
							active={true}
							className='lg:max-w-480 h-180 lg:h-full'
						/>
						<Skeleton.Input
							active={true}
							className='lg:max-w-480 h-180 lg:h-full'
						/>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className={styles.collectionWrapper} style={{ paddingTop: '20px' }}>
			{collection?.blog_filter?.length ? (
				<div className='pb-1 md:pb-5'>
					{/* <h1 className='text-xl md:text-xl font-semibold capitalize'>Tags</h1> */}
					<div className='flex flex-wrap'>
						{collection.blog_filter.map((tag) => (
							<div className='rounded-full shadow mx-2 my-3 w-max bg-gray-100'>
								<h3 className='m-0 px-2 sm:px-4 py-1 font-normal text-xs md:text-sm text-black-103'>
									{tag}
								</h3>
							</div>
						))}
					</div>
				</div>
			) : null}
			{pListData?.length ? (
				<div className={styles.flexColLgRow}>
					<div className={styles.productGrid}>
						{pListData.map((product) => (
							<div key={product.mfr_code}>
								<ProductCard
									product={product}
									onProductClick={onProductClick}
									enableClickTracking={enableClickTracking}
									productClickParam={{
										iCode: sharedUser?.influencer_code,
										cCode: sharedUser?.company_code,
										pList_name: pList_name,
										product_brand: product?.product_brand,
										brand: product.brand,
									}}
								/>
							</div>
						))}
					</div>
				</div>
			) : (
				<div className='text-center text-lg font-medium'>No products found</div>
			)}
		</div>
	);
};

export default CollectionProductList;
