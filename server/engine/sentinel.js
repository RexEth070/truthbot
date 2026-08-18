import crypto from 'crypto';
import pool from '../db/init.js';
import { fetchAgreementText } from './scraper.js';
import { analyzeLegalDocument } from './analyzer.js';

class SentinelEngine {
  constructor() {
    this.monitoredTargets = new Map();
    this.sseClients = new Set();
    this.pollInterval = null;
    this.isPolling = false;
  }

  // Register an SSE client for push notifications and live event stream
  addClient(res) {
    this.sseClients.add(res);
    console.log(`📡 [Sentinel] New client connected to live watchdog stream. Total active: ${this.sseClients.size}`);
    
    // Send initial status event
    res.write(`data: ${JSON.stringify({ type: 'CONNECTED', message: 'TruthBot Sentinel 24/7 Watchdog Stream Active', timestamp: new Date().toISOString() })}\n\n`);
  }

  removeClient(res) {
    this.sseClients.delete(res);
    console.log(`🔌 [Sentinel] Client disconnected. Total active: ${this.sseClients.size}`);
  }

  // Broadcast event to all connected browsers
  broadcast(event) {
    const payload = `data: ${JSON.stringify(event)}\n\n`;
    for (const client of this.sseClients) {
      try {
        client.write(payload);
      } catch (err) {
        this.sseClients.delete(client);
      }
    }
  }

  // Register a URL or service for 24/7 autonomous monitoring
  async registerTarget(serviceName, url, initialText) {
    const hash = crypto.createHash('sha256').update(initialText).digest('hex');
    const existing = this.monitoredTargets.get(url);

      if (!existing) {
        this.monitoredTargets.set(url, {
          serviceName,
          url,
          lastHash: hash,
          lastText: initialText, // Added lastText for diffing
          lastChecked: new Date(),
          version: 1
        });
  
        console.log(`🛡️ [Sentinel] Registered target for 24/7 autonomous monitoring: ${serviceName} (${url})`);
        
        this.broadcast({
          type: 'TARGET_REGISTERED',
          serviceName,
          url,
          timestamp: new Date().toISOString()
        });
      }
    }
  
    // Start background HTTP poller (Every 5 seconds)
    start() {
      if (this.isPolling) return;
      this.isPolling = true;
      console.log('🚀 [Sentinel] Autonomous 24/7 Poller started (5-second continuous check loop)...');
  
      this.pollInterval = setInterval(() => {
        this.runPollCycle().catch(err => console.error('[Sentinel Error]', err.message));
      }, 5000);
    }
  
    stop() {
      if (this.pollInterval) {
        clearInterval(this.pollInterval);
        this.isPolling = false;
        console.log('🛑 [Sentinel] Poller stopped.');
      }
    }
  
    async runPollCycle() {
      if (this.monitoredTargets.size === 0) return;
  
      for (const [url, target] of this.monitoredTargets.entries()) {
        try {
          const fetched = await fetchAgreementText(url);
          const currentHash = fetched.hash;
  
          if (currentHash !== target.lastHash) {
            console.log(`🚨 [Sentinel ALERT] Stealth alteration detected on ${target.serviceName}! Old Hash: ${target.lastHash.slice(0, 8)} -> New: ${currentHash.slice(0, 8)}`);
  
            // --- Extract Exact Diff (Old vs New Clause) and Determine Type ---
            const oldLines = (target.lastText || '').split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 20);
            const newLines = (fetched.text || '').split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 20);
            
            let oldClause = "Original baseline agreement terms.";
            let newClause = "New terms could not be perfectly isolated.";
            let updateType = "CHANGE";
            
            for (let i = 0; i < Math.max(oldLines.length, newLines.length); i++) {
              if (oldLines[i] !== newLines[i]) {
                if (!oldLines[i] && newLines[i]) {
                    updateType = "UPDATE"; // Brand new clause added
                    oldClause = "None (New Section Added)";
                    newClause = newLines[i];
                } else if (oldLines[i] && !newLines[i]) {
                    updateType = "CHANGE"; // Section deleted
                    oldClause = oldLines[i];
                    newClause = "None (Section Deleted)";
                } else {
                    updateType = "CHANGE"; // Twisted existing term
                    oldClause = oldLines[i];
                    newClause = newLines[i];
                }
                break; // Found the exact stealth change!
              }
            }
            // ----------------------------------------------
            // Update memory immediately to prevent race conditions
            target.lastHash = currentHash;
            target.lastText = fetched.text;
            target.version += 1;
            target.lastChecked = new Date();
  
            // Analyze new terms with Bedrock
            const analysis = await analyzeLegalDocument(target.serviceName, url, fetched.text);
  
            const diffSummary = analysis.summary || `The AI detected a structural ${updateType} in the terms.`;
            
            // Extract the categories for the sub-header
            const affectedCategories = [...new Set(analysis.clauses.map(c => c.category))].join(', ') || 'General Terms';
  
            // Persist to CockroachDB
            try {
              await pool.query(
                `INSERT INTO agreement_diffs (service_name, update_type, changes_summary, diff_clauses, notification_dispatched)
                 VALUES ($1, $2, $3, $4, $5)`,

                [target.serviceName, updateType, diffSummary, JSON.stringify(analysis.clauses), true]
              );

            await pool.query(
              `INSERT INTO audit_log (event_type, service_name, details)
               VALUES ('STEALTH_UPDATE_DETECTED', $1, $2)`,
              [target.serviceName, JSON.stringify({ url, updateType })]
            );
          } catch (dbErr) {
            console.warn('DB persistence warning during diff:', dbErr.message);
          }

          // Broadcast alert via SSE for immediate browser Push Notification
          this.broadcast({
            type: 'CONTRACT_ALTERED_ALERT',
            serviceName: target.serviceName,
            url: target.url,
            updateType, // 'CHANGE' or 'UPDATE'
            affectedCategories, // Sub-header
            summary: diffSummary, // Body context
            oldClause,
            newClause,
            clauses: analysis.clauses,
            criticalActions: analysis.criticalActions,
            timestamp: new Date().toISOString()
          });
        } else {
          // Heartbeat tick
          this.broadcast({
            type: 'SENTINEL_TICK',
            serviceName: target.serviceName,
            status: 'VERIFIED_UNCHANGED',
            hash: currentHash.slice(0, 8),
            timestamp: new Date().toISOString()
          });
        }
      } catch (err) {
        console.warn(`[Sentinel Poll Warning] Target ${target.serviceName}:`, err.message);
      }
    }
  }
}

export const sentinelEngine = new SentinelEngine();
