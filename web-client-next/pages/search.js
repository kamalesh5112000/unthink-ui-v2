import React, { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";

import ChatContainer from "../src/pageComponents/storePage/aura/ChatContainer";
import { setShowChatModal } from "../src/hooks/chat/redux/actions";
import { aura_header_theme, current_store_name, is_store_instance } from "../src/constants/config";
import { STORE_USER_NAME_BUDGETTRAVEL } from "../src/constants/codes";
import StorePage from "../src/pageComponents/storePage";

const AURA_CHAT_PROPS_STORAGE_KEY = "auraChatContainerProps";

const AuraModel = (props) => {
   
  //  useEffect(() => {
  //   dispatch(setShowChatModal(true));

  //   return () => {
  //     dispatch(setShowChatModal(false));
  //   };
  // }, [dispatch]);

 

  return (
    <StorePage
      isAuraChatPage
      {...props}
      serverData={{
        config: {
          aura_header_theme: aura_header_theme,
        },
      }}
    />
 
  );
};

export default AuraModel;
