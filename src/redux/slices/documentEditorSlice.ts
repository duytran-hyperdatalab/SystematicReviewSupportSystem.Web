import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { v4 as uuidv4 } from "uuid";
import type { DocumentDraft, ParagraphBlock, SectionBlock, ItemBlock } from "../../types/documentEditor";

interface DocumentEditorState {
  draft: DocumentDraft;
}

const initialDraft: DocumentDraft = {
  title: "",
  paragraphs: [],
  sections: [],
};

const initialState: DocumentEditorState = {
  draft: initialDraft,
};

const documentEditorSlice = createSlice({
  name: "documentEditor",
  initialState,
  reducers: {
    setTitle: (state, action: PayloadAction<string>) => {
      state.draft.title = action.payload;
    },
    // Paragraph actions
    addParagraph: (state) => {
      const newParagraph: ParagraphBlock = {
        id: uuidv4(),
        text: "",
        order: state.draft.paragraphs.length + 1,
      };
      state.draft.paragraphs.push(newParagraph);
    },
    updateParagraph: (state, action: PayloadAction<{ id: string; text: string }>) => {
      const paragraph = state.draft.paragraphs.find((p) => p.id === action.payload.id);
      if (paragraph) {
        paragraph.text = action.payload.text;
      }
    },
    deleteParagraph: (state, action: PayloadAction<string>) => {
      state.draft.paragraphs = state.draft.paragraphs
        .filter((p) => p.id !== action.payload)
        .map((p, index) => ({ ...p, order: index + 1 }));
    },
    // Section actions
    addSection: (state) => {
      const newSection: SectionBlock = {
        id: uuidv4(),
        title: "",
        description: "",
        order: state.draft.sections.length + 1,
        items: [],
      };
      state.draft.sections.push(newSection);
    },
    updateSection: (state, action: PayloadAction<{ id: string; title?: string; description?: string }>) => {
      const section = state.draft.sections.find((s) => s.id === action.payload.id);
      if (section) {
        if (action.payload.title !== undefined) section.title = action.payload.title;
        if (action.payload.description !== undefined) section.description = action.payload.description;
      }
    },
    deleteSection: (state, action: PayloadAction<string>) => {
      state.draft.sections = state.draft.sections
        .filter((s) => s.id !== action.payload)
        .map((s, index) => ({ ...s, order: index + 1 }));
    },
    moveSection: (state, action: PayloadAction<{ id: string; direction: "up" | "down" }>) => {
      const index = state.draft.sections.findIndex((s) => s.id === action.payload.id);
      if (index === -1) return;
      
      const newIndex = action.payload.direction === "up" ? index - 1 : index + 1;
      if (newIndex >= 0 && newIndex < state.draft.sections.length) {
        const sections = [...state.draft.sections];
        [sections[index], sections[newIndex]] = [sections[newIndex], sections[index]];
        state.draft.sections = sections.map((s, idx) => ({ ...s, order: idx + 1 }));
      }
    },
    // Item actions
    addItem: (state, action: PayloadAction<string>) => {
      const section = state.draft.sections.find((s) => s.id === action.payload);
      if (section) {
        const newItem: ItemBlock = {
          id: uuidv4(),
          text: "",
          order: section.items.length + 1,
        };
        section.items.push(newItem);
      }
    },
    updateItem: (state, action: PayloadAction<{ sectionId: string; itemId: string; text: string }>) => {
      const section = state.draft.sections.find((s) => s.id === action.payload.sectionId);
      if (section) {
        const item = section.items.find((i) => i.id === action.payload.itemId);
        if (item) {
          item.text = action.payload.text;
        }
      }
    },
    deleteItem: (state, action: PayloadAction<{ sectionId: string; itemId: string }>) => {
      const section = state.draft.sections.find((s) => s.id === action.payload.sectionId);
      if (section) {
        section.items = section.items
          .filter((i) => i.id !== action.payload.itemId)
          .map((i, index) => ({ ...i, order: index + 1 }));
      }
    },
    moveItem: (state, action: PayloadAction<{ sectionId: string; itemId: string; direction: "up" | "down" }>) => {
      const section = state.draft.sections.find((s) => s.id === action.payload.sectionId);
      if (section) {
        const index = section.items.findIndex((i) => i.id === action.payload.itemId);
        if (index === -1) return;
        
        const newIndex = action.payload.direction === "up" ? index - 1 : index + 1;
        if (newIndex >= 0 && newIndex < section.items.length) {
          const items = [...section.items];
          [items[index], items[newIndex]] = [items[newIndex], items[index]];
          section.items = items.map((i, idx) => ({ ...i, order: idx + 1 }));
        }
      }
    },
  },
});

export const {
  setTitle,
  addParagraph,
  updateParagraph,
  deleteParagraph,
  addSection,
  updateSection,
  deleteSection,
  moveSection,
  addItem,
  updateItem,
  deleteItem,
  moveItem,
} = documentEditorSlice.actions;

export default documentEditorSlice.reducer;

