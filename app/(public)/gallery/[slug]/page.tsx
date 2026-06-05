import { notFound } from "next/navigation";
import { ChibiDetail } from "@/components/chibi/chibi-detail";
import { getChibiBySlug } from "@/features/gallery/queries";

interface DetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function DetailPage({ params }: DetailPageProps) {
  const { slug } = await params;
  const item = await getChibiBySlug(slug);

  if (!item) {
    notFound();
  }

  return (
    <div className="container-page py-8">
      <ChibiDetail item={item} />
    </div>
  );
}
