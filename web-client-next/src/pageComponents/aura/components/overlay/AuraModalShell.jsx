import React from "react";

import { getCurrentTheme } from "../../../../helper/utils";
const AuraModalShell = ({
  isFixed = false,
  shouldCenter = false,
  children,
}) => {
  return (
    <div
      className={`relative z-10 flex w-full flex-col overflow-x-hidden overflow-y-auto m-0 p-4 ${getCurrentTheme()} ${
        isFixed ? "lg:h-[calc(100dvh-125px)] lg:min-h-0 lg:overflow-hidden" : ""
      } ${shouldCenter ? "justify-center" : ""} `}
      id="chatmodal_modal_container"
    >
      {children}
    </div>
  );
};

export default AuraModalShell;





