# TruthBot: The Autonomous Legal Sentinel 🛡️

**CockroachDB × AWS Hackathon Submission**

TruthBot is an **Autonomous Background Agent** that continuously monitors the Terms of Service (ToS) and Privacy Policies of major tech companies. When companies try to silently update their terms overnight to steal your data or strip your legal rights, TruthBot detects the semantic change, analyzes the risk level, and sends a real-time push notification to your device.

Unlike standard chatbots, TruthBot is a 24/7 autonomous watchdog. It relies heavily on **CockroachDB's persistent memory** to remember what the internet looked like yesterday, so it can protect you today.

---

## 🏆 Hackathon Requirements Fulfilled

### 1. CockroachDB Persistent Memory Layer (Deployed on AWS)
TruthBot utilizes CockroachDB Serverless (hosted on AWS EU-Central-1) as its core memory backbone. The AI agent uses a **Hybrid Memory Architecture**:
- **Transactional Ledger:** Tables like `monitored_agreements`, `agreement_diffs`, and `audit_log` maintain the precise state of the 24/7 background polling loop. If the server goes down, the agent resumes seamlessly with zero data loss.
- **Semantic Memory:** The `predatory_knowledge_base` table stores vector embeddings of known predatory clauses (e.g., forced arbitration, AI training licenses).

### 2. CockroachDB Tools Used (2/2)
1. **Distributed Vector Indexing:** We natively use CockroachDB's `VECTOR(1536)` support to store embeddings of hostile legal clauses. When a document changes, TruthBot performs semantic RAG searches directly inside the database without needing a secondary vector store.
2. **Agent Skills Repo:** The architecture of TruthBot was actively engineered using the official `cockroach-agentic-memory` agent skill (via the open-source Agent Skills ecosystem) to structure our distributed state patterns.

### 3. AWS Services Used
- **Amazon Bedrock:** When TruthBot detects a text diff between two versions of an agreement, it routes the diff through AWS Bedrock (`@aws-sdk/client-bedrock-runtime`). Using **Claude 3**, it autonomously analyzes whether the change is a benign typo fix or a critical "High Risk" predatory update.
- **AWS Infrastructure:** The CockroachDB instance is hosted entirely on AWS.

---

## 🏗️ Architecture Diagram

```mermaid
graph TD
    subgraph TruthBot Ecosystem
        A[Background Poller Engine] -->|Every 5s| B(Scraper / Headless Browser)
        B -->|Fetch Live ToS| C{Diff Detected?}
        C -->|No| A
        C -->|Yes| D[AWS Bedrock - Claude 3]
    end

    subgraph AWS Cloud
        D -->|Semantic Analysis| E[(CockroachDB on AWS)]
        E -->|Store & Query Vectors| D
    end

    subgraph Client Application
        E -->|SSE Stream| F[Frontend Dashboard]
        F -->|Triggers| G[Desktop Push Notification]
    end
```

---

## 🚀 How to Run the App Locally

### 1. Prerequisites
- Node.js (v18+)
- A CockroachDB Serverless Cluster URL
- AWS Credentials (for Bedrock access)

### 2. Installation
```bash
# Clone the repo
git clone https://github.com/YOUR-USERNAME/truthbot.git
cd truthbot

# Install dependencies
npm install
```

### 3. Environment Variables
Create a `.env` file in the root directory:
```env
DATABASE_URL="postgresql://user:password@your-cluster.aws-eu-central-1.cockroachlabs.cloud:26257/defaultdb?sslmode=verify-full"
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="your_access_key"
AWS_SECRET_ACCESS_KEY="your_secret_key"
```

### 4. Start the Application
```bash
# This will start both the Vite frontend (port 3000) and the Express/Agent backend (port 5000)
npm run dev
```

### 5. Testing the Agent
1. Open `http://localhost:3000` in your browser.
2. Enable Push Notifications when prompted.
3. The dashboard will show the active "Test Service" agreement.
4. Go to `server/public/test-service.html` in your code editor and change a sentence (e.g., add "We will sell your data").
5. Within 5 seconds, the autonomous agent will detect the change, write it to CockroachDB, and trigger a push notification on your desktop!

---

## 📝 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
