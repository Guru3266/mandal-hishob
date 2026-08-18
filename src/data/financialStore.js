// ============================================================
// MANDAL HISHOB - CENTRAL FINANCIAL STORE
// ============================================================

const MEMBERS_KEY = "mandal_members";
const COLLECTIONS_KEY = "mandal_collections";
const EXPENSES_KEY = "mandal_expenses";


// ============================================================
// DEFAULT MEMBERS
// ============================================================

const defaultMembers = [
  {
    id: "M-001",
    name: "Rahul Patil",
    mobile: "9876543210",
    address: "Laxmi Nagar",
    expected: 2000,
  },
  {
    id: "M-002",
    name: "Amit Shinde",
    mobile: "9876543211",
    address: "Shivaji Nagar",
    expected: 1500,
  },
  {
    id: "M-003",
    name: "Akshay Jadhav",
    mobile: "9876543212",
    address: "Ganesh Nagar",
    expected: 2500,
  },
  {
    id: "M-004",
    name: "yash ambre",
    mobile: "8554556669",
    address: "nandu nagar",
    expected: 2000,
  },
];


// ============================================================
// DEFAULT COLLECTIONS
// ============================================================

const defaultCollections = [
  {
    id: "RCP-00001",
    receiptNo: "RCP-00001",
    memberId: "M-001",
    memberName: "Rahul Patil",
    mobile: "9876543210",
    amount: 2000,
    mode: "Cash",
    date: "2026-08-17",
    remark: "Full payment",
  },
  {
    id: "RCP-00002",
    receiptNo: "RCP-00002",
    memberId: "M-002",
    memberName: "Amit Shinde",
    mobile: "9876543211",
    amount: 500,
    mode: "Cash",
    date: "2026-08-17",
    remark: "",
  },
];


// ============================================================
// DEFAULT EXPENSES
// ============================================================

const defaultExpenses = [
  {
    id: "EXP-001",
    category: "Prasad",
    description: "Ganpati Mandap Prasad",
    amount: 20000,
    mode: "Cash",
    date: "2026-08-17",
    remark: "",
  },
  {
    id: "EXP-002",
    category: "Decoration",
    description: "Mandal Decoration",
    amount: 15000,
    mode: "Cash",
    date: "2026-08-17",
    remark: "",
  },
  {
    id: "EXP-003",
    category: "Sound",
    description: "Sound System",
    amount: 12000,
    mode: "Cash",
    date: "2026-08-17",
    remark: "",
  },
  {
    id: "EXP-004",
    category: "Lighting",
    description: "Lighting Setup",
    amount: 8500,
    mode: "Cash",
    date: "2026-08-17",
    remark: "",
  },
];


// ============================================================
// HELPERS
// ============================================================

const readData = (
  key,
  fallback = []
) => {

  try {

    const stored =
      localStorage.getItem(key);

    if (!stored) {
      return fallback;
    }

    const parsed =
      JSON.parse(stored);

    return Array.isArray(parsed)
      ? parsed
      : fallback;

  } catch (error) {

    console.error(
      `Error reading ${key}:`,
      error
    );

    return fallback;
  }
};


const writeData = (
  key,
  data
) => {

  localStorage.setItem(
    key,
    JSON.stringify(data)
  );

};


// ============================================================
// UPDATE EVENT
// ============================================================

const notifyDataUpdated = () => {

  window.dispatchEvent(
    new Event(
      "mandal-data-updated"
    )
  );

};


// ============================================================
// TODAY DATE
// ============================================================

export const getTodayDate = () => {

  const today =
    new Date();

  const year =
    today.getFullYear();

  const month =
    String(
      today.getMonth() + 1
    ).padStart(
      2,
      "0"
    );

  const day =
    String(
      today.getDate()
    ).padStart(
      2,
      "0"
    );

  return `${year}-${month}-${day}`;
};


// ============================================================
// INITIALIZE
// ============================================================

export const initializeFinancialStore = () => {

  if (
    !localStorage.getItem(
      MEMBERS_KEY
    )
  ) {

    writeData(
      MEMBERS_KEY,
      defaultMembers
    );

  }


  if (
    !localStorage.getItem(
      COLLECTIONS_KEY
    )
  ) {

    writeData(
      COLLECTIONS_KEY,
      defaultCollections
    );

  }


  if (
    !localStorage.getItem(
      EXPENSES_KEY
    )
  ) {

    writeData(
      EXPENSES_KEY,
      defaultExpenses
    );

  }

};


