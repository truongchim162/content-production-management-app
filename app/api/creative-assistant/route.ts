import { generateText } from 'ai'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const prompt = typeof body?.prompt === 'string' ? body.prompt.trim() : ''
    const rawMessages = Array.isArray(body?.messages) ? body.messages : []
    type NormalizedMessage = { role: 'user' | 'assistant' | 'system'; content: string }
    const messages: NormalizedMessage[] = rawMessages
      .filter((message: unknown): message is { role: 'user' | 'assistant' | 'system'; text?: string; content?: string } => {
        if (!message || typeof message !== 'object') return false
        const candidate = message as { role?: unknown; text?: unknown; content?: unknown }
        return ['user', 'assistant', 'system'].includes(String(candidate.role)) && (typeof candidate.text === 'string' || typeof candidate.content === 'string')
      })
      .map((message: { role: 'user' | 'assistant' | 'system'; text?: string; content?: string }): NormalizedMessage => ({ role: message.role, content: message.content || message.text || '' }))
      .filter((message: NormalizedMessage) => message.content.trim())
    const userMessage = prompt ? [{ role: 'user' as const, content: prompt }] : []
    const result = await generateText({
      model: 'google/gemini-3-flash',
      system: 'Bạn là Trợ lý Sáng tạo Ý tưởng HAPPYORSAD cho team thời trang nam. Trả lời bằng tiếng Việt, thực tế, giàu hình ảnh. Khi được hỏi ý tưởng, luôn đề xuất tiêu đề, hook, insight, format, shot gợi ý và CTA ngắn gọn.',
      messages: [...messages, ...userMessage].slice(-12),
    })
    return Response.json({ text: result.text })
  } catch (error) {
    console.error('[v0] Creative assistant failed:', error)
    const message = error instanceof Error ? error.message : String(error)
    if (message.includes('customer_verification_required') || message.includes('valid credit card')) {
      return Response.json({ error: 'AI Gateway chưa được mở khóa cho workspace. Hãy thêm phương thức thanh toán hợp lệ trong Vercel AI Gateway, sau đó thử lại.' }, { status: 503 })
    }
    return Response.json({ error: 'Không thể kết nối trợ lý AI lúc này. Vui lòng thử lại sau.' }, { status: 500 })
  }
}
