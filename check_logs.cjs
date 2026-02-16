const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://vxnmgyrnzsvrdlbgmjnq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4bm1neXJuenN2cmRsYmdtam5xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzMDcxODUsImV4cCI6MjA4NTg4MzE4NX0.02cuNHgj1YN2AroqQ40NeEI7bJstDp8D_gJWJTWXHxY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkLogs() {
    console.log("Checking activity_logs table...");
    try {
        const { data, error, count } = await supabase
            .from('activity_logs')
            .select('*', { count: 'exact' })
            .limit(10);

        if (error) {
            console.error("Error fetching logs:", error.message);
            if (error.hint) console.log("Hint:", error.hint);
            if (error.details) console.log("Details:", error.details);
        } else {
            console.log("Total records (approx):", count);
            console.log("Sample records:", JSON.stringify(data, null, 2));
        }
    } catch (e) {
        console.error("Script Error:", e.message);
    }
}

checkLogs();
