import { notFound } from "next/navigation";
import { pageMetadata } from "@/lib/metadata";
import { portedKey } from "@/lib/admin/defaults";
import { getContentPage, heroFor, topLevelPages } from "@/lib/pages";
import ContentPageView from "@/components/pages/ContentPageView";

// Every top-level page ported off Carrot. Static segments (/contact, /es, /pl,
// /admin, /blog) are matched by Next before this dynamic one, so they win.
export const dynamic = "force-dynamic";
export const dynamicParams = false;

export function generateStaticParams() {
  return topLevelPages()
    .filter((p) => p.slug !== "blog")
    .map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}) {
  const page = getContentPage(params.slug);
  if (!page) return {};
  return pageMetadata(portedKey(page.slug), "en", heroFor(page).hero?.src);
}

export default function Page({ params }: { params: { slug: string } }) {
  const page = getContentPage(params.slug);
  if (!page || page.kind !== "page") notFound();
  return <ContentPageView page={page} />;
}
