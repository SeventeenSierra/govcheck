<!-- SPDX-License-Identifier: AGPL-3.0-or-later -->
<!-- SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC -->

# Project Instructions

Welcome to **Proposal Prepper**, the open-source compliance checking tool for NSF proposals.

## Architecture
This is a **simulation-first** React application. It runs entirely in the browser using mock data to simulate the full compliance checking workflow.

- **Stack:** Next.js 15, React 19, Tailwind CSS v4
- **Mode:** Simulation (Mock Backend)

## Development

### Prerequisites
- Node.js 20+
- pnpm

### Getting Started
1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Run development server:
   ```bash
   pnpm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000)

## Contribution Guidelines
- **License:** AGPL-3.0-or-later
- **Commits:** We use Conventional Commits (e.g., `feat:`, `fix:`).
- **DCO:** All commits must be signed off (`git commit -s`).

## Note on Backend
This repository contains only the **Frontend** and **Simulation Logic**. The full backend services used in the production `CtrlCheck` environment are part of a separate system.
