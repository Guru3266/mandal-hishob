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
} from "lucide-react";

import {
  getCollections,
  getMembers,
} from "../data/financialStore";

import {
  getMandalConfig,
} from "../utils/mandalConfig";

import ReceiptModal from "./ReceiptModal";

import "./Receipts.css";


function Receipts() {

  /* =========================================================
     STATE
  ========================================================= */

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

  const [mandalConfig, setMandalConfig] =
    useState(() =>
      getMandalConfig()
    );


  /* =========================================================
     MANDAL CONFIG
  ========================================================= */

  const mandalName =
    mandalConfig?.name ||
    "मंडळाचे नाव";

  const mandalTagline =
    mandalConfig?.tagline ||
    "गणपती उत्सव 2026";


  /* =========================================================
     LOAD DATA
  ========================================================= */

  const loadData = () => {

    try {

      const collectionData =
        getCollections();

      const memberData =
        getMembers();

      setReceipts(
        Array.isArray(collectionData)
          ? collectionData
          : []
      );

      setMembers(
        Array.isArray(memberData)
          ? memberData
          : []
      );

      setMandalConfig(
        getMandalConfig()
      );

    } catch (error) {

      console.error(
        "Receipts loading error:",
        error
      );

      setReceipts([]);
      setMembers([]);

      setMandalConfig(
        getMandalConfig()
      );

    }

  };


  /* =========================================================
     LOAD + LIVE UPDATE
  ========================================================= */

  useEffect(() => {

    loadData();


    const handleUpdate = () => {
      loadData();
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


  /* =========================================================
     GET MEMBER
  ========================================================= */

  const getMember = (
    memberId
  ) => {

    return members.find(
      (member) =>
        String(member.id) ===
        String(memberId)
    );

  };


  /* =========================================================
     FILTERED RECEIPTS
  ========================================================= */

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
              .includes(keyword);


          const matchesMode =
            modeFilter === "All" ||
            receipt.mode ===
              modeFilter;


          const matchesDate =
            !dateFilter ||
            receipt.date ===
              dateFilter;


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


  /* =========================================================
     TOTAL AMOUNT
  ========================================================= */

  const totalAmount =
    filteredReceipts.reduce(
      (
        total,
        receipt
      ) => {

        return (
          total +
          Number(
            receipt.amount || 0
          )
        );

      },
      0
    );


  /* =========================================================
     MONEY FORMAT
  ========================================================= */

  const money = (
    amount
  ) => {

    return Number(
      amount || 0
    ).toLocaleString(
      "en-IN"
    );

  };


  /* =========================================================
     DATE FORMAT
  ========================================================= */

  const formatDate = (
    date
  ) => {

    if (!date) {
      return "-";
    }


    const parts =
      String(date).split("-");


    if (
      parts.length !== 3
    ) {
      return date;
    }


    return (
      `${parts[2]}-${parts[1]}-${parts[0]}`
    );

  };


  /* =========================================================
     PRINT RECEIPT
  ========================================================= */

  const printReceipt = (
    receipt
  ) => {

    const member =
      getMember(
        receipt.memberId
      );


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
      mandalConfig?.address ||
      "";

    const safeMobile =
      member?.mobile ||
      receipt.mobile ||
      "-";

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

            window.onload = function() {
              window.print();
            };

          </script>

        </body>

      </html>

    `);


    printWindow.document.close();

  };


  /* =========================================================
     WHATSAPP
  ========================================================= */

  const sendWhatsApp = (
    receipt
  ) => {

    const member =
      getMember(
        receipt.memberId
      );


    const mobile =
      member?.mobile ||
      receipt.mobile ||
      "";


    const phone =
      String(
        mobile
      ).replace(
        /\D/g,
        ""
      );


    if (
      phone.length !== 10
    ) {

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


  /* =========================================================
     RENDER
  ========================================================= */

  return (

    <div className="receipts-page">


      {/* =====================================================
          HEADER
      ===================================================== */}

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

      </div>


      {/* =====================================================
          SUMMARY
      ===================================================== */}

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
                    item.mode === "UPI"
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
                    item.mode === "Cash"
                ).length
              }

            </strong>

          </div>

        </div>

      </div>


      {/* =====================================================
          PANEL
      ===================================================== */}

      <div className="receipts-panel">


        {/* PANEL HEADER */}

        <div className="receipts-panel-header">

          <div>

            <h2>
              सर्व पावत्या
            </h2>

            <p>
              {filteredReceipts.length} records
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


              {/* EMPTY */}

              {filteredReceipts.length === 0 ? (

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
                        Members मधून जमा केल्यावर
                        पावती येथे दिसेल.
                      </span>

                    </div>

                  </td>

                </tr>

              ) : (

                filteredReceipts.map(
                  (receipt) => {

                    /*
                     * IMPORTANT:
                     * Always use receiptNo first.
                     * If old data doesn't have receiptNo,
                     * fallback to id.
                     */

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
                                ?.toUpperCase() || "?"}

                            </div>


                            <div>

                              <strong>
                                {receipt.memberName || "-"}
                              </strong>

                              <span>
                                {receipt.memberId || "-"}
                              </span>

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
                              receipt.mode === "Cash"
                                ? "cash"
                                : receipt.mode === "UPI"
                                ? "upi"
                                : "bank"
                            }`}
                          >
                            {receipt.mode || "-"}
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

                          {receipt.remark ||
                            "-"}

                        </td>


                        {/* ACTIONS */}

                        <td>

                          <div className="receipt-actions">


                           {/* VIEW */}

<button
  type="button"
  className="receipt-action view"
  title="View Receipt"
  onClick={() => {
    console.log("VIEW RECEIPT:", receipt);
    setSelectedReceipt(receipt);
  }}
>
  <Eye size={15} />
</button>


                            {/* =========================
                                PRINT
                            ========================= */}

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


                            {/* =========================
                                WHATSAPP
                            ========================= */}

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


   {/* =====================================================
    RECEIPT MODAL
===================================================== */}

{selectedReceipt && (
  <ReceiptModal
    payment={selectedReceipt}
    receipt={selectedReceipt}
    onClose={() => {
      setSelectedReceipt(null);
    }}
  />
)}


    </div>

  );

}


export default Receipts;