import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { FiActivity, FiBarChart2, FiUsers } from "react-icons/fi";

import { aura_header_theme } from "../../../constants/config";
import { resetAuraSearchResponse } from "../../../hooks/chat/redux/actions";
import ChatContainer from "../../aura/ChatContainer";
import StoreAssistantRealtimeFeed from "../realtimeFeed/StoreAssistantRealtimeFeed";
import StoreAssistantUploadMedia from "../uploadMedia/StoreAssistantUploadMedia";
import StoreAssistantLookBooks from "../lookBooks/StoreAssistantLookBooks";
import StoreAssistantRedeem from "../redeem/StoreAssistantRedeem";
import styles from "../StoreAssistantDashboard.module.scss";

const PlaceholderPanel = ({ icon: Icon, title, description, children }) => (
  <section className={styles.placeholderPanel}>
    <div className={styles.placeholderIcon}><Icon /></div>
    <h2>{title}</h2>
    <p>{description}</p>
    {children}
  </section>
);

const StoreAssistantOutlet = ({ activeTab, settings }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    if (activeTab !== "aura_search") return;

    sessionStorage.removeItem("widgetHeader");
    sessionStorage.removeItem("widgetHeaderRequestHistory");
    dispatch(resetAuraSearchResponse());
  }, [activeTab, dispatch]);

  if (activeTab === "aura_search") {
    return (
      <section className={styles.auraOutlet}>
        <ChatContainer
          isAuraChatPage
          renderInline
          config={{ aura_header_theme }}
        />
      </section>
    );
  }

  if (activeTab === "upload_media") {
    return <StoreAssistantUploadMedia />;
  }

  if (activeTab === "realtime_feed") {
    return <StoreAssistantRealtimeFeed settings={settings} />;
  }

  if (activeTab === "lookbooks") {
    return <StoreAssistantLookBooks />;
  }

  if (activeTab === "trending") {
    return <StoreAssistantLookBooks mode="trending" />;
  }

  if (activeTab === "redeem") {
    return <StoreAssistantRedeem />;
  }

  if (activeTab === "customers") {
    return (
      <PlaceholderPanel
        icon={FiUsers}
        title="My Customers"
        description="Customer lookup, recent sessions, and customer profile previews will be added here."
      />
    );
  }

  if (activeTab === "stats") {
    return (
      <PlaceholderPanel
        icon={FiBarChart2}
        title="Stats"
        description="Assistant activity, collections created, uploads, and customer engagement metrics will be added here."
      />
    );
  }

  return (
    <PlaceholderPanel
      icon={FiActivity}
      title="Select a tool"
      description="Choose Aura Search, Upload Media, Real-time Feed, or an event from the assistant menu."
    />
  );
};

export default StoreAssistantOutlet;
