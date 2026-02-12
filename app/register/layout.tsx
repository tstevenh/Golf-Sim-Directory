import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Create a GolfSimMap account to save favorites and manage listings.",
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: "https://golfsimmap.com/register",
  },
};

export default function RegisterLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
