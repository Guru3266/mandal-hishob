import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  IndianRupee,
  Users,
  ArrowDownLeft,
  ArrowUpRight,
  Wallet,
  CheckCircle2,
  CalendarDays,
} from "lucide-react";

import "./Transparency.css";


/* =========================================================
   HELPERS
========================================================= */

function readStorage(key) {
  try {
    const data =
      localStorage.getItem(key);

    if (!data) {
      return [];
    }

    const parsed =
      JSON.parse(data);

    return Array.isArray(parsed)
      ? parsed
      : [];

  } catch (error) {

    console.error(
      `Unable to read ${key}`,
      error
    );

    return [];

  }
}


/* =========================================================
   AMOUNT
========================================================= */

function getAmount(value) {

  const number =
    Number(value);

  return Number.isFinite(number)
    ? number
    : 0;
}


/* =========================================================
   MONEY
========================================================= */

function money(value) {

  return getAmount(
    value
  )
    .toLocaleString(
      "en-IN"
    );

}


/* =========================================================
   SIGNED MONEY
========================================================= */

function signedMoney(value) {

  const amount =
    getAmount(value);

  if (amount < 0) {

    return `-₹${Math.abs(
      amount
    ).toLocaleString("en-IN")}`;

  }

  return `₹${amount.toLocaleString(
    "en-IN"
  )}`;

}


/* =========================================================
   DATE FORMAT
========================================================= */

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

    return String(
      dateValue
    );

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
   DATE SORT VALUE
========================================================= */

function getDateValue(value) {

  if (!value) {
    return 0;
  }


  const date =
    new Date(value);


  const time =
    date.getTime();


  return Number.isNaN(time)
    ? 0
    : time;

}


/* =========================================================
   TRANSPARENCY
========================================================= */

