import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useDispatch, useSelector } from "react-redux";

import { closeCollectionShareModal } from "./redux/actions";
import { useUserData } from "../../context/UserDataContext";

const CollectionShareModal = dynamic(
	() => import("../../components/CollectionShareModal"),
	{ ssr: false }
);

const CollectionShareModalComponent = () => {
	const dispatch = useDispatch();
	const [enabledModal, setEnabledModal] = useState(false);
	const [
		isModalOpen,
		collectionDetails,
		collectionOwner,
		isAutoCreateCollection,
		shareOptions,
	] = useSelector((state) => [
		state.collectionShareModal.isModalOpen,
		state.collectionShareModal.collectionDetails,
		state.collectionShareModal.collectionOwner,
		state.collectionShareModal.isAutoCreateCollection,
		state.collectionShareModal.shareOptions,
	]);
const {setUserData  } = useUserData()
	// load modal on DOM only when required
	useEffect(() => {
		if (isModalOpen && !enabledModal) {
			setEnabledModal(true);
		}
	}, [isModalOpen]);

	const handleCollectionShareModalClose = () => {
		dispatch(closeCollectionShareModal());
		setUserData(null)
	};

	return (
		<div>
			{enabledModal && (
				<CollectionShareModal
					isOpen={isModalOpen}
					collectionDetails={collectionDetails}
					collectionOwner={collectionOwner}
					isAutoCreateCollection={isAutoCreateCollection}
					shareOptions={shareOptions}
					onClose={handleCollectionShareModalClose}
				/>
			)}
		</div>
	);
};

export default React.memo(CollectionShareModalComponent);
