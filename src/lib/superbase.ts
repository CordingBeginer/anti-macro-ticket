// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://aezicrrmxqylummyocnr.supabase.co"
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_7qxr403vHuriZdo4n1rxhQ_9u-FhgpR"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)