import { render, screen, fireEvent } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import IdeaCard from './IdeaCard'
import { SessionProvider } from 'next-auth/react'

vi.mock('next-auth/react', () => ({
  useSession: () => ({ data: { user: { email: 'test@example.com', name: 'Test User' } } }),
  SessionProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

describe('IdeaCard', () => {
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
  }

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
})
