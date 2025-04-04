import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Test App',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased text-9xl text-neutral-500 fill-green-500">{children}</body>
    </html>
  );
}
