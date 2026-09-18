import type { Extensions, JSONContent } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";

export const tiptapExtensions: Extensions = [
  StarterKit.configure({
    heading: {
      levels: [1, 2, 3],
    },
    link: {
      HTMLAttributes: {
        rel: "noopener noreferrer",
        target: "_blank",
      },
      defaultProtocol: "https",
      enableClickSelection: true,
      isAllowedUri: (url) => isSafeHttpUrl(url),
      openOnClick: false,
      protocols: [],
    },
  }),
];

export function createEmptyTiptapDocument(): JSONContent {
  return {
    type: "doc",
    content: [{ type: "paragraph" }],
  };
}

export function isSafeHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);

    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function normalizeHttpUrl(value: string): string | null {
  const trimmedValue = value.trim();

  if (trimmedValue.length === 0) {
    return null;
  }

  const candidate = /^[a-z][a-z\d+.-]*:/i.test(trimmedValue)
    ? trimmedValue
    : `https://${trimmedValue}`;

  return isSafeHttpUrl(candidate) ? candidate : null;
}
