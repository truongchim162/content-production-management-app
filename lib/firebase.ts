import { getApp, getApps, initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyAPe3La7wZNqKsoON0TNDAvAu09f_KzA5M',
  authDomain: 'mediahos.firebaseapp.com',
  projectId: 'mediahos',
  storageBucket: 'mediahos.firebasestorage.app',
  messagingSenderId: '136237091480',
  appId: '1:136237091480:web:e0567fb715156836fc9eed',
} as const

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
