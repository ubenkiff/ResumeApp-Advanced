import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function initDatabase() {
  let client;
  try {
    if (!process.env.DATABASE_URL) {
      console.warn('⚠️ DATABASE_URL is not set. Database features will be unavailable.');
      return;
    }
    client = await pool.connect();
    // Users table
    await client.query(`CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      subscription_status TEXT DEFAULT 'free',
      reset_token TEXT,
      reset_token_expires TIMESTAMP,
      created_at TIMESTAMP DEFAULT NOW()
    )`);

    // Profiles table
    await client.query(`CREATE TABLE IF NOT EXISTS profiles (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) UNIQUE,
      name TEXT,
      title TEXT,
      bio TEXT,
      email TEXT,
      phone TEXT,
      location TEXT,
      linkedin TEXT,
      avatar_url TEXT
    )`);

    // Experience table
    await client.query(`CREATE TABLE IF NOT EXISTS experience (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      job_title TEXT,
      company TEXT,
      location TEXT,
      start_date TEXT,
      end_date TEXT,
      current BOOLEAN DEFAULT FALSE,
      description TEXT,
      highlights TEXT[]
    )`);

    // Education table
    await client.query(`CREATE TABLE IF NOT EXISTS education (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      degree TEXT,
      field TEXT,
      institution TEXT,
      location TEXT,
      start_year TEXT,
      end_year TEXT,
      grade TEXT,
      description TEXT
    )`);

    // Skills table
    await client.query(`CREATE TABLE IF NOT EXISTS skills (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      name TEXT,
      category TEXT,
      level TEXT
    )`);

    // Projects table
    await client.query(`CREATE TABLE IF NOT EXISTS projects (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      title TEXT,
      description TEXT,
      tech_stack TEXT[],
      live_url TEXT,
      github_url TEXT,
      image_urls TEXT[],
      featured BOOLEAN DEFAULT FALSE
    )`);

    // Achievements table
    await client.query(`CREATE TABLE IF NOT EXISTS achievements (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      title TEXT,
      issuer TEXT,
      date TEXT,
      description TEXT,
      category TEXT
    )`);

    // NEW: User cover letter preferences
    await client.query(`CREATE TABLE IF NOT EXISTS user_cover_data (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) UNIQUE,
      career_goals TEXT,
      notice_period TEXT,
      preferred_work_env TEXT,
      updated_at TIMESTAMP DEFAULT NOW()
    )`);

    // NEW: Saved cover letters
    await client.query(`CREATE TABLE IF NOT EXISTS saved_cover_letters (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      job_title TEXT,
      company_name TEXT,
      job_description TEXT,
      content TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )`);

    // NEW: Saved jobs from InfraScan
    await client.query(`CREATE TABLE IF NOT EXISTS saved_jobs (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      job_title TEXT,
      company_name TEXT,
      location TEXT,
      description TEXT,
      source_url TEXT,
      saved_at TIMESTAMP DEFAULT NOW()
    )`);

    // NEW: Email logs (for monitoring)
    await client.query(`CREATE TABLE IF NOT EXISTS email_logs (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      recipient_email TEXT,
      email_type TEXT,
      status TEXT,
      error_message TEXT,
      sent_at TIMESTAMP DEFAULT NOW()
    )`);

    // References table
    await client.query(`CREATE TABLE IF NOT EXISTS user_references (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      name TEXT NOT NULL,
      title TEXT,
      company TEXT,
      email TEXT,
      phone TEXT,
      relationship TEXT,
      include_in_letter BOOLEAN DEFAULT FALSE,
      sort_order INTEGER DEFAULT 0
    )`);

    // NEW: Admin users
    await client.query(`CREATE TABLE IF NOT EXISTS admin_users (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) UNIQUE
    )`);

    // NEW: Optimized Resumes (AI Crystallized)
    await client.query(`CREATE TABLE IF NOT EXISTS user_optimized_resumes (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      template_name TEXT NOT NULL,
      optimized_data JSONB NOT NULL,
      created_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(user_id, template_name)
    )`);

    // NEW: Global Template Images (Admin controlled)
    await client.query(`CREATE TABLE IF NOT EXISTS global_template_images (
      id SERIAL PRIMARY KEY,
      template_type VARCHAR(50) NOT NULL UNIQUE,
      image_url TEXT NOT NULL,
      updated_by INTEGER REFERENCES users(id),
      updated_at TIMESTAMP DEFAULT NOW()
    )`);

    // Seed default images if the table is empty
    const checkImages = await client.query('SELECT count(*) FROM global_template_images');
    if (parseInt(checkImages.rows[0].count) === 0) {
      const defaultImages = [
        ['executive', 'input_file_0.png'],
        ['professional', 'input_file_1.png'],
        ['ats', 'input_file_2.png'],
        ['modern', 'input_file_3.png'],
        ['minimal', 'input_file_4.png'],
        ['creative', 'input_file_5.png']
      ];
      
      for (const [type, url] of defaultImages) {
        await client.query(
          'INSERT INTO global_template_images (template_type, image_url) VALUES ($1, $2)',
          [type, url]
        );
      }
      console.log('✅ Global templates seeded');
    }

    console.log('✅ Database tables ready');
  } catch (error) {
    console.error('❌ Database init error:', error.message);
  } finally {
    if (client) client.release();
  }
}

initDatabase();

export default pool;
