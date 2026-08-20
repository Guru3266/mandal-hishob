import { useEffect, useMemo, useState } from "react";

import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Users,
  IndianRupee,
  CheckCircle2,
  Clock3,
  X,
  RefreshCw,
} from "lucide-react";

import {
  getMemberSummaryFromSupabase,
  addMemberToSupabase,
  updateMemberInSupabase,
  deleteMemberFromSupabase,
} from "../utils/supabaseMembers";

import { isAdmin } from "../utils/permissions";

import "./Members.css";


function Members() {

  const admin = isAdmin();

  const [members, setMembers] =
    useState([]);

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("All");

  const [showModal, setShowModal] =
    useState(false);

  const [editingMember, setEditingMember] =
    useState(null);

  const [loading, setLoading] =
    useState(false);


  const emptyForm = {
  name: "",
  mobile: "",
  address: "",
  area: "",
  expected: "",
};

  const [formData, setFormData] =
    useState(emptyForm);


  /* =====================================================
     LOAD MEMBERS
  ===================================================== */

  const loadMembers = async () => {
  try {
    setLoading(true);

    const data = await getMemberSummaryFromSupabase();

    setMembers(data);
  } catch (error) {
    console.error("Load members error:", error);

    alert(
      error.message ||
        "वर्गणीदारांची माहिती load करताना error आला."
    );
  } finally {
    setLoading(false);
  }
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


    return () => {

      window.removeEventListener(
        "mandal-data-updated",
        handleUpdate
      );

    };

  }, []);


  /* =====================================================
     FILTER MEMBERS
  ===================================================== */

  const filteredMembers =
    useMemo(() => {

      const query =
        search
          .trim()
          .toLowerCase();


      return members.filter(
        (member) => {

          const matchesSearch =
            !query ||
            String(
              member.name || ""
            )
              .toLowerCase()
              .includes(query) ||
            String(
              member.mobile || ""
            )
              .includes(query) ||
            String(
              member.id || ""
            )
              .toLowerCase()
              .includes(query) ||
            String(
              member.address || ""
            )
              .toLowerCase()
              .includes(query);


          const matchesStatus =
            statusFilter === "All" ||
            member.status ===
              statusFilter;


          return (
            matchesSearch &&
            matchesStatus
          );

        }
      );

    }, [
      members,
      search,
      statusFilter,
    ]);


  /* =====================================================
     SUMMARY
  ===================================================== */

  const totalExpected =
    members.reduce(
      (
        total,
        member
      ) =>
        total +
        Number(
          member.expected || 0
        ),
      0
    );


  const totalCollected =
    members.reduce(
      (
        total,
        member
      ) =>
        total +
        Number(
          member.collected || 0
        ),
      0
    );


  const totalPending =
    members.reduce(
      (
        total,
        member
      ) =>
        total +
        Number(
          member.pending || 0
        ),
      0
    );


  const paidMembers =
    members.filter(
      (member) =>
        member.status === "Paid"
    ).length;


  const partialMembers =
    members.filter(
      (member) =>
        member.status === "Partial"
    ).length;


  const pendingMembers =
    members.filter(
      (member) =>
        member.status === "Pending"
    ).length;


  /* =====================================================
     OPEN ADD MODAL
  ===================================================== */

  const openAddModal = () => {

  if (!isAdmin()) {
    return;
  }

  setEditingMember(null);

  setFormData(emptyForm);

  setShowModal(true);
};


  /* =====================================================
     OPEN EDIT MODAL
  ===================================================== */

  const openEditModal = (member) => {

  if (!isAdmin()) {
    return;
  }

  setEditingMember(member);

  setFormData({
    name: member.name || "",
    mobile: member.mobile || "",
    address: member.address || "",
    area: member.area || "",
    expected: member.expected || "",
  });

  setShowModal(true);
};


  /* =====================================================
     CLOSE MODAL
  ===================================================== */

  const closeModal = () => {

    setShowModal(false);

    setEditingMember(null);

    setFormData(
      emptyForm
    );

  };


  /* =====================================================
     HANDLE INPUT
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
     SAVE MEMBER
  ===================================================== */

  const handleSubmit = async (event) => {

    event.preventDefault();


    const name =
      formData.name.trim();


    if (!name) {

      alert(
        "कृपया वर्गणीदाराचे नाव भरा."
      );

      return;

    }


    if (
      formData.mobile &&
      !/^\d{10}$/.test(
        formData.mobile
      )
    ) {

      alert(
        "कृपया 10 अंकी Mobile Number टाका."
      );

      return;

    }


    const expected =
      Number(
        formData.expected || 0
      );


    if (
      expected < 0
    ) {

      alert(
        "Expected amount योग्य भरा."
      );

      return;

    }


    try {

      if (editingMember) {
  await updateMemberInSupabase(
  editingMember.id,
  {
    name,
    mobile: formData.mobile,
    address: formData.address,
    area: formData.area,
    expected,
  }
);
} else {
  await addMemberToSupabase({
  name,
  mobile: formData.mobile,
  address: formData.address,
  area: formData.area,
  expected,
});
}


      closeModal();

      loadMembers();

    } catch (error) {

      console.error(
        error
      );

      alert(
        error.message ||
        "Member save करताना error आला."
      );

    }

  };


  /* =====================================================
     DELETE MEMBER
  ===================================================== */

 const handleDelete = async (member) => {

  if (!isAdmin()) {
    alert("तुम्हाला Delete करण्याची permission नाही.");
    return;
  }

  const confirmed = window.confirm(
    `${member.name} हा वर्गणीदार आणि त्याच्या सर्व जमा पावत्या delete करायच्या आहेत का?`
  );

  if (!confirmed) {
    return;
  }

  try {
    await deleteMemberFromSupabase(member.id);

    await loadMembers();

    alert(
      "वर्गणीदार आणि त्याच्या सर्व जमा पावत्या delete झाल्या."
    );

  } catch (error) {
    console.error(
      "Member delete error:",
      error
    );

    alert(
      error?.message ||
      "Member delete करताना error आला."
    );
  }
};

  /* =====================================================
     FORMAT MONEY
  ===================================================== */

  const money = (
    value
  ) =>
    Number(
      value || 0
    ).toLocaleString(
      "en-IN"
    );


  /* =====================================================
     RETURN
  ===================================================== */

  return (

    <div className="members-page">


      {/* =================================================
          HEADER
      ================================================= */}

      <div className="members-header">

        <div>

          <h1>
            वर्गणीदार
          </h1>

          <p>
            मंडळातील सर्व वर्गणीदार व्यवस्थापित करा
          </p>

        </div>


       {admin && (
  <button
    className="add-member-btn"
    onClick={openAddModal}
  >
    <Plus size={17} />
    वर्गणीदार जोडा
  </button>
)}

      </div>


      {/* =================================================
          SUMMARY CARDS
      ================================================= */}

      <div className="member-summary">


        <div className="member-summary-card">

          <div className="member-summary-icon blue">

            <Users
              size={20}
            />

          </div>

          <div>

            <span>
              एकूण वर्गणीदार
            </span>

            <strong>
              {members.length}
            </strong>

          </div>

        </div>


        <div className="member-summary-card">

          <div className="member-summary-icon orange">

            <IndianRupee
              size={20}
            />

          </div>

          <div>

            <span>
              Expected
            </span>

            <strong>
              ₹{money(
                totalExpected
              )}
            </strong>

          </div>

        </div>


        <div className="member-summary-card">

          <div className="member-summary-icon green">

            <CheckCircle2
              size={20}
            />

          </div>

          <div>

            <span>
              Collected
            </span>

            <strong>
              ₹{money(
                totalCollected
              )}
            </strong>

          </div>

        </div>


        <div className="member-summary-card">

          <div className="member-summary-icon red">

            <Clock3
              size={20}
            />

          </div>

          <div>

            <span>
              Pending
            </span>

            <strong>
              ₹{money(
                totalPending
              )}
            </strong>

          </div>

        </div>

      </div>


      {/* =================================================
          STATUS SUMMARY
      ================================================= */}

      <div className="member-status-row">

        <div className="status-item paid">

          <CheckCircle2
            size={15}
          />

          <span>
            Paid
          </span>

          <strong>
            {paidMembers}
          </strong>

        </div>


        <div className="status-item partial">

          <Clock3
            size={15}
          />

          <span>
            Partial
          </span>

          <strong>
            {partialMembers}
          </strong>

        </div>


        <div className="status-item pending">

          <Clock3
            size={15}
          />

          <span>
            Pending
          </span>

          <strong>
            {pendingMembers}
          </strong>

        </div>

      </div>


      {/* =================================================
          FILTER
      ================================================= */}

      <div className="member-filter-card">


        <div className="member-search">

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
            placeholder="नाव, Mobile, Member ID किंवा Address search करा..."
          />

        </div>


        <select
          value={
            statusFilter
          }
          onChange={(event) =>
            setStatusFilter(
              event.target.value
            )
          }
        >

          <option value="All">
            सर्व Status
          </option>

          <option value="Paid">
            Paid
          </option>

          <option value="Partial">
            Partial
          </option>

          <option value="Pending">
            Pending
          </option>

        </select>


        <button
          className="member-refresh-btn"
          onClick={
            loadMembers
          }
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

      <div className="member-table-card">


        <div className="member-table-header">

          <div>

            <h2>
              वर्गणीदार Records
            </h2>

            <p>
              {filteredMembers.length}
              {" "}
              records found
            </p>

          </div>

        </div>


        {filteredMembers.length === 0 ? (

          <div className="member-empty">

            <Users
              size={35}
            />

            <strong>
              कोणताही वर्गणीदार सापडला नाही
            </strong>

            <span>
              नवीन वर्गणीदार जोडण्यासाठी
              "वर्गणीदार जोडा" वर क्लिक करा.
            </span>

          </div>

        ) : (

          <div className="member-table-wrapper">

            <table className="member-table">

              <thead>

                <tr>

                  <th>
                    Member ID
                  </th>

                  <th>
                    वर्गणीदार
                  </th>

                  <th>
                    Mobile
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

                {filteredMembers.map(
                  (member) => (

                    <tr
                      key={
                        member.id
                      }
                    >

                      <td>

                        <span className="member-id">
  {member.memberCode}
</span>

                      </td>


                      <td>

                        <strong className="member-name">

                          {
                            member.name
                          }

                        </strong>

                        <small>

                          {
                            member.address ||
                            "-"
                          }

                        </small>

                      </td>


                      <td>

                        {
                          member.mobile ||
                          "-"
                        }

                      </td>


                      <td>

                        <strong>
                          ₹{money(
                            member.expected
                          )}
                        </strong>

                      </td>


                      <td>

                        <strong className="collected-amount">

                          ₹{money(
                            member.collected
                          )}

                        </strong>

                      </td>


                      <td>

                        <strong
                          className={
                            Number(
                              member.pending
                            ) > 0
                              ? "pending-amount"
                              : "zero-amount"
                          }
                        >

                          ₹{money(
                            member.pending
                          )}

                        </strong>

                      </td>


                      <td>

                        <span
                          className={`member-status ${String(
                            member.status ||
                              "Pending"
                          ).toLowerCase()}`}
                        >

                          {
                            member.status
                          }

                        </span>

                      </td>


                      <td>

                       <div className="member-actions">

  {admin && (
    <>
      <button
        className="member-edit-btn"
        onClick={() =>
          openEditModal(member)
        }
        title="Edit"
      >
        <Pencil size={15} />
      </button>

      <button
        className="member-delete-btn"
        onClick={() =>
          handleDelete(member)
        }
        title="Delete"
      >
        <Trash2 size={15} />
      </button>
    </>
  )}

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
          className="member-modal-overlay"
          onMouseDown={(event) => {

            if (
              event.target ===
              event.currentTarget
            ) {

              closeModal();

            }

          }}
        >

          <div className="member-modal">


            {/* HEADER */}

            <div className="member-modal-header">

              <div>

                <h2>

                  {editingMember
                    ? "वर्गणीदार Edit करा"
                    : "नवीन वर्गणीदार जोडा"}

                </h2>

                <p>

                  {editingMember
                    ? "Member information update करा"
                    : "वर्गणीदाराची माहिती भरा"}

                </p>

              </div>


              <button
                type="button"
                className="member-close-btn"
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
              className="member-form"
              onSubmit={
                handleSubmit
              }
            >


              {/* NAME */}

              <div className="member-form-group">

                <label>

                  वर्गणीदाराचे नाव

                  <span>
                    *
                  </span>

                </label>

                <input
                  type="text"
                  name="name"
                  value={
                    formData.name
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="उदा. Rahul Patil"
                  required
                />

              </div>


              {/* MOBILE */}

              <div className="member-form-group">

                <label>
                  Mobile Number
                </label>

                <input
                  type="tel"
                  name="mobile"
                  value={
                    formData.mobile
                  }
                  onChange={
                    handleChange
                  }
                  maxLength={10}
                  inputMode="numeric"
                  placeholder="10 अंकी Mobile Number"
                />

              </div>


              {/* ADDRESS */}

              <div className="member-form-group">

                <label>
                  Address
                </label>

                <input
                  type="text"
                  name="address"
                  value={
                    formData.address
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="उदा. Laxmi Nagar"
                />

              </div>
              <div className="member-form-group">
  <label>Area</label>

  <input
    type="text"
    name="area"
    value={formData.area}
    onChange={handleChange}
    placeholder="उदा. Laxmi Nagar"
  />
</div>


              {/* EXPECTED */}

              <div className="member-form-group">

                <label>

                  Expected वर्गणी

                  <span>
                    *
                  </span>

                </label>

                <div className="member-amount-input">

                  <span>
                    ₹
                  </span>

                  <input
                    type="number"
                    name="expected"
                    value={
                      formData.expected
                    }
                    onChange={
                      handleChange
                    }
                    min="0"
                    step="1"
                    placeholder="उदा. 2000"
                    required
                  />

                </div>

              </div>


              {/* ACTIONS */}

              <div className="member-modal-actions">

                <button
                  type="button"
                  className="member-cancel-btn"
                  onClick={
                    closeModal
                  }
                >
                  Cancel
                </button>


                <button
                  type="submit"
                  className="member-save-btn"
                >

                  {editingMember
                    ? "Update Member"
                    : "Save Member"}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>

  );

}


export default Members;