import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "USMLE Quiz",
  description: "A quiz app designed to help users practice and master USMLE Step 2 clinical vignette–style questions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
