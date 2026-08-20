import { supabase } from "../lib/supabase";

// ============================================================
// GET CURRENT MANDAL
// ============================================================

const getMandalId = async () => {
  const { data, error } = await supabase
    .from("mandals")
    .select("id")
    .order("created_at", {
      ascending: true,
    })
    .limit(1)
    .single();

  if (error) {
    console.error(
      "Mandal fetch error:",
      error
    );
    throw error;
  }

  if (!data?.id) {
    throw new Error(
      "Mandal not found."
    );
  }

  return data.id;
};

// ============================================================
// GET SETTINGS
// ============================================================

export const getSettings = async () => {
  const mandalId =
    await getMandalId();

  const { data, error } = await supabase
    .from("mandals")
    .select(
      "id, name, tagline, address, mobile"
    )
    .eq("id", mandalId)
    .single();

  if (error) {
    console.error(
      "Settings fetch error:",
      error
    );
    throw error;
  }

  return {
    id: data.id,
    name: data.name || "",
    tagline: data.tagline || "",
    address: data.address || "",
    mobile: data.mobile || "",
  };
};

// ============================================================
// UPDATE SETTINGS
// ============================================================

export const updateSettings = async (
  settings
) => {
  const mandalId =
    await getMandalId();

  const name =
    String(
      settings?.name || ""
    ).trim();

  const tagline =
    String(
      settings?.tagline || ""
    ).trim();

  const address =
    String(
      settings?.address || ""
    ).trim();

  const mobile =
    String(
      settings?.mobile || ""
    )
      .replace(/\D/g, "")
      .slice(0, 10);

  // ==========================================================
  // VALIDATION
  // ==========================================================

  if (!name) {
    throw new Error(
      "कृपया मंडळाचे नाव भरा."
    );
  }

  if (
    mobile &&
    !/^\d{10}$/.test(mobile)
  ) {
    throw new Error(
      "कृपया 10 अंकी Mobile Number टाका."
    );
  }

  // ==========================================================
  // UPDATE SUPABASE
  // ==========================================================

  const { data, error } =
    await supabase
      .from("mandals")
      .update({
        name,
        tagline,
        address,
        mobile,
      })
      .eq("id", mandalId)
      .select(
        "id, name, tagline, address, mobile"
      )
      .single();

  if (error) {
    console.error(
      "Settings update error:",
      error
    );

    throw error;
  }

  return {
    id: data.id,
    name: data.name || "",
    tagline: data.tagline || "",
    address: data.address || "",
    mobile: data.mobile || "",
  };
};