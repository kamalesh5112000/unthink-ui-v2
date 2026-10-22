import React, {
  useMemo,
  useState,
  useRef,
  useEffect,
  useCallback,
} from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useNavigate } from "../../helper/useNavigate";
import { useDispatch, useSelector } from "react-redux";
import { EditOutlined } from "@ant-design/icons";
import { Image, notification, Spin, Tooltip, Upload } from "antd";

import CustomBannerModal from "../../pageComponents/customBannerModal/CustomBannerModal";
import ShareOptions from "../../pageComponents/shared/shareOptions";
import CustomTooltip from "../CustomTooltip/Tooltip";
import { updateWishlist } from "../../pageComponents/wishlistActions/updateWishlist/redux/actions";
import sharedPageTracker from "../../helper/webTracker/sharedPageTracker";
import {
  adminUserId,
  is_store_instance,
  super_admin,
  current_store_name,
} from "../../constants/config";
import {
  DONE,
  favorites_collection_name,
  PATH_ROOT,
  PUBLISHED,
  STORE_DISPLAY_NAME,
  STORE_USER_NAME_BUDGETTRAVEL,
  COLLECTION_GENERATED_BY_IMAGE_BASED,
  COLLECTION_COVER_IMG_SIZE_900_900,
} from "../../constants/codes";

import share_icon from "../../images/profilePage/share_icon.svg";
import defaultAvatar from "../../images/avatar.svg";
import unthink_black_log from "../../images/unthink_black_log.svg";
import {
  checkIsFavoriteCollection,
  generateRoute,
  getCollectionDefaultDescription,
  getEditCollectionPagePath,
  getFinalImageUrl,
  collectionQRCodeGenerator,
  getBlogCollectionPagePath,
  capitalFirstLetter,
  AdminCheck,
} from "../../helper/utils";

import styles from "./collectionDetails.module.scss";
import cssStyles from "./CollectionDetails.module.css";
import SingleCollectionProductList from "../../pageComponents/collectionPage/SingleCollectionProductList";
import { toggleShowMore } from "../../pageComponents/collectionPage/redux/actions";
import CarousalContainer from "../carousel/CarouselContainer";
import CropAndResizeImageModal from "../../pageComponents/cropAndResizeImageModal/CropAndResizeImageModal";
import { profileAPIs } from "../../helper/serverAPIs";
import { MdOutlineFileUpload } from "react-icons/md";
import { FiEdit } from "react-icons/fi";

const { Dragger } = Upload;
const ReactPlayer = dynamic(() => import("react-player/lazy"), { ssr: false });

