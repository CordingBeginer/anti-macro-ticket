import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://aezicrrmxqylummyocnr.supabase.co";
const supabaseKey = "sb_publishable_7qxr403vHuriZdo4n1rxhQ_9u-FhgpR"; 
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("user_id", "test-user-01")
    .order("created_at", { ascending: false });
  console.log("Data:", data);
  console.log("Error:", error);
}

test();
