// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://pgzjqmvqggwfuycouxnj.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnempxbXZxZ2d3ZnV5Y291eG5qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA4MzYzODEsImV4cCI6MjA1NjQxMjM4MX0.WSoETdcUJIPd8_RwsvsmOcaFDPU5VscunC38ewaePgA";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);