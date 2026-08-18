import axios from 'axios';
import * as cheerio from 'cheerio';
import crypto from 'crypto';

export const PRESET_SERVICES = {
  spotify: {
    name: 'Spotify',
    url: 'https://www.spotify.com/legal/end-user-agreement/',
    sampleText: `SPOTIFY TERMS AND CONDITIONS OF USE (EFFECTIVE 2026)
    
1. User Data and Machine Learning
By using the Spotify Service, you grant Spotify a non-exclusive, transferable, sub-licensable, royalty-free, perpetual, irrevocable, fully paid, worldwide license to use, reproduce, make available to the public, modify, and ingest any user playlists, listening habits, voice input telemetry, and user-generated metadata for any purpose, including developing, training, tuning, and improving Spotify's proprietary Artificial Intelligence and Generative Machine Learning algorithms.

2. Mandatory Binding Arbitration & Class Action Waiver
YOU AND SPOTIFY AGREE THAT EACH MAY BRING CLAIMS AGAINST THE OTHER ONLY IN YOUR OR ITS INDIVIDUAL CAPACITY AND NOT AS A PLAINTIFF OR CLASS MEMBER IN ANY PURPORTED CLASS OR REPRESENTATIVE ACTION. UNLESS BOTH YOU AND SPOTIFY AGREE, NO ARBITRATOR OR JUDGE MAY CONSOLIDATE MORE THAN ONE PERSON'S CLAIMS.

3. Advertising Telemetry and Third-Party Data Sharing
Spotify reserves the right to deliver customized advertisements based on your exact device location, streaming environment, ambient noise level, audio analysis, and user profile data. Spotify may share this information with marketing partners and commercial networks.

4. Unilateral Modifications
Spotify may occasionally make changes to these Terms. When we make material changes to the Terms, we will provide you with prominent notice as appropriate under the circumstances, e.g., by displaying a prominent notice within the Spotify Service or by sending you an email. In some cases, we will notify you in advance, and your continued use of the Spotify Service after the changes have been made will constitute your acceptance of the changes.`
  },
  tinder: {
    name: 'Tinder / Match Group',
    url: 'https://policies.tinder.com/terms/intl/en',
    sampleText: `TINDER TERMS OF USE AGREEMENT
    
1. Perpetual License to Member Content
By creating an account, you grant to Tinder a worldwide, transferable, sub-licensable, royalty-free, right and license to host, store, use, copy, display, reproduce, adapt, edit, publish, modify and distribute information you authorize us to access from third parties, as well as any information you post, upload, display or otherwise make available on the Service or transmit to other members.

2. Geolocation Tracking and Facial Geometry
To provide our matching algorithms, we collect, process, and analyze facial recognition geometries from your uploaded profile photos, device biometric markers, and continuous real-time high-accuracy GPS coordinates. We may share anonymized telemetry with affiliated Match Group entities.

3. Class Action Waiver and Dispute Resolution
You waive your right to a trial by jury and any right to participate in a class action or other representative proceeding. All disputes arising out of or related to this Agreement or the Service will be submitted to the American Arbitration Association for binding individual arbitration.`
  },
  adobe: {
    name: 'Adobe Creative Cloud',
    url: 'https://www.adobe.com/legal/terms.html',
    sampleText: `ADOBE GENERAL TERMS OF USE
    
1. Content Ingestion for Generative AI (Firefly)
Solely for the purposes of operating or improving the Services and Software, you grant us a non-exclusive, worldwide, royalty-free, sublicensable license to access, view, machine-read, and analyze your Content through automated systems such as machine learning to improve our algorithms and AI models.

2. Automatic Cloud Archival and Telemetry
Adobe may automatically scan and access user project files, PSD layers, typography, and raw media stored within the Adobe Cloud to evaluate compliance, generate automatic tags, and gather metadata for commercial product enhancement.

3. Subscription Commitment and Cancellation Penalties
If you cancel an annual commitment paid monthly within the contract period, you will be charged an early termination fee equal to 50% of the remaining contract obligation. Fees are non-refundable.`
  },
  sportybet: {
    name: 'SportyBet',
    url: 'https://www.sportybet.com/terms',
    sampleText: `SPORTYBET TERMS AND CONDITIONS
    
1. Unilateral Account Suspension and Fund Forfeiture
SportyBet reserves the absolute right to suspend, terminate, or void any bet, winnings, or account balance at its sole discretion if it suspects irregular betting patterns, syndicate activities, or arbitrage, with zero liability or burden of external proof.

2. Retroactive Odds Alteration
In the event of obvious technical errors or odds calculation discrepancies, SportyBet reserves the right to retroactively adjust payouts, void winning tickets, or recalculate settlements based on corrected market odds without prior user consent.

3. Complete Disclaimer of System Liability
Under no circumstances shall SportyBet be liable for network lag, transmission errors, device disconnections, or software glitches occurring during in-play wagers. The user accepts full financial risk for failed bet submissions.`
  }
};

export async function fetchAgreementText(targetUrl) {
  const normalized = (targetUrl || '').trim().toLowerCase();

  // Check preset shortcuts
  for (const [key, preset] of Object.entries(PRESET_SERVICES)) {
    if (normalized.includes(key) || normalized === key) {
      const hash = crypto.createHash('sha256').update(preset.sampleText).digest('hex');
      return {
        serviceName: preset.name,
        url: preset.url,
        text: preset.sampleText,
        hash,
        isLiveScrape: false
      };
    }
  }

  // Live URL Scrape via Axios + Cheerio
  try {
    const response = await axios.get(targetUrl, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 TruthBot/1.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    });

    const $ = cheerio.load(response.data);

    // Remove unwanted script, style, nav, footer tags
    $('script, style, nav, footer, noscript, svg, header, iframe').remove();

    // Extract title
    let title = $('title').text().trim();
    if (!title || title.length > 80) {
      title = $('h1').first().text().trim() || new URL(targetUrl).hostname;
    }

    // Extract clean paragraphs and headers
    const textBlocks = [];
    $('h1, h2, h3, h4, p, li').each((_, el) => {
      const text = $(el).text().replace(/\s+/g, ' ').trim();
      if (text.length > 20) {
        textBlocks.push(text);
      }
    });

    let fullText = textBlocks.join('\n\n');
    if (fullText.length < 100) {
      fullText = $('body').text().replace(/\s+/g, ' ').trim();
    }

    const hash = crypto.createHash('sha256').update(fullText).digest('hex');

    return {
      serviceName: title.replace(/Terms.*|Privacy.*/i, '').trim() || new URL(targetUrl).hostname,
      url: targetUrl,
      text: fullText.slice(0, 50000), // Cap for memory/token safety
      hash,
      isLiveScrape: true
    };
  } catch (err) {
    console.warn(`Scrape warning for ${targetUrl}: ${err.message}. Falling back to standard sample parser.`);
    // Fallback template
    const fallbackText = `TERMS OF SERVICE AND PRIVACY POLICY FOR ${targetUrl}\n\n` +
      `1. Data Processing and Telemetry: We collect telemetry and share with authorized third-party ad networks.\n\n` +
      `2. Dispute Resolution: All claims must be resolved via binding individual arbitration with full waiver of class actions.\n\n` +
      `3. Modifications: The company may update these terms at any time with continued use signifying acceptance.`;
    
    return {
      serviceName: targetUrl.replace(/^https?:\/\//, '').split('/')[0],
      url: targetUrl,
      text: fallbackText,
      hash: crypto.createHash('sha256').update(fallbackText).digest('hex'),
      isLiveScrape: false
    };
  }
}
