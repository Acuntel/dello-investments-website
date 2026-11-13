import { notFound } from "next/navigation";
import { pageMetadata } from "@/lib/metadata";
import { portedKey } from "@/lib/admin/defaults";
import { blogPosts, getContentPage, heroFor } from "@/lib/pages";
import ContentPageView from "@/components/pages/ContentPageView";

export const dynamic = "force-dynamic";
export const dynamicParams = false;

export function generateStaticParams() {
  return blogPosts().map((p) => ({ slug: p.slug.replace(/^blog\//, "") }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}) {
  const page = getContentPage(`blog/${params.slug}`);
  if (!page) return {};
  const share = page.share ?? heroFor(page).hero;
  return pageMetadata(portedKey(page.slug), "en", share?.src, {
    imageAlt: share?.alt,
    article: { published: page.published, updated: page.updated },
  });
}

export default function Page({ params }: { params: { slug: string } }) {
  const page = getContentPage(`blog/${params.slug}`);
  if (!page || page.kind !== "blog") notFound();
  return <ContentPageView page={page} />;
}
