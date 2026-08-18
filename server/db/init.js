import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Helper to generate normalized 1536-dimensional mock embedding vector if Bedrock embedding isn't called
export function generateMockEmbedding(seedText) {
  let hash = 0;
  for (let i = 0; i < seedText.length; i++) {
    hash = (hash << 5) - hash + seedText.charCodeAt(i);
    hash |= 0;
  }
  const vec = [];
  let sumSq = 0;
  for (let i = 0; i < 1536; i++) {
    const val = Math.sin(hash + i) * Math.cos((hash % (i + 1)) * 0.1);
    vec.push(val);
    sumSq += val * val;
  }
  const norm = Math.sqrt(sumSq) || 1;
  return vec.map(v => Number((v / norm).toFixed(6)));
}

export const SEED_PREDATORY_CLAUSES = [
  {
    category: 'ARBITRATION',
    severity: 'HIGH_RISK',
    title: 'Mandatory Binding Arbitration & Class Action Waiver',
    pattern_description: 'Forfeits the consumer right to sue in a court of law, jury trial, or join class action lawsuits.',
    sample_clause: 'YOU AGREE THAT ALL DISPUTES BETWEEN YOU AND THE COMPANY WILL BE RESOLVED BY BINDING, INDIVIDUAL ARBITRATION AND YOU WAIVE YOUR RIGHT TO PARTICIPATE IN A CLASS ACTION LAWSUIT OR CLASS-WIDE ARBITRATION.',
    plain_english: 'If this company steals your money or violates your privacy, you are legally forbidden from joining a class action lawsuit or taking them to court. You must fight them alone in private arbitration where companies win 90% of the time.',
    remedy: 'Send a formal written Arbitration Opt-Out Notice within 30 days of registration to legal@company.com.'
  },
  {
    category: 'DATA_SELLING',
    severity: 'CRITICAL',
    title: 'Third-Party Data Broker Commercialization & Precise Geolocation Monetization',
    pattern_description: 'Authorizes the sale, leasing, and unrestricted sharing of personal identifiable information, biometric data, and continuous background GPS coordinates.',
    sample_clause: 'We may share, monetize, or transfer your precise geographic location, device identifiers, search telemetry, and user communications to commercial affiliates, advertising networks, and third-party data partners without additional notice.',
    plain_english: 'They are tracking your real-world physical location and selling your personal messages, habits, and device identity to data brokers and advertisers for profit.',
    remedy: 'Disable background location permissions immediately in system settings and submit a GDPR/CCPA "Do Not Sell My Data" request.'
  },
  {
    category: 'AI_TRAINING',
    severity: 'HIGH_RISK',
    title: 'Irrevocable Perpetual License to Train Generative AI Models on User Content',
    pattern_description: 'Grants the platform an irrevocable, royalty-free, worldwide license to use your private photos, code, documents, and creations to train proprietary AI models.',
    sample_clause: 'By uploading, submitting, or storing content on our platform, you grant us a perpetual, worldwide, irrevocable, royalty-free license to use, reproduce, modify, and ingest your content for the development and training of artificial intelligence and machine learning algorithms.',
    plain_english: 'Anything you create, write, or upload is fed into their AI models forever. You receive zero compensation and cannot revoke this permission even if you delete your account.',
    remedy: 'Do not upload proprietary code, artwork, or confidential documents. Check privacy settings for an "AI Model Training Opt-Out" toggle.'
  },
  {
    category: 'UNILATERAL_MODS',
    severity: 'CRITICAL',
    title: 'Silent Retroactive Contract Alteration Without Direct Notice',
    pattern_description: 'Company reserves the right to modify pricing, privacy policies, or legal terms at any time with continued use constituting binding acceptance.',
    sample_clause: 'We reserve the right to alter or replace these terms at our sole discretion at any time without prior written notice. Your continued access or use of our Service after revisions become effective constitutes your acceptance of the amended terms.',
    plain_english: 'They can silently change the rules overnight—including raising subscription fees or stripping privacy rights—without emailing you. If you keep logging in, you automatically agree.',
    remedy: 'TruthBot Autonomous Sentinel active monitoring detects these silent changes in real time so you can cancel before you are trapped.'
  },
  {
    category: 'LIABILITY_WAIVER',
    severity: 'CRITICAL',
    title: 'Zero-Liability Data Breach and Outage Exemption',
    pattern_description: 'Disclaims all monetary liability for security breaches, identity theft, data loss, or server downtime, capping damages at $0 or last month fee.',
    sample_clause: 'UNDER NO CIRCUMSTANCES SHALL THE COMPANY BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, OR CONSEQUENTIAL DAMAGES ARISING FROM DATA BREACHES, UNAUTHORIZED ACCOUNT ACCESS, OR SYSTEM FAILURES. TOTAL LIABILITY SHALL BE CAPPED AT $50.00.',
    plain_english: 'If hackers breach their servers and leak your passwords, credit cards, or personal files, they take zero financial responsibility and cap your compensation at $50.',
    remedy: 'Enable two-factor authentication (2FA) and never store unencrypted sensitive personal documents on this service.'
  },
  {
    category: 'AUTO_RENEWAL',
    severity: 'RISK',
    title: 'Deceptive Subscription Auto-Renewal & Dark-Pattern Cancellation',
    pattern_description: 'Automatic recurring billing with narrow cancellation windows and forfeiture of prepaid balances.',
    sample_clause: 'Your subscription will automatically renew at the current non-promotional standard rate unless cancelled at least 48 hours prior to the expiration of the current billing cycle. All fees are non-refundable.',
    plain_english: 'They will automatically charge your card when your trial ends at the full price, and will refuse any refund if you miss the cancellation cutoff.',
    remedy: 'Set a calendar reminder 3 days before trial ends, or use a virtual disposable debit card with a strict spending limit.'
  }
];

