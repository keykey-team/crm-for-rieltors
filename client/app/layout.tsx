import { DM_Sans, JetBrains_Mono, Plus_Jakarta_Sans } from 'next/font/google';
import { Providers } from '@/app/providers';
import { Toaster } from '@/shared/ui';
import { ChunkLoadErrorHandler } from '@/app/providers/chunk-load-error-handler';
import '@/app/styles/globals.css';

const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-sans' });
const jakartaSans = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-display' });
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'RealCRM — CRM для ріелторів',
  description: 'Сучасна CRM-система для управління нерухомістю',
  metadataBase: new URL(process.env.NEXTAUTH_URL ?? 'http://localhost:3000'),
  icons: { icon: '/favicon.svg', shortcut: '/favicon.svg' },
  openGraph: { images: ['/og-image.png'] },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uk" suppressHydrationWarning>
      <head>
        <script src="https://apps.abacus.ai/chatllm/appllm-lib.js"></script>
      </head>
      <body className={`${dmSans.variable} ${jakartaSans.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        <Providers>
          {children}
          <Toaster />
          <ChunkLoadErrorHandler />
        </Providers>
      </body>
    </html>
  );
}
