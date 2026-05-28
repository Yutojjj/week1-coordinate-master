import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "COORD MASTER",
  description: "コードと魔法の力で冒険へ！ケーニーズプログラミング教室",
  manifest: "/manifest.json",
  themeColor: "#FBBF24",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "CoordMaster",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#FBBF24" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="CoordMaster" />
        <link rel="apple-touch-icon" href="/sprites/player_front.png" />
      </head>
      <body style={{ margin: 0, padding: 0 }}>
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js');
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}