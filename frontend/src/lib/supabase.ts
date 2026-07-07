import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.warn('⚠️ Supabase URL or Anon Key is missing from environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

export async function fetchAllRows(buildQuery: () => any, maxLimit = 20000) {
  let allData: any[] = [];
  const pageSize = 1000;
  for (let page = 0; page < Math.ceil(maxLimit / pageSize); page++) {
    const { data, error } = await buildQuery().range(page * pageSize, (page + 1) * pageSize - 1);
    if (error) {
      console.error('Pagination error:', error);
      break;
    }
    if (!data || data.length === 0) break;
    allData = [...allData, ...data];
    if (data.length < pageSize) break;
  }
  return allData;
}
