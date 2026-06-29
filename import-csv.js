const fs = require('fs');
const { parse } = require('csv-parse');
const { createClient } = require('@supabase/supabase-js');

// Read .env.local manually
const env = fs.readFileSync('.env.local', 'utf8').split('\n').reduce((acc, line) => {
  const [key, ...val] = line.split('=');
  if (key && val.length) acc[key.trim()] = val.join('=').trim();
  return acc;
}, {});

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY
);

async function processFile() {
  const records = [];
  const parser = fs
    .createReadStream('lms_content.csv')
    .pipe(parse({
      columns: true,
      skip_empty_lines: true,
      relax_quotes: true,
      relax_column_count: true
    }));

  for await (const record of parser) {
    // Handle jsonb fields if needed, but in this case, flashcards can be text or json.
    // If it's an empty string for flashcards, we can set it to null so it doesn't fail JSONB validation.
    if (!record.flashcards) {
      record.flashcards = null;
    } else {
      try {
        record.flashcards = JSON.parse(record.flashcards);
      } catch (e) {
        // Leave as is if it fails parsing
      }
    }

    if (!record.topic_id) {
      record.topic_id = null;
    } else {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(record.topic_id) && record.topic_id.length > 0) {
        console.warn('Skipping corrupted row due to invalid topic_id UUID:', record.topic_id.substring(0, 30));
        continue;
      }
    }

    if (!record.id) {
      delete record.id;
    } else {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(record.id)) {
        console.warn('Skipping corrupted row due to invalid id UUID:', record.id.substring(0, 30));
        continue;
      }
    }
    
    if (!record.last_generated_at) delete record.last_generated_at;

    records.push(record);
  }

  console.log(`Total rows parsed: ${records.length}`);
  
  // Batch insert
  const BATCH_SIZE = 50;
  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    const batch = records.slice(i, i + BATCH_SIZE);
    const { error } = await supabase.from('lms_content').upsert(batch, { onConflict: 'id' });
    
    if (error) {
      console.error(`Error inserting batch starting at index ${i}:`, error.message);
      console.error(error.details, error.hint);
      // Let's print the first record of the failing batch to see structure
      console.log('Sample record from failing batch:', batch[0].id);
      return;
    } else {
      console.log(`Successfully inserted batch ${i} to ${i + BATCH_SIZE}`);
    }
  }
  
  console.log('Import completed successfully!');
}

processFile().catch(err => {
  console.error('Fatal error:', err);
});
