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
      "Mandal not found."
    );
  }

  return data.id;
};

// ============================================================
// GET REPORT DATA
// ============================================================

export const getReportsData = async () => {
  try {
    const mandalId =
      await getMandalId();

    // ========================================================
    // FETCH MEMBERS + COLLECTIONS + EXPENSES
    // ========================================================

    const [
      membersResponse,
      collectionsResponse,
      expensesResponse,
    ] = await Promise.all([
      // ------------------------------------------------------
      // MEMBERS
      // ------------------------------------------------------

      supabase
        .from("members")
        .select("*")
        .eq(
          "mandal_id",
          mandalId
        )
        .order("created_at", {
          ascending: true,
        }),

      // ------------------------------------------------------
      // COLLECTIONS
      // ------------------------------------------------------
      // created_at is used because Receipts currently
      // stores the selected receipt date in created_at.
      // ------------------------------------------------------

      supabase
        .from("collections")
        .select("*")
        .eq(
          "mandal_id",
          mandalId
        )
        .order("created_at", {
          ascending: false,
        }),

      // ------------------------------------------------------
      // EXPENSES
      // ------------------------------------------------------

      supabase
        .from("expenses")
        .select("*")
        .eq(
          "mandal_id",
          mandalId
        )
        .order("expense_date", {
          ascending: false,
        }),
    ]);

    // ========================================================
    // ERROR HANDLING
    // ========================================================

    if (membersResponse.error) {
      console.error(
        "Reports members error:",
        membersResponse.error
      );

      throw membersResponse.error;
    }

    if (
      collectionsResponse.error
    ) {
      console.error(
        "Reports collections error:",
        collectionsResponse.error
      );

      throw collectionsResponse.error;
    }

    if (expensesResponse.error) {
      console.error(
        "Reports expenses error:",
        expensesResponse.error
      );

      throw expensesResponse.error;
    }

    // ========================================================
    // RAW DATA
    // ========================================================

    const members =
      membersResponse.data || [];

    const collections =
      collectionsResponse.data || [];

    const expenses =
      expensesResponse.data || [];

    // ========================================================
    // MEMBER MAP
    // ========================================================

    const memberMap = {};

    members.forEach((member) => {
      memberMap[member.id] =
        member;
    });

    // ========================================================
    // MAP MEMBERS
    // ========================================================

    const mappedMembers =
      members.map((member) => ({
        ...member,

        expected: Number(
          member.expected_amount ||
            0
        ),
      }));

    // ========================================================
    // MAP COLLECTIONS
    // ========================================================

    const mappedCollections =
      collections.map(
        (collection) => {
          const member =
            memberMap[
              collection.member_id
            ];

          const amount =
            Number(
              collection.amount ||
                0
            );

          const receiptDate =
            collection.payment_date ||
            collection.created_at ||
            "";

          return {
            ...collection,

            id:
              collection.id,

            memberId:
              collection.member_id ||
              "",

            memberName:
              member?.name ||
              "-",

            memberCode:
              member?.member_code ||
              "-",

            mobile:
              member?.mobile ||
              "",

            amount,

            mode:
              collection.mode ||
              "Cash",

            // Primary report date
            date:
              receiptDate,

            // Compatibility
            paymentDate:
              receiptDate,

            receiptNumber:
              collection.receipt_no ||
              "",

            remark:
              collection.remark ||
              "-",

            createdAt:
              collection.created_at ||
              "",
          };
        }
      );

    // ========================================================
    // MAP EXPENSES
    // ========================================================

    const mappedExpenses =
      expenses.map((expense) => {
        const amount =
          Number(
            expense.amount || 0
          );

        const expenseDate =
          expense.expense_date ||
          expense.created_at ||
          "";

        return {
          ...expense,

          id:
            expense.id,

          amount,

          category:
            expense.category ||
            "Other",

          description:
            expense.description ||
            "",

          mode:
            expense.mode ||
            "Cash",

          date:
            expenseDate,

          expenseDate:
            expenseDate,

          remark:
            expense.remark ||
            "-",

          createdAt:
            expense.created_at ||
            "",
        };
      });

    // ========================================================
    // RETURN REPORT DATA
    // ========================================================

    return {
      members:
        mappedMembers,

      collections:
        mappedCollections,

      expenses:
        mappedExpenses,
    };
  } catch (error) {
    console.error(
      "Reports data loading error:",
      error
    );

    throw error;
  }
};