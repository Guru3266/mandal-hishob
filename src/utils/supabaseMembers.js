import { supabase } from "../lib/supabase";

// ============================================================
// GET CURRENT MANDAL
// ============================================================

const getMandalId = async () => {
  const { data, error } = await supabase
    .from("mandals")
    .select("id")
    .order("created_at", { ascending: true })
    .limit(1)
    .single();

  if (error) {
    console.error("Mandal fetch error:", error);
    throw error;
  }

  return data.id;
};

// ============================================================
// GENERATE MEMBER CODE
// ============================================================

const generateMemberCode = (members) => {
  const numbers = members
    .map((member) => {
      const match = String(member.member_code || "").match(
        /M-?(\d+)/
      );

      return match ? Number(match[1]) : 0;
    })
    .filter(Boolean);

  const next = Math.max(0, ...numbers) + 1;

  return `M-${String(next).padStart(3, "0")}`;
};

// ============================================================
// GET MEMBERS
// ============================================================

export const getMembers = async () => {
  const mandalId = await getMandalId();

  const { data, error } = await supabase
    .from("members")
    .select("*")
    .eq("mandal_id", mandalId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Members fetch error:", error);
    throw error;
  }

  return data || [];
};

// ============================================================
// GET MEMBER SUMMARY
// ============================================================

export const getMemberSummaryFromSupabase = async () => {
  const mandalId = await getMandalId();

  const { data: members, error: membersError } = await supabase
    .from("members")
    .select("*")
    .eq("mandal_id", mandalId)
    .order("created_at", { ascending: true });

  if (membersError) {
    console.error("Members fetch error:", membersError);
    throw membersError;
  }

  const { data: collections, error: collectionsError } =
    await supabase
      .from("collections")
      .select("member_id, amount")
      .eq("mandal_id", mandalId);

  if (collectionsError) {
    console.error("Collections fetch error:", collectionsError);
    throw collectionsError;
  }

  return (members || []).map((member) => {
    const collected = (collections || [])
      .filter(
        (collection) =>
          String(collection.member_id) === String(member.id)
      )
      .reduce(
        (total, collection) =>
          total + Number(collection.amount || 0),
        0
      );

    const expected = Number(member.expected_amount || 0);

    const pending = Math.max(expected - collected, 0);

    let status = "Pending";

    if (collected >= expected && expected > 0) {
      status = "Paid";
    } else if (collected > 0) {
      status = "Partial";
    }

    return {
  id: member.id,
  memberCode: member.member_code,
  name: member.name || "",
  mobile: member.mobile || "",
  address: member.address || "",
  area: member.area || "",

  expected,
  collected,
  pending,

  status,

  createdAt: member.created_at,
  updatedAt: member.updated_at,
};
  });
};

// ============================================================
// ADD MEMBER
// ============================================================

export const addMemberToSupabase = async (member) => {
  const mandalId = await getMandalId();

  // Get existing members to generate next member code
  const { data: existingMembers, error: fetchError } =
    await supabase
      .from("members")
      .select("member_code")
      .eq("mandal_id", mandalId);

  if (fetchError) {
    console.error("Member code fetch error:", fetchError);
    throw fetchError;
  }

  const memberCode = generateMemberCode(
    existingMembers || []
  );

  const { data, error } = await supabase
    .from("members")
    .insert({
      mandal_id: mandalId,
      member_code: memberCode,
      name: member.name,
      mobile: member.mobile || null,
address: member.address || null,
area: member.area || null,
expected_amount: Number(member.expected || 0),
      status: "active",
    })
    .select()
    .single();

  if (error) {
    console.error("Member insert error:", error);
    throw error;
  }

  return data;
};

// ============================================================
// UPDATE MEMBER
// ============================================================

export const updateMemberInSupabase = async (
  memberId,
  updates
) => {
  const { data, error } = await supabase
    .from("members")
    .update({
      name: updates.name,
      mobile: updates.mobile || null,
      address: updates.address || null,
area: updates.area || null,
expected_amount: Number(updates.expected || 0),
      updated_at: new Date().toISOString(),
    })
    .eq("id", memberId)
    .select()
    .single();

  if (error) {
    console.error("Member update error:", error);
    throw error;
  }

  return data;
};

// ============================================================
// DELETE MEMBER
// ============================================================

export const deleteMemberFromSupabase = async (memberId) => {
  const { error: collectionError } = await supabase
    .from("collections")
    .delete()
    .eq("member_id", memberId);

  if (collectionError) {
    console.error(
      "Member collections delete error:",
      collectionError
    );
    throw collectionError;
  }

  const { error: memberError } = await supabase
    .from("members")
    .delete()
    .eq("id", memberId);

  if (memberError) {
    console.error(
      "Member delete error:",
      memberError
    );
    throw memberError;
  }

  return true;
};