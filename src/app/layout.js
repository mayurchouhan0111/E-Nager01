import { Toaster } from 'react-hot-toast'
import './globals.css'
import AuthProvider from '@/components/AuthProvider'

export const metadata = {
  title: 'e-Nagar Palika | Death & Birth Certificate Portal',
  description: 'Online death and birth certificate application portal for Nagar Palika Parishad Jhabua.',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body className="bg-surface-950 text-surface-100 min-h-screen antialiased">
        <AuthProvider>
          <Toaster 
            position="top-center"
            toastOptions={{ 
              style: { 
                background: '#fff', 
                color: '#1e293b', 
                border: '1px solid #e2e8f0', 
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                fontSize: '0.8125rem',
                maxWidth: '90vw',
              } 
            }} 
          />
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
