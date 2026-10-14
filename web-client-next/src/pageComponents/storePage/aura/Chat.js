import React, { useEffect, useMemo, useState } from "react";
import { Input, Form, Tooltip, Upload } from "antd";
import Image from "next/image";
import { CameraOutlined, ArrowRightOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";

import {
  setChatImageUrl,
  setChatMessage,
  setChatMute,
  setChatSearchType,
  setActiveSearchOption,
  setShowAuraIntro,
  setShowChatLoader,
  setAuraHelperMessage,
} from "../../../hooks/chat/redux/actions";
import header_aura from "../../../images/chat/header_aura_image_transparent.png";
import star_ai_icon_logo from "../../../images/unthink_star_ai_icon.svg";
import iconVolumeMute from "../../../images/chat/icon_volume_mute.svg";
import iconVolume from "../../../images/chat/icon_volume.svg";
import headerSearchIcon from "../../../images/chat/header_search_icon.svg";
import close_bg_icon from "../../../images/close_bg_icon.svg";
import AuraCameraSpinLoader from "../../../components/Loader/AuraCameraSpinLoader";
import {
  CHAT_SEARCH_OPTION_ID,
  CHAT_SEARCH_TYPES,
  CHAT_TYPES_KEYS,
  CHAT_TYPE_CHAT,
} from "../../../constants/codes";
import { availableChatSearchTypes as _availableChatSearchTypes } from "../../../constants/config";
import { profileAPIs } from "../../../helper/serverAPIs";
import { isEmpty } from "../../../helper/utils";
import { useRouter } from "next/router";

const Chat = ({
  localChatMessage,
  submitChatInput,
  onChatClick,
  chatInputMetadata,
  chatTypeKey = CHAT_TYPE_CHAT,
  availableChatSearchTypes = _availableChatSearchTypes,
  activeChatSearchType: __activeChatSearchType,
  showSpeaker = true,
  defaultActiveChatSearchType = _availableChatSearchTypes[0],
  typeSearchUIKey,
  config,
  isBTInstance,
  inputRef,
  isFollowUpQuery,
  showSubmitImageTooltip,
  setShowSubmitImageTooltip,
  isBTNormalUserLoggedIn,
  handleInputChange,
  handleSubmitChatInput,
}) => {
  const dispatch = useDispatch();
  const router = useRouter()
  const [
    chatMessage,
    chatImageUrl,
    isMute,
    showChatLoader,
    serverChatMessage,
    showChatModal,
    showException,
    exception,
    showAuraIntro,
    auraChatSetting,
    _activeChatSearchType,
    selectedSearchOption,
    searchOptions,
    authUser,
  ] = useSelector((state) => [
    state.chatV2[CHAT_TYPES_KEYS[chatTypeKey].chatMessage],
    state.chatV2[CHAT_TYPES_KEYS[chatTypeKey].chatImageUrl],
    state.chatV2.isMute,
    state.chatV2[CHAT_TYPES_KEYS[chatTypeKey].showChatLoader],
    state.chatV2.serverChatMessage,
    state.chatV2.showChatModal,
    state.chatV2.showException,
    state.chatV2.exception,
    state.chatV2.showAuraIntro,
    state.chatV2.auraChatSetting,
    state.chatV2.activeChatSearchType,
    state.chatV2.activeSearchOption,
    state.store.data.searchOptions || [],
    state.auth.user.data,
  ]);
  // console.log('_activeChatSearchType',_activeChatSearchType);
  

  const [auraCameraSpinLoader, setAuraCameraSpinLoader] = useState(false);

  const activeChatSearchType = __activeChatSearchType || _activeChatSearchType;

  // const aura_header_theme = config.aura_header_theme;

  // const mic_icon = aura_header_theme === "dark" ? header_mic_dark : header_mic;

  const handleChangeChatMessage = (message) => {
    dispatch(setChatMessage(message, chatTypeKey));
  };

  const handleSpeakerClick = () => {
    dispatch(setChatMute(!isMute));
  };

  useEffect(() => {
    if (!activeChatSearchType || !availableChatSearchTypes.includes(activeChatSearchType)) {
      dispatch(setChatSearchType(defaultActiveChatSearchType || availableChatSearchTypes[0]));
    }
  }, []);

  const activeSearchOption = useMemo(
    () => (!isEmpty(selectedSearchOption) ? selectedSearchOption : ''),
    [searchOptions, selectedSearchOption]
  );

  const smartSearchData = useMemo(() => searchOptions.find((v) => v.id === CHAT_SEARCH_OPTION_ID.smart_search), [searchOptions]);

  const productSearchData = useMemo(() => searchOptions.find((v) => v.id === CHAT_SEARCH_OPTION_ID.product_search), [searchOptions]);

  const TypeAuraUIRender = () => (
    <Tooltip title="Ask for an idea" placement="bottomLeft">
      <div
        className={`rounded-full cursor-pointer h-7 w-7 lg:h-9 lg:w-9 flex items-center justify-center transition-all duration-200 ${
              activeSearchOption?.id === CHAT_SEARCH_OPTION_ID.smart_search ? "p-1" : "border border-gray-300 p-1"
        }`}
        role="button"
        onClick={() => {
          handleChangeChatMessage("");
          dispatch(setActiveSearchOption(smartSearchData));
        }}>
        <img id={`header_chat_aura_${chatTypeKey}`} src={star_ai_icon_logo} className="rounded-full h-6 w-6 lg:h-8 lg:w-8" />
      </div>
    </Tooltip>
  );

  const TypeSearchUIRender = () => (
    <Tooltip title="Ask for a product" placement="bottomLeft">
      <div
        className={`rounded-full cursor-pointer h-7 w-7 lg:h-9 lg:w-9 flex items-center justify-center transition-all duration-200 ${
          activeSearchOption?.id === CHAT_SEARCH_OPTION_ID.product_search ? "bg-orange-500" : "border border-gray-300"
        }`}
        role="button"
        onClick={() => {
          dispatch(setActiveSearchOption(productSearchData));
        }}>
        <Image
          src={headerSearchIcon}
          height={18}
          width={18}
          alt="Search"
          className={`h-4 w-4 lg:h-5 lg:w-5 ${
            activeSearchOption?.id === CHAT_SEARCH_OPTION_ID.product_search ? "text-white" : "text-indigo-600"
          }`}
        />
      </div>
    </Tooltip>
  );

  const uploadProps = {
    accept: "image/*",
    multiple: false,
    customRequest: async (info) => {
      try {
        setAuraCameraSpinLoader(true);
        if (info?.file) {
          const response = await profileAPIs.uploadImage({ file: info.file });
          if (response?.data?.data[0]) {
            dispatch(setChatImageUrl(response?.data?.data[0].url, chatTypeKey));
            setAuraCameraSpinLoader(false);
            setShowSubmitImageTooltip(true);
            !chatMessage && dispatch(setChatMessage(activeSearchOption?.image_search_input));
          }
        }
      } catch (error) {
        dispatch(setShowChatLoader(false, chatTypeKey));
      }
    },
  };

  const cameraIcon =
    activeSearchOption.allow_image_search && showChatModal && !isFollowUpQuery ? (
      <div
        className={`relative flex justify-center items-center rounded-full ${chatImageUrl ? "bg-indigo-600" : ""} ${
          chatImageUrl || auraCameraSpinLoader ? "w-9 h-9" : ""
        }`}>
        <Upload
          {...uploadProps}
          showUploadList={false}
          className="cursor-pointer flex"
          onClick={() => {
            onChatClick && onChatClick();
            dispatch(setChatSearchType(CHAT_SEARCH_TYPES.CAMERA));
          }}>
          <CameraOutlined className={`${chatImageUrl ? "text-white" : "text-black"}`} />
        </Upload>
        {auraCameraSpinLoader ? (
          <div className="absolute">
            <AuraCameraSpinLoader />
          </div>
        ) : null}
      </div>
    ) : null;

  const searchIcon =
    chatImageUrl || chatMessage ? (
      <div className="flex justify-center items-center w-4 h-4">
        <ArrowRightOutlined
          className="text-black dark:text-white"
          onClick={!auraCameraSpinLoader ? handleSubmitChatInput : undefined}
          style={{ fontSize: "18px", fontWeight: "bold" }}
        />
      </div>
    ) : !isBTNormalUserLoggedIn ? (
      <div className="flex justify-center items-center w-4 h-4">
        <Image
          src={headerSearchIcon}
          height={18}
          width={18}
          alt="Search"
          className="text-black dark:text-white cursor-pointer"
          onClick={() => inputRef.current.focus()}
        />
      </div>
    ) : null;

  const inputControls = useMemo(() => {
    return [cameraIcon, searchIcon].filter((icon) => icon !== null).map((icon, index) => (
      <div key={`input-control-${index}`}>{icon}</div>
    ));
  }, [cameraIcon, searchIcon]);

  return (
    <>
      <div id={`header_chat_container_${chatTypeKey}`} className="flex items-center gap-2 lg:gap-3 w-full">
        <div
          id={`chat_search_input_container_${chatTypeKey}`}
          className={`flex items-center justify-center rounded-full bg-white px-2 w-full shadow-sm relative h-10 md:h-12 ${
            !isBTInstance ? "border border-gray-300" : ""
          }`}
          onClick={() => {
            router.push("/search");
            showAuraIntro && dispatch(setShowAuraIntro(false));
            // onChatClick && onChatClick();
          }}>
          {isBTNormalUserLoggedIn ? (
            <div className="h-10">
              <div className={`flex items-center border border-brand rounded-full gap-1 p-1 ${
                // aura_header_theme === "dark" ? "bg-gray-100 border-gray-100" : ""
                ''
              }`}>
                <TypeAuraUIRender />
                <TypeSearchUIRender />
              </div>
            </div>
          ) : null}

          {inputControls?.length && !showChatModal ? (
            <div className="flex items-center gap-2 pl-0">
              <div className={`h-7 
                `}
                 />
              {inputControls}
            </div>
          ) : null}

          <div className="w-full relative flex h-11 md:h-14 items-center">
            <Form
              id={`chat_search_input_content_${chatTypeKey}`}
              onFinish={!auraCameraSpinLoader ? handleSubmitChatInput : undefined}
              className={`w-full transition-opacity opacity-100 z-10 pl-4`}>
              <Input
                id={`chat_search_input_${chatTypeKey}`}
                type="text"
                ref={inputRef}
                placeholder={
                  isBTNormalUserLoggedIn
                    ? activeSearchOption.description
                    : (typeof activeSearchOption?.text_placeholder === "string"
                        ? activeSearchOption?.text_placeholder
                        : activeSearchOption?.text_placeholder?.[0]) || "Type or speak to AURA"
                }
                name="chat_message"
                value={localChatMessage}
                onChange={handleInputChange}
                className={`rounded-full bg-transparent border-none w-full outline-none text-black dark:text-white text-lg`}
                allowClear
                style={{ fontSize: "16px" }}
              />
            </Form>
          </div>

          {inputControls?.length && showChatModal ? (
            <div className="flex items-center gap-1 pr-4 pl-1 md:gap-1 md:pr-4">
              <div className={`h-7 `}
 
                 />
              {inputControls}
            </div>
          ) : null}

          {showSubmitImageTooltip ? (
            <div className="bg-black/80 p-4 rounded-md text-white opacity-80" onClick={(e) => e.stopPropagation()}>
              <div className="rounded-full float-right">
                <Image
                  className="cursor-pointer"
                  src={close_bg_icon}
                  width={24}
                  height={24}
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowSubmitImageTooltip(false);
                  }}
                />
              </div>
              <p className="text-sm leading-5 text-white">
                Please enter relevant text related to the selected image and click here or press enter to initiate the search.
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
};

export default Chat;