// ============================================================
// MEMBERS
// ============================================================

export const getMembers = () => {

  const central =
    localStorage.getItem(
      MEMBERS_KEY
    );


  if (central) {

    try {

      const parsed =
        JSON.parse(central);

      if (
        Array.isArray(parsed)
      ) {

        return parsed;

      }

    } catch (error) {

      console.error(
        "Central members error:",
        error
      );

    }

  }


  // ==========================================================
  // MIGRATE OLD MEMBERS DATA
  // ==========================================================

  const old =
    localStorage.getItem(
      "mandalMembers"
    );


  if (old) {

    try {

      const parsed =
        JSON.parse(old);

      if (
        Array.isArray(parsed)
      ) {

        writeData(
          MEMBERS_KEY,
          parsed
        );

        return parsed;

      }

    } catch (error) {

      console.error(
        "Old members migration error:",
        error
      );

    }

  }


  writeData(
    MEMBERS_KEY,
    defaultMembers
  );

  return defaultMembers;

};


// ============================================================
// SAVE MEMBERS
// ============================================================

export const saveMembers = (
  members
) => {

  writeData(
    MEMBERS_KEY,
    members
  );

  notifyDataUpdated();

};


// ============================================================
// GENERATE MEMBER ID
// ============================================================

const generateMemberId = () => {

  const members =
    getMembers();

  const numbers =
    members.map(
      (member) => {

        const match =
          String(
            member.id || ""
          ).match(
            /M-(\d+)/
          );

        return match
          ? Number(match[1])
          : 0;

      }
    );


  const next =
    Math.max(
      0,
      ...numbers
    ) + 1;


  return `M-${String(
    next
  ).padStart(
    3,
    "0"
  )}`;

};


// ============================================================
// ADD MEMBER
// ============================================================

export const addMember = (
  member
) => {

  const members =
    getMembers();


  const newMember = {

    id:
      member.id ||
      generateMemberId(),

    name:
      member.name || "",

    mobile:
      member.mobile || "",

    address:
      member.address || "",

    expected:
      Number(
        member.expected || 0
      ),

    createdAt:
      new Date().toISOString(),

  };


  members.push(
    newMember
  );


  saveMembers(
    members
  );


  return newMember;

};


// ============================================================
// UPDATE MEMBER
// ============================================================

export const updateMember = (
  memberId,
  updates
) => {

  const members =
    getMembers();


  const updated =
    members.map(
      (member) =>
        String(member.id) ===
        String(memberId)
          ? {
              ...member,
              ...updates,

              expected:
                Number(
                  updates.expected ??
                  member.expected ??
                  0
                ),
            }
          : member
    );


  saveMembers(
    updated
  );


  return updated.find(
    (member) =>
      String(member.id) ===
      String(memberId)
  );

};


// ============================================================
// DELETE MEMBER
// ============================================================

export const deleteMember = (
  memberId
) => {

  const members =
    getMembers();

  const updated =
    members.filter(
      (member) =>
        String(member.id) !==
        String(memberId)
    );


  saveMembers(
    updated
  );


  return true;

};


// ============================================================
// COLLECTIONS
// ============================================================

