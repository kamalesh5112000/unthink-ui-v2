import React from "react";

import { isEmpty } from "../../../../helper/utils";
import searchIcon from "../../../../images/swiftly-styled/Aura - Search.svg";
import starAiIcon from "../../Images/Illustration.png";
const AuraWelcomePanel = ({
  isMobile = false,
  isProductSearchOptionActive = false,
  selectedSearchOptionExamples = [],
  onTryExample,
}) => {
  return (
    <div
      className={"flex h-full max-h-[590px]"}
      style={
        isMobile && isProductSearchOptionActive
          ? { flex: 1, maxHeight: "none", overflowY: "auto" }
          : {}
      }
    >
      <div className={"m-auto flex w-full max-w-4xl flex-col gap-10 px-10 py-10 lg:max-w-[var(--max-w-3xl-2)] lg:px-0 lg:gap-20 2xl:max-w-[var(--max-w-6xl-2)]"}>
        <div className={"flex w-full items-center gap-6 max-lg:gap-4"}>
          <img
            src={starAiIcon}
            width={56}
            height={56}
            className={"h-auto w-[226px] shrink-0 max-lg:w-[120px] max-[480px]:w-20"}
            alt="Aura"
          />

          <h1 className={"m-0 text-[38px] max-lg:text-2xl max-[480px]:text-[32px] font-bold leading-[1.1] tracking-normal"}>
            <span className={"m-0 text-[38px] max-lg:text-2xl max-[480px]:text-[32px] font-bold leading-[1.1] tracking-normal-primary"}>
              I&apos;m AURA
            </span>
            <br />
            <span className={"m-0 text-[38px] max-lg:text-2xl max-[480px]:text-[32px] font-bold leading-[1.1] tracking-normal-secondary"}>
              How can I inspire you today?
            </span>
          </h1>
        </div>

        {!isEmpty(selectedSearchOptionExamples) ? (
          <div className={"-m-10 flex gap-5 overflow-auto p-10"}>
            {selectedSearchOptionExamples?.map((example, index) => (
              <div
                key={`${example?.text || "example"}-${index}`}
                className={"relative flex h-[228px] w-full min-w-[13rem] max-w-[228px] cursor-pointer flex-col gap-4 rounded-xl bg-slate-100 p-4 shadow-md 2xl:h-64 2xl:max-w-xs"}
                onClick={(event) => {
                  onTryExample(event, example?.text, example?.image_url);
                }}
              >
                <div className={"text-lg leading-7"}>
                  {example?.text}
                </div>

                <div className={"h-full overflow-auto"}>
                  {example?.image_url ? (
                    <img
                      src={example.image_url}
                      className={"mx-auto h-full rounded-xl"}
                      alt=""
                    />
                  ) : null}
                </div>
                <div className={"absolute bottom-0 right-0 m-4 ml-auto flex h-10 w-10 items-center justify-center rounded-full bg-white"}>
                  <img
                    src={searchIcon}
                    alt="Search"
                    width={18}
                    height={18}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default AuraWelcomePanel;



