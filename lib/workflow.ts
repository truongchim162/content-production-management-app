export type Status = 'idea_pending' | 'idea_needs_revision' | 'pending_approval' | 'approved_idea' | 'needs_revision' | 'video_needs_revision' | 'script_pending' | 'script_pending_creator' | 'script_approved' | 'scripting' | 'shooting_pending' | 'shooting_done' | 'video_pending' | 'editing_done' | 'video_approved' | 'video_approved_pending_schedule' | 'ready_to_post' | 'published' | 'archived' | 'rejected'
export type Shot = { no: number; shot: string; angle: string; voice: string; text: string }
export type UserRole = 'lead' | 'content' | 'creator'
export type Item = { id: string; title: string; description?: string; reference?: string; contentType?: string; platforms?: string[]; goal?: string; status: Status; location?: string; outfit?: string; props?: string; shots?: Shot[]; shotlistLink?: string; ownerId?: string; createdAt?: unknown; approvedAt?: unknown; source?: string; editNote?: string; sourceLink?: string; shootNote?: string; scheduledAt?: string; scheduledPublishDate?: string; wasOverdue?: boolean; overdueNotifiedAt?: unknown; finalVideoLink?: string; caption?: string; leadNote?: string; publishedLink?: string; publishedAt?: unknown; feedback?: string; feedbackUnread?: number }
export type TaskMessage = { id: string; text: string; senderName: string; senderRole: UserRole; senderId?: string; createdAt?: { toDate?: () => Date } | null }
export type NotificationItem = { id: string; userId: string; title: string; message: string; type: 'status_change' | 'feedback' | 'chat'; linkId?: string; targetView?: string; videoLink?: string; isRead: boolean; createdAt?: { toDate?: () => Date } | null }
export const statusLabels: Record<Status, string> = { idea_pending: 'Chờ duyệt ý tưởng', idea_needs_revision: 'Ý tưởng cần sửa', pending_approval: 'Chờ duyệt', approved_idea: 'Đã duyệt ý tưởng', needs_revision: 'Cần chỉnh sửa', video_needs_revision: 'Video cần sửa', script_pending: 'Chờ duyệt kịch bản', script_pending_creator: 'Creator chờ duyệt kịch bản', script_approved: 'Kịch bản đã duyệt', scripting: 'Đang viết kịch bản', shooting_pending: 'Chờ quay', shooting_done: 'Đã quay', video_pending: 'Video chờ duyệt', editing_done: 'Chờ duyệt video', video_approved: 'Bài đã duyệt', video_approved_pending_schedule: 'Bài đã duyệt', ready_to_post: 'Bài sẵn sàng đăng', published: 'Đã đăng', archived: 'Kho lưu trữ', rejected: 'Đã từ chối' }
export const roleNames: Record<UserRole, string> = { lead: 'Lan Anh', content: 'Minh Anh', creator: 'Quốc Bảo' }
export const contentTypes = ['Biến hình', 'Fitcheck', 'Tổng hợp Outfit', 'Review sản phẩm', 'Storytelling', 'Khác']
export const platformOptions = ['TikTok', 'Shopee Video', 'Instagram Reels', 'Facebook Reels']
export const demoItems: Item[] = []
export const itemTime = (value: unknown) => { if (value && typeof value === 'object' && 'toMillis' in value && typeof value.toMillis === 'function') return value.toMillis(); if (typeof value === 'string' || typeof value === 'number') return new Date(value).getTime() || 0; return 0 }
export const isVideoUrl = (value?: string) => !!value && /^https?:\/\//i.test(value.trim())
export const videoKinds = { ref: { icon: 'REF', label: 'VIDEO THAM KHẢO (REF)' }, source: { icon: 'SOURCE', label: 'VIDEO SOURCE DỰNG (FILE GỐC)' }, final: { icon: 'FINAL', label: 'VIDEO BẢN DỰNG HOÀN CHỈNH' }, published: { icon: 'PUBLISHED', label: 'VIDEO BÀI ĐĂNG THỰC TẾ' } } as const
export type VideoKind = keyof typeof videoKinds
export const primaryVideo = (item: Item): { url?: string; kind: VideoKind } => { if (isVideoUrl(item.publishedLink)) return { url: item.publishedLink, kind: 'published' }; if (isVideoUrl(item.finalVideoLink)) return { url: item.finalVideoLink, kind: 'final' }; if (isVideoUrl(item.sourceLink)) return { url: item.sourceLink, kind: 'source' }; return { url: item.reference, kind: 'ref' } }
export const getRoleLabel = (role: UserRole) => role === 'lead' ? 'Lead' : role === 'content' ? 'Content' : 'Creator'
export const notifyRole = async () => undefined
export const notifyUser = async () => undefined

export type TeamMember = { id: string; name?: string; email?: string; role?: UserRole; createdAt?: { toDate?: () => Date } | null; status?: string }

export const normalizeBrokenText = (value: string) => value.replaceAll('\uFFFD', 'đ').replaceAll('\uFFFD', '☀').replaceAll('\uFFFD', '←')

export const workflow = { statusLabels, roleNames, contentTypes, platformOptions }
export default workflow
