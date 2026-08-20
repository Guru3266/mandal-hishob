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

  return data.id;
};

// ============================================================
// GET EXPENSES
// ============================================================

export const getExpenses = async () => {
  const mandalId = await getMandalId();

  const { data, error } = await supabase
    .from("expenses")
    .select("*")
    .eq("mandal_id", mandalId)
    .order("expense_date", { ascending: false });

  if (error) {
    console.error("Expenses fetch error:", error);
    throw error;
  }

  return data || [];
};

// ============================================================
// ADD EXPENSE
// ============================================================

export const addExpense = async (expense) => {
  const mandalId = await getMandalId();

  const amount = Number(expense.amount);

  if (!amount || amount <= 0) {
    throw new Error(
      "Expense amount must be greater than 0"
    );
  }

  const newExpense = {
    mandal_id: mandalId,

    expense_id:
      expense.expenseId ||
      `EXP-${Date.now()}`,

    category:
      expense.category || "Other",

    description:
      expense.description || "",

    amount,

    mode:
      expense.mode || "Cash",

    expense_date:
      expense.date ||
      new Date().toISOString().slice(0, 10),

    remark:
      expense.remark || null,
  };

  const { data, error } = await supabase
    .from("expenses")
    .insert([newExpense])
    .select()
    .single();

  if (error) {
    console.error("Expense add error:", error);
    throw error;
  }

  return data;
};

// ============================================================
// UPDATE EXPENSE
// ============================================================

export const updateExpense = async (
  id,
  expense
) => {
  const amount = Number(expense.amount);

  if (!amount || amount <= 0) {
    throw new Error(
      "Expense amount must be greater than 0"
    );
  }

  const { data, error } = await supabase
    .from("expenses")
    .update({
      category:
        expense.category || "Other",

      description:
        expense.description || "",

      amount,

      mode:
        expense.mode || "Cash",

      expense_date:
        expense.date ||
        new Date().toISOString().slice(0, 10),

      remark:
        expense.remark || null,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Expense update error:", error);
    throw error;
  }

  return data;
};

// ============================================================
// DELETE EXPENSE
// ============================================================

export const deleteExpense = async (id) => {
  const { error } = await supabase
    .from("expenses")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Expense delete error:", error);
    throw error;
  }

  return true;
};