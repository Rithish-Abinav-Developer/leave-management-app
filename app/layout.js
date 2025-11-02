"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

export default function RootLayout({ children }) {
  const [queryClient] = useState(() => new QueryClient());

  useEffect(() => {
    const preventPinch = (e) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    };

    const preventDoubleTap = (() => {
      let lastTouch = 0;
      return (e) => {
        const now = Date.now();
        if (now - lastTouch <= 300) {
          e.preventDefault();
        }
        lastTouch = now;
      };
    })();

    document.addEventListener("touchmove", preventPinch, { passive: false });
    document.addEventListener("touchend", preventDoubleTap, { passive: false });

    // Cleanup
    return () => {
      document.removeEventListener("touchmove", preventPinch);
      document.removeEventListener("touchend", preventDoubleTap);
    };
  }, []);

  return (
    <html lang="en" className={poppins.variable}>
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
        />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#ffffff" />
        <link rel="icon" href="/icon-192x192.png" />
        <link rel="apple-touch-icon" href="/icon-512x512.png" />
      </head>
      <body>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </body>
    </html>
  );
}
