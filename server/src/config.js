import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from server directory
dotenv.config({ path: path.resolve(__dirname, '../.env') });

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  supabaseUrl: process.env.SUPABASE_URL || '',
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  geminiModel: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
  databaseUrl: process.env.DATABASE_URL || '',
};

export function validateConfig() {
  const missing = [];
  if (!config.supabaseUrl || config.supabaseUrl.includes('your-project')) {
    missing.push('SUPABASE_URL');
  }
  if (!config.supabaseServiceRoleKey || config.supabaseServiceRoleKey.includes('your-supabase')) {
    missing.push('SUPABASE_SERVICE_ROLE_KEY');
  }
  if (!config.geminiApiKey || config.geminiApiKey.includes('your-gemini')) {
    missing.push('GEMINI_API_KEY');
  }

  if (missing.length > 0) {
    console.warn(`\n⚠️  WARNING: Missing or placeholder environment variables: ${missing.join(', ')}`);
    console.warn(`   Please configure them in server/.env for full functionality.\n`);
  }
}
