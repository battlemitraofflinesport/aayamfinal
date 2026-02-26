require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function makeAdmin() {
    const email = "kathan21042007@gmail.com";

    // First, check if user exists
    const { data: user, error: findError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .maybeSingle();

    if (findError) {
        console.error("Error finding user:", findError);
        return;
    }

    if (!user) {
        console.log(`User ${email} not found. They need to register first!`);
        return;
    }

    // Update role to superadmin
    const { data: updated, error: updateError } = await supabase
        .from('users')
        .update({ role: 'superadmin' })
        .eq('email', email)
        .select()
        .single();

    if (updateError) {
        console.error("Error updating user:", updateError);
        return;
    }

    console.log(`Successfully updated ${email} to role: superadmin`, updated);
}

makeAdmin();
