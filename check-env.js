import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load env vars
dotenv.config({ path: '.env.local' });
dotenv.config();

console.log("--- Supabase Diagnostics ---");

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log(`URL Found: ${!!url}`);
if (url?.includes('placeholder')) {
    console.error("CRITICAL: URL is still pointing to 'placeholder'! Update .env.local");
} else {
    console.log("URL looks valid (not placeholder).");
}
console.log(`Key Found: ${!!key}`);

if (!url || !key) {
    console.error("ERROR: Missing Environment Variables!");
    console.log("Please ensure .env.local exists and has NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY");
    process.exit(1);
}

console.log("Initializing Client...");
const supabase = createClient(url, key);

(async () => {
    try {
        console.log("Testing connection...");
        const { data, error } = await supabase.from('HealthReport').select('count', { count: 'exact', head: true });

        if (error) {
            console.error("Connection Failed:", error.message);
        } else {
            console.log("Connection Successful! (HealthReport table accessible)");
        }

        console.log("Testing Storage Access...");
        const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
        if (bucketError) {
            console.error("Storage Error:", bucketError.message);
        } else {
            console.log("Buckets found:", buckets.map(b => b.name).join(', '));
            const reportsBucket = buckets.find(b => b.name === 'reports');

            if (reportsBucket) {
                console.log("SUCCESS: 'reports' bucket exists.");

                // Try Upload
                console.log("Testing Upload Permission...");
                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('reports')
                    .upload('test_diagnostic.txt', new Blob(['Diagnostics Test']), { upsert: true });

                if (uploadError) {
                    console.error("UPLOAD FAILED:", uploadError.message);
                } else {
                    console.log("UPLOAD SUCCESS: File 'test_diagnostic.txt' written to bucket.");
                }

            } else {
                console.error("WARNING: 'reports' bucket NOT found in list. (If it exists but is public, this might be a permission issue to list buckets).");
            }
        }

    } catch (e) {
        console.error("Unexpected Error:", e);
    }
})();
