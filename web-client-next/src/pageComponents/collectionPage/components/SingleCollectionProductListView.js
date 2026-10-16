import React, { memo, useCallback, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button, Collapse, notification, Select, Upload } from "antd";
import ReactPlayer from "react-player/lazy";
import { Swiper, SwiperSlide } from "swiper/react";
import {
  MdOutlineFileUpload,
  MdOutlineKeyboardArrowLeft,
} from "react-icons/md";

import ProductCard from "../../../components/ProductCard";
import AskAuraCard from "../../../components/singleCollection/AskAuraCard";
import GuestUserPopUp from "../../Auth/GuestUserPopUp";
import ShareOptions from "../../shared/shareOptions";
import styles from "../../../components/singleCollection/collectionDetails.module.scss";
import Addmore from "../../../images/addmore.svg";
import Rightarrow from "../../../images/profilePage/Rightarrow.svg";
import share_icon from "../../../images/profilePage/Share.svg";
import {
  checkIsFavoriteCollection,
  generateRoute,
  getFinalImageUrl,
} from "../../../helper/utils";
import {
  PUBLISHED,
  WISHLIST_TITLE,
  favorites_collection_name,
  PRODUCT_SORT_OPTIONS,
  COLLECTION_COVER_IMG_SIZE_900_900,
} from "../../../constants/codes";
import {
  current_store_name,
  is_store_instance,
  super_admin,
} from "../../../constants/config";
import "swiper/css";
import "swiper/css/free-mode";
import SwiperCore, { FreeMode } from "swiper";
import { profileAPIs } from "../../../helper/serverAPIs";
import { EditOutlined } from "@ant-design/icons";
import { FiEdit } from "react-icons/fi";
import SelectedProductsActionBar, {
  SELECTED_PRODUCTS_ACTIONS,
} from "../../shared/SelectedProductsActionBar";
const { Option } = Select;
SwiperCore.use([FreeMode]);

