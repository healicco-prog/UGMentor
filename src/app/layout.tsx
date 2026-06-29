import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  title: "UGMentor – AI Learning Companion for UG Medical Students",
  description: "The all-in-one AI-powered mentoring platform for undergraduate medical students. Learn smarter with AI-generated notes, assessments, and portfolio building.",
  keywords: "UG medical education, AI learning, MBBS notes, medical assessment, e-portfolio, AI mentor",
  openGraph: {
    title: "UGMentor – AI Learning Companion",
    description: "AI-powered mentoring platform for undergraduate medical students.",
    url: "https://www.ugmentor.in",
    siteName: "UGMentor",
    type: "website",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