export const getCollections = () => {

  const central =
    localStorage.getItem(
      COLLECTIONS_KEY
    );


  if (central) {
  try {
    const parsed =
      JSON.parse(central);

    if (
      Array.isArray(parsed)
    ) {

      let nextReceiptNumber = 1;

      const updatedCollections =
        parsed.map((item) => {

          const existingReceipt =
            item.receiptNo ||
            item.receiptNumber ||
            (
              String(item.id || "").startsWith("RCP-")
                ? item.id
                : null
            );

          if (existingReceipt) {

            const match =
              String(existingReceipt).match(
                /RCP-(\d+)/
              );

            if (match) {
              nextReceiptNumber =
                Math.max(
                  nextReceiptNumber,
                  Number(match[1]) + 1
                );
            }

            return {
              ...item,
              id:
                item.id ||
                existingReceipt,
              receiptNo:
                existingReceipt,
              receiptNumber:
                existingReceipt,
            };
          }

          const newReceipt =
            `RCP-${String(
              nextReceiptNumber
            ).padStart(5, "0")}`;

          nextReceiptNumber++;

          return {
            ...item,

            id: newReceipt,

            receiptNo:
              newReceipt,

            receiptNumber:
              newReceipt,
          };

        });

      localStorage.setItem(
        COLLECTIONS_KEY,
        JSON.stringify(
          updatedCollections
        )
      );

      return updatedCollections;
    }

  } catch (error) {

    console.error(
      "Central collections error:",
      error
    );

  }
}


  // ==========================================================
  // MIGRATE OLD mandalPayments
  // ==========================================================

  const oldPayments =
    localStorage.getItem(
      "mandalPayments"
    );


  if (oldPayments) {

    try {

      const parsed =
        JSON.parse(
          oldPayments
        );


      if (
        Array.isArray(parsed)
      ) {

        const migrated =
          parsed.map(
            (
              payment,
              index
            ) => {

              const receipt =
                payment.receiptNumber ||
                payment.receiptNo ||
                payment.id ||
                `RCP-${String(
                  index + 1
                ).padStart(
                  5,
                  "0"
                )}`;


              return {

                id:
                  receipt,

                receiptNo:
                  receipt,

                memberId:
                  payment.memberId ||
                  "",

                memberName:
                  payment.memberName ||
                  "",

                mobile:
                  payment.mobile ||
                  "",

                amount:
                  Number(
                    payment.amount ||
                    0
                  ),

                mode:
                  payment.mode ||
                  "Cash",

                date:
                  payment.date ||
                  getTodayDate(),

                remark:
                  payment.remark ||
                  "-",

              };

            }
          );


        writeData(
          COLLECTIONS_KEY,
          migrated
        );


        return migrated;

      }

    } catch (error) {

      console.error(
        "Payment migration error:",
        error
      );

    }

  }


  writeData(
    COLLECTIONS_KEY,
    defaultCollections
  );


  return defaultCollections;

};


// ============================================================
// SAVE COLLECTIONS
// ============================================================

export const saveCollections = (
  collections
) => {

  writeData(
    COLLECTIONS_KEY,
    collections
  );

  notifyDataUpdated();

};


// ============================================================
// GENERATE RECEIPT ID
// ============================================================

const generateReceiptId = () => {

  const collections =
    getCollections();


  const numbers =
    collections.map(
      (item) => {

        const match =
          String(
            item.id || ""
          ).match(
            /RCP-(\d+)/
          );

        return match
          ? Number(match[1])
          : 0;

      }
    );


  const next =
    Math.max(
      0,
      ...numbers
    ) + 1;


  return `RCP-${String(
    next
  ).padStart(
    5,
    "0"
  )}`;

};


// ============================================================
// MEMBER COLLECTION TOTAL
// ============================================================

