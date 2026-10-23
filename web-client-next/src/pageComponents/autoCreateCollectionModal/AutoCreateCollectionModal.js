import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import Modal from "../../components/modal/Modal";
import { closeAutoCreateCollectionModal } from "./redux/actions";
import { setProductsToAddInWishlist } from "../wishlist/redux/actions";
import { createWishlist } from "../wishlistActions/createWishlist/redux/actions";
import { COLLECTION_TYPE_CUSTOM_PLIST, PUBLISHED } from "../../constants/codes";
import { capitalFirstLetter } from "../../helper/utils";

const AutoCreateCollectionModal = ({
	isOpen,
	collectionData,
	isShareCollectionEnable,
}) => {
	const [updatedData, setUpdatedData] = useState({
		collection_name: "",
		description: "",
	});
	const [error, setError] = useState({
		collection_name: "",
		// description: "",
	});

	const dispatch = useDispatch();

	useEffect(() => {
		if (collectionData) {
			setUpdatedData({
				collection_name:
					capitalFirstLetter(collectionData.collection_name) || "",
				description: collectionData.description || "",
			});
		}
	}, [collectionData]);

	const isDataValid = useCallback((data = {}) => {
		let isValid = true;
		const errorList = {
			collection_name: "",
			description: "",
		};

		if (!data.collection_name) {
			errorList.collection_name = "Please enter collection name";
			isValid = false;
		}
		// if (!data.description) {
		// 	errorList.description = "Please enter description";
		// 	isValid = false;
		// }

		setError(errorList);
		return isValid;
	}, []);

	const handleInputChange = useCallback((e) => {
		const { name, value } = e.target;
		setUpdatedData((data) => ({ ...data, [name]: value }));
	}, []);

	const onModalClose = () => {
		dispatch(closeAutoCreateCollectionModal());
		dispatch(setProductsToAddInWishlist([]));
		setError({});
	};

	const handleFormDataSubmit = useCallback(
		(e) => {
			e.preventDefault();

			if (isDataValid(updatedData)) {
				// create collection with product
				const createPayload = {
					...collectionData,
					...updatedData,
					fetchUserCollections: true,
					isShareCollectionEnable,
					status: isShareCollectionEnable ? PUBLISHED : undefined,
					type: COLLECTION_TYPE_CUSTOM_PLIST,
				};

				dispatch(createWishlist(createPayload));
				onModalClose();
			}
		},
		[updatedData, collectionData.product_lists, isShareCollectionEnable]
	);

	return (
		<Modal
			isOpen={isOpen}
			onClose={onModalClose}
			headerText='Almost there! Give some final touches before sharing your collection!'
			maskClosable={false}
			size='md'
			headerTextSpacingClassName='p-2.5'
			headerTextClassName='text-xl font-medium'
			closeClassName='text-xl'>
			<form onSubmit={handleFormDataSubmit} className="z-50" >
				<div>
					<label className='text-base text-black-100 font-semibold block mb-0.75'>
						Name of your collection
					</label>
					<input
						className='text-left placeholder-gray-101 outline-none px-3 h-10 bg-white rounded-xl w-full'
						placeholder='Enter collection name'
						type='text'
						name='collection_name'
						value={updatedData.collection_name}
						onChange={handleInputChange}
					/>
					{error?.collection_name && (
						<p className='text-red-500 my-1 h-3.5 leading-none'>
							{error.collection_name}
						</p>
					)}
				</div>
				<div>
					<label className='text-base text-black-100 font-semibold block mt-4 mb-0.75'>
						Say something about this. (Optional)
					</label>
					<div className='bg-white rounded-xl'>
						<textarea
							className='text-left placeholder-gray-101 bg-white outline-none px-3 pt-3 rounded-xl w-full resize-none overflow-hidden'
							placeholder='Type two lines here...'
							name='description'
							rows={5} 
							value={updatedData.description}
							onChange={handleInputChange}
						/>
					</div>
					{/* {error?.description && (
						<p class='text-red-500 my-1 h-3.5 leading-none'>
							{error.description}
						</p>
					)} */}
				</div>
				<div className='text-right mt-4'>
					<button
						type='submit'
						className='rounded-xl  text-white font-bold text-xs md:text-sm py-2 px-4.5 bg-secondary'>
						{isShareCollectionEnable ? "Continue" : "Save"}
					</button>
				</div>
			</form>
		</Modal>
	);
};

export default React.memo(AutoCreateCollectionModal);
