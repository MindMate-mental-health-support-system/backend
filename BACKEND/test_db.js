const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing SUPABASE credentials in .env");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSupabase() {
    console.log("Testing Supabase Connection...");

    const { data: sessions, error: sessionErr } = await supabase
        .from('chat_sessions')
        .select('*')
        .limit(1);

    if (sessionErr) {
        console.error("❌ Error fetching chat_sessions:", sessionErr.message);
    } else {
        console.log("✅ chat_sessions fetched. Count:", sessions.length);
    }

    const { data: history, error: historyErr } = await supabase
        .from('chat_history')
        .select('*')
        .limit(1);

    if (historyErr) {
        console.error("❌ Error fetching chat_history:", historyErr.message);
    } else {
        console.log("✅ chat_history fetched. Count:", history.length);
    }
}

testSupabase();
