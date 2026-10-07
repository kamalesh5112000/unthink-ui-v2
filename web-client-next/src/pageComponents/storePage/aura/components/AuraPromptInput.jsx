import React from "react";
import { ArrowUpOutlined } from "@ant-design/icons";

const AuraPromptInput = ({
  activeSearchOption = {},
  chatImageUrl = "",
  chatTypeKey = "",
  inputRef,
  isFollowUpQuery = false,
  isShopALookOptionActive = false,
  localChatMessage = "",
  onChange = () => {},
  onKeyDown = () => {},
  onSubmit = () => {},
  showChatLoader = false,


}) => {
  const hasPromptText = localChatMessage.trim().length > 0;
  const isSubmitDisabled =
    showChatLoader ||
    (isShopALookOptionActive ? !chatImageUrl : !hasPromptText && !chatImageUrl);
   
  

  return (
    <div className="w-full  bg-white p-2 rounded-4xl min-h-[40px] lg:min-h-[50px] max-md:min-h-[46px]">
      <div className="border-accent border-2 focus-gradient-ring w-full rounded-4xl p-2 shadow-md z-20 max-md:p-1.5">
        <div className="flex  items-center gap-3 rounded-[1.75rem] bg-white px-2  max-md:ps-3">
          <input
            id={`chat_search_input_${chatTypeKey}`}
            type="text"
            ref={inputRef}
            placeholder={
              typeof activeSearchOption?.text_placeholder === "string" &&
              !isFollowUpQuery
                ? activeSearchOption.text_placeholder
                : ""
            }
            name="chat_message"
            value={localChatMessage}
            onChange={onChange}
            onKeyDown={onKeyDown}
            className="w-full    px-0 py-2 text-base font-medium text-highlight outline-none placeholder:text-slate-400 max-md:pr-2 max-md:text-sm"
          />

          <button
            type="button"
            className={` h-12 w-12 shrink-0 items-center justify-center rounded-full border-0 text-xl text-white transition max-md:h-10 max-md:w-10 max-md:text-base ${
              isSubmitDisabled
                ? "gradient cursor-not-allowed opacity-45 shadow-none"
                : "gradient cursor-pointer shadow-md hover:-translate-y-px"
            }`}
            onClick={onSubmit}
            disabled={isSubmitDisabled}
          >
            <ArrowUpOutlined />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuraPromptInput;
