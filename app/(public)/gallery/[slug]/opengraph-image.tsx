import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
import { getChibiBySlug } from "@/features/gallery/queries";

export const runtime = "edge";

export default async function handler(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const item = await getChibiBySlug(slug);

  if (!item) {
    return new Response("Not found", { status: 404 });
  }

  const { item: chibi, assets, tags } = item;
  const imageAsset = assets.find((a) => a.assetType === "image");

  if (!imageAsset) {
    return new Response("Image not found", { status: 404 });
  }

  return new ImageResponse(
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "white",
        backgroundImage: `url(${imageAsset.publicUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "rgba(0, 0, 0, 0.7)",
          padding: "40px 60px",
          borderRadius: "16px",
          maxWidth: "80%",
        }}
      >
        <div
          style={{
            fontSize: 48,
            fontWeight: "bold",
            color: "white",
            textAlign: "center",
            marginBottom: "20px",
          }}
        >
          {chibi.title}
        </div>
        {chibi.shortDescription && (
          <div
            style={{
              fontSize: 24,
              color: "rgba(255, 255, 255, 0.9)",
              textAlign: "center",
              marginBottom: "20px",
            }}
          >
            {chibi.shortDescription}
          </div>
        )}
        {tags.length > 0 && (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "8px",
              justifyContent: "center",
            }}
          >
            {tags.slice(0, 5).map((tag) => (
              <div
                key={tag.id}
                style={{
                  fontSize: 16,
                  color: "white",
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                  padding: "6px 12px",
                  borderRadius: "8px",
                }}
              >
                {tag.name}
              </div>
            ))}
          </div>
        )}
        <div
          style={{
            fontSize: 20,
            color: "rgba(255, 255, 255, 0.8)",
            marginTop: "30px",
          }}
        >
          ChibiDrop
        </div>
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
    },
  );
}
