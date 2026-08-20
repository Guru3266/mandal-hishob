const STORAGE_KEY = "mandal_config";

const DEFAULT_CONFIG = {
  name: "लक्ष्मी तरुण मित्र मंडळ",
  tagline: "गणपती उत्सव 2026",
  eventYear: 2026,

  address: "",
  mobile: "",
  upiId: "",

  // Receipt settings
  receiptPrefix: "REC",
  receiptStartNumber: 1,
};

// ============================================================
// GET CONFIG
// ============================================================

export const getMandalConfig = () => {
  try {
    const stored =
      localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      return {
        ...DEFAULT_CONFIG,
      };
    }

    const parsed =
      JSON.parse(stored);

    return {
      ...DEFAULT_CONFIG,
      ...parsed,

      name:
        String(
          parsed?.name ||
            DEFAULT_CONFIG.name
        ).trim(),

      tagline:
        String(
          parsed?.tagline ||
            DEFAULT_CONFIG.tagline
        ).trim(),

      eventYear:
        Number(
          parsed?.eventYear
        ) ||
        DEFAULT_CONFIG.eventYear,

      address:
        String(
          parsed?.address || ""
        ).trim(),

      mobile:
        String(
          parsed?.mobile || ""
        )
          .replace(/\D/g, "")
          .slice(0, 10),

      upiId:
        String(
          parsed?.upiId || ""
        ).trim(),

      receiptPrefix:
        String(
          parsed?.receiptPrefix ||
            DEFAULT_CONFIG.receiptPrefix
        )
          .trim()
          .toUpperCase(),

      receiptStartNumber:
        Number(
          parsed?.receiptStartNumber
        ) ||
        DEFAULT_CONFIG.receiptStartNumber,
    };
  } catch (error) {
    console.error(
      "Mandal config load error:",
      error
    );

    return {
      ...DEFAULT_CONFIG,
    };
  }
};

// ============================================================
// SAVE CONFIG
// ============================================================

export const saveMandalConfig = (
  config
) => {
  const cleanConfig = {
    name:
      String(
        config?.name || ""
      ).trim(),

    tagline:
      String(
        config?.tagline || ""
      ).trim(),

    eventYear:
      Number(
        config?.eventYear
      ) ||
      DEFAULT_CONFIG.eventYear,

    address:
      String(
        config?.address || ""
      ).trim(),

    mobile:
      String(
        config?.mobile || ""
      )
        .replace(/\D/g, "")
        .slice(0, 10),

    upiId:
      String(
        config?.upiId || ""
      ).trim(),

    receiptPrefix:
      String(
        config?.receiptPrefix ||
          DEFAULT_CONFIG.receiptPrefix
      )
        .trim()
        .toUpperCase(),

    receiptStartNumber:
      Number(
        config?.receiptStartNumber
      ) ||
      DEFAULT_CONFIG.receiptStartNumber,
  };

  // ----------------------------------------------------------
  // SAVE LOCAL STORAGE
  // ----------------------------------------------------------

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(cleanConfig)
  );

  // ----------------------------------------------------------
  // SAME TAB UPDATE
  // ----------------------------------------------------------

  window.dispatchEvent(
    new CustomEvent(
      "mandal-data-updated",
      {
        detail: cleanConfig,
      }
    )
  );

  // ----------------------------------------------------------
  // SETTINGS UPDATE
  // ----------------------------------------------------------

  window.dispatchEvent(
    new CustomEvent(
      "mandal-settings-updated",
      {
        detail: cleanConfig,
      }
    )
  );

  return cleanConfig;
};

// ============================================================
// RESET CONFIG
// ============================================================

export const resetMandalConfig = () => {
  const resetConfig = {
    ...DEFAULT_CONFIG,
  };

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(resetConfig)
  );

  window.dispatchEvent(
    new CustomEvent(
      "mandal-data-updated",
      {
        detail: resetConfig,
      }
    )
  );

  window.dispatchEvent(
    new CustomEvent(
      "mandal-settings-updated",
      {
        detail: resetConfig,
      }
    )
  );

  return resetConfig;
};

// ============================================================
// GENERATE RECEIPT NUMBER
// ============================================================

export const generateReceiptNumber = (
  number
) => {
  const config =
    getMandalConfig();

  const prefix =
    String(
      config?.receiptPrefix ||
        "REC"
    )
      .trim()
      .toUpperCase();

  const year =
    Number(
      config?.eventYear
    ) ||
    new Date().getFullYear();

  return `${prefix}-${year}-${String(
    Number(number) || 1
  ).padStart(5, "0")}`;
};