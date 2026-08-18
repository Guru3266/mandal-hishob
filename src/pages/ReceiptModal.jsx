import { useEffect, useState } from "react";

import {
  X,
  Printer,
  MessageCircle,
} from "lucide-react";

import { getMandalConfig } from "../utils/mandalConfig";

import "./ReceiptModal.css";


function ReceiptModal({
  payment,
  onClose,
}) {

  // =====================================================
  // MANDAL CONFIG
  // =====================================================

  const [mandalConfig, setMandalConfig] = useState(
    getMandalConfig()
  );


  useEffect(() => {

    const loadConfig = () => {
      setMandalConfig(
        getMandalConfig()
      );
    };


    loadConfig();


    window.addEventListener(
      "mandal-data-updated",
      loadConfig
    );


    return () => {

      window.removeEventListener(
        "mandal-data-updated",
        loadConfig
      );

    };

  }, []);


  // =====================================================
  // SAFETY CHECK
  // =====================================================

  if (!payment) {
    return null;
  }


  // =====================================================
  // MANDAL DATA
  // =====================================================

  const mandalName =
    mandalConfig?.name ||
    "लक्ष्मी तरुण मित्र मंडळ";


  const tagline =
    mandalConfig?.tagline ||
    "गणपती उत्सव 2026";


  const address =
    mandalConfig?.address ||
    "";


  // =====================================================
  // PAYMENT DATA
  // =====================================================

  const memberName =
    payment?.memberName ||
    payment?.member?.name ||
    "-";


  const memberId =
    payment?.memberId ||
    payment?.member?.memberId ||
    payment?.member?.id ||
    "-";


  const mobile =
    payment?.mobile ||
    payment?.member?.mobile ||
    "";


  const amount =
    Number(payment?.amount) || 0;


  const mode =
    payment?.mode ||
    "Cash";


  const date =
    payment?.date ||
    "-";


  const remark =
    payment?.remark ||
    "";


  // =====================================================
  // RECEIPT NUMBER
  // =====================================================

  const receiptNo =
    payment?.receiptNo ||
    payment?.receiptNumber ||
    payment?.receipt_id ||
    payment?.receiptId ||
    payment?.id ||
    "-";


  // =====================================================
  // FORMAT AMOUNT
  // =====================================================

  const formattedAmount =
    amount.toLocaleString("en-IN");


  // =====================================================
  // WHATSAPP
  // =====================================================

  const sendWhatsApp = () => {

    const cleanPhone =
      String(mobile).replace(
        /\D/g,
        ""
      );


    if (cleanPhone.length !== 10) {

      alert(
        "या वर्गणीदाराचा valid 10 अंकी mobile number उपलब्ध नाही."
      );

      return;
    }


    const message = `
🙏 ${mandalName}

${tagline}

🧾 जमा पावती

पावती क्रमांक: ${receiptNo}

वर्गणीदार: ${memberName}
Member ID: ${memberId}
Mobile: ${mobile}

जमा रक्कम: ₹${formattedAmount}
Payment Mode: ${mode}
दिनांक: ${date}

${remark ? `Remark: ${remark}` : ""}

धन्यवाद! 🙏

${mandalName}
${address}
    `.trim();


    const whatsappUrl =
      `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(
        message
      )}`;


    window.open(
      whatsappUrl,
      "_blank",
      "noopener,noreferrer"
    );

  };


  // =====================================================
  // PRINT RECEIPT
  // =====================================================

  const printReceipt = () => {

    const printContent =
      document.querySelector(
        ".receipt-paper"
      );


    if (!printContent) {

      alert(
        "Receipt content सापडले नाही."
      );

      return;
    }


    const printWindow =
      window.open(
        "",
        "_blank",
        "width=800,height=900"
      );


    if (!printWindow) {

      alert(
        "Print window blocked आहे. Browser मध्ये pop-up allow करा."
      );

      return;
    }


    printWindow.document.open();


    printWindow.document.write(`

      <!DOCTYPE html>

      <html lang="mr">

      <head>

        <meta charset="UTF-8" />

        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0"
        />

        <title>
          ${mandalName} - Receipt ${receiptNo}
        </title>


        <style>

          * {
            box-sizing: border-box;
          }


          @page {
            size: A5 portrait;
            margin: 10mm;
          }


          html,
          body {
            margin: 0;
            padding: 0;
            background: #ffffff;
          }


          body {

            font-family:
              Arial,
              "Noto Sans Devanagari",
              "Nirmala UI",
              sans-serif;

            color: #172033;
          }


          .receipt-paper {

            width: 100%;

            max-width: 600px;

            margin: 0 auto;

            padding: 25px;

            background: #ffffff;

            border:
              1px solid #dfe4ea;

            border-radius: 10px;
          }


          .receipt-heading {

            text-align: center;

            padding-bottom: 18px;

            border-bottom:
              2px solid #f59e0b;
          }


          .receipt-heading h1 {

            margin: 0;

            font-size: 25px;

            font-weight: 700;
          }


          .receipt-heading p {

            margin: 5px 0;

            color: #64748b;

            font-size: 14px;
          }


          .receipt-heading h2 {

            margin: 8px 0 0;

            font-size: 20px;
          }


          .receipt-number {

            display: flex;

            justify-content: flex-end;

            gap: 8px;

            padding: 15px 0;

            font-size: 13px;
          }


          .receipt-number span {

            color: #64748b;
          }


          .receipt-number strong {

            color: #172033;
          }


          .receipt-row {

            display: flex;

            justify-content:
              space-between;

            align-items: center;

            gap: 20px;

            padding: 12px 0;

            border-bottom:
              1px solid #e5e7eb;

            font-size: 14px;
          }


          .receipt-row span {

            color: #64748b;
          }


          .receipt-row strong {

            text-align: right;

            color: #172033;
          }


          .receipt-total {

            text-align: center;

            margin-top: 25px;
          }


          .receipt-total span {

            display: block;

            color: #64748b;

            font-size: 14px;
          }


          .receipt-total strong {

            display: block;

            margin-top: 5px;

            color: #15803d;

            font-size: 34px;

            font-weight: 700;
          }


          .receipt-thanks {

            text-align: center;

            margin-top: 25px;

            color: #64748b;

            font-size: 14px;
          }


          @media print {

            body {
              -webkit-print-color-adjust:
                exact;
              print-color-adjust:
                exact;
            }

            .receipt-paper {
              border: 1px solid #dfe4ea;
            }

          }

        </style>

      </head>


      <body>

        ${printContent.outerHTML}


        <script>

          window.onload = function () {

            setTimeout(function () {

              window.focus();

              window.print();

            }, 500);

          };


          window.onafterprint = function () {

            setTimeout(function () {

              window.close();

            }, 300);

          };

        </script>

      </body>

      </html>

    `);


    printWindow.document.close();

  };


  // =====================================================
  // CLOSE OVERLAY
  // =====================================================

  const handleOverlayClick = (
    event
  ) => {

    if (
      event.target ===
      event.currentTarget
    ) {

      onClose();

    }

  };


  // =====================================================
  // RENDER
  // =====================================================

  return (

    <div
      className="receipt-overlay"
      onMouseDown={
        handleOverlayClick
      }
    >

      <div
        className="receipt-modal"
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >

        {/* =================================================
            MODAL HEADER
        ================================================= */}

        <div
          className="receipt-modal-header"
        >

          <div>

            <h2>
              जमा पावती
            </h2>

            <p>
              {mandalName}
            </p>

          </div>


          <button
            type="button"
            className="receipt-close"
            onClick={onClose}
            aria-label="Close receipt"
          >

            <X size={20} />

          </button>

        </div>


        {/* =================================================
            RECEIPT PAPER
        ================================================= */}

        <div className="receipt-paper">

          {/* =================================================
              MANDAL HEADER
          ================================================= */}

          <div
            className="receipt-heading"
          >

            <div
              style={{
                fontSize: "26px",
                marginBottom: "6px",
              }}
            >
              🙏
            </div>


            <h1>
              {mandalName}
            </h1>


            {tagline && (

              <p>
                {tagline}
              </p>

            )}


            <h2>
              जमा पावती
            </h2>

          </div>


          {/* =================================================
              RECEIPT NUMBER
          ================================================= */}

          <div
            className="receipt-number"
          >

            <span>
              Receipt No.
            </span>

            <strong>
              {receiptNo}
            </strong>

          </div>


          {/* =================================================
              MEMBER
          ================================================= */}

          <div
            className="receipt-row"
          >

            <span>
              वर्गणीदार
            </span>

            <strong>
              {memberName}
            </strong>

          </div>


          {/* =================================================
              MEMBER ID
          ================================================= */}

          <div
            className="receipt-row"
          >

            <span>
              Member ID
            </span>

            <strong>
              {memberId}
            </strong>

          </div>


          {/* =================================================
              MOBILE
          ================================================= */}

          <div
            className="receipt-row"
          >

            <span>
              Mobile
            </span>

            <strong>
              {mobile || "-"}
            </strong>

          </div>


          {/* =================================================
              PAYMENT MODE
          ================================================= */}

          <div
            className="receipt-row"
          >

            <span>
              Payment Mode
            </span>

            <strong>
              {mode}
            </strong>

          </div>


          {/* =================================================
              DATE
          ================================================= */}

          <div
            className="receipt-row"
          >

            <span>
              Date
            </span>

            <strong>
              {date}
            </strong>

          </div>


          {/* =================================================
              REMARK
          ================================================= */}

          <div
            className="receipt-row"
          >

            <span>
              Remark
            </span>

            <strong>
              {remark || "-"}
            </strong>

          </div>


          {/* =================================================
              AMOUNT
          ================================================= */}

          <div
            className="receipt-total"
          >

            <span>
              जमा रक्कम
            </span>

            <strong>
              ₹{formattedAmount}
            </strong>

          </div>


          {/* =================================================
              THANK YOU
          ================================================= */}

          <div
            className="receipt-thanks"
          >
            धन्यवाद! 🙏
          </div>

        </div>


        {/* =================================================
            ACTIONS
        ================================================= */}

        <div
          className="receipt-actions"
        >

          {/* CLOSE */}

          <button
            type="button"
            className="receipt-btn cancel"
            onClick={onClose}
          >

            Close

          </button>


          {/* WHATSAPP */}

          <button
            type="button"
            className="receipt-btn whatsapp"
            onClick={sendWhatsApp}
          >

            <MessageCircle
              size={17}
            />

            WhatsApp

          </button>


          {/* PRINT */}

          <button
            type="button"
            className="receipt-btn print"
            onClick={printReceipt}
          >

            <Printer
              size={17}
            />

            Print

          </button>

        </div>

      </div>

    </div>

  );

}


export default ReceiptModal;