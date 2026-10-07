import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { useNavigate } from "../../helper/useNavigate";

import useTheme from "../../hooks/chat/useTheme";
import { PATH_ROOT } from "../../constants/codes";
import { THEME_ALL } from "../../constants/themeCodes";
import ChatContainer from "../storePage/ChatContainer";
import { UserProfileMenu } from "../storePage/UserProfileMenu";
import { getThemeCollectionsPagePath } from "../../helper/utils";
import { openWishlistModal } from "../wishlist/redux/actions";
import { useDispatch, useSelector } from "react-redux";
import { FiShoppingCart } from "react-icons/fi";
import { FaRegHeart } from "react-icons/fa";
import walletIcon from "../../components/singleCollection/images/wallet_new.svg";
import tryOnIcon from "../../components/singleCollection/images/Card/camera.svg";
import Image from "next/image";
import styles from "./SwiftlyHeader.module.css";
import { current_store_name, is_store_instance } from "../../constants/config";
import { BsBookmarkPlus, BsBookmarkPlusFill } from "react-icons/bs";
import { Tooltip } from "antd";
import { useRouter } from "next/router";

const SwiftlyHeader = ({
  disabledOutSideClick,
  config,
  trackCollectionData,
  isBTInstance,
  showProfileIcon,
  isUserFetching,
  headerProfileMenu,
  currentUser,
  isSwiftlyStyledInstance,
  isDoTheLookInstance,
  isRootPage,
  setisDropDown,
  handleVtoFetch,
  cartItemCount,
  isUserLogin,
  userCollection,
  myWishlistClick,
  isAuraChatPage,

}) => {
  const navigate = useNavigate();
  const { themeCodes } = useTheme();
  const dispatch = useDispatch();
  const headerWrapperRef = useRef(null);
  const headerContentRef = useRef(null);
  const stickyStartYRef = useRef(0);
  const [isHeaderFixed, setIsHeaderFixed] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [fixedLayout, setFixedLayout] = useState({ left: 0, width: 0 });

  const onWishlistClick = () => {
    dispatch(openWishlistModal());
  };
  // console.log('applied', userCollection );
  const router = useRouter();
  const [storeData] = useSelector((state) => [state.store.data]);
  // const cartItemCount = useMemo(() => {
  //   return cartCollection?.product_lists?.reduce((total, item) => total + (item.qty || 1), 0) || 0;
  // }, [cartCollection]);
  const syncStickyMetrics = useCallback(() => {
    if (!headerWrapperRef.current || !headerContentRef.current) {
      return;
    }

    const wrapperRect = headerWrapperRef.current.getBoundingClientRect();
    const contentRect = headerContentRef.current.getBoundingClientRect();

    stickyStartYRef.current = wrapperRect.top + window.scrollY;
    setHeaderHeight((prevHeight) =>
      prevHeight !== contentRect.height ? contentRect.height : prevHeight,
    );
    setFixedLayout((prevLayout) => {
      const nextLayout = {
        left: wrapperRect.left,
        width: wrapperRect.width,
      };

      if (
        prevLayout.left === nextLayout.left &&
        prevLayout.width === nextLayout.width
      ) {
        return prevLayout;
      }

      return nextLayout;
    });
  }, []);

  const handleStickyScroll = useCallback(() => {
    const shouldFixHeader = window.scrollY >= stickyStartYRef.current;
    setIsHeaderFixed((prevState) =>
      prevState !== shouldFixHeader ? shouldFixHeader : prevState,
    );
  }, []);

  const handleStickyResize = useCallback(() => {
    syncStickyMetrics();
    handleStickyScroll();
  }, [handleStickyScroll, syncStickyMetrics]);

  useEffect(() => {
    handleStickyResize();

    window.addEventListener("scroll", handleStickyScroll, { passive: true });
    window.addEventListener("resize", handleStickyResize);

    return () => {
      window.removeEventListener("scroll", handleStickyScroll);
      window.removeEventListener("resize", handleStickyResize);
    };
  }, [handleStickyResize, handleStickyScroll]);

  useEffect(() => {
    if (!isHeaderFixed) {
      return;
    }

    syncStickyMetrics();
  }, [isHeaderFixed, syncStickyMetrics]);

  const headerContentStyle = useMemo(() => {
    if (!isHeaderFixed) {
      return undefined;
    }

    return {
      position: "fixed",
      top: 0,
      left: `${fixedLayout.left}px`,
      width: `${fixedLayout.width}px`,
      zIndex: 60,
      background: themeCodes.header.header_bg,

      // borderRadius:'12px'
    };
  }, [
    fixedLayout.left,
    fixedLayout.width,
    isHeaderFixed,
    themeCodes.header.header_bg,
  ]);

  // console.log('zinsd',storeData.is_droppWallet_connect_enabled);
  return (
    <>
      <div
        className={styles.announcementBar}
        style={{
          background: themeCodes.header.announcement_bar_bg,
          color: themeCodes.header.announcement_bar_text,
          fontWeight: themeCodes.header.font_weight,
          display: storeData?.website_tagline === "" ? "none" : "",
        }}
      >
        {storeData?.website_tagline
          ? storeData?.website_tagline
          : "EVERY OUTFIT HAS A LOVE STORY – LET’S CREATE YOURS TOGETHER!"}
      </div>
      <div
        ref={headerWrapperRef}
        className={styles.headerWrapper}
        style={{
          background: themeCodes.header.header_bg,
          minHeight: isHeaderFixed ? `${headerHeight}px` : undefined,
          margin: isHeaderFixed ? 0 : undefined,
        }}
      >
        <div
          ref={headerContentRef}
          id="heroesVillains_desktop_header_menu"
          className={styles.headerContent}
          style={headerContentStyle}
        >
          {/* set width only to keep content center aligned */}
          <div className={styles.logoContainer}>
            <div
              className={styles.logo}
              style={{ color: themeCodes.header.textColor }}
              onClick={() => navigate(PATH_ROOT)}
            >
              {/* {isSwiftlyStyledInstance ? "SwiftlyStyled" : "DoTheLook"} */}
              {is_store_instance && current_store_name}
            </div>
          </div>
       

          {/* <div className='flex-1 flex justify-center'> */}
          {!isAuraChatPage && (
           <ChatContainer
            disabledOutSideClick={disabledOutSideClick}
            config={config}
            trackCollectionData={trackCollectionData}
            isBTInstance={isBTInstance}
          />
          )}
          {/* </div> */}

          {/* set width only to keep the aura center aligned */}
          <div className={styles.rightSection}>
            <div className={styles.collections}>
              {storeData?.is_droppWallet_connect_enabled && (
                <Tooltip title="Wallet">
                  <button>
                  <Image
                    src={walletIcon}
                    style={{ filter: "brightness(0) opacity(0.7)" }}
                    onClick={() => setisDropDown(true)}
                    alt="wallet"
                    height={24}
                    width={24}
                    className={styles.walletIcon}
                  />
                  </button>
                </Tooltip>
              )}
              <button
                className="m-0 xl:text-base font-bold  overflow-hidden overflow-ellipsis whitespace-nowrap product_name tracking-tighter-0.2"
                //  style={{ color: "#4F4F4F" ,fontWeight:600,fontSize:14,fontFamily:''}}
                onClick={() => navigate(getThemeCollectionsPagePath(THEME_ALL))}
              >
                Collections
              </button>

              {currentUser?.emailId || currentUser?.phone ? (
                <Tooltip title="My Wishlist">
                  <button>
                  <FaRegHeart
                    style={{
                      filter: themeCodes.header.fills
                        ? themeCodes.header.fills
                        : "brightness(0) opacity(0.7)",
                    }}
                    onClick={myWishlistClick}
                    className={styles.wishlistIcon}
                  />
                  </button>
                </Tooltip>
              ) : null}
              {isUserLogin && (
                <Tooltip title="My Try Ons">
                  {/* <button> */}
                  <Image
                    src={tryOnIcon}
                    alt="Try on"
                    height={24}
                    width={24}
                    className={styles.tryOnIcon}
                    onClick={() => {
                      handleVtoFetch();
                    }}
                  />
                  {/* </button> */}
                </Tooltip>
              )}
              {storeData?.pdp_settings?.is_add_to_cart_button && (
                <Tooltip title="My Cart">
                  <Link href="/cart" className={`${styles.cartLink} relative`}>
                  <button>
                    <FiShoppingCart
                      className={styles.cartIcon}
                      style={{ filter: "brightness(0) opacity(0.7)" }}
                    />
                    <span className="absolute -top-[6px] -right-[10px] bg-[var(--color-danger)] text-white rounded-full px-1.5 py-0.5 text-[11px] font-bold leading-none">
                      {cartItemCount}
                    </span>
                  </button>
                  </Link>
                </Tooltip>
              )}
              <UserProfileMenu
                isUserFetching={isUserFetching}
                headerProfileMenu={headerProfileMenu}
                currentUser={currentUser}
                isSwiftlyStyledInstance={isSwiftlyStyledInstance}
                isDoTheLookInstance={isDoTheLookInstance}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SwiftlyHeader;
