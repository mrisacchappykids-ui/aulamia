import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_STORAGE_SUPABASE_URL || "https://gnkdzyndnlyhnpnzpxrt.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_STORAGE_SUPABASE_ANON_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
