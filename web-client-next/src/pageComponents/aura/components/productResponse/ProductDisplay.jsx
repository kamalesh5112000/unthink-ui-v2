import { Loading3QuartersOutlined } from "@ant-design/icons";
import { Spin } from "antd";
import React from "react";

import { isEmpty } from "../../../../helper/utils";
import AuraResponseProductsWithTags from "../../../auraResponseProductsWithTags/AuraResponseProductsWithTags";

const ProductDisplay = ({
  chatTypeKey,
  enableClickFetchRec,
  enableClickTracking,
  handleGoBack,
  handleLoadMore,
  isMobile,
  isAuraChatPage,
  isProductSearchOptionActive,
  layoutMode,
  localChatMessage,
  newAuraProductsUiEnabled,
  registerSelectActions,
  shouldShowPanelChrome,
  shouldShowShopLookSplitLayout,
  showChatLoader,
  suggestionsWithProducts,
  trackCollectionCampCode,
  trackCollectionICode,
  trackCollectionId,
  trackCollectionName,
  widgetHeader,
  widgetImage,
}) => {
  

  if (!shouldShowPanelChrome) {
    return productsResultsContent;
  }

  return (
    <div
      className={`w-full min-w-0 overflow-x-hidden max-lg:px-0 max-lg:py-4 lg:box-border lg:flex lg:h-full lg:min-h-0 lg:w-auto lg:flex-col lg:overflow-hidden lg:bg-white lg:px-2.5 lg:py-0 ${
        layoutMode === "left" ? "lg:hidden" : ""
      }`}
    >
      <div
        className={`sticky top-0 z-50 mb-4 flex h-16 w-full box-border items-center border-b border-slate-200 px-6 py-3 backdrop-blur-md ${
          isMobile ? "max-lg:hidden" : ""
        }`}
      >
        <h2 className="m-0 text-xl font-semibold uppercase leading-tight tracking-wide text-slate-950 md:text-2xl">
          Products
        </h2>
      </div>
      <div className="min-h-0 lg:flex-auto lg:overflow-x-hidden lg:overflow-y-auto">
   
      {showChatLoader &&
        isEmpty(suggestionsWithProducts.suggestions) &&
        !newAuraProductsUiEnabled && (
          <div className="flex w-full animate-pulse flex-col items-center justify-center gap-4 py-20">
            <Spin
              indicator={
                <Loading3QuartersOutlined
                  style={{ fontSize: 36, color: "var(--color-secondary)" }}
                  spin
                />
              }
            />
            <span className="text-sm font-semibold tracking-wide text-secondary">
              Searching products...
            </span>
          </div>
        )}

      {newAuraProductsUiEnabled ? (
        <AuraResponseProductsWithTags
          handleLoadMore={handleLoadMore}
          enableClickFetchRec={enableClickFetchRec}
          enableClickTracking={enableClickTracking}
          trackCollectionCampCode={trackCollectionCampCode}
          trackCollectionId={trackCollectionId}
          trackCollectionName={trackCollectionName}
          trackCollectionICode={trackCollectionICode}
          chatTypeKey={chatTypeKey}
          widgetHeader={widgetHeader}
          widgetImage={widgetImage}
          isAuraChatPage={isAuraChatPage}
          localChatMessage={localChatMessage}
          showTitle={!shouldShowShopLookSplitLayout}
          layoutMode={shouldShowShopLookSplitLayout ? layoutMode : "full"}
          showChatLoader={showChatLoader}
          isMobile={isMobile}
          registerSelectActions={registerSelectActions}
          handleGoBack={handleGoBack}
          isProductSearchOptionActive={isProductSearchOptionActive}
        />
      ) : null}
  
      </div>
    </div>
  );
};

export default ProductDisplay;
