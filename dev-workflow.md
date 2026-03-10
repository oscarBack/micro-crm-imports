# Development Workflow

This document outlines the step-by-step process for building the project using a strict "Spec-First" pipeline. This approach ensures all requirements are formalized before any code is written, utilizing Engram and Agent-Teams-Lite.

## Prerequisites

Ensure you have the following tools installed and accessible in your environment:
*   [Engram](https://github.com/Gentleman-Programming/engram)
*   [Agent-Teams-Lite](https://github.com/Gentleman-Programming/agent-teams-lite)

## Step 1: Initialize the Memory Bank with Engram (The Memory)

We need to provide our AI agents with persistent context so they understand the project's architecture and rules across different sessions.

1.  **Start Engram:** Initialize the Engram memory system in your workspace.
    ```bash
    # Example command (adjust based on Engram's actual CLI usage)
    engram init
    ```
2.  **Load the Context:** Feed the formal specification (`draft-prd.md` or `spec.md`) and any architectural guidelines into Engram.
    ```bash
    # Example command
    engram ingest draft-prd.md
    ```

## Step 2: Define Iteration Scope (Incremental Delivery)

Instead of building the entire PRD at once, slice the specification into manageable milestones. This ensures incremental delivery and prevents the agents from failing on massive, context-heavy generations.

1.  **Extract Scope:** Identify the specific baseline features or sub-features from your specification needed for the current sprint.
2.  **Create Iteration Spec:** Create a targeted specification file just for this cycle (e.g., `iteration-1-scope.md`).
3.  **Update Memory:** Log the specific goal of this iteration in Engram so the sub-agents understand their immediate boundaries.

## Step 3: Scaffold and Build with Agent-Teams-Lite (The Workforce)

Now we unleash the specialized sub-agents to read the iteration spec and write the code.

1.  **Configure the Orchestrator:** Point `agent-teams-lite` at your *iteration* specification, ensuring it queries Engram for the broader context.
2.  **Execute the Build:** Run the orchestrator to build the features based on `iteration-1-scope.md`.
    ```bash
    # Example command (adjust based on Agent-Teams-Lite's actual CLI usage)
    agent-teams-lite run --spec iteration-1-scope.md
    ```
3.  **Monitor Progress:** The orchestrator will delegate tasks to its sub-agents (e.g., routing backend tasks to a backend agent, frontend tasks to a frontend agent).

## Summary

1.  `draft-prd.md` -> **Engram** -> (Persistent Context)
2.  `draft-prd.md` -> (Slice into chunks) -> `iteration-1-scope.md`
3.  `iteration-1-scope.md` + Engram -> **Agent-Teams-Lite** -> (Production-Ready Code)
