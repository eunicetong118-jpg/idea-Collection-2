import { render, screen, fireEvent } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import IdeaForm from './IdeaForm'

vi.mock('lucide-react', () => ({
  Upload: () => <div data-testid="upload-icon" />,
  X: () => <div data-testid="x-icon" />,
  Loader2: () => <div data-testid="loader-icon" />,
}))

vi.mock('./Toast', () => ({
  default: ({ message }: { message: string }) => <div data-testid="toast">{message}</div>,
}))

describe('IdeaForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn().mockImplementation((url) => {
      if (url === '/api/admin/departments') {
        return Promise.resolve({ ok: true, json: () => Promise.resolve([{ id: '1', name: 'Sales' }]) })
      }
      if (url === '/api/admin/countries') {
        return Promise.resolve({ ok: true, json: () => Promise.resolve([{ id: '1', name: 'USA' }]) })
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) })
    })
  })

  it('should render the new header and intro text', () => {
    render(<IdeaForm subTopicId="sub-1" />)
    expect(screen.getByText('How can we improve our products to increase sales?')).toBeInTheDocument()
    expect(screen.getByText('Tell us about your Idea.')).toBeInTheDocument()
  })

  it('should have the new fields with correct labels', () => {
    render(<IdeaForm subTopicId="sub-1" />)

    expect(screen.getByLabelText(/Title/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Problem/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Solution/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Related Product/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Department/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Country/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Additional Business/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Involvement/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Potential Revenue/i)).toBeInTheDocument()
  })

  it('should NOT have the old fields', () => {
    render(<IdeaForm subTopicId="sub-1" />)

    expect(screen.queryByLabelText(/Target Audience/i)).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/Risks/i)).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/Resources/i)).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/Impact/i)).not.toBeInTheDocument()
  })

  it('should handle revenue as a string', async () => {
    render(<IdeaForm subTopicId="sub-1" />)
    const revenueInput = screen.getByLabelText(/Potential Revenue/i) as HTMLInputElement

    fireEvent.change(revenueInput, { target: { value: '1M USD' } })
    expect(revenueInput.value).toBe('1M USD')
    expect(revenueInput.type).toBe('text')
  })
})
