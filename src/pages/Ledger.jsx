import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Search,
  CalendarDays,
  ArrowDownLeft,
  ArrowUpRight,
  WalletCards,
  TrendingUp,
  TrendingDown,
  X,
  Printer,
} from "lucide-react";

import {
  getTransactions,
  getTotalCollection,
  getTotalExpense,
  getCurrentBalance,
} from "../data/financialStore";

import {
  getMandalConfig,
} from "../utils/mandalConfig";

import "./Ledger.css";


function Ledger() {

  /* =====================================================
     DATA
  ===================================================== */

  const [transactions, setTransactions] =
    useState([]);

  const [mandal, setMandal] =
    useState(
      getMandalConfig()
    );


  /* =====================================================
     FILTERS
  ===================================================== */

  const [search, setSearch] =
    useState("");

  const [typeFilter, setTypeFilter] =
    useState("All");

  const [modeFilter, setModeFilter] =
    useState("All");

  const [dateFilter, setDateFilter] =
    useState("");


  /* =====================================================
     SELECTED TRANSACTION
  ===================================================== */

  const [selectedTransaction, setSelectedTransaction] =
    useState(null);


  /* =====================================================
     DATE PARSER
     
     Supports:
     YYYY-MM-DD
     DD-MM-YYYY
  ===================================================== */

  const parseDate = (value) => {

    if (!value) {
      return 0;
    }

    const dateString =
      String(value).trim();


    /* -----------------------------------------------------
       DD-MM-YYYY
    ----------------------------------------------------- */

    if (
      /^\d{2}-\d{2}-\d{4}$/.test(
        dateString
      )
    ) {

      const [
        day,
        month,
        year,
      ] =
        dateString
          .split("-")
          .map(Number);


      return new Date(
        year,
        month - 1,
        day
      ).getTime();

    }


    /* -----------------------------------------------------
       YYYY-MM-DD
    ----------------------------------------------------- */

    if (
      /^\d{4}-\d{2}-\d{2}$/.test(
        dateString
      )
    ) {

      const [
        year,
        month,
        day,
      ] =
        dateString
          .split("-")
          .map(Number);


      return new Date(
        year,
        month - 1,
        day
      ).getTime();

    }


    const parsed =
      new Date(
        dateString
      ).getTime();


    return Number.isNaN(parsed)
      ? 0
      : parsed;

  };


  /* =====================================================
     NUMBER FROM TRANSACTION ID
     
     Used only as a stable tie-breaker
     when multiple transactions have same date.
  ===================================================== */

  const getIdNumber = (
    id
  ) => {

    const match =
      String(
        id || ""
      ).match(
        /\d+/
      );


    return match
      ? Number(match[0])
      : 0;

  };


  /* =====================================================
     LOAD DATA
  ===================================================== */

  const loadData = () => {

    try {

      const data =
        getTransactions();


      setTransactions(
        Array.isArray(data)
          ? data
          : []
      );


      setMandal(
        getMandalConfig()
      );

    } catch (error) {

      console.error(
        "Ledger loading error:",
        error
      );


      setTransactions([]);

      setMandal(
        getMandalConfig()
      );

    }

  };


  /* =====================================================
     INITIAL LOAD + LIVE UPDATE
  ===================================================== */

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
      "storage",
      handleUpdate
    );


    return () => {

      window.removeEventListener(
        "mandal-data-updated",
        handleUpdate
      );


      window.removeEventListener(
        "storage",
        handleUpdate
      );

    };

  }, []);


  /* =====================================================
     MONEY FORMAT
  ===================================================== */

  const money = (
    value
  ) => {

    return Math.abs(
      Number(
        value || 0
      )
    ).toLocaleString(
      "en-IN"
    );

  };


  /* =====================================================
     SIGNED MONEY
  ===================================================== */

  const signedMoney = (
    value
  ) => {

    const amount =
      Number(
        value || 0
      );


    if (amount < 0) {

      return `-₹${money(amount)}`;

    }


    return `₹${money(amount)}`;

  };


  /* =====================================================
     TRANSACTIONS WITH RUNNING BALANCE
  ===================================================== */

  const ledgerTransactions =
    useMemo(() => {

      /*
        IMPORTANT:

        Running balance must always be
        calculated oldest -> newest.

        The UI will then display
        newest -> oldest.
      */


      const chronological = [
        ...transactions,
      ].sort(
        (a, b) => {

          const dateDifference =
            parseDate(a.date) -
            parseDate(b.date);


          if (
            dateDifference !== 0
          ) {

            return dateDifference;

          }


          /*
            Same-date transactions:

            Use numeric transaction ID
            as a stable secondary order.

            Example:
            RCP-00007
            RCP-00008
            EXP-007
            EXP-008
          */

          return (
            getIdNumber(a.id) -
            getIdNumber(b.id)
          );

        }
      );


      let balance = 0;


      const calculated =
        chronological.map(
          (
            transaction
          ) => {

            const amount =
              Number(
                transaction.amount ||
                0
              );


            const isIncome =
              transaction.type ===
              "Income";


            if (isIncome) {

              balance += amount;

            } else {

              balance -= amount;

            }


            return {

              ...transaction,

              credit:
                isIncome
                  ? amount
                  : 0,

              debit:
                !isIncome
                  ? amount
                  : 0,

              balance,

            };

          }
        );


      /*
        Display latest first,
        but balance was already calculated
        in chronological order.
      */

      return calculated.reverse();

    }, [
      transactions,
    ]);


  /* =====================================================
     FILTER
  ===================================================== */

  const filteredTransactions =
    useMemo(() => {

      const keyword =
        search
          .trim()
          .toLowerCase();


      return ledgerTransactions.filter(
        (
          transaction
        ) => {

          const matchesSearch =
            !keyword ||

            String(
              transaction.id ||
              ""
            )
              .toLowerCase()
              .includes(
                keyword
              ) ||

            String(
              transaction.name ||
              ""
            )
              .toLowerCase()
              .includes(
                keyword
              ) ||

            String(
              transaction.description ||
              ""
            )
              .toLowerCase()
              .includes(
                keyword
              );


          const matchesType =
            typeFilter === "All" ||
            transaction.type ===
              typeFilter;


          const matchesMode =
            modeFilter === "All" ||
            transaction.mode ===
              modeFilter;


          const matchesDate =
            !dateFilter ||
            transaction.date ===
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
      ledgerTransactions,
      search,
      typeFilter,
      modeFilter,
      dateFilter,
    ]);


  /* =====================================================
     SUMMARY
  ===================================================== */

  const totalCollection =
    getTotalCollection();


  const totalExpense =
    getTotalExpense();


  const currentBalance =
    getCurrentBalance();


  /* =====================================================
     FILTERED CREDIT
  ===================================================== */

  const totalCredit =
    filteredTransactions.reduce(
      (
        total,
        transaction
      ) =>
        total +
        Number(
          transaction.credit ||
          0
        ),
      0
    );


  /* =====================================================
     FILTERED DEBIT
  ===================================================== */

  const totalDebit =
    filteredTransactions.reduce(
      (
        total,
        transaction
      ) =>
        total +
        Number(
          transaction.debit ||
          0
        ),
      0
    );


  /* =====================================================
     FILTERED NET
  ===================================================== */

  const filteredNet =
    totalCredit -
    totalDebit;


  /* =====================================================
     CLEAR FILTERS
  ===================================================== */

  const clearFilters = () => {

    setSearch("");

    setTypeFilter(
      "All"
    );

    setModeFilter(
      "All"
    );

    setDateFilter("");

  };


  /* =====================================================
     PRINT LEDGER
  ===================================================== */

  const printLedger = () => {

    const printWindow =
      window.open(
        "",
        "_blank",
        "width=1000,height=800"
      );


    if (!printWindow) {

      alert(
        "Popup blocked आहे. Browser मध्ये popup allow करा."
      );

      return;

    }


    const rows =
      filteredTransactions
        .map(
          (
            transaction
          ) => `

            <tr>

              <td>
                ${transaction.date}
              </td>

              <td>
                ${transaction.id}
              </td>

              <td>
                ${
                  transaction.type ===
                  "Income"
                    ? "Collection"
                    : "Expense"
                }
              </td>

              <td>
                ${transaction.name || "-"}
              </td>

              <td>
                ${
                  transaction.description ||
                  "-"
                }
              </td>

              <td>
                ${
                  transaction.mode ||
                  "-"
                }
              </td>

              <td class="credit">
                ${
                  transaction.credit
                    ? `+₹${money(
                        transaction.credit
                      )}`
                    : "-"
                }
              </td>

              <td class="debit">
                ${
                  transaction.debit
                    ? `-₹${money(
                        transaction.debit
                      )}`
                    : "-"
                }
              </td>

              <td
                class="${
                  transaction.balance < 0
                    ? "negative"
                    : "positive"
                }"
              >
                ${signedMoney(
                  transaction.balance
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
              mandal.name ||
              "Mandal Hishob"
            }
            - Ledger
          </title>


          <style>

            * {
              box-sizing: border-box;
            }


            body {

              font-family:
                Arial,
                sans-serif;

              padding: 25px;

              color: #172033;

            }


            .header {

              text-align: center;

              border-bottom:
                2px solid #f59e0b;

              padding-bottom: 15px;

              margin-bottom: 20px;

            }


            .header h1 {

              margin: 0;

              font-size: 24px;

            }


            .header p {

              margin: 5px 0;

              color: #64748b;

              font-size: 12px;

            }


            .summary {

              display: flex;

              gap: 15px;

              margin-bottom: 20px;

            }


            .summary-box {

              flex: 1;

              padding: 12px;

              border:
                1px solid #ddd;

              border-radius: 8px;

            }


            .summary-box span {

              display: block;

              font-size: 11px;

              color: #64748b;

            }


            .summary-box strong {

              display: block;

              margin-top: 4px;

              font-size: 17px;

            }


            table {

              width: 100%;

              border-collapse:
                collapse;

              font-size: 10px;

            }


            th {

              background: #f8fafc;

              text-align: left;

              padding: 9px;

              border:
                1px solid #ddd;

            }


            td {

              padding: 8px;

              border:
                1px solid #e5e7eb;

            }


            .credit {

              color: #15803d;

              font-weight: bold;

            }


            .debit {

              color: #dc2626;

              font-weight: bold;

            }


            .positive {

              color: #15803d;

              font-weight: bold;

            }


            .negative {

              color: #dc2626;

              font-weight: bold;

            }


            .footer {

              margin-top: 20px;

              text-align: center;

              font-size: 10px;

              color: #64748b;

            }


            @media print {

              body {

                padding: 0;

              }

            }

          </style>

        </head>


        <body>


          <div class="header">

            <h1>
              ${
                mandal.name ||
                "Mandal Hishob"
              }
            </h1>


            ${
              mandal.tagline
                ? `
                  <p>
                    ${mandal.tagline}
                  </p>
                `
                : ""
            }


            ${
              mandal.address
                ? `
                  <p>
                    ${mandal.address}
                  </p>
                `
                : ""
            }


            <strong>
              Financial Ledger
            </strong>

          </div>


          <div class="summary">


            <div class="summary-box">

              <span>
                Total Collection
              </span>

              <strong>
                ₹${money(
                  totalCollection
                )}
              </strong>

            </div>


            <div class="summary-box">

              <span>
                Total Expense
              </span>

              <strong>
                ₹${money(
                  totalExpense
                )}
              </strong>

            </div>


            <div class="summary-box">

              <span>
                Current Balance
              </span>

              <strong
                class="${
                  currentBalance < 0
                    ? "negative"
                    : "positive"
                }"
              >
                ${signedMoney(
                  currentBalance
                )}
              </strong>

            </div>


          </div>


          <table>

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
                  Name
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

              </tr>

            </thead>


            <tbody>

              ${rows}

            </tbody>

          </table>


          <div class="footer">

            Generated from
            ${
              mandal.name ||
              "Mandal Hishob"
            }

          </div>


          <script>

            window.onload =
              function() {

                window.print();

              };

          </script>


        </body>

      </html>

    `);


    printWindow.document.close();

  };


  /* =====================================================
     RENDER
  ===================================================== */

  return (

    <div className="ledger-page">


      {/* =================================================
          HEADER
      ================================================= */}

      <div className="ledger-header">

        <div>

          <h1>
            Ledger
          </h1>

          <p>
            मंडळाचे सर्व financial transactions
          </p>

        </div>


        <button
          type="button"
          className="ledger-print-btn"
          onClick={
            printLedger
          }
        >

          <Printer
            size={17}
          />

          Print Ledger

        </button>

      </div>


      {/* =================================================
          SUMMARY
      ================================================= */}

      <div className="ledger-summary">


        {/* COLLECTION */}

        <div className="ledger-summary-card">

          <div className="ledger-summary-icon income">

            <TrendingUp
              size={20}
            />

          </div>


          <div>

            <span>
              Total Collection
            </span>

            <strong>
              ₹
              {money(
                totalCollection
              )}
            </strong>

          </div>

        </div>


        {/* EXPENSE */}

        <div className="ledger-summary-card">

          <div className="ledger-summary-icon expense">

            <TrendingDown
              size={20}
            />

          </div>


          <div>

            <span>
              Total Expense
            </span>

            <strong>
              ₹
              {money(
                totalExpense
              )}
            </strong>

          </div>

        </div>


        {/* BALANCE */}

        <div className="ledger-summary-card">

          <div className="ledger-summary-icon balance">

            <WalletCards
              size={20}
            />

          </div>


          <div>

            <span>
              Current Balance
            </span>

            <strong
              className={
                currentBalance < 0
                  ? "balance-negative"
                  : "balance-positive"
              }
            >
              {signedMoney(
                currentBalance
              )}
            </strong>

          </div>

        </div>


      </div>


      {/* =================================================
          LEDGER PANEL
      ================================================= */}

      <section className="ledger-panel">


        {/* PANEL HEADER */}

        <div className="ledger-panel-header">

          <div>

            <h2>
              Transaction Ledger
            </h2>

            <p>
              {filteredTransactions.length}
              {" "}
              transactions
            </p>

          </div>


          {/* FILTERS */}

          <div className="ledger-filters">


            {/* SEARCH */}

            <div className="ledger-search">

              <Search
                size={16}
              />

              <input
                type="text"
                placeholder="Search transaction..."
                value={
                  search
                }
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
              />

            </div>


            {/* TYPE */}

            <select
              className="ledger-select"
              value={
                typeFilter
              }
              onChange={(e) =>
                setTypeFilter(
                  e.target.value
                )
              }
            >

              <option value="All">
                All Types
              </option>

              <option value="Income">
                Collection
              </option>

              <option value="Expense">
                Expense
              </option>

            </select>


            {/* MODE */}

            <select
              className="ledger-select"
              value={
                modeFilter
              }
              onChange={(e) =>
                setModeFilter(
                  e.target.value
                )
              }
            >

              <option value="All">
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

            <div className="ledger-date">

              <CalendarDays
                size={15}
              />

              <input
                type="date"
                value={
                  dateFilter
                }
                onChange={(e) =>
                  setDateFilter(
                    e.target.value
                  )
                }
              />

            </div>


            {/* CLEAR */}

            {(
              search ||
              typeFilter !== "All" ||
              modeFilter !== "All" ||
              dateFilter
            ) && (

              <button
                type="button"
                className="ledger-clear"
                onClick={
                  clearFilters
                }
              >
                Clear
              </button>

            )}

          </div>

        </div>


        {/* =================================================
            FILTER SUMMARY
        ================================================= */}

        <div className="ledger-filter-summary">


          {/* CREDIT */}

          <div>

            <span>
              Filtered Credit
            </span>

            <strong className="credit-text">

              +₹
              {money(
                totalCredit
              )}

            </strong>

          </div>


          {/* DEBIT */}

          <div>

            <span>
              Filtered Debit
            </span>

            <strong className="debit-text">

              -₹
              {money(
                totalDebit
              )}

            </strong>

          </div>


          {/* NET */}

          <div>

            <span>
              Net
            </span>

            <strong
              className={
                filteredNet >= 0
                  ? "credit-text"
                  : "debit-text"
              }
            >

              {signedMoney(
                filteredNet
              )}

            </strong>

          </div>


        </div>


        {/* =================================================
            TABLE
        ================================================= */}

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

              </tr>

            </thead>


            <tbody>

              {filteredTransactions.map(
                (
                  transaction
                ) => (

                  <tr
                    key={`${transaction.type}-${transaction.id}`}
                    onClick={() =>
                      setSelectedTransaction(
                        transaction
                      )
                    }
                    className="ledger-row"
                  >


                    {/* DATE */}

                    <td>
                      {transaction.date}
                    </td>


                    {/* TRANSACTION */}

                    <td>

                      <strong>
                        {
                          transaction.id
                        }
                      </strong>

                    </td>


                    {/* TYPE */}

                    <td>

                      <span
                        className={
                          transaction.type ===
                          "Income"
                            ? "ledger-type income"
                            : "ledger-type expense"
                        }
                      >

                        {transaction.type ===
                        "Income" ? (

                          <>

                            <ArrowDownLeft
                              size={13}
                            />

                            Collection

                          </>

                        ) : (

                          <>

                            <ArrowUpRight
                              size={13}
                            />

                            Expense

                          </>

                        )}

                      </span>

                    </td>


                    {/* DESCRIPTION */}

                    <td>

                      <div className="ledger-description">

                        <strong>
                          {
                            transaction.name ||
                            "-"
                          }
                        </strong>

                        <span>
                          {
                            transaction.description ||
                            "-"
                          }
                        </span>

                      </div>

                    </td>


                    {/* MODE */}

                    <td>

                      <span className="ledger-mode">

                        {
                          transaction.mode ||
                          "-"
                        }

                      </span>

                    </td>


                    {/* CREDIT */}

                    <td>

                      {transaction.credit >
                      0 ? (

                        <strong className="credit-text">

                          +₹
                          {money(
                            transaction.credit
                          )}

                        </strong>

                      ) : (

                        <span className="dash">
                          —
                        </span>

                      )}

                    </td>


                    {/* DEBIT */}

                    <td>

                      {transaction.debit >
                      0 ? (

                        <strong className="debit-text">

                          -₹
                          {money(
                            transaction.debit
                          )}

                        </strong>

                      ) : (

                        <span className="dash">
                          —
                        </span>

                      )}

                    </td>


                    {/* BALANCE */}

                    <td>

                      <strong
                        className={
                          transaction.balance >=
                          0
                            ? "balance-positive"
                            : "balance-negative"
                        }
                      >

                        {signedMoney(
                          transaction.balance
                        )}

                      </strong>

                    </td>


                  </tr>

                )
              )}

            </tbody>

          </table>


          {/* EMPTY */}

          {filteredTransactions.length ===
            0 && (

            <div className="ledger-empty">

              <WalletCards
                size={40}
              />

              <strong>
                कोणतेही transactions नाहीत
              </strong>

              <span>
                Search किंवा filters बदलून पुन्हा try करा.
              </span>

            </div>

          )}

        </div>


      </section>


      {/* =================================================
          TRANSACTION DETAILS MODAL
      ================================================= */}

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
            onClick={(e) =>
              e.stopPropagation()
            }
          >


            {/* MODAL HEADER */}

            <div className="ledger-modal-header">

              <div>

                <h2>
                  Transaction Details
                </h2>

                <p>
                  {
                    selectedTransaction.id
                  }
                </p>

              </div>


              <button
                type="button"
                className="ledger-close"
                onClick={() =>
                  setSelectedTransaction(
                    null
                  )
                }
              >

                <X
                  size={19}
                />

              </button>

            </div>


            {/* DETAILS */}

            <div className="ledger-details">


              <div className="ledger-detail-row">

                <span>
                  Transaction ID
                </span>

                <strong>
                  {
                    selectedTransaction.id
                  }
                </strong>

              </div>


              <div className="ledger-detail-row">

                <span>
                  Date
                </span>

                <strong>
                  {
                    selectedTransaction.date
                  }
                </strong>

              </div>


              <div className="ledger-detail-row">

                <span>
                  Type
                </span>

                <strong>
                  {
                    selectedTransaction.type ===
                    "Income"
                      ? "Collection"
                      : "Expense"
                  }
                </strong>

              </div>


              <div className="ledger-detail-row">

                <span>
                  Name / Category
                </span>

                <strong>
                  {
                    selectedTransaction.name ||
                    "-"
                  }
                </strong>

              </div>


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


              <div className="ledger-detail-row">

                <span>
                  Amount
                </span>

                <strong
                  className={
                    selectedTransaction.type ===
                    "Income"
                      ? "credit-text"
                      : "debit-text"
                  }
                >

                  {selectedTransaction.type ===
                  "Income"
                    ? "+"
                    : "-"}

                  ₹
                  {money(
                    selectedTransaction.amount
                  )}

                </strong>

              </div>


              <div className="ledger-detail-total">

                <span>
                  Running Balance
                </span>

                <strong
                  className={
                    selectedTransaction.balance >=
                    0
                      ? "balance-positive"
                      : "balance-negative"
                  }
                >
                  {signedMoney(
                    selectedTransaction.balance
                  )}
                </strong>

              </div>


            </div>


            {/* MODAL ACTION */}

            <div className="ledger-modal-actions">

              <button
                type="button"
                className="ledger-cancel"
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