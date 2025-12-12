/*
 * SPDX-License-Identifier: PolyForm-Perimeter-1.0.0
 * SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC
 */

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ProposalPrepperApp } from './proposal-prepper-app';

describe('ProposalPrepperApp - Integration', () => {
  it('should render without crashing', () => {
    expect(() => render(<ProposalPrepperApp />)).not.toThrow();
  });

  it('should be importable', () => {
    expect(ProposalPrepperApp).toBeDefined();
    expect(typeof ProposalPrepperApp).toBe('function');
  });
});