import { create } from "zustand";
import { Project, Issue } from "./gitlabApi";

interface AppState {
  // Projetos
  projects: Project[];
  selectedProject: Project | null;

  // Issues
  issues: Issue[];
  isLoading: boolean;
  error: string | null;

  // View mode
  viewMode: "kanban" | "list";

  // Actions
  setProjects: (projects: Project[]) => void;
  setSelectedProject: (project: Project | null) => void;
  setIssues: (issues: Issue[]) => void;
  addIssue: (issue: Issue) => void;
  updateIssue: (issueIid: number, updatedIssue: Issue) => void;
  removeIssue: (issueIid: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setViewMode: (mode: "kanban" | "list") => void;
}

export const useAppStore = create<AppState>((set) => ({
  projects: [],
  selectedProject: null,
  issues: [],
  isLoading: false,
  error: null,
  viewMode: "kanban",

  setProjects: (projects) => set({ projects }),
  setSelectedProject: (project) => set({ selectedProject: project }),
  setIssues: (issues) => set({ issues }),
  addIssue: (issue) => set((state) => ({ issues: [issue, ...state.issues] })),
  updateIssue: (issueIid, updatedIssue) =>
    set((state) => ({
      issues: state.issues.map((issue) =>
        issue.iid === issueIid ? updatedIssue : issue
      ),
    })),
  removeIssue: (issueIid) =>
    set((state) => ({
      issues: state.issues.filter((issue) => issue.iid !== issueIid),
    })),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  setViewMode: (mode) => set({ viewMode: mode }),
}));
