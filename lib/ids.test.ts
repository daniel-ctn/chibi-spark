import { describe, expect, it } from "vitest";

import { newSlug, slugify } from "@/lib/ids";

describe("slugify", () => {
  it("lowercases and hyphenates text", () => {
    expect(slugify("Wizard Cat")).toBe("wizard-cat");
  });

  it("strips diacritics", () => {
    expect(slugify("Café Chibi")).toBe("cafe-chibi");
  });

  it("falls back when input has no usable characters", () => {
    expect(slugify("!!!")).toBe("chibi");
  });
});

describe("newSlug", () => {
  it("appends a short suffix to the slugified title", () => {
    const slug = newSlug("Wizard Cat");
    expect(slug.startsWith("wizard-cat-")).toBe(true);
    expect(slug.length).toBeGreaterThan("wizard-cat-".length);
  });
});
