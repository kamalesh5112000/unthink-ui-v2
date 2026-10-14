import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import dynamic from "next/dynamic";
import { useDispatch } from "react-redux";
import {
  Upload,
  Tooltip,
  Spin,
  notification,
  Image,
  Select,
  Checkbox,
  Button,
} from "antd";
import { LazyLoadImage } from "react-lazy-load-image-component";
import {
  PictureOutlined,
  InfoCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";

import PublishingOptionsDropdown from "./PublishingOptionsDropdown";
import { updateWishlist } from "../wishlistActions/updateWishlist/redux/actions";
import { openCollectionShareModal } from "../collectionShareModal/redux/actions";
import ShareOptions from "../shared/shareOptions";
import {
  checkIsFavoriteCollection,
  getBlogCollectionPageSlugPath,
} from "../../helper/utils";
import {
  collectionAPIs,
  profileAPIs,
  collectionProductsExportCsvURL,
} from "../../helper/serverAPIs";
import {
  // COLLECTION_COVER_IMG_SIZES,
  COLLECTION_COVER_IMG_SIZE_900_900,
  DONE,
  PUBLISHED,
  PUBLISHING_OPTION_EXPORT_PRODUCTS_CSV,
  PUBLISHING_OPTION_PAGE,
  favorites_collection_name,
} from "../../constants/codes";
import { auraYfretUserCollBaseUrl } from "../../constants/config";

import { ShareAltOutlined, SendOutlined } from "@ant-design/icons";
import { MdShare } from "react-icons/md";

import star_ai_icon from "../../images/unthink_star_ai_icon.svg";

import CropAndResizeImageModal from "../cropAndResizeImageModal/CropAndResizeImageModal";
import ReviewCollectionContainerWrapper from "./ReviewCollectionContainerWrapper";
import { getUserCollection } from "../Auth/redux/actions";
// import listening_avatar from "../../images/videos/listening_avatar.gif";
import Cookies from "js-cookie";
import { SocketContext } from "../../context/socketV2";
import styles from "./tryForFree.module.scss";

const { Dragger } = Upload;

const { Option } = Select;
const ReactPlayer = dynamic(() => import("react-player/lazy"), { ssr: false });

const defaultPostPageFormData = {
  collection_name: "",
  path: "",
};

const ReviewCollectionStepPublish = ({
  handlePreviewCollectionPage,
  handleDiscard,
  updatedData,
  setUpdatedData,
  handleUploadedDataChange,
  currentCollection,
  authUser,
  currentView,
  // onPublishButtonClick,
  STEPS,
  handleSelectPublishingOption,
  publishingOption,
  hiddenPublishingOptions,
  handleChangeView,
  collection_properties,
  authUserCollections,
  DefaultCoverImage,
  starredProducts,
  publishOverlay,
  storeData,
}) => {
  const dispatch = useDispatch();
  const [isUploading, setIsUploading] = useState(false);
  const [postPageFormData, setPostPageFormData] = useState({
    ...defaultPostPageFormData,
  });
  const [postPageFormErrors, setPostPageFormErrors] = useState({});
  const [cropAndResizeImageData, setCropAndResizeImageData] = useState({
    isOpen: false,
    selectedImage: "",
  });
  const { sendSocketClientimageGenarate } = useContext(SocketContext);
  const { createCollectionTypes } = storeData;
  const [aiGenerate, setAiGenerate] = useState(false);
  // Ref for the image container to get actual rendered dimensions
  const imageContainerRef = useRef(null);
  const [containerDimensions, setContainerDimensions] = useState({
    width: 0,
    height: 0,
  });

  const cover_image_coordinates = useMemo(
    () => publishOverlay || currentCollection?.cover_image_coordinates,
    [currentCollection?.cover_image_coordinates, publishOverlay],
  );

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
  }, [updatedData.cover_image, cover_image_coordinates]);

  const setShowShareOptions = useCallback(() => {
    dispatch(openCollectionShareModal(currentCollection, authUser));
  }, [currentCollection, authUser]);

  useEffect(() => {
    if (currentCollection._id && currentView === STEPS.PUBLISH) {
      setPostPageFormData({
        collection_name: currentCollection.collection_name || "",
        path: currentCollection.path || "",
      });

      return () => {
        setPostPageFormData({
          ...defaultPostPageFormData,
        });
      };
    }

    return () => {};
  }, [currentCollection, currentView]);

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

  const handlePostPageInputChange = (e) => {
    const { name, value } = e.target;

    if (name) {
      setPostPageFormData((data) => ({
        ...data,
        [name]: value,
      }));
    }
  };

  const collectionPageSlugPath = useMemo(
    () =>
      (currentCollection._id &&
        getBlogCollectionPageSlugPath(authUser.user_name)) ||
      "",
    [currentCollection._id && authUser.user_name],
  );

  const matchedCollection = useMemo(() => {
    if (!currentCollection?.generated_by) return null;

    return (
      createCollectionTypes.find(
        (item) => item.generated_by === currentCollection.generated_by,
      ) || null
    );
  }, []);

  const finalCollectionPagePath1 = useMemo(
    () =>
      ((typeof window !== "undefined" && window.location?.origin) || "") +
      (collectionPageSlugPath.replace("{collectionPath}", "") || ""),
    [collectionPageSlugPath, postPageFormData.path],
  );

  const finalCollectionPagePath2 = useMemo(
    () => postPageFormData.path || "[page_slug]",
    [collectionPageSlugPath, postPageFormData.path],
  );

  const isPostPageFormTouched = useMemo(
    () =>
      currentCollection._id &&
      (postPageFormData.collection_name !== currentCollection.collection_name ||
        postPageFormData.path !== currentCollection.path),
    [
      currentCollection._id,
      currentCollection.collection_name,
      currentCollection.path,
      postPageFormData,
    ],
  );

  const handlePostPageFormReset = useCallback(() => {
    setPostPageFormData({
      collection_name: currentCollection.collection_name || "",
      path: currentCollection.path || "",
    });
  }, [currentCollection.collection_name, currentCollection.path]);

  const validatePostPageForm = useCallback(() => {
    const errors = {
      collection_name: "",
      path: "",
    };

    if (!postPageFormData.collection_name) {
      errors.collection_name = "collection page title (name) is required";
    }

    if (!postPageFormData.path) {
      errors.path = "collection page url slug is required";
    } else if (
      postPageFormData.path.includes(" ") ||
      postPageFormData.path.includes("@") ||
      postPageFormData.path.includes("/") ||
      postPageFormData.path.includes("\\")
    ) {
      errors.path = "collection page url slug must be valid";
    }

    setPostPageFormErrors(errors);

    return Object.values(errors).every((v) => !v); // return true if there is no error
  }, [postPageFormData]);

  const handleInvalidPostPagePath = useCallback(() => {
    setPostPageFormErrors((err) => ({
      ...err,
      path: "Collection page url slug is already exists. Please update",
    }));
  }, []);

  const inpurRef = useRef(null);

  const handlePostPageFormSave = useCallback(async () => {
    if (validatePostPageForm()) {
      const editPayload = {
        _id: currentCollection._id,
        collection_name: postPageFormData.collection_name,
        fetchUserCollection: true,
      };

      if (postPageFormData.path !== currentCollection.path) {
        try {
          const res = await collectionAPIs.verifyCollectionPathAPICall(
            postPageFormData.path,
          );

          if (res.data.status_code === 200) {
            editPayload.path = postPageFormData.path;
          } else {
            handleInvalidPostPagePath();
            return;
          }
        } catch (error) {
          handleInvalidPostPagePath();
          return;
        }
      }

      dispatch(updateWishlist(editPayload));
    } else if (!postPageFormData.path) {
      inpurRef.current.focus();
    }
  }, [
    validatePostPageForm,
    handleInvalidPostPagePath,
    currentCollection._id,
    postPageFormData,
  ]);

  const CollectionDetectApi = async () => {
    const payload = {
      keyword_tag_map: currentCollection.keyword_tag_map,
      collection_name: currentCollection.collection_name,
      user_id: currentCollection.collection_id,
      collection_path: currentCollection.path,
    };

    try {
      const res = await collectionAPIs.collectionDetectKeyApi(payload);

      if (res.statusCode === 200) {
        // console.log("Success", res);
      } else {
        // console.log("Error:", res);
      }
    } catch (error) {
      console.error("API Call Failed:", error);
    }
  };

  // pulish function
  const onPublishButtonClick = useCallback(() => {
    const payload = {
      _id: currentCollection._id,
      status: currentCollection.status === DONE ? PUBLISHED : DONE,
      fetchUserCollection: true, // add this if latest collection detains form API is required after success update status
      checkForNFTReward: true, // flag to check for NFT, if user has published the first collection
      checkForNFTRewardShowNotification: true, // flag to show notification only for NFT
      cover_image_coordinates: cover_image_coordinates,
    };
    dispatch(updateWishlist(payload));

    // Collection detect function
    if (currentCollection.status === "done") {
      CollectionDetectApi();
    }
  }, [currentCollection._id, currentCollection.status]);

  // close crop and resize modal
  const onCropAndResizeImageModalClose = useCallback((setCompletedCrop) => {
    setCropAndResizeImageData({});
    setCompletedCrop(false);
  }, []);

  const onCropAndResizeImageModalSubmit = useCallback(
    async ({ blobData }) => {
      try {
        setCropAndResizeImageData({});
        setIsUploading(true);
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
        setIsUploading(false);
        setIsDragAndDropVisible(false);
      }
    },
    [handleUploadedDataChange],
  );

  const [isVideoHovered, setIsVideoHovered] = useState(false);
  const [isDragAndDropVisible, setIsDragAndDropVisible] = useState(
    !updatedData.cover_image && !updatedData.video_url,
  );

  // Handle file upload for cover image
  const handleCoverImageUpload = (info) => {
    if (info.file.status === "done") {
      const file = info.file.originFileObj;

      handleUploadedDataChange("cover_image", URL.createObjectURL(file));
    }
  };

  useEffect(() => {
    if (
      currentView === STEPS.PUBLISH &&
      updatedData.cover_image !== null &&
      !updatedData.cover_image
    ) {
      handleUploadedDataChange("cover_image", DefaultCoverImage);
      setIsDragAndDropVisible(false);
    }
  }, [currentView, updatedData.cover_image]);

  const handleRemoveImage = () => {
    handleUploadedDataChange("cover_image", null);
    setIsDragAndDropVisible(true);
  };

  const handleDataAiImageRequest = () => {
    sendSocketClientimageGenarate({
      imageGenerate: {
        text: "",
      },
      metadata: {
        keyword_tag_map: currentCollection?.keyword_tag_map,
        store: currentCollection?.domain_store || "",
        search_type:
          currentCollection?.generated_by === "image_based"
            ? "shop_the_look"
            : "smart_search",
        description: currentCollection?.description || "",
        image_url: currentCollection?.cover_image || "",
        generate_overlay_enable: matchedCollection?.enable_overlay,
      },
    });
  };

  // Add this debug effect
  useEffect(() => {
    if (cover_image_coordinates && containerDimensions.width > 0) {
      const scaleX = containerDimensions.width / 1024;
      const scaleY = containerDimensions.height / 1027;
      const scale = Math.min(scaleX, scaleY);
      const scaledWidth = 1024 * scale;
      const scaledHeight = 1027 * scale;
      const offsetX = (containerDimensions.width - scaledWidth) / 2;
      const offsetY = (containerDimensions.height - scaledHeight) / 2;

      cover_image_coordinates.forEach((item, index) => {
        const originalX = item.point[0];
        const originalY = item.point[1];
        const adjustedX = originalX * scale + offsetX;
        const adjustedY = originalY * scale + offsetY;
      });
    }
  }, [containerDimensions, cover_image_coordinates]);

  // Fixed renderPublishOverlay function
  const renderPublishOverlay = (
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
            className={styles.pulseIndicator}
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

  return (
    <div className={styles.publishStepContainer}>
      <ReviewCollectionContainerWrapper>
        {/* Title section START */}
        <div
          className={`${styles.flex} ${styles.mdItemsCenter} ${styles.justifyBetween} ${styles.flexColReverse} ${styles.mdFlexRow} ${styles.flexWrap} ${styles.gap5} ${styles.mdGap0}`}
        >
          <div>
            <p
              className={`${styles.mdLeadingNone} ${styles.fontNormal} ${styles.flex} ${styles.itemsCenter} ${styles.mb0} ${styles.textSlatA104}`}
            >
              {publishingOption === PUBLISHING_OPTION_PAGE ? (
                <>
                  <span
                    style={{ color: "black" }}
                    className={`${styles.textXl1} ${styles.mdText2xl} ${styles.desktopTextDisplayL} ${styles.fontSemibold} ${styles.breakWordOnly} ${styles.ellipsis1}`}
                  >
                    Almost there!
                  </span>
                </>
              ) : null}
              {publishingOption === PUBLISHING_OPTION_EXPORT_PRODUCTS_CSV ? (
                <>
                  <span
                    style={{ color: "black" }}
                    className={`${styles.textXl1} ${styles.mdText2xl} ${styles.desktopTextDisplayL} ${styles.fontSemibold} ${styles.breakWordOnly} ${styles.ellipsis1}`}
                  >
                    Export products as a CSV file
                  </span>
                </>
              ) : null}
            </p>
          </div>
          <div
            className={`${styles.mlAuto} ${styles.flex} ${styles.flexWrap} ${styles.gap2} ${styles.hFitContent}`}
            style={{ alignItems: "center" }}
          >
            {publishingOption === PUBLISHING_OPTION_PAGE &&
            isPostPageFormTouched ? (
              <>
                <button
                  onClick={handlePostPageFormReset}
                  className={`${styles.textXs} ${styles.textSmMd} ${styles.z10} ${styles.roundedXl} ${styles.py2_5} ${styles.px3_5} ${styles.hFull} ${styles.fontBold} ${styles.bgIndigo103} ${styles.textWhite} ${styles.p3} ${styles.border2} ${styles.borderIndigo103} ${styles.mlAuto}`}
                >
                  Discard
                </button>
                <button
                  onClick={handlePostPageFormSave}
                  className={`${styles.textXs} ${styles.textSmMd} ${styles.z10} ${styles.roundedXl} ${styles.py2_5} ${styles.px3_5} ${styles.hFull} ${styles.fontBold} ${styles.bgIndigo103} ${styles.textWhite} ${styles.p3} ${styles.border2} ${styles.borderIndigo103} ${styles.minW40}`}
                >
                  Save Changes
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleDiscard}
                  className={`${styles.textXs} ${styles.textSmMd} ${styles.z10} ${styles.roundedXl} ${styles.py2_5} ${styles.px3_5} ${styles.hFull} ${styles.fontBold} ${styles.textIndigo103} ${styles.border2} ${styles.borderIndigo103} ${styles.mlAutoMd}`}
                >
                  Cancel
                </button>

                <button
                  onClick={() => handleChangeView(STEPS.PRODUCTS)}
                  className={`${styles.hiddenLg} ${styles.lgInlineBlock} ${styles.textXs} ${styles.textSmMd} ${styles.z10} ${styles.roundedXl} ${styles.py2_5} ${styles.px3_5} ${styles.hFull} ${styles.fontBold} ${styles.bgIndigo103} ${styles.textWhite} ${styles.p3} ${styles.border2} ${styles.borderIndigo103}`}
                >
                  Previous
                </button>
                <div>
                  <PublishingOptionsDropdown
                    handleSelectPublishingOption={handleSelectPublishingOption}
                    selectedOption={publishingOption}
                    showSelectedMark
                    hiddenPublishingOptions={hiddenPublishingOptions}
                  />
                </div>

                <button
                  onClick={handlePreviewCollectionPage}
                  className={`${styles.textXs} ${styles.textSmMd} ${styles.z10} ${styles.roundedXl} ${styles.py2_5} ${styles.px3_5} ${styles.hFull} ${styles.fontBold} ${styles.bgIndigo103} ${styles.textWhite} ${styles.p3} ${styles.border2} ${styles.borderIndigo103}`}
                >
                  {currentCollection.status === PUBLISHED ? "View" : "Preview"}
                </button>
                {currentCollection.status === DONE ? (
                  <button
                    onClick={onPublishButtonClick}
                    className={styles.bgIndigo103RoundedXl}
                    title="click to publish the collection"
                  >
                    Publish
                  </button>
                ) : currentCollection.status === PUBLISHED ? (
                  <button
                    onClick={onPublishButtonClick}
                    className={styles.bgIndigo103RoundedXl}
                    title="click to publish the collection"
                  >
                    UnPublish
                  </button>
                ) : null}
              </>
            )}
          </div>
        </div>
        {/* Title section END */}

        <div className={`${styles.my10} ${styles.postAsPageContent}`}>
          {publishingOption === PUBLISHING_OPTION_PAGE ? (
            <div
              className={`${styles.gridCols1} ${styles.tabletGridCols2} ${styles.gap10} ${styles.tabletGap8} ${authUserCollections.length === 0 ? "" : styles.itemsCenter}`}
            >
              <div
                className={`${styles.flex} ${styles.flexCol} ${styles.gap10}`}
              >
                <div>
                  <label className={styles.titleLabel}>Title*</label>
                  {checkIsFavoriteCollection(currentCollection) ? (
                    <input
                      className={`${styles.inputField} ${styles.cursorNotAllowed} ${styles.textGray101}`}
                      name="collection_name"
                      type="text"
                      value={favorites_collection_name}
                      disabled
                    />
                  ) : (
                    <input
                      className={styles.inputField}
                      placeholder="Enter collection title"
                      name="collection_name"
                      type="text"
                      value={postPageFormData.collection_name}
                      onChange={handlePostPageInputChange}
                      onBlur={validatePostPageForm}
                    />
                  )}
                  {postPageFormErrors.collection_name && (
                    <p className={styles.errorTextSmall}>
                      {postPageFormErrors.collection_name}
                    </p>
                  )}
                </div>

                <div>
                  <div className={styles.publishHeader}>
                    <label
                      className={`${styles.titleLabel} ${styles.whitespaceNowrap}`}
                    >
                      Cover Image
                    </label>
                    {updatedData?.cover_image && (
                      <div
                        className={styles.removeImageButton}
                        onClick={handleRemoveImage}
                      >
                        <CloseCircleOutlined className={styles.closeIcon} />
                      </div>
                    )}
                  </div>
                  <div>
                    {!isDragAndDropVisible ? (
                      <>
                        {!updatedData.cover_image ? (
                          <div className={styles.mediaContainer}>
                            {updatedData.video_url && (
                              <ReactPlayer
                                url={updatedData.video_url}
                                playing={isVideoHovered}
                                muted
                                loop
                                width="100%"
                                height="100%"
                                playsinline
                                className={`${styles.videoPlayer} Video_player`}
                                onMouseEnter={() => setIsVideoHovered(true)}
                                onMouseLeave={() => setIsVideoHovered(false)}
                              />
                            )}
                          </div>
                        ) : (
                          <div
                            ref={imageContainerRef}
                            className={styles.mediaWrapper}
                            onMouseEnter={() => setIsVideoHovered(true)}
                            onMouseLeave={() => setIsVideoHovered(false)}
                          >
                            <LazyLoadImage
                              src={updatedData.cover_image}
                              height="100%"
                              width="100%"
                              style={{
                                height: "100%",
                                width: "100%",
                                objectFit: "cover",
                              }}
                              // effect="blur"
                              className={styles.videoPlayer}
                              onLoad={() => {
                                if (imageContainerRef.current) {
                                  const { width, height } =
                                    imageContainerRef.current.getBoundingClientRect();
                                  setContainerDimensions({ width, height });
                                }
                              }}
                            />

                            {/* Properly scaled overlay points */}
                            {cover_image_coordinates &&
                              containerDimensions.width > 0 &&
                              containerDimensions.height > 0 && (
                                <div
                                  className={`${styles.absolute} ${styles.inset0}`}
                                >
                                  {renderPublishOverlay(
                                    cover_image_coordinates,
                                    containerDimensions.width,
                                    containerDimensions.height,
                                  )}
                                </div>
                              )}
                          </div>
                        )}
                        <button
                          onClick={() => setIsDragAndDropVisible(true)}
                          className={styles.updateCoverButton}
                        >
                          Update cover image
                        </button>
                        {matchedCollection?.enable_ai_cover_image === true && (
                          <button
                            onClick={handleDataAiImageRequest}
                            className={styles.updateCoverButton}
                            style={{ marginLeft: 4 }}
                          >
                            Generate AI Image
                          </button>
                        )}
                      </>
                    ) : (
                      <div className={styles.uploadDraggerContainerPublish}>
                        {isUploading ? (
                          <Spin
                            className={`${styles.flex} ${styles.itemsCenter} ${styles.justifyCenter} ${styles.h32}`}
                          />
                        ) : (
                          <>
                            <Dragger
                              className={`${styles.wFull} ${styles.px4} ${styles.rounded2xl}`}
                              style={{ aspectRatio: "1 / 1" }}
                              {...uploadProps}
                              name="cover_image"
                              showUploadList={false}
                              onChange={handleCoverImageUpload}
                            >
                              <p className="ant-upload-drag-icon">
                                <PictureOutlined />
                              </p>
                              <p className="ant-upload-text">
                                Click or drag a file to this area to add a cover
                                image (Optional)
                              </p>
                              <p className={`ant-upload-text ${styles.textSm}`}>
                                (Recommended size : 600 x 600)
                              </p>
                            </Dragger>

                            <Upload
                              {...uploadProps}
                              name="cover_image"
                              showUploadList={false}
                              onChange={handleCoverImageUpload}
                            >
                              <button className={styles.updateCoverButton}>
                                Upload cover image
                              </button>
                            </Upload>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Show collection theme for swiftly styled store collection. */}
                {collection_properties?.collection_theme?.is_display &&
                collection_properties?.collection_theme?.display_value
                  .length ? (
                  <div>
                    <div
                      className={`${styles.flex} ${styles.mb0_75} ${styles.wFull} ${styles.maxW366}`}
                    >
                      <label className="text-sm font-normal block">
                        Organize your collection under a campaign or theme if
                        you like
                      </label>
                      <Tooltip title="Map this collection into one of these campaign or themes set up by your administrator (optional)">
                        <InfoCircleOutlined
                          className={`${styles.text_base} ${styles.flex} ${styles.ml2} ${styles.mt0_5}`}
                        />
                      </Tooltip>
                    </div>
                    <Select
                      name={"collection_theme"}
                      className={`w-full max-w-366 text-base collection_theme_select_input publish_dropdown_select`}
                      placeholder={`Select theme`}
                      value={updatedData?.collection_theme}
                      size="large"
                      onChange={(values) =>
                        handleUploadedDataChange("collection_theme", values)
                      }
                    >
                      {collection_properties.collection_theme.display_value?.map(
                        (theme) => (
                          <Option key={theme.key} value={theme.key}>
                            {theme.label}
                          </Option>
                        ),
                      )}
                    </Select>
                  </div>
                ) : null}
              </div>
              <div
                className={`${styles.flex} ${styles.flexCol} ${styles.gap10} ${styles.maxW439}`}
              >
                {authUserCollections.length === 0 && (
                  <div
                    className={`${styles.maxW439} ${styles.flex} ${styles.justifyCenter} ${styles.flexCol} ${styles.itemsCenter}`}
                  >
                    <div className={`${styles.relative} ${styles.wFull}`}>
                      <div
                        className={`bubble bubble-bottom-left ${styles.bubbleMessage} w-full-50 md:w-full-100 md:max-w-439 text-left`}
                      >
                        Congratulations!
                        <br /> Your page is ready to publish!
                      </div>
                      <img
                        src={star_ai_icon}
                        className={`${styles.w24Md36} ${styles.cursorPointer} ${styles.mt6}`}
                      />
                    </div>
                  </div>
                )}
                <div>
                  <div className={`${styles.flex} ${styles.justifyBetween}`}>
                    <label
                      className={`${styles.textXl} ${styles.fontNormal} ${styles.block} ${styles.mb0_75}`}
                    >
                      Collection Page URL
                    </label>
                    {currentCollection.status === PUBLISHED ? (
                      <div
                        className={`${styles.relative} ${styles.h7} ${styles.w7}`}
                      >
                        <Tooltip
                          className={`${styles.h7} ${styles.w7}`}
                          title={
                            isPostPageFormTouched
                              ? "Please save or discard the changes, to see the sharing options"
                              : "Click to see the sharing options"
                          }
                        >
                          <MdShare
                            className={`${
                              isPostPageFormTouched
                                ? styles.cursorNotAllowed
                                : styles.cursorPointer
                            } ${styles.h7} ${styles.w7}`}
                            role="button"
                            onClick={() =>
                              !isPostPageFormTouched && setShowShareOptions()
                            }
                          />
                        </Tooltip>
                      </div>
                    ) : null}
                  </div>
                  <div
                    className={` ${styles.bgLightGray110} ${styles.roundedXl} ${styles.wFull} ${styles.maxW439}`}
                  >
                    <p className={`${styles.textXl3} ${styles.breakAll}`}>
                      <span className={styles.fontMedium}>
                        {finalCollectionPagePath1}
                      </span>
                      <span className={styles.fontBold}>
                        {finalCollectionPagePath2}
                      </span>
                    </p>
                  </div>
                  <p
                    className={`${styles.textSm} ${styles.fontNormal} ${styles.block} ${styles.mt0_5}`}
                  >
                    You can change the URL if you like
                  </p>
                </div>

                <div>
                  <div
                    className={`${styles.flex} ${styles.flexCol} ${styles.flexRowLg} ${styles.itemsCenter}`}
                  >
                    <div className={styles.wFull}>
                      <div
                        className={`${styles.flex} ${styles.itemsCenter} ${styles.mb0_75}`}
                      >
                        <label
                          className={`${styles.textXl} ${styles.fontNormal} ${styles.block}`}
                          htmlFor="path-input"
                        >
                          Page Slug*
                        </label>
                        <Tooltip title="You can edit this part of the URL as you wish. Having a good slug URL can help SEO.">
                          <InfoCircleOutlined
                            className={`${styles.text_base} ${styles.flex} ${styles.mt2} ${styles.mb1} ${styles.ml2}`}
                          />
                        </Tooltip>
                      </div>
                      <p
                        className={`${styles.textXs} ${styles.maxW439} ${styles.mb2}`}
                      >
                        Spaces and special characters are not allowed except for
                        hyphens(-) and underscores(_)
                      </p>
                      <input
                        ref={inpurRef}
                        className={`${styles.textLeft} ${styles.placeholderGray101} ${styles.outlineNone} ${styles.px3} ${styles.h10} ${styles.bgWhite} ${styles.roundedXl} ${styles.wFull} ${styles.maxW439}`}
                        placeholder="Enter your page URL slug"
                        id="path-input"
                        name="path"
                        type="text"
                        value={postPageFormData.path}
                        onChange={handlePostPageInputChange}
                        onBlur={validatePostPageForm}
                      />
                    </div>
                  </div>
                  {postPageFormErrors.path && (
                    <p
                      className={`${styles.textRed400} ${styles.textXs} ${styles.mt2}`}
                    >
                      {postPageFormErrors.path}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : null}
          {publishingOption === PUBLISHING_OPTION_EXPORT_PRODUCTS_CSV ? (
            <>
              <div>
                {currentCollection.product_lists?.length ? (
                  <p
                    className={`${styles.textLg} ${styles.textWhite} ${styles.block}`}
                  >
                    {/* Click on the button below to export the products in CSV file. */}
                  </p>
                ) : (
                  <p className="text-lg block">
                    No products found.
                    <br />
                    Please add or get products to export it in CSV file.
                  </p>
                )}
              </div>
              <div className={styles.mt5}>
                {currentCollection.product_lists?.length &&
                currentCollection._id ? (
                  <a
                    className={`${styles.bgIndigo103} ${styles.rounded} ${styles.textWhite} ${styles.py2} ${styles.fontNormal} ${styles.text_base} ${styles.px5}`}
                    role="button"
                    href={`${auraYfretUserCollBaseUrl}${collectionProductsExportCsvURL}?collection_id=${currentCollection._id}`}
                    download
                    target="_blank"
                  >
                    Export
                  </a>
                ) : (
                  <p
                    className={`${styles.textLg} ${styles.block} ${styles.underline}`}
                    onClick={() => handleChangeView(STEPS.PRODUCTS)}
                    role="button"
                    title="Click here, to go to products section"
                  >
                    Go to products
                  </p>
                )}
              </div>
            </>
          ) : null}
        </div>
      </ReviewCollectionContainerWrapper>

      <CropAndResizeImageModal
        headerText="Crop and upload"
        isOpen={cropAndResizeImageData?.isOpen}
        onClose={onCropAndResizeImageModalClose}
        onSubmit={onCropAndResizeImageModalSubmit}
        aspect={1 / 1}
        selectedImg={cropAndResizeImageData?.selectedImage}
        ImageFileName={cropAndResizeImageData?.ImageFileName}
      />
    </div>
  );
};

export default React.memo(ReviewCollectionStepPublish);
