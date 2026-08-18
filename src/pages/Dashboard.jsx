import { useEffect, useMemo, useState } from "react";

import {
  Users,
  WalletCards,
  TrendingUp,
  TrendingDown,
  Clock3,
  ReceiptText,
  ArrowDownLeft,
  ArrowUpRight,
  RefreshCw,
} from "lucide-react";

import {
  getMembers,
  getCollections,
  getExpenses,
  getTotalCollection,
  getTotalExpense,
  getTotalExpected,
  getTotalPending,
  getCurrentBalance,
} from "../data/financialStore";

import "../App.css";
import { getMandalConfig } from "../utils/mandalConfig";

function Dashboard() {

  /* =====================================================
     STATE
  ===================================================== */

 const [members, setMembers] = useState([]);
const [collections, setCollections] = useState([]);
const [expenses, setExpenses] = useState([]);

const [mandalConfig, setMandalConfig] = useState(
  getMandalConfig()
);

const [refreshing, setRefreshing] = useState(false);


  /* =====================================================
     LOAD DATA
  ===================================================== */

  const loadDashboard = () => {

  try {

    setMembers(
      getMembers()
    );

    setCollections(
      getCollections()
    );

    setExpenses(
      getExpenses()
    );

    setMandalConfig(
      getMandalConfig()
    );

  } catch (error) {

    console.error(
      "Dashboard loading error:",
      error
    );

  }

};


  /* =====================================================
     INITIAL LOAD
  ===================================================== */

  useEffect(() => {

    loadDashboard();


    const handleUpdate = () => {

      loadDashboard();

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
     MANUAL REFRESH
  ===================================================== */

  const handleRefresh = () => {

    setRefreshing(true);

    loadDashboard();

    setTimeout(() => {

      setRefreshing(false);

    }, 500);

  };


  /* =====================================================
     MONEY
  ===================================================== */

  const money = (
    value
  ) => {

    return Number(
      value || 0
    ).toLocaleString(
      "en-IN"
    );

  };


  /* =====================================================
     SUMMARY
  ===================================================== */

  const totalMembers =
    members.length;


  const totalExpected =
    getTotalExpected();


  const totalCollection =
    getTotalCollection();


  const totalPending =
    getTotalPending();


  const totalExpense =
    getTotalExpense();


  const currentBalance =
    getCurrentBalance();


  /* =====================================================
     COLLECTION PROGRESS
  ===================================================== */

  const collectionProgress =
    totalExpected > 0
      ? Math.min(
          (
            totalCollection /
            totalExpected
          ) *
            100,
          100
        )
      : 0;


  /* =====================================================
     MEMBER STATUS
  ===================================================== */

  const memberStatus =
    useMemo(() => {

      let paid = 0;
      let partial = 0;
      let pending = 0;


      members.forEach(
        (member) => {

          const expected =
            Number(
              member.expected || 0
            );


          const collected =
            collections
              .filter(
                (collection) =>
                  String(
                    collection.memberId
                  ) ===
                  String(
                    member.id
                  )
              )
              .reduce(
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


          if (
            expected <=
            collected
          ) {

            paid++;

          } else if (
            collected >
            0
          ) {

            partial++;

          } else {

            pending++;

          }

        }
      );


      return {
        paid,
        partial,
        pending,
      };

    }, [
      members,
      collections,
    ]);


  /* =====================================================
     RECENT TRANSACTIONS
  ===================================================== */

  const recentTransactions =
    useMemo(() => {

      const income =
        collections.map(
          (item) => ({

            id:
              item.id,

            type:
              "Income",

            title:
              item.memberName ||
              "Collection",

            description:
              item.remark ||
              "वर्गणी जमा",

            amount:
              Number(
                item.amount || 0
              ),

            mode:
              item.mode ||
              "Cash",

            date:
              item.date,

          })
        );


      const expenseData =
        expenses.map(
          (item) => ({

            id:
              item.id,

            type:
              "Expense",

            title:
              item.category ||
              "Expense",

            description:
              item.description ||
              "-",

            amount:
              Number(
                item.amount || 0
              ),

            mode:
              item.mode ||
              "Cash",

            date:
              item.date,

          })
        );


      return [
        ...income,
        ...expenseData,
      ]
        .sort(
          (a, b) =>
            new Date(b.date) -
            new Date(a.date)
        )
        .slice(
          0,
          6
        );

    }, [
      collections,
      expenses,
    ]);


  /* =====================================================
     PAYMENT MODE
  ===================================================== */

  const paymentModes =
    useMemo(() => {

      const result = {

        Cash: 0,

        UPI: 0,

        Bank: 0,

      };


      collections.forEach(
        (collection) => {

          const mode =
            collection.mode ||
            "Cash";


          if (
            result[mode] !==
            undefined
          ) {

            result[mode] +=
              Number(
                collection.amount ||
                0
              );

          }

        }
      );


      return result;

    }, [
      collections,
    ]);


  /* =====================================================
     FORMAT DATE
  ===================================================== */

  const formatDate = (
    date
  ) => {

    if (!date) {
      return "-";
    }


    return new Date(
      date
    ).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );

  };


  /* =====================================================
     RENDER
  ===================================================== */

  return (

    <div className="dashboard-page">


      {/* =================================================
          HEADER
      ================================================= */}

      <div className="dashboard-header">

  <div>

    <h1>
      {mandalConfig.name || "मंडळाचे नाव"}
    </h1>

    <p>
      {mandalConfig.tagline ||
        "मंडळाच्या आर्थिक व्यवहारांचा आढावा"}
    </p>

  </div>


  <button
    type="button"
    className="dashboard-refresh"
    onClick={handleRefresh}
  >

    <RefreshCw
      size={16}
      className={
        refreshing
          ? "refresh-spin"
          : ""
      }
    />

    Refresh

  </button>

</div>


      {/* =================================================
          MAIN STATS
      ================================================= */}

      <div className="dashboard-stats">


        {/* MEMBERS */}

        <div className="dashboard-stat-card">

          <div className="dashboard-stat-icon members">

            <Users
              size={20}
            />

          </div>

          <div>

            <span>
              Total Members
            </span>

            <strong>
              {totalMembers}
            </strong>

            <small>
              Registered members
            </small>

          </div>

        </div>


        {/* EXPECTED */}

        <div className="dashboard-stat-card">

          <div className="dashboard-stat-icon expected">

            <WalletCards
              size={20}
            />

          </div>

          <div>

            <span>
              Expected Collection
            </span>

            <strong>
              ₹
              {money(
                totalExpected
              )}
            </strong>

            <small>
              Target amount
            </small>

          </div>

        </div>


        {/* COLLECTION */}

        <div className="dashboard-stat-card">

          <div className="dashboard-stat-icon collection">

            <TrendingUp
              size={20}
            />

          </div>

          <div>

            <span>
              Total Collection
            </span>

            <strong className="green-text">

              ₹
              {money(
                totalCollection
              )}

            </strong>

            <small>
              {collectionProgress.toFixed(
                1
              )}
              % collected
            </small>

          </div>

        </div>


        {/* PENDING */}

        <div className="dashboard-stat-card">

          <div className="dashboard-stat-icon pending">

            <Clock3
              size={20}
            />

          </div>

          <div>

            <span>
              Pending Collection
            </span>

            <strong className="orange-text">

              ₹
              {money(
                totalPending
              )}

            </strong>

            <small>
              Remaining amount
            </small>

          </div>

        </div>


        {/* EXPENSE */}

        <div className="dashboard-stat-card">

          <div className="dashboard-stat-icon expense">

            <TrendingDown
              size={20}
            />

          </div>

          <div>

            <span>
              Total Expense
            </span>

            <strong className="red-text">

              ₹
              {money(
                totalExpense
              )}

            </strong>

            <small>
              Total spending
            </small>

          </div>

        </div>


        {/* BALANCE */}

        <div className="dashboard-stat-card">

          <div className="dashboard-stat-icon balance">

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
                currentBalance >= 0
                  ? "green-text"
                  : "red-text"
              }
            >

              ₹
              {money(
                Math.abs(
                  currentBalance
                )
              )}

            </strong>

            <small>

              {currentBalance >= 0
                ? "Available balance"
                : "Negative balance"}

            </small>

          </div>

        </div>

      </div>


      {/* =================================================
          PROGRESS + MEMBER STATUS
      ================================================= */}

      <div className="dashboard-grid">


        {/* COLLECTION PROGRESS */}

        <section className="dashboard-card">

          <div className="dashboard-card-header">

            <div>

              <h2>
                Collection Progress
              </h2>

              <p>
                वर्गणी जमा करण्याची प्रगती
              </p>

            </div>

            <strong className="progress-value">

              {collectionProgress.toFixed(
                1
              )}
              %

            </strong>

          </div>


          <div className="progress-track">

            <div
              className="progress-fill"
              style={{
                width:
                  `${collectionProgress}%`,
              }}
            />

          </div>


          <div className="progress-details">

            <div>

              <span>
                Collected
              </span>

              <strong className="green-text">

                ₹
                {money(
                  totalCollection
                )}

              </strong>

            </div>


            <div>

              <span>
                Expected
              </span>

              <strong>

                ₹
                {money(
                  totalExpected
                )}

              </strong>

            </div>


            <div>

              <span>
                Pending
              </span>

              <strong className="orange-text">

                ₹
                {money(
                  totalPending
                )}

              </strong>

            </div>

          </div>

        </section>


        {/* MEMBER STATUS */}

        <section className="dashboard-card">

          <div className="dashboard-card-header">

            <div>

              <h2>
                Member Status
              </h2>

              <p>
                वर्गणीदारांची payment स्थिती
              </p>

            </div>

            <Users
              size={19}
              className="header-muted-icon"
            />

          </div>


          <div className="member-status-chart">


            <div className="member-status-number">

              <strong>
                {totalMembers}
              </strong>

              <span>
                Members
              </span>

            </div>


            <div className="member-status-list">


              <div className="status-item">

                <i className="status-dot paid" />

                <span>
                  Paid
                </span>

                <strong>
                  {
                    memberStatus.paid
                  }
                </strong>

              </div>


              <div className="status-item">

                <i className="status-dot partial" />

                <span>
                  Partial
                </span>

                <strong>
                  {
                    memberStatus.partial
                  }
                </strong>

              </div>


              <div className="status-item">

                <i className="status-dot pending" />

                <span>
                  Pending
                </span>

                <strong>
                  {
                    memberStatus.pending
                  }
                </strong>

              </div>

            </div>

          </div>

        </section>

      </div>


      {/* =================================================
          FINANCIAL OVERVIEW
      ================================================= */}

      <div className="dashboard-grid">


        {/* FINANCIAL */}

        <section className="dashboard-card">

          <div className="dashboard-card-header">

            <div>

              <h2>
                Financial Overview
              </h2>

              <p>
                जमा आणि खर्चाचा तुलनात्मक आढावा
              </p>

            </div>

          </div>


          <div className="financial-overview">


            <div className="financial-row">

              <div className="financial-label">

                <i className="financial-dot income" />

                <span>
                  Collection
                </span>

              </div>

              <strong className="green-text">

                ₹
                {money(
                  totalCollection
                )}

              </strong>

            </div>


            <div className="financial-row">

              <div className="financial-label">

                <i className="financial-dot expense" />

                <span>
                  Expense
                </span>

              </div>

              <strong className="red-text">

                ₹
                {money(
                  totalExpense
                )}

              </strong>

            </div>


            <div className="financial-divider" />


            <div className="financial-row total">

              <div className="financial-label">

                <i className="financial-dot balance" />

                <span>
                  Current Balance
                </span>

              </div>

              <strong
                className={
                  currentBalance >= 0
                    ? "green-text"
                    : "red-text"
                }
              >

                ₹
                {money(
                  Math.abs(
                    currentBalance
                  )
                )}

              </strong>

            </div>

          </div>

        </section>


        {/* PAYMENT MODE */}

        <section className="dashboard-card">

          <div className="dashboard-card-header">

            <div>

              <h2>
                Collection by Mode
              </h2>

              <p>
                Payment mode नुसार जमा रक्कम
              </p>

            </div>

          </div>


          <div className="payment-mode-dashboard">


            <div className="dashboard-mode-row">

              <div>

                <span className="mode-icon cash">
                  ₹
                </span>

                <span>
                  Cash
                </span>

              </div>

              <strong>

                ₹
                {money(
                  paymentModes.Cash
                )}

              </strong>

            </div>


            <div className="dashboard-mode-row">

              <div>

                <span className="mode-icon upi">
                  U
                </span>

                <span>
                  UPI
                </span>

              </div>

              <strong>

                ₹
                {money(
                  paymentModes.UPI
                )}

              </strong>

            </div>


            <div className="dashboard-mode-row">

              <div>

                <span className="mode-icon bank">
                  B
                </span>

                <span>
                  Bank
                </span>

              </div>

              <strong>

                ₹
                {money(
                  paymentModes.Bank
                )}

              </strong>

            </div>

          </div>

        </section>

      </div>


      {/* =================================================
          RECENT TRANSACTIONS
      ================================================= */}

      <section className="dashboard-card recent-transactions-card">


        <div className="dashboard-card-header">

          <div>

            <h2>
              Recent Transactions
            </h2>

            <p>
              अलीकडील जमा आणि खर्च
            </p>

          </div>


          <ReceiptText
            size={19}
            className="header-muted-icon"
          />

        </div>


        <div className="dashboard-transactions">


          {recentTransactions.length >
          0 ? (

            recentTransactions.map(
              (transaction) => (

                <div
  className="dashboard-transaction"
  key={`${transaction.type}-${transaction.id}`}
>


                  <div
                    className={
                      transaction.type ===
                      "Income"
                        ? "transaction-icon income"
                        : "transaction-icon expense"
                    }
                  >

                    {transaction.type ===
                    "Income" ? (

                      <ArrowDownLeft
                        size={16}
                      />

                    ) : (

                      <ArrowUpRight
                        size={16}
                      />

                    )}

                  </div>


                  <div className="transaction-info">

                    <strong>
                      {
                        transaction.title
                      }
                    </strong>

                    <span>
                      {
                        transaction.description
                      }
                    </span>

                  </div>


                  <div className="transaction-meta">

                    <span>
                      {
                        formatDate(
                          transaction.date
                        )
                      }
                    </span>

                    <small>
                      {
                        transaction.mode
                      }
                    </small>

                  </div>


                  <strong
                    className={
                      transaction.type ===
                      "Income"
                        ? "transaction-income"
                        : "transaction-expense"
                    }
                  >

                    {transaction.type ===
                    "Income"
                      ? "+"
                      : "-"}
                    ₹
                    {money(
                      transaction.amount
                    )}

                  </strong>

                </div>

              )
            )

          ) : (

            <div className="dashboard-empty">

              <ReceiptText
                size={35}
              />

              <strong>
                कोणतेही transactions नाहीत
              </strong>

              <span>
                Collection किंवा Expense add केल्यावर येथे दिसतील.
              </span>

            </div>

          )}

        </div>

      </section>


    </div>

  );

}


export default Dashboard;