export async function initDatabase() {
  console.log('🔄 Connecting to CockroachDB...');
  const client = await pool.connect();
  try {
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    console.log('📦 Applying CockroachDB schema...');
    await client.query(schemaSql);
    console.log('✅ Schema tables verified/created.');

    // Check if predatory knowledge base is seeded
    const countRes = await client.query('SELECT COUNT(*) FROM predatory_knowledge_base');
    const count = parseInt(countRes.rows[0].count, 10);

    if (count === 0) {
      console.log('🌱 Seeding Predatory Legal Knowledge Base...');
      for (const clause of SEED_PREDATORY_CLAUSES) {
        const embedding = generateMockEmbedding(clause.sample_clause + ' ' + clause.pattern_description);
        await client.query(
          `INSERT INTO predatory_knowledge_base 
          (category, severity, title, pattern_description, sample_clause, plain_english, remedy, embedding)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8::vector)`,
          [
            clause.category,
            clause.severity,
            clause.title,
            clause.pattern_description,
            clause.sample_clause,
            clause.plain_english,
            clause.remedy,
            `[${embedding.join(',')}]`
          ]
        );
      }
      console.log(`✅ Seeded ${SEED_PREDATORY_CLAUSES.length} predatory benchmark vectors.`);
    } else {
      console.log(`ℹ️ Predatory knowledge base already contains ${count} vectors.`);
    }

    // Seed default demo user if not exists
    await client.query(`
      INSERT INTO users (email, name, push_enabled)
      VALUES ('samuel@truthbot.ai', 'Samuel', true)
      ON CONFLICT (email) DO NOTHING
    `);

    console.log('🚀 CockroachDB Distributed Vector Memory initialized successfully!');
  } catch (err) {
    console.error('❌ Error initializing CockroachDB:', err);
    throw err;
  } finally {
    client.release();
  }
}

// Execute if run directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  initDatabase().then(() => process.exit(0)).catch(() => process.exit(1));
}

export default pool;
