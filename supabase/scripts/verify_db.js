
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function verify() {
    console.log('--- DB VERIFICATION START ---');

    const { count: cCount, error: cError } = await supabase.from('clinics').select('*', { count: 'exact', head: true });
    const { count: tCount, error: tError } = await supabase.from('treatments').select('*', { count: 'exact', head: true });

    if (cError) console.error('Clinics Error:', cError.message);
    else console.log(`DB_CLINICS_COUNT: ${cCount}`);

    if (tError) console.error('Treatments Error:', tError.message);
    else console.log(`DB_TREATMENTS_COUNT: ${tCount}`);

    // Check the updated price again for sanity
    const { data: tData } = await supabase.from('treatments').select('slug, price_range').eq('slug', 'hair-transplant').single();
    console.log(`HAIR_TRANSPLANT_PRICE: ${tData?.price_range}`);

    console.log('--- DB VERIFICATION END ---');
}

verify().catch(console.error);
