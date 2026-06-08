import { describe, expect, it } from "vitest";

import { buildRssDocument, escapeXml } from "@/lib/feed/rss";

describe("escapeXml", () => {
  it("escapes reserved XML characters", () => {
    expect(escapeXml(`Tom & Jerry "chibi" <3`)).toBe(
      "Tom &amp; Jerry &quot;chibi&quot; &lt;3",
    );
  });
});

describe("buildRssDocument", () => {
  it("includes channel metadata and items", () => {
    const xml = buildRssDocument({
      title: "ChibiDrop",
      link: "https://example.com",
      description: "Daily chibis",
      items: ["<item><title>Test</title></item>"],
    });

    expect(xml).toContain("<title>ChibiDrop</title>");
    expect(xml).toContain("https://example.com/feed.xml");
    expect(xml).toContain("<item><title>Test</title></item>");
  });
});
