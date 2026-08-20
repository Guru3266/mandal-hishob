import { supabase } from "../lib/supabase";

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
    throw new Error("No mandal found.");
  }

  return data.id;
};

// ============================================================
// GET RECEIPTS
// ============================================================

export const getReceipts = async () => {
  const mandalId = await getMandalId();

  const { data: collections, error } = await supabase
    .from("collections")
    .select("*")
    .eq("mandal_id", mandalId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Receipts fetch error:", error);
    throw error;
  }

  if (!collections || collections.length === 0) {
    return [];
  }

  // ==========================================================
  // GET MEMBER IDS
  // ==========================================================

  const memberIds = [
    ...new Set(
      collections
        .map((item) => item.member_id)
        .filter(Boolean)
    ),
  ];

  let members = [];

  // ==========================================================
  // GET MEMBERS FROM MEMBERS TABLE
  // ==========================================================

  if (memberIds.length > 0) {
    const {
      data: memberData,
      error: memberError,
    } = await supabase
      .from("members")
      .select(
        "id, name, member_code, mobile, address, expected_amount"
      )
      .in("id", memberIds);

    if (memberError) {
      console.error("Members fetch error:", memberError);
      throw memberError;
    }

    members = memberData || [];
  }

  // ==========================================================
  // COMBINE COLLECTION + MEMBER DATA
  // ==========================================================

  return collections.map((collection) => {
    const member = members.find(
      (m) => m.id === collection.member_id
    );

    return {
      // Collection
      id: collection.id,

      receiptNo:
        collection.receipt_no || `REC-${collection.id}`,

      memberId:
        collection.member_id || "",

      // Member
      memberName:
        member?.name || "Unknown Member",

      memberCode:
        member?.member_code || "-",

      mobile:
        member?.mobile || "",

      address:
        member?.address || "",

      expectedAmount:
        Number(member?.expected_amount || 0),

      // Payment
      amount:
        Number(collection.amount || 0),

      mode:
        collection.mode || "Cash",

      // ========================================================
      // DATE
      // ========================================================

      date: collection.created_at
        ? new Date(collection.created_at)
            .toISOString()
            .slice(0, 10)
        : "",

      createdAt:
        collection.created_at || "",

      updatedAt:
        collection.updated_at || "",

      // Collections table currently has no remark column
      remark: "",
    };
  });
};

// ============================================================
// ADD RECEIPT
// ============================================================

export const addReceipt = async (receipt) => {
  // ==========================================================
  // VALIDATION
  // ==========================================================

  if (!receipt?.memberId) {
    throw new Error("Please select a member.");
  }

  const amount = Number(receipt.amount);

  if (!amount || amount <= 0) {
    throw new Error(
      "Receipt amount must be greater than 0."
    );
  }

  // ==========================================================
  // GET MANDAL
  // ==========================================================

  const mandalId = await getMandalId();

  // ==========================================================
  // RECEIPT NUMBER
  // ==========================================================

  const receiptNo =
    receipt.receiptNo ||
    `REC-${Date.now()}`;

  // ==========================================================
  // PAYMENT MODE
  // ==========================================================

  const mode =
    receipt.mode || "Cash";

  const allowedModes = [
    "Cash",
    "UPI",
    "Bank",
  ];

  if (!allowedModes.includes(mode)) {
    throw new Error(
      "Invalid payment mode."
    );
  }

  // ==========================================================
  // DATE
  // ==========================================================

  let createdAt;

  if (receipt.date) {
    const dateString =
      String(receipt.date).trim();

    // YYYY-MM-DD
    if (
      /^\d{4}-\d{2}-\d{2}$/.test(
        dateString
      )
    ) {
      // Store at noon IST to avoid timezone date shifting
      createdAt = new Date(
        `${dateString}T12:00:00+05:30`
      ).toISOString();
    } else {
      createdAt =
        new Date().toISOString();
    }
  } else {
    createdAt =
      new Date().toISOString();
  }

  // ==========================================================
  // NEW RECEIPT
  // ==========================================================

  const newReceipt = {
    mandal_id:
      mandalId,

    member_id:
      receipt.memberId,

    receipt_no:
      receiptNo,

    amount:
      amount,

    mode:
      mode,

    created_at:
      createdAt,

    updated_at:
      createdAt,
  };

  console.log(
    "Adding receipt:",
    newReceipt
  );

  // ==========================================================
  // INSERT
  // ==========================================================

  const {
    data,
    error,
  } = await supabase
    .from("collections")
    .insert([newReceipt])
    .select()
    .single();

  if (error) {
    console.error(
      "Receipt add error:",
      error
    );

    throw error;
  }

  return data;
};

// ============================================================
// GET SINGLE RECEIPT
// ============================================================

export const getReceiptById = async (
  id
) => {
  if (!id) {
    throw new Error(
      "Receipt ID is required."
    );
  }

  const {
    data,
    error,
  } = await supabase
    .from("collections")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error(
      "Receipt fetch error:",
      error
    );

    throw error;
  }

  return data;
};

// ============================================================
// DELETE RECEIPT
// ============================================================

export const deleteReceipt = async (
  id
) => {
  if (!id) {
    throw new Error(
      "Receipt ID is required."
    );
  }

  const {
    error,
  } = await supabase
    .from("collections")
    .delete()
    .eq("id", id);

  if (error) {
    console.error(
      "Receipt delete error:",
      error
    );

    throw error;
  }

  return true;
};