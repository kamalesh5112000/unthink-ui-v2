import { useEffect, useRef, useState } from "react";

export const useAuraResponsiveLayout = () => {
  const openMobileSidebarRef = useRef(null);
  const [layoutMode, setLayoutMode] = useState("both");
  const [isSearchPopupOpen, setIsSearchPopupOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isMobileOnly, setIsMobileOnly] = useState(false);
  const [mobileTab, setMobileTab] = useState("description");

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 1024);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return {
    openMobileSidebarRef,
    layoutMode,
    setLayoutMode,
    isSearchPopupOpen,
    setIsSearchPopupOpen,
    isMobile,
    isMobileOnly,
    setIsMobileOnly,
    mobileTab,
    setMobileTab,
  };
};

