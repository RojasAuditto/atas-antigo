const STORAGE_PREFIX = "pomin-mvp-share:";
const token = new URLSearchParams(window.location.search).get("share");
let record = null;
const validMovement = (item) => item && typeof item.id === "string" && typeof item.companyId === "string" && typeof item.shareholderId === "string" && /^\d{4}-\d{2}-\d{2}$/.test(item.date) && Number.isFinite(item.amount) && item.amount > 0 && ["effective", "reversed", "superseded"].includes(item.status);
const validSnapshot = (snapshot) => snapshot && Array.isArray(snapshot.shareholders) && Array.isArray(snapshot.months)
  && snapshot.shareholders.every((item) => typeof item.id === "string" && typeof item.name === "string" && typeof item.type === "string" && Number.isFinite(item.entitlement) && Number.isFinite(item.received) && !("companyId" in item) && !("companies" in item))
  && snapshot.months.every((item) => typeof item.label === "string" && Number.isFinite(item.value) && Number.isFinite(item.irpf));

if (token && /^[a-f0-9]{32}$/.test(token)) {
  try {
    const stored = window.localStorage.getItem(`${STORAGE_PREFIX}${token}`);
    const parsed = stored ? JSON.parse(stored) : null;
    const validScope = parsed?.scope === "group" || parsed?.scope === "shareholders";
    const validDigest = typeof parsed?.passwordDigest === "string" && /^[a-f0-9]{64}$/.test(parsed.passwordDigest);
    const validExpiry = Number.isFinite(parsed?.expiresAt) && [3, 7, 15, 30].includes(Number(parsed?.expiryDays));
    const validPayload = parsed?.scope === "group"
      ? parsed.movements === undefined || Array.isArray(parsed.movements) && parsed.movements.every(validMovement)
      : parsed?.snapshot === undefined || validSnapshot(parsed.snapshot);
    if (validScope && validDigest && validExpiry && validPayload && typeof parsed?.revoked === "boolean") record = parsed;
  } catch {
    record = null;
  }
}

window.MVP_SHARE_BOOTSTRAP = Object.freeze({ token, record });

if (!token) await import("./data.js");
else if (!record) await import("./empty-data.js");
else if (record.scope === "shareholders") await import("./shareholders-data.js");
else await import("./data.js");

await import("./ledger.js");
await import("./operations.js");
await import("./ui.js");
await import("./app.js");
