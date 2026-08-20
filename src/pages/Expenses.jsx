import { useEffect, useMemo, useState } from "react";

import {
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  Wallet,
  ReceiptText,
  CalendarDays,
  IndianRupee,
  RefreshCw,
  Eye,
  Printer,
  MessageCircle,
} from "lucide-react";

import {
  getExpenses,
  addExpense,
  updateExpense,
  deleteExpense,
} from "../utils/supabaseExpenses";

import useMandalConfig from "../hooks/useMandalConfig";
import "./Expenses.css";

function Expenses() {
  // =====================================================
  // STATES
  // =====================================================

  const [expenses, setExpenses] = useState([]);

  const [search, setSearch] = useState("");

  const [categoryFilter, setCategoryFilter] =
    useState("All");

  const [modeFilter, setModeFilter] =
    useState("All");

  const [showModal, setShowModal] =
    useState(false);

  const [editingExpense, setEditingExpense] =
    useState(null);

  const [viewingExpense, setViewingExpense] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const mandalConfig =
  useMandalConfig();

  // =====================================================
  // EMPTY FORM
  // =====================================================

  const emptyForm = {
    category: "",
    description: "",
    amount: "",
    mode: "Cash",
    date: new Date()
      .toISOString()
      .split("T")[0],
    remark: "",
  };

  const [formData, setFormData] =
    useState(emptyForm);

  // =====================================================
  // LOAD EXPENSES
  // =====================================================

  const loadExpenses = async () => {
    try {
      setLoading(true);

      const data = await getExpenses();

      const mappedData = (data || []).map(
        (expense) => ({
          ...expense,

          // Supabase → UI mapping
          expenseId:
            expense.expense_id || "",

          date:
            expense.expense_date || "",

          // Supabase table does not currently
          // contain remark column
          remark:
            expense.remark || "",
        })
      );

      setExpenses(
        mappedData.sort(
          (a, b) =>
            new Date(b.date || 0) -
            new Date(a.date || 0)
        )
      );
    } catch (error) {
      console.error(
        "Expenses load error:",
        error
      );

      alert(
        error.message ||
          "Expenses load करताना error आला."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

 useEffect(() => {
  loadExpenses();
}, []);

  // =====================================================
  // CATEGORIES
  // =====================================================

  const categories = useMemo(() => {
    const values = expenses
      .map(
        (expense) =>
          expense.category
      )
      .filter(Boolean);

    return [...new Set(values)];
  }, [expenses]);

  // =====================================================
  // FILTER
  // =====================================================

  const filteredExpenses = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    return expenses.filter(
      (expense) => {
        const matchesSearch =
          !query ||
          String(
            expense.category || ""
          )
            .toLowerCase()
            .includes(query) ||

          String(
            expense.description || ""
          )
            .toLowerCase()
            .includes(query) ||

          String(
            expense.expense_id ||
              expense.expenseId ||
              expense.id ||
              ""
          )
            .toLowerCase()
            .includes(query);

        const matchesCategory =
          categoryFilter === "All" ||
          expense.category ===
            categoryFilter;

        const matchesMode =
          modeFilter === "All" ||
          expense.mode ===
            modeFilter;

        return (
          matchesSearch &&
          matchesCategory &&
          matchesMode
        );
      }
    );
  }, [
    expenses,
    search,
    categoryFilter,
    modeFilter,
  ]);

  // =====================================================
  // OPEN ADD MODAL
  // =====================================================

  const openAddModal = () => {
    setEditingExpense(null);

    setFormData({
      ...emptyForm,
      date: new Date()
        .toISOString()
        .split("T")[0],
    });

    setShowModal(true);
  };

  // =====================================================
  // OPEN EDIT MODAL
  // =====================================================

  const openEditModal = (expense) => {
    setEditingExpense(expense);

    setFormData({
      category:
        expense.category || "",

      description:
        expense.description || "",

      amount:
        expense.amount || "",

      mode:
        expense.mode || "Cash",

      date:
        expense.date ||
        expense.expense_date ||
        new Date()
          .toISOString()
          .split("T")[0],

      remark:
        expense.remark === "-"
          ? ""
          : expense.remark || "",
    });

    setShowModal(true);
  };

  // =====================================================
  // CLOSE ADD / EDIT MODAL
  // =====================================================

  const closeModal = () => {
    setShowModal(false);

    setEditingExpense(null);

    setFormData({
      ...emptyForm,
    });
  };

  // =====================================================
  // HANDLE INPUT
  // =====================================================

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setFormData(
      (previous) => ({
        ...previous,
        [name]: value,
      })
    );
  };

  // =====================================================
  // SAVE EXPENSE
  // =====================================================

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    if (
      !formData.category.trim()
    ) {
      alert(
        "कृपया Expense Category भरा."
      );

      return;
    }

    if (
      !formData.amount ||
      Number(formData.amount) <= 0
    ) {
      alert(
        "कृपया योग्य Expense Amount भरा."
      );

      return;
    }

    try {
      if (editingExpense) {
        await updateExpense(
          editingExpense.id,
          formData
        );
      } else {
        await addExpense(
          formData
        );
      }

      closeModal();

      await loadExpenses();

    } catch (error) {
      console.error(
        "Expense save error:",
        error
      );

      alert(
        error.message ||
          "Expense save करताना error आला."
      );
    }
  };

  // =====================================================
  // DELETE
  // =====================================================

  const handleDelete = async (
    expense
  ) => {
    const confirmed =
      window.confirm(
        `तुम्हाला "${expense.category}" चा ₹${Number(
          expense.amount
        ).toLocaleString(
          "en-IN"
        )} expense delete करायचा आहे का?`
      );

    if (!confirmed) {
      return;
    }

    try {
      await deleteExpense(
        expense.id
      );

      await loadExpenses();

    } catch (error) {
      console.error(
        "Expense delete error:",
        error
      );

      alert(
        error.message ||
          "Expense delete करताना error आला."
      );
    }
  };

  // =====================================================
  // TOTAL
  // =====================================================

  const totalExpense =
    expenses.reduce(
      (total, expense) =>
        total +
        Number(
          expense.amount || 0
        ),
      0
    );

  const filteredTotal =
    filteredExpenses.reduce(
      (
        total,
        expense
      ) =>
        total +
        Number(
          expense.amount || 0
        ),
      0
    );

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    const value =
      new Date(date);

    if (
      Number.isNaN(
        value.getTime()
      )
    ) {
      return date;
    }

    return value.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  // =====================================================
  // VIEW EXPENSE
  // =====================================================

  const openViewExpense = (
    expense
  ) => {
    setViewingExpense(
      expense
    );
  };

  // =====================================================
  // CLOSE VIEW
  // =====================================================

  const closeViewExpense = () => {
    setViewingExpense(
      null
    );
  };

  // =====================================================
  // WHATSAPP EXPENSE
  // =====================================================

  const sendExpenseWhatsApp = (
    expense
  ) => {
    const message = `
🙏 ${mandalConfig?.name || "मंडळ"}

${mandalConfig?.tagline || ""}

💸 खर्च नोंद

Expense ID: ${
      expense.expense_id ||
      expense.expenseId ||
      expense.id ||
      "-"
    }

Category: ${
      expense.category || "-"
    }

Description: ${
      expense.description || "-"
    }

Amount: ₹${Number(
      expense.amount || 0
    ).toLocaleString("en-IN")}

Payment Mode: ${
      expense.mode || "Cash"
    }

Date: ${formatDate(
      expense.date ||
        expense.expense_date
    )}

Remark: ${
      expense.remark || "-"
    }

धन्यवाद! 🙏

${
  mandalConfig?.name || ""
}

${
  mandalConfig?.address || ""
}
    `.trim();

    const whatsappUrl =
      `https://wa.me/?text=${encodeURIComponent(
        message
      )}`;

    window.open(
      whatsappUrl,
      "_blank",
      "noopener,noreferrer"
    );
  };

  // =====================================================
  // PRINT EXPENSE
  // =====================================================

  const printExpense = (
    expense
  ) => {
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

    const mandalName =
      mandalConfig?.name ||
      "मंडळ";

    const tagline =
      mandalConfig?.tagline ||
      "";

    const address =
      mandalConfig?.address ||
      "";

    const amount =
      Number(
        expense.amount || 0
      ).toLocaleString(
        "en-IN"
      );

    const expenseId =
      expense.expense_id ||
      expense.expenseId ||
      expense.id ||
      "-";

    printWindow.document.open();

    printWindow.document.write(`
      <!DOCTYPE html>

      <html lang="mr">

      <head>

        <meta charset="UTF-8" />

        <title>
          Expense ${expenseId}
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
            background: #fff;
          }

          body {
            font-family:
              Arial,
              "Noto Sans Devanagari",
              "Nirmala UI",
              sans-serif;

            color: #172033;
          }

          .expense-print {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            padding: 30px;

            border:
              1px solid #dfe4ea;

            border-radius: 12px;
            background: #fff;
          }

          .print-header {
            text-align: center;
            padding-bottom: 18px;

            border-bottom:
              2px solid #ef4444;
          }

          .print-header h1 {
            margin: 0;
            font-size: 25px;
          }

          .print-header p {
            margin: 5px 0;
            color: #64748b;
            font-size: 13px;
          }

          .print-header h2 {
            margin-top: 12px;
            font-size: 20px;
          }

          .expense-id {
            text-align: right;
            padding: 15px 0;
            font-size: 13px;
            color: #64748b;
          }

          .expense-id strong {
            color: #172033;
            margin-left: 5px;
          }

          .print-row {
            display: flex;
            justify-content: space-between;
            gap: 20px;

            padding: 13px 0;

            border-bottom:
              1px solid #eef0f4;

            font-size: 14px;
          }

          .print-row span {
            color: #64748b;
          }

          .print-row strong {
            color: #172033;
            text-align: right;
          }

          .print-amount {
            text-align: center;
            margin-top: 25px;
          }

          .print-amount span {
            display: block;
            color: #64748b;
            font-size: 13px;
          }

          .print-amount strong {
            display: block;
            margin-top: 5px;
            color: #dc2626;
            font-size: 34px;
          }

          .print-thanks {
            text-align: center;
            margin-top: 25px;
            color: #64748b;
            font-size: 13px;
          }

          @media print {
            body {
              -webkit-print-color-adjust:
                exact;

              print-color-adjust:
                exact;
            }
          }

        </style>

      </head>

      <body>

        <div class="expense-print">

          <div class="print-header">

            <h1>
              ${mandalName}
            </h1>

            ${
              tagline
                ? `<p>${tagline}</p>`
                : ""
            }

            <h2>
              खर्च नोंद
            </h2>

          </div>

          <div class="expense-id">

            Expense ID:

            <strong>
              ${expenseId}
            </strong>

          </div>

          <div class="print-row">

            <span>
              Category
            </span>

            <strong>
              ${
                expense.category ||
                "-"
              }
            </strong>

          </div>

          <div class="print-row">

            <span>
              Description
            </span>

            <strong>
              ${
                expense.description ||
                "-"
              }
            </strong>

          </div>

          <div class="print-row">

            <span>
              Payment Mode
            </span>

            <strong>
              ${
                expense.mode ||
                "Cash"
              }
            </strong>

          </div>

          <div class="print-row">

            <span>
              Date
            </span>

            <strong>
              ${formatDate(
                expense.date ||
                  expense.expense_date
              )}
            </strong>

          </div>

          <div class="print-row">

            <span>
              Remark
            </span>

            <strong>
              ${
                expense.remark ||
                "-"
              }
            </strong>

          </div>

          <div class="print-amount">

            <span>
              एकूण खर्च
            </span>

            <strong>
              ₹${amount}
            </strong>

          </div>

          <div class="print-thanks">

            ${address}

            <br />

            धन्यवाद! 🙏

          </div>

        </div>

        <script>

          window.onload = function () {

            setTimeout(
              function () {

                window.focus();

                window.print();

              },
              500
            );

          };

          window.onafterprint =
            function () {

              setTimeout(
                function () {

                  window.close();

                },
                300
              );

            };

        </script>

      </body>

      </html>
    `);

    printWindow.document.close();
  };

  // =====================================================
  // RETURN
  // =====================================================

  return (
    <div className="expenses-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="expenses-header">

        <div>

          <h1>
            खर्च
          </h1>

          <p>
            मंडळाचे सर्व खर्च व्यवस्थापित करा
          </p>

        </div>

        <button
          className="add-expense-btn"
          onClick={openAddModal}
        >

          <Plus size={17} />

          खर्च नोंदवा

        </button>

      </div>

      {/* =================================================
          SUMMARY
      ================================================= */}

      <div className="expense-summary">

        <div className="expense-summary-card">

          <div className="expense-summary-icon red">

            <IndianRupee size={20} />

          </div>

          <div>

            <span>
              एकूण खर्च
            </span>

            <strong>
              ₹
              {totalExpense.toLocaleString(
                "en-IN"
              )}
            </strong>

          </div>

        </div>

        <div className="expense-summary-card">

          <div className="expense-summary-icon orange">

            <ReceiptText size={20} />

          </div>

          <div>

            <span>
              एकूण Transactions
            </span>

            <strong>
              {expenses.length}
            </strong>

          </div>

        </div>

        <div className="expense-summary-card">

          <div className="expense-summary-icon blue">

            <Wallet size={20} />

          </div>

          <div>

            <span>
              Filtered Amount
            </span>

            <strong>
              ₹
              {filteredTotal.toLocaleString(
                "en-IN"
              )}
            </strong>

          </div>

        </div>

      </div>

      {/* =================================================
          FILTER BAR
      ================================================= */}

      <div className="expense-filter-card">

        <div className="expense-search">

          <Search size={17} />

          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            placeholder="Category, description किंवा Expense ID search करा..."
          />

        </div>

        <select
          value={categoryFilter}
          onChange={(event) =>
            setCategoryFilter(
              event.target.value
            )
          }
        >

          <option value="All">
            सर्व Categories
          </option>

          {categories.map(
            (category) => (

              <option
                key={category}
                value={category}
              >
                {category}
              </option>

            )
          )}

        </select>

        <select
          value={modeFilter}
          onChange={(event) =>
            setModeFilter(
              event.target.value
            )
          }
        >

          <option value="All">
            सर्व Payment Modes
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

        <button
          className="expense-refresh-btn"
          onClick={loadExpenses}
          title="Refresh"
        >

          <RefreshCw
            size={16}
            className={
              loading
                ? "refresh-spin"
                : ""
            }
          />

        </button>

      </div>

      {/* =================================================
          TABLE
      ================================================= */}

      <div className="expense-table-card">

        <div className="expense-table-header">

          <div>

            <h2>
              Expense Records
            </h2>

            <p>
              {filteredExpenses.length}
              {" "}
              records found
            </p>

          </div>

        </div>

        {filteredExpenses.length === 0 ? (

          <div className="expense-empty">

            <ReceiptText size={35} />

            <strong>
              कोणताही खर्च सापडला नाही
            </strong>

            <span>
              नवीन खर्च नोंदवण्यासाठी
              "खर्च नोंदवा" वर क्लिक करा.
            </span>

          </div>

        ) : (

          <div className="expense-table-wrapper">

            <table className="expense-table">

              <thead>

                <tr>

                  <th>
                    Expense ID
                  </th>

                  <th>
                    Category
                  </th>

                  <th>
                    Description
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
                    Action
                  </th>

                </tr>

              </thead>

              <tbody>

                {filteredExpenses.map(
                  (expense) => (

                    <tr
                      key={
                        expense.id
                      }
                    >

                      <td>

                        <span className="expense-id">

                          {
                            expense.expense_id ||
                            expense.expenseId ||
                            expense.id
                          }

                        </span>

                      </td>

                      <td>

                        <strong>
                          {
                            expense.category
                          }
                        </strong>

                      </td>

                      <td>

                        <span className="expense-description">

                          {
                            expense.description ||
                            "-"
                          }

                        </span>

                      </td>

                      <td>

                        <strong className="expense-amount">

                          ₹
                          {Number(
                            expense.amount
                          ).toLocaleString(
                            "en-IN"
                          )}

                        </strong>

                      </td>

                      <td>

                        <span
                          className={`expense-mode ${String(
                            expense.mode ||
                              "Cash"
                          ).toLowerCase()}`}
                        >

                          {
                            expense.mode ||
                            "Cash"
                          }

                        </span>

                      </td>

                      <td>

                        <span className="expense-date">

                          <CalendarDays
                            size={13}
                          />

                          {
                            formatDate(
                              expense.date ||
                                expense.expense_date
                            )
                          }

                        </span>

                      </td>

                      <td>

                        <div className="expense-actions">

                          {/* VIEW */}

                          <button
                            type="button"
                            className="expense-view-btn"
                            onClick={() =>
                              openViewExpense(
                                expense
                              )
                            }
                            title="View"
                          >

                            <Eye size={15} />

                          </button>

                          {/* EDIT */}

                          <button
                            type="button"
                            className="expense-edit-btn"
                            onClick={() =>
                              openEditModal(
                                expense
                              )
                            }
                            title="Edit"
                          >

                            <Pencil size={15} />

                          </button>

                          {/* DELETE */}

                          <button
                            type="button"
                            className="expense-delete-btn"
                            onClick={() =>
                              handleDelete(
                                expense
                              )
                            }
                            title="Delete"
                          >

                            <Trash2 size={15} />

                          </button>

                        </div>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>

      {/* =================================================
          ADD / EDIT MODAL
      ================================================= */}

      {showModal && (

        <div
          className="expense-modal-overlay"
          onMouseDown={(event) => {

            if (
              event.target ===
              event.currentTarget
            ) {

              closeModal();

            }

          }}
        >

          <div className="expense-modal">

            {/* HEADER */}

            <div className="expense-modal-header">

              <div>

                <h2>

                  {editingExpense
                    ? "खर्च Edit करा"
                    : "नवीन खर्च नोंदवा"}

                </h2>

                <p>

                  {editingExpense
                    ? "Expense information update करा"
                    : "मंडळाचा नवीन खर्च नोंदवा"}

                </p>

              </div>

              <button
                type="button"
                className="expense-close-btn"
                onClick={
                  closeModal
                }
              >

                <X size={19} />

              </button>

            </div>

            {/* FORM */}

            <form
              className="expense-form"
              onSubmit={
                handleSubmit
              }
            >

              {/* CATEGORY */}

              <div className="expense-form-group">

                <label>

                  Category

                  <span>
                    *
                  </span>

                </label>

                <select
                  name="category"
                  value={
                    formData.category
                  }
                  onChange={
                    handleChange
                  }
                  required
                >

                  <option value="">
                    Category निवडा
                  </option>

                  <option value="Decoration">
                    Decoration
                  </option>

                  <option value="Sound">
                    Sound
                  </option>

                  <option value="Lighting">
                    Lighting
                  </option>

                  <option value="Prasad">
                    Prasad
                  </option>

                  <option value="Pooja">
                    Pooja
                  </option>

                  <option value="Advertisement">
                    Advertisement
                  </option>

                  <option value="Transport">
                    Transport
                  </option>

                  <option value="Food">
                    Food
                  </option>

                  <option value="Other">
                    Other
                  </option>

                </select>

              </div>

              {/* DESCRIPTION */}

              <div className="expense-form-group">

                <label>
                  Description
                </label>

                <input
                  type="text"
                  name="description"
                  value={
                    formData.description
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="उदा. Mandap Decoration"
                />

              </div>

              {/* AMOUNT */}

              <div className="expense-form-group">

                <label>

                  Amount

                  <span>
                    *
                  </span>

                </label>

                <div className="amount-input-wrapper">

                  <span>
                    ₹
                  </span>

                  <input
                    type="number"
                    name="amount"
                    value={
                      formData.amount
                    }
                    onChange={
                      handleChange
                    }
                    min="1"
                    step="1"
                    placeholder="उदा. 5000"
                    required
                  />

                </div>

              </div>

              {/* MODE */}

              <div className="expense-form-group">

                <label>
                  Payment Mode
                </label>

                <select
                  name="mode"
                  value={
                    formData.mode
                  }
                  onChange={
                    handleChange
                  }
                >

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

              </div>

              {/* DATE */}

              <div className="expense-form-group">

                <label>
                  Date
                </label>

                <input
                  type="date"
                  name="date"
                  value={
                    formData.date
                  }
                  onChange={
                    handleChange
                  }
                />

              </div>

              {/* REMARK */}

              <div className="expense-form-group">

                <label>
                  Remark
                </label>

                <textarea
                  name="remark"
                  value={
                    formData.remark
                  }
                  onChange={
                    handleChange
                  }
                  rows="3"
                  placeholder="Optional remark..."
                />

              </div>

              {/* ACTIONS */}

              <div className="expense-modal-actions">

                <button
                  type="button"
                  className="expense-cancel-btn"
                  onClick={
                    closeModal
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="expense-save-btn"
                >

                  {editingExpense
                    ? "Update Expense"
                    : "Save Expense"}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

      {/* =================================================
          VIEW EXPENSE MODAL
      ================================================= */}

      {viewingExpense && (

        <div
          className="expense-view-overlay"
          onMouseDown={(event) => {

            if (
              event.target ===
              event.currentTarget
            ) {

              closeViewExpense();

            }

          }}
        >

          <div
            className="expense-view-modal"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >

            {/* VIEW HEADER */}

            <div className="expense-view-header">

              <div>

                <h2>
                  खर्च तपशील
                </h2>

                <p>
                  {
                    mandalConfig?.name ||
                    "मंडळ"
                  }
                </p>

              </div>

              <button
                type="button"
                className="expense-view-close"
                onClick={
                  closeViewExpense
                }
              >

                <X size={19} />

              </button>

            </div>

            {/* EXPENSE PAPER */}

            <div className="expense-view-paper">

              <div className="expense-view-title">

                <div className="expense-view-icon">
                  💸
                </div>

                <h1>
                  {
                    mandalConfig?.name ||
                    "मंडळ"
                  }
                </h1>

                {mandalConfig?.tagline && (

                  <p>
                    {
                      mandalConfig.tagline
                    }
                  </p>

                )}

                <h2>
                  खर्च नोंद
                </h2>

              </div>

              {/* EXPENSE ID */}

              <div className="expense-view-id">

                <span>
                  Expense ID
                </span>

                <strong>
                  {
                    viewingExpense.expense_id ||
                    viewingExpense.expenseId ||
                    viewingExpense.id
                  }
                </strong>

              </div>

              {/* CATEGORY */}

              <div className="expense-view-row">

                <span>
                  Category
                </span>

                <strong>
                  {
                    viewingExpense.category ||
                    "-"
                  }
                </strong>

              </div>

              {/* DESCRIPTION */}

              <div className="expense-view-row">

                <span>
                  Description
                </span>

                <strong>
                  {
                    viewingExpense.description ||
                    "-"
                  }
                </strong>

              </div>

              {/* PAYMENT MODE */}

              <div className="expense-view-row">

                <span>
                  Payment Mode
                </span>

                <strong>
                  {
                    viewingExpense.mode ||
                    "Cash"
                  }
                </strong>

              </div>

              {/* DATE */}

              <div className="expense-view-row">

                <span>
                  Date
                </span>

                <strong>
                  {
                    formatDate(
                      viewingExpense.date ||
                        viewingExpense.expense_date
                    )
                  }
                </strong>

              </div>

              {/* REMARK */}

              <div className="expense-view-row">

                <span>
                  Remark
                </span>

                <strong>
                  {
                    viewingExpense.remark ||
                    "-"
                  }
                </strong>

              </div>

              {/* AMOUNT */}

              <div className="expense-view-total">

                <span>
                  एकूण खर्च
                </span>

                <strong>
                  ₹
                  {Number(
                    viewingExpense.amount ||
                      0
                  ).toLocaleString(
                    "en-IN"
                  )}
                </strong>

              </div>

              <div className="expense-view-thanks">
                धन्यवाद! 🙏
              </div>

            </div>

            {/* VIEW ACTIONS */}

            <div className="expense-view-actions">

              <button
                type="button"
                className="expense-view-cancel"
                onClick={
                  closeViewExpense
                }
              >
                Close
              </button>

              <button
                type="button"
                className="expense-view-whatsapp"
                onClick={() =>
                  sendExpenseWhatsApp(
                    viewingExpense
                  )
                }
              >

                <MessageCircle size={16} />

                WhatsApp

              </button>

              <button
                type="button"
                className="expense-view-print"
                onClick={() =>
                  printExpense(
                    viewingExpense
                  )
                }
              >

                <Printer size={16} />

                Print

              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default Expenses;