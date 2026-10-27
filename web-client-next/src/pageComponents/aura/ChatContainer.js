import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useDispatch, useSelector } from "react-redux";
import { SettingOutlined } from "@ant-design/icons";
import {
  AURA_CLICK,
  CHAT_SEARCH_OPTION_ID,
  CHAT_TYPE_CHAT,
  CHAT_TYPES_KEYS,
  PARAM_SEARCH_TEXT,
  STORE_USER_NAME_BUDGETTRAVEL,
  STORE_USER_NAME_DOTHELOOK,
  STORE_USER_NAME_SWIFTLYSTYLED,
} from "../../constants/codes";
import { AdminCheck, getParams } from "../../helper/utils";
import {
  setChatMessage,
  setChatUserAction,
  setServerChatMessage,
  setChatProductsData,
  setShowChatModal,
  resetAuraSearchResponse,
  restoreAuraSearchResponse,
} from "../../hooks/chat/redux/actions";
import { useChat } from "../../hooks/chat/useChat";
import Chat from "./Chat";
import ChatModal from "./components/overlay/ChatModal";
import AuraChatSettingModal from "../auraChatSettingModal";
import { adminUserId, current_store_name, is_store_instance, super_admin } from "../../constants/config";
import { useRouter } from "next/router";
import {
  getActiveSearchOption,
  getAuraChatInputMetadata,
  getAuraChatSettingMode,
} from "./utils/AuraUtils";

const defaultHiMessage = "Hi";

