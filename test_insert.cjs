const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://vxnmgyrnzsvrdlbgmjnq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4bm1neXJuenN2cmRsYmdtam5xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzMDcxODUsImV4cCI6MjA4NTg4MzE4NX0.02cuNHgj1YN2AroqQ40NeEI7bJstDp8D_gJWJTWXHxY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testInsert() {
    console.log("Testing insert into activity_logs...");
    try {
        const { data, error } = await supabase
            .from('activity_logs')
            .insert([{
                username: 'system_test',
                action_type: 'DIAGNOSTIC',
                page_path: '/diagnostic',
                metadata: { test: true },
                created_at: new Date().toISOString()
            }]);

        if (error) {
            console.error("Insert Error:", error.message);
            if (error.hint) console.log("Hint:", error.hint);
        } else {
            console.log("Insert successful!");
        }
    } catch (e) {
        console.error("Script Error:", e.message);
    }
}

testInsert();
