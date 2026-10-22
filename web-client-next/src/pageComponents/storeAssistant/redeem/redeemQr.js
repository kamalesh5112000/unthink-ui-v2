const validUserId = (value) => typeof value === "string" && /^[\w-]+$/.test(value);

// QR image endpoints can themselves be encoded in older badges. Unwrap them
// before interpreting the redemption destination, without ever navigating to it.
export const parseRedeemQr = (value, origin) => {
  let target = String(value || "").trim();
  for (let depth = 0; depth < 5; depth += 1) {
    if (!target) return null;
    let url;
    try {
      url = new URL(target, origin);
      if (!["http:", "https:"].includes(url.protocol)) return null;
      const nested = url.searchParams.get("page_url");
      if (nested) {
        target = nested;
        continue;
      }
      const parts = url.pathname.split("/").filter(Boolean).map(decodeURIComponent);
      const route = parts[0];
      if (route === "claim-points" || route === "checkout-claim-badge") {
        return validUserId(parts[1]) ? {
          userId: parts[1],
          storeName: parts[2] || "",
          mode: route === "checkout-claim-badge" ? "checkout" : "points",
        } : null;
      }
      if (route === "store-assistant" && url.searchParams.get("tab") === "redeem") {
        const userId = url.searchParams.get("user_id");
        return validUserId(userId) ? {
          userId,
          storeName: url.searchParams.get("store_name") || "",
          mode: url.searchParams.get("mode") === "checkout" ? "checkout" : "points",
        } : null;
      }
      return null;
    } catch {
      return null;
    }
  }
  return null;
};

export const getRedeemCustomerName = (user) =>
  user?.full_name || user?.name ||
  [user?.first_name, user?.last_name].filter(Boolean).join(" ") ||
  user?.user_name || "Name unavailable";
