import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your GolfSimMap account.",
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: "https://golfsimmap.com/login",
  },
};

export default function LoginLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
