import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import TopBar from '@/components/layout/top-bar'

describe('TopBar', () => {
  it('renders correctly', () => {
    render(<TopBar toggleSidebar={() => {}} isSidebarOpen={true} />)
    expect(screen.getByText('ATARC Agentic AI Lab')).toBeInTheDocument()
  })

  it('calls toggleSidebar when button is clicked', () => {
    let clicked = false
    const toggle = () => { clicked = true }
    render(<TopBar toggleSidebar={toggle} isSidebarOpen={true} />)

    expect(screen.getByText('ATARC Agentic AI Lab')).toBeInTheDocument()

    const button = screen.getByTitle('Close Sidebar')
    fireEvent.click(button)
    expect(clicked).toBe(true)
  })
})
