// // ============================================================
// // WHATSAPP RECEIPT
// // ============================================================

// export const sendReceiptOnWhatsApp = ({
//   mobile,
//   receiptNo,
//   memberName,
//   memberCode,
//   amount,
//   mode,
//   date,
//   remark,
//   mandalName,
//   tagline,
// }) => {
//   // Mobile number
//   const cleanMobile = String(mobile || "")
//     .replace(/\D/g, "");

//   if (!cleanMobile) {
//     throw new Error(
//       "या वर्गणीदाराचा Mobile Number उपलब्ध नाही."
//     );
//   }

//   if (cleanMobile.length !== 10) {
//     throw new Error(
//       "Mobile Number 10 digit असणे आवश्यक आहे."
//     );
//   }

//   // Amount
//   const formattedAmount =
//     Number(amount || 0).toLocaleString("en-IN");

//   // WhatsApp message
//   const message = `
// ${mandalName || "लक्ष्मी तरुण मित्र मंडळ"}

// ${tagline || "गणपती उत्सव 2026"}

// जमा पावती
// ━━━━━━━━━━━━━━━━━━━━

// पावती क्रमांक: ${receiptNo || "-"}

// वर्गणीदार: ${memberName || "-"}

// Member ID: ${memberCode || "-"}

// Mobile: ${cleanMobile}

// जमा रक्कम: ₹${formattedAmount}

// Payment Mode: ${mode || "Cash"}

// दिनांक: ${date || "-"}

// Remark: ${remark || "-"}

// ━━━━━━━━━━━━━━━━━━━━

// एकूण जमा रक्कम: ₹${formattedAmount}

// आपली वर्गणी जमा झाल्याबद्दल धन्यवाद.

// ${mandalName || "लक्ष्मी तरुण मित्र मंडळ"}
// `.trim();

//   // WhatsApp URL
//   const whatsappUrl =
//     `https://wa.me/91${cleanMobile}?text=${encodeURIComponent(
//       message
//     )}`;

//   // Open WhatsApp
//   window.open(
//     whatsappUrl,
//     "_blank",
//     "noopener,noreferrer"
//   );
// };