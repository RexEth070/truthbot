import pool from './server/db/init.js';

async function fix() {
  try {
    await pool.query('ALTER TABLE monitored_agreements DROP COLUMN IF EXISTS risk_score;');
    console.log('Dropped risk_score from monitored_agreements');
    await pool.query('ALTER TABLE agreement_clauses DROP COLUMN IF EXISTS risk_score;');
    console.log('Dropped risk_score from agreement_clauses');
    await pool.query('ALTER TABLE agreement_diffs DROP COLUMN IF EXISTS old_score;');
    await pool.query('ALTER TABLE agreement_diffs DROP COLUMN IF EXISTS new_score;');
    console.log('Dropped scores from agreement_diffs');
  } catch (err) {
    console.error('Error fixing db:', err);
  } finally {
    process.exit(0);
  }
}

fix();
