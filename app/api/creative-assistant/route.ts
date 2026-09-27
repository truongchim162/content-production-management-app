const ROLE_PROMPTS = {
  content: 'Bạn là AI Sáng tạo Content & Kịch bản HAPPYORSAD. Chuyên brainstorm ý tưởng, hook 3 giây, shotlist, outfit, đạo cụ và bối cảnh. Trả lời tiếng Việt, thực tế, có thể đưa thẳng vào brief.',
  creator: 'Bạn là AI Trợ lý Quay & Dựng Video HAPPYORSAD. Chuyên góc quay, ánh sáng, camera, transition, caption và hashtag SEO TikTok/Shopee. Trả lời tiếng Việt, ưu tiên hướng dẫn thực hành ngắn gọn.',
  lead: 'Bạn là AI Cố vấn Chiến lược & Quản lý HAPPYORSAD. Chuyên phân tích hiệu suất, chiến lược kênh, feedback sửa bài chuyên nghiệp và KPI team. Trả lời tiếng Việt, rõ ràng, có hành động tiếp theo.',
} as const

function localCreativeReply(prompt: string, role: keyof typeof ROLE_PROMPTS = 'content') {
  const normalized = prompt.toLowerCase()
  if (role === 'creator') return 'Góc quay: dùng ánh sáng key mềm 45 độ, camera ngang ngực và một shot cận chất liệu.\n\nTransition: whip pan hoặc match cut theo động tác kéo tay áo.\nCaption: “Một item, ba mood. Bạn chọn mood nào?”\nHashtag: #menswear #fitcheck #outfitnam #happyorsad.'
  if (role === 'lead') return 'Tóm tắt quản lý: ưu tiên duyệt nội dung có hook rõ trong 3 giây đầu, shotlist khả thi và CTA cụ thể.\n\nFeedback mẫu: “Vui lòng rút gọn phần mở đầu, bổ sung cận chất liệu và chốt CTA để tăng khả năng lưu bài.”\nKPI cần theo dõi: tỷ lệ hoàn thành, lượt lưu, tỷ lệ chuyển đổi và số video đúng deadline.'
  if (normalized.includes('hook') || normalized.includes('câu view')) return 'Hook đề xuất: “Một chiếc quần, ba cách biến hóa để đi làm, đi chơi và đi hẹn hò.”\n\nInsight: Người xem muốn mặc đẹp nhưng cần công thức dễ áp dụng.\nFormat: Mở bằng outfit chưa hoàn chỉnh, chuyển cảnh theo nhịp beat và chốt bằng full look.\nCTA: Lưu lại để thử outfit tiếp theo.'
  if (normalized.includes('trend') || normalized.includes('tiktok')) return 'Ý tưởng: “1 item — 3 mood phối đồ nam trong 15 giây”.\n\nHook: “Đừng vội bỏ chiếc áo này, bạn đang phối sai cách.”\nShot: Cận chất liệu, toàn thân look 1, chuyển cảnh look 2, detail phụ kiện, hero shot.\nCTA: Comment mood bạn muốn HAPPYORSAD phối tiếp.'
  return 'Ý tưởng: “Fitcheck nam tối giản nhưng không nhàm chán”.\n\nHook: “Cùng một nền outfit, đổi đúng một chi tiết là khác hẳn.”\nInsight: Tập trung vào cách nâng cấp outfit bằng phom dáng, layer và phụ kiện.\nFormat: Video dọc 9:16, 5 shot, nhịp cắt nhanh 1–2 giây mỗi shot.\nCTA: Lưu video và gửi cho người cần nâng cấp tủ đồ.'
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
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) return Response.json({ text: localCreativeReply(prompt, role), mode: 'local-fallback' })
    const contents = [...messages, ...userMessage].slice(-12).map((message) => ({
      role: message.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: message.content }],
    }))
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ systemInstruction: { parts: [{ text: systemPrompt }] }, contents, generationConfig: { temperature: 0.8, maxOutputTokens: 900 } }),
    })
    const data = await response.json()
    if (!response.ok) {
      const providerMessage = data?.error?.message || `Gemini request failed with ${response.status}`
      if (providerMessage.includes('blocked') || providerMessage.includes('not found') || providerMessage.includes('quota')) return Response.json({ text: localCreativeReply(prompt, role), mode: 'local-fallback' })
      throw new Error(providerMessage)
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
    return Response.json({ text: localCreativeReply('', 'content'), mode: 'local-fallback' })
  }
}