const ChatContainer = ({ disabledOutSideClick, config, trackCollectionData, isBTInstance, isAuraChatPage = false, renderInline = false }) => {
  const [
    user,
    userDataSent,
    showChatModal,
    chatMessage,
    userAction,
    auraChatSetting,
    widgetHeaderRequest,
    selectedSearchOption,
    chatImageUrl,
    searchOptions,
    admin_list,
    storeData,
    chatProductsData,
    products,
    shopALookData,
    suggestionsWithProducts,
    widgetHeader,
    widgetImage,
    lastAuraResponse,
  ] = useSelector((state) => [
    state.auth.user,
    state.chatV2.userDataSent,
    state.chatV2.showChatModal,
    state.chatV2.chatMessage,
    state.chatV2.userAction,
    state.chatV2.auraChatSetting,
    state.chatV2.widgetHeaderRequest,
    state.chatV2.activeSearchOption || {},
    state.chatV2[CHAT_TYPES_KEYS[CHAT_TYPE_CHAT].chatImageUrl],
    state.store.data.searchOptions || [],
    state.store.data.admin_list,
    state.store.data,
    state.chatV2.chatProductsData || [],
    state.chatV2[CHAT_TYPES_KEYS[CHAT_TYPE_CHAT].products] || {},
    state.chatV2[CHAT_TYPES_KEYS[CHAT_TYPE_CHAT].shopALook] || {},
    state.chatV2.suggestions || {},
    state.chatV2.widgetHeader,
    state.chatV2.widgetImage,
    state.chatV2.lastAuraResponse,
  ]);
  

  const dispatch = useDispatch();
  const inputRef = useRef(null);
  const auraSearchText = getParams(PARAM_SEARCH_TEXT);
  const [settingModalOpen, setSettingModalOpen] = useState(false);
  const [isFollowUpQuery, setIsFollowUpQuery] = useState(true);
  const [showSubmitImageTooltip, setShowSubmitImageTooltip] = useState(false);
  const [portalTarget, setPortalTarget] = useState(null);

  const closeChatModal = () => dispatch(setShowChatModal(false));
  const openChatModal = () => dispatch(setShowChatModal(true));
  const openSettingModal = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setSettingModalOpen(true);
  };
  const closeSettingModal = () => setSettingModalOpen(false);

  const { sendMessage, sendShopALookImageUrl } = useChat();
  const setMessage = (message) => dispatch(setChatMessage(message));
  const hasExistingAuraResponse =
    Boolean(widgetHeader) ||
    Boolean(widgetImage) ||
    chatProductsData.length > 0 ||
    Object.keys(products).length > 0 ||
    Object.keys(shopALookData).length > 0 ||
    (suggestionsWithProducts?.allProductList?.length ?? 0) > 0;
  const hasProductResponse =
    chatProductsData.length > 0 ||
    Object.keys(products).length > 0 ||
    Object.keys(shopALookData).length > 0 ||
    (suggestionsWithProducts?.allProductList?.length ?? 0) > 0;
  const hasLastProductResponse =
    (lastAuraResponse?.chatProductsData?.length ?? 0) > 0 ||
    Object.keys(lastAuraResponse?.products || {}).length > 0 ||
    Object.keys(lastAuraResponse?.shopALook || {}).length > 0 ||
    (lastAuraResponse?.suggestions?.allProductList?.length ?? 0) > 0;

  useEffect(() => {
    if (!isAuraChatPage || hasProductResponse || !hasLastProductResponse) {
      return;
    }

    dispatch(restoreAuraSearchResponse());
  }, [dispatch, hasLastProductResponse, hasProductResponse, isAuraChatPage]);

  const isAdminLoggedIn = AdminCheck(user?.data, current_store_name, adminUserId, admin_list);

  const isStoreAdminLoggedIn = useMemo(
    () => is_store_instance && user.data?.user_name && user.data?.user_name === super_admin,
    [user.data?.user_name]
  );

  const showSettings = useMemo(() => (is_store_instance && isStoreAdminLoggedIn) || isAdminLoggedIn, [isStoreAdminLoggedIn, isAdminLoggedIn]);

  const isBTNormalUserLoggedIn = useMemo(() => isBTInstance === STORE_USER_NAME_BUDGETTRAVEL, [isBTInstance]);

  const activeSearchOption = useMemo(
    () => getActiveSearchOption(selectedSearchOption),
    [selectedSearchOption]
  );

  const isSendSTLTemplates = useMemo(() => showSettings && activeSearchOption.id === CHAT_SEARCH_OPTION_ID.shop_a_look, [showSettings, activeSearchOption.id]);
  const isSendCTLTemplates = useMemo(() => showSettings && activeSearchOption.id === CHAT_SEARCH_OPTION_ID.complete_the_look, [showSettings, activeSearchOption.id]);
  const isSendSSTemplates = useMemo(() => showSettings && activeSearchOption.id === CHAT_SEARCH_OPTION_ID.smart_search, [showSettings, activeSearchOption.id]);

  useEffect(() => {
    const refParam = getParams("ref");
    if (refParam === "aura") dispatch(setShowChatModal(true));
  }, []);

  // useEffect(() => {
  //   if (!isAuraChatPage) return;

  //   dispatch(setShowChatModal(true));
  //   dispatch(resetAuraSearchResponse());
  //   dispatch(setChatMessage(""));
  //   dispatch(setServerChatMessage(""));
  //   dispatch(setChatProductsData([]));
  // }, [dispatch, isAuraChatPage]);
  useEffect(() => {
    if (widgetHeaderRequest?.metadata?.searchOptionId !== activeSearchOption?.id) setIsFollowUpQuery(false);
  }, [widgetHeaderRequest?.metadata?.searchOptionId, activeSearchOption?.id]);

  const submitChatInput = (message = chatMessage, chatImageUrl, metadata, userMetadata, imageGenerate, nextPage, ipp, currentPage, moreSearch_next_page, recommendationSearch_next_page) => {
    const normalizedMessage = typeof message === "string" ? message.trim() : message;
    const shouldSendMessageText = normalizedMessage && normalizedMessage !== selectedSearchOption?.image_search_input;
    if (shouldSendMessageText || chatImageUrl) {
      if (normalizedMessage === auraSearchText) {
        sendFinalMessage(normalizedMessage, metadata);
      } else {
        setMessage(normalizedMessage || "");
        sendMessage(
          shouldSendMessageText ? normalizedMessage : undefined,
          chatImageUrl ?? "",
          metadata,
          userMetadata,
          imageGenerate,
          nextPage,
          ipp,
          currentPage,
          moreSearch_next_page,
          recommendationSearch_next_page
        );
      }
    }
  };

  const sendFinalMessage = (message = chatMessage, metadata) => {
    setMessage(message);
    sendMessage(message, metadata);
    dispatch(setChatProductsData([]));
  };

  useEffect(() => {
    if (isAuraChatPage) return;

    if (user?.data?.user_id && userDataSent) {
      if (auraSearchText) {
      } else {
        if (hasExistingAuraResponse) return;

        sendFinalMessage(defaultHiMessage);
        dispatch(setChatMessage(chatMessage));
        dispatch(setServerChatMessage(""));
        dispatch(setChatProductsData([]));
      }
    }
  }, [
    auraSearchText,
    isAuraChatPage,
    user?.data?.user_id,
    userDataSent,
    widgetHeader,
    widgetImage,
    chatProductsData.length,
    products,
    shopALookData,
    suggestionsWithProducts?.allProductList?.length,
  ]);

  const chatInputMetadata = useMemo(
    () =>
      getAuraChatInputMetadata({
        activeSearchOption,
        auraChatSetting,
        isFollowUpQuery,
        isSendCTLTemplates,
        isSendSSTemplates,
        isSendSTLTemplates,
      }),
    [showSettings, activeSearchOption?.id, JSON.stringify(auraChatSetting), isSendSTLTemplates, isSendCTLTemplates, auraChatSetting, isFollowUpQuery, chatImageUrl]
  );
  const router = useRouter();
  const isHomePage = router.pathname === "/";
  const isNotHomePage = router.pathname ==='/search'
  const shouldShowChatModal = isAuraChatPage || (showChatModal && !isHomePage);

  useEffect(() => {
    if (userAction) {
      if (userAction === AURA_CLICK) {
        dispatch(setShowChatModal(true));
      }
      dispatch(setChatUserAction(""));
    }
  }, [userAction]);

  useEffect(() => setPortalTarget(document.body), []);

  const onChatClick = () => {
    if (!showChatModal) {
      dispatch(setShowChatModal(true));
      dispatch(resetAuraSearchResponse());
    }
  };

  const auraChatSettingMode = useMemo(() => {
    return getAuraChatSettingMode(activeSearchOption);
  }, [activeSearchOption.id]);
  

  const isSwiftlyStyledInstance = is_store_instance && current_store_name === STORE_USER_NAME_SWIFTLYSTYLED;
  const isDoTheLookInstance = is_store_instance && current_store_name === STORE_USER_NAME_DOTHELOOK;

  const chatModalLayer = (
    <>
      <div className="inset-0 z-30 ">
        <ChatModal
          submitChatInput={submitChatInput}
          disabledOutSideClick={disabledOutSideClick}
          showSettings={showSettings}
          openSettingModal={openSettingModal}
          chatInputMetadata={chatInputMetadata}
          chatTypeKey={CHAT_TYPE_CHAT}
          config={config}
          trackCollectionData={trackCollectionData}
          isBTInstance={isBTInstance}
          inputRef={inputRef}
          isFollowUpQuery={isFollowUpQuery}
          setIsFollowUpQuery={setIsFollowUpQuery}
          widgetHeaderRequest={widgetHeaderRequest}
          showSubmitImageTooltip={showSubmitImageTooltip}
          setShowSubmitImageTooltip={setShowSubmitImageTooltip}
          isBTNormalUserLoggedIn={isBTNormalUserLoggedIn}
          isAuraChatPage={isAuraChatPage}
        />
      </div>
      <AuraChatSettingModal isOpen={settingModalOpen} onClose={closeSettingModal} mode={auraChatSettingMode} />
    </>
  );
 
  return (
    <>
      {!renderInline && storeData?.is_searchOptions_enabled ? (
        <div className={`${!isNotHomePage ? 'hidden lg:flex justify-center items-center gap-2 mx-1 lg:gap-3 lg:w-[512px] xl:w-1/2' : 'hidden'} `}>
          <Chat
            submitChatInput={submitChatInput}
            onChatClick={onChatClick}
            chatInputMetadata={chatInputMetadata}
            config={config}
            isBTInstance={isBTInstance}
            inputRef={inputRef}
            isFollowUpQuery={isFollowUpQuery}
            showSubmitImageTooltip={showSubmitImageTooltip}
            setShowSubmitImageTooltip={setShowSubmitImageTooltip}
            isBTNormalUserLoggedIn={isBTNormalUserLoggedIn}
          />
        </div>
      ) : !renderInline ? (
        <div className="hidden lg:flex justify-center items-center gap-2 mx-1 lg:gap-3 lg:w-[442px] xl:w-1/2" />
      ) : null}
      {renderInline && shouldShowChatModal ? chatModalLayer : null}
      {!renderInline && portalTarget && shouldShowChatModal && isNotHomePage ? createPortal(chatModalLayer, portalTarget) : null}
    </>
  );
};

export default ChatContainer;
