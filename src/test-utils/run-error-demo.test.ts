/**
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC
 */

import { describe, it } from 'vitest';
import { ErrorMessagingDemo } from './error-demo';

describe('Error Messaging Demo', () => {
  it('should demonstrate improved error messaging', async () => {
    const demo = new ErrorMessagingDemo();
    
    // Run all demonstrations
    demo.demonstrateErrorCategorization();
    demo.demonstrateCompleteWorkflow();
    await demo.demonstrateErrorScenarios();
  });
});