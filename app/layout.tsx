import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { AuthProvider } from "@/components/auth-provider";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "GolfSimMap | Find Golf Simulators Near You",
    template: "%s | GolfSimMap",
  },
  description: "Discover over 10,000 indoor golf simulator venues across the USA. Compare Trackman, Foresight, Uneekor systems and book your next session.",
  keywords: ["golf simulators", "indoor golf", "screen golf", "Trackman", "Foresight", "Uneekor", "golf simulator near me"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${spaceGrotesk.variable} ${jetbrains.variable} antialiased min-h-screen flex flex-col bg-deep-black text-cream`}
        style={{
          fontFamily: "'Space Grotesk', system-ui, sans-serif",
        }}
      >
        <AuthProvider>
          <Navbar />
          <main className="flex-1 relative">
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
