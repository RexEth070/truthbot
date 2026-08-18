# CLAUDE.md - Project Directives for Mind

## Project Overview
- **Name:** Mind
- **Mission:** Autonomous SRE Swarm powered by CockroachDB Agentic Memory & AWS.
- **Key Architecture:**
  - **Memory Layer:** CockroachDB Cloud (Distributed Vector Indexing + ACID State Ledger + Cloud MCP).
  - **Compute & Orchestration:** AWS Lambda / ECS + LangGraph-style state machine agent workflows.
  - **Frontend:** Bespoke, high-fidelity UI (Vanilla CSS tokens, Space Grotesk / JetBrains Mono typography, zero generic templates).

## Critical Guidelines for Claude Code

### 1. Frontend & Visual Standards (Zero AI Slop)
- Avoid generic SaaS purple-blue floating gradients, ungrounded glowing cards, and stock dashboard grids.
- Establish clean CSS token systems for all typography, spacing, and colors.
- Build human-centric, responsive layouts with purposeful micro-interactions.

### 2. Multi-Agent Orchestration
- Structure multi-agent workflows as explicit state graphs (Monitor -> Diagnose -> Memory Retrieval -> Execute -> Verify).
- Deconstruct complex PRDs and tasks into dependency-ordered sub-tasks before executing.
- Follow a 4-phase systematic debugging pipeline: Observe -> Hypothesize -> Execute surgical fix -> Verify.

### 3. Persistent Agentic Memory (CockroachDB Core)
- Agents are ephemeral; state is permanent. Always persist intermediate agent deductions and incident logs in CockroachDB.
- Utilize CockroachDB Distributed Vector Indexing for semantic pattern recall and ACID tables for transactional locks and state.

### 4. Tooling & MCP
- FastMCP standards for type-safe tool definitions with clear JSON schemas.
- Zero-hallucination API calls: verify AWS SDK and CockroachDB API contracts before executing.
