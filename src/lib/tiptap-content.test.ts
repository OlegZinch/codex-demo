import { describe, expect, test } from "vitest";

import {
  parseStoredTiptapContent,
  renderTiptapContentToSafeHtml,
  validateAndSerializeTiptapContent,
} from "@/src/lib/tiptap-content";
import { createSerializableTiptapContent } from "@/src/lib/tiptap-config";

describe("TipTap note content", () => {
  test("accepts an empty document", () => {
    const document = {
      type: "doc",
      content: [{ type: "paragraph" }],
    };

    expect(validateAndSerializeTiptapContent(document)).toBe(JSON.stringify(document));
  });

  test("normalizes TipTap attribute maps to Server Action-compatible plain objects", () => {
    const headingAttributes = Object.assign(Object.create(null) as Record<string, unknown>, {
      level: 1,
    });
    const document = {
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: headingAttributes,
          content: [{ type: "text", text: "Heading" }],
        },
      ],
    };

    const normalized = createSerializableTiptapContent(document);
    const normalizedAttributes = normalized.content?.[0]?.attrs;

    expect(normalized).toEqual(document);
    expect(Object.getPrototypeOf(normalizedAttributes)).toBe(Object.prototype);
    expect(validateAndSerializeTiptapContent(normalized)).toBe(JSON.stringify(document));
  });

  test("accepts supported content with attributes after normalization", () => {
    const document = {
      type: "doc",
      content: [
        ...([1, 2, 3] as const).map((level) => ({
          type: "heading",
          attrs: { level },
          content: [{ type: "text", text: `Heading ${level}` }],
        })),
        {
          type: "orderedList",
          attrs: { start: 1, type: null },
          content: [
            {
              type: "listItem",
              content: [{ type: "paragraph", content: [{ type: "text", text: "Item" }] }],
            },
          ],
        },
        {
          type: "codeBlock",
          attrs: { language: null },
          content: [{ type: "text", text: "const safe = true;" }],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Safe link",
              marks: [
                {
                  type: "link",
                  attrs: {
                    href: "https://example.com",
                    target: "_blank",
                    rel: "noopener noreferrer",
                    class: null,
                    title: null,
                  },
                },
              ],
            },
          ],
        },
      ],
    };

    const normalized = createSerializableTiptapContent(document);

    expect(validateAndSerializeTiptapContent(normalized)).toBe(JSON.stringify(document));
  });

  test("rejects invalid roots and unsupported nodes", () => {
    expect(() => validateAndSerializeTiptapContent({ type: "paragraph" })).toThrow();
    expect(() =>
      validateAndSerializeTiptapContent({
        type: "doc",
        content: [{ type: "image", attrs: { src: "https://example.com/image.png" } }],
      }),
    ).toThrow();
  });

  test("rejects unsupported marks and unsafe links", () => {
    expect(() =>
      validateAndSerializeTiptapContent({
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [{ type: "text", text: "Nope", marks: [{ type: "highlight" }] }],
          },
        ],
      }),
    ).toThrow();

    expect(() =>
      validateAndSerializeTiptapContent({
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "Unsafe",
                marks: [{ type: "link", attrs: { href: "javascript:alert(1)" } }],
              },
            ],
          },
        ],
      }),
    ).toThrow();
  });

  test("rejects documents larger than 256 KB", () => {
    expect(() =>
      validateAndSerializeTiptapContent({
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [{ type: "text", text: "a".repeat(270_000) }],
          },
        ],
      }),
    ).toThrow();
  });

  test("renders formatting and forces safe link attributes", () => {
    const html = renderTiptapContentToSafeHtml({
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            { type: "text", text: "Bold", marks: [{ type: "bold" }] },
            { type: "text", text: " and " },
            {
              type: "text",
              text: "linked",
              marks: [{ type: "link", attrs: { href: "https://example.com" } }],
            },
          ],
        },
      ],
    });

    expect(html).toContain("<strong>Bold</strong>");
    expect(html).toContain('href="https://example.com"');
    expect(html).toContain('rel="noopener noreferrer"');
    expect(html).toContain('target="_blank"');
  });

  test("escapes HTML-like text and falls back for corrupt stored JSON", () => {
    const html = renderTiptapContentToSafeHtml({
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: '<img src=x onerror="alert(1)">' }],
        },
      ],
    });

    expect(html).not.toContain("<img");
    expect(html).toContain("&lt;img");
    expect(parseStoredTiptapContent("not-json")).toEqual({
      type: "doc",
      content: [{ type: "paragraph" }],
    });
  });
});
