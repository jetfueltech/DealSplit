"use client";

import type React from "react";
import { Inter } from "next/font/google";
import { createContext, useState } from "react";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const DarkModeContext = createContext({
  isDarkMode: false,
  toggleDarkMode: () => {},
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  return (
    <html lang="en">
      <DarkModeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
        <body className={`${inter.variable} font-sans antialiased ${isDarkMode ? "dark" : ""}`}>
          <Toaster theme={isDarkMode ? "dark" : "light"} />
          {children}
        </body>
      </DarkModeContext.Provider>
    </html>
  );
}