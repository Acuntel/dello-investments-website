"use client";

import { usePathname } from "next/navigation";

// The website manager at /admin lives inside the same app, but it must not get
// the public header, footer, preloader or chat bubble. Layouts do not see the
// pathname in the App Router, so this thin client wrapper makes the call.
export default function SiteChrome({
  header,
  footer,
  children,
}: {
  header: React.ReactNode;
  footer: React.ReactNode;
  children: React.ReactNode;
}) {
  const pathname = usePathname() || "/";
  if (pathname.startsWith("/admin")) return <>{children}</>;

  return (
    <>
      {header}
      <main id="main-content">{children}</main>
      {footer}
    </>
  );
}
