import { Toaster } from 'react-hot-toast'
import './globals.css'
import AuthProvider from '@/components/AuthProvider'

const baseUrl = 'https://e-nagar01.netlify.app'

export const metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'ई-नगर पालिका झाबुआ | जन्म एवं मृत्यु प्रमाण पत्र पोर्टल - MP e-Nagar Jhabua',
    template: '%s | नगर पालिका परिषद झाबुआ - MP e-Nagar',
  },
  description: 'नगर पालिका परिषद झाबुआ (मध्य प्रदेश) द्वारा संचालित डिजिटल सेवा पोर्टल। अब घर बैठे अपने मृत्यु एवं जन्म प्रमाण पत्र के लिए ऑनलाइन आवेदन करें, स्थिति ट्रैक करें एवं स्वीकृत प्रमाण पत्र डाउनलोड करें। Digital citizen service portal by Nagar Palika Parishad Jhabua (MP). Apply online for death and birth certificates, track status, and download approved certificates.',
  keywords: [
    'MP e-Nagar',
    'Jhabua Death Certificate',
    'Jhabua Birth Certificate',
    'झाबुआ मृत्यु प्रमाण पत्र',
    'झाबुआ जन्म प्रमाण पत्र',
    'MP Death Certificate online apply',
    'MP Birth Certificate online apply',
    'Municipal Council Jhabua',
    'नगर पालिका परिषद झाबुआ',
    'e-Nagar Palika Jhabua',
    'मध्य प्रदेश मृत्यु प्रमाण पत्र',
    'Madhya Pradesh death certificate',
    'Jhabua municipal portal',
    'झाबुआ नगरपालिका पोर्टल',
    'death certificate apply online MP',
    'birth certificate apply online MP',
    'MP e-Nagar portal',
    'Jhabua district certificate',
  ],
  authors: [{ name: 'Nagar Palika Parishad Jhabua' }],
  creator: 'MP e-Nagar Jhabua',
  publisher: 'Nagar Palika Parishad Jhabua',
  formatDetection: { telephone: true, email: true },
  openGraph: {
    type: 'website',
    locale: 'hi_IN',
    url: baseUrl,
    siteName: 'MP e-Nagar Jhabua - नगर पालिका परिषद झाबुआ',
    title: 'ई-नगर पालिका झाबुआ | जन्म एवं मृत्यु प्रमाण पत्र पोर्टल',
    description: 'नगर पालिका परिषद झाबुआ - जन्म एवं मृत्यु प्रमाण पत्र हेतु ऑनलाइन आवेदन करें एवं स्थिति ट्रैक करें। Apply online for Birth & Death Certificate - Municipal Council Jhabua, MP.',
    images: [
      {
        url: `${baseUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'MP e-Nagar Jhabua - नगर पालिका परिषद झाबुआ',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ई-नगर पालिका झाबुआ | MP e-Nagar Jhabua',
    description: 'जन्म एवं मृत्यु प्रमाण पत्र हेतु ऑनलाइन आवेदन पोर्टल - नगर पालिका परिषद झाबुआ',
    images: [`${baseUrl}/og-image.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: baseUrl,
    languages: {
      'hi-IN': `${baseUrl}?lang=hi`,
      'en-IN': `${baseUrl}?lang=en`,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'GovernmentService',
  name: 'जन्म एवं मृत्यु प्रमाण पत्र पोर्टल - नगर पालिका परिषद झाबुआ (Birth & Death Certificate Portal - Municipal Council Jhabua)',
  alternateName: 'MP e-Nagar Jhabua Portal',
  provider: {
    '@type': 'GovernmentOrganization',
    name: 'नगर पालिका परिषद झाबुआ (Nagar Palika Parishad Jhabua)',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Jhabua',
      addressRegion: 'Madhya Pradesh',
      addressCountry: 'IN',
    },
    telephone: '+91-7392-XXXXXX',
  },
  serviceType: 'Certificate Issuance - Death Certificate, Birth Certificate',
  areaServed: {
    '@type': 'AdministrativeArea',
    name: 'Jhabua, Madhya Pradesh, India',
  },
  url: baseUrl,
  description: 'ऑनलाइन मृत्यु एवं जन्म प्रमाण पत्र आवेदन, स्थिति ट्रैकिंग एवं डाउनलोड। Online death and birth certificate application, status tracking and download.',
  availableLanguage: ['Hindi', 'English'],
  applicationUrl: `${baseUrl}/death-certificate`,
}

export default function RootLayout({ children }) {
  return (
    <html lang="hi-IN">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#047857" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
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
