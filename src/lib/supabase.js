import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL;

const supabasePublishableKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

console.log(
  "SUPABASE URL EXISTS:",
  !!supabaseUrl
);

console.log(
  "SUPABASE KEY EXISTS:",
  !!supabasePublishableKey
);

if (!supabaseUrl || !supabasePublishableKey) {
  throw new Error(
    "Supabase environment variables are missing."
  );
}

export const supabase = createClient(
  supabaseUrl,
  supabasePublishableKey
);