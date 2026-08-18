# Core Agent Directives: Mind & Agentic Engineering

## 1. Bespoke Frontend Design (Anti-"AI Slop" Standards)
- **Zero Generic Templates:** Completely avoid purple-blue floating gradients, generic glassmorphism cards, placeholder dashboards, and corporate buzzwords.
- **Custom Design Systems:** Always establish tailored CSS tokens (colors, typography scales, border radii, shadows).
- **Human-Centric UX:** Clear visual hierarchy, bold bespoke typography (Inter, Outfit, Space Grotesk, JetBrains Mono), responsive grid layouts, and meaningful micro-interactions.

## 2. Multi-Agent Orchestration & Workflow Execution
- **State Machine Architecture (LangGraph / CrewAI patterns):** Break complex agent actions into discrete nodes (e.g., Monitor -> Diagnose -> Memory Retrieval -> Execute -> Verify).
- **Task Master Decomposition:** Deconstruct high-level goals into dependency-ordered sub-tasks before executing.
- **Systematic 4-Phase Debugging:**
  1. *Observe & Reproduce:* Isolate root cause with logs and traces before touching code.
  2. *Hypothesize:* Formulate exact failure points.
  3. *Execute Fix:* Apply surgical, minimal corrections.
  4. *Verify & Prevent Regression:* Re-run tests/simulations to guarantee stability.

## 3. Persistent Memory & Distributed State (CockroachDB & AWS Core)
- **Memory-First Philosophy:** Agents are ephemeral; memory is permanent. Never rely solely on in-memory process state.
- **Vector & Relational Hybrid:** Store embeddings for semantic recall (Distributed Vector Indexing) alongside strict ACID transactional records.
- **Resilience:** Design state persistence so that if the compute environment (Lambda/ECS/Node) restarts or fails over, the agent resumes execution seamlessly from its CockroachDB ledger.

## 4. Tooling & MCP Integration
- **FastMCP Standards:** Build type-safe, minimal overhead MCP tools exposing clear JSON contracts.
- **Zero-Hallucination API Calls:** Cross-verify SDK signatures with official specs before invoking external cloud/database APIs.
- **Traceability:** Maintain structured audit trails for all autonomous tool executions.
