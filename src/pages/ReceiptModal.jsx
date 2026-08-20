import { useState } from "react";

import {
  X,
  Printer,
  MessageCircle,
  Download,
  Share2,
} from "lucide-react";

import useMandalConfig from "../hooks/useMandalConfig";
import { isAdmin } from "../utils/permissions";

import html2canvas from "html2canvas";
import jsPDF from "jspdf";

import "./ReceiptModal.css";

function ReceiptModal({
  receipt,
  payment,
  onClose,
}) {
  // ============================================================
  // SUPPORT receipt / payment
  // ============================================================
const admin = isAdmin();
  const data = receipt || payment;

  // ============================================================
  // MANDAL CONFIG
  // ============================================================

  const mandalConfig =
    useMandalConfig();

  // ============================================================
  // SAFETY
  // ============================================================

  if (!data) {
    return null;
  }

  // ============================================================
  // CONFIG
  // ============================================================

  const mandalName =
    mandalConfig?.name ||
    "लक्ष्मी तरुण मित्र मंडळ";

  const tagline =
    mandalConfig?.tagline ||
    "गणपती उत्सव 2027";

  const address =
    mandalConfig?.address ||
    "";

  const mandalMobile =
    mandalConfig?.mobile ||
    "";

  const upiId =
    mandalConfig?.upiId ||
    "";

  // ============================================================
  // DATE FORMAT
  // ============================================================

  const formatReceiptDate = (
    value
  ) => {
    if (!value) {
      return "-";
    }

    const dateString =
      String(value).trim();

    // YYYY-MM-DD
    if (
      /^\d{4}-\d{2}-\d{2}$/.test(
        dateString
      )
    ) {
      const [
        year,
        month,
        day,
      ] = dateString.split("-");

      return `${day}-${month}-${year}`;
    }

    // ISO
    if (
      /^\d{4}-\d{2}-\d{2}T/.test(
        dateString
      )
    ) {
      const datePart =
        dateString.slice(0, 10);

      const [
        year,
        month,
        day,
      ] = datePart.split("-");

      return `${day}-${month}-${year}`;
    }

    return dateString;
  };

  // ============================================================
  // MEMBER DETAILS
  // ============================================================

  const memberName =
    data?.memberName ||
    data?.member?.name ||
    "-";

  const memberId =
    data?.displayMemberId ||
    data?.memberCode ||
    data?.member_code ||
    data?.member?.member_code ||
    "-";

  const mobile =
    data?.mobile ||
    data?.member?.mobile ||
    "";

  // ============================================================
  // PAYMENT DETAILS
  // ============================================================

  const amount =
    Number(data?.amount) || 0;

  const mode =
    data?.mode ||
    "Cash";

  const date =
    formatReceiptDate(
      data?.date ||
        data?.payment_date ||
        data?.createdAt ||
        data?.created_at
    );

  const remark =
    data?.remark ||
    "-";

  const receiptNo =
    data?.receiptNo ||
    data?.receiptNumber ||
    data?.receipt_no ||
    "-";

  const formattedAmount =
    amount.toLocaleString(
      "en-IN"
    );

  // ============================================================
  // DOWNLOAD PDF
  // ============================================================

  const handleDownloadPDF =
    async () => {
      const receiptElement =
        document.getElementById(
          "receipt-print-area"
        );

      if (!receiptElement) {
        alert(
          "Receipt not found."
        );

        return;
      }

      try {
        const canvas =
          await html2canvas(
            receiptElement,
            {
              scale: 2,
              useCORS: true,
              backgroundColor:
                "#ffffff",
            }
          );

        const imageData =
          canvas.toDataURL(
            "image/png"
          );

        const pdf =
          new jsPDF({
            orientation:
              "portrait",
            unit: "mm",
            format: "a5",
          });

        const pageWidth = 148;
        const pageHeight = 210;
        const margin = 8;

        const usableWidth =
          pageWidth -
          margin * 2;

        const imageHeight =
          (canvas.height *
            usableWidth) /
          canvas.width;

        const finalHeight =
          Math.min(
            imageHeight,
            pageHeight -
              margin * 2
          );

        pdf.addImage(
          imageData,
          "PNG",
          margin,
          margin,
          usableWidth,
          finalHeight
        );

        pdf.save(
          `${receiptNo}.pdf`
        );
      } catch (error) {
        console.error(
          "PDF generation error:",
          error
        );

        alert(
          "PDF तयार करताना समस्या आली."
        );
      }
    };

  // ============================================================
  // WHATSAPP
  // ============================================================
const sendWhatsApp = async () => {
  const cleanPhone = String(mobile || "").replace(/\D/g, "");

  if (cleanPhone.length !== 10) {
    alert("या वर्गणीदाराचा valid 10 अंकी mobile number उपलब्ध नाही.");
    return;
  }

  const receiptElement = document.getElementById(
    "receipt-print-area"
  );

  if (!receiptElement) {
    alert("Receipt सापडली नाही.");
    return;
  }

  try {
    // 1️⃣ Create receipt image
    const canvas = await html2canvas(receiptElement, {
      scale: 3,
      useCORS: true,
      allowTaint: false,
      backgroundColor: "#fffdf8",
      logging: false,
    });

    const blob = await new Promise((resolve, reject) => {
      canvas.toBlob(
        (result) => {
          if (result) {
            resolve(result);
          } else {
            reject(new Error("Receipt image तयार झाली नाही."));
          }
        },
        "image/png",
        1
      );
    });

    // 2️⃣ Convert image to File
    const file = new File(
      [blob],
      `${receiptNo}-receipt.png`,
      {
        type: "image/png",
      }
    );

    // 3️⃣ WhatsApp message
    const whatsappText = `🙏 लक्ष्मी तरुण मित्र मंडळ, गणोरे 🙏

🪔 गणपती उत्सव २०२६ 🪔

━━━━━━━━━━━━━━━━━━

🧾 *जमा पावती*

🔖 पावती क्र.: *${receiptNo}*

👤 वर्गणीदार: *${memberName}*
🆔 Member ID: *${memberId}*
📱 Mobile: *${mobile}*

💰 जमा रक्कम: *₹${formattedAmount}*
💳 Payment Mode: *${mode}*
📅 दिनांक: *${date}*
📝 Remark: *${remark || "-"}*

━━━━━━━━━━━━━━━━━━

✅ *आपली वर्गणी यशस्वीरित्या जमा झाली आहे.*

लक्ष्मी तरुण मित्र मंडळ, गणोरे
यांच्या वतीने मनःपूर्वक धन्यवाद! 🙏

🕉️ श्री गणेशाय नमः 🕉️
🌺 गणपती बाप्पा मोरया! 🌺`;

    // =====================================================
    // 📱 MOBILE — SHARE DESIGNED RECEIPT IMAGE
    // =====================================================

    if (navigator.share) {
      try {
        // Check file sharing support
        if (
          navigator.canShare &&
          navigator.canShare({
            files: [file],
          })
        ) {
          await navigator.share({
            title: `जमा पावती - ${receiptNo}`,
            text: whatsappText,
            files: [file],
          });

          return;
        }

        // Try file sharing directly even if canShare
        // is not available
        await navigator.share({
          title: `जमा पावती - ${receiptNo}`,
          text: whatsappText,
          files: [file],
        });

        return;

      } catch (shareError) {

        // User cancelled share
        if (shareError?.name === "AbortError") {
          return;
        }

        console.log(
          "File share not supported:",
          shareError
        );
      }
    }

    // =====================================================
    // 💻 DESKTOP FALLBACK
    // =====================================================

    // Download designed receipt image
    const imageUrl = URL.createObjectURL(blob);

    const downloadLink =
      document.createElement("a");

    downloadLink.href = imageUrl;
    downloadLink.download =
      `${receiptNo}-receipt.png`;

    document.body.appendChild(downloadLink);

    downloadLink.click();

    document.body.removeChild(downloadLink);

    URL.revokeObjectURL(imageUrl);

    // Open WhatsApp with text
    const whatsappUrl =
      `https://wa.me/91${cleanPhone}?text=` +
      encodeURIComponent(whatsappText);

    window.open(
      whatsappUrl,
      "_blank",
      "noopener,noreferrer"
    );

    alert(
      "Receipt image download झाली आहे. WhatsApp मध्ये ती attach करा."
    );

  } catch (error) {

    console.error(
      "WhatsApp receipt error:",
      error
    );

    alert(
      "WhatsApp receipt तयार करताना समस्या आली."
    );
  }
};

  // ============================================================
  // SHARE
  // ============================================================

  const handleShare = async () => {
    const receiptElement =
      document.getElementById(
        "receipt-print-area"
      );

    if (!receiptElement) {
      return;
    }

    try {
      const canvas =
        await html2canvas(
          receiptElement,
          {
            scale: 2,
            useCORS: true,
            backgroundColor:
              "#ffffff",
          }
        );

      const imageData =
        canvas.toDataURL(
          "image/png"
        );

      const pdf =
        new jsPDF({
          orientation:
            "portrait",
          unit: "mm",
          format: "a5",
        });

      const margin = 8;
      const usableWidth =
        148 - margin * 2;

      const imageHeight =
        (canvas.height *
          usableWidth) /
        canvas.width;

      pdf.addImage(
        imageData,
        "PNG",
        margin,
        margin,
        usableWidth,
        imageHeight
      );

      const pdfBlob =
        pdf.output("blob");

      const pdfFile =
        new File(
          [pdfBlob],
          `${receiptNo}.pdf`,
          {
            type:
              "application/pdf",
          }
        );

      if (
        navigator.share &&
        navigator.canShare &&
        navigator.canShare({
          files: [pdfFile],
        })
      ) {
        await navigator.share({
          title:
            `जमा पावती - ${receiptNo}`,

          text:
            `${mandalName} - जमा पावती`,

          files: [pdfFile],
        });

        return;
      }

      pdf.save(
        `${receiptNo}.pdf`
      );

      alert(
        "PDF download झाला आहे."
      );
    } catch (error) {
      if (
        error?.name ===
        "AbortError"
      ) {
        return;
      }

      console.error(
        "Share error:",
        error
      );

      alert(
        "Share करताना समस्या आली."
      );
    }
  };

  // ============================================================
  // PRINT
  // ============================================================

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

    printWindow.document.write(`
      <!DOCTYPE html>

      <html lang="mr">

      <head>

        <meta charset="UTF-8" />

        <title>
          Receipt ${receiptNo}
        </title>

        <style>

          * {
            box-sizing: border-box;
          }

          @page {
            size: A5 portrait;
            margin: 8mm;
          }

          html,
          body {
            margin: 0;
            padding: 0;
            background: white;
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
            background: white;
            border: 1px solid #dfe4ea;
            border-radius: 10px;
          }

          .receipt-heading {
            text-align: center;
            padding-bottom: 18px;
            border-bottom: 2px solid #f59e0b;
          }

          .receipt-heading h1 {
            margin: 0;
            font-size: 25px;
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

          .receipt-row {
            display: flex;
            justify-content: space-between;
            gap: 20px;
            padding: 12px 0;
            border-bottom: 1px solid #e5e7eb;
            font-size: 14px;
          }

          .receipt-row span {
            color: #64748b;
          }

          .receipt-row strong {
            text-align: right;
            word-break: break-word;
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
          }

          .receipt-thanks {
            text-align: center;
            margin-top: 25px;
            color: #64748b;
            font-size: 14px;
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

  // ============================================================
  // OVERLAY
  // ============================================================

  const handleOverlayClick =
    (event) => {
      if (
        event.target ===
        event.currentTarget
      ) {
        onClose();
      }
    };

  // ============================================================
  // RENDER
  // ============================================================

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

        {/* HEADER */}

        <div className="receipt-modal-header">

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
          >
            <X size={20} />
          </button>

        </div>

        {/* RECEIPT */}

        <div
          className="receipt-paper"
          id="receipt-print-area"
        >

          <div className="receipt-heading">

         <img
  src="/logo.png"
  alt="मंडळाचा लोगो"
  className="receipt-logo"
/>

<h1>
  लक्ष्मी तरुण मित्र मंडळ
</h1>

<p>
  गणोरे
</p>

{tagline && (
  <p className="receipt-tagline">
    {tagline}
  </p>
)}

<div className="receipt-title">
  जमा पावती
</div>

          </div>

          {/* RECEIPT NUMBER */}

          <div className="receipt-number">

            <span>
              Receipt No.
            </span>

            <strong>
              {receiptNo}
            </strong>

          </div>

          {/* MEMBER */}

          <div className="receipt-row">
            <span>
              वर्गणीदार
            </span>

            <strong>
              {memberName}
            </strong>
          </div>

          {/* MEMBER ID */}

          <div className="receipt-row">
            <span>
              Member ID
            </span>

            <strong>
              {memberId}
            </strong>
          </div>

          {/* MOBILE */}

          <div className="receipt-row">
            <span>
              Mobile
            </span>

            <strong>
              {mobile || "-"}
            </strong>
          </div>

          {/* AMOUNT */}

          <div className="receipt-row">
            <span>
              जमा रक्कम
            </span>

            <strong>
              ₹{formattedAmount}
            </strong>
          </div>

          {/* MODE */}

          <div className="receipt-row">
            <span>
              Payment Mode
            </span>

            <strong>
              {mode}
            </strong>
          </div>

          {/* DATE */}

          <div className="receipt-row">
            <span>
              Date
            </span>

            <strong>
              {date}
            </strong>
          </div>

          {/* REMARK */}

          <div className="receipt-row">
            <span>
              Remark
            </span>

            <strong>
              {remark}
            </strong>
          </div>

          {/* UPI */}

          {upiId && (
            <div className="receipt-row">
              <span>
                UPI ID
              </span>

              <strong>
                {upiId}
              </strong>
            </div>
          )}

          {/* TOTAL */}

          <div className="receipt-total">

            <span>
              एकूण जमा रक्कम
            </span>

            <strong>
              ₹{formattedAmount}
            </strong>

          </div>

          {/* FOOTER */}

          <div className="receipt-thanks">

            धन्यवाद! 🙏

            {address && (
              <div
                style={{
                  marginTop: "8px",
                }}
              >
                📍 {address}
              </div>
            )}

            {mandalMobile && (
              <div
                style={{
                  marginTop: "4px",
                }}
              >
                📞 {mandalMobile}
              </div>
            )}

          </div>

        </div>

        {/* ACTIONS */}

        <div className="receipt-actions">

          <button
            type="button"
            className="receipt-btn cancel"
            onClick={onClose}
          >
            Close
          </button>

          <button
            type="button"
            className="receipt-btn pdf"
            onClick={
              handleDownloadPDF
            }
          >
            <Download size={17} />
            PDF
          </button>

         {admin && (
  <button
    type="button"
    className="receipt-btn share"
    onClick={handleShare}
  >
    <Share2 size={17} />
    Share
  </button>
)}

          {admin && (
  <button
    type="button"
    className="receipt-btn whatsapp"
    onClick={sendWhatsApp}
  >
    <MessageCircle size={17} />
    WhatsApp
  </button>
)}

          <button
            type="button"
            className="receipt-btn print"
            onClick={
              printReceipt
            }
          >
            <Printer size={17} />
            Print
          </button>

        </div>

      </div>

    </div>
  );
}

export default ReceiptModal;