const CollectionDetails = ({
  sharePageUrl,
  pageUserUserId,
  // collection,
  updateWishlistInProgress = false,
  collectionOwner,
  pageUserInfluencerCode,
  enableBannerClickTracking = false,
  isPageOwner,
  isCollectionPage = true,
}) => {
  const navigate = useNavigate();
  const [showShareCollection, setShowShareCollection] = useState(false);
  const [bannerModalOpen, setBannerModalOpen] = useState(false);
  const [publishButtonTooltipOpen, setPublishButtonTooltipOpen] =
    useState(false);

  // flag to enable show more if the description is taking more than 4 lines
  const [showMoreEnabled, setShowMoreEnabled] = useState(false);
  // const [isShowMoreActive, setIsShowMoreActive] = useState(false); // state to handle show more

  // send isShowMoreActive to SingleCollectionProductList.js page for styling purposes
  const [onlySendingPurpose, setOnlySendingPurpose] = useState(false);

  const [
    authUser,
    isGuestUser,
    authUserCollections,
    isShowMoreActive,
    collection,
    admin_list,
  ] = useSelector((state) => [
    state.auth.user.data,
    state.auth.user.userNotFound,
    state.auth.user.collections.data,
    state.showMoreReducer.isShowMoreActive,
    state.auth.user.singleCollections.data,
    state.store.data.admin_list,
  ]);
  const [cropAndResizeImageData, setCropAndResizeImageData] = useState({
    isOpen: false,
    selectedImage: "",
  });
  const Owner = authUser?.user_name === collection?.user_name;
  const Adminlist = authUser?.user_name ===  super_admin;
// console.log('helloWorld',Owner || Adminlist);

  // console.log("is_store_instance",is_store_instance);
  // console.log(Owner || Adminlist);

  // State for overlay positioning
  const [containerDimensions, setContainerDimensions] = useState({
    width: 0,
    height: 0,
  });
  const imageContainerRef = useRef(null);

  // Get actual container dimensions
  useEffect(() => {
    const updateDimensions = () => {
      if (imageContainerRef.current) {
        const { width, height } =
          imageContainerRef.current.getBoundingClientRect();
        setContainerDimensions({ width, height });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);

    return () => {
      window.removeEventListener("resize", updateDimensions);
    };
  }, [collection.cover_image]);

  const isSuperAdminLoggedIn = AdminCheck(
    authUser,
    current_store_name,
    adminUserId,
    admin_list,
  );
 

  const showFeatureOnBTOnNonStore = useMemo(
    () => isSuperAdminLoggedIn && !is_store_instance,
    [isSuperAdminLoggedIn],
  );

  const isStoreAdminLoggedIn = useMemo(
    () =>
      is_store_instance &&
      authUser.user_name &&
      authUser.user_name === super_admin,
    [authUser.user_name],
  );
 
  

  const collectionPagePath = useMemo(
    () =>
      getBlogCollectionPagePath(
        collectionOwner.user_name,
        collection.path,
        collection._id,
        collectionOwner.user_id || collection.user_id,
        collection.status,
        collection.hosted_stores,
        collection?.collection_theme,
      ),
    [
      collectionOwner.user_name,
      collection.path,
      collection._id,
      collectionOwner.user_id,
      collection.user_id,
      collection.status,
      collection.hosted_stores,
      collection?.collection_theme,
    ],
  );

  const qrCodeGeneratorURL = useMemo(
    () => collectionQRCodeGenerator(collectionPagePath),
    [collectionPagePath],
  );

  const dispatch = useDispatch();

  const descriptionRef = useRef(null);

  const user_name = useMemo(
    () =>
      collection.user_name ||
      (collectionOwner.user_id === collection.user_id
        ? collectionOwner.user_name
        : ""),
    [
      collection.user_name,
      collectionOwner.user_id,
      collection.user_id,
      collectionOwner.user_name,
    ],
  );

  const showFeatureOnStore = useMemo(
    () =>
        isStoreAdminLoggedIn &&
      is_store_instance &&
      user_name !== super_admin,
    [isSuperAdminLoggedIn, user_name],
  );

  const profile_image = useMemo(
    () =>
      collection.profile_image ||
      (collectionOwner.user_id === collection.user_id
        ? collectionOwner.profile_image
        : ""),
    [
      collection.profile_image,
      collectionOwner.user_id,
      collection.user_id,
      collectionOwner.profile_image,
    ],
  );

  // enable how more feature flag if description is taking more lines
  useEffect(() => {
    const checkDescriptionOverflow = () => {
      if (!isShowMoreActive) {
        const el = descriptionRef.current;
        if (el) {
          setShowMoreEnabled(el.scrollHeight > el.clientHeight);
        }
      }
    };

    const timeoutId = setTimeout(checkDescriptionOverflow, 100);
    window.addEventListener("resize", checkDescriptionOverflow);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", checkDescriptionOverflow);
    };
  }, [collection?.description, isShowMoreActive]);

  useEffect(() => {
    if (
      !localStorage.getItem(`level1NFTClaimed${authUser.user_id}`) &&
      !localStorage.getItem("publishbtnintro") &&
      isPageOwner &&
      collection.status === DONE
    ) {
      setPublishButtonTooltipOpen(true);
      localStorage.setItem("publishbtnintro", "true");
    }
  }, [isPageOwner, collection.status, authUser.user_id]);

  const collection_name = useMemo(
    () =>
      checkIsFavoriteCollection(collection)
        ? favorites_collection_name
        : collection.collection_name,
    [collection.collection_name],
  );

  const handlePublishCollection = useCallback(() => {
    const payload = {
      _id: collection._id,
      status: collection.status === DONE ? PUBLISHED : DONE,
      user_name: collection.user_name,
      cover_image: collection.cover_image,
      profile_image: collection.profile_image,
      // fetchUserCollections: true, // add this if latest collection detains form API is required after success update status
      updateStatusInUserCollections: true, // set current auth user's collection status in redux state // not fetching collection details from API
      checkForNFTReward: true, // flag to check for NFT, if user has published the first collection
    };

    dispatch(updateWishlist(payload));
  }, [collection._id, collection.status]);

  const handleFeatureCollectionOnStore = useCallback(
    (storeName) => {
      let hosted_stores = [...(collection.hosted_stores || [])];

      if (hosted_stores.includes(storeName)) {
        hosted_stores = hosted_stores.filter((h) => h !== storeName);
      } else {
        hosted_stores.push(storeName);
      }

      const payload = {
        _id: collection._id,
        attributesData: {
          hosted_stores,
        },
        fetchUserCollection: true, // add this if latest collection detains form API is required after success update
      };

      dispatch(updateWishlist(payload));
    },
    [collection._id, collection.hosted_stores],
  );

  const handleCollectionBannerClick = useCallback(
    ({ image, sponsored, redirectionUrl }) => {
      if (enableBannerClickTracking) {
        sharedPageTracker.onCollectionBannerClick({
          image,
          redirectionUrl,
          sponsored,
          iCode: authUser.influencer_code,
          campCode: collection.campaign_code,
          collectionId: collection._id,
          collectionName: collection.collection_name,
          collectionICode: pageUserInfluencerCode,
        });
      }
    },
    [
      enableBannerClickTracking,
      authUser.influencer_code,
      collection.campaign_code,
      collection._id,
      collection.collection_name,
      pageUserInfluencerCode,
    ],
  );

  const storeDisplayName =
    STORE_DISPLAY_NAME[current_store_name] || current_store_name;

  // image hover videos show functions
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const videoContainerRef = useRef(null);

  // Check if the user is on a mobile device
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 640);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Check if the video container is visible in the viewport
  useEffect(() => {
    const handleScroll = () => {
      if (videoContainerRef.current) {
        const rect = videoContainerRef.current.getBoundingClientRect();
        setIsVisible(rect.top >= 0 && rect.bottom <= window.innerHeight);
      }
    };

    handleScroll(); // Check on mount
    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll); // Cleanup
  }, []);

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);

  const isSocialMediaVideo = (url) => {
    return (
      typeof url === "string" &&
      (url.includes("facebook.com") || url.includes("instagram.com"))
    );
  };

  useEffect(() => {
    if (isCollectionPage) {
      dispatch(toggleShowMore(false));
    }
  }, []);

  // Fixed renderOverlay function for CollectionDetails
  const renderOverlay = (
    cover_image_coordinates,
    containerWidth,
    containerHeight,
  ) => {
    if (!cover_image_coordinates || !containerWidth || !containerHeight)
      return null;

    // Use the actual original image dimensions from your data
    const originalWidth = 1024; // From your console logs
    const originalHeight = 1027; // From your console logs

    return cover_image_coordinates.map((item, index) => {
      if (!item.point || item.point.length < 2) return null;

      // Get the original coordinates
      const originalX = item.point[0];
      const originalY = item.point[1];

      // Calculate scaling factors
      const scaleX = containerWidth / originalWidth;
      const scaleY = containerHeight / originalHeight;

      // Use the smaller scale to maintain aspect ratio (object-cover behavior)
      const scale = Math.min(scaleX, scaleY);

      // Calculate scaled dimensions
      const scaledWidth = originalWidth * scale;
      const scaledHeight = originalHeight * scale;

      // Calculate offsets for centering
      const offsetX = (containerWidth - scaledWidth) / 2;
      const offsetY = (containerHeight - scaledHeight) / 2;

      // Apply scaling and centering
      const adjustedX = originalX * scale + offsetX;
      const adjustedY = originalY * scale + offsetY;

      // Check if the point is within the visible area
      if (
        adjustedX < 0 ||
        adjustedX > containerWidth ||
        adjustedY < 0 ||
        adjustedY > containerHeight
      ) {
        return null;
      }

      return (
        <Tooltip
          key={index}
          title={item.attributes?.label || "Product"}
          color="blue"
        >
          <div
            className={cssStyles.overlayPoint}
            style={{
              left: `${adjustedX}px`,
              top: `${adjustedY}px`,
              transform: "translate(-50%, -50%)",
              boxShadow: "0 0 12px rgba(59, 130, 246, 0.9)",
              zIndex: 20,
            }}
          />
        </Tooltip>
      );
    });
  };
  const handleUploadedDataChange = useCallback(
    (name, value) => {
      const editPayload = {
        _id: collection._id,
        [name]: value,
        fetchUserCollection: true,
      };

      dispatch(updateWishlist(editPayload));
      // setUpdatedData({ ...updatedData, [name]: value });
    },
    [collection._id],
  );
  // Handle file upload for cover image
  const handleCoverImageUpload = (info) => {
    if (info.file.status === "done") {
      const file = info.file.originFileObj;

      handleUploadedDataChange("cover_image", URL.createObjectURL(file));
    }
  };
  const uploadProps = useMemo(
    () => ({
      accept: "image/*",
      multiple: false,
      customRequest: async (info) => {
        if (info?.file) {
          const file = info.file;

          const reader = new FileReader();

          reader.onload = (e) => {
            const img = new window.Image();
            img.src = e.target.result;

            img.onload = () => {
              const width = img.width;
              const height = img.height;

              if (width < 600 || height < 600) {
                notification.error({
                  message: "Image must be at least 600 x 600 pixels",
                  //  description:
                  //    error?.response?.data?.message || "Unexpected error occurred",
                });
                return;
              }
              setCropAndResizeImageData({
                isOpen: true,
                selectedImage: e.target.result?.toString() || "",
                ImageFileName: file?.name,
              });
            };
          };

          reader.readAsDataURL(file);
        }
      },
    }),
    [handleUploadedDataChange],
  );
  // close crop and resize modal
  const onCropAndResizeImageModalClose = useCallback((setCompletedCrop) => {
    setCropAndResizeImageData({});
    setCompletedCrop(false);
  }, []);

  const onCropAndResizeImageModalSubmit = useCallback(
    async ({ blobData }) => {
      try {
        setCropAndResizeImageData({});
        // setIsUploading(true);
        if (blobData) {
          const response = await profileAPIs.uploadImage({
            file: blobData,
            custom_size: COLLECTION_COVER_IMG_SIZE_900_900,
          });
          if (response?.data?.data && response.data.data[0]) {
            handleUploadedDataChange("cover_image", response.data.data[0]?.url); // API call and updating local state with updated value
          }
        }
      } catch (error) {
        notification["error"]({
          message: "Failed to upload cover image",
        });
      } finally {
        // setIsUploading(false);
        setIsDragAndDropVisible(false);
      }
    },
    [handleUploadedDataChange],
  );
  const [isDragAndDropVisible, setIsDragAndDropVisible] = useState(
    !collection.cover_image && !collection.video_url,
  );

  return (
    <>
      {collection?.sponsor_details?.banner?.image &&
      collection?.sponsor_details?.banner?.url ? (
        <Link
          href={collection.sponsor_details.banner.url}
          className={styles.bannerLink}
          target="_blank"
        >
          <img
            onClick={() =>
              handleCollectionBannerClick({
                image: collection.sponsor_details.banner.image,
                sponsored: true,
                redirectionUrl: collection.sponsor_details.banner.url,
              })
            }
            className={styles.bannerImage}
            // style={{
            //   aspectRatio: "1 / 0.25",
            // }}
            src={getFinalImageUrl(collection.sponsor_details.banner.image)}
          />
               {(isPageOwner  || Adminlist) && (
                      <>
                        <p className="z-30 absolute top-3 lg:top-5 right-4 ">
                
                            <p className="bg-white rounded-full p-1" onClick={(e) => {e.stopPropagation(),e.preventDefault(), setBannerModalOpen(true)}} >
                              <FiEdit
                                style={{
                                  color: "#9a9b9b",
                                  // backgroundColor: "#f8f6f4",
                                }}
                                title="Edit Collection"
                                className={styles.editIconContainerowner}
                              />
                            </p>
                        
                        </p>
                      </>
                    )}

                    {/* {isPageOwner  || Adminlist ? (
              <button
                onClick={() => setBannerModalOpen(true)}
                className={styles.actionButton}
              >
                {collection?.sponsor_details?.banner?.image
                  ? "Update Banner"
                  : "Add Banner"}
              </button>
            ) : null} */}

        </Link>
      ) : null}
      {collection?.collection_name !== 'my wishlist' && collection?.collection_name !== 'my tryons' && 
      <>

      <div className={cssStyles.container}>
        <div
          ref={videoContainerRef}
          className={`${cssStyles.imageContainer} CollectionDetails_Img collection_details_pointer ${
            current_store_name
              ? current_store_name === "samskara"
                ? "collection_details_sticky_samskara"
                : current_store_name === "santhay"
                  ? "collection_details_sticky_santhay"
                  : current_store_name === "heroesvillains"
                    ? "collection_details_sticky_heroesvillains"
                    : current_store_name === "swiftlystyled"
                      ? "collection_details_sticky_swiftlystyled"
                      : current_store_name === "dothelook"
                        ? "collection_details_sticky_swiftlystyled"
                        : "collection_details_sticky_santhay"
              : ""
          }`}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* Display default avatar if both video_url and cover_image are absent */}
          {!collection.video_url && !collection.cover_image ? (
            <div className="relative">

            <img
              src={defaultAvatar}
              alt="Default Image"
              width="100%"
              height="100%"
              className={`CollectionDetails_Img ${cssStyles.defaultImage}`}
              />
               {(Owner || Adminlist) && (
                      <>
                        <p className="z-30 absolute top-3 lg:top-5 right-4 ">
                          <Upload
                            {...uploadProps}
                            name="cover_image"
                            showUploadList={false}
                            onChange={handleCoverImageUpload}
                          >
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
                      </>
                    )}
              </div>
          ) : (
            <div className={cssStyles.relative}>
              {/* Display cover image if present, otherwise show default avatar */}
              <div ref={imageContainerRef} className={cssStyles.relative}>
                {collection.video_url &&
                !collection.cover_image &&
                !isSocialMediaVideo(collection.video_url) ? (
                  <ReactPlayer
                    url={collection.video_url}
                    playing={false} // Play the video when hovered or on mobile
                    muted={true}
                    loop={true}
                    width="100%"
                    height="100%"
                    playsinline
                    className={styles.videoPlayer}
                    style={{ zIndex: 10 }} // Ensure video is on top
                  />
                ) : (
                  <div className="relative">
                    <img
                      src={
                        collection.cover_image
                          ? getFinalImageUrl(collection.cover_image)
                          : defaultAvatar
                      }
                      alt="Collection Cover"
                      width="100%"
                      height="100%"
                      className={`CollectionDetails_Img ${cssStyles.coverImage}`}
                        style={{
                        opacity: (isHovered || (isMobile && isVisible)) && collection.video_url && !isSocialMediaVideo(collection.video_url) ? 0 : 1,
                        transition: "opacity 0.3s ease-in-out",
                      }}
                      onLoad={() => {
                        if (imageContainerRef.current) {
                          const { width, height } =
                            imageContainerRef.current.getBoundingClientRect();
                          setContainerDimensions({ width, height });
                        }
                      }}
                    />
                    {(Owner || Adminlist) && (
                      <>
                        <p className="z-30 absolute top-3 lg:top-5 right-4 ">
                          <Upload
                            {...uploadProps}
                            name="cover_image"
                            showUploadList={false}
                            onChange={handleCoverImageUpload}
                          >
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
                      </>
                    )}
                    <CropAndResizeImageModal
                      headerText="Crop and upload"
                      isOpen={cropAndResizeImageData?.isOpen}
                      onClose={onCropAndResizeImageModalClose}
                      onSubmit={onCropAndResizeImageModalSubmit}
                      aspect={1 / 1}
                      selectedImg={cropAndResizeImageData?.selectedImage}
                      ImageFileName={cropAndResizeImageData?.ImageFileName}
                    />

                    {/* Properly scaled overlay points */}
                    {collection.cover_image_coordinates &&
                      containerDimensions.width > 0 &&
                      containerDimensions.height > 0 && (
                        <div className={cssStyles.absoluteInset}>
                          {renderOverlay(
                            collection.cover_image_coordinates,
                            containerDimensions.width,
                            containerDimensions.height,
                          )}
                        </div>
                      )}
                  </div>
                )}
              </div>

              {/* Play video on hover or on mobile if visible */}
              {(isHovered || (isMobile && isVisible)) &&
                collection.video_url &&
                !isSocialMediaVideo(collection.video_url) && (
                  <>
                    <ReactPlayer
                      url={collection.video_url}
                      playing={true} // Play the video when hovered or on mobile
                      muted={true}
                      loop={true}
                      width="100%"
                      height="100%"
                      playsinline
                      className={cssStyles.videoOverlay}
                      style={{ zIndex: 10 }} // Ensure video is on top
                    />
                    {/* Transparent overlay to block interaction with the video */}
                    <div className={cssStyles.videoOverlay} />
                  </>
                )}
            </div>
          )}
        </div>

        <div
          className={`${styles.detailsContainer} ${showMoreEnabled ? "" : styles.selfCenter}`}
        >
          <div className={styles.headerFlex}>
            <div className={styles.titleColumn}>
              {is_store_instance && (
                <div className={styles.storeInfoFlex}>
                  {is_store_instance && collectionOwner && user_name ? (
                    <>
                      <Tooltip
                        title={`All collections by ${user_name}`}
                        placement="bottomLeft"
                      >
                        {(() => {
                          const route =
                            user_name === super_admin
                              ? PATH_ROOT
                              : generateRoute(
                                  collectionOwner.user_id,
                                  user_name,
                                );
                          return route ? (
                            <Link href={route} className={styles.userInfoLink}>
                              {profile_image && (
                                <img
                                  src={getFinalImageUrl(profile_image)}
                                  className={styles.userAvatar}
                                />
                              )}
                              {/* text-blue-103 */}
                              <span className={styles.userNameText}>
                                @{user_name}
                              </span>
                            </Link>
                          ) : (
                            <div className={styles.userInfoContainer}>
                              {profile_image && (
                                <img
                                  src={getFinalImageUrl(profile_image)}
                                  className={styles.userAvatar}
                                />
                              )}
                              <span className={styles.userNameText}>
                                @{user_name}
                              </span>
                            </div>
                          );
                        })()}
                      </Tooltip>

                      <div className={styles.actionsContainer}>
                        {!isGuestUser && isPageOwner && (
                          <EditOutlined
                            title="Edit Collection"
                            className={styles.editIconContainer}
                            onClick={
                              () =>
                                navigate(
                                  getEditCollectionPagePath(collection._id),
                                ) // redirection to new edit
                            }
                          />
                        )}

                        <div className={styles.shareContainer}>
                          {showShareCollection && (
                            <ShareOptions
                              url={sharePageUrl}
                              onClose={setShowShareCollection}
                              collection={collection}
                              isOpen={showShareCollection}
                              qrCodeGeneratorURL={qrCodeGeneratorURL}
                              collectionPagePath={collectionPagePath}
                            />
                          )}
                          {sharePageUrl && collection.status === PUBLISHED && (
                            <img
                              className={`${styles.shareImg} ${
                                showShareCollection
                                  ? styles.pointerEventsNone
                                  : ""
                              } ${
                                collection.status === PUBLISHED
                                  ? styles.cursorPointer
                                  : styles.cursorNotAllowed
                              }`}
                              src={share_icon}
                              title={
                                collection.status !== PUBLISHED
                                  ? "Please publish collection to share"
                                  : ""
                              }
                              onClick={() =>
                                collection.status === PUBLISHED &&
                                setShowShareCollection(!showShareCollection)
                              }
                            />
                          )}
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <span className={styles.poweredByText}>powered by</span>
                      &nbsp;
                      <a
                        href="https://unthink.ai/"
                        target="_blank"
                        className={styles.unthinkLogoLink}
                      >
                        <Image
                          src={unthink_black_log}
                          preview={false}
                          height={16}
                          className={styles.unthinkLogoImg}
                        />
                      </a>
                    </>
                  )}
                </div>
              )}
              <div className={styles.collectionName} title={collection_name}>
                {capitalFirstLetter(collection_name)}
              </div>
            </div>

            {/* <div className='relative flex justify-between w-6 lg:w-7'>
							{showShareCollection && (
								<ShareOptions
									url={sharePageUrl}
									setShow={setShowShareCollection}
									collection={collection}
								/>
							)}
							{sharePageUrl && (
								<>
									<button
										style={{ left: "-100px" }}
										className={`share_button_responsive flex items-center rounded-15 border-2 text-newcolor-100 border-violet-100 justify-center absolute mt-0.5 mb-auto lg:w-28 lg:h-38 md:w-24 md:h-8 w-16 h-7 text-xs md:text-sm ${showShareCollection ? "pointer-events-none" : ""} ${collection.status === PUBLISHED
											? "cursor-pointer"
											: "cursor-not-allowed opacity-50"
											}`}
										title={
											collection.status !== PUBLISHED
												? "Please publish collection to share"
												: ""
										}
										onClick={() =>
											collection.status === PUBLISHED &&
											setShowShareCollection(!showShareCollection)
										}
									>
										Share
									</button>
								</>

							)}
						</div> */}

            {/* {qrCodeGeneratorURL && collection.status === PUBLISHED ? (
							<img
								className='qrcode_image object-cover w-20 lg:w-25 h-20 lg:h-25'
								 
								src={qrCodeGeneratorURL}
							/>
						) : null} */}
          </div>

          {collection.video_url && (
            <div className={styles.inspiredByContainer}>
              <span className={styles.inspiredByText}>
                Inspired by
                {collection?.display_url || collection.video_url ? (
                  <a
                    className={styles.inspiredByLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    href={collection?.display_url || collection.video_url}
                  >
                    video
                  </a>
                ) : null}
              </span>
            </div>
          )}

          <div className={styles.tagsContainer}>
            {showFeatureOnBTOnNonStore &&
            collection.hosted_stores?.includes(STORE_USER_NAME_BUDGETTRAVEL) ? (
              <span className={styles.tagBadge}>
                Featured on Budget Travel store
              </span>
            ) : null}
            {showFeatureOnStore &&
            collection.hosted_stores?.includes(current_store_name) ? (
              <span className={styles.tagBadge}>
                Featured on {storeDisplayName} store
              </span>
            ) : null}
          </div>

          {collection.blog_url && (
            <div className={styles.fullArticleText}>
              Read the full article{" "}
              <a
                className={styles.articleLink}
                target="_blank"
                href={collection.blog_url}
              >
                here
              </a>
            </div>
          )}

          {collection.generated_by === COLLECTION_GENERATED_BY_IMAGE_BASED &&
            (collection.image_url || collection.cover_image) && (
              <div className={styles.fullArticleText}>
                Look inspired by the image
              </div>
            )}

          <div className={styles.relativeContainer}>
            <p
              ref={descriptionRef}
              className={`${isCollectionPage ? "lg:text-xl text-sm md:text-lg text-gray-600 whitespace-pre-wrap" : styles.descriptionText} ${
                isShowMoreActive ? "" : styles.collection_description_ellipsis
              }`}
            >
              {collection?.description}
            </p>
            {showMoreEnabled &&
              (isShowMoreActive ? (
                <span
                  className={styles.readMoreText}
                  onClick={() => dispatch(toggleShowMore(false))}
                >
                  Read less
                </span>
              ) : (
                <span
                  className={styles.readMoreText}
                  onClick={() => dispatch(toggleShowMore(true))}
                >
                  Read more
                </span>
              ))}
          </div>

          <div className={`${styles.buttonsRow} all_collection_buttons`}>
            {isPageOwner ? (
              <button
                onClick={() => setBannerModalOpen(true)}
                className={collection?.sponsor_details?.banner?.image ? 'hidden' : styles.actionButton}
              >
                {collection?.sponsor_details?.banner?.image
                  ? "Update Banner"
                  : "Add Banner"}
              </button>
            ) : null}

            {isPageOwner &&
              (updateWishlistInProgress ? (
                <Spin className={styles.spinLeft} />
              ) : collection.status === DONE ? (
                // <CustomTooltip
                //   messageText="Publish your first collection and join the Unthink creator club!"
                //   onClose={() => setPublishButtonTooltipOpen(false)}
                //   visible={publishButtonTooltipOpen}
                //   overlayClassName="max-w-640"
                // >
                  <button
                    className={styles.actionButton}
                    onClick={handlePublishCollection}
                    title="click to publish the collection"
                  >
                    Publish
                  </button>
                // </CustomTooltip>
              ) : (
                collection.status === PUBLISHED && (
                  <button
                    className={styles.actionButton}
                    onClick={handlePublishCollection}
                    title="Click to unpublish collection"
                  >
                    Unpublish
                  </button>
                )
              ))}

            {showFeatureOnBTOnNonStore ? (
              <button
                onClick={() =>
                  handleFeatureCollectionOnStore(STORE_USER_NAME_BUDGETTRAVEL)
                }
                className={styles.featureButton}
                disabled={collection.status !== PUBLISHED}
                title={
                  collection.status !== PUBLISHED
                    ? "This collection is not published, Please publish it to feature on budget travel store"
                    : "Click to show this collection on Budget travel store home page"
                }
              >
                {collection.hosted_stores?.includes(
                  STORE_USER_NAME_BUDGETTRAVEL,
                )
                  ? "Remove from Budget Travel store"
                  : "Feature on Budget Travel store"}
              </button>
            ) : null}

                  {showFeatureOnStore ? (
              <button
                onClick={() =>
                  handleFeatureCollectionOnStore(current_store_name)
                }
                className={styles.featureButton}
                disabled={collection.status !== PUBLISHED}
                title={
                  collection.status !== PUBLISHED
                    ? "This collection is not published, Please publish it to feature on store"
                    : "Click to show this collection on store home page"
                }
              >
                {collection.hosted_stores?.includes(current_store_name)
                  ? `Remove from ${storeDisplayName} store`
                  : `Feature on ${storeDisplayName} store`}
              </button>
            ) : null}
            
          </div>

          <div className={styles.featureRow}>
       
      
          </div>
        </div>
        {/* add banner with redirection modal UI */}
        {isPageOwner && collection._id && (
          <CustomBannerModal
            modalHeaderText={
              collection?.sponsor_details?.banner?.image
                ? "Update Banner"
                : "Add Banner"
            }
            isModalOpen={bannerModalOpen}
            onModalClose={() => setBannerModalOpen(false)}
            collectionData={collection}
          />
        )}
      </div>
      {collection?.sponsor_details?.collection_image_list?.length > 0 && (
        <CarousalContainer
          items={collection?.sponsor_details?.collection_image_list}
          hideTitle
          collection_image_list
        />
      )}
      </>
}

    </>
  );
};

export default CollectionDetails;
