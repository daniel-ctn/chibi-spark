export function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

interface FeedItemInput {
  title: string;
  link: string;
  guid: string;
  description: string;
  pubDate: Date;
  enclosureUrl?: string;
  enclosureType?: string;
}

export function buildFeedItem(input: FeedItemInput): string {
  const parts = [
    "<item>",
    `<title>${escapeXml(input.title)}</title>`,
    `<link>${escapeXml(input.link)}</link>`,
    `<guid isPermaLink="true">${escapeXml(input.guid)}</guid>`,
    `<description>${escapeXml(input.description)}</description>`,
    `<pubDate>${input.pubDate.toUTCString()}</pubDate>`,
  ];

  if (input.enclosureUrl && input.enclosureType) {
    parts.push(
      `<enclosure url="${escapeXml(input.enclosureUrl)}" type="${escapeXml(input.enclosureType)}" />`,
    );
  }

  parts.push("</item>");
  return parts.join("");
}

interface RssDocumentInput {
  title: string;
  link: string;
  description: string;
  items: string[];
}

export function buildRssDocument(input: RssDocumentInput): string {
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    "<channel>",
    `<title>${escapeXml(input.title)}</title>`,
    `<link>${escapeXml(input.link)}</link>`,
    `<description>${escapeXml(input.description)}</description>`,
    `<atom:link href="${escapeXml(`${input.link}/feed.xml`)}" rel="self" type="application/rss+xml" />`,
    `<lastBuildDate>${new Date().toUTCString()}</lastBuildDate>`,
    ...input.items,
    "</channel>",
    "</rss>",
  ].join("");
}
