// One section of a legal page (Terms, Privacy): paragraphs, then an optional list of
// terms with explanations, an optional plain list, and closing paragraphs. Every
// language builds its sections with this, so all three dictionaries keep one shape.

export interface LegalDefinition {
  term: string;
  text: string;
}

export interface LegalSection {
  /** The anchor in the page's table of contents — the same in every language */
  id: string;
  title: string;
  text: string[];
  defs: LegalDefinition[];
  items: string[];
  after: string[];
}

export function legalSection(
  id: string,
  title: string,
  parts: { text?: string[]; defs?: LegalDefinition[]; items?: string[]; after?: string[] },
): LegalSection {
  return {
    id,
    title,
    text: parts.text ?? [],
    defs: parts.defs ?? [],
    items: parts.items ?? [],
    after: parts.after ?? [],
  };
}
