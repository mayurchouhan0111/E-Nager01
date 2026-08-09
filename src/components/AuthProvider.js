'use client'
import { useEffect } from 'react'
import { auth, onAuthStateChanged } from '@/lib/firebase'

export default function AuthProvider({ children }) {
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && !user.isAnonymous) {
        console.log('[Auth] Google Citizen User session active:', user.email || user.uid)
      } else {
        console.log('[Auth] Guest / Unauthenticated session')
      }
    })
    return () => unsubscribe()
  }, [])

  return children
}
