import type { JSONContent } from "@tiptap/core";
import { getSchema } from "@tiptap/core";
import { generateHTML } from "@tiptap/html";
import sanitizeHtml from "sanitize-html";

import {
  createEmptyTiptapDocument,
  isSafeHttpUrl,
  tiptapExtensions,
} from "@/src/lib/tiptap-config";

const MAX_CONTENT_JSON_BYTES = 256 * 1024;
const allowedNodeTypes = new Set([
  "blockquote",
  "bulletList",
  "codeBlock",
  "doc",
  "hardBreak",
  "heading",
  "horizontalRule",
  "listItem",
  "orderedList",
  "paragraph",
  "text",
]);
const allowedMarkTypes = new Set(["bold", "code", "italic", "link", "strike", "underline"]);
const schema = getSchema(tiptapExtensions);

export class InvalidNoteContentError extends Error {
  constructor() {
    super("Invalid note content.");
    this.name = "InvalidNoteContentError";
  }
}

export function validateAndSerializeTiptapContent(value: unknown): string {
  const serialized = serializeUnknownValue(value);

  if (new TextEncoder().encode(serialized).byteLength > MAX_CONTENT_JSON_BYTES) {
    throw new InvalidNoteContentError();
  }

  const parsed: unknown = JSON.parse(serialized);

  if (!isJsonContent(parsed) || parsed.type !== "doc") {
    throw new InvalidNoteContentError();
  }

  validateContentTree(parsed);

  try {
    schema.nodeFromJSON(parsed);
  } catch {
    throw new InvalidNoteContentError();
  }

  return serialized;
}

export function parseStoredTiptapContent(value: string): JSONContent {
  try {
    const parsed: unknown = JSON.parse(value);
    const serialized = validateAndSerializeTiptapContent(parsed);

    return JSON.parse(serialized) as JSONContent;
  } catch {
    return createEmptyTiptapDocument();
  }
}

export function renderTiptapContentToSafeHtml(value: unknown): string {
  const serialized = validateAndSerializeTiptapContent(value);
  const content = JSON.parse(serialized) as JSONContent;
  const generatedHtml = generateHTML(content, tiptapExtensions);

  return sanitizeHtml(generatedHtml, {
    allowedAttributes: {
      a: ["href", "rel", "target"],
    },
    allowedSchemes: ["http", "https"],
    allowedSchemesAppliedToAttributes: ["href"],
    allowProtocolRelative: false,
    allowedTags: [
      "a",
      "blockquote",
      "br",
      "code",
      "em",
      "h1",
      "h2",
      "h3",
      "hr",
      "li",
      "ol",
      "p",
      "pre",
      "s",
      "strong",
      "u",
      "ul",
    ],
    transformTags: {
      a: (_tagName, attributes) => ({
        tagName: "a",
        attribs: {
          href: attributes.href,
          rel: "noopener noreferrer",
          target: "_blank",
        },
      }),
    },
  });
}

export function renderStoredTiptapContentToSafeHtml(value: string): string {
  return renderTiptapContentToSafeHtml(parseStoredTiptapContent(value));
}

function serializeUnknownValue(value: unknown): string {
  try {
    const serialized = JSON.stringify(value);

    if (serialized === undefined) {
      throw new InvalidNoteContentError();
    }

    return serialized;
  } catch (error) {
    if (error instanceof InvalidNoteContentError) {
      throw error;
    }

    throw new InvalidNoteContentError();
  }
}

function validateContentTree(node: JSONContent): void {
  if (node.type === undefined || !allowedNodeTypes.has(node.type)) {
    throw new InvalidNoteContentError();
  }

  if (node.type === "heading") {
    const level = node.attrs?.level;

    if (level !== 1 && level !== 2 && level !== 3) {
      throw new InvalidNoteContentError();
    }
  }

  if (node.marks !== undefined) {
    for (const mark of node.marks) {
      if (mark.type === undefined || !allowedMarkTypes.has(mark.type)) {
        throw new InvalidNoteContentError();
      }

      if (mark.type === "link") {
        const href = mark.attrs?.href;

        if (typeof href !== "string" || !isSafeHttpUrl(href)) {
          throw new InvalidNoteContentError();
        }
      }
    }
  }

  if (node.content !== undefined) {
    for (const child of node.content) {
      validateContentTree(child);
    }
  }
}

function isJsonContent(value: unknown): value is JSONContent {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
