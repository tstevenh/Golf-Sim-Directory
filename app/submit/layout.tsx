import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";

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

export default async function SubmitLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await requireAuth("/submit");
  if (user.role !== "business_owner") {
    redirect("/claim");
  }

  return children;
}
