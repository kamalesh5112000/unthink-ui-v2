import React from "react";
import { useNavigate } from "../../helper/useNavigate";
import { Image } from "antd";
import { HomeOutlined } from "@ant-design/icons";

import ChatContainer from "../aura/ChatContainer";
import { UserProfileMenu } from "./UserProfileMenu";

import heroesVillainsLogo from "../../images/heroesvillains_instance_logo.webp";
import {
	MAIN_SITE_URL,
	STORE_USER_NAME_HEROESVILLAINS,
} from "../../constants/codes";

import styles from './heroesVillainsHeader.module.scss';


export const heroesVillainsHeaderMenu = [
	{
		label: "FEATURED",
		href: "https://heroesvillains.com/collections/shop-all",
		children: [
			{
				label: "SUMMER ESSENTIALS",
				href: "https://heroesvillains.com/collections/summer-essentials",
			},
			{
				label: "NEW ARRIVALS",
				href: "https://heroesvillains.com/collections/new-arrivals",
			},
			{
				label: "BEST SELLERS",
				href: "https://heroesvillains.com/collections/best-selling-collection",
			},
			{
				label: "SHOP ALL",
				href: "https://heroesvillains.com/collections/shop-all",
			},
			{
				label: "GIFT CARD",
				href: "https://heroesvillains.com/products/gift-card",
			},
			{
				label: "CONCEPT PENDING: A HEROES & VILLAINS PODCAST",
				href: "https://heroesvillains.com/pages/heroes-villains-concept-pending-podcast",
			},
		],
	},
	{
		label: "MEN'S",
		href: "https://heroesvillains.com/collections/men",
		children: [
			{
				label: "MEN'S SHORT SLEEVE TEES",
				href: "https://heroesvillains.com/collections/mens-graphic-tees",
			},
			{
				label: "MEN'S LONG SLEEVE TEES",
				href: "https://heroesvillains.com/collections/mens-long-sleeve-tees ",
			},
			{
				label: "MEN'S HOODIES, SWEATSHIRTS, & PULLOVERS",
				href: "https://heroesvillains.com/collections/mens-sweatshirt-hoodies",
			},
			{
				label: "MEN'S BOTTOMS",
				href: "https://heroesvillains.com/collections/mens-pants-bottoms",
			},
			{
				label: "MEN'S ACTIVE & SLEEP",
				href: "https://heroesvillains.com/collections/mens-active-sleep",
			},
			{
				label: "MEN'S RESORT WEAR",
				href: "https://heroesvillains.com/collections/mens-resort-wear",
			},
			{
				label: "SHOP ALL - MEN'S",
				href: "https://heroesvillains.com/collections/men",
			},
			{
				label: "SALE",
				href: "https://heroesvillains.com/collections/last-chance-mens-unisex",
			},
		],
	},
	{
		label: "WOMEN'S",
		href: "https://heroesvillains.com/collections/womens",
		children: [
			{
				label: "WOMEN'S TEES & TOPS",
				href: "https://heroesvillains.com/collections/womens-tees-tops",
			},
			{
				label: "WOMEN'S SLEEPWEAR",
				href: "https://heroesvillains.com/collections/womens-sleepwear",
			},
			{
				label: "WOMEN'S FLEECE",
				href: "https://heroesvillains.com/collections/womens-sweatshirts-hoodies",
			},
			{
				label: "WOMEN'S ACTIVE & LOUNGE",
				href: "https://heroesvillains.com/collections/womens-active-lounge",
			},
			{
				label: "WOMEN'S RESORT WEAR",
				href: "https://heroesvillains.com/collections/womens-resort-wear",
			},
			{
				label: "SHOP ALL -  WOMEN'S",
				href: "https://heroesvillains.com/collections/womens",
			},
			{
				label: "SALE",
				href: "https://heroesvillains.com/collections/last-chance-womens",
			},
		],
	},
	{
		label: "OUTERWEAR",
		href: "https://heroesvillains.com/collections/outerwear",
		children: [
			{
				label: "BOMBER JACKETS",
				href: "https://heroesvillains.com/collections/bomber-jackets",
			},
			{
				label: "VESTS",
				href: "https://heroesvillains.com/collections/vests",
			},
			{
				label: "WINDBREAKERS",
				href: "https://heroesvillains.com/collections/windbreakers",
			},
			{
				label: "VARSITY JACKETS",
				href: "https://heroesvillains.com/collections/varsity-jackets",
			},
			{
				label: "VARSITY CARDIGANS",
				href: "https://heroesvillains.com/collections/varsity-cardigans",
			},
			{
				label: "SHOP ALL - OUTERWEAR",
				href: "https://heroesvillains.com/collections/outerwear",
			},
			{
				label: "SALE",
				href: "https://heroesvillains.com/collections/last-chance-outerwear",
			},
		],
	},
	{
		label: "ACCESSORIES",
		href: "https://heroesvillains.com/collections/accessories",
		children: [
			{
				label: "BAGS",
				href: "https://heroesvillains.com/collections/accessories-bags",
			},
			{
				label: "HEADWEAR",
				href: "https://heroesvillains.com/collections/headwear",
			},
			{
				label: "GLOVES",
				href: "https://heroesvillains.com/collections/gloves",
			},
			{
				label: "SCARVES",
				href: "https://heroesvillains.com/collections/scarves",
			},
			{
				label: "WALLETS",
				href: "https://heroesvillains.com/collections/accessories-wallets",
			},
			{
				label: "FOOTWEAR",
				href: "https://heroesvillains.com/collections/footwear",
			},
			{
				label: "SHOP ALL - ACCESSORIES",
				href: "https://heroesvillains.com/collections/accessories",
			},
			{
				label: "SALE",
				href: "https://heroesvillains.com/collections/last-chance-accessories",
			},
		],
	},
	{
		label: "TRAVEL",
		href: "https://heroesvillains.com/collections/luggage-travel",
	},
	{
		label: "SHOP BY FANDOM",
		href: "https://heroesvillains.com/collections/shop-all",
		children: [
			{
				label: "HEROES & VILLAINS",
				href: "https://heroesvillains.com/collections/heroes-villains-branded",
			},
			{
				label: "STAR WARS",
				href: "https://heroesvillains.com/pages/star-wars",
			},
			{
				label: "MARVEL",
				href: "https://heroesvillains.com/pages/marvel",
			},
			{
				label: "DC COMICS",
				href: "https://heroesvillains.com/pages/dc-comics",
			},
			{
				label: "DUNGEONS & DRAGONS",
				href: "https://heroesvillains.com/pages/dungeons-and-dragons",
			},
			{
				label: "STAR TREK",
				href: "https://heroesvillains.com/collections/star-trek",
			},
			{
				label: "CRITICAL ROLE",
				href: "https://heroesvillains.com/collections/critical-role",
			},
			{
				label: "G.I. JOE",
				href: "https://heroesvillains.com/collections/g-i-joe",
			},
			{
				label: "GODZILLA",
				href: "https://heroesvillains.com/collections/godzilla",
			},
			{
				label: "INDIANA JONES",
				href: "https://heroesvillains.com/collections/indiana-jones",
			},
			{
				label: "LORE OLYMPUS",
				href: "https://heroesvillains.com/collections/lore-olympus",
			},
			{
				label: "MAGIC: THE GATHERING",
				href: "https://heroesvillains.com/collections/magic-the-gathering",
			},
			{
				label: "MASTERS OF THE UNIVERSE",
				href: "https://heroesvillains.com/collections/masters-of-the-universe",
			},
			{
				label: "REBEL MOON",
				href: "https://heroesvillains.com/collections/rebel-moon",
			},
			{
				label: "TEENAGE MUTANT NINJA TURTLES",
				href: "https://heroesvillains.com/collections/teenage-mutant-ninja-turtles",
			},
			{
				label: "WARHAMMER 40,000",
				href: "https://heroesvillains.com/collections/warhammer",
			},
			{
				label: "THE WITCHER",
				href: "https://heroesvillains.com/collections/the-witcher",
			},
		],
	},
	{
		label: "SALE",
		href: "https://heroesvillains.com/collections/heroes-villains-clearance",
	},
];

