import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Submit a Venue",
  description: "Submit an indoor golf simulator venue to GolfSimMap.",
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: "https://golfsimmap.com/submit",
  },
};

export default function SubmitLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
