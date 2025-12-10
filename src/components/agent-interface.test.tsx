
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AgentInterface from './agent-interface';

// Mock the UI components used in AgentInterface
vi.mock('@17sierra/ui', () => ({
  Button: ({ children, onClick, disabled, className, ...props }: any) => (
    <button onClick={onClick} disabled={disabled} className={className} {...props}>
      {children}
    </button>
  ),
  Textarea: ({ value, onChange, placeholder, className, ...props }: any) => (
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={className}
      {...props}
    />
  ),
}));

describe('AgentInterface', () => {
  it('renders correctly in initial state', () => {
    const startDemo = vi.fn();
    render(<AgentInterface activeProject={null} startDemo={startDemo} />);

    expect(screen.getByText('Vendor Proposal Compliance')).toBeInTheDocument();
    expect(screen.getByText('Autonomous agent for federal procurement compliance.')).toBeInTheDocument();
    expect(screen.getByText('Analyze Proposal Compliance')).toBeInTheDocument();
  });

  it('calls startDemo when "Analyze Proposal Compliance" is clicked', () => {
    const startDemo = vi.fn();
    render(<AgentInterface activeProject={null} startDemo={startDemo} />);

    const button = screen.getByText('Analyze Proposal Compliance').closest('button');
    expect(button).not.toBeNull();
    fireEvent.click(button!);

    expect(startDemo).toHaveBeenCalledTimes(1);
  });

  it('renders analysis state correctly when activeProject is set', () => {
    const startDemo = vi.fn();
    render(<AgentInterface activeProject="demo-running" startDemo={startDemo} />);

    // Check if header text changes
    expect(screen.getByText('Analyzing "Proposal_v1.docx" against current FAR/DFARS standards.')).toBeInTheDocument();

    // Check tabs
    expect(screen.getByText('Results')).toBeInTheDocument();
    expect(screen.getByText('Analysis steps')).toBeInTheDocument();
  });

  it('allows input in the textarea', () => {
    const startDemo = vi.fn();
    render(<AgentInterface activeProject={null} startDemo={startDemo} />);

    const textarea = screen.getByPlaceholderText('Ask follow-up questions...');
    fireEvent.change(textarea, { target: { value: 'Hello' } });

    expect(textarea).toHaveValue('Hello');
  });
});
