import { createClient } from '@supabase/supabase-js';

// Essas chaves devem ser preenchidas com os dados do seu projeto Supabase
// Recomenda-se o uso de variáveis de ambiente para maior segurança
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://vxnmgyrnzsvrdlbgmjnq.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4bm1neXJuenN2cmRsYmdtam5xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzMDcxODUsImV4cCI6MjA4NTg4MzE4NX0.02cuNHgj1YN2AroqQ40NeEI7bJstDp8D_gJWJTWXHxY';

export const supabase = createClient(supabaseUrl, supabaseKey);
