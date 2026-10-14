import React from "react";
import { RxCross2 } from "react-icons/rx";

const getRemoveIconCircleSizeClass = (size) =>
  size === "small"
    ? "h-5 w-5 p-1 text-gray-dark lg:text-base"
    : "h-6 w-6 p-1 text-gray-dark max-md:h-5 max-md:w-5 max-md:p-0.5 lg:text-2xl";

const ProductRemoveAction = ({
  isVisible,
  size,
  onRemove,
  onAfterRemove,
  isMenuItem = false,
  hideOnMedium = false,
}) => {
  if (!isVisible) {
    return null;
  }
  const sizeClassName =
    hideOnMedium && size !== "small"
      ? "hidden"
      : getRemoveIconCircleSizeClass(size);

  const removeIcon = (
    <p
      className={`z-50 mb-0 flex items-center justify-center rounded-full bg-common font-semibold text-gray-dark ${sizeClassName}`}
    >
      <RxCross2 />
    </p>
  );

  if (isMenuItem) {
    return (
      <div className={size === "small" ? "gap-2" : "gap-3"}>
        <div
          className="flex cursor-pointer items-center gap-2 self-baseline rounded-md text-gray-dark transition-all duration-200 max-md:text-sm"
          onClick={(e) => {
            onRemove(e);
            onAfterRemove?.();
          }}
        >
          {removeIcon}
          <p className="mb-0 text-gray-dark">Remove</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="absolute right-2.5 top-2.5 mt-0.5 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-transparent p-1 text-2xl shadow-none transition-all duration-300 ease-in-out"
      onClick={onRemove}
    >
      {removeIcon}
    </div>
  );
};

export default ProductRemoveAction;