function Transparency() {

  const [
    members,
    setMembers,
  ] = useState([]);


  const [
    payments,
    setPayments,
  ] = useState([]);


  const [
    expenses,
    setExpenses,
  ] = useState([]);


  const [
    selectedMonth,
    setSelectedMonth,
  ] = useState("");


  /* =======================================================
     LOAD DATA
  ======================================================= */

  const loadData = () => {

    setMembers(
      readStorage(
        "mandal_members"
      )
    );


    setPayments(
      readStorage(
        "mandal_collections"
      )
    );


    setExpenses(
      readStorage(
        "mandal_expenses"
      )
    );

  };


  /* =======================================================
     INITIAL LOAD + LIVE UPDATE
  ======================================================= */

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


    const dateValue =
      item?.[dateField];


    if (!dateValue) {
      return false;
    }


    /*
      Expected month value:
      2026-08

      Date:
      2026-08-18
    */

    return String(
      dateValue
    ).startsWith(
      selectedMonth
    );

  };


  /* =======================================================
     FILTERED COLLECTIONS
  ======================================================= */

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


  /* =======================================================
     FILTERED EXPENSES
  ======================================================= */

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
     TOTAL COLLECTION
  ======================================================= */

  const totalCollection =
    filteredPayments.reduce(
      (
        total,
        payment
      ) => {

        return (
          total +
          getAmount(
            payment.amount
          )
        );

      },
      0
    );


  /* =======================================================
     TOTAL EXPENSE
  ======================================================= */

  const totalExpense =
    filteredExpenses.reduce(
      (
        total,
        expense
      ) => {

        return (
          total +
          getAmount(
            expense.amount
          )
        );

      },
      0
    );


  /* =======================================================
     BALANCE
  ======================================================= */

  const balance =
    totalCollection -
    totalExpense;


  /* =======================================================
     COLLECTION STATUS
  ======================================================= */

  const paidMembers =
    members.filter(
      (member) => {

        const expected =
          getAmount(
            member.expected
          );


        const paid =
          filteredPayments
            .filter(
              (payment) =>
                payment.memberId ===
                member.id
            )
            .reduce(
              (
                total,
                payment
              ) => {

                return (
                  total +
                  getAmount(
                    payment.amount
                  )
                );

              },
              0
            );


        return (
          expected > 0 &&
          paid >= expected
        );

      }
    ).length;


  const totalMembers =
    members.length;


  const collectionPercentage =
    totalMembers > 0
      ? Math.min(
          100,
          Math.round(
            (
              paidMembers /
              totalMembers
            ) * 100
          )
        )
      : 0;


  /* =======================================================
     PAYMENT MODES
  ======================================================= */

  const getPaymentMode = (
    payment
  ) => {

    return String(
      payment.mode ||
      payment.paymentMode ||
      "Cash"
    )
      .trim()
      .toLowerCase();

  };


  const cashCollection =
    filteredPayments
      .filter(
        (payment) =>
          getPaymentMode(
            payment
          ) === "cash"
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
          getPaymentMode(
            payment
          ) === "upi"
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
          getPaymentMode(
            payment
          ) === "bank"
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
    useMemo(() => {

      return [
        ...filteredPayments,
      ]
        .sort(
          (a, b) => {

            const dateDifference =
              getDateValue(
                b.date
              ) -
              getDateValue(
                a.date
              );


            if (
              dateDifference !== 0
            ) {

              return dateDifference;

            }


            return (
              String(
                b.id || ""
              ).localeCompare(
                String(
                  a.id || ""
                )
              )
            );

          }
        )
        .slice(
          0,
          5
        );

    }, [
      filteredPayments,
    ]);


  /* =======================================================
     RECENT EXPENSES
  ======================================================= */

  const recentExpenses =
    useMemo(() => {

      return [
        ...filteredExpenses,
      ]
        .sort(
          (a, b) => {

            const dateDifference =
              getDateValue(
                b.date
              ) -
              getDateValue(
                a.date
              );


            if (
              dateDifference !== 0
            ) {

              return dateDifference;

            }


            return (
              String(
                b.id || ""
              ).localeCompare(
                String(
                  a.id || ""
                )
              )
            );

          }
        )
        .slice(
          0,
          5
        );

    }, [
      filteredExpenses,
    ]);


  /* =======================================================
     CLEAR MONTH
  ======================================================= */

  const clearMonth = () => {

    setSelectedMonth("");

  };


  /* =======================================================
     RENDER
  ======================================================= */

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

          <CalendarDays
            size={16}
          />

          <input
            type="month"
            value={
              selectedMonth
            }
            onChange={(event) =>
              setSelectedMonth(
                event.target.value
              )
            }
          />


          {selectedMonth && (

            <button
              type="button"
              className="transparency-clear"
              onClick={
                clearMonth
              }
            >
              Clear
            </button>

          )}

        </div>

      </div>


      {/* =================================================
          HERO BALANCE
      ================================================= */}

      <div className="transparency-balance">

        <div className="transparency-balance-icon">

          <Wallet
            size={28}
          />

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

            {signedMoney(
              balance
            )}

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

              ₹
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

              ₹
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


        {/* PAYMENT MODE */}

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
                ₹
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
                ₹
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
                ₹
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
                ₹
                {money(
                  totalCollection
                )}
              </strong>

            </div>

          </div>

        </div>


        {/* FINANCIAL POSITION */}

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

                + ₹
                {money(
                  totalCollection
                )}

              </strong>

            </div>


            <div className="financial-position-row">

              <span>
                एकूण खर्च
              </span>

              <strong className="red-text">

                − ₹
                {money(
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

                {signedMoney(
                  balance
                )}

              </strong>

            </div>

          </div>

        </div>

      </div>


      {/* =================================================
          RECENT TRANSACTIONS
      ================================================= */}

      <div className="transparency-transactions">


        {/* =================================================
            COLLECTIONS
        ================================================= */}

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
                (
                  payment,
                  index
                ) => (

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

                          {
                            payment.memberName ||
                            payment.name ||
                            "वर्गणीदार"
                          }

                        </strong>


                        <span>

                          {formatDate(
                            payment.date
                          )}

                        </span>

                      </div>

                    </div>


                    <strong className="green-text">

                      + ₹
                      {money(
                        payment.amount
                      )}

                    </strong>

                  </div>

                )
              )

            )}

          </div>

        </div>


        {/* =================================================
            EXPENSES
        ================================================= */}

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
                (
                  expense,
                  index
                ) => (

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

                          {
                            expense.description ||
                            expense.category ||
                            "Expense"
                          }

                        </strong>


                        <span>

                          {
                            expense.category ||
                            "Other"
                          }

                          {" • "}

                          {formatDate(
                            expense.date
                          )}

                        </span>

                      </div>

                    </div>


                    <strong className="red-text">

                      − ₹
                      {money(
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