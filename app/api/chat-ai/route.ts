import { GoogleGenerativeAI } from '@google/generative-ai'

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

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) return Response.json({ error: 'Lỗi Gemini API: GEMINI_API_KEY chưa được cấu hình trên server.' }, { status: 503 })

    const client = new GoogleGenerativeAI(apiKey)
    const model = client.getGenerativeModel({ model: 'gemini-1.5-flash', systemInstruction: SYSTEM_PROMPT })
    const history = messages.slice(0, -1).map((message) => ({ role: message.role === 'assistant' ? 'model' as const : 'user' as const, parts: [{ text: message.content }] }))
    const chat = model.startChat({ history, generationConfig: { temperature: 0.7, maxOutputTokens: 1800 } })
    const result = await chat.sendMessage(prompt)
    const text = result.response.text().trim()
    if (!text) return Response.json({ error: 'Lỗi Gemini API: Gemini trả về nội dung rỗng.' }, { status: 502 })
    return Response.json({ text, mode: 'gemini' })

  } catch (error) {
    console.error('[v0] Gemini chat route failed:', error)
    const message = error instanceof Error ? error.message : String(error)
    const normalized = message.toLowerCase()
    const label = normalized.includes('api key') || normalized.includes('api_key') || normalized.includes('unauthenticated') ? 'Invalid API Key' : normalized.includes('quota') || normalized.includes('resource exhausted') ? 'Quota Exceeded' : message
    return Response.json({ error: `Lỗi Gemini API: ${label}` }, { status: 502 })
  }
}

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
