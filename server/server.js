import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

import pool, { initDatabase } from './db/init.js';
import { fetchAgreementText } from './engine/scraper.js';
import { analyzeLegalDocument } from './engine/analyzer.js';
import { sentinelEngine } from './engine/sentinel.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Serve static demo terms
app.use('/demo', express.static(path.join(__dirname, 'public')));

// Health Check
app.get('/health', async (req, res) => {
  try {
    const dbRes = await pool.query('SELECT NOW() as now');
    res.json({
      status: 'ONLINE',
      system: 'TruthBot 24/7 Legal Watchdog Engine',
      db: 'CockroachDB Serverless Connected',
      timestamp: dbRes.rows[0].now
    });
  } catch (err) {
    res.status(500).json({ status: 'DEGRADED', error: err.message });
  }
});

// 1. Passwordless Email OTP: Request Code
app.post('/api/auth/request-otp', async (req, res) => {
  const { email } = req.body;
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Valid email address is required.' });
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

  try {
    await pool.query(
      `INSERT INTO auth_otps (email, code, expires_at)
       VALUES ($1, $2, $3)`,
      [email.toLowerCase().trim(), code, expiresAt]
    );

    console.log(`\n========================================`);
    console.log(`🔐 [TruthBot Auth] Generated OTP for ${email}: [ ${code} ]`);
    console.log(`========================================\n`);

    res.json({
      success: true,
      message: `OTP sent to ${email}`,
      demoCode: code // Exposed for fast hackathon demo testing
    });
  } catch (err) {
    console.error('OTP request error:', err);
    res.status(500).json({ error: 'Failed to generate sign-in code.' });
  }
});

// 2. Passwordless Email OTP: Verify Code
app.post('/api/auth/verify-otp', async (req, res) => {
  const { email, code, pushEnabled } = req.body;
  if (!email || !code) {
    return res.status(400).json({ error: 'Email and 6-digit code are required.' });
  }

  try {
    const otpRes = await pool.query(
      `SELECT * FROM auth_otps 
       WHERE email = $1 AND code = $2 AND used = false AND expires_at > clock_timestamp()
       ORDER BY created_at DESC LIMIT 1`,
      [email.toLowerCase().trim(), code.trim()]
    );

    if (otpRes.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid or expired verification code.' });
    }

    // Mark OTP as used
    await pool.query('UPDATE auth_otps SET used = true WHERE id = $1', [otpRes.rows[0].id]);

    // Extract name from email (e.g. samuel@... -> Samuel)
    const rawName = email.split('@')[0].replace(/[._-]/g, ' ');
    const displayName = rawName.charAt(0).toUpperCase() + rawName.slice(1);

    // Upsert User
    const userRes = await pool.query(
      `INSERT INTO users (email, name, push_enabled, last_login_at)
       VALUES ($1, $2, $3, clock_timestamp())
       ON CONFLICT (email) DO UPDATE 
       SET name = EXCLUDED.name, push_enabled = EXCLUDED.push_enabled, last_login_at = clock_timestamp()
       RETURNING id, email, name, push_enabled`,
      [email.toLowerCase().trim(), displayName, !!pushEnabled]
    );

    const user = userRes.rows[0];

    res.json({
      success: true,
      user,
      greeting: `Hi ${user.name}, I am your 24/7 Watchdog`
    });
  } catch (err) {
    console.error('OTP verify error:', err);
    res.status(500).json({ error: 'Failed to verify OTP.' });
  }
});

