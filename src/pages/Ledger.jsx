import { useEffect, useMemo, useState } from "react";

import {
  Search,
  ArrowDownLeft,
  ArrowUpRight,
  FileText,
  CalendarDays,
  Eye,
  X,
  RefreshCw,
} from "lucide-react";

import "./Ledger.css";

import {
  getLedgerTransactions,
} from "../utils/supabaseLedger";

// ============================================================
// HELPERS
// ============================================================

const getAmount = (value) => {
  const amount = Number(value);

  return Number.isFinite(amount)
    ? amount
    : 0;
};

const formatAmount = (value) => {
  return `₹${getAmount(value).toLocaleString(
    "en-IN"
  )}`;
};

const formatDate = (dateValue) => {
  if (!dateValue) return "-";

  const value = String(dateValue);

  // YYYY-MM-DD
  if (
    /^\d{4}-\d{2}-\d{2}$/.test(value)
  ) {
    const [year, month, day] =
      value.split("-");

    return `${day}-${month}-${year}`;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString(
    "en-GB",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }
  );
};

// ============================================================
// LEDGER
// ============================================================

function Ledger() {
  const [transactions, setTransactions] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [typeFilter, setTypeFilter] =
    useState("all");

  const [modeFilter, setModeFilter] =
    useState("all");

  const [dateFilter, setDateFilter] =
    useState("");

  const [selectedTransaction, setSelectedTransaction] =
    useState(null);

  // ==========================================================
  // LOAD DATA
  // ==========================================================

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const data =
        await getLedgerTransactions();

      setTransactions(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (err) {
      console.error(
        "Ledger loading error:",
        err
      );

      setError(
        err?.message ||
          "Ledger data load failed."
      );

      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
    loadData();
  }, []);

  // ==========================================================
  // SUMMARY
  // ==========================================================

  const totalIncome = useMemo(() => {
    return transactions.reduce(
      (total, transaction) =>
        total +
        getAmount(
          transaction.credit
        ),
      0
    );
  }, [transactions]);

  const totalExpense = useMemo(() => {
    return transactions.reduce(
      (total, transaction) =>
        total +
        getAmount(
          transaction.debit
        ),
      0
    );
  }, [transactions]);

  const closingBalance =
    totalIncome - totalExpense;

  // ==========================================================
  // FILTER
  // ==========================================================

  const filteredTransactions =
    useMemo(() => {
      const searchText =
        search
          .trim()
          .toLowerCase();

      return transactions.filter(
        (transaction) => {
          // -----------------------------------------------
          // SEARCH
          // -----------------------------------------------

          const matchesSearch =
            !searchText ||
            String(
              transaction.id || ""
            )
              .toLowerCase()
              .includes(searchText) ||
            String(
              transaction.transactionId ||
                ""
            )
              .toLowerCase()
              .includes(searchText) ||
            String(
              transaction.memberName ||
                ""
            )
              .toLowerCase()
              .includes(searchText) ||
            String(
              transaction.memberId ||
                ""
            )
              .toLowerCase()
              .includes(searchText) ||
            String(
              transaction.description ||
                ""
            )
              .toLowerCase()
              .includes(searchText) ||
            String(
              transaction.name || ""
            )
              .toLowerCase()
              .includes(searchText);

          // -----------------------------------------------
          // TYPE
          // -----------------------------------------------

          const transactionType =
            String(
              transaction.type || ""
            ).toLowerCase();

          const matchesType =
            typeFilter === "all" ||
            transactionType ===
              typeFilter;

          // -----------------------------------------------
          // MODE
          // -----------------------------------------------

          const transactionMode =
            String(
              transaction.mode || ""
            ).toLowerCase();

          const matchesMode =
            modeFilter === "all" ||
            transactionMode ===
              modeFilter.toLowerCase();

          // -----------------------------------------------
          // DATE
          // -----------------------------------------------

          const transactionDate =
            String(
              transaction.date || ""
            ).slice(0, 10);

          const matchesDate =
            !dateFilter ||
            transactionDate ===
              dateFilter;

          return (
            matchesSearch &&
            matchesType &&
            matchesMode &&
            matchesDate
          );
        }
      );
    }, [
      transactions,
      search,
      typeFilter,
      modeFilter,
      dateFilter,
    ]);

  // ==========================================================
  // CLEAR FILTERS
  // ==========================================================

  const clearFilters = () => {
    setSearch("");
    setTypeFilter("all");
    setModeFilter("all");
    setDateFilter("");
  };

  // ==========================================================
  // VIEW TRANSACTION
  // ==========================================================

  const handleView = (
    transaction
  ) => {
    setSelectedTransaction(
      transaction
    );
  };

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="ledger-page">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="ledger-header">

        <div>
          <h1>Ledger</h1>

          <p>
            मंडळाच्या सर्व जमा आणि खर्च व्यवहारांचा आढावा
          </p>
        </div>

        <div className="ledger-header-actions">

          <div className="ledger-balance-card">
            <span>
              Current Balance
            </span>

            <strong
              className={
                closingBalance >= 0
                  ? "positive"
                  : "negative"
              }
            >
              {formatAmount(
                closingBalance
              )}
            </strong>
          </div>

          <button
            type="button"
            className="ledger-refresh-btn"
            onClick={loadData}
            disabled={loading}
          >
            <RefreshCw
              size={17}
              className={
                loading
                  ? "ledger-spin"
                  : ""
              }
            />

            Refresh
          </button>

        </div>
      </div>

      {/* ======================================================
          ERROR
      ====================================================== */}

      {error && (
        <div className="ledger-error">
          <strong>
            Ledger Error
          </strong>

          <span>
            {error}
          </span>

          <button
            type="button"
            onClick={loadData}
          >
            Retry
          </button>
        </div>
      )}

      {/* ======================================================
          SUMMARY CARDS
      ====================================================== */}

      <div className="ledger-summary">

        {/* TOTAL TRANSACTIONS */}

        <div className="ledger-summary-card">

          <div className="ledger-summary-icon blue">
            <FileText size={22} />
          </div>

          <div>
            <span>
              Total Transactions
            </span>

            <strong>
              {transactions.length}
            </strong>
          </div>

        </div>

        {/* TOTAL COLLECTION */}

        <div className="ledger-summary-card">

          <div className="ledger-summary-icon green">
            <ArrowDownLeft
              size={22}
            />
          </div>

          <div>
            <span>
              Total Collection
            </span>

            <strong className="income-text">
              {formatAmount(
                totalIncome
              )}
            </strong>
          </div>

        </div>

        {/* TOTAL EXPENSE */}

        <div className="ledger-summary-card">

          <div className="ledger-summary-icon red">
            <ArrowUpRight
              size={22}
            />
          </div>

          <div>
            <span>
              Total Expense
            </span>

            <strong className="expense-text">
              {formatAmount(
                totalExpense
              )}
            </strong>
          </div>

        </div>

        {/* CURRENT BALANCE */}

        <div className="ledger-summary-card">

          <div className="ledger-summary-icon orange">
            ₹
          </div>

          <div>
            <span>
              Current Balance
            </span>

            <strong
              className={
                closingBalance >= 0
                  ? "income-text"
                  : "expense-text"
              }
            >
              {formatAmount(
                closingBalance
              )}
            </strong>
          </div>

        </div>

      </div>

      {/* ======================================================
          MAIN PANEL
      ====================================================== */}

      <div className="ledger-panel">

        {/* ====================================================
            PANEL HEADER
        ==================================================== */}

        <div className="ledger-panel-header">

          <div>
            <h2>
              Transaction Ledger
            </h2>

            <p>
              सर्व जमा आणि खर्च एकत्रित ठिकाणी
            </p>
          </div>

          {/* ==================================================
              FILTERS
          ================================================== */}

          <div className="ledger-filters">

            {/* SEARCH */}

            <div className="ledger-search">

              <Search size={17} />

              <input
                type="text"
                placeholder="Transaction, नाव किंवा ID शोधा..."
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
              />

            </div>

            {/* TYPE */}

            <select
              className="ledger-filter-select"
              value={typeFilter}
              onChange={(event) =>
                setTypeFilter(
                  event.target.value
                )
              }
            >

              <option value="all">
                All Transactions
              </option>

              <option value="income">
                Collection
              </option>

              <option value="expense">
                Expense
              </option>

            </select>

            {/* MODE */}

            <select
              className="ledger-filter-select"
              value={modeFilter}
              onChange={(event) =>
                setModeFilter(
                  event.target.value
                )
              }
            >

              <option value="all">
                All Modes
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

            {/* DATE */}

            <div className="ledger-date-filter">

              <CalendarDays
                size={15}
              />

              <input
                type="date"
                value={dateFilter}
                onChange={(event) =>
                  setDateFilter(
                    event.target.value
                  )
                }
              />

            </div>

            {/* CLEAR */}

            {(search ||
              typeFilter !== "all" ||
              modeFilter !== "all" ||
              dateFilter) && (

              <button
                type="button"
                className="ledger-clear-btn"
                onClick={
                  clearFilters
                }
              >
                Clear
              </button>

            )}

          </div>

        </div>

        {/* ====================================================
            FILTER SUMMARY
        ==================================================== */}

        <div className="ledger-filter-summary">

          <div>
            <span>
              Filtered Collection
            </span>

            <strong className="credit-text">
              +₹
              {filteredTransactions
                .reduce(
                  (total, item) =>
                    total +
                    getAmount(
                      item.credit
                    ),
                  0
                )
                .toLocaleString(
                  "en-IN"
                )}
            </strong>
          </div>

          <div>
            <span>
              Filtered Expense
            </span>

            <strong className="debit-text">
              -₹
              {filteredTransactions
                .reduce(
                  (total, item) =>
                    total +
                    getAmount(
                      item.debit
                    ),
                  0
                )
                .toLocaleString(
                  "en-IN"
                )}
            </strong>
          </div>

          <div>
            <span>
              Transactions
            </span>

            <strong>
              {filteredTransactions.length}
            </strong>
          </div>

        </div>

        {/* ====================================================
            TABLE
        ==================================================== */}

        <div className="ledger-table-wrapper">

          <table className="ledger-table">

            <thead>
              <tr>

                <th>
                  Date
                </th>

                <th>
                  Transaction
                </th>

                <th>
                  Type
                </th>

                <th>
                  Description
                </th>

                <th>
                  Mode
                </th>

                <th>
                  Credit
                </th>

                <th>
                  Debit
                </th>

                <th>
                  Balance
                </th>

                <th>
                  Action
                </th>

              </tr>
            </thead>

            <tbody>

              {/* LOADING */}

              {loading ? (

                <tr>
                  <td
                    colSpan="9"
                    className="ledger-empty"
                  >
                    <RefreshCw
                      size={32}
                      className="ledger-spin"
                    />

                    <strong>
                      Ledger loading...
                    </strong>

                    <span>
                      Supabase मधून transactions घेत आहोत.
                    </span>
                  </td>
                </tr>

              ) : filteredTransactions.length ===
                0 ? (

                /* EMPTY */

                <tr>

                  <td
                    colSpan="9"
                    className="ledger-empty"
                  >

                    <FileText
                      size={35}
                    />

                    <strong>
                      कोणतेही transactions नाहीत
                    </strong>

                    <span>
                      Search किंवा filters बदलून पुन्हा try करा.
                    </span>

                  </td>

                </tr>

              ) : (

                filteredTransactions.map(
                  (transaction) => (

                    <tr
                      key={`${transaction.type}-${transaction.id}`}
                    >

                      {/* DATE */}

                      <td>
                        {formatDate(
                          transaction.date
                        )}
                      </td>

                      {/* TRANSACTION */}

                      <td>

                        <div className="ledger-transaction">

                          <strong>
                            {
                              transaction.transactionId ||
                              transaction.id
                            }
                          </strong>

                          <span>
                            {
                              transaction.memberName ||
                              transaction.name ||
                              "-"
                            }
                          </span>

                        </div>

                      </td>

                      {/* TYPE */}

                      <td>

                        {String(
                          transaction.type
                        ).toLowerCase() ===
                        "income" ? (

                          <span className="ledger-type income">

                            <ArrowDownLeft
                              size={13}
                            />

                            Collection

                          </span>

                        ) : (

                          <span className="ledger-type expense">

                            <ArrowUpRight
                              size={13}
                            />

                            Expense

                          </span>

                        )}

                      </td>

                      {/* DESCRIPTION */}

                      <td>

                        <div className="ledger-description">

                          <span>
                            {
                              transaction.description ||
                              "-"
                            }
                          </span>

                          {transaction.memberId && (
                            <small>
                              {
                                transaction.memberId
                              }
                            </small>
                          )}

                        </div>

                      </td>

                      {/* MODE */}

                      <td>

                        <span
                          className={`ledger-mode ${String(
                            transaction.mode ||
                              "Cash"
                          )
                            .toLowerCase()
                            .replace(
                              /\s+/g,
                              "-"
                            )}`}
                        >
                          {
                            transaction.mode ||
                            "Cash"
                          }
                        </span>

                      </td>

                      {/* CREDIT */}

                      <td>

                        {getAmount(
                          transaction.credit
                        ) > 0 ? (

                          <strong className="ledger-income-amount">

                            +
                            {formatAmount(
                              transaction.credit
                            )}

                          </strong>

                        ) : (

                          <span>
                            —
                          </span>

                        )}

                      </td>

                      {/* DEBIT */}

                      <td>

                        {getAmount(
                          transaction.debit
                        ) > 0 ? (

                          <strong className="ledger-expense-amount">

                            -
                            {formatAmount(
                              transaction.debit
                            )}

                          </strong>

                        ) : (

                          <span>
                            —
                          </span>

                        )}

                      </td>

                      {/* BALANCE */}

                      <td>

                        <strong
                          className={
                            getAmount(
                              transaction.balance
                            ) >= 0
                              ? "positive"
                              : "negative"
                          }
                        >
                          {formatAmount(
                            transaction.balance
                          )}
                        </strong>

                      </td>

                      {/* ACTION */}

                      <td>

                        <button
                          type="button"
                          className="ledger-view-btn"
                          onClick={() =>
                            handleView(
                              transaction
                            )
                          }
                          title="View transaction"
                        >

                          <Eye
                            size={17}
                          />

                        </button>

                      </td>

                    </tr>

                  )
                )

              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* ======================================================
          TRANSACTION DETAILS MODAL
      ====================================================== */}

      {selectedTransaction && (

        <div
          className="ledger-modal-overlay"
          onClick={() =>
            setSelectedTransaction(
              null
            )
          }
        >

          <div
            className="ledger-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            {/* HEADER */}

            <div className="ledger-modal-header">

              <div>

                <h2>
                  Transaction Details
                </h2>

                <p>
                  {
                    selectedTransaction.transactionId ||
                    selectedTransaction.id
                  }
                </p>

              </div>

              <button
                type="button"
                className="ledger-close-btn"
                onClick={() =>
                  setSelectedTransaction(
                    null
                  )
                }
              >
                <X size={19} />
              </button>

            </div>

            {/* BODY */}

            <div className="ledger-modal-body">

              {/* TYPE */}

              <div className="ledger-detail-row">

                <span>
                  Type
                </span>

                <strong>
                  {
                    String(
                      selectedTransaction.type
                    ).toLowerCase() ===
                    "income"
                      ? "Collection"
                      : "Expense"
                  }
                </strong>

              </div>

              {/* NAME */}

              <div className="ledger-detail-row">

                <span>
                  Name / Category
                </span>

                <strong>
                  {
                    selectedTransaction.memberName ||
                    selectedTransaction.name ||
                    "-"
                  }
                </strong>

              </div>

              {/* MEMBER ID */}

              {selectedTransaction.memberId && (

                <div className="ledger-detail-row">

                  <span>
                    Member ID
                  </span>

                  <strong>
                    {
                      selectedTransaction.memberId
                    }
                  </strong>

                </div>

              )}

              {/* DESCRIPTION */}

              <div className="ledger-detail-row">

                <span>
                  Description
                </span>

                <strong>
                  {
                    selectedTransaction.description ||
                    "-"
                  }
                </strong>

              </div>

              {/* PAYMENT MODE */}

              <div className="ledger-detail-row">

                <span>
                  Payment Mode
                </span>

                <strong>
                  {
                    selectedTransaction.mode ||
                    "-"
                  }
                </strong>

              </div>

              {/* DATE */}

              <div className="ledger-detail-row">

                <span>
                  Date
                </span>

                <strong>
                  {formatDate(
                    selectedTransaction.date
                  )}
                </strong>

              </div>

              {/* AMOUNT */}

              <div className="ledger-detail-row">

                <span>
                  Amount
                </span>

                <strong
                  className={
                    String(
                      selectedTransaction.type
                    ).toLowerCase() ===
                    "income"
                      ? "ledger-income-amount"
                      : "ledger-expense-amount"
                  }
                >

                  {
                    String(
                      selectedTransaction.type
                    ).toLowerCase() ===
                    "income"
                      ? "+"
                      : "-"
                  }

                  {formatAmount(
                    selectedTransaction.amount
                  )}

                </strong>

              </div>

              {/* RUNNING BALANCE */}

              <div className="ledger-detail-total">

                <span>
                  Running Balance
                </span>

                <strong>
                  {formatAmount(
                    selectedTransaction.balance
                  )}
                </strong>

              </div>

            </div>

            {/* FOOTER */}

            <div className="ledger-modal-footer">

              <button
                type="button"
                onClick={() =>
                  setSelectedTransaction(
                    null
                  )
                }
              >
                Close
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default Ledger;