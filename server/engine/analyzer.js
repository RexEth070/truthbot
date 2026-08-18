import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import dotenv from 'dotenv';

dotenv.config();

const bedrockClient = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

export async function analyzeLegalDocument(serviceName, url, rawText) {
  console.log(`🧠 [TruthBot Analyzer] Starting Comprehensive Structural Bedrock Analysis for ${serviceName}...`);

  // We are bypassing manual chunking and keyword matching.
  // Instead, we rely on AWS Bedrock as an expert legal entity.

  let executiveSummary = `TruthBot evaluated the structural integrity of ${serviceName}'s legal agreement.`;
  let uniqueClauses = [];
  let criticalActions = [];

  const expertPrompt = `
You are an elite, world-class legal forensic AI employed by TruthBot. Your expertise is unmatched.
You are tasked with reading a Terms of Service / Legal Agreement and performing a comprehensive "Structural Mapping & Risk Detection".

Analyze the following raw legal text for ${serviceName}.
Look beyond standard keywords. Detect EVERY tricky risk factor, trap, or predatory condition hidden inside standard structural sections such as:
- Data Privacy, Collection, & Monetization
- Arbitration & Dispute Resolution
- Unilateral Modifications (Silent Changes)
- Liability Waivers & Indemnification
- Intellectual Property & User Content Licenses (e.g. AI Training)
- Automatic Renewals & Hidden Fees
- Account Termination Rights

For each distinct risk you find:
1. "clauseTitle": A short, impactful title (e.g., "Binding Arbitration Clause").
2. "clauseText": The specific sentence or paragraph from the text where the risk is hidden.
3. "severity": You MUST classify it strictly as either "Risk" or "High Risk". Do NOT use any other labels.
4. "category": The structural section it belongs to (e.g., "ARBITRATION", "DATA_PRIVACY", "LIABILITY", "IP_RIGHTS", "MODIFICATIONS").
5. "plainEnglish": A blunt, non-corporate explanation of how this hurts the consumer.
6. "riskExplanation": Why this is legally dangerous.
7. "remedy": What the user should do (e.g., "Opt-out within 30 days via email").

Return the output strictly as a valid JSON object matching this schema:
{
  "summary": "A 2-sentence executive summary of the danger level of this agreement.",
  "clauses": [
    {
      "clauseTitle": "string",
      "clauseText": "string",
      "severity": "Risk" | "High Risk",
      "category": "string",
      "plainEnglish": "string",
      "riskExplanation": "string",
      "remedy": "string"
    }
  ],
  "criticalActions": [
    {
      "action": "string",
      "urgency": "string (e.g. HIGH)",
      "description": "string"
    }
  ]
}

Only return the JSON. No markdown wrappers.

Raw Text to Analyze:
${rawText.slice(0, 15000)}
`;

  try {
    const command = new InvokeModelCommand({
      modelId: 'amazon.nova-pro-v1:0', // upgraded to nova-pro for complex reasoning
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify({
        messages: [{ role: 'user', content: [{ text: expertPrompt }] }],
        inferenceConfig: { max_new_tokens: 2000, temperature: 0.1 }
      })
    });

    const bedrockResponse = await bedrockClient.send(command);
    const resBody = JSON.parse(new TextDecoder().decode(bedrockResponse.body));
    let bedrockText = resBody?.output?.message?.content?.[0]?.text;
    
    if (bedrockText) {
      // Strip any accidental markdown formatting the model might output
      bedrockText = bedrockText.replace(/^```json/, '').replace(/```$/, '').trim();
      
      const parsedData = JSON.parse(bedrockText);
      executiveSummary = parsedData.summary || executiveSummary;
      uniqueClauses = parsedData.clauses || [];
      criticalActions = parsedData.criticalActions || [];
    }
  } catch (bedrockErr) {
    console.error('❌ AWS Bedrock structural analysis failed:', bedrockErr.message);
    
    // Fallback if AWS fails so the app doesn't crash completely during a demo
    executiveSummary = "Analysis failed due to model timeout. Assuming high structural risk.";
    uniqueClauses = [
      {
         clauseTitle: "Analysis Error",
         clauseText: "Failed to parse document structure via LLM.",
         severity: "Risk",
         category: "SYSTEM_ERROR",
         plainEnglish: "We couldn't read this document completely.",
         riskExplanation: "The API failed to respond.",
         remedy: "Try again later."
      }
    ];
  }

  return {
    serviceName,
    url,
    summary: executiveSummary,
    clauses: uniqueClauses,
    criticalActions,
    analyzedAt: new Date().toISOString()
  };
}
