import React, { useEffect } from "react";
import { Upload } from "antd";
import {
  CloseCircleFilled,
  PlusOutlined,
  ArrowUpOutlined,
  LoadingOutlined,
} from "@ant-design/icons";

const AuraInputBox = ({
  showChatLoader = false,
  isShopByThemeOptionActive = false,
  isCompleteTheLookOptionActive = false,
  uploadImageProps = {},
  chatImageUrl = "",
  chatImagePreviewUrl = "",
  isUploadingImage = false,
  handleClearChatImage = () => {},
  activeSearchOption = {},
  chatTypeKey = "",
  inputRef = null,
  localChatMessage = "",
  handleInputChange = () => {},
  handlePromptKeyDown = () => {},
  isShopALookOptionActive = false,
  handleSubmitChatInput = () => {},
  isFollowUpQuery,
  isDrawer = false,
}) => {
  const previewImageUrl = chatImagePreviewUrl || chatImageUrl;
  const isSubmitDisabled =
    showChatLoader ||
    isUploadingImage ||
    (isShopALookOptionActive
      ? !chatImageUrl
      : !localChatMessage && !chatImageUrl);

  useEffect(() => {
    if (typeof window === "undefined") return;
    let el = null;
    if (
      inputRef?.current &&
      inputRef.current.tagName === "TEXTAREA" &&
      !isDrawer
    ) {
      el = inputRef.current;
    } else {
      el = document.getElementById(
        isDrawer
          ? `chat_search_input_bottom_${chatTypeKey}_drawer`
          : `chat_search_input_bottom_${chatTypeKey}`,
      );
    }
    if (el && el.style) {
      try {
        el.style.height = "auto";
        el.style.height = `${el.scrollHeight}px`;
      } catch {
        // The textarea can unmount while drawer state changes.
      }
    }
  }, [localChatMessage, inputRef, chatTypeKey, isDrawer]);

  const onTextareaKeyDown = (e) => {
    if (e.key === "Enter") {
      if (!e.shiftKey) {
        e.preventDefault();
        handleSubmitChatInput();
      }
      return;
    }

    if (typeof handlePromptKeyDown === "function") {
      handlePromptKeyDown(e);
    }
  };

  return (
    <div className="absolute bottom-0 left-0  box-border w-full border-t-0 bg-white px-1  ">
      <div
        className={`${
          isDrawer
            ? "w-full rounded-[18px] border border-secondary/25 bg-white px-3 py-2 shadow-[0_4px_12px_rgba(150,144,240,0.06)] box-border focus-within:border-secondary focus-within:shadow-[0_4px_16px_rgba(150,144,240,0.15)]"
            : "w-full rounded-[25px] border border-brand/15 bg-white px-4 py-2.5 shadow-[0_10px_25px_-5px_rgba(114,104,236,0.08),0_8px_10px_-6px_rgba(114,104,236,0.05)] focus-within:border-secondary focus-within:shadow-[0_4px_20px_rgba(114,104,236,0.15)] max-[1024px]:flex max-[1024px]:items-center max-[1024px]:gap-2 max-[1024px]:px-4 max-[1024px]:py-2.5"
        } ${
          isShopByThemeOptionActive || isCompleteTheLookOptionActive
            ? "border-accent px-2.5 py-2 relative"
            : ""
        }`}
      >
        <div className="relative w-full items-center">
          {previewImageUrl && (
            <div className="flex items-center pb-2">
              <div className="relative h-[58px] w-[58px] overflow-visible rounded-lg border border-[#1114151f] bg-[#f7f7fb] shadow-[0_4px_12px_rgba(17,20,21,0.08)]">
                <img
                  className="block h-full w-full rounded-lg object-cover"
                  src={previewImageUrl}
                  alt="Uploaded preview"
                />
                {isUploadingImage && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-white/70 text-xl text-secondary">
                    <LoadingOutlined />
                  </div>
                )}
                <button
                  type="button"
                  className="absolute -right-2 -top-2 inline-flex h-5 w-5 cursor-pointer items-center justify-center rounded-full border-none bg-white p-0 text-[#2f3652] shadow-[0_2px_8px_rgba(17,20,21,0.2)] disabled:cursor-not-allowed disabled:opacity-60"
                  onClick={handleClearChatImage}
                  aria-label="Remove uploaded image"
                  disabled={showChatLoader || isUploadingImage}
                >
                  <CloseCircleFilled />
                </button>
              </div>
            </div>
          )}

          <textarea
            id={
              isDrawer
                ? `chat_search_input_bottom_${chatTypeKey}_drawer`
                : `chat_search_input_bottom_${chatTypeKey}`
            }
            ref={isDrawer ? null : inputRef}
            rows={1}
            placeholder={
              typeof activeSearchOption?.text_placeholder === "string" &&
              !isFollowUpQuery
                ? activeSearchOption?.text_placeholder
                : "Ask a follow up..."
            }
            name="chat_message"
            value={localChatMessage}
            onChange={handleInputChange}
            onKeyDown={onTextareaKeyDown}
            className={
              isDrawer
                ? "w-full min-h-[38px] max-h-[120px] resize-none overflow-hidden border-none bg-transparent px-0 py-1 text-sm font-medium leading-relaxed text-[#1a1a1a] outline-none placeholder:text-[13px] placeholder:font-normal placeholder:text-[#8a8fa3]"
                : "w-full min-h-[38px] max-h-[120px] resize-none overflow-hidden border-none bg-transparent px-0 py-1 text-base font-medium leading-6 text-[#1a1a1a] outline-none placeholder:text-[#6b7288] placeholder:font-normal max-[1024px]:flex-1 max-[1024px]:text-base max-[1024px]:font-bold"
            }
          />
          {!(
            isCompleteTheLookOptionActive ||
            activeSearchOption?.allow_image_search
          ) && (
            <button
              type="button"
              className={`absolute right-2 top-1/2 inline-flex -translate-y-1/2 items-center gap-1.5 h-[34px] w-[34px] shrink-0 cursor-pointer justify-center rounded-full border-none bg-secondary text-[1.1rem] text-white shadow-[0_4px_12px_rgba(114,104,236,0.25)] disabled:cursor-not-allowed disabled:bg-[#b9b5ef] ${isShopByThemeOptionActive ? "h-7 w-7 bg-[#b1a7fb] text-base disabled:bg-linear-to-tl disabled:from-accent disabled:to-brand" : ""}`}
              onClick={handleSubmitChatInput}
              disabled={isSubmitDisabled}
            >
              <ArrowUpOutlined />
            </button>
          )}
          {(activeSearchOption?.allow_image_search ||
            isCompleteTheLookOptionActive) && (
            <div
              className={`flex justify-between items-center border-t ${isDrawer ? "border-gray-200" : "border-gray-500"} pt-1.5`}
            >
              <div className="flex gap-3 items-center">
                {activeSearchOption?.allow_image_search && (
                  <div className="z-10">
                    <Upload
                      {...uploadImageProps}
                      showUploadList={false}
                      disabled={isUploadingImage || showChatLoader}
                    >
                      <button
                        type="button"
                        className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-brand/20 bg-white p-0 text-[1.1rem] font-semibold leading-none text-black shadow-[0_2px_8px_rgba(114,104,236,0.1)] disabled:cursor-not-allowed disabled:opacity-60 ${chatImageUrl ? "text-black" : ""}`}
                        title="Upload image"
                        disabled={isUploadingImage || showChatLoader}
                      >
                        {isUploadingImage ? (
                          <LoadingOutlined />
                        ) : (
                          <PlusOutlined />
                        )}
                      </button>
                    </Upload>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1.5 pr-2">
                <button
                  type="button"
                  className={`inline-flex h-[34px] w-[34px] shrink-0 cursor-pointer items-center justify-center rounded-full border-none bg-secondary text-[1.1rem] text-white shadow-md disabled:cursor-not-allowed disabled:bg-secondary/20  ${isShopByThemeOptionActive || isCompleteTheLookOptionActive ? "h-7 w-7 bg-secondary text-base disabled:bg-linear-to-tl disabled:from-accent disabled:to-brand" : ""}`}
                  onClick={handleSubmitChatInput}
                  disabled={isSubmitDisabled}
                >
                  <ArrowUpOutlined />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuraInputBox;