export const getMemberCollectedAmount = (
  memberId
) => {

  return getCollections()
    .filter(
      (item) =>
        String(
          item.memberId
        ) ===
        String(
          memberId
        )
    )
    .reduce(
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

};


// ============================================================
// MEMBER BALANCE
// ============================================================

export const getMemberBalance = (
  memberId
) => {

  const members =
    getMembers();


  const member =
    members.find(
      (item) =>
        String(
          item.id
        ) ===
        String(
          memberId
        )
    );


  if (!member) {
    return 0;
  }


  const expected =
    Number(
      member.expected || 0
    );


  const collected =
    getMemberCollectedAmount(
      memberId
    );


  return Math.max(
    expected -
      collected,
    0
  );

};


// ============================================================
// ADD COLLECTION
// ============================================================

export const addCollection = (
  payment
) => {

  const collections =
    getCollections();

  const members =
    getMembers();

  const member =
    members.find(
      (item) =>
        String(item.id) ===
        String(payment.memberId)
    );

  if (!member) {
    throw new Error(
      "Member not found"
    );
  }

  const amount =
    Number(payment.amount || 0);

  if (
    !amount ||
    amount <= 0
  ) {
    throw new Error(
      "Payment amount must be greater than 0"
    );
  }

  const remaining =
    getMemberBalance(
      payment.memberId
    );

  if (
    amount > remaining
  ) {
    throw new Error(
      `Payment cannot be greater than remaining amount ₹${remaining}`
    );
  }

  /* =========================================
     RECEIPT NUMBER
  ========================================= */

  const receiptNo =
    payment.receiptNo ||
    payment.receiptNumber ||
    generateReceiptId();

  /* =========================================
     NEW COLLECTION
  ========================================= */

  const newCollection = {

    id: receiptNo,

    receiptNo: receiptNo,

    receiptNumber: receiptNo,

    memberId:
      payment.memberId,

    memberName:
      member.name,

    mobile:
      payment.mobile ||
      member.mobile ||
      "",

    amount,

    mode:
      payment.mode ||
      "Cash",

    date:
      payment.date ||
      getTodayDate(),

    remark:
      payment.remark ||
      "-",

    createdAt:
      new Date().toISOString(),

  };

  collections.push(
    newCollection
  );

  saveCollections(
    collections
  );

  return newCollection;

};

// ============================================================
// UPDATE COLLECTION
// ============================================================

export const updateCollection = (
  collectionId,
  updates
) => {

  const collections =
    getCollections();


  /* ==========================================================
     FIND EXISTING COLLECTION
  ========================================================== */

  const existingCollection =
    collections.find(
      (collection) =>
        String(collection.id) ===
        String(collectionId)
    );


  if (!existingCollection) {

    throw new Error(
      "Collection not found"
    );

  }


  /* ==========================================================
     FIND MEMBER
  ========================================================== */

  const members =
    getMembers();


  const member =
    members.find(
      (item) =>
        String(item.id) ===
        String(
          updates.memberId ??
          existingCollection.memberId
        )
    );


  if (!member) {

    throw new Error(
      "Member not found"
    );

  }


  /* ==========================================================
     UPDATED AMOUNT
  ========================================================== */

  const newAmount =
    Number(
      updates.amount ??
      existingCollection.amount ??
      0
    );


  if (
    !newAmount ||
    newAmount <= 0
  ) {

    throw new Error(
      "Payment amount must be greater than 0"
    );

  }


  /* ==========================================================
     EXPECTED AMOUNT
  ========================================================== */

  const expected =
    Number(
      member.expected || 0
    );


  /* ==========================================================
     OTHER COLLECTIONS
     
     IMPORTANT:
     Existing collection स्वतःच्या calculation मधून
     exclude केली आहे.
  ========================================================== */

  const otherCollected =
    collections
      .filter(
        (collection) =>
          String(
            collection.memberId
          ) ===
            String(member.id) &&
          String(
            collection.id
          ) !==
            String(collectionId)
      )
      .reduce(
        (
          total,
          collection
        ) =>
          total +
          Number(
            collection.amount || 0
          ),
        0
      );


  /* ==========================================================
     REMAINING AMOUNT AFTER EXCLUDING OLD PAYMENT
  ========================================================== */

  const remainingForUpdate =
    Math.max(
      expected -
      otherCollected,
      0
    );


  /* ==========================================================
     VALIDATE NEW PAYMENT
  ========================================================== */

  if (
    newAmount >
    remainingForUpdate
  ) {

    throw new Error(
      `Payment cannot be greater than remaining amount ₹${remainingForUpdate}`
    );

  }


  /* ==========================================================
     UPDATE COLLECTION
  ========================================================== */

  const updated =
    collections.map(
      (collection) => {

        if (
          String(
            collection.id
          ) !==
          String(collectionId)
        ) {

          return collection;

        }


        return {

          ...collection,

          ...updates,

          /* Keep original ID */

          id:
            collection.id,


          /* Receipt number should not change */

          receiptNo:
            collection.receiptNo ||
            collection.id,


          /* Member information */

          memberId:
            member.id,

          memberName:
            member.name,

          mobile:
            updates.mobile ??
            member.mobile ??
            collection.mobile ??
            "",


          /* Payment */

          amount:
            newAmount,


          mode:
            updates.mode ??
            collection.mode ??
            "Cash",


          date:
            updates.date ??
            collection.date ??
            getTodayDate(),


          remark:
            updates.remark ??
            collection.remark ??
            "-",


          updatedAt:
            new Date().toISOString(),

        };

      }
    );


  /* ==========================================================
     SAVE
  ========================================================== */

  saveCollections(
    updated
  );


  /* ==========================================================
     RETURN UPDATED COLLECTION
  ========================================================== */

  return updated.find(
    (collection) =>
      String(
        collection.id
      ) ===
      String(collectionId)
  );

};

// ============================================================
// DELETE COLLECTION
// ============================================================

export const deleteCollection = (
  collectionId
) => {

  const collections =
    getCollections();


  const updated =
    collections.filter(
      (collection) =>
        String(collection.id) !==
        String(collectionId)
    );


  saveCollections(
    updated
  );


  return true;

};


// ============================================================
// COLLECTION BY MODE
// ============================================================

export const getCollectionByMode = () => {

  const collections =
    getCollections();


  const result = {

    Cash: 0,

    UPI: 0,

    Bank: 0,

  };


  collections.forEach(
    (item) => {

      const mode =
        item.mode ||
        "Cash";


      if (
        Object.prototype.hasOwnProperty.call(
          result,
          mode
        )
      ) {

        result[mode] +=
          Number(
            item.amount || 0
          );

      }

    }
  );


  return result;

};


// ============================================================
// TOTAL COLLECTION
// ============================================================

export const getTotalCollection = () => {

  return getCollections()
    .reduce(
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

};


// ============================================================
// EXPENSES
// ============================================================

export const getExpenses = () => {

  return readData(
    EXPENSES_KEY,
    defaultExpenses
  );

};


// ============================================================
// SAVE EXPENSES
// ============================================================

export const saveExpenses = (
  expenses
) => {

  writeData(
    EXPENSES_KEY,
    expenses
  );

  notifyDataUpdated();

};


// ============================================================
// GENERATE EXPENSE ID
// ============================================================

const generateExpenseId = () => {

  const expenses =
    getExpenses();


  const numbers =
    expenses.map(
      (expense) => {

        const match =
          String(
            expense.id || ""
          ).match(
            /EXP-(\d+)/
          );


        return match
          ? Number(match[1])
          : 0;

      }
    );


  const next =
    Math.max(
      0,
      ...numbers
    ) + 1;


  return `EXP-${String(
    next
  ).padStart(
    3,
    "0"
  )}`;

};


// ============================================================
// ADD EXPENSE
// ============================================================

export const addExpense = (
  expense
) => {

  const expenses =
    getExpenses();


  const amount =
    Number(
      expense.amount || 0
    );


  if (
    !amount ||
    amount <= 0
  ) {

    throw new Error(
      "Expense amount must be greater than 0"
    );

  }


  const newExpense = {

    id:
      expense.id ||
      generateExpenseId(),

    category:
      expense.category ||
      "Other",

    description:
      expense.description ||
      "",

    amount,

    mode:
      expense.mode ||
      "Cash",

    date:
      expense.date ||
      getTodayDate(),

    remark:
      expense.remark ||
      "-",

    createdAt:
      new Date().toISOString(),

  };


  expenses.push(
    newExpense
  );


  saveExpenses(
    expenses
  );


  return newExpense;

};


// ============================================================
// UPDATE EXPENSE
// ============================================================

export const updateExpense = (
  expenseId,
  updates
) => {

  const expenses =
    getExpenses();


  const existingExpense =
    expenses.find(
      (expense) =>
        String(expense.id) ===
        String(expenseId)
    );


  if (!existingExpense) {

    throw new Error(
      "Expense not found"
    );

  }


  const amount =
    Number(
      updates.amount ??
      existingExpense.amount ??
      0
    );


  if (
    !amount ||
    amount <= 0
  ) {

    throw new Error(
      "Expense amount must be greater than 0"
    );

  }


  const updatedExpenses =
    expenses.map(
      (expense) => {

        if (
          String(expense.id) !==
          String(expenseId)
        ) {

          return expense;

        }


        return {

          ...expense,

          ...updates,

          id:
            expense.id,

          category:
            updates.category ??
            expense.category ??
            "Other",

          description:
            updates.description ??
            expense.description ??
            "",

          amount,

          mode:
            updates.mode ??
            expense.mode ??
            "Cash",

          date:
            updates.date ??
            expense.date ??
            getTodayDate(),

          remark:
            updates.remark ??
            expense.remark ??
            "-",

          updatedAt:
            new Date().toISOString(),

        };

      }
    );


  saveExpenses(
    updatedExpenses
  );


  return updatedExpenses.find(
    (expense) =>
      String(expense.id) ===
      String(expenseId)
  );

};


// ============================================================
// DELETE EXPENSE
// ============================================================

export const deleteExpense = (
  expenseId
) => {

  const expenses =
    getExpenses();


  const updatedExpenses =
    expenses.filter(
      (expense) =>
        String(expense.id) !==
        String(expenseId)
    );


  saveExpenses(
    updatedExpenses
  );


  return true;

};


// ============================================================
// TOTAL EXPENSE
// ============================================================

export const getTotalExpense = () => {

  return getExpenses()
    .reduce(
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

};


// ============================================================
// CURRENT BALANCE
// ============================================================

export const getCurrentBalance = () => {

  return (
    getTotalCollection() -
    getTotalExpense()
  );

};


// ============================================================
// TOTAL EXPECTED
// ============================================================

export const getTotalExpected = () => {

  return getMembers()
    .reduce(
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

};


// ============================================================
// TOTAL PENDING
// ============================================================

export const getTotalPending = () => {

  return getMembers()
    .reduce(
      (
        total,
        member
      ) =>
        total +
        getMemberBalance(
          member.id
        ),
      0
    );

};


// ============================================================
// TOTAL MEMBERS
// ============================================================

export const getTotalMembers = () => {

  return getMembers().length;

};


// ============================================================
// MEMBER SUMMARY
// ============================================================

export const getMemberSummary = () => {

  const members =
    getMembers();


  return members.map(
    (member) => {

      const expected =
        Number(
          member.expected || 0
        );


      const collected =
        getMemberCollectedAmount(
          member.id
        );


      const pending =
        Math.max(
          expected -
          collected,
          0
        );


      let status =
        "Pending";


      if (
        collected >=
        expected &&
        expected > 0
      ) {

        status =
          "Paid";

      } else if (
        collected > 0
      ) {

        status =
          "Partial";

      }


      return {

        ...member,

        collected,

        pending,

        status,

      };

    }
  );

};


// ============================================================
// FINANCIAL SUMMARY
// ============================================================

export const getFinancialSummary = () => {

  const totalMembers =
    getTotalMembers();


  const totalExpected =
    getTotalExpected();


  const totalCollection =
    getTotalCollection();


  const totalExpense =
    getTotalExpense();


  const currentBalance =
    totalCollection -
    totalExpense;


  const totalPending =
    getTotalPending();


  const totalTransactions =
    getCollections().length +
    getExpenses().length;


  return {

    totalMembers,

    totalExpected,

    totalCollection,

    totalExpense,

    currentBalance,

    totalPending,

    totalTransactions,

  };

};


// ============================================================
// ALL TRANSACTIONS
// ============================================================

export const getTransactions = () => {

  const collections =
    getCollections();


  const expenses =
    getExpenses();


  const income =
    collections.map(
      (item) => ({

        id:
          item.id,

        type:
          "Income",

        transaction:
          item.receiptNo ||
          item.id,

        memberId:
          item.memberId,

        description:
          item.remark ||
          "-",

        name:
          item.memberName,

        amount:
          Number(
            item.amount || 0
          ),

        mode:
          item.mode,

        date:
          item.date,

      })
    );


  const expense =
    expenses.map(
      (item) => ({

        id:
          item.id,

        type:
          "Expense",

        transaction:
          item.id,

        memberId:
          "",

        description:
          item.description ||
          "-",

        name:
          item.category,

        amount:
          Number(
            item.amount || 0
          ),

        mode:
          item.mode,

        date:
          item.date,

      })
    );


  return [

    ...income,

    ...expense,

  ].sort(
    (a, b) => {

      const dateA =
        new Date(
          a.date || 0
        );

      const dateB =
        new Date(
          b.date || 0
        );


      return (
        dateB - dateA
      );

    }
  );

};


// ============================================================
// RESET FINANCIAL STORE
// ============================================================

export const resetFinancialStore = () => {

  localStorage.removeItem(
    MEMBERS_KEY
  );

  localStorage.removeItem(
    COLLECTIONS_KEY
  );

  localStorage.removeItem(
    EXPENSES_KEY
  );

  initializeFinancialStore();

  notifyDataUpdated();

};


// ============================================================
// INITIALIZE STORE
// ============================================================

initializeFinancialStore();