import './globals.css';

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
        <link
          href="https://fonts.googleapis.com/css2?family=Wavefont:wght,ROND,YELA@4..1000,0..100,-100..100"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased text-9xl text-neutral-500 fill-green-500">{children}</body>
    </html>
  );
}
