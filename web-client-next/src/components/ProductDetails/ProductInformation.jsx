import React, { useState } from "react";

const ProductInformation = ({ productDetails, storeData }) => {
  const [showAllFields, setShowAllFields] = useState(false);

  const ProductTags = storeData?.catalog_attributes?.find(
    (att) => att.key === "product_tag",
  )?.is_display;

  const fieldsToDisplay =
    storeData?.pdp_settings?.product_page_attributes || [];

  return (
    <>
      {fieldsToDisplay?.map((field) => {
        const fieldsWithData = fieldsToDisplay.filter(
          (f) => productDetails?.[f]?.length > 0 && ProductTags,
        );
        const fieldIndexInFiltered = fieldsWithData.indexOf(field);
        return productDetails?.[field]?.length > 0 && ProductTags
          ? (showAllFields || fieldIndexInFiltered < 5) && (
              <div className="" key={field}>
                <div className="flex justify-between items-center gap-7  border-b-1.5 border-[hsl(240,5%,96%)] pb-3 mb-5">
                  <p className="text-[#9F9FA9] text-sm  md:text-base lg:text-lg font-semibold uppercase ">
                    {field}
                  </p>
                  <p className="font-normal text-sm  md:text-base text-end">
                    {Array.isArray(productDetails?.[field])
                      ? productDetails?.[field]?.join(",")
                      : productDetails?.[field]}
                  </p>
                </div>
              </div>
            )
          : null;
      })}
      {fieldsToDisplay.filter((field) => productDetails?.[field]?.length > 0)
        ?.length > 5 && (
        <button
          onClick={() => setShowAllFields(!showAllFields)}
          className=" text-start text-brand font-semibold text-sm md:text-base hover:text-secondary transition"
        >
          {showAllFields ? "Show Less" : "Show More"}
        </button>
      )}
      {productDetails?.description && (
        <div className="">
          <div className="lg:mt-8 mt-4 mb-6 text-sm sm:text-[15px] md:text-base lg:text-lg  leading-7 text-[#334155]">
            {productDetails.description}
          </div>
        </div>
      )}
    </>
  );
};

export default React.memo(ProductInformation);
