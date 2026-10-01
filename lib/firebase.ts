import { deleteApp, getApp, getApps, initializeApp } from 'firebase/app'
import { createUserWithEmailAndPassword, getAuth, signOut } from 'firebase/auth'
import { doc, getFirestore, serverTimestamp, setDoc } from 'firebase/firestore'

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

/** Removes undefined values while preserving Firestore sentinels and nested arrays. */
export function sanitizeFirestoreData<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((entry) => sanitizeFirestoreData(entry)) as T
  }
  if (value && typeof value === 'object') {
    const result: Record<string, unknown> = {}
    for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
      result[key] = entry === undefined ? null : sanitizeFirestoreData(entry)
    }
    return result as T
  }
  return value
}

export type UserRole = 'lead' | 'content' | 'creator'
export const roleLabels: Record<UserRole, string> = { lead: 'Lead', content: 'Content', creator: 'Creator' }
export const demoAccounts = [
  { role: 'lead' as const, email: 'lead@happyorsad.vn', label: 'Đăng nhập Demo: Lead', initials: 'LD' },
  { role: 'content' as const, email: 'content@happyorsad.vn', label: 'Đăng nhập Demo: Content', initials: 'CO' },
  { role: 'creator' as const, email: 'creator@happyorsad.vn', label: 'Đăng nhập Demo: Creator', initials: 'CR' },
]

export async function createTeamMemberAccount(input: { name: string; email: string; password: string; role: Exclude<UserRole, 'lead'> }) {
  const secondary = initializeApp(firebaseConfig, `team-member-${Date.now()}`)
  const secondaryAuth = getAuth(secondary)
  try {
    const credential = await createUserWithEmailAndPassword(secondaryAuth, input.email.trim(), input.password)
    await setDoc(doc(db, 'users', credential.user.uid), {
      uid: credential.user.uid,
      name: input.name.trim(),
      email: input.email.trim().toLowerCase(),
      role: input.role,
      createdAt: serverTimestamp(),
      status: 'active',
    })
    await signOut(secondaryAuth)
    return credential.user.uid
  } finally {
    await deleteApp(secondary)
  }
}
