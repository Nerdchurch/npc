import { createClient } from '@supabase/supabase-js';

// Use environment variables for security
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://jcpcvgqbadsknbisebcv.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpjcGN2Z3FiYWRza25iaXNlYmN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzNjQxMjAsImV4cCI6MjA3Njk0MDEyMH0.kiu0J42FM0TGb1Wja4jgRkEhGpFtf7zyvnd6mvbyePk';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase configuration. Please check your environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);