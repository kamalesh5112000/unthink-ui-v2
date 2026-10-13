import React from "react";
import { useNavigate } from "../../helper/useNavigate";
import { Image } from "antd";
import { HomeOutlined } from "@ant-design/icons";

import ChatContainer from "../aura/ChatContainer";
import { UserProfileMenu } from "./UserProfileMenu";

import downArrowIcon from "../../images/downArrowIcon.svg";
import samskaraLogo from "../../images/samskara_instance_logo.png";
import { MAIN_SITE_URL, STORE_USER_NAME_SAMSKARA } from "../../constants/codes";

import styles from './samskaraHeader.module.scss';

export const samskaraHeaderMenu = [
	{
		label: "Seasonal",
		href: "https://www.samskarahome.com/collections/sale-seasonal",
		children: [
			{
				label: "Ganesh Chaturthi",
				href: "https://www.samskarahome.com/collections/ganesh-chaturthi",
			},

			{
				label: "Holi",
				href: "https://www.samskarahome.com/collections/holi",
			},

			{
				label: "Janmashtami",
				href: "https://www.samskarahome.com/collections/janmashtami",
			},

			{
				label: "Karvachauth",
				href: "https://www.samskarahome.com/collections/karvachauth",
			},

			{
				label: "Mother's day",
				href: "https://www.samskarahome.com/collections/mothers-day",
			},

			{
				label: "Navaratri",
				href: "https://www.samskarahome.com/collections/navaratri",
			},

			{
				label: "Rakhi",
				href: "https://www.samskarahome.com/collections/rakhi-special",
			},

			{
				label: "Valentines day",
				href: "https://www.samskarahome.com/collections/valentines-day",
			},

			{
				label: "Yoga Day",
				href: "https://www.samskarahome.com/collections/international-yoga-day",
			},
		],
	},
	{
		label: "Mega Sale",
		href: "https://www.samskarahome.com/collections/mega-sale",
		children: [
			{
				label: "25% Off",
				href: "https://www.samskarahome.com/collections/25-off",
			},
			{
				label: "40% Off",
				href: "https://www.samskarahome.com/collections/40-off",
			},
			{
				label: "50% Off",
				href: "https://www.samskarahome.com/collections/50-off",
			},
			{
				label: "70% Off",
				href: "https://www.samskarahome.com/collections/70-off",
			},
		],
	},
	{
		label: "Pooja Essentials",
		href: "https://www.samskarahome.com/collections/pooja-essentials",
		children: [
			{
				label: "Everyday Essentials",
				href: "https://www.samskarahome.com/collections/everyday-essentials",
			},
			{
				label: "Pooja Samagri",
				href: "https://www.samskarahome.com/collections/pooja-samagri",
			},
			{
				label: "Jewellery",
				href: "https://www.samskarahome.com/collections/jewellery",
			},
			{
				label: "God Idols",
				href: "https://www.samskarahome.com/collections/god-idols-1",
			},
			{
				label: "Diyas",
				href: "https://www.samskarahome.com/collections/diyas",
			},
		],
	},
	{
		label: "Festive Decor",
		href: "https://www.samskarahome.com/collections/festive-decor",
		children: [
			{
				label: "Brass Wall Hangings",
				href: "https://www.samskarahome.com/collections/brass-wall-hangings",
			},
			{
				label: "Door Hangings",
				href: "https://www.samskarahome.com/collections/door-hangings",
			},
			{
				label: "Hand Painted Diyas",
				href: "https://www.samskarahome.com/collections/hand-painted-diyas",
			},
			{
				label: "Lamps",
				href: "https://www.samskarahome.com/collections/lamps",
			},
			{
				label: "Metal Rangoli",
				href: "https://www.samskarahome.com/collections/metal-rangoli",
			},
			{
				label: "Playing Cards",
				href: "https://www.samskarahome.com/collections/playing-cards",
			},
			{
				label: "Rangoli Mats",
				href: "https://www.samskarahome.com/collections/rangoli-mats",
			},
			{
				label: "Tealight Holders",
				href: "https://www.samskarahome.com/collections/tealight-candle-holders",
			},
			{
				label: "Torans",
				href: "https://www.samskarahome.com/collections/torans",
			},
			{
				label: "Urlis",
				href: "https://www.samskarahome.com/collections/urli",
			},
		],
	},
	{
		label: "Evil Eye",
		href: "https://www.samskarahome.com/collections/evil-eye",
		children: [
			{
				label: "Vastu/Feng Shui",
				href: "https://www.samskarahome.com/collections/vastu-feng-shui",
			},
			{
				label: "Smudge Bundles",
				href: "https://www.samskarahome.com/collections/smudge-bundles",
			},
			{
				label: "Evil Eye Gift Sets",
				href: "https://www.samskarahome.com/collections/evil-eye-gift-set",
			},
		],
	},
	{
		label: "Home",
		href: "https://www.samskarahome.com/collections/home-decor",
		children: [
			{
				label: "Bed & Bath",
				href: "https://www.samskarahome.com/collections/bed-bath",
			},
			{
				label: "Candles",
				href: "https://www.samskarahome.com/collections/candles",
			},
			{
				label: "Decorative Accetns",
				href: "https://www.samskarahome.com/collections/decorative-accents-1",
			},
			{
				label: "Macrame",
				href: "https://www.samskarahome.com/collections/macrame",
			},
			{
				label: "Locks",
				href: "https://www.samskarahome.com/collections/locks",
			},
			{
				label: "Kitche & Dining",
				href: "https://www.samskarahome.com/collections/kitchen-dining",
			},
		],
	},
	{
		label: "Plants & Garden",
		href: "https://www.samskarahome.com/collections/plants-garden",
		children: [
			{
				label: "Planters",
				href: "https://www.samskarahome.com/collections/planters",
			},
			{
				label: "Preserved Foliage",
				href: "https://www.samskarahome.com/collections/preserved-foliage",
			},
		],
	},
	{
		label: "Home Fragrance ",
		href: "https://www.samskarahome.com/collections/home-fragrance",
		children: [
			{
				label: "Candles",
				href: "https://www.samskarahome.com/collections/candles",
			},
			{
				label: "Aroma Oils",
				href: "https://www.samskarahome.com/collections/warming-oils",
			},
			{
				label: "Camphor Cones",
				href: "https://www.samskarahome.com/collections/camphor-cones",
			},
			{
				label: "Diffusers",
				href: "https://www.samskarahome.com/collections/diffusers",
			},
			{
				label: "Diy Multipurpose Fragrance Oil",
				href: "https://www.samskarahome.com/collections/diy-multipurpose-fragrance-oil",
			},
			{
				label: "Essential Oils",
				href: "https://www.samskarahome.com/collections/essential-oils",
			},
			{
				label: "Fragrance Sachets",
				href: "https://www.samskarahome.com/collections/fragrance-sachets",
			},
			{
				label: "Pocket Sprays",
				href: "https://www.samskarahome.com/collections/pocket-sprays",
			},
			{
				label: "Rose Water",
				href: "https://www.samskarahome.com/collections/rose-water",
			},
			{
				label: "Room Sprays",
				href: "https://www.samskarahome.com/collections/room-sprays",
			},
			{
				label: "Incense / Dhoop",
				href: "https://www.samskarahome.com/collections/incense",
			},
		],
	},
	{
		label: "Gifting",
		href: "https://www.samskarahome.com/collections/gifting",
		children: [
			{
				label: "Bulk Enquiries",
				href: "https://www.samskarahome.com/collections/bulk-enquiries",
			},
			{
				label: "Candle Gift Sets",
				href: "https://www.samskarahome.com/collections/candle-gift-sets",
			},
			{
				label: "Corporate Gifting",
				href: "https://www.samskarahome.com/collections/corporate-gifting",
			},
			{
				label: "Custom Gifting",
				href: "https://www.samskarahome.com/pages/contact",
			},
			{
				label: "E-Gift Card",
				href: "https://www.samskarahome.com/products/samskara-home-gift-card",
			},
			{
				label: "Hampers",
				href: "https://www.samskarahome.com/collections/hampers",
			},
			{
				label: "Jashn Gift Sets",
				href: "https://www.samskarahome.com/collections/jashn-giftsets",
			},
			{
				label: "Stationery",
				href: "https://www.samskarahome.com/collections/stationery",
			},
		],
	},
	{
		label: "Shop All",
		href: "https://www.samskarahome.com/collections/all-products",
	},
];

