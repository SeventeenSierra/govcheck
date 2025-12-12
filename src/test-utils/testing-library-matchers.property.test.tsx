// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC

/**
 * Property-based tests for testing library matcher availability
 * **Feature: test-infrastructure-fixes, Property 2: Testing library matcher availability**
 * **Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5**
 */

import React from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import * as fc from 'fast-check';

describe('Testing Library Matcher Availability', () => {
  it('Property 2: Testing library matcher availability - DOM matchers should be available for all elements', () => {
    fc.assert(
      fc.property(
        fc.record({
          tagName: fc.constantFrom('div', 'span', 'button', 'p', 'h1', 'section'), // Exclude input to avoid void element issues
          textContent: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
          id: fc.option(fc.string({ minLength: 1, maxLength: 20 }), { nil: undefined }),
          className: fc.option(fc.string({ minLength: 1, maxLength: 30 }), { nil: undefined }),
          disabled: fc.option(fc.boolean(), { nil: undefined }),
        }),
        (elementProps) => {
          // Create a test element with the generated properties
          const TestComponent = () => {
            const props: any = {};
            if (elementProps.id) props.id = elementProps.id;
            if (elementProps.className) props.className = elementProps.className;
            if (elementProps.disabled !== undefined && elementProps.tagName === 'button') {
              props.disabled = elementProps.disabled;
            }

            // Use React.createElement to avoid JSX issues with dynamic tag names
            return React.createElement(elementProps.tagName, props, elementProps.textContent);
          };

          const { container } = render(<TestComponent />);
          const element = container.firstChild as HTMLElement;

          // Test that toBeInTheDocument matcher is available and works
          expect(element).toBeInTheDocument();

          // Test that toHaveTextContent matcher is available and works
          // Note: toHaveTextContent trims whitespace, so we need to match the trimmed version
          expect(element).toHaveTextContent(elementProps.textContent.trim());

          // Test conditional matchers based on element properties
          if (elementProps.id) {
            expect(element).toHaveAttribute('id', elementProps.id);
          }

          if (elementProps.className) {
            expect(element).toHaveClass(elementProps.className);
          }

          if (elementProps.disabled !== undefined && elementProps.tagName === 'button') {
            if (elementProps.disabled) {
              expect(element).toBeDisabled();
            } else {
              expect(element).toBeEnabled();
            }
          }

          // Test that the element is visible (not hidden)
          expect(element).toBeVisible();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 2: Testing library matcher availability - Form-specific matchers should work for form elements', () => {
    fc.assert(
      fc.property(
        fc.record({
          inputType: fc.constantFrom('text', 'email', 'password', 'number', 'checkbox', 'radio'),
          value: fc.string({ minLength: 0, maxLength: 20 }),
          checked: fc.boolean(),
          required: fc.boolean(),
          placeholder: fc.option(fc.string({ minLength: 1, maxLength: 30 }), { nil: undefined }),
        }),
        (formProps) => {
          // Skip edge cases that browsers handle inconsistently
          if (formProps.inputType !== 'checkbox' && formProps.inputType !== 'radio') {
            if (formProps.value !== formProps.value.trim()) {
              return true; // Skip values with leading/trailing whitespace
            }
          }
          
          const TestForm = () => (
            <form>
              <input
                type={formProps.inputType}
                value={formProps.inputType === 'checkbox' || formProps.inputType === 'radio' ? undefined : formProps.value}
                checked={formProps.inputType === 'checkbox' || formProps.inputType === 'radio' ? formProps.checked : undefined}
                required={formProps.required}
                placeholder={formProps.placeholder}
                readOnly={formProps.inputType !== 'checkbox' && formProps.inputType !== 'radio'}
              />
            </form>
          );

          const { container } = render(<TestForm />);
          const input = container.querySelector('input') as HTMLInputElement;

          // Test that form-specific matchers are available
          expect(input).toBeInTheDocument();

          if (formProps.inputType === 'checkbox' || formProps.inputType === 'radio') {
            if (formProps.checked) {
              expect(input).toBeChecked();
            } else {
              expect(input).not.toBeChecked();
            }
          } else if (formProps.value.trim().length > 0) {
            if (formProps.inputType === 'number') {
              const numValue = Number(formProps.value);
              if (!isNaN(numValue)) {
                expect(input).toHaveValue(numValue);
              }
              // Skip assertion for invalid number values like ":"
            } else {
              // For text inputs, check the actual value matches what we set
              const actualValue = (input as HTMLInputElement).value;
              expect(actualValue).toBe(formProps.value);
            }
          }

          if (formProps.required) {
            expect(input).toBeRequired();
          } else {
            expect(input).not.toBeRequired();
          }

          if (formProps.placeholder) {
            expect(input).toHaveAttribute('placeholder', formProps.placeholder);
          }

          // Test that the input is valid only if it's not a required checkbox/radio that's unchecked
          if (formProps.required && (formProps.inputType === 'checkbox' || formProps.inputType === 'radio') && !formProps.checked) {
            expect(input).toBeInvalid();
          } else {
            expect(input).toBeValid();
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 2: Testing library matcher availability - Accessibility matchers should work for elements with ARIA attributes', () => {
    fc.assert(
      fc.property(
        fc.record({
          role: fc.constantFrom('button', 'link', 'heading', 'textbox', 'checkbox', 'radio'),
          ariaLabel: fc.option(fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0), { nil: undefined }),
          ariaDescribedBy: fc.option(fc.string({ minLength: 1, maxLength: 20 }), { nil: undefined }),
          ariaExpanded: fc.option(fc.boolean(), { nil: undefined }),
        }),
        (ariaProps) => {
          const TestComponent = () => {
            const props: any = { role: ariaProps.role };
            if (ariaProps.ariaLabel) props['aria-label'] = ariaProps.ariaLabel;
            if (ariaProps.ariaDescribedBy) props['aria-describedby'] = ariaProps.ariaDescribedBy;
            if (ariaProps.ariaExpanded !== undefined) props['aria-expanded'] = ariaProps.ariaExpanded;

            return <div {...props}>Test content</div>;
          };

          const { container } = render(<TestComponent />);
          const element = container.firstChild as HTMLElement;

          // Test that accessibility matchers are available
          expect(element).toBeInTheDocument();
          expect(element).toHaveRole(ariaProps.role);

          if (ariaProps.ariaLabel) {
            // Accessible names normalize whitespace (multiple spaces become single spaces)
            const normalizedLabel = ariaProps.ariaLabel.trim().replace(/\s+/g, ' ');
            expect(element).toHaveAccessibleName(normalizedLabel);
          }

          if (ariaProps.ariaDescribedBy) {
            expect(element).toHaveAttribute('aria-describedby', ariaProps.ariaDescribedBy);
          }

          if (ariaProps.ariaExpanded !== undefined) {
            expect(element).toHaveAttribute('aria-expanded', ariaProps.ariaExpanded.toString());
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});