const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAllUsers() {
    const { data, error } = await supabase
        .from('profiles')
        .select('username, email');

    if (error) {
        console.error("Error:", error);
    } else {
        console.log("All Registered Users:");
        console.table(data);
    }
}

checkAllUsers();
