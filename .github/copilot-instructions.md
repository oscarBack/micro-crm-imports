# Project Guidelines

## Code Style
- This project adheres to a strict "Spec-First" pipeline. Requirements must be formalized in specification documents before any code is written. 

## Architecture
- **Purpose**: A Micro CRM specialized in order management for merchandising orders (e.g., Korean merchandise imports).
- **Core Entities**: The strict hierarchical data structure consists of Providers, Orders, Sub-Orders, and Clients.
- **Interfaces**: An Admin Portal (data-dense, performant tables, actionable features) and a Client Portal (mobile-first, summary and detail views, progressive disclosure).
- For complete system requirements and conceptual models, refer to `draft-prd.md`.

## Build and Test
The workflow relies on specialized AI tooling rather than traditional build commands at this stage:
- **Engram (Memory Bank)**: 
  - Initialize with `engram init`
  - Load context with `engram ingest draft-prd.md` (or specific iteration specs)
- **Agent-Teams-Lite (Workforce)**:
  - Generate code dynamically based on sliced milestone files (e.g., `iteration-1-scope.md`)
  - Execute builds via `agent-teams-lite run --spec iteration-1-scope.md`

## Conventions
- **Incremental Delivery**: Never build the entire PRD at once. Always extract specific baseline features into an iteration scope file before using the build orchestrator.
- **Workflow Enforcement**: Follow the step-by-step process outlined in `dev-workflow.md` to ensure memory is updated and sub-agents understand their immediate boundaries.
