// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC

import '@testing-library/jest-dom';
import './src/test-utils/vitest-dom.d.ts';

// Ensure DOM matchers are available globally
// This import extends the expect interface with DOM-specific matchers
// like toBeInTheDocument, toHaveValue, toBeDisabled, etc.

// Property-based testing configuration
// Note: fast-check should be installed as a dev dependency
// Run: pnpm add -D fast-check
