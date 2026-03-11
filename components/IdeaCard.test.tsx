import { render, screen, fireEvent } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import IdeaCard from './IdeaCard'
import { SessionProvider } from 'next-auth/react'

const mockSession = vi.fn()

vi.mock('next-auth/react', () => ({
  useSession: () => mockSession(),
  SessionProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

describe('IdeaCard', () => {
  const longProblem = 'word '.repeat(101)
  const shortProblem = 'word '.repeat(50)

  const mockIdea = {
    _id: '1',
    title: 'Test Idea',
    problem: 'Test Problem',
    solution: 'Test Solution',
    relatedProduct: 'Product X',
    department: 'Sales',
    country: 'USA',
    additionalBusiness: 'Extra info',
    involvement: 'High',
    revenue: '1M USD',
    userId: 'user-1',
    userName: 'User One',
    createdAt: new Date().toISOString(),
    stage: 'Idea',
    stage_status: 'Pending',
    likes: [],
    commentCount: 0,
    summary: 'AI Summary Content',
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockSession.mockReturnValue({ data: { user: { email: 'admin@example.com', isAdmin: true } } })
  })

  it('should display the new fields when expanded', () => {
    render(<IdeaCard idea={mockIdea as any} />)

    // Toggle details
    const viewButton = screen.getByText(/VIEW_FULL_CARD/i)
    fireEvent.click(viewButton)

    expect(screen.getByText('Related Product')).toBeInTheDocument()
    expect(screen.getByText('Product X')).toBeInTheDocument()

    expect(screen.getByText('Additional Business')).toBeInTheDocument()
    expect(screen.getByText('Extra info')).toBeInTheDocument()

    expect(screen.getByText('Development Involvement')).toBeInTheDocument()
    expect(screen.getByText('High')).toBeInTheDocument()

    expect(screen.getByText(/1M USD/)).toBeInTheDocument()
  })

  it('should handle numeric revenue for backward compatibility', () => {
    const oldIdea = { ...mockIdea, revenue: 1000000 }
    render(<IdeaCard idea={oldIdea as any} />)

    const viewButton = screen.getByText(/VIEW_FULL_CARD/i)
    fireEvent.click(viewButton)

    expect(screen.getByText(/\$1,000,000/)).toBeInTheDocument()
  })

  it('should show AI summary on hover for admins when problem is > 100 words', () => {
    const ideaWithLongProblem = { ...mockIdea, problem: longProblem }
    render(<IdeaCard idea={ideaWithLongProblem as any} />)

    const title = screen.getByTestId('idea-title')
    fireEvent.mouseEnter(title)

    expect(screen.getByText('AI_SYNTHESIS_SUMMARY')).toBeInTheDocument()
    expect(screen.getByText(/"AI Summary Content"/)).toBeInTheDocument()

    fireEvent.mouseLeave(title)
    expect(screen.queryByText('AI_SYNTHESIS_SUMMARY')).not.toBeInTheDocument()
  })

  it('should NOT show AI summary when hovering other parts of the card', () => {
    const ideaWithLongProblem = { ...mockIdea, problem: longProblem }
    render(<IdeaCard idea={ideaWithLongProblem as any} />)

    const problemText = screen.getByTestId('idea-problem-text')
    fireEvent.mouseEnter(problemText)

    expect(screen.queryByText('AI_SYNTHESIS_SUMMARY')).not.toBeInTheDocument()
  })

  it('should NOT show AI summary for non-admins even if problem is > 100 words', () => {
    mockSession.mockReturnValue({ data: { user: { email: 'user@example.com', isAdmin: false } } })
    const ideaWithLongProblem = { ...mockIdea, problem: longProblem }
    render(<IdeaCard idea={ideaWithLongProblem as any} />)

    const title = screen.getByTestId('idea-title')
    fireEvent.mouseEnter(title)

    expect(screen.queryByText('AI_SYNTHESIS_SUMMARY')).not.toBeInTheDocument()
  })

  it('should NOT show AI summary if problem is <= 100 words', () => {
    const ideaWithShortProblem = { ...mockIdea, problem: shortProblem }
    render(<IdeaCard idea={ideaWithShortProblem as any} />)

    const title = screen.getByTestId('idea-title')
    fireEvent.mouseEnter(title)

    expect(screen.queryByText('AI_SYNTHESIS_SUMMARY')).not.toBeInTheDocument()
  })

  it('should show status controls ONLY when hovering the status section', () => {
    render(<IdeaCard idea={mockIdea as any} />)

    // Initially hidden
    expect(screen.getByTestId('admin-status-controls')).toHaveClass('opacity-0')

    // Hover status section
    const statusSection = screen.getByTestId('idea-status-section')
    fireEvent.mouseEnter(statusSection)
    expect(screen.getByTestId('admin-status-controls')).not.toHaveClass('opacity-0')

    // Leave status section
    fireEvent.mouseLeave(statusSection)
    expect(screen.getByTestId('admin-status-controls')).toHaveClass('opacity-0')

    // Hover title should NOT show status controls
    const title = screen.getByTestId('idea-title')
    fireEvent.mouseEnter(title)
    expect(screen.getByTestId('admin-status-controls')).toHaveClass('opacity-0')
  })
})
