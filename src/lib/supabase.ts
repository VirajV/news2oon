import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  }
});

export async function initSupabase() {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    console.log('Supabase initialized', session ? 'with session' : 'without session');
    
    const { error } = await supabase
      .from('generations')
      .select('id')
      .limit(1);

    if (error) {
      console.error('Error connecting to Supabase:', error);
      throw error;
    }
  } catch (error) {
    console.error('Failed to initialize Supabase:', error);
    throw error;
  }
}

export async function saveGenerationToSupabase(generation: Omit<CartoonGeneration, 'id' | 'created_at' | 'is_daily' | 'title'>) {
  try {
    const { data: existingDaily } = await supabase
      .from('generations')
      .select('id')
      .eq('is_daily', true)
      .order('created_at', { ascending: false })
      .limit(4);

    const shouldBeDaily = !existingDaily || existingDaily.length < 4;

    const { data, error } = await supabase
      .from('generations')
      .insert([{
        ...generation,
        is_daily: shouldBeDaily,
        created_at: new Date().toISOString()
      }])
      .select();

    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error('Error saving to Supabase:', error);
    throw error;
  }
}

export async function getDailyGenerations() {
  try {
    const { data, error } = await supabase
      .from('generations')
      .select('*')
      .eq('is_daily', true)
      .order('created_at', { ascending: false })
      .limit(4);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching daily generations:', error);
    return [];
  }
}

export async function getGenerationsFromSupabase() {
  try {
    const { data, error } = await supabase
      .from('generations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching from Supabase:', error);
    return [];
  }
}