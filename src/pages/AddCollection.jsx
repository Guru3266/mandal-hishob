import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  X,
  User,
  IndianRupee,
  CalendarDays,
  CreditCard,
  FileText,
  CheckCircle2,
} from "lucide-react";

import {
  getMembers,
  getMemberCollectedAmount,
  getMemberBalance,
  addCollection,
} from "../data/financialStore";

import {
  getTodayDate,
} from "../data/financialStore";

import {
  getMandalConfig,
} from "../utils/mandalConfig";

import "./AddCollection.css";


function AddCollection({
  onClose,
  onSuccess,
}) {

  /* =====================================================
     DATA
  ===================================================== */

  const [
    members,
    setMembers,
  ] = useState([]);


  const [
    mandal,
    setMandal,
  ] = useState(
    getMandalConfig()
  );


  /* =====================================================
     FORM
  ===================================================== */

  const [
    formData,
    setFormData,
  ] = useState({
    memberId: "",
    amount: "",
    mode: "Cash",
    date: getTodayDate(),
    remark: "",
  });


  /* =====================================================
     STATE
  ===================================================== */

  const [
    saving,
    setSaving,
  ] = useState(false);


  const [
    error,
    setError,
  ] = useState("");


  /* =====================================================
     LOAD MEMBERS
  ===================================================== */

  const loadMembers = () => {

    setMembers(
      getMembers()
    );

    setMandal(
      getMandalConfig()
    );

  };


  useEffect(() => {

    loadMembers();


    const handleUpdate = () => {

      loadMembers();

    };


    window.addEventListener(
      "mandal-data-updated",
      handleUpdate
    );


    window.addEventListener(
      "mandal-settings-updated",
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

    };

  }, []);


  /* =====================================================
     SELECTED MEMBER
  ===================================================== */

  const selectedMember =
    useMemo(() => {

      return members.find(
        (member) =>
          String(member.id) ===
          String(formData.memberId)
      );

    }, [
      members,
      formData.memberId,
    ]);


  /* =====================================================
     MEMBER PAYMENT DETAILS
  ===================================================== */

  const paymentDetails =
    useMemo(() => {

      if (!selectedMember) {

        return {
          expected: 0,
          paid: 0,
          remaining: 0,
        };

      }


      const expected =
        Number(
          selectedMember.expected ||
          0
        );


      const paid =
        getMemberCollectedAmount(
          selectedMember.id
        );


      const remaining =
        getMemberBalance(
          selectedMember.id
        );


      return {
        expected,
        paid,
        remaining,
      };

    }, [selectedMember]);


  /* =====================================================
     HANDLE CHANGE
  ===================================================== */

  const handleChange = (e) => {

    const {
      name,
      value,
    } = e.target;


    setError("");


    setFormData(
      (previous) => ({
        ...previous,
        [name]: value,
      })
    );

  };


  /* =====================================================
     AMOUNT CHANGE
  ===================================================== */

  const handleAmountChange = (
    e
  ) => {

    const value =
      e.target.value;


    if (
      value === "" ||
      /^\d*\.?\d*$/.test(value)
    ) {

      setError("");


      setFormData(
        (previous) => ({
          ...previous,
          amount: value,
        })
      );

    }

  };


  /* =====================================================
     SET FULL REMAINING
  ===================================================== */

  const handleFullAmount = () => {

    setFormData(
      (previous) => ({
        ...previous,
        amount:
          paymentDetails.remaining,
      })
    );


    setError("");

  };


  /* =====================================================
     FORMAT MONEY
  ===================================================== */

  const money = (
    amount
  ) => {

    return Number(
      amount || 0
    ).toLocaleString(
      "en-IN"
    );

  };


  /* =====================================================
     SAVE
  ===================================================== */

  const handleSubmit = (
    e
  ) => {

    e.preventDefault();


    setError("");


    /* -------------------------------------------------
       MEMBER
    ------------------------------------------------- */

    if (!formData.memberId) {

      setError(
        "कृपया वर्गणीदार निवडा."
      );

      return;

    }


    /* -------------------------------------------------
       AMOUNT
    ------------------------------------------------- */

    const amount =
      Number(
        formData.amount
      );


    if (
      !amount ||
      amount <= 0
    ) {

      setError(
        "कृपया valid amount टाका."
      );

      return;

    }


    /* -------------------------------------------------
       REMAINING
    ------------------------------------------------- */

    if (
      amount >
      paymentDetails.remaining
    ) {

      setError(
        `Maximum ₹${money(
          paymentDetails.remaining
        )} जमा करू शकता.`
      );

      return;

    }


    /* -------------------------------------------------
       DATE
    ------------------------------------------------- */

    if (!formData.date) {

      setError(
        "कृपया payment date निवडा."
      );

      return;

    }


    try {

      setSaving(true);


      const newCollection =
        addCollection({

          memberId:
            formData.memberId,

          amount,

          mode:
            formData.mode,

          date:
            formData.date,

          remark:
            formData.remark.trim() ||
            "-",

        });


      /* -------------------------------------------------
         SUCCESS
      ------------------------------------------------- */

      if (onSuccess) {

        onSuccess(
          newCollection
        );

      }


      if (onClose) {

        onClose();

      }

    } catch (err) {

      console.error(
        "Collection save error:",
        err
      );


      setError(
        err?.message ||
        "Collection save करताना error आला."
      );

    } finally {

      setSaving(false);

    }

  };


  /* =====================================================
     RENDER
  ===================================================== */

  return (

    <div
      className="add-collection-overlay"
      onClick={onClose}
    >

      <div
        className="add-collection-modal"
        onClick={(e) =>
          e.stopPropagation()
        }
      >


        {/* =================================================
            HEADER
        ================================================= */}

        <div className="add-collection-header">

          <div>

            <h2>
              नवीन वर्गणी जमा
            </h2>

            <p>
              {mandal.name}
            </p>

          </div>


          <button
            type="button"
            className="add-collection-close"
            onClick={onClose}
          >

            <X size={20} />

          </button>

        </div>


        {/* =================================================
            FORM
        ================================================= */}

        <form
          onSubmit={handleSubmit}
        >


          {/* =================================================
              MEMBER
          ================================================= */}

          <div className="add-form-group">

            <label>

              <User size={15} />

              वर्गणीदार

              <span>
                *
              </span>

            </label>


            <select
              name="memberId"
              value={
                formData.memberId
              }
              onChange={
                handleChange
              }
            >

              <option value="">
                -- वर्गणीदार निवडा --
              </option>


              {members.map(
                (member) => (

                  <option
                    key={member.id}
                    value={member.id}
                  >

                    {member.name}
                    {" "}
                    ({member.id})

                  </option>

                )
              )}

            </select>

          </div>


          {/* =================================================
              MEMBER INFO
          ================================================= */}

          {selectedMember && (

            <div className="member-payment-info">

              <div>

                <span>
                  Expected
                </span>

                <strong>
                  ₹
                  {money(
                    paymentDetails.expected
                  )}
                </strong>

              </div>


              <div>

                <span>
                  Already Paid
                </span>

                <strong>
                  ₹
                  {money(
                    paymentDetails.paid
                  )}
                </strong>

              </div>


              <div className="remaining">

                <span>
                  Remaining
                </span>

                <strong>
                  ₹
                  {money(
                    paymentDetails.remaining
                  )}
                </strong>

              </div>

            </div>

          )}


          {/* =================================================
              AMOUNT
          ================================================= */}

          <div className="add-form-group">

            <div className="label-row">

              <label>

                <IndianRupee
                  size={15}
                />

                जमा रक्कम

                <span>
                  *
                </span>

              </label>


              {selectedMember &&
                paymentDetails.remaining >
                  0 && (

                <button
                  type="button"
                  className="full-amount-btn"
                  onClick={
                    handleFullAmount
                  }
                >
                  Full Amount
                </button>

              )}

            </div>


            <div className="amount-input">

              <span>
                ₹
              </span>

              <input
                type="text"
                inputMode="decimal"
                name="amount"
                value={
                  formData.amount
                }
                onChange={
                  handleAmountChange
                }
                placeholder="0"
              />

            </div>

          </div>


          {/* =================================================
              PAYMENT MODE
          ================================================= */}

          <div className="add-form-group">

            <label>

              <CreditCard
                size={15}
              />

              Payment Mode

            </label>


            <div className="payment-mode-options">


              <label
                className={
                  formData.mode ===
                  "Cash"
                    ? "mode-option active"
                    : "mode-option"
                }
              >

                <input
                  type="radio"
                  name="mode"
                  value="Cash"
                  checked={
                    formData.mode ===
                    "Cash"
                  }
                  onChange={
                    handleChange
                  }
                />

                <span>
                  Cash
                </span>

              </label>


              <label
                className={
                  formData.mode ===
                  "UPI"
                    ? "mode-option active"
                    : "mode-option"
                }
              >

                <input
                  type="radio"
                  name="mode"
                  value="UPI"
                  checked={
                    formData.mode ===
                    "UPI"
                  }
                  onChange={
                    handleChange
                  }
                />

                <span>
                  UPI
                </span>

              </label>


              <label
                className={
                  formData.mode ===
                  "Bank"
                    ? "mode-option active"
                    : "mode-option"
                }
              >

                <input
                  type="radio"
                  name="mode"
                  value="Bank"
                  checked={
                    formData.mode ===
                    "Bank"
                  }
                  onChange={
                    handleChange
                  }
                />

                <span>
                  Bank
                </span>

              </label>

            </div>

          </div>


          {/* =================================================
              DATE
          ================================================= */}

          <div className="add-form-group">

            <label>

              <CalendarDays
                size={15}
              />

              Payment Date

              <span>
                *
              </span>

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


          {/* =================================================
              REMARK
          ================================================= */}

          <div className="add-form-group">

            <label>

              <FileText
                size={15}
              />

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
              placeholder="उदा. Full payment / First installment"
              rows="3"
            />

          </div>


          {/* =================================================
              ERROR
          ================================================= */}

          {error && (

            <div className="collection-form-error">

              <span>
                !
              </span>

              {error}

            </div>

          )}


          {/* =================================================
              ACTIONS
          ================================================= */}

          <div className="add-collection-actions">

            <button
              type="button"
              className="add-collection-cancel"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>


            <button
              type="submit"
              className="add-collection-save"
              disabled={saving}
            >

              {saving ? (

                <>
                  Saving...
                </>

              ) : (

                <>
                  <CheckCircle2
                    size={17}
                  />

                  Save & Generate Receipt
                </>

              )}

            </button>

          </div>


        </form>

      </div>

    </div>

  );
}


export default AddCollection;