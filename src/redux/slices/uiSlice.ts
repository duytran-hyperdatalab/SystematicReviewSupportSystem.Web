import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface UIState {
  currentSection: "admin" | "client" | null;
}

const initialState: UIState = {
  currentSection: null,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setCurrentSection: (state, action: PayloadAction<"admin" | "client">) => {
      state.currentSection = action.payload;
    },
    resetUIState: (state) => {
      state.currentSection = null;
    },
  },
});

export const { setCurrentSection, resetUIState } = uiSlice.actions;
export default uiSlice.reducer;
