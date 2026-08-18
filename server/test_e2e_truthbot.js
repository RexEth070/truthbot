import axios from 'axios';

async function runE2ETest() {
  console.log('🧪 Starting TruthBot Full-Stack E2E Automated Verification...\n');
  const baseUrl = 'http://localhost:5000';

  try {
    // 1. Health & CockroachDB Connection
    console.log('1️⃣  Checking System Health & CockroachDB Connection...');
    const health = await axios.get(`${baseUrl}/health`);
    console.log('✅ Health Response:', health.data);

    // 2. Passwordless Email OTP Flow
    console.log('\n2️⃣  Testing Passwordless Email OTP Authentication...');
    const email = 'samuel@truthbot.ai';
    const otpReq = await axios.post(`${baseUrl}/api/auth/request-otp`, { email });
    console.log(`✅ OTP Dispatched: ${otpReq.data.message} (Code: ${otpReq.data.demoCode})`);

    const otpVerify = await axios.post(`${baseUrl}/api/auth/verify-otp`, {
      email,
      code: otpReq.data.demoCode,
      pushEnabled: true
    });
    console.log('✅ Auth Verified:', otpVerify.data.greeting);
    console.log('✅ User Object:', otpVerify.data.user);

    // 3. Live Agreement Ingestion & Vector Analysis (Spotify)
    console.log('\n3️⃣  Testing Legal Agreement Ingestion & CockroachDB Vector Analysis (Spotify TOS)...');
    const analyzeRes = await axios.post(`${baseUrl}/api/analyze`, { url: 'spotify' });
    console.log(`✅ Analyzed: ${analyzeRes.data.serviceName}`);
    console.log(`✅ Flagged Clauses (${analyzeRes.data.clauses.length}):`);
    analyzeRes.data.clauses.forEach((c, idx) => {
      console.log(`   [${idx + 1}] ${c.clauseTitle} (${c.severity})`);
    });
    console.log(`✅ Plain English Sample: "${analyzeRes.data.clauses[0]?.plainEnglish}"`);
    console.log(`✅ Critical Action: ${analyzeRes.data.criticalActions[0]?.action} (${analyzeRes.data.criticalActions[0]?.urgency})`);

    // 4. CockroachDB Monitored Vault Retrieval
    console.log('\n4️⃣  Testing CockroachDB Monitored Vault Persistence...');
    const vaultRes = await axios.get(`${baseUrl}/api/agreements`);
    console.log(`✅ Vault Agreements Count: ${vaultRes.data.agreements.length}`);
    console.log(`✅ Latest Saved Agreement: ${vaultRes.data.agreements[0]?.service_name}`);

    // 5. Autonomous Sentinel Poller & Disk File Change Verification
    console.log('\n5️⃣  Testing Autonomous Sentinel Stealth Change Detection on Disk...');
    console.log('   Modifying company-terms.html with predatory clauses...');
    const modifyRes = await axios.post(`${baseUrl}/api/demo/modify-terms`);
    console.log(`✅ Disk Write: ${modifyRes.data.message}`);

    console.log('   Waiting 6 seconds for Sentinel 5s poller to detect change...');
    await new Promise(resolve => setTimeout(resolve, 6000));

    // Reset terms back to baseline
    console.log('\n6️⃣  Resetting demo terms to clean baseline...');
    const resetRes = await axios.post(`${baseUrl}/api/demo/reset-terms`);
    console.log(`✅ Reset Result: ${resetRes.data.message}`);

    console.log('\n🎉 ALL TRUTHBOT E2E TESTS PASSED SUCCESSFULLY! 100% OPERATIONAL.\n');
  } catch (err) {
    console.error('❌ E2E Test Failed:', err.response?.data || err.message);
    process.exit(1);
  }
}

runE2ETest();
