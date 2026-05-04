export type ItemBlock = {
  id: string;
  text: string;
  order: number;
};

export type SectionBlock = {
  id: string;
  title: string;
  description?: string;
  order: number;
  items: ItemBlock[];
};

export type ParagraphBlock = {
  id: string;
  text: string;
  order: number;
};

export type DocumentDraft = {
  title: string;
  paragraphs: ParagraphBlock[];
  sections: SectionBlock[];
};
