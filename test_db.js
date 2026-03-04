import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
    const { data, error } = await supabase.from('sales_data').select('data').eq('unit', 'madville').order('updated_at', { ascending: false }).limit(1).single();
    if (error) {
        console.error(error);
        return;
    }
    console.log(JSON.stringify(data.data[0], null, 2));
}

run();
