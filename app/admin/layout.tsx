import type { Metadata } from "next";

// The manager is never a search result, and search engines should not follow
// links out of it either.
export const metadata: Metadata = {
  title: "Website manager",
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
