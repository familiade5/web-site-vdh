// Conectado ao Supabase do CRM VDH
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Usando as credenciais do CRM VDH
const SUPABASE_URL = 'https://zpyxqnkhlhpcxbmrwuqp.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpweXhxbmtobGhwY3hibXJ3dXFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg0MDMzODIsImV4cCI6MjA4Mzk3OTM4Mn0.PR5cunQG3HTyAqZM2zXIoyBVD8P5aHnbt87PeL7k1TA';

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});