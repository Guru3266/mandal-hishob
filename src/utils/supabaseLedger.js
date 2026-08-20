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
    throw new Error("Mandal not found.");
  }

  return data.id;
};

// ============================================================
// GET LEDGER TRANSACTIONS
// ============================================================

export const getLedgerTransactions = async () => {
  try {
    const mandalId = await getMandalId();

    // ========================================================
    // FETCH COLLECTIONS + EXPENSES
    // ========================================================

    const [
      collectionsResponse,
      expensesResponse,
    ] = await Promise.all([
      supabase
        .from("collections")
        .select("*")
        .eq("mandal_id", mandalId),

      supabase
        .from("expenses")
        .select("*")
        .eq("mandal_id", mandalId),
    ]);

    // ========================================================
    // ERROR HANDLING
    // ========================================================

    if (collectionsResponse.error) {
      console.error(
        "Ledger collections error:",
        collectionsResponse.error
      );

      throw collectionsResponse.error;
    }

    if (expensesResponse.error) {
      console.error(
        "Ledger expenses error:",
        expensesResponse.error
      );

      throw expensesResponse.error;
    }

    const collections =
      collectionsResponse.data || [];

    const expenses =
      expensesResponse.data || [];

    // ========================================================
    // GET MEMBER IDs
    // ========================================================

    const memberIds = [
      ...new Set(
        collections
          .map(
            (collection) =>
              collection.member_id
          )
          .filter(Boolean)
      ),
    ];

    // ========================================================
    // GET MEMBERS
    // ========================================================

    let members = [];

    if (memberIds.length > 0) {
      const {
        data: memberData,
        error: memberError,
      } = await supabase
        .from("members")
        .select(
          "id, name, member_code, mobile"
        )
        .in("id", memberIds);

      if (memberError) {
        console.error(
          "Ledger members error:",
          memberError
        );

        throw memberError;
      }

      members = memberData || [];
    }

    // ========================================================
    // MEMBER MAP
    // ========================================================

    const memberMap = {};

    members.forEach((member) => {
      memberMap[member.id] = member;
    });

    // ========================================================
    // MAP COLLECTIONS
    // ========================================================

    const collectionTransactions =
      collections.map((collection) => {
        const member =
          memberMap[collection.member_id];

        const amount = Number(
          collection.amount || 0
        );

        return {
          id: collection.id,

          transactionId:
            collection.receipt_no ||
            `REC-${collection.id}`,

          type: "income",

          name:
            member?.name ||
            "Unknown Member",

          memberName:
            member?.name ||
            "Unknown Member",

          memberId:
            collection.member_id ||
            "",

          memberCode:
            member?.member_code ||
            "-",

          mobile:
            member?.mobile ||
            "",

          description:
            "Member Collection",

          mode:
            collection.mode ||
            "Cash",

          amount,

          credit: amount,

          debit: 0,

          date:
            collection.payment_date ||
            collection.created_at ||
            "",

          createdAt:
            collection.created_at ||
            "",

          remark:
            collection.remark ||
            "-",
        };
      });

    // ========================================================
    // MAP EXPENSES
    // ========================================================

    const expenseTransactions =
      expenses.map((expense) => {
        const amount = Number(
          expense.amount || 0
        );

        return {
          id: expense.id,

          // IMPORTANT:
          // Use readable EXP ID instead of UUID
          transactionId:
            expense.expense_id ||
            `EXP-${expense.id}`,

          type: "expense",

          name:
            expense.category ||
            "Expense",

          memberName: "",

          memberId: "",

          memberCode: "",

          mobile: "",

          description:
            expense.description ||
            expense.category ||
            "Expense",

          category:
            expense.category ||
            "Other",

          mode:
            expense.mode ||
            "Cash",

          amount,

          credit: 0,

          debit: amount,

          date:
            expense.expense_date ||
            expense.created_at ||
            "",

          createdAt:
            expense.created_at ||
            "",

          remark:
            expense.remark ||
            "-",
        };
      });

    // ========================================================
    // COMBINE
    // ========================================================

    const allTransactions = [
      ...collectionTransactions,
      ...expenseTransactions,
    ];

    // ========================================================
    // SORT OLDEST → NEWEST
    // ========================================================

    allTransactions.sort((a, b) => {
      const dateA = new Date(
        a.date || a.createdAt || 0
      ).getTime();

      const dateB = new Date(
        b.date || b.createdAt || 0
      ).getTime();

      return dateA - dateB;
    });

    // ========================================================
    // RUNNING BALANCE
    // ========================================================

    let runningBalance = 0;

    const transactionsWithBalance =
      allTransactions.map((transaction) => {
        runningBalance +=
          Number(transaction.credit || 0) -
          Number(transaction.debit || 0);

        return {
          ...transaction,

          balance: runningBalance,
        };
      });

    // ========================================================
    // DISPLAY NEWEST → OLDEST
    // ========================================================

    transactionsWithBalance.reverse();

    console.log(
      "Ledger transactions:",
      transactionsWithBalance
    );

    return transactionsWithBalance;
  } catch (error) {
    console.error(
      "getLedgerTransactions error:",
      error
    );

    throw error;
  }
};

// ============================================================
// ALIAS
// ============================================================

export const getLedgerData =
  getLedgerTransactions;

// ============================================================
// GET SINGLE LEDGER TRANSACTION
// ============================================================

export const getLedgerTransactionById =
  async (id, type) => {
    if (!id || !type) {
      throw new Error(
        "Transaction ID and type are required."
      );
    }

    // ========================================================
    // INCOME / COLLECTION
    // ========================================================

    if (type === "income") {
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
          "Collection transaction error:",
          error
        );

        throw error;
      }

      return data;
    }

    // ========================================================
    // EXPENSE
    // ========================================================

    if (type === "expense") {
      const {
        data,
        error,
      } = await supabase
        .from("expenses")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error(
          "Expense transaction error:",
          error
        );

        throw error;
      }

      return data;
    }

    throw new Error(
      "Invalid transaction type."
    );
  };