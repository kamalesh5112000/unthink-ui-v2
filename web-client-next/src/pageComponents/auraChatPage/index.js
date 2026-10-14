// Created for loading chat modal in an iframe as the AURA chat page.
import React from "react";
import ChatContainer from "../storePage/ChatContainer";

const AuraChatPage = ({ isAuraChatPage, serverData }) => {
  return (
    <div>
      <ChatContainer
        disabledOutSideClick={true}
        config={serverData.config}
        trackCollectionData={{}}
        isBTInstance={false}
        isAuraChatPage={isAuraChatPage}
      />
    </div>
  );
};

export default AuraChatPage;
