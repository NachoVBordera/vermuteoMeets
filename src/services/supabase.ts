import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || supabaseUrl === 'PON_AQUI_A_TUA_URL') {
    console.warn('Falta VITE_SUPABASE_URL no ficheiro .env');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');
