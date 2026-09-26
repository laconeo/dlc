import { createClient } from '@supabase/supabase-js';

// Credenciales del proyecto DLC en Supabase
const PROJECT_SUPABASE_URL = 'https://rrdoraqsocysknhhhnrw.supabase.co';
const PROJECT_ANON_KEY = 'sb_publishable_ny9Pzu6vyCg0FgH5nD0r_Q_Gob5dVlZ';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || PROJECT_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || PROJECT_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

