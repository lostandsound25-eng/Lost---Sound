const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

let supabaseUrl = '';
let supabaseServiceKey = '';

try {
  const envContent = fs.readFileSync('.env.local', 'utf8');
  const lines = envContent.split('\n');
  lines.forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const val = parts.slice(1).join('=').trim().replace(/(^"|"$)/g, '');
      if (key === 'NEXT_PUBLIC_SUPABASE_URL') supabaseUrl = val;
      if (key === 'SUPABASE_SERVICE_ROLE_KEY') supabaseServiceKey = val;
    }
  });
} catch (e) {
  console.error("Failed to read .env.local:", e);
}

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing environment variables.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
  console.log("Checking RLS policies for storage...");
  
  // Query pg_policies to see storage rules
  const { data: policies, error: polErr } = await supabase
    .rpc('get_policies_if_possible'); // wait, let's just query pg_policies using sql if we can, or query using raw supabase select if permitted.
  
  // Wait, if RPC doesn't exist, we can use a direct SQL execution if we have an endpoint, or we can select from pg_policies.
  // Let's run a select query on pg_policies via pg_catalog schema if we can, or from information_schema.
  // Actually, we can check pg_policies via standard table select? No, supabase client doesn't expose pg_catalog tables by default unless configured.
  // But wait! We can just run a local script that connects to the database via direct postgres connection if we have the connection string!
  // Let's check if we have the postgres connection string in .env.local!
  const envContent = fs.readFileSync('.env.local', 'utf8');
  console.log("Env keys found:");
  envContent.split('\n').forEach(line => {
    const key = line.split('=')[0].trim();
    if (key) console.log(` - ${key}`);
  });
}

run();
