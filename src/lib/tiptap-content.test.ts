import { describe, expect, test } from "vitest";

import {
  parseStoredTiptapContent,
  renderTiptapContentToSafeHtml,
  validateAndSerializeTiptapContent,
} from "@/src/lib/tiptap-content";

describe("TipTap note content", () => {
  test("accepts an empty document", () => {
    const document = {
      type: "doc",
      content: [{ type: "paragraph" }],
    };

    expect(validateAndSerializeTiptapContent(document)).toBe(JSON.stringify(document));
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
