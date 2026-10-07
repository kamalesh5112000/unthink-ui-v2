import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { Spin, message } from "antd";
import {
	ArrowLeftOutlined,
	LoadingOutlined,
	CopyOutlined,
} from "@ant-design/icons";

import { openMenuItem } from "../categories/redux/actions";
import {
	isVenlyUserAuthenticated,
	venlyGetAccount,
	venlyRetrieveNFTs,
	venlyRetrieveWallets,
} from "../../helper/venlyUtils";
import { venlyChainSecretType } from "../../constants/config";
import {
	EARNED_NFT_NAMES_TO_SHOW,
	EARNED_NFT_STATUSES,
	EARNED_REWARD_MODAL_TYPES,
	PATH_CREATE_COLLECTION,
	PATH_SIGN_IN,
} from "../../constants/codes";
import { tokenAPIs } from "../../helper/serverAPIs";
import {
	claimEarnedNFTReward,
	connectVenlyWallet,
} from "../earnedRewardModal/redux/actions";
import { getTTid } from "../../helper/getTrackerInfo";

const ERROR_CODES = {
	VENLY_NOT_CONNECTED: "VENLY_NOT_CONNECTED",
	ERROR_CAUGHT_ON_FETCH_NFT: "ERROR_CAUGHT_ON_FETCH_NFT",
};

