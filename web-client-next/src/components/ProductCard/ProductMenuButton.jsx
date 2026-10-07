import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { FiEdit } from "react-icons/fi";
import { LuCopy } from "react-icons/lu";
import { openProductModal } from "../../pageComponents/customProductModal/redux/actions";
import { openProductDetailsCopyModal } from "../../pageComponents/productDetailsCopyModal/redux/actions";
import ProductRemoveAction from "./ProductRemoveAction";
import { BsThreeDotsVertical } from "react-icons/bs";

const ProductMenuButton = ({
  product,
  collectionId,
  showCustomProductsMenu,
  size,
  isDefaultWidget,
  showRemoveIcon,
  removeFromWishlistClick,
  enableCopyFeature,
  allowEdit,
  onEditClick,
}) => {
  const dispatch = useDispatch();
  const [menuIcon, setMenuIcon] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClick = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuIcon(false);
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => {
      document.removeEventListener("mousedown", handleClick);
    };
  }, []);

  const handleOpenProductModal = useCallback(
    (allowEdit) => {
      dispatch(
        openProductModal({
          payload: product,
          collectionId,
          allowEdit,
        }),
      );
    },
    [dispatch, product, collectionId],
  );

  const handleEditClick = useCallback(
    (e) => {
      e.stopPropagation();
      if (onEditClick) {
        onEditClick();
      } else {
        handleOpenProductModal(true);
      }
    },
    [onEditClick, handleOpenProductModal],
  );

  const handleCopyClick = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      product && dispatch(openProductDetailsCopyModal(product));
    },
    [dispatch, product],
  );

  if (!showCustomProductsMenu) {
    return null;
  }

  return (
    <div ref={menuRef}>
      <div
        className="absolute right-2.5 lg:right-4 top-10 z-10 mt-1.5 flex h-8 w-8 cursor-pointer
       items-center justify-center rounded-full bg-white p-1 
       text-2xl shadow-md transition-all duration-300 ease-in-out lg:top-12
        lg:hover:bg-gray-100 lg:hover:shadow-lg"
        onClick={(e) => {
            e.stopPropagation();
            setMenuIcon((prev) => !prev);
          }}
      >
        <BsThreeDotsVertical
          className="h-[18px] w-[18px] object-contain"
          
        />
      </div>

      {menuIcon && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute right-5 top-16 z-50 flex h-fit w-32 flex-col gap-3 rounded-lg bg-white p-3 shadow-md sm:right-6 md:right-10 md:top-16 lg:right-12 lg:top-[72px] lg:w-36"
        >
          <ProductRemoveAction
            isVisible={isDefaultWidget && showRemoveIcon}
            size={size}
            onRemove={removeFromWishlistClick}
            onAfterRemove={() => setMenuIcon(false)}
            isMenuItem
          />
          {enableCopyFeature && (
            <div
              className="flex cursor-pointer items-center gap-2 rounded-md transition-all duration-200 max-md:text-sm"
              onClick={(e) => {
                handleCopyClick(e);
                setMenuIcon(false);
              }}
            >
              <div className="mb-0 flex h-5 w-5 items-center justify-center rounded-full bg-common p-0.5 text-gray-dark lg:h-6 lg:w-6 lg:p-1 lg:text-2xl">
                <LuCopy className="max-md:h-3 max-md:w-3" />
              </div>
              <p className="mb-0 text-gray-dark">Copy</p>
            </div>
          )}
          {allowEdit && (
            <div
              className="flex cursor-pointer items-center gap-2 rounded-md transition-all duration-200 max-md:text-sm"
              onClick={(e) => {
                handleEditClick(e);
                setMenuIcon(false);
              }}
            >
              <p className="flex h-5 w-5 items-center justify-center rounded-lg bg-common text-gray-800 lg:h-6 lg:w-6">
                <FiEdit className="h-4 w-4 bg-common text-gray-dark max-md:h-3 max-md:w-3" />
              </p>
              <p className="mb-0 text-gray-dark">Edit</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductMenuButton;
