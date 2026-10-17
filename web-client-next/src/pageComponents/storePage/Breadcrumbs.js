import React, { useMemo } from "react";
import { HomeOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { useNavigate } from "../../helper/useNavigate";

import {
	capitalFirstLetter,
	isEmpty,
	getSubDomain,
	generateRoute,
	getThemeCollectionsPagePath,
} from "../../helper/utils";
import { MAIN_SITE_URL, PATH_ROOT, PATH_STORE } from "../../constants/codes";
import { current_store_name } from "../../constants/config";
import styles from "./breadcrumbs.module.scss";
import { useSelector } from "react-redux";
import {  useRouter } from "next/router";
import AuthInput from "../../components/kiosk/components/AuthInput";

const Breadcrumbs = ({
	isRootPage: isInspirationDisable,
	isCollectionPage,
	isCollectionReviewPage,
	isMyProfilePage,
	isCustomProductsPage,
	is_store_instance,
	currentCollectionName,
	currentCollectionId,
	collectionsBy,
	theme,
	userName,
	user_id,
	isCreateFreeCollectionPage,
	pdppage,
	hasKioskAccess,
	isCartPage,
}) => {
	const router = useRouter();
	 const [
		authUserName,
	  ] = useSelector((state) => [
		
		state.influencer.data,])
// 	console.log('sdsvgfyeddf',router.asPath === `/influencer/${authUserName?.user_name}/`  );
// 	console.log(`/influencer/${authUserName?.user_name}`  );
// 	console.log('isCollectionPage',isCollectionPage );
	
// 	console.log("pathname:", router.pathname);
// console.log("asPath", router.asPath === '/categories/all/');
// console.log("query:", router.query);

	const navigate = useNavigate();
	const subDomain = typeof window !== 'undefined' ? getSubDomain(window.location.hostname) : null;

	const breadCrumbs = useMemo(() => {
		let breadCrumbItems = [];

		if (subDomain) {
			breadCrumbItems.push({ label: subDomain });
			if (!isInspirationDisable) {
				breadCrumbItems[0].url = PATH_ROOT;
			}
		}

		if (isMyProfilePage) {
			breadCrumbItems.push({ label: "My profile" });
		}

		if (isCustomProductsPage) {
			breadCrumbItems.push({ label: "My products" });
		}
		if (isCartPage) {
			breadCrumbItems.push({ label: "Cart" });
		}

		const addUserName = userName;
		const isCollectionOrReviewPage = isCollectionPage || isCollectionReviewPage ;
		const checkForPageNoFond = !isCollectionOrReviewPage || currentCollectionId; // not showing user_name and theme breadcrumb on collection page if data not found

		if (addUserName && checkForPageNoFond) {
			breadCrumbItems.push({
				label: userName,
				url: isCollectionOrReviewPage ? generateRoute(user_id, userName) : undefined,
			});
		}

		if (!addUserName && theme && checkForPageNoFond) {
			breadCrumbItems.push({
				label: theme,
				url: isCollectionOrReviewPage ? getThemeCollectionsPagePath(theme) : theme ? '/':   undefined,
			});
		}



		if (isCollectionOrReviewPage) {
			breadCrumbItems.push({ label: currentCollectionName });
		}

		if (isCreateFreeCollectionPage) {
			breadCrumbItems.push({
				label: currentCollectionName,
				url: isCreateFreeCollectionPage ? '/' : undefined
			});
		}
		if(router.asPath === `/influencer/${authUserName?.user_name}/`){
			breadCrumbItems.push({url:authUserName?.user_name ? '/' : ''})
		}

		return breadCrumbItems;
	}, [
		isInspirationDisable,
		isCollectionPage,
		isCollectionReviewPage,
		isMyProfilePage,
		isCustomProductsPage,
		currentCollectionName,
		collectionsBy,
		subDomain,
		theme,
		userName,
		user_id,
	]);

	const isHomeDisable = useMemo(() => isEmpty(breadCrumbs), [breadCrumbs]);

	const mainSiteUrl = useMemo(() => MAIN_SITE_URL[current_store_name], []);

	return (
		<div className={styles.breadcrumbsContainer}>
			<div
				className={`${styles.breadcrumbsInner} ${isInspirationDisable ? styles.breadcrumbsInnerInspirationDisable : styles.breadcrumbsInnerDefault
					}`}>
				<div className={styles.breadcrumbsFlex}>
					{/* Back Button for Collection Review Page */}				
					{router.asPath !== `/` && (
						<>
							<ArrowLeftOutlined 
								className={styles.backIcon}
								onClick={() => window.history.back()}
							/>
							<div>/</div> 
						
						</>
					)}
					
					{/* Home Icon */}
					{!pdppage && 
					<HomeOutlined
						className={`${styles.homeIcon} ${isHomeDisable ? styles.homeIconDisabled : styles.homeIconActive
							}`}
						onClick={() =>
							!isHomeDisable &&
							(subDomain && mainSiteUrl
								? navigate(mainSiteUrl)
								: navigate(is_store_instance ? PATH_ROOT : PATH_STORE))
						}
					/>
					}
					{/* Breadcrumb Items */}
					{breadCrumbs?.map((item) => {
						return item?.label ? (
							<React.Fragment key={item.label}>
								<div>/</div>
								<div
									className={`${item.url
										? styles.breadcrumbLink
										: styles.breadcrumbText
										}`}
									onClick={() => {
										item.url && navigate(item?.url);
									}}>
									{capitalFirstLetter(item.label)}
								</div>
							</React.Fragment>
						) : null;
					})}
					{hasKioskAccess && isCartPage && <AuthInput styles={"mb-0 w-fit pr-7"} />}
				</div>
			</div>
		</div>
	);
};

export default Breadcrumbs;
