import { getApp, getApps, initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

const app = getApps().length ? getApp() : initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)

export type UserRole = 'lead' | 'content' | 'creator'
export const roleLabels: Record<UserRole, string> = { lead: 'Lead', content: 'Content', creator: 'Creator' }
export const demoAccounts = [
  { role: 'lead' as const, email: 'lead@happyorsad.vn', label: 'Đăng nhập Demo: Lead', initials: 'LD' },
  { role: 'content' as const, email: 'content@happyorsad.vn', label: 'Đăng nhập Demo: Content', initials: 'CO' },
  { role: 'creator' as const, email: 'creator@happyorsad.vn', label: 'Đăng nhập Demo: Creator', initials: 'CR' },
]
