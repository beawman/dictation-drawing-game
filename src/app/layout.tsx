import { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Dictation Drawing Game',
  description: 'Educational drawing game for children aged 4-7',
  manifest: '/manifest.json',
  themeColor: '#3b82f6',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}