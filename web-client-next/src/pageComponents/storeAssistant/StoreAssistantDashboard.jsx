import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import {
  FiBookOpen,
  FiCamera,
  FiGift,
  FiRadio,
  FiSearch,
  FiTrendingUp,
  FiUploadCloud,
  FiUsers,
} from "react-icons/fi";

import StoreAssistantHeader from "./components/StoreAssistantHeader";
import StoreAssistantSidebar from "./components/StoreAssistantSidebar";
import StoreAssistantOutlet from "./components/StoreAssistantOutlet";
import { normalizeStoreAssistantSettings } from "./utils/normalizeStoreAssistantSettings";
import styles from "./StoreAssistantDashboard.module.scss";

const TAB_META = {
  aura_search: {
    key: "aura_search",
    label: "Aura Search",
    shortLabel: "Aura",
    description: "Help shoppers with the virtual stylist.",
    icon: FiSearch,
  },
  realtime_feed: {
    key: "realtime_feed",
    label: "Real-time Feed",
    shortLabel: "Feed",
    description: "Track live customer and event activity.",
    icon: FiRadio,
  },
  lookbooks: {
    key: "lookbooks",
    label: "LookBooks",
    shortLabel: "Books",
    description: "Control which lookbooks appear in kiosk.",
    icon: FiBookOpen,
  },
  trending: {
    key: "trending",
    label: "Trending",
    shortLabel: "Trend",
    description: "Control which trending collections appear in kiosk.",
    icon: FiTrendingUp,
  },
  upload_media: {
    key: "upload_media",
    label: "Upload Media",
    shortLabel: "Upload",
    description: "Upload styling photos and product media.",
    icon: FiUploadCloud,
  },
  redeem: {
    key: "redeem",
    label: "Redeem",
    shortLabel: "Redeem",
    description: "Scan customer badges and redeem points.",
    icon: FiGift,
  },
};

const profileItems = [
  // { key: "collections", label: "My Collections", icon: FiBookOpen, href: "/my-profile" },
  // { key: "customers", label: "My Customers", icon: FiUsers, tab: "customers" },
  // { key: "stats", label: "Stats", icon: FiTrendingUp, tab: "stats" },
];

const StoreAssistantDashboard = () => {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [storeData, authUser] = useSelector((state) => [
    state.store.data,
    state.auth.user.data,
  ]);

  const settings = useMemo(
    () => normalizeStoreAssistantSettings(storeData?.store_assistant_settings),
    [storeData?.store_assistant_settings]
  );

  const enabledTabs = useMemo(
    () =>
      Object.values(TAB_META).filter((tab) => settings.features?.[tab.key] !== false),
    [settings.features]
  );

  const navItems = useMemo(() => {
    const eventItems = settings.event_app_list.map((event) => ({
      ...event,
      key: `event:${event.id}`,
      label: event.label,
      description: event.description,
      icon: event.icon === "lookbook" ? FiBookOpen : FiCamera,
      type: "event",
    }));

    return [
      ...enabledTabs.map((tab) => ({ ...tab, type: "tab" })),
      ...eventItems,
    ];
  }, [enabledTabs, settings.event_app_list]);

  const fallbackTab = enabledTabs[0]?.key || "aura_search";
  const activeTab = typeof router.query.tab === "string" ? router.query.tab : settings.default_tab;
  const normalizedActiveTab = navItems.some((item) => item.type === "tab" && item.key === activeTab)
    ? activeTab
    : fallbackTab;

  useEffect(() => {
    if (!router.isReady || activeTab === normalizedActiveTab) return;
    router.replace(
      { pathname: router.pathname, query: { ...router.query, tab: normalizedActiveTab } },
      undefined,
      { shallow: true }
    );
  }, [activeTab, normalizedActiveTab, router]);

  const onSelectNavItem = (item) => {
    setMobileMenuOpen(false);

    if (item.type === "event") {
      if (item.url) {
        window.open(item.url, "_blank", "noopener,noreferrer");
      }
      return;
    }

    router.push(
      { pathname: router.pathname, query: { ...router.query, tab: item.key } },
      undefined,
      { shallow: true }
    );
  };

  const onSelectProfileItem = (item) => {
    if (item.href) {
      router.push(item.href);
      return;
    }

    router.push(
      { pathname: router.pathname, query: { ...router.query, tab: item.tab } },
      undefined,
      { shallow: true }
    );
  };

  return (
    <div className={styles.dashboardShell}>
      <StoreAssistantHeader
        authUser={authUser}
        storeData={storeData}
        profileItems={profileItems}
        onSelectProfileItem={onSelectProfileItem}
        onMenuClick={() => setMobileMenuOpen((open) => !open)}
      />

      <div className={styles.dashboardBody}>
        <StoreAssistantSidebar
          navItems={navItems}
          activeTab={normalizedActiveTab}
          onSelectNavItem={onSelectNavItem}
          mobileMenuOpen={mobileMenuOpen}
        />

        <main className={styles.mainContent}>
          <StoreAssistantOutlet activeTab={normalizedActiveTab} settings={settings} />
        </main>
      </div>
    </div>
  );
};

export default StoreAssistantDashboard;
