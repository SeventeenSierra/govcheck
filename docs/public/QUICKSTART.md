# Quick Start Guide

This guide will help you set up the **GovCheck Web UI** locally for development.

## Prerequisites

- **Node.js**: v18+ (LTS recommended)
- **Package Manager**: [pnpm](https://pnpm.io/) (recommended) or npm/yarn

## Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/SeventeenSierra/govcheck.git
    cd govcheck
    ```

2.  **Install Dependencies**
    ```bash
    pnpm install
    ```

3.  **Run Development Server**
    ```bash
    pnpm dev
    ```

4.  **Open Application**
    Visit http://localhost:3000 in your browser.

## Features

- **Document Upload**: Drag-and-drop interface for proposal documents.
- **Mock Analysis**: The application includes a mock mode to simulate compliance checking without valid backend credentials.
- **Accessibility**: Built with Section 508/WCAG compliance in mind.

## Troubleshooting

- **Node Version**: Ensure you are running Node 18 or higher (`node -v`).
- **Port Conflicts**: Ensure port 3000 is free, or Next.js will auto-assign a different port (check console output).
