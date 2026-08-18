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
} from "lucide-react";

import "./Settings.css";

import {
  getMandalConfig,
  saveMandalConfig,
} from "../utils/mandalConfig";


function Settings() {

  /* =====================================================
     FORM DATA
  ===================================================== */

  const [formData, setFormData] =
    useState({
      name: "",
      tagline: "",
      address: "",
      mobile: "",
    });


  /* =====================================================
     STATES
  ===================================================== */

  const [saved, setSaved] =
    useState(false);

  const [saving, setSaving] =
    useState(false);


  /* =====================================================
     LOAD SETTINGS
  ===================================================== */

  const loadSettings = () => {

    const config =
      getMandalConfig();

    setFormData({
      name:
        config.name || "",

      tagline:
        config.tagline || "",

      address:
        config.address || "",

      mobile:
        config.mobile || "",
    });

  };


  /* =====================================================
     INITIAL LOAD
  ===================================================== */

  useEffect(() => {

    loadSettings();

  }, []);


  /* =====================================================
     LISTEN FOR SETTINGS UPDATE
  ===================================================== */

  useEffect(() => {

    const handleSettingsUpdate =
      () => {

        loadSettings();

      };


    window.addEventListener(
      "mandal-settings-updated",
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
        "storage",
        handleSettingsUpdate
      );

    };

  }, []);


  /* =====================================================
     HANDLE INPUT
  ===================================================== */

  const handleChange = (e) => {

    const {
      name,
      value,
    } = e.target;


    let finalValue =
      value;


    /* -------------------------------------------------
       Mobile number - only digits
    ------------------------------------------------- */

    if (
      name === "mobile"
    ) {

      finalValue =
        value
          .replace(/\D/g, "")
          .slice(0, 10);

    }


    setFormData(
      (previous) => ({
        ...previous,
        [name]:
          finalValue,
      })
    );


    setSaved(false);

  };


  /* =====================================================
     VALIDATE
  ===================================================== */

  const validateForm = () => {

    if (
      !formData.name.trim()
    ) {

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


    return true;

  };


  /* =====================================================
     SAVE
  ===================================================== */

  const handleSave = () => {
  setSaving(true);
  setSaved(false);

  /* =====================================================
     VALIDATION
  ===================================================== */

  if (!formData.name.trim()) {
    alert("कृपया मंडळाचे नाव भरा.");
    setSaving(false);
    return;
  }

  if (
    formData.mobile &&
    !/^\d{10}$/.test(formData.mobile)
  ) {
    alert("कृपया 10 अंकी Mobile Number टाका.");
    setSaving(false);
    return;
  }

  /* =====================================================
     SAVE CONFIG
  ===================================================== */

  const savedConfig = saveMandalConfig({
    name: formData.name.trim(),
    tagline: formData.tagline.trim(),
    address: formData.address.trim(),
    mobile: formData.mobile.trim(),
  });

  /* =====================================================
     NOTIFY ALL PAGES
  ===================================================== */

  window.dispatchEvent(
    new Event("mandal-data-updated")
  );

  window.dispatchEvent(
    new Event("mandal-settings-updated")
  );

  /* =====================================================
     UPDATE LOCAL FORM
  ===================================================== */

  setFormData({
    name: savedConfig.name || "",
    tagline: savedConfig.tagline || "",
    address: savedConfig.address || "",
    mobile: savedConfig.mobile || "",
  });

  /* =====================================================
     SUCCESS
  ===================================================== */

  setSaving(false);
  setSaved(true);

  setTimeout(() => {
    setSaved(false);
  }, 3000);
};


  /* =====================================================
     HANDLE ENTER
  ===================================================== */

  const handleKeyDown = (e) => {

    if (
      e.key === "Enter"
    ) {

      e.preventDefault();

      handleSave();

    }

  };


  /* =====================================================
     RENDER
  ===================================================== */

  return (

    <div className="settings-page">


      {/* =================================================
          HEADER
      ================================================= */}

      <div className="page-header">

        <div>

          <h1>
            Settings
          </h1>

          <p>
            मंडळाची माहिती व्यवस्थापित करा
          </p>

        </div>

      </div>


      {/* =================================================
          SETTINGS CARD
      ================================================= */}

      <div className="settings-card">


        {/* =================================================
            TITLE
        ================================================= */}

        <div className="settings-title">

          <div className="settings-icon">

            <Building2
              size={22}
            />

          </div>


          <div>

            <h2>
              मंडळाची माहिती
            </h2>

            <p>
              ही माहिती Dashboard,
              Receipt, WhatsApp आणि
              Print मध्ये वापरली जाईल.
            </p>

          </div>

        </div>


        {/* =================================================
            FORM
        ================================================= */}

        <div className="settings-form">


          {/* =================================================
              MANDAL NAME
          ================================================= */}

          <div className="form-group">

            <label>
              <Building2
                size={15}
              />

              मंडळाचे नाव

              <span>
                *
              </span>

            </label>


            <input
              type="text"
              name="name"
              value={
                formData.name
              }
              onChange={
                handleChange
              }
              onKeyDown={
                handleKeyDown
              }
              placeholder="उदा. लक्ष्मी मित्र मंडळ, गणोरे."
            />

          </div>


          {/* =================================================
              TAGLINE
          ================================================= */}

          <div className="form-group">

            <label>

              <Tag
                size={15}
              />

              Tagline

            </label>


            <input
              type="text"
              name="tagline"
              value={
                formData.tagline
              }
              onChange={
                handleChange
              }
              onKeyDown={
                handleKeyDown
              }
              placeholder="उदा. गणपती उत्सव 2026"
            />

          </div>


          {/* =================================================
              ADDRESS
          ================================================= */}

          <div className="form-group">

            <label>

              <MapPin
                size={15}
              />

              पत्ता

            </label>


            <input
              type="text"
              name="address"
              value={
                formData.address
              }
              onChange={
                handleChange
              }
              onKeyDown={
                handleKeyDown
              }
              placeholder="उदा. गणोरे"
            />

          </div>


          {/* =================================================
              MOBILE
          ================================================= */}

          <div className="form-group">

            <label>

              <Phone
                size={15}
              />

              मंडळाचा Mobile Number

            </label>


            <input
              type="tel"
              name="mobile"
              value={
                formData.mobile
              }
              onChange={
                handleChange
              }
              onKeyDown={
                handleKeyDown
              }
              maxLength={10}
              inputMode="numeric"
              placeholder="उदा. 9307180154"
            />

          </div>


          {/* =================================================
              SAVE ACTION
          ================================================= */}

          <div className="settings-actions">


            <button
              type="button"
              className="save-settings-btn"
              onClick={
                handleSave
              }
              disabled={
                saving
              }
            >

              <Save
                size={17}
              />


              {saving
                ? "Saving..."
                : "माहिती Save करा"}


            </button>


            {saved && (

              <span
                className="save-success"
              >

                ✓ माहिती successfully
                save झाली

              </span>

            )}

          </div>

        </div>

      </div>


      {/* =================================================
          PREVIEW
      ================================================= */}

      <div className="settings-preview">

        <div>

          <span>
            Preview
          </span>

          <h3>
            {formData.name ||
              "मंडळाचे नाव"}
          </h3>

          <p>
            {formData.tagline ||
              "Tagline"}
          </p>

          {formData.address && (

            <small>
              📍 {formData.address}
            </small>

          )}

        </div>

      </div>


    </div>

  );

}


export default Settings;