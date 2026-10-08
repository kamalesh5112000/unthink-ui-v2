import { Loading3QuartersOutlined, ReloadOutlined } from "@ant-design/icons";
import { Tooltip } from "antd";
import React from "react";
import { FiRefreshCw } from "react-icons/fi";

import AuraInputBox from "../../AuraInputBox";

const AuraMainContent = ({
  activeSearchOption,
  auraOverlayCoordinates,
  auraServerImage,
  chatHistory = [],
  chatImagePreviewUrl,
  chatImageUrl,
  chatTypeKey,
  handleClearChatImage,
  handleInputChange,
  handlePromptKeyDown,
  handleRegenrateImage,
  handleSubmitChatInput,
  handleSuggestionClick,
  handleTryAgainClick,
  inputRef,
  isDescriptionExpanded,
  isFollowUpQuery,
  isImageLoading,
  isShowFollowUpSearch,
  isShowTryAgain,
  isUploadingImage,
  layoutMode,
  localChatMessage,
  originalHeight,
  originalWidth,
  regenarateImage,
  setIsDescriptionExpanded,
  shopLookKeywords = [],
  shopLookPreviewImage,
  shouldMoveInputBelowResults,
 
  showChatLoader,
  storeData,
  uploadImageProps,
  widgetHeader,
}) => {
  const imageSrc = auraServerImage || shopLookPreviewImage;
  const shouldShowImageLoader =
    storeData?.plan_settings?.image_generate?.is_enable &&
    !auraServerImage &&
    isImageLoading &&
    !regenarateImage;
  const shouldShowRegenerate =
    isFollowUpQuery &&
    isShowFollowUpSearch &&
    chatHistory.length >= 2 &&
    imageSrc &&
    regenarateImage;
  const descriptionCollapsedClass = isDescriptionExpanded
    ? ""
    : imageSrc
      ? "line-clamp-2"
      : "line-clamp-7 lg:line-clamp-9";

  return (
    <div
      id="aura-description-section"
      className="box-border flex h-[70vh] 2xl:h-[80vh] w-full  flex-col   rounded-2xl border border-gray-300   p-2 shadow-sm   "
    >
 
        <div className=" z-10 mb-4 flex h-16 shrink-0 items-center border-b border-gray-100/80 bg-white py-3">
          <h2 className="m-0 pl-1 text-lg font-semibold uppercase tracking-wide text-slate-950 md:text-2xl">
            {activeSearchOption?.title?.toUpperCase()}
          </h2>
        </div>
 

     
        <div className="h-full overflow-y-scroll ">
          {shouldShowImageLoader ? (
            <div className="relative mx-auto aspect-[11/10] w-full max-w-xs overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-sm sm:max-w-sm md:max-w-md lg:max-h-[52vh] lg:max-w-lg xl:max-h-[58vh]">
              <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-secondary">
                Loading image...
              </div>
            </div>
          ) : imageSrc ? (
            <div className="relative mx-auto aspect-[11/10] w-full max-w-xs overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-sm sm:max-w-sm md:max-w-md lg:max-h-[52vh] lg:max-w-lg xl:max-h-[58vh]">
              <div className="relative flex h-full w-full items-center justify-center">
                <img
                  src={imageSrc}
                  alt="PreviewImage"
                  className="max-h-full max-w-full object-contain"
                />
                {Array.isArray(auraOverlayCoordinates) &&
                  auraOverlayCoordinates.map((item, index) => {
                    const leftPercent = (item.point[0] / originalWidth) * 100;
                    const topPercent = (item.point[1] / originalHeight) * 100;

                    return (
                      <Tooltip
                        key={index}
                        title={item.attributes.label}
                        color="blue"
                      >
                        <div
                          onClick={() => handleSuggestionClick(item.attributes.label)}
                          className="absolute h-3.5 w-3.5 cursor-pointer rounded-full border-2 border-white bg-secondary shadow-md hover:bg-brand"
                          style={{
                            left: `${leftPercent}%`,
                            top: `${topPercent}%`,
                          }}
                        />
                      </Tooltip>
                    );
                  })}
              </div>
            </div>
          ) : null}

          {shouldShowRegenerate ? (
            <button
              type="button"
              className="mx-auto inline-flex items-center justify-center gap-2 rounded-full border border-secondary/30 bg-white px-4 py-2 text-sm font-semibold text-secondary hover:bg-secondary/10"
              onClick={handleRegenrateImage}
            >
              <ReloadOutlined />
              Regenerate Image
            </button>
          ) : null}         
     
              {widgetHeader ||  shopLookKeywords.length > 0  ? (
                <div className="  h-full">
                  {showChatLoader ? (
                    <div className="flex w-full flex-col items-center justify-center gap-3 py-6">
                      <Loading3QuartersOutlined className="text-2xl text-secondary" />
                      <span className="text-sm font-medium tracking-wide text-secondary">
                        Loading new description...
                      </span>
                    </div>
                  ) : (
                   <div className="text-xs font-normal leading-relaxed tracking-normal text-slate-700 md:text-sm lg:text-base">
  <div
    className={`whitespace-pre-line ${descriptionCollapsedClass}`}
    dangerouslySetInnerHTML={{ __html: widgetHeader }}
  />

  {!showChatLoader && widgetHeader?.length > 80 && (
    <button
      type="button"
      className="my-1 cursor-pointer text-xs font-semibold text-secondary hover:text-brand hover:underline md:text-sm"
      onClick={() =>
        setIsDescriptionExpanded((prev) => !prev)
      }
    >
      {isDescriptionExpanded ? "Read Less" : "Read More"}
    </button>
  )}
</div>


                  )}

                  
                   

                    {shopLookKeywords.length && layoutMode === "left" ? (
                      <div className="mt-1 mb-2 flex flex-wrap gap-2">
                        {shopLookKeywords.map((keyword) => (
                          <span
                            key={keyword}
                            className="rounded-full bg-secondary/10 px-2.5 py-1 text-xs text-slate-600"
                          >
                            {keyword}
                          </span>
                        ))}
                      </div>
                    ) : null}
                    
                    <div className="hidden w-full">
                      {isShowTryAgain && (
                        <div className="m-auto w-full md:w-72">
                          <div className="flex flex-col items-center rounded-2xl border border-purple-200 bg-purple-50 p-6 text-center">
                            <p className="text-base font-medium text-slate-700">
                              Need different suggestions?
                            </p>
                            <button
                              type="button"
                              onClick={handleTryAgainClick}
                              disabled={showChatLoader}
                              className="mt-4 flex items-center justify-center gap-2 rounded-full bg-secondary px-6 py-3 font-semibold text-white hover:bg-brand focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <FiRefreshCw className="h-5 w-5" />
                              <span>Regenerate with AI</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                 
                </div>
              ) : null}
        </div>

              {shouldMoveInputBelowResults ? (
                <div className="relative h-20">
                  <AuraInputBox
                    showChatLoader={showChatLoader}
                    uploadImageProps={uploadImageProps}
                    chatImageUrl={chatImageUrl}
                    chatImagePreviewUrl={chatImagePreviewUrl}
                    isUploadingImage={isUploadingImage}
                    handleClearChatImage={handleClearChatImage}
                    activeSearchOption={activeSearchOption}
                    chatTypeKey={chatTypeKey}
                    inputRef={inputRef}
                    localChatMessage={localChatMessage}
                    handleInputChange={handleInputChange}
                    handlePromptKeyDown={handlePromptKeyDown}
                    handleSubmitChatInput={handleSubmitChatInput}
                    isFollowUpQuery={isFollowUpQuery}
                  />
                </div>
              ) : null}
            
         
       
    </div>
  );
};

export default AuraMainContent;
