import { supabase } from "../lib/supabase";

// ============================================================
// GET CURRENT MANDAL
// ============================================================

const getMandalId = async () => {
  const { data, error } = await supabase
    .from("mandals")
    .select("id")
    .order("created_at", {
      ascending: true,
    })
    .limit(1)
    .single();

  if (error) {
    console.error(
      "Mandal fetch error:",
      error
    );

    throw error;
  }

  if (!data?.id) {
    throw new Error(
      "No mandal found."
    );
  }

  return data.id;
};


// ============================================================
// GET DASHBOARD DATA
// ============================================================

export const getDashboardData = async () => {
  const mandalId =
    await getMandalId();

  // ==========================================================
  // FETCH ALL DASHBOARD DATA
  // ==========================================================

  const [
    membersResponse,
    collectionsResponse,
    expensesResponse,
  ] = await Promise.all([
    // MEMBERS
    supabase
      .from("members")
      .select("*")
      .eq("mandal_id", mandalId)
      .order("created_at", {
        ascending: true,
      }),

    // COLLECTIONS
    supabase
      .from("collections")
      .select("*")
      .eq("mandal_id", mandalId)
      .order("created_at", {
        ascending: false,
      }),

    // EXPENSES
    supabase
      .from("expenses")
      .select("*")
      .eq("mandal_id", mandalId)
      .order("expense_date", {
        ascending: false,
      }),
  ]);

  // ==========================================================
  // ERROR HANDLING
  // ==========================================================

  if (membersResponse.error) {
    console.error(
      "Members dashboard error:",
      membersResponse.error
    );

    throw membersResponse.error;
  }

  if (collectionsResponse.error) {
    console.error(
      "Collections dashboard error:",
      collectionsResponse.error
    );

    throw collectionsResponse.error;
  }

  if (expensesResponse.error) {
    console.error(
      "Expenses dashboard error:",
      expensesResponse.error
    );

    throw expensesResponse.error;
  }

  // ==========================================================
  // RAW DATA
  // ==========================================================

  const members =
    membersResponse.data || [];

  const collections =
    collectionsResponse.data || [];

  const expenses =
    expensesResponse.data || [];


  // ==========================================================
  // MEMBER MAP
  // ==========================================================

  const memberMap = {};

  members.forEach((member) => {
    memberMap[member.id] = member;
  });


  // ==========================================================
  // MAP MEMBERS
  // ==========================================================

  const mappedMembers =
    members.map((member) => ({
      ...member,

      expected_amount:
        Number(
          member.expected_amount || 0
        ),

      expected:
        Number(
          member.expected_amount || 0
        ),
    }));


  // ==========================================================
  // MAP COLLECTIONS
  // ==========================================================

  const mappedCollections =
    collections.map(
      (collection) => {
        const member =
          memberMap[
            collection.member_id
          ];

        return {
          ...collection,

          // --------------------------------------------------
          // DATABASE ID
          // --------------------------------------------------

          id:
            collection.id,

          // --------------------------------------------------
          // MEMBER
          // --------------------------------------------------

          member_id:
            collection.member_id,

          memberId:
            collection.member_id,

          memberName:
            member?.name ||
            "Unknown Member",

          memberCode:
            member?.member_code ||
            "-",

          mobile:
            member?.mobile ||
            "",

          // --------------------------------------------------
          // AMOUNT
          // --------------------------------------------------

          amount:
            Number(
              collection.amount || 0
            ),

          // --------------------------------------------------
          // PAYMENT MODE
          // --------------------------------------------------

          mode:
            collection.mode ||
            "Cash",

          // --------------------------------------------------
          // RECEIPT
          // --------------------------------------------------

          receiptNo:
            collection.receipt_no ||
            `REC-${collection.id}`,

          receiptNumber:
            collection.receipt_no ||
            `REC-${collection.id}`,

          // --------------------------------------------------
          // DATE
          //
          // IMPORTANT:
          // collections table uses created_at
          // --------------------------------------------------

          date:
            collection.created_at ||
            null,

          created_at:
            collection.created_at ||
            null,

          // --------------------------------------------------
          // REMARK
          // --------------------------------------------------

          remark:
            collection.remark ||
            "-",
        };
      }
    );


  // ==========================================================
  // MAP EXPENSES
  // ==========================================================

  const mappedExpenses =
    expenses.map(
      (expense) => ({
        ...expense,

        // --------------------------------------------------
        // AMOUNT
        // --------------------------------------------------

        amount:
          Number(
            expense.amount || 0
          ),

        // --------------------------------------------------
        // CATEGORY
        // --------------------------------------------------

        category:
          expense.category ||
          "Other",

        // --------------------------------------------------
        // DESCRIPTION
        // --------------------------------------------------

        description:
          expense.description ||
          "",

        // --------------------------------------------------
        // PAYMENT MODE
        // --------------------------------------------------

        mode:
          expense.mode ||
          "Cash",

        // --------------------------------------------------
        // DATE
        // --------------------------------------------------

        date:
          expense.expense_date ||
          expense.created_at ||
          null,
      })
    );


  // ==========================================================
  // RETURN
  // ==========================================================

  return {
    members:
      mappedMembers,

    payments:
      mappedCollections,

    expenses:
      mappedExpenses,
  };
};