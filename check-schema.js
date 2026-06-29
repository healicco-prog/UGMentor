const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8').split('\n').reduce((acc, line) => {
  const [key, ...val] = line.split('=');
  if (key && val.length) acc[key.trim()] = val.join('=').trim();
  return acc;
}, {});

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkSchema() {
  const { data, error } = await supabase
    .from('lms_content')
    .select('*')
    .limit(1);
    
  if (error) {
    console.error('Error fetching lms_content:', error);
  } else {
    console.log('lms_content sample:', JSON.stringify(data, null, 2));
  }
}

checkSchema();
