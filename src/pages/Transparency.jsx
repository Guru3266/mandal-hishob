import { useEffect, useMemo, useState } from "react";

import {
  IndianRupee,
  Users,
  ArrowDownLeft,
  ArrowUpRight,
  Wallet,
  CheckCircle2,
  CalendarDays,
} from "lucide-react";

import { supabase } from "../lib/supabase";
import { getDashboardData } from "../utils/supabaseDashboard";

import "./Transparency.css";


/* =========================================================
   HELPERS
========================================================= */

function getAmount(value) {

  const number =
    Number(value);

  return Number.isFinite(number)
    ? number
    : 0;
}


function money(value) {

  return `₹${getAmount(
    value
  ).toLocaleString("en-IN")}`;

}


function formatDate(dateValue) {

  if (!dateValue) {
    return "-";
  }

  const date =
    new Date(dateValue);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {

    return dateValue;

  }

  return date.toLocaleDateString(
    "en-GB",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );

}


/* =========================================================
   TRANSPARENCY
========================================================= */

function Transparency() {

  const [members, setMembers] =
    useState([]);

  const [payments, setPayments] =
    useState([]);

  const [expenses, setExpenses] =
    useState([]);

  const [selectedMonth, setSelectedMonth] =
    useState("");


  /* =======================================================
     LOAD DATA
  ======================================================= */

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);

      const {
        members: memberData,
        payments,
        expenses: expenseData,
      } = await getDashboardData();

      setMembers(Array.isArray(memberData) ? memberData : []);
      setPayments(Array.isArray(payments) ? payments : []);
      setExpenses(Array.isArray(expenseData) ? expenseData : []);
    } catch (error) {
      console.error("Transparency loading error:", error);
      setMembers([]);
      setPayments([]);
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  };


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
      "mandalDataUpdated",
      handleUpdate
    );

    const channel = supabase
      .channel("transparency-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "members",
        },
        handleUpdate
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "collections",
        },
        handleUpdate
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "expenses",
        },
        handleUpdate
      )
      .subscribe((status) => {
        console.log(
          "Transparency realtime status:",
          status
        );
      });

    return () => {

      window.removeEventListener(
        "mandal-data-updated",
        handleUpdate
      );

      window.removeEventListener(
        "mandalDataUpdated",
        handleUpdate
      );

      supabase.removeChannel(channel);

    };

  }, []);


  const handleRefresh = async () => {

    try {
      setRefreshing(true);
      await loadData();
    } finally {
      setTimeout(() => {
        setRefreshing(false);
      }, 400);
    }

  };


  /* =======================================================
     MONTH FILTER
  ======================================================= */

  const filterByMonth = (
    item,
    dateField
  ) => {

    if (!selectedMonth) {
      return true;
    }


    const dateValue = item[dateField];

    if (!dateValue) {
      return false;
    }

    const normalizedDate = String(dateValue).slice(0, 10);

    return normalizedDate.startsWith(selectedMonth);

  };


  const filteredPayments =
    useMemo(() => {

      return payments.filter(
        (payment) =>
          filterByMonth(
            payment,
            "date"
          )
      );

    }, [
      payments,
      selectedMonth,
    ]);


  const filteredExpenses =
    useMemo(() => {

      return expenses.filter(
        (expense) =>
          filterByMonth(
            expense,
            "date"
          )
      );

    }, [
      expenses,
      selectedMonth,
    ]);


  /* =======================================================
     TOTALS
  ======================================================= */

  const totalCollection =
    filteredPayments.reduce(
      (
        total,
        payment
      ) =>
        total +
        getAmount(
          payment.amount
        ),
      0
    );


  const totalExpense =
    filteredExpenses.reduce(
      (
        total,
        expense
      ) =>
        total +
        getAmount(
          expense.amount
        ),
      0
    );


  const balance =
    totalCollection -
    totalExpense;


  /* =======================================================
     COLLECTION STATUS
  ======================================================= */

  const paidMembers =
    filteredPayments.length;


  const totalMembers =
    members.length;


  const collectionPercentage =
    totalMembers > 0
      ? Math.min(
          100,
          Math.round(
            (paidMembers /
              totalMembers) *
              100
          )
        )
      : 0;


  /* =======================================================
     PAYMENT MODES
  ======================================================= */

  const cashCollection =
    filteredPayments
      .filter(
        (payment) =>
          String(
            payment.mode ||
            payment.paymentMode ||
            "Cash"
          ).trim().toLowerCase() ===
          "cash"
      )
      .reduce(
        (
          total,
          payment
        ) =>
          total +
          getAmount(
            payment.amount
          ),
        0
      );


  const upiCollection =
    filteredPayments
      .filter(
        (payment) =>
          String(
            payment.mode ||
            payment.paymentMode ||
            ""
          ).trim().toLowerCase() ===
          "upi"
      )
      .reduce(
        (
          total,
          payment
        ) =>
          total +
          getAmount(
            payment.amount
          ),
        0
      );


  const bankCollection =
    filteredPayments
      .filter(
        (payment) =>
          ["bank", "bank transfer", "banktransfer"].includes(
          String(
            payment.mode ||
            payment.paymentMode ||
            ""
          ).trim().toLowerCase()
        )
      )
      .reduce(
        (
          total,
          payment
        ) =>
          total +
          getAmount(
            payment.amount
          ),
        0
      );


  /* =======================================================
     RECENT COLLECTIONS
  ======================================================= */

  const recentCollections =
    [...filteredPayments]
      .sort(
        (a, b) =>
          new Date(
            b.date || 0
          ) -
          new Date(
            a.date || 0
          )
      )
      .slice(0, 5);


  /* =======================================================
     RECENT EXPENSES
  ======================================================= */

  const recentExpenses =
    [...filteredExpenses]
      .sort(
        (a, b) =>
          new Date(
            b.date || 0
          ) -
          new Date(
            a.date || 0
          )
      )
      .slice(0, 5);


  return (

    <div className="transparency-page">


      {/* =================================================
          HEADER
      ================================================= */}

      <div className="transparency-header">

        <div>

          <h1>
            Transparency
          </h1>

          <p>
            मंडळाच्या आर्थिक व्यवहारांची पारदर्शक माहिती
          </p>

        </div>


        <div className="transparency-date">

          <CalendarDays size={16} />

          <input
            type="month"
            value={selectedMonth}
            onChange={(event) =>
              setSelectedMonth(
                event.target.value
              )
            }
          />

          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            title="Refresh"
            style={{
              border: "1px solid #dbe3ef",
              background: "#fff",
              borderRadius: "8px",
              padding: "7px 10px",
              cursor: refreshing ? "not-allowed" : "pointer",
              opacity: refreshing ? 0.6 : 1,
            }}
          >
            ↻
          </button>

        </div>

      </div>

      {loading && (
        <div
          style={{
            padding: "8px 0",
            color: "#64748b",
            fontSize: "13px",
          }}
        >
          आर्थिक माहिती load होत आहे...
        </div>
      )}


      {/* =================================================
          HERO BALANCE
      ================================================= */}

      <div className="transparency-balance">

        <div className="transparency-balance-icon">

          <Wallet size={28} />

        </div>


        <div>

          <span>
            उपलब्ध शिल्लक
          </span>

          <strong
            className={
              balance >= 0
                ? "positive"
                : "negative"
            }
          >
            {money(balance)}
          </strong>

          <p>
            एकूण जमा − एकूण खर्च
          </p>

        </div>

      </div>


      {/* =================================================
          SUMMARY CARDS
      ================================================= */}

      <div className="transparency-summary">


        {/* COLLECTION */}

        <div className="transparency-card">

          <div className="transparency-card-icon green">

            <ArrowDownLeft
              size={22}
            />

          </div>

          <div>

            <span>
              एकूण जमा
            </span>

            <strong className="green-text">
              {money(
                totalCollection
              )}
            </strong>

            <small>
              {filteredPayments.length}
              {" "}
              transactions
            </small>

          </div>

        </div>


        {/* EXPENSE */}

        <div className="transparency-card">

          <div className="transparency-card-icon red">

            <ArrowUpRight
              size={22}
            />

          </div>

          <div>

            <span>
              एकूण खर्च
            </span>

            <strong className="red-text">
              {money(
                totalExpense
              )}
            </strong>

            <small>
              {filteredExpenses.length}
              {" "}
              transactions
            </small>

          </div>

        </div>


        {/* MEMBERS */}

        <div className="transparency-card">

          <div className="transparency-card-icon blue">

            <Users
              size={22}
            />

          </div>

          <div>

            <span>
              एकूण वर्गणीदार
            </span>

            <strong>
              {totalMembers}
            </strong>

            <small>
              Registered Members
            </small>

          </div>

        </div>


        {/* COLLECTION RATE */}

        <div className="transparency-card">

          <div className="transparency-card-icon orange">

            <CheckCircle2
              size={22}
            />

          </div>

          <div>

            <span>
              Collection Rate
            </span>

            <strong>
              {collectionPercentage}%
            </strong>

            <small>
              Paid Members
            </small>

          </div>

        </div>

      </div>


      {/* =================================================
          PAYMENT BREAKDOWN
      ================================================= */}

      <div className="transparency-grid">


        <div className="transparency-section">

          <div className="transparency-section-header">

            <div>

              <h2>
                जमा रकमेचा तपशील
              </h2>

              <p>
                Payment mode नुसार जमा
              </p>

            </div>

            <IndianRupee
              size={21}
            />

          </div>


          <div className="transparency-breakdown">


            <div className="breakdown-row">

              <div>

                <span className="breakdown-dot cash" />

                <strong>
                  Cash
                </strong>

              </div>

              <strong>
                {money(
                  cashCollection
                )}
              </strong>

            </div>


            <div className="breakdown-row">

              <div>

                <span className="breakdown-dot upi" />

                <strong>
                  UPI
                </strong>

              </div>

              <strong>
                {money(
                  upiCollection
                )}
              </strong>

            </div>


            <div className="breakdown-row">

              <div>

                <span className="breakdown-dot bank" />

                <strong>
                  Bank
                </strong>

              </div>

              <strong>
                {money(
                  bankCollection
                )}
              </strong>

            </div>


            <div className="breakdown-total">

              <span>
                Total
              </span>

              <strong>
                {money(
                  totalCollection
                )}
              </strong>

            </div>

          </div>

        </div>


        {/* =================================================
            TRANSPARENCY NOTE
        ================================================= */}

        <div className="transparency-section">

          <div className="transparency-section-header">

            <div>

              <h2>
                आर्थिक स्थिती
              </h2>

              <p>
                Current financial position
              </p>

            </div>

            <Wallet
              size={21}
            />

          </div>


          <div className="financial-position">


            <div className="financial-position-row">

              <span>
                एकूण जमा
              </span>

              <strong className="green-text">
                + {money(
                  totalCollection
                )}
              </strong>

            </div>


            <div className="financial-position-row">

              <span>
                एकूण खर्च
              </span>

              <strong className="red-text">
                − {money(
                  totalExpense
                )}
              </strong>

            </div>


            <div className="financial-position-divider" />


            <div className="financial-position-balance">

              <span>
                उपलब्ध शिल्लक
              </span>

              <strong
                className={
                  balance >= 0
                    ? "green-text"
                    : "red-text"
                }
              >
                {money(balance)}
              </strong>

            </div>

          </div>

        </div>

      </div>


      {/* =================================================
          RECENT TRANSACTIONS
      ================================================= */}

      <div className="transparency-transactions">


        {/* COLLECTIONS */}

        <div className="transparency-section">

          <div className="transparency-section-header">

            <div>

              <h2>
                अलीकडील जमा
              </h2>

              <p>
                Latest collections
              </p>

            </div>

          </div>


          <div className="transparency-list">

            {recentCollections.length === 0 ? (

              <div className="transparency-empty">
                अजून कोणतीही जमा नोंद नाही.
              </div>

            ) : (

              recentCollections.map(
                (payment, index) => (

                  <div
                    className="transparency-list-row"
                    key={
                      payment.id ||
                      index
                    }
                  >

                    <div className="transaction-left">

                      <div className="transaction-avatar green">

                        {String(
                          payment.memberName ||
                          payment.name ||
                          "M"
                        )
                          .charAt(0)
                          .toUpperCase()}

                      </div>

                      <div>

                        <strong>
                          {payment.memberName ||
                            payment.name ||
                            "वर्गणीदार"}
                        </strong>

                        <span>
                          {formatDate(
                            payment.date
                          )}
                        </span>

                      </div>

                    </div>


                    <strong className="green-text">
                      + {money(
                        payment.amount
                      )}
                    </strong>

                  </div>

                )
              )

            )}

          </div>

        </div>


        {/* EXPENSES */}

        <div className="transparency-section">

          <div className="transparency-section-header">

            <div>

              <h2>
                अलीकडील खर्च
              </h2>

              <p>
                Latest expenses
              </p>

            </div>

          </div>


          <div className="transparency-list">

            {recentExpenses.length === 0 ? (

              <div className="transparency-empty">
                अजून कोणताही खर्च नोंदलेला नाही.
              </div>

            ) : (

              recentExpenses.map(
                (expense, index) => (

                  <div
                    className="transparency-list-row"
                    key={
                      expense.id ||
                      index
                    }
                  >

                    <div className="transaction-left">

                      <div className="transaction-avatar red">

                        <ArrowUpRight
                          size={16}
                        />

                      </div>

                      <div>

                        <strong>
                          {expense.description ||
                            expense.category ||
                            "Expense"}
                        </strong>

                        <span>
                          {expense.category ||
                            "Other"}
                          {" • "}
                          {formatDate(
                            expense.date
                          )}
                        </span>

                      </div>

                    </div>


                    <strong className="red-text">
                      − {money(
                        expense.amount
                      )}
                    </strong>

                  </div>

                )
              )

            )}

          </div>

        </div>

      </div>


      {/* =================================================
          FOOTER NOTE
      ================================================= */}

      <div className="transparency-footer">

        <CheckCircle2
          size={17}
        />

        <span>
          ही माहिती मंडळाच्या नोंदवलेल्या आर्थिक व्यवहारांवर आधारित आहे.
        </span>

      </div>

    </div>

  );

}


export default Transparency;
