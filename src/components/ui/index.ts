// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC

/**
 * UI Component Library Integration
 * 
 * Centralized exports and configuration for @17sierra/ui components
 * used in the threshold functionality. Provides a consistent interface
 * for importing UI components across the application.
 */

// Re-export commonly used components from @17sierra/ui
// These will be the primary UI building blocks for threshold components
export {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Progress,
  Alert,
  AlertDescription,
  AlertTitle,
  Badge,
  Separator,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Toast,
  Toaster,
  useToast,
} from '@17sierra/ui';

/**
 * Theme Configuration
 * 
 * Threshold-specific theme customizations and styling utilities
 * that extend the base @17sierra/ui theme.
 */
export const thresholdTheme = {
  colors: {
    // Status colors for upload and analysis states
    upload: {
      pending: 'hsl(var(--muted))',
      uploading: 'hsl(var(--primary))',
      processing: 'hsl(var(--secondary))',
      completed: 'hsl(var(--success))',
      failed: 'hsl(var(--destructive))',
    },
    analysis: {
      queued: 'hsl(var(--muted))',
      extracting: 'hsl(var(--primary))',
      analyzing: 'hsl(var(--primary))',
      validating: 'hsl(var(--secondary))',
      completed: 'hsl(var(--success))',
      failed: 'hsl(var(--destructive))',
    },
    compliance: {
      pass: 'hsl(var(--success))',
      warning: 'hsl(var(--warning))',
      fail: 'hsl(var(--destructive))',
    },
  },
} as const;

/**
 * Component Variants
 * 
 * Threshold-specific component variants that extend the base
 * @17sierra/ui component variants for consistent styling.
 */
export const variants = {
  button: {
    upload: 'bg-blue-600 hover:bg-blue-700 text-white',
    analyze: 'bg-green-600 hover:bg-green-700 text-white',
    results: 'bg-purple-600 hover:bg-purple-700 text-white',
  },
  badge: {
    status: {
      pending: 'bg-gray-100 text-gray-800',
      processing: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
    },
  },
} as const;