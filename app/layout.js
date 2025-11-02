"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Poppins } from "next/font/google";
import "./globals.css";

// ✅ Load font
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

export default function RootLayout({ children }) {
  const [queryClient] = useState(() => new QueryClient());

  useEffect(() => {
    // ✅ Disable pinch zoom (Android + iOS)
    const handleTouchMove = (event) => {
      if (event.scale !== undefined && event.scale !== 1) {
        event.preventDefault();
      }
    };

    // ✅ Disable double-tap zoom
    let lastTouchEnd = 0;
    const handleTouchEnd = (event) => {
      const now = new Date().getTime();
      if (now - lastTouchEnd <= 300) {
        event.preventDefault();
      }
      lastTouchEnd = now;
    };

    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    document.addEventListener("touchend", handleTouchEnd, { passive: false });

    // Cleanup on unmount
    return () => {
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, []);

  return (
    <html lang="en" className={poppins.variable}>
      <head>
        {/* ✅ Prevent zoom + scaling */}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />

        {/* PWA + meta setup (optional) */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#ffffff" />
        <link rel="icon" href="/icon-192x192.png" />
        <link rel="apple-touch-icon" href="/icon-512x512.png" />

        {/* Optional: Fallback for older iOS */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              document.addEventListener('gesturestart', function (e) {
                e.preventDefault();
              });
              document.addEventListener('dblclick', function (e) {
                e.preventDefault();
              });
            `,
          }}
        />
      </head>

      <body>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </body>
    </html>
  );
}
