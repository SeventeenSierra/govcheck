// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC

import { ai } from "./client";

/**
 * Example function to test AI summarization.
 */
export async function testSummarization() {
    console.log("Testing AI summarization...");
    try {
        const result = await ai.summarize({
            reportText: "This is a compliance report. Section 1 states that all data must be encrypted. Section 2 states that access logs must be retained for 1 year.",
        });
        console.log("Summary Result:", result);
        return result;
    } catch (error) {
        console.error("AI Summarization Failed:", error);
        throw error;
    }
}
