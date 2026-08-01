const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

// Parse .env.local manually
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
  console.error("Missing environment variables:", { supabaseUrl, hasServiceKey: !!supabaseServiceKey });
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
  const tripId = "fa31fe5e-ff15-4b38-86ea-0afd99eeb7ae";
  
  console.log("Checking members of trip:", tripId);
  const { data: members, error: memErr } = await supabase
    .from('trip_members')
    .select('*')
    .eq('trip_id', tripId);
    
  if (memErr) {
    console.error("Error fetching members:", memErr);
  } else {
    console.log("Members:", members);
  }
}

run();
