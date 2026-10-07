import { useCallback, useEffect, useRef, useState } from "react";
import { notification } from "antd";
import { useDispatch } from "react-redux";

import {
  setChatImageUrl,
  setShowChatLoader,
} from "../../../../hooks/chat/redux/actions";
import { profileAPIs } from "../../../../helper/serverAPIs";

export const useAuraImageUpload = ({ chatTypeKey }) => {
  const dispatch = useDispatch();
  const chatImagePreviewObjectUrlRef = useRef("");
  const [showUploadImage, setShowUploadImage] = useState(true);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [chatImagePreviewUrl, setChatImagePreviewUrl] = useState("");
  const [isFigmaUploadPanelOpen, setIsFigmaUploadPanelOpen] = useState(false);
  const [firstSubmittedImageUrl, setFirstSubmittedImageUrl] = useState("");

  const clearLocalChatImagePreview = useCallback(() => {
    if (chatImagePreviewObjectUrlRef.current) {
      URL.revokeObjectURL(chatImagePreviewObjectUrlRef.current);
      chatImagePreviewObjectUrlRef.current = "";
    }
    setChatImagePreviewUrl("");
  }, []);

  const handleClearChatImage = useCallback(() => {
    clearLocalChatImagePreview();
    dispatch(setChatImageUrl("", chatTypeKey));
  }, [chatTypeKey, clearLocalChatImagePreview, dispatch]);

  const resetChatImageState = useCallback(() => {
    handleClearChatImage();
    setFirstSubmittedImageUrl("");
  }, [handleClearChatImage]);

  useEffect(() => {
    return () => {
      if (chatImagePreviewObjectUrlRef.current) {
        URL.revokeObjectURL(chatImagePreviewObjectUrlRef.current);
      }
    };
  }, []);

  const handleUploadChatImage = useCallback(
    async (file) => {
      if (!file) return;

      if (
        typeof URL !== "undefined" &&
        typeof Blob !== "undefined" &&
        file instanceof Blob
      ) {
        if (chatImagePreviewObjectUrlRef.current) {
          URL.revokeObjectURL(chatImagePreviewObjectUrlRef.current);
        }
        const objectUrl = URL.createObjectURL(file);
        chatImagePreviewObjectUrlRef.current = objectUrl;
        setChatImagePreviewUrl(objectUrl);
      }

      try {
        setIsUploadingImage(true);
        dispatch(setChatImageUrl("", chatTypeKey));
        const response = await profileAPIs.uploadImage({ file });
        const imageUrl = response?.data?.data?.[0]?.url;

        if (imageUrl) {
          clearLocalChatImagePreview();
          setChatImagePreviewUrl(imageUrl);
          dispatch(setChatImageUrl(imageUrl, chatTypeKey));
          setIsFigmaUploadPanelOpen(false);
          return;
        }

        clearLocalChatImagePreview();
        dispatch(setChatImageUrl("", chatTypeKey));
        notification.error({
          message: "Image Upload Failed",
          description: "Something went wrong. Please try again.",
        });
      } catch (error) {
        clearLocalChatImagePreview();
        dispatch(setChatImageUrl("", chatTypeKey));
        dispatch(setShowChatLoader(false, chatTypeKey));
        notification.error({
          message: "Image Upload Failed",
          description:
            error?.response?.data?.message || "Unexpected error occurred",
        });
      } finally {
        setIsUploadingImage(false);
      }
    },
    [chatTypeKey, clearLocalChatImagePreview, dispatch],
  );

  const uploadImageProps = {
    accept: "image/*",
    multiple: false,
    customRequest: async ({ file, onSuccess, onError }) => {
      try {
        await handleUploadChatImage(file);
        onSuccess?.("ok");
      } catch (error) {
        onError?.(error);
      }
    },
  };

  const handleUploadImageModeChange = () => {
    handleClearChatImage();
    setShowUploadImage((value) => !value);
  };

  const handleFigmaUploadButtonClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFigmaUploadPanelOpen((value) => !value);
  };

  const handleFigmaImageUrlChange = (e) => {
    clearLocalChatImagePreview();
    setChatImagePreviewUrl(e.target.value);
    dispatch(setChatImageUrl(e.target.value, chatTypeKey));
  };

  return {
    showUploadImage,
    setShowUploadImage,
    isUploadingImage,
    chatImagePreviewUrl,
    setChatImagePreviewUrl,
    isFigmaUploadPanelOpen,
    setIsFigmaUploadPanelOpen,
    firstSubmittedImageUrl,
    setFirstSubmittedImageUrl,
    clearLocalChatImagePreview,
    handleClearChatImage,
    resetChatImageState,
    handleUploadChatImage,
    uploadImageProps,
    handleUploadImageModeChange,
    handleFigmaUploadButtonClick,
    handleFigmaImageUrlChange,
  };
};
