import { supabase } from "../lib/supabase";
import { getMandalConfig } from "./mandalConfig";

// ============================================================
// GET CURRENT MANDAL
// ============================================================

const getMandalId = async () => {
  const { data, error } = await supabase
    .from("mandals")
    .select("id")
    .order("created_at", { ascending: true })
    .limit(1)
    .single();

  if (error) {
    console.error("Mandal fetch error:", error);
    throw error;
  }

  if (!data?.id) {
    throw new Error("Mandal not found.");
  }

  return data.id;
};

// ============================================================
// GET MEMBERS
// ============================================================

export const getMembers = async () => {
  const mandalId = await getMandalId();

  const { data, error } = await supabase
    .from("members")
    .select("*")
    .eq("mandal_id", mandalId)
    .eq("status", "active")
    .order("created_at", {
      ascending: true,
    });

  if (error) {
    console.error("Members fetch error:", error);
    throw error;
  }

  return data || [];
};

// ============================================================
// GET COLLECTIONS
// ============================================================

export const getCollections = async () => {
  const mandalId = await getMandalId();

  const { data, error } = await supabase
    .from("collections")
    .select("*")
    .eq("mandal_id", mandalId)
    .order("payment_date", {
      ascending: false,
    });

  if (error) {
    console.error(
      "Collections fetch error:",
      error
    );

    throw error;
  }

  // Get members
  const members = await getMembers();

  return (data || []).map((collection) => {
    const member = members.find(
      (m) =>
        String(m.id) ===
        String(collection.member_id)
    );

    return {
      ...collection,

      // Receipt
      receiptNo:
        collection.receipt_no || "-",

      // Member
      memberId:
        collection.member_id || "",

      memberCode:
        member?.member_code || "-",

      memberName:
        member?.name || "-",

      mobile:
        member?.mobile || "",

      address:
        member?.address || "",

      // Payment
      date:
        collection.payment_date || "",

      amount:
        Number(collection.amount || 0),

      mode:
        collection.mode || "Cash",

      remark:
        collection.remark || "",
    };
  });
};

// ============================================================
// GET NEXT RECEIPT NUMBER
// ============================================================

const getNextReceiptNumber = async (
  mandalId
) => {
  const config = getMandalConfig();

  // ----------------------------------------------------------
  // CONFIG
  // ----------------------------------------------------------

  const prefix =
    String(
      config?.receiptPrefix || "REC"
    )
      .trim()
      .toUpperCase();

  const year =
    Number(config?.eventYear) ||
    new Date().getFullYear();

  const startNumber =
    Number(
      config?.receiptStartNumber
    ) || 1;

  // ----------------------------------------------------------
  // GET EXISTING RECEIPTS
  // ----------------------------------------------------------

  const {
    data,
    error,
  } = await supabase
    .from("collections")
    .select("receipt_no")
    .eq("mandal_id", mandalId);

  if (error) {
    console.error(
      "Receipt number fetch error:",
      error
    );

    throw error;
  }

  // ----------------------------------------------------------
  // FIND MAX RECEIPT NUMBER
  // ----------------------------------------------------------

  let maxNumber =
    startNumber - 1;

  const escapedPrefix =
    prefix.replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&"
    );

  const pattern = new RegExp(
  `^${escapedPrefix}-${year}-(\\d{5})$`
);

  (data || []).forEach((collection) => {
    const receipt =
      String(
        collection?.receipt_no || ""
      ).trim();

    const match =
      receipt.match(pattern);

    if (match) {
      const number =
        Number(match[1]);

      if (
        Number.isFinite(number) &&
        number > maxNumber
      ) {
        maxNumber = number;
      }
    }
  });

  // ----------------------------------------------------------
  // NEXT NUMBER
  // ----------------------------------------------------------

  const nextNumber =
    maxNumber + 1;

  // ----------------------------------------------------------
  // FINAL RECEIPT NUMBER
  // ----------------------------------------------------------

  return `${prefix}-${year}-${String(
    nextNumber
  ).padStart(5, "0")}`;
};

// ============================================================
// ADD COLLECTION
// ============================================================

export const addCollection = async ({
  memberId,
  amount,
  mode,
  date,
  remark,
}) => {
  // ----------------------------------------------------------
  // MANDAL
  // ----------------------------------------------------------

  const mandalId =
    await getMandalId();

  // ----------------------------------------------------------
  // VALIDATE MEMBER
  // ----------------------------------------------------------

  if (!memberId) {
    throw new Error(
      "Member is required."
    );
  }

  // ----------------------------------------------------------
  // VALIDATE AMOUNT
  // ----------------------------------------------------------

  const numericAmount =
    Number(amount);

  if (
    !Number.isFinite(
      numericAmount
    ) ||
    numericAmount <= 0
  ) {
    throw new Error(
      "Collection amount must be greater than 0."
    );
  }

  // ----------------------------------------------------------
  // GET MEMBER
  // ----------------------------------------------------------

  const {
    data: member,
    error: memberError,
  } = await supabase
    .from("members")
    .select(
      "id, member_code, name, mobile, address"
    )
    .eq("id", memberId)
    .single();

  if (memberError) {
    console.error(
      "Member fetch error:",
      memberError
    );

    throw memberError;
  }

  if (!member) {
    throw new Error(
      "Member not found."
    );
  }

  // ----------------------------------------------------------
  // GENERATE RECEIPT NUMBER
  // ----------------------------------------------------------

  const receiptNo =
    await getNextReceiptNumber(
      mandalId
    );

  // ----------------------------------------------------------
  // PAYMENT DATE
  // ----------------------------------------------------------

  const paymentDate =
    date ||
    new Date()
      .toISOString()
      .slice(0, 10);

  // ----------------------------------------------------------
  // SAVE COLLECTION
  // ----------------------------------------------------------

  const {
    data,
    error,
  } = await supabase
    .from("collections")
    .insert({
      mandal_id:
        mandalId,

      member_id:
        memberId,

      receipt_no:
        receiptNo,

      amount:
        numericAmount,

      mode:
        mode || "Cash",

      payment_date:
        paymentDate,

      remark:
        remark || null,
    })
    .select("*")
    .single();

  if (error) {
    console.error(
      "Collection insert error:",
      error
    );

    throw error;
  }

  // ----------------------------------------------------------
  // RETURN RECEIPT READY DATA
  // ----------------------------------------------------------

  return {
    ...data,

    // Receipt
    receiptNo:
      data.receipt_no,

    // Member
    memberId:
      data.member_id,

    memberCode:
      member.member_code || "-",

    memberName:
      member.name || "-",

    mobile:
      member.mobile || "",

    address:
      member.address || "",

    // Payment
    date:
      data.payment_date,

    amount:
      Number(data.amount || 0),

    mode:
      data.mode || "Cash",

    remark:
      data.remark || "",
  };
};

// ============================================================
// DELETE COLLECTION
// ============================================================

export const deleteCollection =
  async (collectionId) => {
    if (!collectionId) {
      throw new Error(
        "Collection ID is required."
      );
    }

    const {
      error,
    } = await supabase
      .from("collections")
      .delete()
      .eq(
        "id",
        collectionId
      );

    if (error) {
      console.error(
        "Collection delete error:",
        error
      );

      throw error;
    }

    return true;
  };