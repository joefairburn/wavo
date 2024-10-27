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
        <style>
          {`
            .wavefont {
              font-variation-settings:
                "ROND" 100,
                "YELA" 0;
            }
        `}
        </style>
      </head>

      <body style={{ fontFamily: 'Wavefont' }} className="antialiased text-9xl wavefont">
        {children}
      </body>
    </html>
  );
}
