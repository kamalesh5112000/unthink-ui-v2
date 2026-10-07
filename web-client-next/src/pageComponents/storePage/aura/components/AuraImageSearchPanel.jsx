import React from "react";
import {
  LinkOutlined,
  LoadingOutlined,
  PictureOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { Spin, Tooltip, Upload } from "antd";
import { Badge } from "antd";
import CameraCapture from "../../../../components/shared/CameraCapture";

const { Dragger } = Upload;

const ORIGINAL_IMAGE_WIDTH = 1024;
const ORIGINAL_IMAGE_HEIGHT = 1027;
const PREVIEW_IMAGE_WIDTH = 404;
const PREVIEW_IMAGE_HEIGHT = 400;

const AuraImageSearchPanel = ({
  allowImageSearch = false,
  auraOverlayCoordinates,
  chatImageUrl,
  handleChangeImageConfirm,
  handleFigmaImageUrlChange,
  handleSuggestionClick,
  handleUploadChatImage,
  isUploadingImage = false,
  uploadImageProps,
}) => {
  if (!allowImageSearch) return null;

  return (
    <>
      <div
        className={
          chatImageUrl
            ? ""
            : "aura-figma-upload-popover mb-5 z-20 min-w-[350px] w-96  rounded-2xl border border-accent bg-white p-6 shadow-lg  "
        }
      >
        {chatImageUrl ? (
          <div className="relative ">
            <img
              src={chatImageUrl}
              alt="Uploaded Image"
              className="lg:h-80 lg:w-80  shadow-md  lg:max-h-[420px] max-h-[320px] max-w-[320px] max-lg:w-[420px]  rounded-[20px] object-contain   "
            />
            {Array.isArray(auraOverlayCoordinates) &&
              auraOverlayCoordinates.map((item, index) => {
                const adjustedX =
                  (item.point[0] / ORIGINAL_IMAGE_WIDTH) * PREVIEW_IMAGE_WIDTH;
                const adjustedY =
                  (item.point[1] / ORIGINAL_IMAGE_HEIGHT) *
                  PREVIEW_IMAGE_HEIGHT;

                return (
                  <Tooltip
                    key={index}
                    title={item.attributes.label}
                    color="blue"
                  >
                    <div
                      onClick={() =>
                        handleSuggestionClick(item.attributes.label)
                      }
                      className="absolute z-20 h-5 w-5 animate-pulse cursor-pointer rounded-full border-2 border-gradient bg-blue-500"
                      style={{
                        left: `${adjustedX}px`,
                        top: `${adjustedY}px`,
                        boxShadow: "0 0 10px rgba(0, 123, 255, 0.8)",
                      }}
                    />
                  </Tooltip>
                );
              })}
            <div className="flex w-full justify-center">
              <button
                type="button"
                onClick={handleChangeImageConfirm}
                className="border-gradient text-highlight my-4 w-fit cursor-pointer rounded-full px-5 py-2 text-sm font-semibold"
              >
                Change Image
              </button>
            </div>
          </div>
        ) : isUploadingImage ? (
          <div className="flex h-[129px] items-center justify-center md:h-[188px]">
            <Spin
              className="mx-auto w-full"
              indicator={
                <LoadingOutlined
                  style={{ fontSize: 26 }}
                  className="text-brand"
                  spin
                />
              }
              spinning={isUploadingImage}
            />
          </div>
        ) : (
          <CameraCapture
            onCapture={handleUploadChatImage}
            switchButtonLabel="Switch"
            switchingButtonLabel="Switching"
            panelClassName="flex w-full flex-col items-center gap-3"
            videoClassName="aspect-[4/3] w-full max-w-xs rounded-2xl bg-gray-900 object-cover"
            actionsClassName="flex w-full flex-wrap justify-center gap-2"
            secondaryButtonClassName="inline-flex min-h-[2.35rem] cursor-pointer items-center justify-center gap-1.5 rounded-xl border-[1.5px] border-secondary/30 bg-white px-3 py-2 text-sm font-semibold leading-none text-slate-600 transition-all duration-200 hover:-translate-y-px hover:border-secondary/60 hover:bg-tertiary disabled:cursor-not-allowed disabled:opacity-60 disabled:transform-none"
            primaryButtonClassName="inline-flex min-h-[2.35rem] cursor-pointer items-center justify-center gap-1.5 rounded-xl border-[1.5px] border-brand bg-brand px-3 py-2 text-sm font-semibold leading-none text-white transition-all duration-200 hover:-translate-y-px hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-60 disabled:transform-none"
            renderIdle={({
              openCamera,
              isCameraStarting,
              CameraIcon,
              LoadingIcon,
            }) => (
              <>
                <div className="w-full ">
                  <Dragger
                    className="aura-image-upload-dragger"
                    {...uploadImageProps}
                    name="image_url"
                    showUploadList={false}
                  >
                    <p className="my-2 text-4xl leading-none text-brand">
                      <div className="relative inline-flex">
                        {/* Base Image Icon */}
                        <PictureOutlined className="text-4xl text-brand" />

                        {/* Overlapping Plus Badge */}
                        <div className="absolute -bottom-1 -right-1 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-brand">
                          <PlusOutlined className="text-[10px] font-bold text-white stroke-2" />
                        </div>
                      </div>
                    </p>
                    <p className="mb-0 text-center text-[0.95rem] font-medium leading-snug text-highlight [&_span]:font-bold">
                      <span className="text-brand font-semibold ">
                        Click to upload
                      </span>{" "}
                      or drag and drop
                    </p>
                    <p className="my-2 text-xs font-semibold text-slate-400">
                      JPG, JPEG, PNG less than 2MB
                    </p>
                  </Dragger>
                </div>

                <p className="my-2 text-center text-sm font-medium leading-none text-slate-400">
                  or
                </p>
                <button
                  type="button"
                  onClick={openCamera}
                  disabled={isCameraStarting}
                  className="aura-take-photo-button border-gradient rounded-xl inline-flex min-h-10 w-full cursor-pointer items-center justify-center gap-2 text-sm font-bold shadow-md transition-all duration-200 hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-60 disabled:transform-none"
                >
                  {isCameraStarting ? (
                    <LoadingIcon className="text-brand" />
                  ) : (
                    <CameraIcon className="stroke-current stroke-2 text-brand" />
                  )}
                  Take Photo
                </button>
                <p className="my-2 text-center text-sm font-medium leading-none text-slate-400">
                  or
                </p>
                <div className="w-full">
                  <div className="relative">
                    <LinkOutlined className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-[17px] text-slate-500" />
                    <input
                      className="h-10 w-full rounded-xl border-[1.5px] border-secondary/20 bg-white/80 px-3 pl-11 text-sm font-semibold text-slate-600 outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-secondary/60 focus:bg-white focus:shadow-[0_0_0_3px_theme(colors.accent/12%)]"
                      placeholder="Image URL"
                      type="text"
                      value={chatImageUrl}
                      onChange={handleFigmaImageUrlChange}
                    />
                  </div>
                </div>
              </>
            )}
          />
        )}
      </div>
    </>
  );
};

export default AuraImageSearchPanel;
