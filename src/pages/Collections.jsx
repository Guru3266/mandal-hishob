import { useEffect, useMemo, useState } from "react";

import {
  Plus,
  Search,
  IndianRupee,
  ReceiptText,
  Users,
  Trash2,
  Eye,
  RefreshCw,
  X,
} from "lucide-react";

import {
  getMembers,
  getCollections,
  addCollection,
  deleteCollection,
  getMemberSummary,
} from "../data/financialStore";

import ReceiptModal from "./ReceiptModal";

import "./Collections.css";


function Collections() {

  const [members, setMembers] =
    useState([]);

  const [collections, setCollections] =
    useState([]);

  const [showModal, setShowModal] =
    useState(false);

  const [selectedReceipt, setSelectedReceipt] =
    useState(null);

  const [search, setSearch] =
    useState("");

  const [modeFilter, setModeFilter] =
    useState("All");

  const [loading, setLoading] =
    useState(false);


  const emptyForm = {
    memberId: "",
    amount: "",
    mode: "Cash",
    date: new Date()
      .toISOString()
      .split("T")[0],
    remark: "",
  };


  const [formData, setFormData] =
    useState(emptyForm);


  /* =====================================================
     LOAD DATA
  ===================================================== */

  const loadData = () => {

    setLoading(true);

    setMembers(
      getMembers()
    );

    setCollections(
      [...getCollections()].sort(
        (a, b) =>
          new Date(b.date || 0) -
          new Date(a.date || 0)
      )
    );

    setLoading(false);

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


    return () => {

      window.removeEventListener(
        "mandal-data-updated",
        handleUpdate
      );

    };

  }, []);


  /* =====================================================
     MEMBER SUMMARY
  ===================================================== */

  const memberSummary =
    useMemo(
      () => getMemberSummary(),
      [members, collections]
    );


  /* =====================================================
     SELECTED MEMBER
  ===================================================== */

  const selectedMember =
    useMemo(() => {

      return memberSummary.find(
        (member) =>
          String(member.id) ===
          String(formData.memberId)
      );

    }, [
      memberSummary,
      formData.memberId,
    ]);


  /* =====================================================
     FILTER
  ===================================================== */

  const filteredCollections =
    useMemo(() => {

      const query =
        search
          .trim()
          .toLowerCase();


      return collections.filter(
        (collection) => {

          const matchesSearch =
            !query ||
            String(
              collection.receiptNo || ""
            )
              .toLowerCase()
              .includes(query) ||
            String(
              collection.memberName || ""
            )
              .toLowerCase()
              .includes(query) ||
            String(
              collection.mobile || ""
            )
              .includes(query);


          const matchesMode =
            modeFilter === "All" ||
            collection.mode ===
              modeFilter;


          return (
            matchesSearch &&
            matchesMode
          );

        }
      );

    }, [
      collections,
      search,
      modeFilter,
    ]);


  /* =====================================================
     SUMMARY
  ===================================================== */

  const totalCollection =
    collections.reduce(
      (
        total,
        item
      ) =>
        total +
        Number(
          item.amount || 0
        ),
      0
    );


  const filteredAmount =
    filteredCollections.reduce(
      (
        total,
        item
      ) =>
        total +
        Number(
          item.amount || 0
        ),
      0
    );


  /* =====================================================
     OPEN ADD MODAL
  ===================================================== */

  const openAddModal = () => {

    setFormData(
      emptyForm
    );

    setShowModal(
      true
    );

  };


  /* =====================================================
     CLOSE MODAL
  ===================================================== */

  const closeModal = () => {

    setShowModal(
      false
    );

    setFormData(
      emptyForm
    );

  };


  /* =====================================================
     INPUT CHANGE
  ===================================================== */

  const handleChange = (
    event
  ) => {

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


  /* =====================================================
     MEMBER CHANGE
  ===================================================== */

  const handleMemberChange = (
    event
  ) => {

    const memberId =
      event.target.value;


    setFormData(
      (previous) => ({
        ...previous,
        memberId,
        amount: "",
      })
    );

  };


  /* =====================================================
     SAVE COLLECTION
  ===================================================== */

  const handleSubmit = (
    event
  ) => {

    event.preventDefault();


    if (!formData.memberId) {

      alert(
        "कृपया वर्गणीदार निवडा."
      );

      return;

    }


    const amount =
      Number(
        formData.amount
      );


    if (
      !amount ||
      amount <= 0
    ) {

      alert(
        "कृपया योग्य जमा रक्कम भरा."
      );

      return;

    }


    if (!selectedMember) {

      alert(
        "Member सापडला नाही."
      );

      return;

    }


    if (
      amount >
      Number(
        selectedMember.pending || 0
      )
    ) {

      alert(
        `जमा रक्कम pending amount पेक्षा जास्त असू शकत नाही.\nPending: ₹${Number(
          selectedMember.pending
        ).toLocaleString(
          "en-IN"
        )}`
      );

      return;

    }


    try {

      const payment =
        addCollection({

          memberId:
            formData.memberId,

          amount,

          mode:
            formData.mode,

          date:
            formData.date,

          remark:
            formData.remark,

        });


      closeModal();

      loadData();


      /* OPEN RECEIPT */

      setTimeout(() => {

        setSelectedReceipt(
          payment
        );

      }, 100);


    } catch (error) {

      console.error(
        error
      );

      alert(
        error.message ||
        "Payment save करताना error आला."
      );

    }

  };


  /* =====================================================
     DELETE
  ===================================================== */

  const handleDelete = (
    collection
  ) => {

    const confirmed =
      window.confirm(
        `Receipt ${collection.receiptNo} delete करायची आहे का?`
      );


    if (!confirmed) {
      return;
    }


    try {

      deleteCollection(
        collection.id
      );

      loadData();

    } catch (error) {

      console.error(
        error
      );

      alert(
        "Receipt delete करताना error आला."
      );

    }

  };


  /* =====================================================
     VIEW RECEIPT
  ===================================================== */

  const viewReceipt = (
    collection
  ) => {

    setSelectedReceipt(
      collection
    );

  };


  /* =====================================================
     FORMAT DATE
  ===================================================== */

  const formatDate = (
    date
  ) => {

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


  /* =====================================================
     RETURN
  ===================================================== */

  return (

    <div className="collections-page">


      {/* =================================================
          HEADER
      ================================================= */}

      <div className="collections-header">

        <div>

          <h1>
            जमा रक्कम
          </h1>

          <p>
            वर्गणी आणि जमा रक्कम व्यवस्थापित करा
          </p>

        </div>


        <button
          className="add-collection-btn"
          onClick={
            openAddModal
          }
        >

          <Plus
            size={17}
          />

          जमा रक्कम नोंदवा

        </button>

      </div>


      {/* =================================================
          SUMMARY
      ================================================= */}

      <div className="collection-summary">


        <div className="collection-summary-card">

          <div className="collection-summary-icon green">

            <IndianRupee
              size={20}
            />

          </div>

          <div>

            <span>
              एकूण जमा
            </span>

            <strong>
              ₹
              {totalCollection.toLocaleString(
                "en-IN"
              )}
            </strong>

          </div>

        </div>


        <div className="collection-summary-card">

          <div className="collection-summary-icon blue">

            <ReceiptText
              size={20}
            />

          </div>

          <div>

            <span>
              एकूण पावत्या
            </span>

            <strong>
              {collections.length}
            </strong>

          </div>

        </div>


        <div className="collection-summary-card">

          <div className="collection-summary-icon orange">

            <Users
              size={20}
            />

          </div>

          <div>

            <span>
              Filtered Amount
            </span>

            <strong>
              ₹
              {filteredAmount.toLocaleString(
                "en-IN"
              )}
            </strong>

          </div>

        </div>

      </div>


      {/* =================================================
          FILTERS
      ================================================= */}

      <div className="collection-filter-card">


        <div className="collection-search">

          <Search
            size={17}
          />

          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            placeholder="Receipt No, वर्गणीदार किंवा Mobile search करा..."
          />

        </div>


        <select
          value={
            modeFilter
          }
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
          className="collection-refresh-btn"
          onClick={
            loadData
          }
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

      <div className="collection-table-card">


        <div className="collection-table-header">

          <div>

            <h2>
              जमा रक्कम Records
            </h2>

            <p>
              {filteredCollections.length}
              {" "}
              records found
            </p>

          </div>

        </div>


        {filteredCollections.length === 0 ? (

          <div className="collection-empty">

            <ReceiptText
              size={35}
            />

            <strong>
              कोणतीही जमा रक्कम सापडली नाही
            </strong>

            <span>
              नवीन payment नोंदवण्यासाठी
              "जमा रक्कम नोंदवा" वर क्लिक करा.
            </span>

          </div>

        ) : (

          <div className="collection-table-wrapper">

            <table className="collection-table">

              <thead>

                <tr>

                  <th>
                    Receipt No.
                  </th>

                  <th>
                    वर्गणीदार
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

                  <th>
                    Action
                  </th>

                </tr>

              </thead>


              <tbody>

                {filteredCollections.map(
                  (collection) => (

                    <tr
                      key={
                        collection.id
                      }
                    >

                      <td>

                        <span className="collection-receipt-no">

                          {
                            collection.receiptNo
                          }

                        </span>

                      </td>


                      <td>

                        <strong>
                          {
                            collection.memberName
                          }
                        </strong>

                        <small>
                          {
                            collection.mobile ||
                            "-"
                          }
                        </small>

                      </td>


                      <td>

                        <strong className="collection-amount">

                          ₹
                          {Number(
                            collection.amount
                          ).toLocaleString(
                            "en-IN"
                          )}

                        </strong>

                      </td>


                      <td>

                        <span
                          className={`collection-mode ${String(
                            collection.mode ||
                              "Cash"
                          ).toLowerCase()}`}
                        >

                          {
                            collection.mode ||
                            "Cash"
                          }

                        </span>

                      </td>


                      <td>

                        {
                          formatDate(
                            collection.date
                          )
                        }

                      </td>


                      <td>

                        <span className="collection-remark">

                          {
                            collection.remark ||
                            "-"
                          }

                        </span>

                      </td>


                      <td>

                        <div className="collection-actions">

                          <button
                            className="collection-view-btn"
                            onClick={() =>
                              viewReceipt(
                                collection
                              )
                            }
                            title="View Receipt"
                          >

                            <Eye
                              size={15}
                            />

                          </button>


                          <button
                            className="collection-delete-btn"
                            onClick={() =>
                              handleDelete(
                                collection
                              )
                            }
                            title="Delete"
                          >

                            <Trash2
                              size={15}
                            />

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
          ADD PAYMENT MODAL
      ================================================= */}

      {showModal && (

        <div
          className="collection-modal-overlay"
          onMouseDown={(event) => {

            if (
              event.target ===
              event.currentTarget
            ) {

              closeModal();

            }

          }}
        >

          <div className="collection-modal">


            {/* HEADER */}

            <div className="collection-modal-header">

              <div>

                <h2>
                  जमा रक्कम नोंदवा
                </h2>

                <p>
                  वर्गणीदाराची payment नोंदवा
                </p>

              </div>


              <button
                type="button"
                className="collection-close-btn"
                onClick={
                  closeModal
                }
              >

                <X
                  size={19}
                />

              </button>

            </div>


            {/* FORM */}

            <form
              className="collection-form"
              onSubmit={
                handleSubmit
              }
            >


              {/* MEMBER */}

              <div className="collection-form-group">

                <label>

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
                    handleMemberChange
                  }
                  required
                >

                  <option value="">
                    वर्गणीदार निवडा
                  </option>

                  {memberSummary
                    .filter(
                      (member) =>
                        Number(
                          member.pending
                        ) > 0
                    )
                    .map(
                      (member) => (

                        <option
                          key={
                            member.id
                          }
                          value={
                            member.id
                          }
                        >

                          {
                            member.name
                          }

                          {" — Pending ₹"}

                          {Number(
                            member.pending
                          ).toLocaleString(
                            "en-IN"
                          )}

                        </option>

                      )
                    )}

                </select>

              </div>


              {/* MEMBER INFO */}

              {selectedMember && (

                <div className="selected-member-info">

                  <div>

                    <span>
                      Expected
                    </span>

                    <strong>
                      ₹
                      {Number(
                        selectedMember.expected
                      ).toLocaleString(
                        "en-IN"
                      )}
                    </strong>

                  </div>


                  <div>

                    <span>
                      Collected
                    </span>

                    <strong className="green-text">
                      ₹
                      {Number(
                        selectedMember.collected
                      ).toLocaleString(
                        "en-IN"
                      )}
                    </strong>

                  </div>


                  <div>

                    <span>
                      Pending
                    </span>

                    <strong className="orange-text">
                      ₹
                      {Number(
                        selectedMember.pending
                      ).toLocaleString(
                        "en-IN"
                      )}
                    </strong>

                  </div>

                </div>

              )}


              {/* AMOUNT */}

              <div className="collection-form-group">

                <label>

                  जमा रक्कम

                  <span>
                    *
                  </span>

                </label>

                <div className="collection-amount-input">

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
                    max={
                      selectedMember
                        ? selectedMember.pending
                        : undefined
                    }
                    step="1"
                    placeholder="उदा. 1000"
                    required
                  />

                </div>


                {selectedMember && (

                  <small>

                    Maximum:

                    {" ₹"}

                    {Number(
                      selectedMember.pending
                    ).toLocaleString(
                      "en-IN"
                    )}

                  </small>

                )}

              </div>


              {/* MODE */}

              <div className="collection-form-group">

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

              <div className="collection-form-group">

                <label>
                  Payment Date
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

              <div className="collection-form-group">

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

              <div className="collection-modal-actions">

                <button
                  type="button"
                  className="collection-cancel-btn"
                  onClick={
                    closeModal
                  }
                >
                  Cancel
                </button>


                <button
                  type="submit"
                  className="collection-save-btn"
                >

                  <ReceiptText
                    size={15}
                  />

                  Save & Generate Receipt

                </button>

              </div>

            </form>

          </div>

        </div>

      )}


        {/* =================================================
          RECEIPT VIEW MODAL
      ================================================= */}

      {selectedReceipt && (
        <ReceiptModal
          payment={selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
        />
      )}

    </div>
  );
}

export default Collections;