// 3. Universal Agreement Ingestion & Analysis
app.post('/api/analyze', async (req, res) => {
  const { url, serviceName, customText, userId } = req.body;
  if (!url && !customText) {
    return res.status(400).json({ error: 'URL or text input is required.' });
  }

  // SSRF Protection: Block internal AWS IPs (Allow localhost for local hackathon demo testing)
  if (url && url.match(/^https?:\/\/(10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.|192\.168\.|169\.254\.)/)) {
    return res.status(403).json({ error: 'Invalid or restricted URL.' });
  }

  try {
    let scraped;
    if (customText) {
      scraped = {
        serviceName: serviceName || 'Custom Legal Text',
        url: url || 'custom://pasted-text',
        text: customText,
        hash: 'custom-hash-' + Date.now(),
        isLiveScrape: false
      };
    } else {
      scraped = await fetchAgreementText(url);
    }

    // Perform Vector & Bedrock Analysis
    const analysis = await analyzeLegalDocument(scraped.serviceName, scraped.url, scraped.text);

    // Save to CockroachDB Monitored Agreements using a Transaction
    const client = await pool.connect();
    let agreementId;
    try {
      await client.query('BEGIN');

      const agreementRes = await client.query(
        `INSERT INTO monitored_agreements 
         (service_name, url, content_hash, summary, critical_actions)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id`,
        [
          analysis.serviceName,
          analysis.url,
          scraped.hash,
          analysis.summary,
          JSON.stringify(analysis.criticalActions)
        ]
      );

      agreementId = agreementRes.rows[0].id;

      // Save individual clauses to CockroachDB
      for (const clause of analysis.clauses) {
        await client.query(
          `INSERT INTO agreement_clauses 
           (agreement_id, clause_title, clause_text, severity, category, plain_english, risk_explanation, remedy)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            agreementId,
            clause.clauseTitle,
            clause.clauseText,
            clause.severity,
            clause.category,
            clause.plainEnglish,
            clause.riskExplanation,
            clause.remedy
          ]
        );
      }

      await client.query('COMMIT');
    } catch (dbErr) {
      await client.query('ROLLBACK');
      throw dbErr;
    } finally {
      client.release();
    }

    // Register with 24/7 Autonomous Sentinel
    await sentinelEngine.registerTarget(analysis.serviceName, analysis.url, scraped.text);

    res.json({
      success: true,
      agreementId,
      ...analysis
    });
  } catch (err) {
    console.error('Analysis error:', err);
    res.status(500).json({ error: 'Failed to analyze agreement: ' + err.message });
  }
});

// 4. Get Monitored Vault Agreements
app.get('/api/agreements', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT a.*, 
        (SELECT json_agg(c.*) FROM agreement_clauses c WHERE c.agreement_id = a.id) as clauses
       FROM monitored_agreements a
       ORDER BY a.created_at DESC LIMIT 20`
    );
    res.json({ agreements: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4.5 Get Historical Alerts
app.get('/api/alerts', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, service_name as "serviceName", detected_at, update_type as "updateType", changes_summary as "description", false as "read"
       FROM agreement_diffs
       ORDER BY detected_at DESC LIMIT 50`
    );
    // Add type to match frontend structure
    const alerts = result.rows.map(row => ({ type: 'CONTRACT_ALTERED_ALERT', ...row }));
    res.json({ alerts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4.6 Wipe User Memory
app.delete('/api/memory', async (req, res) => {
  try {
    // Delete all monitored agreements (cascades to clauses and diffs)
    await pool.query('DELETE FROM monitored_agreements');
    // Delete any orphaned diffs just in case
    await pool.query('DELETE FROM agreement_diffs');
    
    // Also clear the running sentinel targets
    sentinelEngine.monitoredTargets.clear();

    res.json({ success: true, message: 'Memory permanently wiped from CockroachDB.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Sentinel Server-Sent Events (SSE) Stream
app.get('/api/sentinel/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  sentinelEngine.addClient(res);

  req.on('close', () => {
    sentinelEngine.removeClient(res);
  });
});

// 6. Monitored Targets Status
app.get('/api/sentinel/monitored', (req, res) => {
  const targets = Array.from(sentinelEngine.monitoredTargets.values());
  res.json({ targets, activeCount: targets.length });
});

// 7. Demo: Inject Predatory Changes on Local Terms File (Zero Fake Buttons)
app.post('/api/demo/modify-terms', (req, res) => {
  const termsFile = path.join(__dirname, 'public', 'company-terms.html');
  const stealthHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Apex Cloud Services - End User Terms & Conditions (REVISED)</title>
  <style>
    body { font-family: sans-serif; max-width: 800px; margin: 40px auto; line-height: 1.6; padding: 20px; color: #222; }
    h1 { color: #111; }
    .clause { margin-bottom: 24px; padding: 16px; border-left: 4px solid #ef4444; background: #fff1f2; }
  </style>
</head>
<body>
  <h1>Apex Cloud Services - Terms of Service (Updated 2026)</h1>
  <p><strong>Last Updated:</strong> Silent Midnight Revision</p>

  <div class="clause">
    <h3>1. AI Model Training License</h3>
    <p>You grant Apex Cloud a perpetual, worldwide, irrevocable license to ingest, machine-read, and train commercial generative AI algorithms on all stored private user files, code, and documents.</p>
  </div>

  <div class="clause">
    <h3>2. Telemetry and Precise Geolocation Monetization</h3>
    <p>Apex Cloud may collect, monetize, and sell real-time GPS coordinates, search queries, and device identifiers to third-party data broker networks without prior notice.</p>
  </div>

  <div class="clause">
    <h3>3. Mandatory Binding Arbitration & Class Action Waiver</h3>
    <p>YOU AGREE THAT ALL DISPUTES WILL BE RESOLVED BY BINDING INDIVIDUAL ARBITRATION AND YOU FORFEIT ALL RIGHTS TO A JURY TRIAL OR CLASS ACTION LAWSUITS.</p>
  </div>
</body>
</html>`;

  fs.writeFileSync(termsFile, stealthHtml, 'utf8');
  console.log('⚡ [Demo Target Modified] Written predatory clauses to company-terms.html on disk.');
  res.json({ success: true, message: 'company-terms.html updated with predatory terms on disk. Sentinel will detect within 5s.' });
});

// 8. Demo: Reset Terms File
app.post('/api/demo/reset-terms', (req, res) => {
  const termsFile = path.join(__dirname, 'public', 'company-terms.html');
  const safeHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Apex Cloud Services - End User Terms & Conditions</title>
  <style>
    body { font-family: sans-serif; max-width: 800px; margin: 40px auto; line-height: 1.6; padding: 20px; color: #222; }
    h1 { color: #111; }
    .clause { margin-bottom: 24px; padding: 16px; border-left: 4px solid #3b82f6; background: #f8fafc; }
  </style>
</head>
<body>
  <h1>Apex Cloud Services - Terms of Service</h1>
  <p><strong>Last Updated:</strong> August 17, 2026</p>

  <div class="clause">
    <h3>1. Service Availability</h3>
    <p>Apex Cloud provides enterprise cloud storage and synchronization tools for registered individual and business accounts.</p>
  </div>

  <div class="clause">
    <h3>2. User Data Rights & Privacy</h3>
    <p>We respect customer confidentiality. Your files and account information are encrypted at rest and never commercialized without direct consent.</p>
  </div>

  <div class="clause">
    <h3>3. Dispute Resolution</h3>
    <p>Any dispute arising under this agreement will be resolved in an open court of competent jurisdiction under standard consumer protection laws.</p>
  </div>
</body>
</html>`;

  fs.writeFileSync(termsFile, safeHtml, 'utf8');
  console.log('🔄 [Demo Target Reset] Restored company-terms.html to safe version.');
  res.json({ success: true, message: 'company-terms.html reset to clean baseline.' });
});

// Start Server & Sentinel
async function bootstrap() {
  try {
    await initDatabase();
    
    // Hydrate Sentinel Engine Memory from CockroachDB
    console.log('🔄 Hydrating Sentinel memory from CockroachDB...');
    const activeTargets = await pool.query('SELECT service_name, url, content_hash FROM monitored_agreements WHERE is_sentinel_active = true');
    for (const row of activeTargets.rows) {
      sentinelEngine.monitoredTargets.set(row.url, {
        serviceName: row.service_name,
        lastHash: row.content_hash
      });
    }
    console.log(`✅ Sentinel Watchdog hydrated with ${activeTargets.rowCount} active targets.`);

    // Seed initial demo target into Sentinel Watchdog (if not already hydrated)
    const demoUrl = `http://localhost:${PORT}/demo/test-service.html`;
    if (!sentinelEngine.monitoredTargets.has(demoUrl)) {
      const initialDemoText = fs.readFileSync(path.join(__dirname, 'public', 'test-service.html'), 'utf8');
      await sentinelEngine.registerTarget('NexusTech', demoUrl, initialDemoText);
    }
    
    // Start autonomous polling
    sentinelEngine.start();

    app.listen(PORT, () => {
      console.log(`\n======================================================`);
      console.log(`🛡️  TruthBot Server Live on http://localhost:${PORT}`);
      console.log(`📡  SSE Live Stream: http://localhost:${PORT}/api/sentinel/stream`);
      console.log(`🔍  Demo Monitored URL: ${demoUrl}`);
      console.log(`======================================================\n`);
    });
  } catch (err) {
    console.error('Fatal bootstrap error:', err);
  }
}

bootstrap();
