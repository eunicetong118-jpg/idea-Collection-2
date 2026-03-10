import { vi, describe, it, expect, beforeEach } from 'vitest'
import { POST } from './route'
import { NextRequest } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { getToken } from 'next-auth/jwt'

vi.mock('@/lib/mongodb', () => ({
  getDb: vi.fn(),
}))

vi.mock('next-auth/jwt', () => ({
  getToken: vi.fn(),
}))

vi.mock('@/lib/ai/similarity', () => ({
  checkSimilarity: vi.fn(),
  generateEmbedding: vi.fn(),
}))

vi.mock('@/lib/ai/summarize', () => ({
  generateSummary: vi.fn(),
}))

describe('POST /api/ideas', () => {
  const mockDb = {
    collection: vi.fn().mockReturnThis(),
    insertOne: vi.fn().mockResolvedValue({ insertedId: 'mock-id' }),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    ;(getDb as any).mockResolvedValue(mockDb)
    ;(getToken as any).mockResolvedValue({ email: 'test@example.com', name: 'Test User' })
  })

  it('should require the new fields and return 400 if missing', async () => {
    const request = new NextRequest('http://localhost/api/ideas', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Test Title',
        problem: 'Test Problem',
        solution: 'Test Solution',
        // Missing relatedProduct, department, country, additionalBusiness, involvement, revenue
        subTopicId: 'sub-topic-1',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Missing required fields')
  })

  it('should successfully save an idea with the new fields', async () => {
    const ideaData = {
      title: 'New Idea',
      problem: 'Old problem',
      solution: 'New solution',
      relatedProduct: 'Product X',
      department: 'Sales',
      country: 'USA',
      additionalBusiness: 'Extra info',
      involvement: 'High',
      revenue: '1M USD',
      subTopicId: 'sub-topic-1',
    }

    const request = new NextRequest('http://localhost/api/ideas', {
      method: 'POST',
      body: JSON.stringify(ideaData),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)

    expect(mockDb.insertOne).toHaveBeenCalledWith(expect.objectContaining({
      ...ideaData,
      userId: 'test@example.com',
      userName: 'Test User',
    }))
  })

  it('should include relatedProduct in combinedText for similarity check', async () => {
    const { checkSimilarity } = await import('@/lib/ai/similarity')
    const ideaData = {
      title: 'Similar Title',
      problem: 'Similar problem',
      solution: 'Similar solution',
      relatedProduct: 'Unique Product',
      department: 'Sales',
      country: 'USA',
      additionalBusiness: 'Extra info',
      involvement: 'High',
      revenue: '1M USD',
      subTopicId: 'sub-topic-1',
    }

    const request = new NextRequest('http://localhost/api/ideas', {
      method: 'POST',
      body: JSON.stringify(ideaData),
    })

    await POST(request)

    const expectedCombinedText = `${ideaData.title}\n${ideaData.problem}\n${ideaData.solution}\n${ideaData.relatedProduct}`
    expect(checkSimilarity).toHaveBeenCalledWith(expectedCombinedText)
  })
})
