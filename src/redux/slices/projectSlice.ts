import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface CurrentProject {
  id: string;
  title: string;
}

export interface CurrentProjectMember {
  role: number;
  roleText: string;
  isLeader: boolean;
}

interface ProjectState {
  currentProject: CurrentProject | null;
  currentProjectMember: CurrentProjectMember | null;
}

const initialState: ProjectState = {
  currentProject: null,
  currentProjectMember: null,
};

const projectSlice = createSlice({
  name: "project",
  initialState,
  reducers: {
    setCurrentProject: (state, action: PayloadAction<CurrentProject>) => {
      state.currentProject = action.payload;
    },
    setProjectMember: (state, action: PayloadAction<CurrentProjectMember>) => {
      state.currentProjectMember = action.payload;
    },
    clearCurrentProject: (state) => {
      state.currentProject = null;
      state.currentProjectMember = null;
    },
    clearProjectMember: (state) => {
      state.currentProjectMember = null;
    },
  },
});

export const { setCurrentProject, setProjectMember, clearCurrentProject, clearProjectMember } = projectSlice.actions;

export default projectSlice.reducer;
