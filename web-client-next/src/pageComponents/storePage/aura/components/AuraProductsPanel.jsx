import {
  CheckSquareOutlined,
  CloseOutlined,
  Loading3QuartersOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { Checkbox, Spin } from "antd";
import React from "react";

import ProductCard from "../../../../components/ProductCard";
import { is_store_instance } from "../../../../constants/config";
import { WISHLIST_TITLE } from "../../../../constants/codes";
import { isEmpty } from "../../../../helper/utils";
import AuraResponseProductsWithTags from "../../../auraResponseProductsWithTags/AuraResponseProductsWithTags";
import AuraResponseShopALook from "../../../auraResponseShopALook/AuraResponseShopALook";

const AuraProductsPanel = ({
  authUser,
  chatProductsDataToShow,
  chatTypeKey,
  closeChatModal,
  enableClickFetchRec,
  enableClickTracking,
  enableSelectProduct,
  handleGoBack,
  handleLoadMore,
  handleResetSelectProduct,
  isMobile,
  isBTNormalUserLoggedIn,
  isAuraChatPage,
  isTagAvailable,
  isProductSearchOptionActive,
  isUserLogin,
  layoutMode,
  localChatMessage,
  newAuraProductsUiEnabled,
  onAddSelectedProductsToCollection,
  onOpenSearchPopup,
  onProductClick,
  onSelectAllChange,
  onSelectProductClick,
  onWishlistClick,
  registerSelectActions,
  scrollToProductsContainer,
  selectedProducts,
  setEnableSelectProduct,
  shouldShowPanelChrome,
  shouldShowShopLookSplitLayout,
  shopALookData,
  showChatLoader,
  suggestionsWithProducts,
  trackCollectionCampCode,
  trackCollectionICode,
  trackCollectionId,
  trackCollectionName,
  widgetHeader,
  widgetImage,
}) => {
  const productsResultsContent = (
    <>
      {showChatLoader &&
        chatProductsDataToShow.length === 0 &&
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

      {!isEmpty(shopALookData) &&
      isTagAvailable &&
      !isBTNormalUserLoggedIn &&
      !shouldShowShopLookSplitLayout ? (
        <div className="flex flex-row gap-3 text-left text-sm font-bold text-slate-700 md:text-base">
          <div
            className="cursor-pointer border-b-2 border-accent px-2.5 pb-0 pt-0 text-brand transition-all duration-200 ease-in-out"
            onClick={scrollToProductsContainer}
          >
            Products
          </div>
          <div
            className="cursor-pointer transition-all duration-200 ease-in-out"
            onClick={onWishlistClick}
          >
            Collections
          </div>
        </div>
      ) : null}

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

      {!isBTNormalUserLoggedIn && !shouldShowShopLookSplitLayout ? (
        <AuraResponseShopALook
          enableClickFetchRec={enableClickFetchRec}
          enableClickTracking={enableClickTracking}
          trackCollectionCampCode={trackCollectionCampCode}
          trackCollectionId={trackCollectionId}
          trackCollectionName={trackCollectionName}
          trackCollectionICode={trackCollectionICode}
        />
      ) : null}

      {chatProductsDataToShow.length ? (
        <div>
          {isUserLogin && !isMobile ? (
            <div className="mb-3 ml-auto flex justify-start text-xs md:text-base">
              {enableSelectProduct ? (
                <div className="flex items-center gap-2 leading-none">
                  <button
                    type="button"
                    className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-xl border border-secondary/20 bg-white px-3 py-2 text-sm font-semibold leading-none text-slate-700 transition-all duration-200 ease-in-out hover:border-secondary hover:text-secondary hover:shadow-lg"
                    onClick={onSelectAllChange}
                    title="Select all products"
                  >
                    <Checkbox
                      indeterminate={
                        selectedProducts.length > 0 &&
                        selectedProducts.length < chatProductsDataToShow.length
                      }
                      onChange={onSelectAllChange}
                      checked={
                        selectedProducts.length ===
                        chatProductsDataToShow.length
                      }
                      onClick={(event) => event.stopPropagation()}
                    />
                    <span>{selectedProducts.length} Selected</span>
                  </button>
                  <button
                    type="button"
                    onClick={
                      selectedProducts.length
                        ? onAddSelectedProductsToCollection
                        : undefined
                    }
                    className={`min-h-10 rounded-xl border border-transparent bg-transparent px-3 py-2 text-sm transition-all duration-200 ease-in-out ${
                      selectedProducts.length
                        ? "cursor-pointer bg-secondary font-medium text-white hover:shadow-lg"
                        : "cursor-not-allowed bg-secondary/10 text-slate-400"
                    }`}
                    title="Click to add selected products in collection"
                    disabled={!selectedProducts.length}
                  >
                    Add to {WISHLIST_TITLE}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleResetSelectProduct()}
                    className="min-h-10 cursor-pointer rounded-xl border border-transparent bg-secondary px-3 py-2 text-sm font-medium text-white transition-all duration-200 ease-in-out hover:shadow-lg"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-xl border border-secondary bg-secondary px-4 py-2 text-sm font-bold leading-none text-white shadow-lg transition-all duration-200 ease-in-out hover:-translate-y-px hover:shadow-xl"
                  onClick={() => setEnableSelectProduct(true)}
                  title="Click and select multiple products to add to collection"
                >
                  <CheckSquareOutlined />
                  <span>Select Products</span>
                </button>
              )}
            </div>
          ) : null}

          <div
            id="chat_products_inner_content"
            className={`grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-4 lg:gap-4 ${
              shouldShowShopLookSplitLayout
                ? "md:grid-cols-3"
                : "lg:grid-cols-4"
            }`}
          >
            {chatProductsDataToShow.map((product) => (
              <React.Fragment key={product.mfr_code}>
                <ProductCard
                  product={product}
                  onProductClick={onProductClick}
                  enableClickTracking={enableClickTracking}
                  productClickParam={{
                    iCode: authUser.influencer_code,
                    campCode: trackCollectionCampCode,
                    collectionId: trackCollectionId,
                    collectionName: trackCollectionName,
                    collectionICode: trackCollectionICode,
                  }}
                  hideAddToWishlist={is_store_instance && !isUserLogin}
                  enableSelect={enableSelectProduct}
                  isSelected={selectedProducts.includes(product.mfr_code)}
                  setSelectValue={() => onSelectProductClick(product.mfr_code)}
                  localChatMessage={localChatMessage}
                  auramodel={true}
                />
              </React.Fragment>
            ))}
          </div>
        </div>
      ) : null}
    </>
  );

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
        className={`sticky top-0 z-50 mb-4 flex h-16 w-full box-border items-center justify-between border-b border-slate-200 px-6 py-3 backdrop-blur-md ${
          isMobile ? "max-lg:hidden" : ""
        }`}
      >
        <h2 className="m-0 text-xl font-semibold uppercase leading-tight tracking-wide text-slate-950 md:text-2xl">
          Products
        </h2>
        <div className="flex items-center gap-3">
          {isProductSearchOptionActive && onOpenSearchPopup && (
            <SearchOutlined
              className="flex cursor-pointer items-center justify-center rounded-full p-1.5 text-lg text-slate-600 transition-colors duration-200 ease-in-out hover:bg-slate-100 hover:text-secondary"
              onClick={onOpenSearchPopup}
              title="Open Search"
            />
          )}
          {closeChatModal && (
            <CloseOutlined
              onClick={closeChatModal}
              className="flex cursor-pointer items-center justify-center rounded-full p-1.5 text-lg text-slate-600 transition-colors duration-200 ease-in-out hover:bg-slate-100 hover:text-secondary"
              title="Close"
            />
          )}
        </div>
      </div>
      <div className="min-h-0 lg:flex-auto lg:overflow-x-hidden lg:overflow-y-auto">
        {productsResultsContent}
      </div>
    </div>
  );
};

export default AuraProductsPanel;
