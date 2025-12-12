/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC
 */

/**
 * Seed data utilities for testing with real grant proposal data
 * 
 * This module provides access to the AATB dataset from grant-trace repository
 * for testing proposal compliance analysis functionality.
 */

export * from './types';
export * from './grants';

// Re-export commonly used functions for convenience
export {
  seedGrants,
  getRandomSeedGrant,
  getSeedGrantById,
  getFundedGrants,
  getGrantsByFunder,
  getNSFGrants,
  seedGrantToUploadSession,
  seedGrantToAnalysisResult,
} from './grants';