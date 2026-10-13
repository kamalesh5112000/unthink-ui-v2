import {
  ArrowLeftOutlined,
  CloseOutlined,
  FolderOutlined,
  FormOutlined,
  HistoryOutlined,
} from "@ant-design/icons";
import React from "react";
import { resetAuraSearchResponse } from "../../../../../hooks/chat/redux/actions";
import { useDispatch } from "react-redux";

const Sidebar = ({
  chatHistory = [],
  handleChangeImageConfirm,
  handleSelectPastChat,
  isHistoryOpen,
  layoutMode,
  onWishlistClick,
  setIsHistoryOpen,
  setLayoutMode,
}) => { 
  const dispatch = useDispatch(); 
  const handleGoBack = () => {
    // resetSearchSelectionState();
    dispatch(resetAuraSearchResponse());
    // setIsFollowUpQuery(false);
    sessionStorage.removeItem("widgetHeaderRequestHistory");
  };
  return (
    <>
      <div className=" hidden  lg:flex  lg:flex-col lg:w-[70px]  lg:items-center h-full ">
        <div className="flex-1 flex flex-col gap-8 items-center w-full justify-center">
       
        <div
          className="flex w-full p-1 cursor-pointer flex-col items-center rounded-lg   text-slate-900 hover:bg-slate-100 hover:text-slate-950"
          onClick={handleChangeImageConfirm}
        >
          <FormOutlined className="text-[20px]" />
          <span className="text-xs  font-medium text-center ">
            New Chat
          </span>
        </div>
        <div className="flex flex-col p-1 items-center gap-2   w-full relative select-none">
          <div className="flex h-8 w-16 items-center justify-between gap-0.5 rounded-xl border border-slate-200 bg-slate-100 p-1">
            <button
              onClick={() => setLayoutMode("left")}
              className={`flex h-7 w-5 cursor-pointer items-center justify-center rounded-lg ${
                layoutMode === "left"
                  ? "bg-white text-slate-900 hover:bg-white"
                  : "bg-transparent text-slate-400 hover:bg-slate-200 hover:text-slate-700"
              }`}
              title="Left View"
            >
              <div className="flex h-2.5 w-3.5 overflow-hidden rounded-sm border border-current">
                <div
                  className={`h-full w-2 border-r border-current ${layoutMode === "left" ? "bg-slate-200" : ""}`}
                />
                <div className="flex-1 h-full" />
              </div>
            </button>
            <button
              onClick={() => setLayoutMode("both")}
              className={`flex h-7 w-5 cursor-pointer items-center justify-center rounded-lg ${
                layoutMode === "both"
                  ? "bg-white text-slate-900 hover:bg-white"
                  : "bg-transparent text-slate-400 hover:bg-slate-200 hover:text-slate-700"
              }`}
            >
              <div className="flex h-2.5 w-3.5 overflow-hidden rounded-sm border border-current">
                <div
                  className={`h-full w-1.5 border-r border-current ${layoutMode === "both" ? "bg-slate-200" : ""}`}
                />
                <div
                  className={`flex-1 h-full ${layoutMode === "both" ? "bg-slate-200" : ""}`}
                />
              </div>
            </button>
            <button
              onClick={() => setLayoutMode("right")}
              className={`flex h-7 w-5 cursor-pointer items-center justify-center rounded-lg ${
                layoutMode === "right"
                  ? "bg-white text-slate-900 hover:bg-white"
                  : "bg-transparent text-slate-400 hover:bg-slate-200 hover:text-slate-700"
              }`}
              title="Right View"
            >
              <div className="flex h-2.5 w-3.5 overflow-hidden rounded-sm border border-current">
                <div className="h-full w-1 border-r border-current" />
                <div
                  className={`flex-1 h-full ${layoutMode === "right" ? "bg-slate-200" : ""}`}
                />
              </div>
            </button>
          </div>
          <span className="text-xs  font-medium text-center   text-slate-900">
            Split
          </span>
        </div>
        <div
          className="flex p-1 w-full cursor-pointer flex-col items-center gap-1.5 rounded-lg   text-slate-900 hover:bg-slate-100 hover:text-slate-950"
          onClick={onWishlistClick}
        >
          <FolderOutlined className="text-[20px]" />
          <span className="text-xs  font-medium text-center  ">
            Collections
          </span>
        </div>
        <div
          className="flex p-1 w-full cursor-pointer flex-col items-center gap-1.5 rounded-lg   text-slate-900 hover:bg-slate-100 hover:text-slate-950"
          onClick={() => setIsHistoryOpen(true)}
        >
          <HistoryOutlined className="text-[20px]" />
          <span className="text-xs  font-medium text-center ">
            History
          </span>
        </div>
        {chatHistory.length >= 2 && (
          <div className="flex w-full flex-col items-center gap-1 px-1 text-center text-xs text-slate-600">
            <HistoryOutlined className="text-base" />
            <p className="m-0 line-clamp-2 w-full break-words leading-snug">
              {chatHistory[chatHistory.length - 2]}
            </p>
          </div>
        )}
        </div>
      </div>

      {isHistoryOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200] flex items-center justify-center p-4 transition-all"
          onClick={() => setIsHistoryOpen(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-solid border-[#e8e4fb] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 bg-[#fbfafe] border-b border-solid border-[#e8e4fb] flex items-center justify-between">
              <h3 className="text-secondary font-bold text-base m-0 flex items-center gap-2">
                <HistoryOutlined /> Past Chats
              </h3>
              <CloseOutlined
                className="text-gray-400 hover:text-gray-600 cursor-pointer text-sm p-1 transition-all"
                onClick={() => setIsHistoryOpen(false)}
                title="Close"
              />
            </div>
            <div className="p-4 flex flex-col gap-2.5 max-h-[60vh] overflow-y-auto">
              {chatHistory.length > 0 ? (
                [...chatHistory].reverse().map((item) => (
                  <div
                    key={item}
                    onClick={() => handleSelectPastChat(item)}
                    className="flex items-start justify-between p-3 rounded-xl bg-[#fbfafe]/60 border border-solid border-[#e8e4fb] hover:bg-secondary/5 hover:border-secondary/30 cursor-pointer transition-all text-left text-sm font-medium text-gray-700 group"
                  >
                    <span className="line-clamp-2 pr-2 group-hover:text-secondary transition-colors">
                      {item}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-400 text-sm font-medium">
                  No past chats found
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
