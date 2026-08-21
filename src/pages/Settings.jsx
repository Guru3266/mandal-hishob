import {
  useEffect,
  useState,
} from "react";

import {
  Save,
  Building2,
  Phone,
  MapPin,
  Tag,
  CalendarDays,
  CreditCard,
  Receipt,
  Hash,
} from "lucide-react";

import "./Settings.css";

import {
  getMandalConfig,
  saveMandalConfig,
} from "../utils/mandalConfig";

import { isAdmin } from "../utils/permissions";

function Settings() {

  const admin = isAdmin();
  // ============================================================
  // FORM DATA
  // ============================================================

  const [formData, setFormData] = useState({
    name: "",
    tagline: "",
    eventYear: 2027,
    address: "",
    mobile: "",
    upiId: "",
    receiptPrefix: "REC",
    receiptStartNumber: 1,
  });

  // ============================================================
  // STATES
  // ============================================================

  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  // ============================================================
  // LOAD SETTINGS
  // ============================================================

  const loadSettings = () => {
    const config = getMandalConfig();

    setFormData({
      name: config?.name || "",

      tagline: config?.tagline || "",

      eventYear:
        Number(config?.eventYear) || 2027,

      address: config?.address || "",

      mobile: config?.mobile || "",

      upiId: config?.upiId || "",

      receiptPrefix:
        config?.receiptPrefix || "REC",

      receiptStartNumber:
        Number(
          config?.receiptStartNumber
        ) || 1,
    });
  };

  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {
    loadSettings();
  }, []);

  // ============================================================
  // LISTEN FOR SETTINGS UPDATE
  // ============================================================

  useEffect(() => {
    const handleSettingsUpdate = () => {
      loadSettings();
    };

    window.addEventListener(
      "mandal-settings-updated",
      handleSettingsUpdate
    );

    window.addEventListener(
      "mandal-data-updated",
      handleSettingsUpdate
    );

    window.addEventListener(
      "storage",
      handleSettingsUpdate
    );

    return () => {
      window.removeEventListener(
        "mandal-settings-updated",
        handleSettingsUpdate
      );

      window.removeEventListener(
        "mandal-data-updated",
        handleSettingsUpdate
      );

      window.removeEventListener(
        "storage",
        handleSettingsUpdate
      );
    };
  }, []);

  // ============================================================
  // HANDLE INPUT
  // ============================================================

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    let finalValue = value;

    // Mobile
    if (name === "mobile") {
      finalValue = value
        .replace(/\D/g, "")
        .slice(0, 10);
    }

    // Event Year
    if (name === "eventYear") {
      finalValue = value
        .replace(/\D/g, "")
        .slice(0, 4);
    }

    // Receipt starting number
    if (
      name === "receiptStartNumber"
    ) {
      finalValue = value
        .replace(/\D/g, "")
        .slice(0, 6);
    }

    // Receipt prefix
    if (name === "receiptPrefix") {
      finalValue = value
        .replace(/[^a-zA-Z0-9]/g, "")
        .toUpperCase()
        .slice(0, 10);
    }

    setFormData((previous) => ({
      ...previous,
      [name]: finalValue,
    }));

    setSaved(false);
  };

  // ============================================================
  // VALIDATE FORM
  // ============================================================

  const validateForm = () => {
    if (!formData.name.trim()) {
      alert(
        "कृपया मंडळाचे नाव भरा."
      );

      return false;
    }

    if (
      formData.mobile &&
      !/^\d{10}$/.test(
        formData.mobile
      )
    ) {
      alert(
        "कृपया 10 अंकी Mobile Number टाका."
      );

      return false;
    }

    const year =
      Number(formData.eventYear);

    if (
      !year ||
      year < 2020 ||
      year > 2100
    ) {
      alert(
        "कृपया योग्य Event Year टाका."
      );

      return false;
    }

    if (
      !String(
        formData.receiptPrefix || ""
      ).trim()
    ) {
      alert(
        "कृपया Receipt Prefix टाका."
      );

      return false;
    }

    const startNumber =
      Number(
        formData.receiptStartNumber
      );

    if (
      !startNumber ||
      startNumber < 1
    ) {
      alert(
        "Receipt Starting Number 1 किंवा त्यापेक्षा जास्त असावा."
      );

      return false;
    }

    return true;
  };

  // ============================================================
  // SAVE SETTINGS
  // ============================================================

  const handleSave = () => {
    if (!isAdmin()) {
  alert(
    "तुम्हाला Settings बदलण्याची permission नाही."
  );
  return;
}
    if (saving) {
      return;
    }

    if (!validateForm()) {
      return;
    }

    setSaving(true);
    setSaved(false);

    try {
      const savedConfig =
        saveMandalConfig({
          name:
            formData.name.trim(),

          tagline:
            formData.tagline.trim(),

          eventYear:
            Number(
              formData.eventYear
            ),

          address:
            formData.address.trim(),

          mobile:
            formData.mobile.trim(),

          upiId:
            formData.upiId.trim(),

          receiptPrefix:
            formData.receiptPrefix
              .trim()
              .toUpperCase(),

          receiptStartNumber:
            Number(
              formData.receiptStartNumber
            ),
        });

      setFormData({
        name:
          savedConfig?.name || "",

        tagline:
          savedConfig?.tagline || "",

        eventYear:
          Number(
            savedConfig?.eventYear
          ) || 2027,

        address:
          savedConfig?.address || "",

        mobile:
          savedConfig?.mobile || "",

        upiId:
          savedConfig?.upiId || "",

        receiptPrefix:
          savedConfig?.receiptPrefix ||
          "REC",

        receiptStartNumber:
          Number(
            savedConfig?.receiptStartNumber
          ) || 1,
      });

      setSaved(true);
      setSaving(false);

      setTimeout(() => {
        setSaved(false);
      }, 3000);
    } catch (error) {
      console.error(
        "Settings save error:",
        error
      );

      alert(
        "माहिती Save करताना error आला."
      );

      setSaving(false);
    }
  };

  // ============================================================
  // HANDLE ENTER
  // ============================================================

  const handleKeyDown = (event) => {
    if (
      event.key === "Enter" &&
      event.target.tagName !== "TEXTAREA"
    ) {
      event.preventDefault();
      handleSave();
    }
  };

  // ============================================================
  // RECEIPT PREVIEW
  // ============================================================

  const previewReceiptNumber =
    `${
      formData.receiptPrefix ||
      "REC"
    }-${
      Number(
        formData.eventYear
      ) || 2027
    }-${
      String(
        Number(
          formData.receiptStartNumber
        ) || 1
      ).padStart(5, "0")
    }`;

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="settings-page">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="page-header">
        <div>
          <h1>Settings</h1>

          <p>
            मंडळाची माहिती व्यवस्थापित करा
          </p>
        </div>
      </div>

      {/* ======================================================
          MAIN CARD
      ====================================================== */}

      <div className="settings-card">

        <div className="settings-title">

          <div className="settings-icon">
            <Building2 size={22} />
          </div>

          <div>
            <h2>
              मंडळाची माहिती
            </h2>

            <p>
              ही माहिती Dashboard, Receipt,
              WhatsApp आणि Print मध्ये वापरली जाईल.
            </p>
          </div>

        </div>

        <div className="settings-form">

          {/* ==================================================
              MANDAL NAME
          ================================================== */}

          <div className="form-group">

            <label>
              <Building2 size={15} />

              मंडळाचे नाव

              <span>*</span>
            </label>

            <input
              type="text"
              name="name"
              value={formData.name}
              disabled={!admin}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder="उदा. लक्ष्मी तरुण मित्र मंडळ"
            />

          </div>

          {/* ==================================================
              TAGLINE
          ================================================== */}

          <div className="form-group">

            <label>
              <Tag size={15} />

              Tagline
            </label>

            <input
              type="text"
              name="tagline"
              value={formData.tagline}
              disabled={!admin}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder="उदा. गणपती उत्सव"
            />

          </div>

          {/* ==================================================
              EVENT YEAR
          ================================================== */}

          <div className="form-group">

            <label>
              <CalendarDays size={15} />

              उत्सवाचे वर्ष

              <span>*</span>
            </label>

            <input
              type="number"
              name="eventYear"
              value={formData.eventYear}
              disabled={!admin}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              min="2020"
              max="2100"
              placeholder="2027"
            />

            <small>
              उदाहरण: 2027
            </small>

          </div>

          {/* ==================================================
              ADDRESS
          ================================================== */}

          <div className="form-group">

            <label>
              <MapPin size={15} />

              पत्ता
            </label>

            <input
              type="text"
              name="address"
              value={formData.address}
              disabled={!admin}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder="उदा. बस स्टँड, गणोरे, ता. अकोले"
            />

          </div>

          {/* ==================================================
              MOBILE
          ================================================== */}

          <div className="form-group">

            <label>
              <Phone size={15} />

              मंडळाचा Mobile Number
            </label>

            <input
              type="tel"
              name="mobile"
              value={formData.mobile}
              disabled={!admin}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              maxLength={10}
              inputMode="numeric"
              placeholder="उदा. 9307180154"
            />

          </div>

          {/* ==================================================
              UPI ID
          ================================================== */}

          <div className="form-group">

            <label>
              <CreditCard size={15} />

              मंडळाचा UPI ID
            </label>

            <input
              type="text"
              name="upiId"
              value={formData.upiId}
              disabled={!admin}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder="उदा. laxmitarunmandal@upi"
            />

            <small>
              भविष्यात QR / Online Payment साठी वापरता येईल.
            </small>

          </div>

          {/* ==================================================
              RECEIPT PREFIX
          ================================================== */}

          <div className="form-group">

            <label>
              <Receipt size={15} />

              Receipt Prefix

              <span>*</span>
            </label>

            <input
              type="text"
              name="receiptPrefix"
              value={
                formData.receiptPrefix
              }
              disabled={!admin}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              maxLength={10}
              placeholder="REC"
            />

            <small>
              उदाहरण: REC
            </small>

          </div>

          {/* ==================================================
              RECEIPT START NUMBER
          ================================================== */}

          <div className="form-group">

            <label>
              <Hash size={15} />

              Receipt Starting Number

              <span>*</span>
            </label>

            <input
              type="number"
              name="receiptStartNumber"
              value={
                formData.receiptStartNumber
              }
              disabled={!admin}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              min="1"
              placeholder="1"
            />

            <small>
              उदाहरण: 1 → REC-2027-00001
            </small>

          </div>

          {/* ==================================================
              RECEIPT PREVIEW
          ================================================== */}

          <div
            style={{
              marginTop: "10px",
              padding: "18px",
              borderRadius: "12px",
              background:
                "#f8fafc",
              border:
                "1px solid #e2e8f0",
            }}
          >

            <div
              style={{
                fontSize: "12px",
                color: "#64748b",
                marginBottom: "6px",
              }}
            >
              Receipt Preview
            </div>

            <strong
              style={{
                fontSize: "20px",
                color: "#172033",
              }}
            >
              {previewReceiptNumber}
            </strong>

          </div>

          {/* ==================================================
              SAVE
          ================================================== */}

          {admin && (
<div className="settings-actions">

  <button
    type="button"
    className="save-settings-btn"
    onClick={handleSave}
    disabled={saving}
  >
    <Save size={17} />

    {saving
      ? "Saving..."
      : "माहिती Save करा"}
  </button>

  {saved && (
    <span className="save-success">
      ✓ माहिती successfully save झाली
    </span>
  )}

</div>
)}

        </div>
      </div>

      {/* ======================================================
          PREVIEW
      ====================================================== */}

      <div className="settings-preview">

        <div>

          <span>
            PREVIEW
          </span>

          <h3>
            {formData.name ||
              "मंडळाचे नाव"}
          </h3>

          <p>
            {formData.tagline ||
              "गणपती उत्सव"}
            {" "}
            {formData.eventYear}
          </p>

          {formData.address && (
            <small>
              📍 {formData.address}
            </small>
          )}

          {formData.mobile && (
            <small>
              📞 {formData.mobile}
            </small>
          )}

          {formData.upiId && (
            <small>
              💳 {formData.upiId}
            </small>
          )}

        </div>

      </div>

    </div>
  );
}

export default Settings;