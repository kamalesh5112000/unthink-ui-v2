import React from "react";

const getTitleParts = (title = "") => {
  const words = title.split(" ");

  return {
    leadingText: words.slice(0, -2).join(" "),
    trailingText: words.slice(-2).join(" "),
    hasGap: words.length > 2,
  };
};

const AuraSearchOptionIntro = ({
  activeSearchOption,
  allowImageSearch,
  onTryExampleClick,
}) => {
  const { leadingText, trailingText, hasGap } = getTitleParts(
    activeSearchOption?.title,
  );

  if (!activeSearchOption?.title) return null;

  return (
    <>
      <h1 className="flex items-center justify-center gap-2 text-[22px] whitespace-nowrap font-bold uppercase  lg:text-3xl">
        <span className="gradient-bar"></span>
        {leadingText}
        {hasGap ? " " : ""}
        <span className="text-gradient bg-clip-text text-transparent">
          {trailingText}
        </span>
        <span className="gradient-bar"></span>
      </h1>
      {activeSearchOption?.subTitle ? (
        <p className="mt-2 mb-3.5 lg:mb-5 text-center text-sm lg:text-base font-medium text-slate-500">
          {activeSearchOption.subTitle}
        </p>
      ) : null}
      { !allowImageSearch &&  activeSearchOption?.text_example ? (
        <button
          type="button"
          className="border-accent border-2 my-4 text-sm md:text-base cursor-pointer rounded-full px-4 md:px-6 py-2  font-medium "
          onClick={onTryExampleClick}
        >
          Try an Example
        </button>
      ) : null}
    </>
  );
};

export default AuraSearchOptionIntro;
