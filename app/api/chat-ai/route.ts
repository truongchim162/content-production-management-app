const SYSTEM_PROMPT = `Bạn là Chuyên gia Chiến lược Content & Scriptwriter hàng đầu cho thương hiệu thời trang nam công sở HAPPYORSAD (chuyên Quần âu sidetab/cạp chun ẩn/xếp li, Áo sơ mi chống nhăn, Polo).

Quy tắc bắt buộc:
- Tuyệt đối không trả lời ngắn ngủi, chung chung hay hời hợt.
- Phải bám sát câu hỏi và chỉ trả lời những gì người dùng đang hỏi.
- Luôn phân tích sâu góc nhìn thời trang và tâm lý nam giới 20-30 tuổi.
- Khi người dùng hỏi về ý tưởng hoặc kịch bản, đưa ra Shotlist chi tiết theo bảng hoặc danh sách: Góc quay | Hành động | Voice/Text | Outfit.
- Đưa ra ít nhất 3 câu Hook cho 3 giây đầu, đánh trúng một pain point cụ thể.
- Nếu thiếu thông tin, hỏi lại tối đa 2 câu trước khi kết luận; không tự bịa dữ liệu sản phẩm.
- Trả lời bằng tiếng Việt, có cấu trúc rõ ràng, dùng tiêu đề và bullet dễ copy vào brief.
- Kết thúc bằng một CTA hoặc bước hành động cụ thể.`

type ChatMessage = { role: 'user' | 'assistant'; content: string }

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const prompt = typeof body?.prompt === 'string' ? body.prompt.trim() : ''
    if (!prompt) return Response.json({ error: 'Vui lòng nhập câu hỏi cho trợ lý AI.' }, { status: 400 })

    type RawMessage = { role?: unknown; text?: unknown; content?: unknown }
    const messages: ChatMessage[] = (Array.isArray(body?.messages) ? body.messages : [])
      .filter((message: unknown): message is RawMessage => {
        if (!message || typeof message !== 'object') return false
        const item = message as { role?: unknown; text?: unknown; content?: unknown }
        return (item.role === 'user' || item.role === 'assistant') && (typeof item.text === 'string' || typeof item.content === 'string')
      })
      .map((message: RawMessage): ChatMessage => ({ role: message.role as ChatMessage['role'], content: String(message.content || message.text || '').trim() }))
      .filter((message: ChatMessage) => message.content.length > 0)
      .slice(-10)

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY
    if (!apiKey) return Response.json({ error: 'Chưa cấu hình GEMINI_API_KEY trên server.' }, { status: 503 })

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [...messages, { role: 'user' as const, content: prompt }].map((message: ChatMessage) => ({
          role: message.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: message.content }],
        })),
        generationConfig: { temperature: 0.7, maxOutputTokens: 1800 },
      }),
    })
    const data = await response.json()
    if (!response.ok) {
      console.error('[v0] Gemini server request failed:', response.status, data?.error?.message)
      return Response.json({ error: 'Gemini không thể xử lý câu hỏi lúc này. Kiểm tra API key, Generative Language API và quota rồi thử lại.' }, { status: 502 })
    }
    const text = data?.candidates?.[0]?.content?.parts?.map((part: { text?: string }) => part.text || '').join('').trim()
    if (!text) return Response.json({ error: 'Gemini trả về nội dung rỗng. Vui lòng thử lại với câu hỏi cụ thể hơn.' }, { status: 502 })
    return Response.json({ text, mode: 'gemini' })
  } catch (error) {
    console.error('[v0] Gemini chat route failed:', error)
    return Response.json({ error: 'Không thể kết nối Gemini từ server. Vui lòng thử lại sau.' }, { status: 500 })
  }
}

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
