// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC

import { getAIProvider, type AIProvider } from "@17sierra/ai-flows";

/**
 * Shared AI instance for Proposal Prepper.
 * Automatically switches between Mock/Genkit/Strands based on env vars.
 */
export const ai: AIProvider = getAIProvider();

// Helper to log which provider is active (for debugging)
console.log(`[proposal-prepper] AI Provider initialized.`);
