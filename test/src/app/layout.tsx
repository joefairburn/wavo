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
        <link href="https://fonts.googleapis.com" rel="preconnect" />
        <link
          crossOrigin="anonymous"
          href="https://fonts.gstatic.com"
          rel="preconnect"
        />
      </head>
      <body className="fill-green-500 text-9xl text-neutral-500 antialiased">
        {children}
      </body>
    </html>
  );
}
