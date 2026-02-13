export const dynamic = "force-static";
export const revalidate = 2592000;

export default function BestRoutesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

