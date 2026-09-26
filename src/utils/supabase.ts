import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[DLC] Variables VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY no encontradas. ' +
    'La app funcionará en modo offline con datos locales.'
  );
}

// Use a placeholder URL when env vars are missing so the app renders
export const supabase = createClient(
  supabaseUrl  || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);
