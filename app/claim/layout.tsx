import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Claim Your Venue",
  description: "Claim your GolfSimMap venue listing to verify and manage details.",
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: "https://golfsimmap.com/claim",
  },
};

export default function ClaimLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