const SamskaraHeader = ({
	disabledOutSideClick,
	config,
	trackCollectionData,
	isBTInstance,
	showProfileIcon,
	isUserFetching,
	headerProfileMenu,
	currentUser,
	showChatModal,
}) => {
	const navigate = useNavigate();
	const getSubMenuOptions = (children) => {
		return (
			<ul className='z-10 top-3 pb-1.25 pt-2.5 shadow bg-white w-max'>
				{children && children.map((subMenu) => 
					subMenu && subMenu.href ? (
						<li key={subMenu.label}>
							<a
								className='px-3.5 py-3 flex w-full text-black-101 leading-none'
								style={{ fontSize: "13px" }}
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
			{/* hide all child div for mobile view except chatContainer*/}
			{/* chatContainer visible for mobile and desktop view both for samskara*/}
			<div
				id='samskara_desktop_header_menu'
				className='lg:grid gap-7 lg:pt-9 lg:pb-5 lg:px-10 lg:min-h-160 bg-white'>
				<div className='flex justify-around items-center'>
					<Image
						src={samskaraLogo}
						width={200}
						preview={false}
						className='cursor-pointer hidden lg:block'
						onClick={() => navigate(MAIN_SITE_URL[STORE_USER_NAME_SAMSKARA])}
					/>

					{/* <HomeOutlined
						className='hidden lg:block text-2xl cursor-pointer'
						onClick={() => navigate(PATH_ROOT)}
					/> */}

					<ChatContainer
						disabledOutSideClick={disabledOutSideClick}
						config={config}
						trackCollectionData={trackCollectionData}
						isBTInstance={isBTInstance}
					/>
					{/* set width only to keep the aura center aligned */}
					<div className='min-w-40 hidden lg:block'>
						<UserProfileMenu
							isUserFetching={isUserFetching}
							headerProfileMenu={headerProfileMenu}
							currentUser={currentUser}
						/>
					</div>
				</div>

				<div className='hidden lg:flex flex-wrap items-center justify-center'>
					{samskaraHeaderMenu.map((menu) => (
						<div
							key={menu.label}
							className='px-4 py-1.75 text-black-101 relative header_menu'>
							<div className='flex items-center cursor-pointer header_menu_bottom_border'>
								<a
									className='px-0 text-black-101 leading-none'
									style={{ fontSize: "13px" }}
									href={menu.href}
									target='_blank'>
									{menu.label}
								</a>
								{menu.children && (
									<img
										src={downArrowIcon}
										alt=""
										className='cursor-pointer'
									/>
								)}
							</div>
							{menu.children && (
								<div className='absolute submenu_container hidden z-30 mt-2'>
									{getSubMenuOptions(menu.children)}
								</div>
							)}
						</div>
					))}
				</div>
			</div>
		</>
	);
};

export default SamskaraHeader;
