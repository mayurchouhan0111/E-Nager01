'use client'
import { useEffect } from 'react'
import { auth, signInAnonymously, onAuthStateChanged } from '@/lib/firebase'

let signInPromise = null

export default function AuthProvider({ children }) {
  useEffect(() => {
    if (!signInPromise) {
      signInPromise = new Promise((resolve) => {
        onAuthStateChanged(auth, (user) => {
          if (user) {
            console.log('[Auth] User session active:', user.uid)
            resolve(user)
          } else {
            signInAnonymously(auth)
              .then((res) => {
                console.log('[Auth] Anonymous authentication granted:', res.user?.uid)
                resolve(res.user)
              })
              .catch((err) => {
                console.warn('[Auth] Anonymous auth restricted (using public security rules fallback):', err.message)
                resolve(null)
              })
          }
        })
      })
    }
  }, [])

  return children
}