const EarnRewards = () => {
	const dispatch = useDispatch();
	// const [errorCode, setErrorCode] = useState("");
	// const [wallets, setWallets] = useState([]);
	// const [nonFungibles, setNonFungibles] = useState([]);
	const [loaders, setLoaders] = useState([]);
	// const [validateNFTResult, setValidateNFTResult] = useState(null);
	const [earnedNFTs, setEarnedNFTs] = useState([]);

	const onBack = () => {
		dispatch(openMenuItem(""));
	};

	const { data: authUser } = useSelector((state) => state.auth.user);

	const registerLoader = (item) => {
		setLoaders((items) => [...items, item]);
	};

	const deRegisterLoader = (item) => {
		setLoaders((items) => items.filter((i) => i !== item));
	};

	// const connectVenlyUser = () => {
	// 	registerLoader("connectVenlyUser");
	// 	return venlyGetAccount()
	// 		.then(async (result) => {
	// 			deRegisterLoader("connectVenlyUser");
	// 			if (
	// 				result &&
	// 				result.isAuthenticated &&
	// 				result.auth &&
	// 				result.auth.subject
	// 			) {
	// 				return true;
	// 			} else {
	// 				return false;
	// 			}
	// 		})
	// 		.catch(() => {
	// 			deRegisterLoader("connectVenlyUser");
	// 		});
	// };

	// const fetchWalletDetails = async () => {
	// 	registerLoader("fetchWalletDetails");
	// 	if (isVenlyUserAuthenticated()) {
	// 		const nWallets = await venlyRetrieveWallets(venlyChainSecretType);

	// 		setWallets(nWallets);
	// 		deRegisterLoader("fetchWalletDetails");
	// 		return nWallets;
	// 	} else {
	// 		deRegisterLoader("fetchWalletDetails");

	// 		const res = await connectVenlyUser();
	// 		if (res) {
	// 			return fetchWalletDetails();
	// 		} else {
	// 			setErrorCode(ERROR_CODES.VENLY_NOT_CONNECTED);
	// 		}
	// 	}
	// };

	// const isLoggedInUser = useMemo(() => !!authUser.emailId, [authUser]);

	// useEffect(() => {
	// 	if (isLoggedInUser) {
	// 		fetchWalletDetails();
	// 	}
	// }, [isLoggedInUser]);

	const verifyUserReward = async () => {
		registerLoader("verifyUserReward");
		const params = {
			user_id: getTTid(),
			type: EARNED_REWARD_MODAL_TYPES.LEVEL_1_NFT,
		};

		const res = await tokenAPIs.verifyUserRewardEligibilityAPICall(params);

		const NFTs = res.data?.data?.NFT;
		if (NFTs) {
			setEarnedNFTs(NFTs);
		}

		deRegisterLoader("verifyUserReward");
	};

	useEffect(() => {
		if (authUser.venlyUser?.wallets?.length) {
			verifyUserReward();
		}
	}, [authUser.venlyUser?.wallets]);

	// const fetchNFTDetails = async (nWallets) => {
	// 	registerLoader("fetchNFTDetails");
	// 	const list = [];
	// 	try {
	// 		for (let i = 0; i < nWallets.length; i++) {
	// 			list[i] = { walletId: nWallets[i].id };
	// 			try {
	// 				const NFTDetails = await venlyRetrieveNFTs(list[i].walletId);
	// 				if (NFTDetails) {
	// 					list[i].nonFungibles = NFTDetails;
	// 				}
	// 			} catch (error) {
	// 				console.log("error : ", error);

	// 				list[i].nonFungibles = [];
	// 			}
	// 		}

	// 		setNonFungibles(list);
	// 		deRegisterLoader("fetchNFTDetails");
	// 		return list;
	// 	} catch (error) {
	// 		setErrorCode(ERROR_CODES.ERROR_CAUGHT_ON_FETCH_NFT);
	// 	}
	// 	deRegisterLoader("fetchNFTDetails");
	// };

	// const handleFetchAndValidateNFT = async (nWallets = wallets) => {
	// 	registerLoader("handleFetchAndValidateNFT");
	// 	const NFTList = await fetchNFTDetails(nWallets);
	// 	const firstNFTData = NFTList.find(
	// 		(n) => n.nonFungibles && n.nonFungibles.length
	// 	)?.nonFungibles.find((n) => !!n.attributes);

	// 	if (firstNFTData) {
	// 		try {
	// 			const validatedNFT = await tokenAPIs.validateUserNFTAPICall({
	// 				user_id: authUser.user_id,
	// 				nft_name: firstNFTData.name,
	// 				description: firstNFTData.description,
	// 				contract: firstNFTData.contract,
	// 				attributes: firstNFTData.attributes,
	// 				balance: firstNFTData.balance,
	// 				finalBalance: firstNFTData.finalBalance,
	// 				transferFees: firstNFTData.transferFees,
	// 			});

	// 			if (validatedNFT.data) {
	// 				setValidateNFTResult(validatedNFT.data);
	// 			} else {
	// 				setValidateNFTResult({
	// 					status_code: 400,
	// 				});
	// 			}
	// 		} catch (error) {
	// 			console.log("error : ", error);
	// 			setValidateNFTResult({
	// 				status_code: 400,
	// 			});
	// 		}
	// 	}
	// 	deRegisterLoader("handleFetchAndValidateNFT");
	// };

	// useEffect(() => {
	// 	if (wallets.length) {
	// 		handleFetchAndValidateNFT();
	// 	}
	// }, [wallets]);

	// useEffect(() => {
	// 	fetchNFTDetails(wallets);
	// }, [wallets]);

	// const rewardsNotFound = useMemo(
	// 	() =>
	// 		!loaders.length &&
	// 		!!wallets.length &&
	// 		(!validateNFTResult ||
	// 			(nonFungibles.some((n) => !!n.nonFungibles.length) &&
	// 				validateNFTResult &&
	// 				validateNFTResult.status_code !== 200)),
	// 	[loaders, wallets, nonFungibles, validateNFTResult]
	// );

	// const handleClaimButtonClick = async () => {
	// 	const nWallets = await fetchWalletDetails();
	// 	await handleFetchAndValidateNFT(nWallets);
	// };

	const handleConnectWalletButtonClick = () => {
		dispatch(connectVenlyWallet());
	};

	const handleClaimNFT = (type) => {
		dispatch(
			claimEarnedNFTReward({
				type,
				onSuccess: function onSuccess() {
					verifyUserReward();
				},
			})
		);
	};

	const isLoading = !!loaders.length;

	const level1NFTDetails = earnedNFTs.find(
		(n) => n.type === EARNED_REWARD_MODAL_TYPES.LEVEL_1_NFT
	);

	return (
		<div className='mx-3 sm:container sm:mx-auto'>
			<div className='lg:max-w-6xl-1 mx-auto pb-9'>
				<div
					className='flex items-center cursor-pointer pt-7 lg:pt-0 w-min'
					onClick={onBack}>
					<ArrowLeftOutlined className='text-xl leading-none text-black-200 flex' />
					<span className='pl-4 text-xl font-medium'>Back</span>
				</div>

				<div>
					{/* {isLoggedInUser && !loaders.length && nonFungibles.length ? (
						<div className='mt-11 grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4'>
							{nonFungibles.map((w) => (
								<React.Fragment key={w.walletId}>
									{w.nonFungibles.map((nf) => (
										<div
											className='p-5 bg-gray-100 rounded-2xl'
											key={nf.id}>
											<p className='text-base'>
												<b>
													{nf.contract.symbol} NFT - {nf.contract.address}
												</b>
											</p>
											<p className='text-base'>{nf.name}</p>
											<p>{nf.description}</p>
											{nf.imagePreviewUrl && (
												<img
													className='mt-5'
													height={200}
													src={nf.imagePreviewUrl}
												/>
											)}
										</div>
									))}
								</React.Fragment>
							))}
						</div>
					) : null} */}
					{/* {isLoggedInUser && rewardsNotFound ? ( */}
					<div className='mt-11 py-10 text-center'>
						<p className='text-3xl mb-2'>
							<b>Welcome to your rewards page!</b>
						</p>
						{isLoading ? (
							<>
								<div>
									<Spin
										className='m-auto '
										indicator={<LoadingOutlined className='text-3xl-1' spin />}
									/>
								</div>
								{/* <p className='mt-5'>
									Please wait while we fetch and validate the latest details.
								</p> */}
							</>
						) : (
							<>
								{!authUser.venlyUser?.wallets?.length ? (
									<>
										<p className='text-xl'>
											Connect your wallet to claim your rewards
										</p>
										<div className='text-center mt-5'>
											<button
												className='text-base bg-indigo-600 text-white font-bold px-3 py-1 mb-0 rounded cursor-pointer'
												onClick={handleConnectWalletButtonClick}>
												<span>Connect wallet</span>
											</button>
										</div>
									</>
								) : (
									<>
										{" "}
										{level1NFTDetails ? (
											<>
												{level1NFTDetails.status ===
												EARNED_NFT_STATUSES.EARNED ? (
													<>
														<p className='text-3xl mt-4'>
															<b>Congratulations 🎉</b>
														</p>
														<p className='text-xl'>
															You have earned{" "}
															{
																EARNED_NFT_NAMES_TO_SHOW[
																	EARNED_REWARD_MODAL_TYPES.LEVEL_1_NFT
																]
															}{" "}
															NFT!
														</p>
														<div className='tablet:col-span-3'>
															<img
																src='https://cdn.unthink.ai/img/unthink_main_2023/trophy_GIf.gif'
																alt='NFT reward'
																className='rounded-2xl tablet:rounded-32 h-180 tablet:h-228 my-4 mx-auto'
															/>
														</div>
														<p className='text-xl'>
															Click on the button below to claim it
														</p>
														<div className='text-center mt-5'>
															<button
																className='text-base bg-indigo-600 text-white font-bold px-3 py-1 mb-0 rounded cursor-pointer'
																onClick={() =>
																	handleClaimNFT(
																		EARNED_REWARD_MODAL_TYPES.LEVEL_1_NFT
																	)
																}>
																<span>Claim</span>
															</button>
														</div>
													</>
												) : (
													<p className='text-xl'>
														Stay tuned as we bring games, coupons and gift cards
														from partners just for you!
													</p>
												)}
											</>
										) : (
											<p className='text-xl'>
												<p className='text-xl'>
													You need an NFT to get exclusive rewards. Earn an
													Unthink creator NFT by creating{" "}
													<Link
														onClick={() => onBack()}
													href={PATH_CREATE_COLLECTION}
														className='text-xl underline text-indigo-600 px-0'>
														your first collection
													</Link>
												</p>
											</p>
										)}
									</>
								)}
							</>
						)}
					</div>
					{/* ) : null} */}
					{/* {!loaders.length && !isLoggedInUser ? (
						<div className='mt-11 py-10 text-center'>
							<p className='text-3xl'>
								<b>Earn Rewards</b>
							</p>
							<p className='text-xl mt-2'>
								Connect wallet and Create collection to earn rewards.
							</p>
							<div className='text-center mt-5'>
								<Link
									className='text-base bg-indigo-600 text-white font-bold px-3 py-1 mb-0 rounded cursor-pointer'
									to={PATH_SIGN_IN}>
									<span>Sign In</span>
								</Link>
							</div>
						</div>
					) : null} */}
					{/* {!loaders.length &&
					isLoggedInUser &&
					!validateNFTResult &&
					!rewardsNotFound ? (
						<div className='mt-11 py-10 text-center'>
							<p className='text-3xl'>
								<b>We are signing up reward partners for our NFT holders</b>
							</p>
							<p className='text-xl mt-2'>
								Connect your wallet to claim your rewards
							</p>
							<div className='text-center mt-5'>
								<button
									className='text-base bg-indigo-600 text-white font-bold px-3 py-1 mb-0 rounded cursor-pointer'
									onClick={handleClaimButtonClick}>
									<span>Connect</span>
								</button>
							</div>
						</div>
					) : null} */}
					{/* {!loaders.length &&
					isLoggedInUser &&
					validateNFTResult &&
					!rewardsNotFound ? (
						<div className='mt-11 py-10 text-center'>
							<p className='text-3xl'>
								<b>Stay tuned for rewards here.</b>
							</p>
						</div>
					) : null} */}
				</div>

				{/* <div>
					<div className='mt-11 py-10 text-center'>
						<p className='text-3xl'>
							<b>Coming soon</b>
						</p>
					</div>
				</div> */}
			</div>
		</div>
	);
};

export default EarnRewards;
