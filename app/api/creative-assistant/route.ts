const ROLE_PROMPTS = {
  content: 'Bạn là AI Sáng tạo Content & Kịch bản HAPPYORSAD. Chuyên brainstorm ý tưởng, hook 3 giây, shotlist, outfit, đạo cụ và bối cảnh. Trả lời tiếng Việt, thực tế, có thể đưa thẳng vào brief.',
  creator: 'Bạn là AI Trợ lý Quay & Dựng Video HAPPYORSAD. Chuyên góc quay, ánh sáng, camera, transition, caption và hashtag SEO TikTok/Shopee. Trả lời tiếng Việt, ưu tiên hướng dẫn thực hành ngắn gọn.',
  lead: 'Bạn là AI Cố vấn Chiến lược & Quản lý HAPPYORSAD. Chuyên phân tích hiệu suất, chiến lược kênh, feedback sửa bài chuyên nghiệp và KPI team. Trả lời tiếng Việt, rõ ràng, có hành động tiếp theo.',
} as const

function localCreativeReply(prompt: string, role: keyof typeof ROLE_PROMPTS = 'content') {
  const normalized = prompt.toLowerCase()
  const seed = [...normalized].reduce((total, char) => total + char.charCodeAt(0), 0)
  const pick = <T,>(items: T[]) => items[seed % items.length]
  if (role === 'creator') {
    if (normalized.includes('caption') || normalized.includes('hashtag')) return pick([
      'Caption: “Không cần mặc cầu kỳ, chỉ cần đúng phom.”\n\nHashtag: #menswear #fitcheck #outfitnam #minimalstyle #happyorsad\n\nGợi ý: mở caption bằng một câu hỏi để kéo bình luận: “Bạn chọn look A hay B?”',
      'Caption: “Một chiếc áo, ba cách mặc cho cả tuần.”\n\nHashtag: #phoidonam #mensfashion #stylingtips #ootd\n\nCTA: Lưu lại và tag người bạn hay nói “không có gì để mặc”.',
    ])
    if (normalized.includes('góc') || normalized.includes('ánh sáng') || normalized.includes('quay')) return pick([
      'Setup quay: đặt máy ngang ngực, cách mẫu 1.5m; dùng key light 45° và một nguồn sáng hắt nhẹ phía sau. Quay 4 shot: toàn thân, medium, cận chất liệu và detail phụ kiện.',
      'Setup quay indoor: khóa exposure, 24–30fps, shutter 1/50–1/60. Dùng tripod cho hero shot, handheld nhẹ cho shot chuyển outfit. Tránh để nền sáng hơn chủ thể.',
    ])
    return pick([
      'Shotlist đề xuất: 1) cận tay kéo khóa quần, 2) toàn thân outfit cơ bản, 3) match cut khi xoay người, 4) cận chất liệu, 5) hero shot kèm CTA. Transition chính: whip pan.',
      'Kịch bản quay 15 giây: 0–2s nêu vấn đề “Mặc basic sao cho không nhạt?”, 2–8s thay 3 layer, 8–12s cận phụ kiện, 12–15s full look và CTA lưu video.',
    ])
  }
  if (role === 'lead') {
    if (normalized.includes('kpi') || normalized.includes('hiệu suất')) return 'Khung đọc KPI tuần: (1) tỷ lệ hoàn thành đúng deadline, (2) lượt xem 3 giây đầu, (3) tỷ lệ xem hết, (4) lượt lưu/chia sẻ, (5) tỷ lệ chuyển đổi.\n\nHành động: chọn 2 video tốt nhất để nhân bản hook và 2 video rớt retention để sửa phần mở đầu.'
    if (normalized.includes('feedback') || normalized.includes('sửa')) return 'Feedback mẫu: “Hook hiện chưa nói rõ lợi ích trong 3 giây đầu. Vui lòng rút phần intro, thêm cận chất liệu ở giây 4–6 và chốt CTA cụ thể. Bản sửa cần giữ nhịp cắt nhanh hơn ở đoạn giữa.”'
    return pick(['Đề xuất tuần này: ưu tiên series “1 item – 3 cách mặc”, chia thành 3 tập theo dịp sử dụng. Content phụ trách hook và script; Creator quay cùng một setup để giảm thời gian; Lead theo dõi retention và lượt lưu.', 'Bảng ưu tiên: P1 là video đang chờ duyệt hoặc gần deadline; P2 là content đã duyệt nhưng chưa có source; P3 là ý tưởng mới. Mỗi task cần một owner, deadline và tiêu chí nghiệm thu rõ ràng.'])
  }
  if (normalized.includes('hook') || normalized.includes('câu view')) return pick(['Hook: “Bạn đang mặc chiếc quần này sai cách mà không biết.”\n\nInsight: đánh vào lỗi phối đồ quen thuộc, sau đó cho 3 cách sửa.\nCTA: Lưu lại để thử outfit cuối tuần.', 'Hook: “Đừng mua thêm quần áo trước khi xem 3 công thức này.”\n\nFormat: before/after, mỗi look 4 giây; chốt bằng bảng màu và phụ kiện tương ứng.'])
  if (normalized.includes('trend') || normalized.includes('tiktok')) return pick(['Trend idea: “POV: stylist chọn outfit cho 3 cuộc hẹn trong một ngày”. Chia 3 mood: đi làm, cafe, dinner; dùng cùng một item làm điểm nối.', 'Trend idea: “Blind pick outfit”: bốc ngẫu nhiên màu áo, quần và phụ kiện rồi phối trong 20 giây. Có thể mở rộng thành series để kéo comment.'])
  if (normalized.includes('outfit') || normalized.includes('phối')) return 'Công thức phối: áo thun trơn + trousers phom đứng + sneaker cùng tông. Thêm một lớp overshirt để tạo chiều sâu; phụ kiện chỉ nên có 1 điểm nhấn. Quay cùng một góc để người xem thấy rõ sự khác biệt trước/sau.'
  return pick(['Ý tưởng: “Một item, ba hoàn cảnh”. Hook bằng một outfit cơ bản, sau đó biến đổi bằng layer và phụ kiện. Shotlist gồm toàn thân, cận chi tiết, chuyển cảnh và hero shot; CTA là “Bạn chọn look nào?”', 'Ý tưởng: “Tủ đồ nam capsule trong 5 món”. Mỗi món xuất hiện cùng 2 cách phối, màu sắc trung tính và nhịp dựng rõ. Cuối video thêm checklist để tăng lượt lưu.'])
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const prompt = typeof body?.prompt === 'string' ? body.prompt.trim() : ''
    const role: keyof typeof ROLE_PROMPTS = body?.role === 'creator' || body?.role === 'lead' ? body.role : 'content'
    const systemPrompt = ROLE_PROMPTS[role]
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
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY
    if (!apiKey) return Response.json({ error: 'Gemini chưa được kết nối trong môi trường hiện tại. Hãy kiểm tra GEMINI_API_KEY trong Vars rồi khởi động lại preview.' }, { status: 503 })
    const contents = [...messages, ...userMessage].slice(-12).map((message) => ({
      role: message.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: message.content }],
    }))
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(apiKey)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ systemInstruction: { parts: [{ text: systemPrompt }] }, contents, generationConfig: { temperature: 0.8, maxOutputTokens: 900 } }),
    })
    const data = await response.json()
    if (!response.ok) {
      const providerMessage = data?.error?.message || `Gemini request failed with ${response.status}`
      return Response.json({ error: `Gemini không xử lý được câu hỏi: ${providerMessage}` }, { status: 502 })
    }
    const text = data?.candidates?.[0]?.content?.parts?.map((part: { text?: string }) => part.text || '').join('')
    if (!text) return Response.json({ text: localCreativeReply(prompt, role), mode: 'local-fallback' })
    return Response.json({ text, mode: 'gemini' })
  } catch (error) {
    console.error('[v0] Creative assistant failed:', error)
    const message = error instanceof Error ? error.message : String(error)
    if (message.includes('customer_verification_required') || message.includes('valid credit card')) {
      return Response.json({ error: 'AI Gateway chưa được mở khóa cho workspace. Hãy thêm phương thức thanh toán hợp lệ trong Vercel AI Gateway, sau đó thử lại.' }, { status: 503 })
    }
    return Response.json({ error: 'Không thể kết nối Gemini. Vui lòng kiểm tra GEMINI_API_KEY và thử lại.' }, { status: 503 })
  }
}
