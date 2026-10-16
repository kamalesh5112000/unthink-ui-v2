export function generateDID() {
  const cryptoObject =
    typeof globalThis !== "undefined" ? globalThis.crypto : undefined;
  let rawUuid;

  if (cryptoObject?.randomUUID) {
    rawUuid = cryptoObject.randomUUID();
  } else if (cryptoObject?.getRandomValues) {
    const bytes = cryptoObject.getRandomValues(new Uint8Array(16));

    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;

    rawUuid = [...bytes]
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("")
      .replace(
        /^(.{8})(.{4})(.{4})(.{4})(.{12})$/,
        "$1-$2-$3-$4-$5",
      );
  } else {
    throw new Error("Secure UUID generation is not supported");
  }

  const uniqueHash = rawUuid.replace(/-/g, "");

  return `did:uaid:unthink:user:${uniqueHash}`;
}
