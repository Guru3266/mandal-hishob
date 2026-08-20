import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  BarChart3,
  CalendarDays,
  IndianRupee,
  TrendingDown,
  TrendingUp,
  Users,
  WalletCards,
  X,
  Printer,
  Search,
  ReceiptText,
} from "lucide-react";

import { getReportsData } from "../utils/supabaseReports";
import useMandalConfig from "../hooks/useMandalConfig";

import "./Reports.css";

function Reports() {
  // ============================================================
  // DATA
  // ============================================================

  const [members, setMembers] = useState([]);
  const [collections, setCollections] = useState([]);
  const [expenses, setExpenses] = useState([]);

  const mandal = useMandalConfig();

  // ============================================================
  // FILTERS
  // ============================================================

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // ============================================================
  // SEARCH
  // ============================================================

  const [memberSearch, setMemberSearch] =
    useState("");

  const [expenseSearch, setExpenseSearch] =
    useState("");

  // ============================================================
  // MODAL
  // ============================================================

  const [selectedMember, setSelectedMember] =
    useState(null);

  // ============================================================
  // LOAD DATA
  // ============================================================

  const loadData = async () => {
    try {
      const data = await getReportsData();

      setMembers(data?.members || []);
      setCollections(data?.collections || []);
      setExpenses(data?.expenses || []);
    } catch (error) {
      console.error(
        "Reports Supabase loading error:",
        error
      );

      setMembers([]);
      setCollections([]);
      setExpenses([]);
    }
  };

  // ============================================================
  // INITIAL LOAD + EVENTS
  // ============================================================

  useEffect(() => {
    loadData();

    const handleUpdate = () => {
      loadData();
    };

    window.addEventListener(
      "mandal-data-updated",
      handleUpdate
    );

    window.addEventListener(
      "mandal-settings-updated",
      handleUpdate
    );

    window.addEventListener(
      "storage",
      handleUpdate
    );

    return () => {
      window.removeEventListener(
        "mandal-data-updated",
        handleUpdate
      );

      window.removeEventListener(
        "mandal-settings-updated",
        handleUpdate
      );

      window.removeEventListener(
        "storage",
        handleUpdate
      );
    };
  }, []);

  // ============================================================
  // MONEY FORMAT
  // ============================================================

  const money = (value) =>
    Number(value || 0).toLocaleString("en-IN");

  // ============================================================
  // DATE FORMAT
  // ============================================================

  const formatDate = (value) => {
    if (!value) return "-";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    return date.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  // ============================================================
  // DATE FILTER
  // ============================================================

  const isDateInRange = (date) => {
    if (!date) return true;

    const value = String(date).slice(0, 10);

    if (
      fromDate &&
      value < fromDate
    ) {
      return false;
    }

    if (
      toDate &&
      value > toDate
    ) {
      return false;
    }

    return true;
  };

  // ============================================================
  // FILTER COLLECTIONS
  // ============================================================

  const filteredCollections = useMemo(() => {
    const search =
      memberSearch
        .trim()
        .toLowerCase();

    return collections.filter(
      (collection) => {
        const date =
          collection.date ||
          collection.payment_date ||
          collection.created_at;

        const dateMatch =
          isDateInRange(date);

        const searchMatch =
          !search ||
          String(
            collection.memberName ||
              collection.member_name ||
              ""
          )
            .toLowerCase()
            .includes(search) ||
          String(
            collection.memberId ||
              collection.member_id ||
              ""
          )
            .toLowerCase()
            .includes(search) ||
          String(
            collection.receiptNo ||
              collection.receipt_no ||
              ""
          )
            .toLowerCase()
            .includes(search);

        return (
          dateMatch &&
          searchMatch
        );
      }
    );
  }, [
    collections,
    fromDate,
    toDate,
    memberSearch,
  ]);

  // ============================================================
  // FILTER EXPENSES
  // ============================================================

  const filteredExpenses = useMemo(() => {
    const search =
      expenseSearch
        .trim()
        .toLowerCase();

    return expenses.filter(
      (expense) => {
        const date =
          expense.date ||
          expense.expense_date ||
          expense.created_at;

        const dateMatch =
          isDateInRange(date);

        const searchMatch =
          !search ||
          String(
            expense.description || ""
          )
            .toLowerCase()
            .includes(search) ||
          String(
            expense.category || ""
          )
            .toLowerCase()
            .includes(search) ||
          String(
            expense.expense_id ||
              expense.id ||
              ""
          )
            .toLowerCase()
            .includes(search) ||
          String(
            expense.remark || ""
          )
            .toLowerCase()
            .includes(search);

        return (
          dateMatch &&
          searchMatch
        );
      }
    );
  }, [
    expenses,
    fromDate,
    toDate,
    expenseSearch,
  ]);

  // ============================================================
  // REPORT TOTALS
  // ============================================================

  const reportCollection =
    filteredCollections.reduce(
      (total, collection) =>
        total +
        Number(
          collection.amount || 0
        ),
      0
    );

  const reportExpense =
    filteredExpenses.reduce(
      (total, expense) =>
        total +
        Number(
          expense.amount || 0
        ),
      0
    );

  const reportBalance =
    reportCollection -
    reportExpense;

  // ============================================================
  // EXPECTED COLLECTION
  // ============================================================

  const reportExpected =
    members.reduce(
      (total, member) =>
        total +
        Number(
          member.expected ||
            member.expected_amount ||
            0
        ),
      0
    );

  const reportPending =
    Math.max(
      reportExpected -
        reportCollection,
      0
    );

  // ============================================================
  // PAYMENT MODE REPORT
  // ============================================================

  const paymentModeReport =
    useMemo(() => {
      const result = {
        Cash: 0,
        UPI: 0,
        Bank: 0,
        Other: 0,
      };

      filteredCollections.forEach(
        (collection) => {
          const mode =
            collection.mode ||
            "Cash";

          const amount =
            Number(
              collection.amount || 0
            );

          if (
            result[mode] !==
            undefined
          ) {
            result[mode] += amount;
          } else {
            result.Other += amount;
          }
        }
      );

      return result;
    }, [filteredCollections]);

  // ============================================================
  // EXPENSE CATEGORY REPORT
  // ============================================================

  const categoryReport =
    useMemo(() => {
      const result = {};

      filteredExpenses.forEach(
        (expense) => {
          const category =
            expense.category ||
            "Other";

          if (
            !result[category]
          ) {
            result[category] = 0;
          }

          result[category] +=
            Number(
              expense.amount || 0
            );
        }
      );

      return Object.entries(result)
        .map(
          ([
            category,
            amount,
          ]) => ({
            category,
            amount,
            percentage:
              reportExpense > 0
                ? (amount /
                    reportExpense) *
                  100
                : 0,
          })
        )
        .sort(
          (a, b) =>
            b.amount - a.amount
        );
    }, [
      filteredExpenses,
      reportExpense,
    ]);

  // ============================================================
  // MEMBER REPORT
  // ============================================================

  const memberReport =
    useMemo(() => {
      const search =
        memberSearch
          .trim()
          .toLowerCase();

      return members
        .map((member) => {
          const memberId =
            member.id;

          const memberCollections =
            filteredCollections.filter(
              (collection) =>
                String(
                  collection.memberId ||
                    collection.member_id
                ) ===
                String(memberId)
            );

          const collected =
            memberCollections.reduce(
              (
                total,
                collection
              ) =>
                total +
                Number(
                  collection.amount ||
                    0
                ),
              0
            );

          const expected =
            Number(
              member.expected ||
                member.expected_amount ||
                0
            );

          const pending =
            Math.max(
              expected -
                collected,
              0
            );

          let status = "Pending";

          if (
            expected > 0 &&
            collected >= expected
          ) {
            status = "Paid";
          } else if (
            collected > 0
          ) {
            status = "Partial";
          }

          return {
            ...member,
            expected,
            collected,
            pending,
            status,
          };
        })
        .filter((member) => {
          return (
            !search ||
            String(
              member.name || ""
            )
              .toLowerCase()
              .includes(search) ||
            String(
              member.member_code ||
                member.memberCode ||
                ""
            )
              .toLowerCase()
              .includes(search) ||
            String(
              member.id || ""
            )
              .toLowerCase()
              .includes(search) ||
            String(
              member.mobile || ""
            )
              .toLowerCase()
              .includes(search)
          );
        });
    }, [
      members,
      filteredCollections,
      memberSearch,
    ]);

  // ============================================================
  // MEMBER STATUS
  // ============================================================

  const paidMembers =
    memberReport.filter(
      (member) =>
        member.status === "Paid"
    ).length;

  const partialMembers =
    memberReport.filter(
      (member) =>
        member.status === "Partial"
    ).length;

  const pendingMembers =
    memberReport.filter(
      (member) =>
        member.status === "Pending"
    ).length;

  // ============================================================
  // CLEAR FILTERS
  // ============================================================

  const clearFilters = () => {
    setFromDate("");
    setToDate("");
    setMemberSearch("");
    setExpenseSearch("");
  };

  // ============================================================
  // PRINT REPORT
  // ============================================================

  const printReport = () => {
    const printWindow =
      window.open(
        "",
        "_blank",
        "width=1200,height=900"
      );

    if (!printWindow) {
      alert(
        "Popup blocked आहे. Browser मध्ये popup allow करा."
      );
      return;
    }

    const memberRows =
      memberReport
        .map(
          (member) => `
            <tr>
              <td>
                ${
                  member.member_code ||
                  member.id
                }
              </td>

              <td>
                ${member.name || "-"}
              </td>

              <td>
                ${member.mobile || "-"}
              </td>

              <td>
                ₹${money(
                  member.expected
                )}
              </td>

              <td class="green">
                ₹${money(
                  member.collected
                )}
              </td>

              <td class="red">
                ₹${money(
                  member.pending
                )}
              </td>

              <td>
                ${member.status}
              </td>
            </tr>
          `
        )
        .join("");

    const expenseRows =
      filteredExpenses
        .map(
          (expense) => `
            <tr>
              <td>
                ${
                  expense.expense_id ||
                  expense.id
                }
              </td>

              <td>
                ${expense.category || "Other"}
              </td>

              <td>
                ${expense.description || "-"}
              </td>

              <td class="red">
                ₹${money(
                  expense.amount
                )}
              </td>

              <td>
                ${expense.mode || "Cash"}
              </td>

              <td>
                ${formatDate(
                  expense.date ||
                    expense.expense_date
                )}
              </td>

              <td>
                ${expense.remark || "-"}
              </td>
            </tr>
          `
        )
        .join("");

    const categoryRows =
      categoryReport
        .map(
          (item) => `
            <tr>
              <td>
                ${item.category}
              </td>

              <td>
                ${item.percentage.toFixed(
                  1
                )}%
              </td>

              <td>
                ₹${money(
                  item.amount
                )}
              </td>
            </tr>
          `
        )
        .join("");

    printWindow.document.write(`
      <!DOCTYPE html>

      <html>

      <head>

        <title>
          ${
            mandal?.name ||
            "Mandal Hishob"
          } - Financial Report
        </title>

        <style>

          * {
            box-sizing: border-box;
          }

          body {
            margin: 0;
            padding: 25px;
            font-family: Arial, sans-serif;
            color: #172033;
          }

          .header {
            text-align: center;
            border-bottom: 2px solid #f59e0b;
            padding-bottom: 15px;
            margin-bottom: 20px;
          }

          .header h1 {
            margin: 0;
            font-size: 25px;
          }

          .header p {
            margin: 5px 0;
            color: #64748b;
            font-size: 12px;
          }

          .summary {
            display: grid;
            grid-template-columns:
              repeat(4, 1fr);
            gap: 10px;
            margin-bottom: 25px;
          }

          .box {
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 12px;
          }

          .box span {
            display: block;
            color: #64748b;
            font-size: 11px;
            margin-bottom: 5px;
          }

          .box strong {
            font-size: 18px;
          }

          h2 {
            margin-top: 25px;
            font-size: 17px;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            font-size: 10px;
          }

          th {
            background: #f8fafc;
            padding: 8px;
            text-align: left;
            border: 1px solid #ddd;
          }

          td {
            padding: 7px;
            border: 1px solid #e5e7eb;
          }

          .green {
            color: #15803d;
            font-weight: bold;
          }

          .red {
            color: #dc2626;
            font-weight: bold;
          }

          .footer {
            margin-top: 25px;
            text-align: center;
            color: #64748b;
            font-size: 10px;
          }

          .mode-grid {
            display: grid;
            grid-template-columns:
              repeat(4, 1fr);
            gap: 10px;
          }

          .mode-box {
            border: 1px solid #ddd;
            padding: 10px;
            border-radius: 7px;
          }

        </style>

      </head>

      <body>

        <div class="header">

          <h1>
            ${
              mandal?.name ||
              "Mandal Hishob"
            }
          </h1>

          ${
            mandal?.tagline
              ? `<p>${mandal.tagline}</p>`
              : ""
          }

          ${
            mandal?.address
              ? `<p>${mandal.address}</p>`
              : ""
          }

          <strong>
            Financial Report
          </strong>

        </div>

        <div class="summary">

          <div class="box">
            <span>
              Total Collection
            </span>

            <strong class="green">
              ₹${money(
                reportCollection
              )}
            </strong>
          </div>

          <div class="box">
            <span>
              Total Expense
            </span>

            <strong class="red">
              ₹${money(
                reportExpense
              )}
            </strong>
          </div>

          <div class="box">
            <span>
              Net Balance
            </span>

            <strong
              class="${
                reportBalance >= 0
                  ? "green"
                  : "red"
              }"
            >
              ${
                reportBalance < 0
                  ? "-₹"
                  : "₹"
              }${money(
                Math.abs(
                  reportBalance
                )
              )}
            </strong>
          </div>

          <div class="box">
            <span>
              Pending Collection
            </span>

            <strong class="red">
              ₹${money(
                reportPending
              )}
            </strong>
          </div>

        </div>

        <h2>
          Collection by Payment Mode
        </h2>

        <div class="mode-grid">

          <div class="mode-box">
            <strong>Cash</strong>
            <br />
            ₹${money(
              paymentModeReport.Cash
            )}
          </div>

          <div class="mode-box">
            <strong>UPI</strong>
            <br />
            ₹${money(
              paymentModeReport.UPI
            )}
          </div>

          <div class="mode-box">
            <strong>Bank</strong>
            <br />
            ₹${money(
              paymentModeReport.Bank
            )}
          </div>

          <div class="mode-box">
            <strong>Other</strong>
            <br />
            ₹${money(
              paymentModeReport.Other
            )}
          </div>

        </div>

        <h2>
          Member Collection Report
        </h2>

        <table>

          <thead>

            <tr>
              <th>Member ID</th>
              <th>Member</th>
              <th>Mobile</th>
              <th>Expected</th>
              <th>Collected</th>
              <th>Pending</th>
              <th>Status</th>
            </tr>

          </thead>

          <tbody>
            ${memberRows}
          </tbody>

        </table>

        <h2>
          Expense Category Report
        </h2>

        <table>

          <thead>

            <tr>
              <th>Category</th>
              <th>Percentage</th>
              <th>Amount</th>
            </tr>

          </thead>

          <tbody>
            ${categoryRows}
          </tbody>

        </table>

        <h2>
          Expense Transactions
        </h2>

        <table>

          <thead>

            <tr>
              <th>Expense ID</th>
              <th>Category</th>
              <th>Description</th>
              <th>Amount</th>
              <th>Mode</th>
              <th>Date</th>
              <th>Remark</th>
            </tr>

          </thead>

          <tbody>
            ${expenseRows}
          </tbody>

        </table>

        <div class="footer">
          Generated from Mandal Hishob
          <br />
          Generated on:
          ${formatDate(
            new Date()
          )}
        </div>

        <script>
          window.onload = function () {
            window.print();
          };
        </script>

      </body>

      </html>
    `);

    printWindow.document.close();
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="reports-page">

      {/* HEADER */}

      <div className="reports-header">

        <div>

          <h1>
            Reports
          </h1>

          <p>
            मंडळाच्या आर्थिक व्यवहारांचे reports
          </p>

        </div>

        <button
          type="button"
          className="report-print-btn"
          onClick={printReport}
        >
          <Printer size={17} />
          Print Report
        </button>

      </div>

      {/* FILTER */}

      <section className="report-filter-card">

        <div className="report-filter-title">

          <BarChart3 size={18} />

          <div>

            <strong>
              Report Filters
            </strong>

            <span>
              विशिष्ट कालावधीचा report पहा
            </span>

          </div>

        </div>

        <div className="report-filter-controls">

          <div className="report-date-input">

            <CalendarDays size={15} />

            <input
              type="date"
              value={fromDate}
              onChange={(e) =>
                setFromDate(
                  e.target.value
                )
              }
            />

          </div>

          <span className="date-separator">
            to
          </span>

          <div className="report-date-input">

            <CalendarDays size={15} />

            <input
              type="date"
              value={toDate}
              onChange={(e) =>
                setToDate(
                  e.target.value
                )
              }
            />

          </div>

          {(fromDate ||
            toDate ||
            memberSearch ||
            expenseSearch) && (

            <button
              type="button"
              className="report-clear-btn"
              onClick={clearFilters}
            >
              <X size={14} />
              Clear
            </button>

          )}

        </div>

      </section>

      {/* SUMMARY */}

      <div className="reports-summary">

        <div className="report-summary-card">

          <div className="report-summary-icon collection">
            <TrendingUp size={20} />
          </div>

          <div>

            <span>
              Total Collection
            </span>

            <strong>
              ₹{money(
                reportCollection
              )}
            </strong>

            <small>
              {filteredCollections.length}
              {" "}
              transactions
            </small>

          </div>

        </div>

        <div className="report-summary-card">

          <div className="report-summary-icon expense">
            <TrendingDown size={20} />
          </div>

          <div>

            <span>
              Total Expense
            </span>

            <strong>
              ₹{money(
                reportExpense
              )}
            </strong>

            <small>
              {filteredExpenses.length}
              {" "}
              transactions
            </small>

          </div>

        </div>

        <div className="report-summary-card">

          <div className="report-summary-icon balance">
            <WalletCards size={20} />
          </div>

          <div>

            <span>
              Net Balance
            </span>

            <strong
              className={
                reportBalance >= 0
                  ? "positive-text"
                  : "negative-text"
              }
            >
              {reportBalance < 0
                ? "-₹"
                : "₹"}
              {money(
                Math.abs(
                  reportBalance
                )
              )}
            </strong>

            <small>
              {reportBalance >= 0
                ? "Available Balance"
                : "Expense exceeds collection"}
            </small>

          </div>

        </div>

        <div className="report-summary-card">

          <div className="report-summary-icon members">
            <Users size={20} />
          </div>

          <div>

            <span>
              Pending Collection
            </span>

            <strong className="negative-text">
              ₹{money(
                reportPending
              )}
            </strong>

            <small>
              {pendingMembers}
              {" "}
              members pending
            </small>

          </div>

        </div>

      </div>

      {/* TWO COLUMN */}

      <div className="reports-grid">

        {/* PAYMENT MODE */}

        <section className="report-card">

          <div className="report-card-header">

            <div>

              <h2>
                Collection by Payment Mode
              </h2>

              <p>
                जमा रक्कम कोणत्या mode ने आली
              </p>

            </div>

          </div>

          <div className="payment-mode-list">

            {[
              [
                "Cash",
                paymentModeReport.Cash,
              ],
              [
                "UPI",
                paymentModeReport.UPI,
              ],
              [
                "Bank",
                paymentModeReport.Bank,
              ],
              [
                "Other",
                paymentModeReport.Other,
              ],
            ].map(
              ([mode, amount]) => (

                <div
                  className="payment-mode-row"
                  key={mode}
                >

                  <div className="payment-mode-left">

                    <div
                      className={`payment-mode-icon ${mode.toLowerCase()}`}
                    >
                      <IndianRupee
                        size={16}
                      />
                    </div>

                    <div>

                      <strong>
                        {mode}
                      </strong>

                      <span>
                        {mode} Collection
                      </span>

                    </div>

                  </div>

                  <strong>
                    ₹{money(amount)}
                  </strong>

                </div>

              )
            )}

          </div>

        </section>

        {/* EXPENSE CATEGORY */}

        <section className="report-card">

          <div className="report-card-header">

            <div>

              <h2>
                Expense by Category
              </h2>

              <p>
                खर्च कुठे झाला
              </p>

            </div>

          </div>

          <div className="category-report-list">

            {categoryReport.length >
            0 ? (

              categoryReport.map(
                (item) => (

                  <div
                    className="category-report-row"
                    key={
                      item.category
                    }
                  >

                    <div className="category-report-info">

                      <div className="category-report-top">

                        <strong>
                          {
                            item.category
                          }
                        </strong>

                        <span>
                          {item.percentage.toFixed(
                            1
                          )}
                          %
                        </span>

                      </div>

                      <div className="category-progress">

                        <div
                          style={{
                            width:
                              `${Math.min(
                                item.percentage,
                                100
                              )}%`,
                          }}
                        />

                      </div>

                    </div>

                    <strong>
                      ₹{money(
                        item.amount
                      )}
                    </strong>

                  </div>

                )
              )

            ) : (

              <div className="report-empty-small">
                No expense data
              </div>

            )}

          </div>

        </section>

      </div>

      {/* MEMBER REPORT */}

      <section className="report-card member-report-card">

        <div className="report-card-header">

          <div>

            <h2>
              Member Collection Report
            </h2>

            <p>
              प्रत्येक वर्गणीदाराची collection status
            </p>

          </div>

          <div className="member-status-summary">

            <span className="paid">
              Paid {paidMembers}
            </span>

            <span className="partial">
              Partial {partialMembers}
            </span>

            <span className="pending">
              Pending {pendingMembers}
            </span>

          </div>

        </div>

        <div className="member-report-search">

          <Search size={15} />

          <input
            type="text"
            placeholder="Search member..."
            value={memberSearch}
            onChange={(e) =>
              setMemberSearch(
                e.target.value
              )
            }
          />

        </div>

        <div className="report-table-wrapper">

          <table className="report-table">

            <thead>

              <tr>

                <th>
                  Member ID
                </th>

                <th>
                  Member
                </th>

                <th>
                  Expected
                </th>

                <th>
                  Collected
                </th>

                <th>
                  Pending
                </th>

                <th>
                  Status
                </th>

                <th>
                  Action
                </th>

              </tr>

            </thead>

            <tbody>

              {memberReport.map(
                (member) => (

                  <tr
                    key={member.id}
                  >

                    <td>

                      <strong>
                        {
                          member.member_code ||
                          member.id
                        }
                      </strong>

                    </td>

                    <td>

                      <div className="report-member-name">

                        <strong>
                          {
                            member.name
                          }
                        </strong>

                        <span>
                          {
                            member.mobile ||
                            "-"
                          }
                        </span>

                      </div>

                    </td>

                    <td>
                      ₹{money(
                        member.expected
                      )}
                    </td>

                    <td>

                      <strong className="green-text">
                        ₹{money(
                          member.collected
                        )}
                      </strong>

                    </td>

                    <td>

                      <strong
                        className={
                          member.pending >
                          0
                            ? "red-text"
                            : "green-text"
                        }
                      >
                        ₹{money(
                          member.pending
                        )}
                      </strong>

                    </td>

                    <td>

                      <span
                        className={
                          member.status ===
                          "Paid"
                            ? "member-status paid"
                            : member.status ===
                              "Partial"
                            ? "member-status partial"
                            : "member-status pending"
                        }
                      >
                        {
                          member.status
                        }
                      </span>

                    </td>

                    <td>

                      <button
                        type="button"
                        className="member-view-btn"
                        onClick={() =>
                          setSelectedMember(
                            member
                          )
                        }
                      >
                        View
                      </button>

                    </td>

                  </tr>

                )
              )}

            </tbody>

          </table>

          {memberReport.length ===
            0 && (

            <div className="report-empty">

              <Users size={35} />

              <strong>
                Member data सापडला नाही
              </strong>

            </div>

          )}

        </div>

      </section>

      {/* EXPENSE TRANSACTIONS */}

      <section className="report-card expense-report-card">

        <div className="report-card-header">

          <div>

            <h2>
              Expense Transactions
            </h2>

            <p>
              निवडलेल्या कालावधीतील सर्व खर्च
            </p>

          </div>

          <div className="expense-report-total">

            Total:

            <strong>
              ₹{money(
                reportExpense
              )}
            </strong>

          </div>

        </div>

        <div className="member-report-search">

          <Search size={15} />

          <input
            type="text"
            placeholder="Search expense..."
            value={expenseSearch}
            onChange={(e) =>
              setExpenseSearch(
                e.target.value
              )
            }
          />

        </div>

        <div className="report-table-wrapper">

          <table className="report-table">

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
                  Remark
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

                      <strong>
                        {
                          expense.expense_id ||
                          expense.id
                        }
                      </strong>

                    </td>

                    <td>

                      <span className="expense-category">
                        {
                          expense.category ||
                          "Other"
                        }
                      </span>

                    </td>

                    <td>
                      {
                        expense.description ||
                        "-"
                      }
                    </td>

                    <td>

                      <strong className="red-text">
                        ₹{money(
                          expense.amount
                        )}
                      </strong>

                    </td>

                    <td>
                      {
                        expense.mode ||
                        "Cash"
                      }
                    </td>

                    <td>
                      {formatDate(
                        expense.date ||
                          expense.expense_date
                      )}
                    </td>

                    <td>
                      {
                        expense.remark ||
                        "-"
                      }
                    </td>

                  </tr>

                )
              )}

            </tbody>

          </table>

          {filteredExpenses.length ===
            0 && (

            <div className="report-empty">

              <TrendingDown
                size={35}
              />

              <strong>
                Expense data सापडला नाही
              </strong>

            </div>

          )}

        </div>

      </section>

      {/* MEMBER DETAIL MODAL */}

      {selectedMember && (

        <div
          className="report-modal-overlay"
          onClick={() =>
            setSelectedMember(null)
          }
        >

          <div
            className="report-member-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="report-modal-header">

              <div>

                <h2>
                  Member Report
                </h2>

                <p>
                  {
                    selectedMember.member_code ||
                    selectedMember.id
                  }
                </p>

              </div>

              <button
                type="button"
                className="report-modal-close"
                onClick={() =>
                  setSelectedMember(
                    null
                  )
                }
              >
                <X size={19} />
              </button>

            </div>

            <div className="member-detail-box">

              <div className="member-detail-row">
                <span>
                  Member Name
                </span>

                <strong>
                  {
                    selectedMember.name
                  }
                </strong>
              </div>

              <div className="member-detail-row">
                <span>
                  Member ID
                </span>

                <strong>
                  {
                    selectedMember.member_code ||
                    selectedMember.id
                  }
                </strong>
              </div>

              <div className="member-detail-row">
                <span>
                  Mobile
                </span>

                <strong>
                  {
                    selectedMember.mobile ||
                    "-"
                  }
                </strong>
              </div>

              <div className="member-detail-row">
                <span>
                  Address
                </span>

                <strong>
                  {
                    selectedMember.address ||
                    "-"
                  }
                </strong>
              </div>

              <div className="member-detail-row">
                <span>
                  Expected
                </span>

                <strong>
                  ₹{money(
                    selectedMember.expected
                  )}
                </strong>
              </div>

              <div className="member-detail-row">
                <span>
                  Collected
                </span>

                <strong className="green-text">
                  ₹{money(
                    selectedMember.collected
                  )}
                </strong>
              </div>

              <div className="member-detail-row">
                <span>
                  Pending
                </span>

                <strong
                  className={
                    selectedMember.pending >
                    0
                      ? "red-text"
                      : "green-text"
                  }
                >
                  ₹{money(
                    selectedMember.pending
                  )}
                </strong>
              </div>

              <div className="member-detail-total">
                <span>
                  Status
                </span>

                <strong>
                  {
                    selectedMember.status
                  }
                </strong>
              </div>

            </div>

            <div className="report-modal-actions">

              <button
                type="button"
                className="report-close-btn"
                onClick={() =>
                  setSelectedMember(
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

export default Reports;