const SingleCollectionProductListView = ({
  singleCollection,
  autoProductsData,
  isSingleCollectionSharedPage,
  userId,
  publish,
  activeTab,
  setActiveTab,
  blogCollectionPage,
  showTagsSelection,
  tagsToShow,
  swiperRef,
  isOverflowing,
  productCountMap,
  selectedTags,
  allowSelectTags,
  handleTagClick,
  filteredFirstValue,
  savedCustomFilter,
  swiperRef2,
  isOverflowing2,
  productsData,
  enableSelectProduct,
  isTagProductSelected,
  isTagProductsAllSelected,
  onSelectAllChange,
  selectedProducts,
  onAddSelectedProductsToCollection,
  handleResetSelectProduct,
  setEnableSelectProduct,
  selectedSortOption,
  handleSortOptionChange,
  showCollectionDetails,
  mobileStickyTop,
  mobileDetailsHeight,
  mobileCoverHeight,
  detailsRowRef,
  showUserImage,
  profile_image,
  user_name,
  onSeeAllClick,
  showShareCollection,
  setShowShareCollection,
  sharePageUrl,
  qrCodeGeneratorURL,
  collectionPagePath,
  textRef,
  expanded,
  setExpanded,
  showMoreEnabled,
  showcasedProductsData,
  showAuraTile,
  isPopupShow,
  handleGuestSkip,
  setIsPopupShow,
  showCoverImage,
  videoContainerRef,
  isSocialMediaVideo,
  handleMouseEnter,
  handleMouseLeave,
  isHovered,
  isMobile,
  isVisible,
  url,
  onProductClick,
  enableClickTracking,
  authUser,
  pageUser,
  handleShowcaseCollectionProducts,
  isUserLogin,
  onSelectProductClick,
  uploadProps,
  Owner,
  Adminlist,
  handleCoverImageUpload,
  canEditSystemCollection,
  onEditSystemCollection,
}) => {
  // console.log('sharePageUrl');
  // console.log('profile_image',profile_image);
  // console.log('Owner',productsData);
  
  // console.log('hellopw',Owner && (window.location.pathname === '/my-profile/' || window.location.pathname === `/influencer/${user_name}/`) );
  const handleSetSelectValue = useCallback(
    (mfrCode) => () => {
      onSelectProductClick(mfrCode);
    },
    [onSelectProductClick],
  );
// above and below issue not optimized 
  const handleStarClick = useCallback(
    (mfrCode, isStarred) => () => {
      handleShowcaseCollectionProducts([mfrCode], !isStarred);
    },
    [handleShowcaseCollectionProducts],
  );

  const isStoreAdminLoggedIn = useMemo(
    () =>
      is_store_instance &&
      authUser.user_name &&
      authUser.user_name === super_admin,
    [authUser.user_name],
  );

  const selectedProductsActions = [
    SELECTED_PRODUCTS_ACTIONS.COLLECTION,
    SELECTED_PRODUCTS_ACTIONS.WISHLIST,
    SELECTED_PRODUCTS_ACTIONS.CART,
    ...(Owner ? [SELECTED_PRODUCTS_ACTIONS.DELETE] : []),
  ];

  const handleSelectedProductsAction = ({ key }) => {
    if (!selectedProducts.length) return;

    onAddSelectedProductsToCollection(null, null, { action: key });
  };

  const renderProductsList = ({
    list,
    showAuraTileFlag,
    isSingleCollectionSharedPage,
  }) => {
    const hasCoverMedia =
      !!blogCollectionPage?.cover_image || !!blogCollectionPage?.video_url;

    const renderCollectionCard = (product) => (
      <ProductCard
        product={product}
        onProductClick={() => onProductClick(product)}
        enableClickTracking={enableClickTracking}
        productClickParam={{
          iCode: authUser.influencer_code,
          campCode: blogCollectionPage.campaign_code,
          collectionId: blogCollectionPage._id,
          collectionName: blogCollectionPage.collection_name,
          collectionICode: pageUser.influencer_code,
        }}
        collectionCards
        showStar={false}
        enableHoverShowcase={false}
        onStarClick={handleStarClick(product.mfr_code, product.starred)}
        hideAddToWishlist={
          !!product.sponsored || (is_store_instance && !isUserLogin)
        }
        hideViewSimilar={!!product.sponsored}
        enableSelect={enableSelectProduct}
        isSelected={selectedProducts.includes(product.mfr_code)}
        setSelectValue={handleSetSelectValue(product.mfr_code)}
        collection_id={blogCollectionPage._id}
        collection_name={blogCollectionPage.collection_name}
        collection_path={blogCollectionPage.path}
        collection_status={blogCollectionPage.status}
        blogCollectionPage={blogCollectionPage}
        onAddSelectedProductsToCollection={onAddSelectedProductsToCollection} //collectyion product data passing
        source='COLLECTION'
      />
    );

    if (blogCollectionPage?.collection_name && !isSingleCollectionSharedPage) {
      return (
        <div className={styles.productGrid} style={{ width: "100%" }}>
          {showCoverImage &&
            (blogCollectionPage?.cover_image ||
              blogCollectionPage?.video_url) && (
              <div
                ref={videoContainerRef}
                className={`${styles.mobileCoverStickyBlock} ${
                  isSocialMediaVideo(blogCollectionPage.video_url)
                    ? styles.coverMediaHidden
                    : styles.coverMediaContainer
                } ${showCollectionDetails ? styles.cursorPointer : ""}`}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onClick={() => showCollectionDetails && onSeeAllClick()}
              >
                {blogCollectionPage?.video_url &&
                (isHovered || (isMobile && isVisible)) &&
                !isSocialMediaVideo(blogCollectionPage.video_url) ? (
                  <>
                    <ReactPlayer
                      className={
                        isSocialMediaVideo(blogCollectionPage.video_url)
                          ? ""
                          : `${styles.videoPlayerAbsolute} Video_player`
                      }
                      url={blogCollectionPage.video_url}
                      playing={(isMobile && isVisible) || isHovered}
                      muted={true}
                      loop={true}
                      width="100%"
                      height="100%"
                      playsinline
                      controls={false}
                    />
                    <div className={styles.videoOverlay} />
                  </>
                ) : blogCollectionPage?.cover_image ? (
                  <div className="relative h-full">
                  <img
                    className={`${styles.coverImage} ${
                      showCollectionDetails ? styles.cursorPointer : ""
                    }`}
                    src={getFinalImageUrl(blogCollectionPage.cover_image)}
                    alt="Cover"
                  />
                        {  window.location?.pathname === '/my-profile/'   &&  (
                  <p
                    className="z-40 absolute top-4 right-4   "
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Upload
                      {...uploadProps}
                      name="cover_image"
                      showUploadList={false}
                      onChange={handleCoverImageUpload}
                    >
                      {/* <
                                                
                                                className={styles["product-cart-icon-smalls"]}
                                              /> */}
                      <p className="bg-white rounded-full p-1">
                        <FiEdit
                          style={{
                            color: "#9a9b9b",
                            // backgroundColor: "#f8f6f4",
                          }}
                          title="Edit Collection"
                          className={styles.editIconContainerowner}
                        />
                      </p>
                    </Upload>
                  </p>
                )}
                        {/* {(Owner || Adminlist) &&
                      <>
                        <p className="z-40 absolute top-3 right-4 ">
                          <Upload
                            {...uploadProps}
                            name='cover_image'
                            showUploadList={false}
                            onChange={handleCoverImageUpload}
                          >
                            <EditOutlined  
                            title="Edit Collection"
                            className={styles.editIconContainerowner}
                             
                          />
                          </Upload>
                        </p>

                      </>
                    }  */}
                  </div>

                ) : (
                  blogCollectionPage?.video_url &&
                  !isSocialMediaVideo(blogCollectionPage.video_url) && (
                    <>
                      <ReactPlayer
                        className={`${styles.videoPlayerAbsolute} Video_player`}
                        url={blogCollectionPage.video_url}
                        playing={false}
                        muted={true}
                        loop={true}
                        width="100%"
                        height="100%"
                        playsinline
                        controls={false}
                      />
                      <div className={styles.videoOverlay} />
                    </>
                  )
                )}
                {isStoreAdminLoggedIn && (
                  <p
                    className="z-40 absolute top-4 right-4   "
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Upload
                      {...uploadProps}
                      name="cover_image"
                      showUploadList={false}
                      onChange={handleCoverImageUpload}
                    >
                      {/* <
                                                
                                                className={styles["product-cart-icon-smalls"]}
                                              /> */}
                      <p className="bg-white rounded-full p-1">
                        <FiEdit
                          style={{
                            color: "#9a9b9b",
                            // backgroundColor: "#f8f6f4",
                          }}
                          title="Edit Collection"
                          className={styles.editIconContainerowner}
                        />
                      </p>
                    </Upload>
                  </p>
                )}
              </div>
            )}
          <div
            className={`w-full ${blogCollectionPage?.cover_image ? "" : "m-auto"} ${url ? "" : styles.cardsContainer} ${!hasCoverMedia ? styles.productItems1ClipContainer : ""}`}
          >
            {!isSingleCollectionSharedPage && productsData.length ? (
              <div
                className={`${styles.seeFullRow} ${blogCollectionPage?.cover_image ? styles.mobileViewCollectionStickyRow : styles.mobileViewCollectionStickyNocover}`}
              >
                <div className="flex items-center gap-2" />

                <div className={`${styles.viewCollectionContainer}`}>
                  <Button
                    type="primary"
                    className={styles.seeFullBtn}
                    onClick={onSeeAllClick}
                  >
                    View Collection
                  </Button>
                  <Image
                    src={Rightarrow}
                    alt="View more"
                    height={16}
                    width={16}
                  />
                </div>
              </div>
            ) : null}
            {hasCoverMedia ? (
              <div className={styles.productItems}>
                {list.length > 0 &&
                  list.map((product) => (
                    <div key={product.mfr_code}>
                      {renderCollectionCard(product)}
                    </div>
                  ))}
              </div>
            ) : (
              <Swiper
                slidesPerView="auto"
                spaceBetween={10}
                freeMode={true}
                watchOverflow={true}
                className={styles.productItems1Swiper}
              >
                {list.length > 0 &&
                  list.map((product) => (
                    <SwiperSlide
                      key={product.mfr_code}
                      className={styles.productItems1Slide}
                    >
                      {renderCollectionCard(product)}
                    </SwiperSlide>
                  ))}
              </Swiper>
            )}
          </div>

          {showAuraTileFlag && list.length > 0 && (
            <div>
              <AskAuraCard />
            </div>
          )}
        </div>
      );
    } else if (
      blogCollectionPage?.collection_name &&
      (userId || publish) &&
      isSingleCollectionSharedPage
    ) {
      return (
        <div className={styles.productGrid2}>
          {showCoverImage &&
            (blogCollectionPage?.cover_image ||
              blogCollectionPage?.video_url) && (
              <div
                ref={videoContainerRef}
                className={`${
                  isSocialMediaVideo(blogCollectionPage.video_url)
                    ? styles.coverMediaHidden
                    : styles.coverMediaContainer
                } ${showCollectionDetails ? styles.cursorPointer : ""}`}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onClick={() => showCollectionDetails && onSeeAllClick()}
              >
                {blogCollectionPage?.video_url &&
                (isHovered || (isMobile && isVisible)) &&
                !isSocialMediaVideo(blogCollectionPage.video_url) ? (
                  <>
                    <ReactPlayer
                      className={
                        isSocialMediaVideo(blogCollectionPage.video_url)
                          ? ""
                          : `${styles.videoPlayerAbsolute} Video_player`
                      }
                      url={blogCollectionPage.video_url}
                      playing={(isMobile && isVisible) || isHovered}
                      muted={true}
                      loop={true}
                      width="100%"
                      height="100%"
                      playsinline
                      controls={false}
                    />
                    <div className={styles.videoOverlay} />
                  </>
                ) : blogCollectionPage?.cover_image ? (
                  <div className="relative">
                    <img
                      className={`${styles.coverImage} ${
                        showCollectionDetails ? styles.cursorPointer : ""
                      }`}
                      src={getFinalImageUrl(blogCollectionPage.cover_image)}
                      alt="Cover"
                    />
                    {/* {Owner || Adminlist &&
                      <>
                        <p className="z-40 absolute top-3 right-4 ">



                          <Upload
                            {...uploadProps}
                            name='cover_image'
                            showUploadList={false}
                            onChange={handleCoverImageUpload}
                          >
                            <EditOutlined  
                            title="Edit Collection"
                            className={styles.editIconContainerowner}
                             
                          />
                          </Upload>
                        </p>

                      </>
                    } */}
                   
                  </div>
                ) : (
                  blogCollectionPage?.video_url &&
                  !isSocialMediaVideo(blogCollectionPage.video_url) && (
                    <>
                      <ReactPlayer
                        className={`${styles.videoPlayerAbsolute} Video_player`}
                        url={blogCollectionPage.video_url}
                        playing={false}
                        muted={true}
                        loop={true}
                        width="100%"
                        height="100%"
                        playsinline
                        controls={false}
                      />
                      <div className={styles.videoOverlay} />
                    </>
                  )
                )}
              </div>
            )}

          {list.length > 0 &&
            list?.map((product) => (
              <div key={product.mfr_code}>
                <ProductCard
                  product={product}
                  onProductClick={() => onProductClick(product)}
                  enableClickTracking={enableClickTracking}
                  productClickParam={{
                    iCode: authUser.influencer_code,
                    campCode: blogCollectionPage.campaign_code,
                    collectionId: blogCollectionPage._id,
                    collectionName: blogCollectionPage.collection_name,
                    collectionICode: pageUser.influencer_code,
                  }}
                  showStar={false}
                  enableHoverShowcase={false}
                  onStarClick={handleStarClick(
                    product.mfr_code,
                    product.starred,
                  )}
                  hideAddToWishlist={
                    !!product.sponsored || (is_store_instance && !isUserLogin)
                  }
                  hideViewSimilar={!!product.sponsored}
                  enableSelect={enableSelectProduct}
                  isSelected={selectedProducts.includes(product.mfr_code)}
                  setSelectValue={handleSetSelectValue(product.mfr_code)}
                  collection_id={blogCollectionPage._id}
                  collection_name={blogCollectionPage.collection_name}
                  collection_path={blogCollectionPage.path}
                  collection_status={blogCollectionPage.status}
                  blogCollectionPage={blogCollectionPage}
                  onAddSelectedProductsToCollection={
                    onAddSelectedProductsToCollection
                  }
                  isSingleCollectionSharedPage={isSingleCollectionSharedPage}
                  source='COLLECTION'
                />
              </div>
            ))}
          {showAuraTileFlag && list.length > 0 && (
            <div>
              <AskAuraCard />
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className={styles.pageWrapper}>
      {singleCollection?.faqs?.length > 0 &&
        autoProductsData.length > 0 &&
        isSingleCollectionSharedPage &&
        (userId || (publish && isSingleCollectionSharedPage)) && (
          <div className={styles.tabsRow}>
            <p
              className={`${styles.tabButton} ${activeTab === "products" ? styles.tabButtonActive : styles.tabButtonInactive}`}
              onClick={() => setActiveTab("products")}
            >
              PRODUCTS
            </p>

            <p
              className={`${styles.tabButton} ${
                activeTab === "faq"
                  ? styles.tabButtonActive
                  : styles.tabButtonInactive
              }`}
              onClick={() => setActiveTab("faq")}
            >
              FAQS{" "}
            </p>
          </div>
        )}
        {canEditSystemCollection && (
          <EditOutlined
            title="Edit Collection"
            className={styles.editIconContainer}
            onClick={onEditSystemCollection}
          />
        )}
      {((activeTab === "products" || !isSingleCollectionSharedPage) &&
        blogCollectionPage.collection_name && (
          <>
            <div className="colloction_details_cards_div">
              <div className={styles.lgContainer}>
                {isSingleCollectionSharedPage &&
                  (userId || (publish && isSingleCollectionSharedPage)) &&  (
                    <div className={styles.tagsOuterContainer}>
                      {showTagsSelection &&
                      tagsToShow?.length &&
                      autoProductsData.length ? (
                        <div
                          className={`${styles.tagsPadding} colloction_details_tag`}
                        >
                          <div
                            className={`${styles.tagsFlexRow} tag_responsive_div`}
                          >
                            <div
                              className={`${styles.tagsScrollWrapper} ${styles.colloectionDetailScroll}`}
                            >
                              <Swiper
                                slidesPerView="auto"
                                spaceBetween={10}
                                freeMode={true}
                                onSwiper={(swiper) =>
                                  (swiperRef.current = swiper)
                                }
                                className={`${styles.tagsScrollWrapper}  colloectionDetailScroll ${styles.colloectionDetailScroll}`}
                              >
                                {tagsToShow.map((tag) => {
                                  const isDisabled = productCountMap[tag] === 0;

                                  return (
                                    <SwiperSlide
                                      key={tag}
                                      style={{ width: "auto" }}
                                    >
                                      <div
                                        className={`${styles.tagChip} ${
                                          selectedTags.includes(tag) ||
                                          (selectedTags.length === 0 &&
                                            tag === "All")
                                            ? styles.tagChipSelected
                                            : styles.tagChipDefault
                                        } ${
                                          isDisabled
                                            ? styles.tagChipDisabled
                                            : ""
                                        }`}
                                      >
                                        <h3
                                          className={`${styles.tagText} ${
                                            allowSelectTags && !isDisabled
                                              ? styles.cursorPointer
                                              : ""
                                          }`}
                                          onClick={
                                            allowSelectTags && !isDisabled
                                              ? () => handleTagClick(tag)
                                              : undefined
                                          }
                                        >
                                          {tag}
                                        </h3>
                                      </div>
                                    </SwiperSlide>
                                  );
                                })}
                              </Swiper>
                            </div>
                            {isOverflowing && (
                              <>
                                <div
                                  className={
                                    "absolute right-0  lg:h-10 h-8 lg:w-10 -top-1 md:top-1 lg:top-2 hover:shadow-xl  bg-gray-50  w-8 rounded-full flex justify-center items-center"
                                  }
                                  style={{
                                    cursor: "pointer",
                                    zIndex: 10,
                                    position: "absolute",
                                  }}
                                  onClick={() => {
                                    if (swiperRef.current) {
                                      swiperRef.current.slideNext();
                                    }
                                  }}
                                >
                                  <MdOutlineKeyboardArrowLeft
                                    alt="Scroll Right"
                                    width="72"
                                    height="72"
                                    className="transform rotate-180 text-xl "
                                  />
                                </div>
                                <div
                                  className={
                                    "absolute  lg:h-10 h-8 -top-1 md:top-1 lg:top-2 lg:w-10 bg-gray-50 ml-3 lg:ml-0  w-8 rounded-full flex hover:shadow-xl lg:-left-6 -left-5 justify-center items-center"
                                  }
                                  style={{
                                    cursor: "pointer",
                                    zIndex: 10,
                                    position: "absolute",
                                  }}
                                  onClick={() => {
                                    if (swiperRef.current) {
                                      swiperRef.current.slidePrev();
                                    }
                                  }}
                                >
                                  <MdOutlineKeyboardArrowLeft
                                    alt="Scroll Left"
                                    width="72"
                                    height="72"
                                  />
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      ) : null}

                      {showTagsSelection &&
                        Object.keys(filteredFirstValue).length > 0 && (
                          <div
                            className={`${styles.tagsPaddingSmall} colloction_details_tag`}
                          >
                            <div
                              className={`${styles.tagsFlexRow} tag_responsive_div`}
                            >
                              <div
                                className={`${styles.keywordScrollWrapper} `}
                              >
                                <Swiper
                                  slidesPerView="auto"
                                  spaceBetween={10}
                                  freeMode={true}
                                  onSwiper={(swiper) =>
                                    (swiperRef2.current = swiper)
                                  }
                                  className="colloectionDetailScroll"
                                >
                                  {Object.entries(filteredFirstValue).map(
                                    ([key, values]) => {
                                      if (key === "custom_filter") {
                                        return savedCustomFilter.map(
                                          (tag, index) => (
                                            <SwiperSlide
                                              key={`${key}-${index}`}
                                              style={{ width: "auto" }}
                                            >
                                              <div
                                                className={styles.keywordChip}
                                              >
                                                <span
                                                  className={
                                                    styles.keywordChipText
                                                  }
                                                >
                                                  #{tag.trim()}
                                                </span>
                                              </div>
                                            </SwiperSlide>
                                          ),
                                        );
                                      }

                                      return (
                                        <SwiperSlide
                                          key={key}
                                          style={{ width: "auto" }}
                                        >
                                          <div className={styles.keywordChip}>
                                            <h3
                                              className={styles.keywordTagText}
                                            >
                                              <span>{`${key} :`}</span>{" "}
                                              {Array.isArray(values)
                                                ? values.join(", ")
                                                : String(values)}
                                            </h3>
                                          </div>
                                        </SwiperSlide>
                                      );
                                    },
                                  )}
                                </Swiper>
                              </div>

                              {isOverflowing2 && (
                                <div
                                  className={styles.addmore_image}
                                  style={{
                                    cursor: "pointer",
                                    zIndex: 10,
                                    position: "absolute",
                                  }}
                                  onClick={() => {
                                    if (swiperRef2.current) {
                                      swiperRef2.current.slidePrev();
                                    }
                                  }}
                                >
                                  <Image
                                    src={Addmore}
                                    alt="Scroll Right"
                                    width="38"
                                    height="38"
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                      {isSingleCollectionSharedPage && productsData.length ? (
                        <div
                          className={`${styles.selectBarRow} ${
                            enableSelectProduct
                              ? styles.selectBarRowWithCol
                              : styles.selectBarRowDefault
                          }`}
                        >
                          <div className={styles.selectBarLeft}>
                            {enableSelectProduct ? (
                              <SelectedProductsActionBar
                                actions={selectedProductsActions}
                                selectedCount={selectedProducts.length}
                                isSelectMode={enableSelectProduct}
                                isIndeterminate={
                                  isTagProductSelected &&
                                  !isTagProductsAllSelected
                                }
                                isAllSelected={isTagProductsAllSelected}
                                onSelectAllChange={onSelectAllChange}
                                onCancel={handleResetSelectProduct}
                                onAction={handleSelectedProductsAction}
                                classNames={{
                                  wrapper: styles.selectCheckRow,
                                  checkboxWrapper: styles.selectCheckBorder,
                                  checkbox: `${styles.checkboxText} checkbox_singleCollection`,
                                  dropdownActive: styles.addToTextActive,
                                  dropdownDisabled: styles.addToTextDisabled,
                                  dropdownButton: `${styles.addToText} ${styles.addToMenuButton}`,
                                  dropdownIcon: styles.addToMenuIcon,
                                  cancelText: styles.cancelText,
                                }}
                              />
                            ) : (
                              <SelectedProductsActionBar
                                isSelectMode={enableSelectProduct}
                                onStartSelect={() => setEnableSelectProduct(true)}
                                labels={{
                                  selectTitle:
                                    "Click and select multiple products to add to collection",
                                }}
                                classNames={{
                                  selectButton: styles.addToCollectionBtn,
                                  selectButtonRole: "link",
                                }}
                              />
                            )}
                          </div>

                          <div className={`${styles.sortRow} sort_dropdown`}>
                            <div
                              className={`${styles.sortContainer} collection_page_sort_product_list`}
                            >
                              <label className={styles.sortLabel}>
                                Sort by :
                              </label>
                              <Select
                                name="sortBy"
                                className={styles.sortSelectFull}
                                size="small"
                                value={selectedSortOption?.id}
                                onChange={handleSortOptionChange}
                              >
                                {PRODUCT_SORT_OPTIONS?.map((item) => (
                                  <Option
                                    className={styles.sortOptionText}
                                    key={item.id}
                                    value={item.id}
                                  >
                                    {item.id}
                                  </Option>
                                ))}
                              </Select>
                            </div>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  )}
              </div>
              <div
                className={`${styles.collectionWrapper} single-collection-class`}
                style={
                  showCollectionDetails && !isSingleCollectionSharedPage
                    ? {
                        "--single-collection-sticky-top": `${mobileStickyTop}px`,
                        "--single-collection-details-height": `${mobileDetailsHeight}px`,
                        "--single-collection-cover-height": `${mobileCoverHeight}px`,
                      }
                    : undefined
                }
              >
                {showCollectionDetails && (
                  <div
                    ref={detailsRowRef}
                    className={`${styles.detailsRow} ${styles.mobileDetailsStickyBlock}`}
                  >
                    {showUserImage &&
                      (profile_image || blogCollectionPage.profile_image) &&
                      (user_name || blogCollectionPage.user_name) && (
                        <>
                          {user_name === super_admin ? (
                            <img
                              src={
                                getFinalImageUrl(profile_image) ||
                                getFinalImageUrl(
                                  blogCollectionPage.profile_image,
                                )
                              }
                              alt="User profile picture"
                              className={styles.userAvatar}
                            />
                          ) : (
                            (() => {
                              const route = generateRoute(
                                blogCollectionPage.user_id,
                                user_name || blogCollectionPage.user_name,
                              );
                              return route ? (
                                <Link
                                  href={route}
                                  className={styles.userAvatarLink}
                                >
                                  <img
                                    src={
                                      getFinalImageUrl(profile_image) ||
                                      getFinalImageUrl(
                                        blogCollectionPage.profile_image,
                                      )
                                    }
                                    alt="User profile picture"
                                    className={styles.userAvatarFull}
                                  />
                                </Link>
                              ) : (
                                <div className={styles.userAvatarLink}>
                                  <img
                                    src={
                                      getFinalImageUrl(profile_image) ||
                                      getFinalImageUrl(
                                        blogCollectionPage.profile_image,
                                      )
                                    }
                                    alt="User profile picture"
                                    className={styles.userAvatarFull}
                                  />
                                </div>
                              );
                            })()
                          )}
                        </>
                      )}

                    <div className={styles.contentColumn}>
                      <div className={styles.titleRow}>
                        <h1
                          className={`${styles.collectionTitle} capital-first-letter`}
                          style={{ overflowWrap: "anywhere" }}
                          onClick={onSeeAllClick}
                        >
                          {checkIsFavoriteCollection(blogCollectionPage)
                            ? favorites_collection_name
                            : blogCollectionPage.collection_name}
                        </h1>

                        <div className={styles.shareIconWrapper}>
                          {showShareCollection && (
                            <ShareOptions
                              url={sharePageUrl}
                              onClose={setShowShareCollection}
                              collection={blogCollectionPage}
                              isOpen={showShareCollection}
                              qrCodeGeneratorURL={qrCodeGeneratorURL}
                              collectionPagePath={collectionPagePath}
                            />
                          )}
                          <div
                            className={`${styles.sharecontainer}`}
                            onClick={() =>
                              blogCollectionPage.status === PUBLISHED &&
                              setShowShareCollection(!showShareCollection)
                            }
                          >
                            <img
                              className={`${styles.shareIcon} ${
                                showShareCollection
                                  ? styles.shareIconEventsNone
                                  : ""
                              } ${
                                blogCollectionPage.status === PUBLISHED
                                  ? styles.shareIconEnabled
                                  : styles.shareIconDisabled
                              }`}
                              src={share_icon}
                              alt="Share collection"
                              title={
                                blogCollectionPage.status !== PUBLISHED
                                  ? "Please publish collection to share"
                                  : ""
                              }
                            />
                            <p className="hidden md:block text-sm lg:text-base">
                              Share
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className={styles.descriptionWrapper}>
                        {blogCollectionPage.description ? (
                          <>
                            <>
                              <div className={styles.descriptionWrapper}>
                                <p
                                  ref={textRef}
                                  className={` ${styles.descriptionText} 
    ${expanded ? "" : productsData?.length === 0 ? "ellipsis_3" : "ellipsis_2"}
  `}
                                >
                                  {blogCollectionPage?.description}
                                </p>
                                {!expanded && showMoreEnabled && (
                                  <span
                                    onClick={() => setExpanded(true)}
                                    className={styles.readMoreLink}
                                  >
                                    Read more
                                  </span>
                                )}

                                {expanded && showMoreEnabled && (
                                  <span
                                    onClick={() => setExpanded(false)}
                                    className={styles.readLessLink}
                                  >
                                    Read less
                                  </span>
                                )}
                              </div>
                            </>
                          </>
                        ) : null}
                      </div>
                    </div>
                  </div>
                )}

                {isSingleCollectionSharedPage &&
                !!showcasedProductsData.length ? (
                  <div>
                    {!!showcasedProductsData.length ? (
                      <div className={styles.toppicksContainer}>
                        <p className={styles.topPicksTitle}>Top Picks</p>
                        <div className={styles.flexColLgRow}>
                          {renderProductsList({
                            list: showcasedProductsData,
                            showAuraTileFlag: autoProductsData.length
                              ? false
                              : showAuraTile,
                            isSingleCollectionSharedPage,
                          })}
                        </div>
                      </div>
                    ) : null}

                    {!!autoProductsData.length ? (
                      <div className={styles.moreFromSection}>
                        <p className={styles.moreFromTitle}>
                          More from this collection
                        </p>
                        <div className={styles.flexColLgRow}>
                          {renderProductsList({
                            list: autoProductsData,
                            showAuraTileFlag: showAuraTile,
                            isSingleCollectionSharedPage,
                          })}
                        </div>
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <div className={styles.flexColLgRow}>
                    {renderProductsList({
                      list: productsData,
                      showAuraTileFlag: showAuraTile,
                      isSingleCollectionSharedPage,
                    })}
                  </div>
                )}
              </div>
            </div>
            <GuestUserPopUp
              isOpen={isPopupShow}
              setIsOpen={setIsPopupShow}
              storeName={current_store_name}
              isUserLogin={!isUserLogin ? true : false}
              onSuccess={({ userId }) => {
                onAddSelectedProductsToCollection(null, null, {
                  context: { userId },
                });
              }}
              onSkip={handleGuestSkip}
            />
          </>
        )) ||
        null}

      {activeTab === "faq" &&
        singleCollection?.faqs?.length > 0 &&
        isSingleCollectionSharedPage && (
          <div className={styles.faqSection}>
            <Collapse
              accordion
              items={singleCollection?.faqs?.map((faq, index) => ({
                key: index + 1,
                label: (
                  <span className={styles.faqLabel}>
                    {index + 1}. {faq.question}
                  </span>
                ),
                children: <p className={styles.faqAnswer}>{faq.answer}</p>,
              }))}
            />
          </div>
        )}
    </div>
  );
};

export default memo(SingleCollectionProductListView);