const HeroesVillainsHeader = ({
	disabledOutSideClick,
	config,
	trackCollectionData,
	isBTInstance,
	showProfileIcon,
	isUserFetching,
	headerProfileMenu,
	currentUser,
}) => {
	const getSubMenuOptions = (children) => {
		return (
			<ul className='z-10 top-3 py-4.5 shadow bg-white'>
				{children && children.map((subMenu) =>
					subMenu && subMenu.href ? (
						<li key={subMenu.label}>
							<a
								className='px-5 py-3 flex w-full text-black-101 leading-none text-base font-light'
								href={subMenu.href}
								target='_blank'>
								{subMenu.label}
							</a>
						</li>
					) : null
				)}
			</ul>
		);
	};
	return (
		<>
			<div className='flex bg-white'>
				<div className='flex items-center' style={{ width: "75px" }}>
					<Image
						src={heroesVillainsLogo}
						preview={false}
						className='cursor-pointer hidden lg:block w-full'
						style={{ height: "70px" }}
						onClick={() =>
							navigate(MAIN_SITE_URL[STORE_USER_NAME_HEROESVILLAINS])
						}
					/>
				</div>
				<div
					id='heroesVillains_desktop_header_menu'
					className='lg:grid gap-7 lg:py-5 lg:px-10 lg:min-h-160 w-full'>
					<div className='flex justify-between items-center'>
						{/* set width only to keep content center aligned */}
						<div className='min-w-40 hidden lg:flex justify-center'>
							{/* <HomeOutlined
								className='text-2xl cursor-pointer'
								onClick={() => navigate(PATH_ROOT)}
							/> */}
						</div>

						<ChatContainer
							disabledOutSideClick={disabledOutSideClick}
							config={config}
							trackCollectionData={trackCollectionData}
							isBTInstance={isBTInstance}
						/>
						{/* set width only to keep the aura center aligned */}
						<div className='min-w-40 hidden lg:block'>
							{/* {showProfileIcon ? ( */}
							<UserProfileMenu
								isUserFetching={isUserFetching}
								headerProfileMenu={headerProfileMenu}
								currentUser={currentUser}
							/>
							{/* ) : null} */}
						</div>
					</div>

					<div
						className='hidden lg:flex flex-wrap items-center justify-center leading-6'
						style={{
							rowGap: "10px",
							columnGap: "40px",
							color: "rgb(33, 31, 32)",
						}}>
						{heroesVillainsHeaderMenu.map((menu) => (
							<div key={menu.label} className='relative header_menu'>
								<div className='flex items-center cursor-pointer header_menu_bottom_border'>
									<a
										className='px-0 lett font-semibold'
										style={{
											fontSize: "13.2px",
											letterSpacing: "1.98px",
											lineHeight: "22.44px",
											color: "rgb(33, 31, 32)",
										}}
										href={menu.href}
										target='_blank'>
										{menu.label}
									</a>
								</div>
								{menu.children && (
									<div
										className='absolute submenu_container hidden z-30 mt-2'
										style={{ width: "280px", letterSpacing: "0.25px" }}>
										{getSubMenuOptions(menu.children)}
									</div>
								)}
							</div>
						))}
					</div>
				</div>
				{/* set width only to keep content center aligned */}
				<div style={{ width: "75px" }}></div>
			</div>
		</>
	);
};

export default HeroesVillainsHeader;
