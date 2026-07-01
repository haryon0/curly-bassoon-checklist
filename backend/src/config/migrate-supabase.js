require('dotenv').config({ path: '.env.supabase' });
const pool = require('./database.supabase');

const migration = `
-- Drop tables if exist (dev only - remove in production)
DROP TABLE IF EXISTS checklist_photos CASCADE;
DROP TABLE IF EXISTS checklists CASCADE;
DROP TABLE IF EXISTS checklist_templates CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  is_active BOOLEAN DEFAULT true,
  password_reset_required BOOLEAN DEFAULT true,
  last_login TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Checklist Templates table
CREATE TABLE checklist_templates (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  template_pdf_filename VARCHAR(255),
  template_pdf_path VARCHAR(500),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Checklists table
CREATE TABLE checklists (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  template_id INTEGER REFERENCES checklist_templates(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  location VARCHAR(255),
  notes TEXT,
  result_pdf_filename VARCHAR(255),
  result_pdf_path VARCHAR(500),
  result_pdf_size BIGINT,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'processing', 'completed', 'failed')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Checklist Photos table
CREATE TABLE checklist_photos (
  id SERIAL PRIMARY KEY,
  checklist_id INTEGER REFERENCES checklists(id) ON DELETE CASCADE,
  photo_filename VARCHAR(255) NOT NULL,
  photo_path VARCHAR(500) NOT NULL,
  photo_caption TEXT,
  photo_order INTEGER DEFAULT 0,
  file_size BIGINT,
  mime_type VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_checklists_user_id ON checklists(user_id);
CREATE INDEX idx_checklists_template_id ON checklists(template_id);
CREATE INDEX idx_checklist_photos_checklist_id ON checklist_photos(checklist_id);
CREATE INDEX idx_checklist_photos_order ON checklist_photos(checklist_id, photo_order);

-- Seed: Demo admin user (password: Admin@1234)
INSERT INTO users (username, email, password_hash, full_name, role)
VALUES (
  'admin',
  'admin@samara.com',
  '$2a$10$rBV2JDeWW3.vKyeGMdFQueJAGpnYCfFKcvpYUBl6JvHQAHjV7GRmq',
  'System Administrator',
  'admin'
);

-- Seed: Sample checklist templates (no PDF yet — upload via admin)
INSERT INTO checklist_templates (name, code, description, is_active) VALUES
  ('Energization Checklist', 'IF_002', 'Pre-energization safety and electrical checklist for new installations', true),
  ('HVAC Maintenance Checklist', 'MEP_HVAC_001', 'Monthly HVAC system inspection and maintenance checklist', true),
  ('Fire Protection Inspection', 'MEP_FP_001', 'Quarterly fire protection system inspection checklist', true),
  ('Plumbing System Check', 'MEP_PLB_001', 'Monthly plumbing system maintenance checklist', true);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON checklist_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_checklists_updated_at BEFORE UPDATE ON checklists
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
`;

async function runMigration() {
  const client = await pool.connect();
  try {
    console.log('🚀 Starting Supabase database migration...');
    await client.query(migration);
    console.log('✅ Migration completed successfully!\n');
    console.log('📊 Database schema created:');
    console.log('  - users table');
    console.log('  - checklist_templates table');
    console.log('  - checklists table');
    console.log('  - checklist_photos table');
    console.log('\n🔐 Demo credentials:');
    console.log('  Username: admin');
    console.log('  Password: Admin@1234');
    console.log('\n📝 Sample templates seeded:');
    console.log('  - Energization Checklist (IF_002)');
    console.log('  - HVAC Maintenance Checklist (MEP_HVAC_001)');
    console.log('  - Fire Protection Inspection (MEP_FP_001)');
    console.log('  - Plumbing System Check (MEP_PLB_001)');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration();
