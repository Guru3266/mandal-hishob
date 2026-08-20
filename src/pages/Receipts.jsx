import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Search,
  Eye,
  Printer,
  MessageCircle,
  CalendarDays,
  ReceiptText,
  IndianRupee,
  Plus,
  X,
} from "lucide-react";

import {
  getReceipts,
  addReceipt,
  deleteReceipt,
  getReceiptById
} from "../utils/supabaseReceipts";

import {
  getMembers
} from "../utils/supabaseMembers";

import useMandalConfig
  from "../hooks/useMandalConfig";

import ReceiptModal from "./ReceiptModal";

import "./Receipts.css";

// ============================================================
// RECEIPTS PAGE
// ============================================================

function Receipts() {

  // ============================================================
  // STATE
  // ============================================================

  const [receipts, setReceipts] =
    useState([]);

  const [members, setMembers] =
    useState([]);

  const [search, setSearch] =
    useState("");

  const [modeFilter, setModeFilter] =
    useState("All");

  const [dateFilter, setDateFilter] =
    useState("");

  const [selectedReceipt, setSelectedReceipt] =
    useState(null);

  const mandalConfig =
  useMandalConfig();

  const [loading, setLoading] =
    useState(true);

  const [membersLoading, setMembersLoading] =
    useState(true);

  // ============================================================
  // ADD RECEIPT STATE
  // ============================================================

  const [showAddModal, setShowAddModal] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [form, setForm] = useState({
    memberId: "",
    amount: "",
    mode: "Cash",
    date: new Date()
      .toISOString()
      .slice(0, 10),
  });

  // ============================================================
  // MANDAL CONFIG
  // ============================================================

  const mandalName =
    mandalConfig?.name ||
    "मंडळाचे नाव";

  const mandalTagline =
    mandalConfig?.tagline ||
    "गणपती उत्सव 2026";

  // ============================================================
  // LOAD RECEIPTS
  // ============================================================

  const loadData = async () => {

    try {

      setLoading(true);

      const receiptData =
        await getReceipts();

      setReceipts(
        Array.isArray(receiptData)
          ? receiptData
          : []
      );

   

    } catch (error) {

      console.error(
        "Receipts loading error:",
        error
      );

      setReceipts([]);

    } finally {

      setLoading(false);

    }
  };

  // ============================================================
  // LOAD MEMBERS
  // ============================================================

  const loadMembers = async () => {

    try {

      setMembersLoading(true);

      const memberData =
        await getMembers();

      setMembers(
        Array.isArray(memberData)
          ? memberData
          : []
      );

    } catch (error) {

      console.error(
        "Members loading error:",
        error
      );

      setMembers([]);

    } finally {

      setMembersLoading(false);

    }
  };

  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {

    loadData();
    loadMembers();

    const handleUpdate = () => {
      loadData();
      loadMembers();
    };

    window.addEventListener(
      "mandal-data-updated",
      handleUpdate
    );

    window.addEventListener(
      "storage",
      handleUpdate
    );

    return () => {

      window.removeEventListener(
        "mandal-data-updated",
        handleUpdate
      );

      window.removeEventListener(
        "storage",
        handleUpdate
      );

    };

  }, []);

  // ============================================================
  // NORMALIZE DATE
  // ============================================================

  const normalizeDate = (value) => {

    if (!value) {
      return "";
    }

    const dateString =
      String(value).trim();

    // YYYY-MM-DD

    if (
      /^\d{4}-\d{2}-\d{2}$/.test(
        dateString
      )
    ) {

      return dateString;

    }

    // ISO date

    if (
      /^\d{4}-\d{2}-\d{2}T/.test(
        dateString
      )
    ) {

      return dateString.slice(
        0,
        10
      );

    }

    // DD-MM-YYYY

    const dashMatch =
      dateString.match(
        /^(\d{2})-(\d{2})-(\d{4})$/
      );

    if (dashMatch) {

      return `${dashMatch[3]}-${dashMatch[2]}-${dashMatch[1]}`;

    }

    // DD/MM/YYYY

    const slashMatch =
      dateString.match(
        /^(\d{2})\/(\d{2})\/(\d{4})$/
      );

    if (slashMatch) {

      return `${slashMatch[3]}-${slashMatch[2]}-${slashMatch[1]}`;

    }

    return dateString;
  };

  // ============================================================
  // FILTERED RECEIPTS
  // ============================================================

  const filteredReceipts =
    useMemo(() => {

      return receipts.filter(
        (receipt) => {

          const keyword =
            search
              .trim()
              .toLowerCase();

          const matchesSearch =
            !keyword ||

            String(
              receipt.id || ""
            )
              .toLowerCase()
              .includes(keyword) ||

            String(
              receipt.receiptNo || ""
            )
              .toLowerCase()
              .includes(keyword) ||

            String(
              receipt.memberName || ""
            )
              .toLowerCase()
              .includes(keyword) ||

            String(
              receipt.memberId || ""
            )
              .toLowerCase()
              .includes(keyword) ||

            String(
              receipt.memberCode || ""
            )
              .toLowerCase()
              .includes(keyword) ||

            String(
              receipt.mobile || ""
            )
              .toLowerCase()
              .includes(keyword);

          const matchesMode =
            modeFilter === "All" ||
            String(
              receipt.mode || ""
            ).toLowerCase() ===
              String(
                modeFilter
              ).toLowerCase();

          const receiptDate =
            normalizeDate(
              receipt.date
            );

          const selectedDate =
            normalizeDate(
              dateFilter
            );

          const matchesDate =
            !dateFilter ||
            receiptDate ===
              selectedDate;

          return (
            matchesSearch &&
            matchesMode &&
            matchesDate
          );

        }
      );

    }, [
      receipts,
      search,
      modeFilter,
      dateFilter,
    ]);

  // ============================================================
  // TOTAL AMOUNT
  // ============================================================

  const totalAmount =
    filteredReceipts.reduce(
      (total, receipt) => {

        return (
          total +
          Number(
            receipt.amount || 0
          )
        );

      },
      0
    );

  // ============================================================
  // MONEY FORMAT
  // ============================================================

  const money = (amount) => {

    return Number(
      amount || 0
    ).toLocaleString(
      "en-IN"
    );

  };

  // ============================================================
  // DISPLAY DATE
  // ============================================================

  const formatDate = (date) => {

    const normalized =
      normalizeDate(date);

    if (!normalized) {
      return "-";
    }

    const parts =
      normalized.split("-");

    if (parts.length !== 3) {
      return date;
    }

    return `${parts[2]}-${parts[1]}-${parts[0]}`;

  };

  // ============================================================
  // ADD RECEIPT FORM CHANGE
  // ============================================================

  const handleFormChange = (event) => {

    const {
      name,
      value,
    } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

  };

  // ============================================================
  // OPEN ADD MODAL
  // ============================================================

  const openAddModal = () => {

    setForm({
      memberId: "",
      amount: "",
      mode: "Cash",
      date: new Date()
        .toISOString()
        .slice(0, 10),
    });

    setShowAddModal(true);

  };

  // ============================================================
  // CLOSE ADD MODAL
  // ============================================================

  const closeAddModal = () => {

    if (saving) {
      return;
    }

    setShowAddModal(false);

  };

  // ============================================================
  // ADD RECEIPT
  // ============================================================

  const handleAddReceipt = async (
    event
  ) => {

    event.preventDefault();

    // ----------------------------------------------------------
    // MEMBER VALIDATION
    // ----------------------------------------------------------

    if (!form.memberId) {

      alert(
        "कृपया वर्गणीदार निवडा."
      );

      return;
    }

    // ----------------------------------------------------------
    // AMOUNT VALIDATION
    // ----------------------------------------------------------

    const amount =
      Number(form.amount);

    if (
      !form.amount ||
      !Number.isFinite(amount) ||
      amount <= 0
    ) {

      alert(
        "कृपया योग्य रक्कम टाका."
      );

      return;
    }

    // ----------------------------------------------------------
    // MODE VALIDATION
    // ----------------------------------------------------------

    const allowedModes = [
      "Cash",
      "UPI",
      "Bank",
    ];

    if (
      !allowedModes.includes(
        form.mode
      )
    ) {

      alert(
        "कृपया योग्य Payment Mode निवडा."
      );

      return;
    }

    // ----------------------------------------------------------
    // DATE VALIDATION
    // ----------------------------------------------------------

    if (!form.date) {

      alert(
        "कृपया तारीख निवडा."
      );

      return;
    }

    try {

      setSaving(true);

      // --------------------------------------------------------
      // SUPABASE INSERT
      // --------------------------------------------------------

      await addReceipt({
        memberId: form.memberId,
        amount,
        mode: form.mode,
        date: form.date,
      });

      // --------------------------------------------------------
      // CLOSE MODAL
      // --------------------------------------------------------

      setShowAddModal(false);

      // --------------------------------------------------------
      // RESET FORM
      // --------------------------------------------------------

      setForm({
        memberId: "",
        amount: "",
        mode: "Cash",
        date: new Date()
          .toISOString()
          .slice(0, 10),
      });

      // --------------------------------------------------------
      // REFRESH RECEIPTS
      // --------------------------------------------------------

      await loadData();

      // --------------------------------------------------------
      // REFRESH MEMBERS
      // --------------------------------------------------------

      await loadMembers();

      // --------------------------------------------------------
      // EVENT FOR DASHBOARD / OTHER PAGES
      // --------------------------------------------------------

      window.dispatchEvent(
        new Event(
          "mandal-data-updated"
        )
      );

      alert(
        "पावती यशस्वीपणे नोंदवली."
      );

    } catch (error) {

      console.error(
        "Add receipt error:",
        error
      );

      alert(
        error?.message ||
          "पावती नोंदवताना काहीतरी चूक झाली."
      );

    } finally {

      setSaving(false);

    }

  };

  // ============================================================
  // PRINT RECEIPT
  // ============================================================

  const printReceipt = (receipt) => {

    const printWindow =
      window.open(
        "",
        "_blank",
        "width=700,height=800"
      );

    if (!printWindow) {

      alert(
        "Popup blocked आहे. Browser मध्ये popup allow करा."
      );

      return;
    }

    const safeMandalName =
      mandalName;

    const safeTagline =
      mandalTagline;

    const safeAddress =
      mandalConfig?.address || "";

    const safeMobile =
      receipt.mobile || "-";

    const safeReceiptNo =
      receipt.receiptNo ||
      receipt.id ||
      "-";

    printWindow.document.write(`

      <!DOCTYPE html>

      <html>

        <head>

          <title>
            ${safeMandalName}
            - Receipt ${safeReceiptNo}
          </title>

          <style>

            * {
              box-sizing: border-box;
            }

            body {
              margin: 0;
              padding: 40px;
              font-family: Arial, sans-serif;
              color: #172033;
              background: white;
            }

            .receipt {
              max-width: 600px;
              margin: auto;
              border: 1px solid #dfe4ea;
              border-radius: 12px;
              padding: 35px;
            }

            .header {
              text-align: center;
              border-bottom: 2px solid #f59e0b;
              padding-bottom: 20px;
            }

            .header h1 {
              margin: 0;
              font-size: 26px;
            }

            .header p {
              margin: 6px 0;
              color: #64748b;
            }

            .header strong {
              display: block;
              margin-top: 8px;
              font-size: 18px;
            }

            .address {
              margin-top: 5px;
              color: #64748b;
              font-size: 12px;
            }

            .receipt-no {
              text-align: right;
              margin: 20px 0;
              color: #64748b;
              font-size: 13px;
            }

            .receipt-no strong {
              color: #172033;
            }

            .row {
              display: flex;
              justify-content: space-between;
              gap: 20px;
              padding: 13px 0;
              border-bottom: 1px solid #eef0f4;
              font-size: 14px;
            }

            .row span {
              color: #64748b;
            }

            .row strong {
              text-align: right;
            }

            .amount {
              text-align: center;
              margin-top: 30px;
            }

            .amount span {
              display: block;
              color: #64748b;
              font-size: 13px;
            }

            .amount strong {
              display: block;
              margin-top: 6px;
              font-size: 32px;
              color: #15803d;
            }

            .footer {
              text-align: center;
              margin-top: 35px;
              color: #64748b;
              font-size: 12px;
              line-height: 1.7;
            }

          </style>

        </head>

        <body>

          <div class="receipt">

            <div class="header">

              <h1>
                ${safeMandalName}
              </h1>

              <p>
                ${safeTagline}
              </p>

              ${
                safeAddress
                  ? `
                    <div class="address">
                      ${safeAddress}
                    </div>
                  `
                  : ""
              }

              <strong>
                जमा पावती
              </strong>

            </div>

            <div class="receipt-no">

              Receipt No.

              <strong>
                ${safeReceiptNo}
              </strong>

            </div>

            <div class="row">

              <span>
                वर्गणीदार
              </span>

              <strong>
                ${receipt.memberName || "-"}
              </strong>

            </div>

            <div class="row">

              <span>
                Member ID
              </span>

              <strong>
                ${receipt.memberId || "-"}
              </strong>

            </div>

            <div class="row">

              <span>
                Mobile
              </span>

              <strong>
                ${safeMobile}
              </strong>

            </div>

            <div class="row">

              <span>
                Payment Mode
              </span>

              <strong>
                ${receipt.mode || "-"}
              </strong>

            </div>

            <div class="row">

              <span>
                Date
              </span>

              <strong>
                ${formatDate(
                  receipt.date
                )}
              </strong>

            </div>

            <div class="row">

              <span>
                Remark
              </span>

              <strong>
                ${receipt.remark || "-"}
              </strong>

            </div>

            <div class="amount">

              <span>
                जमा रक्कम
              </span>

              <strong>
                ₹${money(
                  receipt.amount
                )}
              </strong>

            </div>

            <div class="footer">

              धन्यवाद! 🙏

              <br />

              ${safeMandalName}

              ${
                safeAddress
                  ? `
                    <br />
                    ${safeAddress}
                  `
                  : ""
              }

            </div>

          </div>

          <script>

            window.onload =
              function () {
                window.print();
              };

          </script>

        </body>

      </html>

    `);

    printWindow.document.close();

  };

  // ============================================================
  // WHATSAPP
  // ============================================================

  const sendWhatsApp = (
    receipt
  ) => {

    const mobile =
      receipt.mobile || "";

    const phone =
      String(mobile)
        .replace(/\D/g, "");

    if (phone.length !== 10) {

      alert(
        "या वर्गणीदाराचा valid 10 अंकी mobile number उपलब्ध नाही."
      );

      return;
    }

    const message = `

🙏 ${mandalName}

${mandalTagline}

${
  mandalConfig?.address
    ? `पत्ता: ${mandalConfig.address}`
    : ""
}

🧾 जमा पावती

पावती क्र.: ${
      receipt.receiptNo ||
      receipt.id ||
      "-"
    }

वर्गणीदार: ${
      receipt.memberName ||
      "-"
    }

Member ID: ${
      receipt.memberId ||
      "-"
    }

Mobile: ${mobile}

जमा रक्कम: ₹${money(
      receipt.amount
    )}

Payment Mode: ${
      receipt.mode ||
      "-"
    }

Date: ${
      formatDate(
        receipt.date
      )
    }

Remark: ${
      receipt.remark ||
      "-"
    }

${mandalName} च्या वतीने धन्यवाद 🙏

    `.trim();

    const url =
      `https://wa.me/91${phone}?text=${encodeURIComponent(
        message
      )}`;

    window.open(
      url,
      "_blank",
      "noopener,noreferrer"
    );

  };

  // ============================================================
  // RENDER
  // ============================================================

  return (

    <div className="receipts-page">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="receipts-header">

        <div>

          <h1>
            पावत्या
          </h1>

          <p>
            {mandalName} —
            सर्व जमा रकमेच्या पावत्या व्यवस्थापित करा
          </p>

        </div>

        <button
          type="button"
          className="add-receipt-btn"
          onClick={openAddModal}
        >

          <Plus
            size={18}
          />

          पावती नोंदवा

        </button>

      </div>

      {/* ======================================================
          SUMMARY
      ====================================================== */}

      <div className="receipts-summary">

        {/* TOTAL RECEIPTS */}

        <div className="receipt-summary-card">

          <div className="receipt-summary-icon blue">

            <ReceiptText
              size={21}
            />

          </div>

          <div>

            <span>
              एकूण पावत्या
            </span>

            <strong>
              {filteredReceipts.length}
            </strong>

          </div>

        </div>

        {/* TOTAL AMOUNT */}

        <div className="receipt-summary-card">

          <div className="receipt-summary-icon green">

            <IndianRupee
              size={21}
            />

          </div>

          <div>

            <span>
              एकूण रक्कम
            </span>

            <strong>
              ₹{money(
                totalAmount
              )}
            </strong>

          </div>

        </div>

        {/* UPI */}

        <div className="receipt-summary-card">

          <div className="receipt-summary-icon purple">

            <ReceiptText
              size={21}
            />

          </div>

          <div>

            <span>
              UPI
            </span>

            <strong>

              {
                filteredReceipts.filter(
                  (item) =>
                    item.mode ===
                    "UPI"
                ).length
              }

            </strong>

          </div>

        </div>

        {/* CASH */}

        <div className="receipt-summary-card">

          <div className="receipt-summary-icon yellow">

            <ReceiptText
              size={21}
            />

          </div>

          <div>

            <span>
              Cash
            </span>

            <strong>

              {
                filteredReceipts.filter(
                  (item) =>
                    item.mode ===
                    "Cash"
                ).length
              }

            </strong>

          </div>

        </div>

      </div>

      {/* ======================================================
          PANEL
      ====================================================== */}

      <div className="receipts-panel">

        <div className="receipts-panel-header">

          <div>

            <h2>
              सर्व पावत्या
            </h2>

            <p>
              {filteredReceipts.length}
              {" "}
              records
            </p>

          </div>

          {/* FILTERS */}

          <div className="receipts-filters">

            {/* SEARCH */}

            <div className="receipts-search">

              <Search
                size={16}
              />

              <input
                type="text"
                placeholder="Receipt, नाव किंवा Member ID..."
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
              />

            </div>

            {/* MODE */}

            <select
              className="receipt-filter"
              value={modeFilter}
              onChange={(event) =>
                setModeFilter(
                  event.target.value
                )
              }
            >

              <option value="All">
                All Modes
              </option>

              <option value="Cash">
                Cash
              </option>

              <option value="UPI">
                UPI
              </option>

              <option value="Bank">
                Bank
              </option>

            </select>

            {/* DATE */}

            <div className="receipt-date-filter">

              <CalendarDays
                size={15}
              />

              <input
                type="date"
                value={dateFilter}
                onChange={(event) =>
                  setDateFilter(
                    event.target.value
                  )
                }
              />

            </div>

            {/* CLEAR DATE */}

            {dateFilter && (

              <button
                type="button"
                className="receipt-refresh"
                title="Clear Date"
                onClick={() =>
                  setDateFilter("")
                }
              >

                ×

              </button>

            )}

            {/* REFRESH */}

            <button
              type="button"
              className="receipt-refresh"
              onClick={loadData}
              disabled={loading}
              title="Refresh"
            >

              ↻

            </button>

          </div>

        </div>

        {/* ===================================================
            TABLE
        =================================================== */}

        <div className="receipts-table-scroll">

          <table className="receipts-table">

            <thead>

              <tr>

                <th>
                  Receipt No.
                </th>

                <th>
                  वर्गणीदार
                </th>

                <th>
                  Amount
                </th>

                <th>
                  Mode
                </th>

                <th>
                  Date
                </th>

                <th>
                  Remark
                </th>

                <th>
                  Actions
                </th>

              </tr>

            </thead>

            <tbody>

              {/* LOADING */}

              {loading ? (

                <tr>

                  <td
                    colSpan="7"
                    style={{
                      padding:
                        "50px",
                      textAlign:
                        "center",
                    }}
                  >

                    पावत्या loading होत आहेत...

                  </td>

                </tr>

              ) : filteredReceipts.length === 0 ? (

                /* EMPTY */

                <tr>

                  <td
                    colSpan="7"
                    style={{
                      padding: 0,
                    }}
                  >

                    <div className="receipts-empty">

                      <ReceiptText
                        size={35}
                      />

                      <strong>
                        कोणतीही पावती सापडली नाही
                      </strong>

                      <span>
                        Supabase मधून जमा केलेली
                        पावती येथे दिसेल.
                      </span>

                    </div>

                  </td>

                </tr>

              ) : (

                filteredReceipts.map(
                  (receipt) => {

                    const receiptNumber =
                      receipt.receiptNo ||
                      receipt.id ||
                      "-";

                    return (

                      <tr
                        key={
                          `${receiptNumber}-${receipt.id}`
                        }
                      >

                        {/* RECEIPT NUMBER */}

                        <td>

                          <strong
                            className="receipt-number"
                          >

                            {receiptNumber}

                          </strong>

                        </td>

                        {/* MEMBER */}

                        <td>

                          <div className="receipt-member">

                            <div className="receipt-avatar">

                              {receipt.memberName
                                ?.charAt(0)
                                ?.toUpperCase() ||
                                "?"}

                            </div>

                            <div>

                              <strong>
                                {
                                  receipt.memberName ||
                                  "-"
                                }
                              </strong>

                              <span>

                                {
                                  receipt.memberCode
                                    ? receipt.memberCode
                                    : receipt.memberId ||
                                      "-"
                                }

                              </span>

                              {receipt.mobile && (

                                <small>
                                  {receipt.mobile}
                                </small>

                              )}

                            </div>

                          </div>

                        </td>

                        {/* AMOUNT */}

                        <td>

                          <strong
                            className="receipt-amount"
                          >

                            ₹
                            {money(
                              receipt.amount
                            )}

                          </strong>

                        </td>

                        {/* MODE */}

                        <td>

                          <span
                            className={`receipt-mode ${
                              receipt.mode ===
                              "Cash"
                                ? "cash"
                                : receipt.mode ===
                                  "UPI"
                                ? "upi"
                                : "bank"
                            }`}
                          >

                            {
                              receipt.mode ||
                              "-"
                            }

                          </span>

                        </td>

                        {/* DATE */}

                        <td>

                          {formatDate(
                            receipt.date
                          )}

                        </td>

                        {/* REMARK */}

                        <td>

                          {
                            receipt.remark ||
                            "-"
                          }

                        </td>

                        {/* ACTIONS */}

                        <td>

                          <div className="receipt-actions">

                            {/* VIEW */}

                            <button
  type="button"
  className="receipt-action view"
  title="View Receipt"
  onClick={() => setSelectedReceipt(receipt)}
>
  <Eye size={15} />
</button>

                            {/* PRINT */}

                            <button
                              type="button"
                              className="receipt-action print"
                              title="Print Receipt"
                              onClick={() =>
                                printReceipt(
                                  receipt
                                )
                              }
                            >

                              <Printer
                                size={15}
                              />

                            </button>

                            {/* WHATSAPP */}

                            <button
                              type="button"
                              className="receipt-action whatsapp"
                              title="Send on WhatsApp"
                              onClick={() =>
                                sendWhatsApp(
                                  receipt
                                )
                              }
                            >

                              <MessageCircle
                                size={15}
                              />

                            </button>

                          </div>

                        </td>

                      </tr>

                    );

                  }
                )

              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* ======================================================
          RECEIPT VIEW MODAL
      ====================================================== */}

      {selectedReceipt && (

        <ReceiptModal
          payment={
            selectedReceipt
          }
          receipt={
            selectedReceipt
          }
          onClose={() => {
            setSelectedReceipt(
              null
            );
          }}
        />

      )}

      {/* ======================================================
          ADD RECEIPT MODAL
      ====================================================== */}

      {showAddModal && (

        <div
          className="receipt-modal-overlay"
          onMouseDown={(event) => {

            if (
              event.target ===
              event.currentTarget
            ) {
              closeAddModal();
            }

          }}
        >

          <div
            className="receipt-add-modal"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >

            {/* MODAL HEADER */}

            <div className="receipt-add-modal-header">

              <div>

                <h2>
                  पावती नोंदवा
                </h2>

                <p>
                  वर्गणीदाराची जमा रक्कम नोंदवा
                </p>

              </div>

              <button
                type="button"
                className="receipt-add-close"
                onClick={closeAddModal}
                disabled={saving}
              >

                <X
                  size={20}
                />

              </button>

            </div>

            {/* FORM */}

            <form
              onSubmit={
                handleAddReceipt
              }
              className="receipt-add-form"
            >

              {/* MEMBER */}

              <div className="receipt-form-group">

                <label>
                  वर्गणीदार
                  <span>
                    *
                  </span>
                </label>

                <select
                  name="memberId"
                  value={
                    form.memberId
                  }
                  onChange={
                    handleFormChange
                  }
                  disabled={
                    saving ||
                    membersLoading
                  }
                  required
                >

                  <option value="">
                    {
                      membersLoading
                        ? "वर्गणीदार loading..."
                        : "वर्गणीदार निवडा"
                    }
                  </option>

                  {members.map(
                    (member) => (

                      <option
                        key={
                          member.id
                        }
                        value={
                          member.id
                        }
                      >

                        {
                          member.name ||
                          "Unknown"
                        }

                        {member.member_code
                          ? ` (${member.member_code})`
                          : ""}

                      </option>

                    )
                  )}

                </select>

                {!membersLoading &&
                  members.length === 0 && (

                    <small
                      className="receipt-form-error"
                    >
                      कोणतेही वर्गणीदार उपलब्ध नाहीत.
                    </small>

                  )}

              </div>

              {/* SELECTED MEMBER INFO */}

              {form.memberId && (

                <div className="receipt-selected-member">

                  {(() => {

                    const member =
                      members.find(
                        (item) =>
                          String(
                            item.id
                          ) ===
                          String(
                            form.memberId
                          )
                      );

                    if (!member) {
                      return null;
                    }

                    return (
                      <>
                        <div>

                          <span>
                            वर्गणीदार
                          </span>

                          <strong>
                            {
                              member.name ||
                              "-"
                            }
                          </strong>

                        </div>

                        <div>

                          <span>
                            Member Code
                          </span>

                          <strong>
                            {
                              member.member_code ||
                              "-"
                            }
                          </strong>

                        </div>

                        <div>

                          <span>
                            Mobile
                          </span>

                          <strong>
                            {
                              member.mobile ||
                              "-"
                            }
                          </strong>

                        </div>

                      </>
                    );

                  })()}

                </div>

              )}

              {/* AMOUNT */}

              <div className="receipt-form-group">

                <label>
                  जमा रक्कम
                  <span>
                    *
                  </span>
                </label>

                <div className="receipt-amount-input">

                  <IndianRupee
                    size={17}
                  />

                  <input
                    type="number"
                    name="amount"
                    value={
                      form.amount
                    }
                    onChange={
                      handleFormChange
                    }
                    placeholder="उदा. 500"
                    min="1"
                    step="0.01"
                    disabled={saving}
                    required
                  />

                </div>

              </div>

              {/* PAYMENT MODE */}

              <div className="receipt-form-group">

                <label>
                  Payment Mode
                  <span>
                    *
                  </span>
                </label>

                <select
                  name="mode"
                  value={
                    form.mode
                  }
                  onChange={
                    handleFormChange
                  }
                  disabled={saving}
                  required
                >

                  <option value="Cash">
                    Cash
                  </option>

                  <option value="UPI">
                    UPI
                  </option>

                  <option value="Bank">
                    Bank
                  </option>

                </select>

              </div>

              {/* DATE */}

              <div className="receipt-form-group">

                <label>
                  तारीख
                  <span>
                    *
                  </span>
                </label>

                <div className="receipt-date-input">

                  <CalendarDays
                    size={17}
                  />

                  <input
                    type="date"
                    name="date"
                    value={
                      form.date
                    }
                    onChange={
                      handleFormChange
                    }
                    disabled={saving}
                    required
                  />

                </div>

              </div>

              {/* ACTIONS */}

              <div className="receipt-add-actions">

                <button
                  type="button"
                  className="receipt-cancel-btn"
                  onClick={
                    closeAddModal
                  }
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="receipt-save-btn"
                  disabled={
                    saving ||
                    membersLoading ||
                    members.length === 0
                  }
                >

                  {saving ? (
                    <>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Plus
                        size={17}
                      />

                      पावती जतन करा
                    </>
                  )}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}

export default Receipts;