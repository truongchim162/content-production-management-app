import { generateText } from 'ai'

export async function POST(request: Request) {
  try {
    const { messages = [], prompt = '' } = await request.json()
    const result = await generateText({
      model: 'google/gemini-3-flash',
      system: 'Bạn là Trợ lý Sáng tạo Ý tưởng HAPPYORSAD cho team thời trang nam. Trả lời bằng tiếng Việt, thực tế, giàu hình ảnh. Khi được hỏi ý tưởng, luôn đề xuất tiêu đề, hook, insight, format, shot gợi ý và CTA ngắn gọn.',
      messages: [...messages, { role: 'user', content: prompt }].slice(-12),
    })
    return Response.json({ text: result.text })
  } catch (error) {
    console.error('[v0] Creative assistant failed:', error)
    return Response.json({ error: 'Không thể kết nối trợ lý AI lúc này.' }, { status: 500 })
  }
}
