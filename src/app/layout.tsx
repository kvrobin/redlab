import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { StoreProvider } from '@/lib/store';
import { Toaster } from 'sonner';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'RED Lab — Tudományos Kollaborációs Platform',
  description: 'Zártkörű tudományos kutatócsoporti kollaborációs és szakdolgozat-menedzsment platform Robin, Emma, Domi kutatók és témavezetőik számára.',
  openGraph: {
    title: 'RED Lab (Béta) — Tudományos Kollaborációs Platform',
    description: 'Zártkörű tudományos kutatócsoporti kollaborációs és szakdolgozat-menedzsment platform Robin, Emma, Domi kutatók és témavezetőik számára.',
    siteName: 'RED Lab',
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="hu" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased min-h-screen bg-[#090A0F] text-slate-100 selection:bg-rose-500/30 selection:text-rose-200`}>
        <StoreProvider>
          {children}
          <Toaster
            position="top-right"
            theme="dark"
            toastOptions={{
              className: 'bg-[#12141D] text-slate-100 border border-[#1E2230] shadow-xl',
              style: {
                background: '#12141D',
                borderColor: '#1E2230',
                color: '#F8FAFC',
              },
            }}
          />
        </StoreProvider>
      </body>
    </html>
  );
}
