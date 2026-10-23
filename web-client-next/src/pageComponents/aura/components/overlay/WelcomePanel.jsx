import React from "react";

import starAiIcon from "../../Images/Illustration.png";
import { getImageSrc } from "../../utils/AuraUtils";

const welcomePanelClassName =
  "w-full flex flex-col gap-2 mx-auto px-4 md:px-6 lg:max-w-[992px] lg:py-4 xl:max-w-[1192px] 2xl:max-w-[1328px] 2xl:px-0 max-lg:max-w-[550px] max-lg:p-2.5";

const WelcomePanel = () => {
  return (
    <div className={welcomePanelClassName}>
      <div className="flex w-full items-center gap-6 max-lg:gap-4">
        <div
          className="aura-image shrink-0"
          role="img"
          aria-label="AURA"
          style={{
            "--aura-mask-image": `url(${getImageSrc(starAiIcon)})`,
          }}
        />
        <div className="flex flex-col gap-1">
          <h1 className="m-0 text-[38px] font-bold leading-[1.1] tracking-normal max-lg:text-2xl max-[480px]:text-[32px]">
            <span className="text-gradient">I&apos;m AURA,</span>
            <br />
            <span className="text-highlight font-medium">
              How can I help you?
            </span>
          </h1>
        </div>
      </div>

      <p className="text-highlight text-left text-xl font-normal leading-tight md:text-2xl">
        Choose one to get started
      </p>
    </div>
  );
};

export default WelcomePanel;
