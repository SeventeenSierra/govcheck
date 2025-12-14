/*
 * SPDX-License-Identifier: PolyForm-Perimeter-1.0.0
 * SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC
 */

import React from 'react';
import type { Decorator } from '@storybook/react';
import { MockStrandsAPIEnhanced } from './mock-strands-api-enhanced';
import { ErrorScenario } from './mock-data-provider';

/**
 * Story decorators and context providers for Storybook
 * Provides consistent mock data and context across all stories
 */

/**
 * Mock API Context for providing mock API instances to stories
 */
export const MockAPIContext = React.createContext<MockStrandsAPIEnhanced | null>(null);

/**
 * Mock API Provider component
 */
interface MockAPIProviderProps {
  children: React.ReactNode;
  mockAPI?: MockStrandsAPIEnhanced;
  errorScenario?: ErrorScenario;
  delay?: number;
}

export const MockAPIProvider: React.FC<MockAPIProviderProps> = ({
  children,
  mockAPI,
  errorScenario,
  delay = 500,
}) => {
  const api = React.useMemo(() => {
    if (mockAPI) return mockAPI;

    // Create a new instance with the specified delay
    // Error scenarios can be handled by the consuming component
    return new MockStrandsAPIEnhanced('http://localhost:8080', delay);
  }, [mockAPI, errorScenario, delay]);

  return <MockAPIContext.Provider value={api}>{children}</MockAPIContext.Provider>;
};

/**
 * Hook to use mock API in components
 */
export const useMockAPI = (): MockStrandsAPIEnhanced => {
  const context = React.useContext(MockAPIContext);
  if (!context) {
    throw new Error('useMockAPI must be used within a MockAPIProvider');
  }
  return context;
};

/**
 * Decorator for providing mock API context to stories
 */
export const withMockAPI = (errorScenario?: ErrorScenario, delay?: number): Decorator => {
  return (Story, context) => {
    // Allow story-level control of error scenarios through parameters
    const storyErrorScenario = context.parameters?.mockAPI?.errorScenario || errorScenario;
    const storyDelay = context.parameters?.mockAPI?.delay || delay;

    return (
      <MockAPIProvider errorScenario={storyErrorScenario} delay={storyDelay}>
        <Story />
      </MockAPIProvider>
    );
  };
};

/**
 * Decorator for providing theme context (light/dark mode)
 */
export const withTheme: Decorator = (Story, context) => {
  const theme = context.parameters?.theme || context.globals?.theme || 'light';

  return (
    <div className={theme === 'dark' ? 'dark' : ''} data-theme={theme}>
      <div className="min-h-screen bg-background text-foreground">
        <Story />
      </div>
    </div>
  );
};

/**
 * Decorator for providing responsive viewport context
 */
export const withResponsive: Decorator = (Story, context) => {
  const viewport = context.parameters?.viewport?.defaultViewport;

  return (
    <div className="w-full h-full" data-viewport={viewport}>
      <Story />
    </div>
  );
};

/**
 * Decorator for providing padding/spacing around stories
 */
export const withPadding = (padding = 'p-4'): Decorator => {
  return (Story) => (
    <div className={padding}>
      <Story />
    </div>
  );
};

/**
 * Decorator for centering stories in the viewport
 */
export const withCentered: Decorator = (Story) => (
  <div className="flex items-center justify-center min-h-screen">
    <Story />
  </div>
);

/**
 * Decorator for providing full-screen layout
 */
export const withFullscreen: Decorator = (Story) => (
  <div className="w-screen h-screen">
    <Story />
  </div>
);

/**
 * Composite decorator that combines common story needs
 * Use individual decorators for now due to TypeScript complexity
 */
export const withCommonDecorators = (
  options: {
    mockAPI?: boolean;
    errorScenario?: ErrorScenario;
    theme?: boolean;
    padding?: string;
    centered?: boolean;
    fullscreen?: boolean;
  } = {}
): Decorator => {
  return (Story) => (
    <div className={options.fullscreen ? 'w-screen h-screen' : ''}>
      <div className={options.centered ? 'flex items-center justify-center min-h-screen' : ''}>
        <div className={options.padding || 'p-4'}>
          <div
            className={options.theme === false ? '' : 'min-h-screen bg-background text-foreground'}
          >
            {options.mockAPI ? (
              <MockAPIProvider errorScenario={options.errorScenario}>
                <Story />
              </MockAPIProvider>
            ) : (
              <Story />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Common story parameters for consistent configuration
 */
export const commonStoryParameters = {
  layout: 'fullscreen' as const,
  docs: {
    description: {
      component: 'Component with mock API and theme support',
    },
  },
  controls: {
    exclude: ['className', 'children'],
  },
};

/**
 * Error scenario story parameters
 */
export const errorScenarioParameters = {
  mockAPI: {
    errorScenario: ErrorScenario.NETWORK_ERROR,
  },
  docs: {
    description: {
      story: 'Demonstrates component behavior during network errors',
    },
  },
};

/**
 * Loading state story parameters
 */
export const loadingStateParameters = {
  mockAPI: {
    delay: 2000, // Longer delay to show loading states
  },
  docs: {
    description: {
      story: 'Demonstrates component loading states with delayed responses',
    },
  },
};

/**
 * Success state story parameters
 */
export const successStateParameters = {
  mockAPI: {
    delay: 100, // Quick response for success scenarios
  },
  docs: {
    description: {
      story: 'Demonstrates successful component operation',
    },
  },
};
