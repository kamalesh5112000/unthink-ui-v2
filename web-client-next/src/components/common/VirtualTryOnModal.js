import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { notification, Upload } from "antd";
import {
  CloseCircleOutlined,
  LoadingOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import Modal from "../modal/Modal";
import CameraCapture from "../shared/CameraCapture";
import { profileAPIs, TryonSaveApiCall, TryOnVto } from "../../helper/serverAPIs";
import { vtoIconState } from "../singleCollection/redux/actions";
import camera from "../singleCollection/images/Card/camera.svg";
import { useGuestPopup } from "../../context/GuestPopupContext";

const getLoginUserId = (loginData) => {
  if (!loginData) return "";
  if (typeof loginData === "string") return loginData;
  return loginData?.user_id || loginData?._id || "";
};

const VirtualTryOnModal = ({
  size,
  className = "",
  isFloating = false,
  iconClassName = "z-10 h-5 w-5 md:h-5 md:w-5",
  textClassName = "text-xs font-semibold text-black",
  product,
  login,
  hasKioskAccess,
  buildProductAutoLoginQr,
  enableKioskGuestPopup,
  onGuestPopupOpen,
  onKioskTryonClick,
  setOnMfrCode,
  onVtoClick,
  storeData,
  tryonConfig,
  subText,
  saveUserId = null,
  kioskEmail = null,
  kioskUserName = null,
  saveText = "Save",
}) => {
  const dispatch = useDispatch();  
  const { openGuestPopup } = useGuestPopup();
   
  const [ButtonClick, authUser, isUserLogin, kioskLoginFromStore] =
    useSelector((state) => [
    state.VtoIconReducer.ButtonClick,
    state.auth.user.data,
    state.auth.user.isUserLogin,
    state.kiosk.login,
  ]);
  const isMobile = typeof window !== "undefined" && window.innerWidth < 878;
  const isOpen = Boolean(storeData && ButtonClick === product?.mfr_code);
  const hasAuthLogin = Boolean(isUserLogin || authUser?.user_id);
  const hasKioskLogin = Boolean(
    getLoginUserId(login) ||
      getLoginUserId(kioskLoginFromStore) ||
      kioskEmail ||
      kioskUserName,
  );
  const shouldOpenGuestPopup = hasKioskAccess
    ? !hasKioskLogin
    : !hasAuthLogin && !hasKioskLogin;
  const modalSubText =
    subText || tryonConfig?.tryon_statement || storeData?.defult_tryon_statement;
  const productImage = product?.image;
  const storeName = storeData?.store_name;
  const imageTryonPrompt =
    storeData?.templates?.[tryonConfig?.tryon_type] ||
    storeData?.templates?.[storeData?.default_tryon_type] ||
    "";
  const tryonType = tryonConfig?.tryon_type || "tryon";
  const eventId = storeData?.event_id || null;
  const saveProduct = product
    ? {
        mfr_code: product?.mfr_code,
        name: product?.name,
        image: product?.image || "",
      }
    : null;

  const [showLoader, setShowLoader] = useState(false);
  const [description, setDescription] = useState("");
  const [vtoResultImageUrl, setVtoResultImageUrl] = useState(null);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const uploadedImage = uploadedImages?.[0];

  const handleVTOCancel = () => {
    dispatch(vtoIconState(false));
    setVtoResultImageUrl(null);
    setUploadedImages([]);
    setDescription("");
    setLoading(false);
    setShowLoader(false);
  };

  const handleUploadImage = async ({ file }) => {
    try {
      setShowLoader(true);

      const response = await profileAPIs.uploadImage({ file });
      const data = response?.data;

      if (data?.status_code === 400 || data?.status === "failure") {
        notification.error({
          message: "Image Upload Failed",
          description:
            data?.status_desc || "Something went wrong. Please try again.",
        });
        return;
      }

      const url = data?.data?.[0]?.url;
      if (url) {
        setUploadedImages([url]);
        notification.success({
          message: "Image Uploaded Successfully",
        });
      }
    } catch (error) {
      console.error("Upload failed:", error);
      notification.error({
        message: "Image Upload Failed",
        description:
          error?.response?.data?.message || "Unexpected error occurred",
      });
    } finally {
      setShowLoader(false);
    }
  };

  const uploadImageDraggerProps = {
    accept: "image/*",
    multiple: false,
    showUploadList: false,
    customRequest: ({ file, onSuccess }) => {
      handleUploadImage({ file });
      setTimeout(() => onSuccess("ok"), 0);
    },
  };

  const handleVTOClick = async (event) => {
    event.stopPropagation();
    event.preventDefault();
    

    const payload = {
      image_urls: [uploadedImage, productImage],
      store: storeName,
      image_tryon_prompt: `${imageTryonPrompt} ${product?.size}`,
      additional_prompt: description || "",
      type: tryonType || "tryon",
      user_id: authUser?.user_id
    };

    try {
      setLoading(true);
      const response = await TryOnVto(payload);
      setVtoResultImageUrl(response?.data?.data?.image_url || null);
    } catch (error) {
      console.log(error);
      notification.error({
        message: "Virtual Try-On Failed",
        description:
          error?.response?.data?.message ||
          "Failed to process image. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVTODownload = async () => {
    if (!vtoResultImageUrl) return;

    try {
      const response = await fetch(vtoResultImageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = `vto-result-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      notification.success({
        message: "Download Successful",
        description: "Your virtual try-on image has been downloaded.",
      });
      handleVTOCancel();
    } catch (error) {
      console.error("Download failed:", error);
      notification.error({
        message: "Download Failed",
        description: "Failed to download the image. Please try again.",
      });
    }
  };

  const handleVTOSave = async () => {
    if (!saveProduct) return;

    try {
      const payload = {
        collection_type: "vto_collection",
        status: "published",
        collection_name: "my tryons",
        user_id: saveUserId,
        store: storeName,
        event_id: eventId,
        product_lists: [
          {
            mfr_code: saveProduct.mfr_code,
            name: saveProduct.name,
            image: saveProduct.image || "",
          },
          {
            name: "item2",
            image: vtoResultImageUrl || "",
            custom_product: false,
          },
        ],
      };

      await TryonSaveApiCall(payload);
      notification.success({
        message: "Save Success",
        description: "Collection added successfully",
      });

    } catch (error) {
      console.log(error);
      notification.error({
        message: "Save Failed",
        description: "Failed to save virtual try-on. Please try again.",
      });
    } finally {
      handleVTOCancel();
    }
  };

  const openVtoGuestPopup = (mfrCode) => {
    onGuestPopupOpen?.({
      type: "vto",
      mfrCode,
      product,
    });
    openGuestPopup({
      action: "vto",
      storeName,
      persistKioskLogin: true,
      refreshUserInfo: !isUserLogin,
      onSuccess: async ({ email, phone }) => {
        setOnMfrCode?.(product);

        if (hasKioskAccess && onKioskTryonClick) {
          await onKioskTryonClick(product, { email, phone });
          return;
        }

        if (buildProductAutoLoginQr) {
          await buildProductAutoLoginQr({ mfrCode, email, phone, context: "vto" });
          return;
        }

        if (onVtoClick) {
          onVtoClick(mfrCode);
          return;
        }

        if (mfrCode) {
          dispatch?.(vtoIconState(mfrCode));
        }
      },
    });
  };

  const handleClick = async (event) => {
    event?.stopPropagation?.();
    const mfrCode = product?.mfr_code;

    if (setOnMfrCode || onVtoClick || onKioskTryonClick) {
      setOnMfrCode?.(product);
      if (shouldOpenGuestPopup) {
        openVtoGuestPopup(mfrCode);
        return;
      }

      if (
        hasKioskAccess &&
        enableKioskGuestPopup &&
        mfrCode &&
        onKioskTryonClick
      ) {
        onKioskTryonClick(product);
        return;
      }

      if (mfrCode) {
        onVtoClick?.(mfrCode);
      }
      return;
    }

    if (shouldOpenGuestPopup) {
      openVtoGuestPopup(mfrCode);
      return;
    }

    if (hasKioskAccess && !isMobile && login) {
      await buildProductAutoLoginQr?.({ mfrCode });
      return;
    }

    if (mfrCode) {
      dispatch?.(vtoIconState(mfrCode));
    }
  };

  return (
    <>
      <button
        className={`${
          isFloating
            ? size === "small"
              ? "absolute bottom-2.5 left-2.5"
              : "absolute bottom-3 right-3 md:bottom-5 md:right-4"
            : ""
        } flex w-fit cursor-pointer flex-row-reverse items-center gap-1 rounded-3xl bg-white px-2 py-1 shadow-md transition-all duration-300 ease-in-out lg:hover:bg-gray-100 lg:hover:shadow-lg ${className}`.trim()}
        onClick={handleClick}
        title="Try on with virtual camera"
      >
        <img
          height={20}
          width={20}
          alt="Try on with camera"
          className={iconClassName}
          src={camera}
        />
        <p className={textClassName}>Try On</p>
      </button>
      {isOpen ? (
    <Modal
      isOpen={isOpen}
      headerText="Virtual Try-On"
      subText={modalSubText}
      onClose={handleVTOCancel}
      size="md"
    >
      {vtoResultImageUrl ? (
        <div className="flex flex-col items-center justify-center py-8">
          <img
            src={vtoResultImageUrl}
            alt="VTO Result"
            className="mb-5 max-h-96 rounded-xl"
          />
          <div className="flex w-full flex-wrap justify-end gap-3">
            <button
              type="button"
              onClick={handleVTOCancel}
              className="cursor-pointer rounded-xl border border-brand bg-transparent px-[1.125rem] py-2 text-xs font-bold text-brand transition-all duration-300 ease-in-out hover:bg-tertiary md:text-sm"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleVTODownload}
              className="cursor-pointer rounded-xl border-0 bg-brand px-[1.125rem] py-2 text-xs font-bold text-white transition-all duration-300 ease-in-out hover:bg-secondary md:text-sm"
            >
              Download
            </button>
            {saveProduct ? (
              <button
                type="button"
                onClick={handleVTOSave}
                className="cursor-pointer rounded-xl border-0 bg-brand px-[1.125rem] py-2 text-xs font-bold text-white transition-all duration-300 ease-in-out hover:bg-secondary md:text-sm"
              >
                {saveText}
              </button>
            ) : null}
          </div>
        </div>
      ) : loading ? (
        <div className="flex flex-col items-center justify-center gap-4 py-12">
          <LoadingOutlined
            className="animate-spin text-5xl text-brand"
          />
          <div className="flex flex-col items-center gap-2 text-center">
            <p className="m-0 text-lg font-semibold text-gray-800">
              AI is generating your image
            </p>
            <p className="m-0 text-sm text-gray-500">
              Please wait while we process your request...
            </p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleVTOClick}>
          <div className="relative flex flex-col items-center justify-center pb-[25px]">
            {showLoader ? (
              <LoadingOutlined
                className="animate-spin text-5xl text-brand"
              />
            ) : !uploadedImage ? (
              <div className="relative flex flex-col items-center justify-center pb-[25px]">
                <CameraCapture
                  onCapture={(file) => handleUploadImage({ file })}
                  panelClassName="relative flex w-full flex-col items-center justify-center pb-[25px]"
                  videoClassName="max-h-80 w-full max-w-sm rounded-xl bg-black object-cover"
                  actionsClassName="mt-4 flex flex-wrap justify-center gap-3"
                  secondaryButtonClassName="cursor-pointer rounded-xl border border-brand bg-transparent px-[1.125rem] py-2 text-xs font-bold text-brand transition-all duration-300 ease-in-out hover:bg-tertiary md:text-sm"
                  primaryButtonClassName="cursor-pointer rounded-xl border-0 bg-brand px-[1.125rem] py-2 text-xs font-bold text-white transition-all duration-300 ease-in-out hover:bg-secondary md:text-sm"
                  renderIdle={({
                    openCamera,
                    isCameraStarting,
                    CameraIcon,
                    LoadingIcon,
                  }) => (
                    <>
                      <h4 className="mb-3 text-start text-xl font-semibold">
                        Upload Your Image
                      </h4>
                      <Upload.Dragger
                        className="h-56 w-56 bg-transparent"
                        {...uploadImageDraggerProps}
                        name="upload_image"
                        showUploadList={false}
                      >
                        <p className="text-[2rem] text-brand">
                          <UploadOutlined />
                        </p>
                        <p className="mx-auto w-2/3">
                          Click or drag file(s) to this area
                        </p>
                      </Upload.Dragger>
                      <button
                        type="button"
                        onClick={openCamera}
                        disabled={isCameraStarting}
                        className="mt-3 flex cursor-pointer items-center gap-2 rounded-xl border border-brand bg-transparent px-[1.125rem] py-2 text-xs font-bold text-brand transition-all duration-300 ease-in-out hover:bg-tertiary disabled:cursor-not-allowed disabled:opacity-70 md:text-sm"
                      >
                        {isCameraStarting ? <LoadingIcon /> : <CameraIcon />}
                        Camera
                      </button>
                    </>
                  )}
                />
              </div>
            ) : null}

            {uploadedImage ? (
              <div className="relative">
                <img
                  src={uploadedImage}
                  alt="Uploaded"
                  className="mt-2 max-h-40"
                />
                <CloseCircleOutlined
                  className="absolute right-0 top-2 cursor-pointer text-xl text-white transition-all duration-300 ease-in-out hover:opacity-80"
                  onClick={() => setUploadedImages([])}
                />
              </div>
            ) : null}
          </div>

          <h4 className="font-semibold text-gray-800">
            Add a prompt for AI (optional)
          </h4>
          <textarea
            className="mt-2 w-full resize-none rounded-xl border border-gray-300 px-3 py-2 font-[inherit] text-sm text-gray-800 outline-none placeholder:text-gray-400 focus:border-brand focus:ring-[3px] focus:ring-brand/10"
            placeholder="Enter description..."
            name="description"
            type="text"
            onChange={(event) => setDescription(event.target.value)}
            value={description}
            rows={5}
          />

          <div className="flex justify-end">
            <button
              type="submit"
              className={`mt-5 flex cursor-pointer justify-end rounded-xl border-0 px-[1.125rem] py-2 text-xs font-bold transition-all duration-300 ease-in-out md:text-sm ${
                loading
                  ? "bg-secondary text-brand hover:opacity-90"
                  : "bg-brand text-white hover:bg-secondary"
              }`}
            >
              Submit
            </button>
          </div>
        </form>
      )}
    </Modal>
      ) : null}
    </>
  );
};

const MemoizedVirtualTryOnModal = React.memo(VirtualTryOnModal);
MemoizedVirtualTryOnModal.displayName = "VirtualTryOnModal";

export { MemoizedVirtualTryOnModal as VirtualTryOnModal };
export default MemoizedVirtualTryOnModal;
