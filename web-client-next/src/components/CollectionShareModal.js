import React, { useCallback, useEffect, useMemo, useState } from "react";
import { message, Alert } from "antd";
import {
	CopyOutlined,
	WhatsAppOutlined,
	FacebookOutlined,
	LinkedinOutlined,
} from "@ant-design/icons";
import { useNavigate } from "../helper/useNavigate";
import styles from "./CollectionShareModal.module.css";

import xIcon from "../images/x_white_icon.png";
import Modal from "./modal/Modal";
import { useDispatch, useSelector } from "react-redux";
import { setShowChatModal } from "../hooks/chat/redux/actions";
import {
	collectionQRCodeGenerator,
	getBlogCollectionPagePath,
} from "../helper/utils";
import { PUBLISHED } from "../constants/codes";
import { getTTid } from "../helper/getTrackerInfo";
import Image from "next/image";
import { useUserData } from "../context/UserDataContext";
import { copyToClipboard } from "../helper/copyToClipboard";
import { buildKioskAutoLoginUrls } from "../helper/autoLogin";

const CollectionShareModal = ({
	isOpen,
	collectionDetails,
	collectionOwner,
	isAutoCreateCollection,
	shareOptions = {},
	onClose,
}) => {
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const [autoLoginShareUrls, setAutoLoginShareUrls] = useState(null);


	const {userData } = useUserData()
// console.log('userData',userData);
  
	const collectionRedirectPath = useMemo(
		() =>
			collectionDetails._id &&
			getBlogCollectionPagePath(
				userData?.user_name  || collectionOwner.user_name,
				collectionDetails.path,
				collectionDetails._id,
				collectionOwner.user_id,
				collectionDetails.status,
				collectionDetails.hosted_stores,
				collectionDetails?.collection_theme
			),
		[
			collectionOwner.user_name,
			collectionDetails.path,
			collectionDetails._id,
			collectionOwner.user_id,
			collectionDetails.status,
			collectionDetails.hosted_stores,
			collectionDetails?.collection_theme,
			userData?.user_name,
		]
	);


 


	const collectionPageUrl = useMemo(
		() => `${window?.location.origin || ""}${collectionRedirectPath || ""}`,
		[collectionRedirectPath]
	);


	const platform =
		navigator.userAgentData?.mobile !== undefined
			? navigator.userAgentData.mobile
				? "mobile"
				: "web"
			: /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
				? "mobile"
				: "web";

	const collectionId = collectionDetails?.collection_id;


	const userIdTid = userData?.user_id || getTTid()

	const copybaseUrl = `${collectionPageUrl}?utm_source=unthink_collection_share&utm_medium=${platform}&utm_campaign=${collectionId}&utm_content=unthink_collection_share&unthink_source=unthink_collection_share&unthink_medium=${platform}&unthink_campaign=${collectionId}&unthink_shared=${userIdTid}`;
const shareUrl = `${autoLoginShareUrls?.shareUrl}?utm_source=unthink_collection_share&utm_medium=${platform}&utm_campaign=${collectionId}&utm_content=unthink_collection_share&unthink_source=unthink_collection_share&unthink_medium=${platform}&unthink_campaign=${collectionId}&unthink_shared=${userIdTid}`;
	const qrCodeGeneratorURL =
		autoLoginShareUrls?.qrUrl || collectionQRCodeGenerator(shareUrl);

	useEffect(() => {
		let isMounted = true;
		const autoLoginUser = shareOptions?.autoLoginUser;

		if (!autoLoginUser || !collectionRedirectPath) {
			setAutoLoginShareUrls(null);
			return () => {
				isMounted = false;
			};
		}

		const buildShareAutoLoginUrl = async () => {
			const pagePath = collectionRedirectPath.replace(/^\/+/, "");
			const urls = await buildKioskAutoLoginUrls({
				targetPath: copybaseUrl,
				pageParam: `?page=${pagePath}`,
				errorLabel: "collection share auto-login",
				userId: autoLoginUser.user_id,
				email: autoLoginUser.emailId || autoLoginUser.email,
				phone: autoLoginUser.phone,
				requireUserId: true,
			});

			if (isMounted && urls?.isAutoLogin) {
				setAutoLoginShareUrls(urls);
			}
		};

		buildShareAutoLoginUrl();

		return () => {
			isMounted = false;
		};
	}, [collectionRedirectPath, copybaseUrl, shareOptions?.autoLoginUser]);

	const socialMediaUrls = {
		whatsapp: `https://wa.me/?text=${encodeURIComponent(shareUrl)}`,
		twitter: `https://x.com/intent/tweet?url=${encodeURIComponent(shareUrl)}`,
		facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
		linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`
	};


	 



	const handlePreviewCollectionPage = useCallback(() => {
		onClose();
		dispatch(setShowChatModal(false));
		navigate(collectionRedirectPath);
	}, [collectionRedirectPath, dispatch, navigate, onClose]);

	return (
		<div>
			<Modal
				headerText='Share'
				isOpen={isOpen}
				onClose={onClose}
				maskClosable={false}
				size='sm'
			// okButtonProps={{ className: "hidden" }}
			>
				<div>
					<h1 className={styles.collectionTitle}>
						{collectionDetails.collection_name}
					</h1>
				</div>
				{/* {isAutoCreateCollection ? (
					<div>
						<Alert
							message='The new collection is created and published with the selected products.'
							type='info'
							className='mt-2'
						/>
					</div>
				) : null} */}
				<div className={styles.shareSection}>
					<div className={styles.shareHeader}>
						<p>
							<b>Share your collection with your friends and followers!</b>
						</p>
						<button
							className={styles.viewCollectionBtn}
							onClick={handlePreviewCollectionPage}>
							View Collection
						</button>
					</div>
					{collectionDetails.status !== PUBLISHED && (
						<Alert
							message='Before sharing the collection page, Please make sure that the collection is published.'
							type='info'
							className={styles.alertMessage}
						/>
					)}

					<div className={styles.shareContent}>
						<div className={styles.shareGrid}>
							<div className={styles.socialGrid}>
								<a
									href={socialMediaUrls.facebook}
									target='_blank'
									className={styles.socialLink}
									style={{ backgroundColor: "#4267B2" }}>
									<FacebookOutlined className={styles.socialIconFlex} />
								</a>
								<a
									href={socialMediaUrls.whatsapp}
									target='_blank'
									className={styles.socialLink}
									style={{ backgroundColor: "#128C7E" }}>
									<WhatsAppOutlined className={styles.socialIconFlex} />
								</a>
								<a
									href={socialMediaUrls.twitter}
									target='_blank'
									className={styles.twitterLink}>
									<Image
										src={xIcon}
										width={28}
										height={28}
										alt="X"
										className={styles.twitterIcon}
									/>
								</a>
								<a
									href={socialMediaUrls.linkedin}
									target='_blank'
									className={styles.socialLink}
									style={{ backgroundColor: "#0072b1" }}>
									<LinkedinOutlined className={styles.socialIconFlex} />
								</a>
							</div>

							{qrCodeGeneratorURL ? (
								<div className={styles.qrCodeWrapper}>
									<img
										className={styles.qrCodeImage}
										src={qrCodeGeneratorURL}
										alt="Collection share QR code"
									/>
								</div>
							) : null}
						</div>

						<div className={styles.urlBox}>
							{shareUrl}{" "}
							<CopyOutlined
								className={styles.copyIconLarge}
								onClick={async () => {
									await copyToClipboard(shareUrl);
									message.success("Copied", 1);
								}}
							/>
						</div>
					</div>
				</div>
			</Modal>
		</div>
	);
};

export default React.memo(CollectionShareModal);
