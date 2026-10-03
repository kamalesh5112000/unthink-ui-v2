import {
  ArrowLeftOutlined,
  FolderOutlined,
  FormOutlined,
  HistoryOutlined,
} from "@ant-design/icons";
import React from "react";
import { resetAuraSearchResponse } from "../../../../hooks/chat/redux/actions";
import { useDispatch } from "react-redux";

const AuraSideNav = ({
  handleChangeImageConfirm,
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
    <div className=" hidden  lg:flex  lg:flex-col lg:w-[70px]  lg:items-center h-full ">
      <div className="flex-1 flex flex-col gap-8 items-center w-full justify-center">
        <div
          className="flex w-full cursor-pointer flex-col items-center gap-1 rounded-lg text-slate-900 hover:bg-slate-100 hover:text-slate-950"
          onClick={handleGoBack}
        >
          <ArrowLeftOutlined
            className="text-2xl"
          />
          <span className="text-xs font-medium text-center">
            Back
          </span>
        </div>
        <div
          className="flex w-full cursor-pointer flex-col items-center rounded-lg   text-slate-900 hover:bg-slate-100 hover:text-slate-950"
          onClick={handleChangeImageConfirm}
        >
          <FormOutlined className="text-[20px]" />
          <span className="text-xs  font-medium text-center ">
            New Chat
          </span>
        </div>
        <div className="flex flex-col items-center gap-2   w-full relative select-none">
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
          className="flex w-full cursor-pointer flex-col items-center gap-1.5 rounded-lg   text-slate-900 hover:bg-slate-100 hover:text-slate-950"
          onClick={onWishlistClick}
        >
          <FolderOutlined className="text-[20px]" />
          <span className="text-xs  font-medium text-center  ">
            Collections
          </span>
        </div>
        <div
          className="flex w-full cursor-pointer flex-col items-center gap-1.5 rounded-lg   text-slate-900 hover:bg-slate-100 hover:text-slate-950"
          onClick={() => setIsHistoryOpen(true)}
        >
          <HistoryOutlined className="text-[20px]" />
          <span className="text-xs  font-medium text-center ">
            History
          </span>
        </div>
      </div>
       
    </div>
  );
};

export default AuraSideNav;
